export type CloudflareBindings = {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  WEBHOOK_SECRET: string;
  JWT_SECRET?: string; // Opcional: para verificación offline de JWT sin llamar a Supabase
};
