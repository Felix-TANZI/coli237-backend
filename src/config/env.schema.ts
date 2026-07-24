import { z } from 'zod';

const listeSeparee = (valeur: string) =>
  valeur
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);


const optionnel = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((valeur) => (valeur === '' ? undefined : valeur), schema.optional());    

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  API_BASE_URL: z.string().url().default('http://localhost:3000'),
  WEB_BASE_URL: z.string().url().default('http://localhost:5173'),
  CORS_ORIGINS: z.string().default('http://localhost:5173').transform(listeSeparee),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET doit faire au moins 32 caracteres'),

  SUPABASE_URL: optionnel(z.string().url()),
  SUPABASE_SERVICE_KEY: optionnel(z.string()),

  TWILIO_ACCOUNT_SID: optionnel(z.string()),
  TWILIO_AUTH_TOKEN: optionnel(z.string()),
  TWILIO_SMS_FROM: optionnel(z.string()),
  TWILIO_VERIFY_SID: optionnel(z.string()),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Appelee par ConfigModule au demarrage. Un echec ici arrete le processus
 * une variable manquante doit bloquer le deploiement, pas produire une erreur
 * a la premiere requete d'un vendeur.
 */
export function validerEnv(configuration: Record<string, unknown>): Env {
  const resultat = envSchema.safeParse(configuration);

  if (!resultat.success) {
    const details = resultat.error.issues
      .map((probleme) => `  - ${probleme.path.join('.')} : ${probleme.message}`)
      .join('\n');
    throw new Error(`Configuration invalide.\n${details}`);
  }

  return resultat.data;
}