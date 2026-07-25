import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// --- Connexion ---
// L'identifiant est soit un email, soit un telephone. L'API reconnait lequel.
export const ConnexionSchema = z.object({
  identifiant: z
    .string()
    .trim()
    .min(3, 'Identifiant requis')
    .meta({ description: 'Email ou numero de telephone', example: 'jean@example.com' }),
  motDePasse: z.string().min(1, 'Mot de passe requis'),
});

export class ConnexionDto extends createZodDto(ConnexionSchema) {}

// --- Reponse a la connexion ---
export const SessionSchema = z.object({
  jeton: z.string().meta({ description: 'Jeton a placer dans l en-tete Authorization' }),
  agent: z.object({
    id: z.uuid(),
    nom: z.string(),
    email: z.string(),
    role: z.enum(['AGENT', 'ADMIN']),
    doitChangerMotDePasse: z.boolean(),
  }),
});

export class SessionDto extends createZodDto(SessionSchema) {}

// --- Changement de mot de passe ---
export const ChangerMotDePasseSchema = z.object({
  ancienMotDePasse: z.string().min(1, 'Ancien mot de passe requis'),
  nouveauMotDePasse: z
    .string()
    .min(8, 'Minimum 8 caracteres')
    .max(72)
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[a-z]/, 'Au moins une minuscule')
    .regex(/\d/, 'Au moins un chiffre'),
});

export class ChangerMotDePasseDto extends createZodDto(ChangerMotDePasseSchema) {}
