const REQUIRED_ENV_ERROR_PREFIX = "Supabase environment is not configured";

export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${REQUIRED_ENV_ERROR_PREFIX}: set ${name} before starting the application.`);
  }

  return value;
}

export function supabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!value) {
    throw new Error(
      `${REQUIRED_ENV_ERROR_PREFIX}: set NEXT_PUBLIC_SUPABASE_URL before starting the application.`,
    );
  }

  return value;
}

export function supabasePublishableKey(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!value) {
    throw new Error(
      `${REQUIRED_ENV_ERROR_PREFIX}: set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY before starting the application.`,
    );
  }

  return value;
}
