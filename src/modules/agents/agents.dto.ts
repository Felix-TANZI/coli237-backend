import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Numero camerounais : +237 puis 9 chiffres, ou 9 chiffres seuls.
const telephoneSchema = z
  .string()
  .trim()
  .regex(/^(\+237)?[62]\d{8}$/, 'Numero de telephone camerounais invalide');

// --- Creation d'un agent (par l'admin) ---
export const CreerAgentSchema = z.object({
  nom: z.string().trim().min(2, 'Le nom est requis').max(120),
  telephone: telephoneSchema,
  email: z.email('Email invalide').max(160),
  role: z.enum(['AGENT', 'ADMIN']).default('AGENT'),
  // Optionnel : si absent, un mot de passe est genere automatiquement.
  motDePasse: z.string().min(8, 'Minimum 8 caracteres').max(72).optional(),
});

export class CreerAgentDto extends createZodDto(CreerAgentSchema) {}

// --- Reponse apres creation ---
// Contient le mot de passe temporaire EN CLAIR, la seule et unique fois.
// L'admin le transmet a l'agent.
export const AgentCreeSchema = z.object({
  id: z.uuid(),
  nom: z.string(),
  telephone: z.string(),
  email: z.string(),
  role: z.enum(['AGENT', 'ADMIN']),
  statut: z.enum(['ACTIF', 'SUSPENDU']),
  motDePasseTemporaire: z.string().meta({
    description: 'Mot de passe a usage unique. Affiche une seule fois.',
  }),
  createdAt: z.iso.datetime(),
});

export class AgentCreeDto extends createZodDto(AgentCreeSchema) {}

// --- Representation publique d'un agent (sans mot de passe) ---
export const AgentSchema = z.object({
  id: z.uuid(),
  nom: z.string(),
  telephone: z.string(),
  email: z.string(),
  role: z.enum(['AGENT', 'ADMIN']),
  statut: z.enum(['ACTIF', 'SUSPENDU']),
  doitChangerMotDePasse: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export class AgentDto extends createZodDto(AgentSchema) {}
