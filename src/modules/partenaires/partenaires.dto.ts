import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const telephoneSchema = z
  .string()
  .trim()
  .regex(/^(\+237)?[62]\d{8}$/, 'Numero de telephone camerounais invalide');

// --- Creation d'un partenaire ---
export const CreerPartenaireSchema = z.object({
  // Entreprise
  nom: z.string().trim().min(2, 'Le nom est requis').max(160),
  sigle: z.string().trim().max(60).optional(),
  niu: z.string().trim().max(30).optional(),
  registreCommerce: z.string().trim().max(60).optional(),

  // Responsable
  responsableNom: z.string().trim().min(2, 'Le responsable est requis').max(120),
  responsableTelephone: telephoneSchema,
  responsableEmail: z.email().max(160).optional(),

  // Localisation
  ville: z.string().trim().max(80).optional(),
  quartier: z.string().trim().max(120).optional(),
  adresse: z.string().trim().max(255).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),

  // Paiement
  mobileMoneyNumero: z
    .string()
    .trim()
    .regex(/^(\+237)?6\d{8}$/, 'Numero mobile money invalide')
    .optional(),
  mobileMoneyOperateur: z.enum(['MTN', 'ORANGE']).optional(),
});

export class CreerPartenaireDto extends createZodDto(CreerPartenaireSchema) {}

// --- Modification (tout optionnel) ---
export const ModifierPartenaireSchema = CreerPartenaireSchema.partial();

export class ModifierPartenaireDto extends createZodDto(ModifierPartenaireSchema) {}
