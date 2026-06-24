export function isPlaceholder(value: string | undefined): boolean {
  return !value || value.trim() === "" || value.startsWith("placeholder-");
}

export const serverEnv = {
  birdeyeKey: process.env.BIRDEYE_API_KEY,
  alchemyRpcUrl: process.env.ALCHEMY_SOLANA_RPC_URL,
  privySecret: process.env.PRIVY_APP_SECRET,
  jupiterBaseUrl: process.env.JUPITER_BASE_URL || "https://quote-api.jup.ag",
};

export const publicEnv = {
  privyAppId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};
