"use client";

import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type IChartApi,
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

/**
 * Candlestick price chart for the trade page. Created imperatively via
 * lightweight-charts (v5 `addSeries(CandlestickSeries, ...)` API — v4's
 * `addCandlestickSeries()` was removed) inside a `useEffect` so it only ever
 * runs client-side. A `ResizeObserver` keeps the chart width in sync with
 * its container; both the chart and the observer are torn down on cleanup
 * so StrictMode's mount/unmount/mount doesn't leak a duplicate chart.
 */
export function PriceChart({ candles }: { candles: Candle[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || candles.length === 0) return;

    const chart: IChartApi = createChart(container, {
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

    series.setData(
      candles.map((candle) => ({
        time: candle.time as UTCTimestamp,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }))
    );
    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      chart.applyOptions({ width: entry.contentRect.width });
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [candles]);

  if (candles.length === 0) {
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
