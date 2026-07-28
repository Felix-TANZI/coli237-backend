import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Telephone : format international souple.
// Accepte un numero local (8-9 chiffres) ou international (+indicatif).
const telephoneSchema = z
  .string()
  .trim()
  .regex(/^\+?\d{8,15}$/, 'Numero invalide (8 a 15 chiffres, indicatif + optionnel)');

const mobileMoneySchema = z
  .string()
  .trim()
  .regex(/^\+?\d{8,15}$/, 'Numero invalide')
  .optional();

const ROLES = [
  'ADMIN_COMPAGNIE',
  'MANAGER_AGENCE',
  'LIVREUR_INDEPENDANT',
  'LIVREUR_AGENCE',
] as const;
const VEHICULES = ['MOTO', 'TRICYCLE', 'VOITURE', 'CAMIONNETTE', 'A_PIED', 'AUTRE'] as const;

// --- Creation d'une personne ---
// Champs communs toujours requis. Champs specifiques valides selon le role.
export const CreerPersonneSchema = z
  .object({
    role: z.enum(ROLES),

    // Identite (commun a tous)
    prenom: z.string().trim().min(2, 'Le prenom est requis').max(80),
    nom: z.string().trim().min(2, 'Le nom est requis').max(120),
    email: z.string().trim().email('Email invalide').max(160).optional().or(z.literal('')),
    telephone: telephoneSchema,
    avatarUrl: z.string().trim().max(500).optional(),

    // Localisation (optionnel)
    ville: z.string().trim().max(80).optional(),
    quartier: z.string().trim().max(120).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),

    // Vehicule (livreur agence uniquement)
    typeVehicule: z.enum(VEHICULES).optional(),
    typeVehiculeAutre: z.string().trim().max(80).optional(),
    plaque: z.string().trim().max(20).optional(),

    // Livreur agence
    compagnieId: z.string().uuid().optional(),

    // Paiement (optionnel)
    mobileMoneyNumero: mobileMoneySchema,
    mobileMoneyOperateur: z.enum(['MTN', 'ORANGE']).optional(),
  })
  .superRefine((donnees, ctx) => {
    // Seul le livreur agence exige vehicule + compagnie.
    if (donnees.role === 'LIVREUR_AGENCE') {
      if (!donnees.typeVehicule) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['typeVehicule'],
          message: 'Le type de vehicule est requis pour un livreur agence.',
        });
      }
      if (donnees.typeVehicule === 'AUTRE' && !donnees.typeVehiculeAutre?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['typeVehiculeAutre'],
          message: 'Precisez le type de vehicule.',
        });
      }
      if (!donnees.compagnieId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['compagnieId'],
          message: 'La compagnie est requise pour un livreur agence.',
        });
      }
    }
  });

export class CreerPersonneDto extends createZodDto(CreerPersonneSchema) {}

// --- Modification (tous optionnels, sans affinement strict) ---
export const ModifierPersonneSchema = z.object({
  prenom: z.string().trim().min(2).max(80).optional(),
  nom: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().max(160).optional().or(z.literal('')),
  telephone: telephoneSchema.optional(),
  avatarUrl: z.string().trim().max(500).optional(),
  ville: z.string().trim().max(80).optional(),
  quartier: z.string().trim().max(120).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  typeVehicule: z.enum(VEHICULES).optional(),
  typeVehiculeAutre: z.string().trim().max(80).optional(),
  plaque: z.string().trim().max(20).optional(),
  compagnieId: z.string().uuid().optional(),
  mobileMoneyNumero: mobileMoneySchema,
  mobileMoneyOperateur: z.enum(['MTN', 'ORANGE']).optional(),
});
export class ModifierPersonneDto extends createZodDto(ModifierPersonneSchema) {}
