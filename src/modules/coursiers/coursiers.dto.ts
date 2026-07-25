import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const telephoneSchema = z
  .string()
  .trim()
  .regex(/^(\+237)?[62]\d{8}$/, 'Numero de telephone camerounais invalide');

const mobileMoneySchema = z
  .string()
  .trim()
  .regex(/^(\+237)?6\d{8}$/, 'Numero mobile money invalide')
  .optional();

// --- Creation d'un coursier ---
export const CreerCoursierSchema = z.object({
  // Identite
  nom: z.string().trim().min(2, 'Le nom est requis').max(120),
  telephone: telephoneSchema,
  cni: z.string().trim().max(30).optional(),
  dateNaissance: z.iso.date().optional(),

  // Localisation habituelle
  ville: z.string().trim().max(80).optional(),
  quartier: z.string().trim().max(120).optional(),

  // Vehicule
  typeVehicule: z.enum(['MOTO', 'TRICYCLE', 'VOITURE', 'CAMIONNETTE', 'A_PIED', 'AUTRE']),
  plaque: z.string().trim().max(20).optional(),
  marqueModele: z.string().trim().max(120).optional(),

  // Documents detenus (cases oui/non)
  aPermis: z.boolean().default(false),
  permisCategorie: z.enum(['A', 'B', 'C', 'D', 'E']).optional(),
  aCarteGrise: z.boolean().default(false),
  aAssurance: z.boolean().default(false),
  aCarteSmt: z.boolean().default(false),

  // Paiement
  mobileMoneyNumero: mobileMoneySchema,
  mobileMoneyOperateur: z.enum(['MTN', 'ORANGE']).optional(),

  // Position GPS
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  adresseGps: z.string().trim().max(255).optional(),

  // Rattachement partenaire (vide = freelance)
  partenaireId: z.uuid().optional(),
});

export class CreerCoursierDto extends createZodDto(CreerCoursierSchema) {}

// --- Modification (tous les champs optionnels) ---
export const ModifierCoursierSchema = CreerCoursierSchema.partial();

export class ModifierCoursierDto extends createZodDto(ModifierCoursierSchema) {}

// --- Mise a jour de la seule position GPS ---
export const PositionSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  adresseGps: z.string().trim().max(255).optional(),
});

export class PositionDto extends createZodDto(PositionSchema) {}
