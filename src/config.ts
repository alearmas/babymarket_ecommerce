function requireEnv(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  apiBaseUrl: requireEnv("VITE_API_BASE_URL"),
  whatsappNumber: requireEnv("VITE_WHATSAPP_NUMBER"),
} as const;
