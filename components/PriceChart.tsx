"use client";

import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Candle } from "@/types";

// Theme colors (kept in sync with app/globals.css custom properties).
const PANEL_COLOR = "#14181d";
const BORDER_COLOR = "#232830";
const MUTED_COLOR = "#8b929c";
const FOREGROUND_COLOR = "#e8eaed";
const ACCENT_COLOR = "#16c784"; // up
const DANGER_COLOR = "#ea3943"; // down

const CHART_HEIGHT = 360;

function toSeriesData(candles: Candle[]): CandlestickData<UTCTimestamp>[] {
  return candles.map((candle) => ({
    time: candle.time as UTCTimestamp,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
  }));
}

/**
 * Candlestick price chart for the trade page. Created imperatively via
 * lightweight-charts (v5 `addSeries(CandlestickSeries, ...)` API — v4's
 * `addCandlestickSeries()` was removed).
 *
 * Split into two effects so the chart is created once and only *re-fed* when
 * data changes:
 *   - Create-once effect: builds the chart + series + ResizeObserver and is
 *     the sole owner of teardown (`chart.remove()` on unmount), so
 *     StrictMode's mount→cleanup→mount still leaves exactly one live chart.
 *     It's keyed on `hasData` (not the array reference) because the chart's
 *     container div only renders once there's data — so it must fire when we
 *     transition from the empty state to having candles.
 *   - Data-push effect (`[candles]`): only calls `series.setData(...)`.
 *     `useToken` polls every 10s and returns a fresh array reference each
 *     tick even when OHLCV is unchanged; depending on `[candles]` for
 *     *creation* would tear down + rebuild the chart every poll (visible
 *     flicker + lost pan/zoom/crosshair). Reusing the existing series and
 *     just pushing data avoids that. `fitContent` runs only on the first
 *     non-empty dataset so later polls don't reset the user's view.
 */
export function PriceChart({ candles }: { candles: Candle[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const didFitRef = useRef(false);

  const hasData = candles.length > 0;

  // Create-once: chart + series + responsive observer. Owns teardown.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: CHART_HEIGHT,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: MUTED_COLOR,
      },
      grid: {
        vertLines: { color: BORDER_COLOR },
        horzLines: { color: BORDER_COLOR },
      },
      timeScale: {
        borderColor: BORDER_COLOR,
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: BORDER_COLOR,
      },
      crosshair: {
        vertLine: { color: MUTED_COLOR, labelBackgroundColor: PANEL_COLOR },
        horzLine: { color: MUTED_COLOR, labelBackgroundColor: PANEL_COLOR },
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: ACCENT_COLOR,
      downColor: DANGER_COLOR,
      borderUpColor: ACCENT_COLOR,
      borderDownColor: DANGER_COLOR,
      wickUpColor: ACCENT_COLOR,
      wickDownColor: DANGER_COLOR,
    });

    chartRef.current = chart;
    seriesRef.current = series;
    didFitRef.current = false;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      chart.applyOptions({ width: entry.contentRect.width });
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
    // `hasData` (not `candles`) gates creation: the container only renders
    // once there's data, and we never want to recreate on a poll tick.
  }, [hasData]);

  // Data-push: feed candles into the existing series without rebuilding.
  useEffect(() => {
    const series = seriesRef.current;
    if (!series || candles.length === 0) return;

    series.setData(toSeriesData(candles));

    // Only auto-fit once (initial load); later polls must not reset the view.
    if (!didFitRef.current) {
      chartRef.current?.timeScale().fitContent();
      didFitRef.current = true;
    }
  }, [candles]);

  if (!hasData) {
    return (
      <div
        className="cw-card flex items-center justify-center p-4 text-sm cw-text-muted"
        style={{ height: CHART_HEIGHT }}
      >
        No price data available
      </div>
    );
  }

  return (
    <div className="cw-card p-2" style={{ color: FOREGROUND_COLOR }}>
      <div ref={containerRef} style={{ height: CHART_HEIGHT, width: "100%" }} />
    </div>
  );
}
