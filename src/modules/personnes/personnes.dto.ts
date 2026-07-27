import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Telephone camerounais : 6 ou 2 + 8 chiffres.
const telephoneSchema = z
  .string()
  .trim()
  .regex(/^(\+237)?[62]\d{8}$/, 'Numero de telephone camerounais invalide');

const mobileMoneySchema = z
  .string()
  .trim()
  .regex(/^(\+237)?6\d{8}$/, 'Numero mobile money invalide')
  .optional();

const ROLES = [
  'ADMIN_COMPAGNIE',
  'MANAGER_AGENCE',
  'LIVREUR_INDEPENDANT',
  'LIVREUR_AGENCE',
] as const;
const VEHICULES = ['MOTO', 'TRICYCLE', 'VOITURE', 'CAMIONNETTE', 'A_PIED', 'AUTRE'] as const;

// --- Creation d'une personne ---
// Les champs communs sont toujours requis. Les champs specifiques sont
// valides selon le role via un affinement (superRefine).
export const CreerPersonneSchema = z
  .object({
    role: z.enum(ROLES),

    // Identite (commun)
    prenom: z.string().trim().min(2, 'Le prenom est requis').max(80),
    nom: z.string().trim().min(2, 'Le nom est requis').max(120),
    email: z.string().trim().email('Email invalide').max(160).optional().or(z.literal('')),
    telephone: telephoneSchema,
    avatarUrl: z.string().trim().max(500).optional(),

    // Localisation (livreurs)
    ville: z.string().trim().max(80).optional(),
    quartier: z.string().trim().max(120).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),

    // Vehicule (livreurs)
    typeVehicule: z.enum(VEHICULES).optional(),
    typeVehiculeAutre: z.string().trim().max(80).optional(),
    plaque: z.string().trim().max(20).optional(),

    // Livreur agence
    compagnieId: z.uuid().optional(),
    statutChauffeur: z.string().trim().max(20).optional(),

    // Paiement (livreurs)
    mobileMoneyNumero: mobileMoneySchema,
    mobileMoneyOperateur: z.enum(['MTN', 'ORANGE']).optional(),
  })
  .superRefine((donnees, ctx) => {
    const estLivreur = donnees.role === 'LIVREUR_INDEPENDANT' || donnees.role === 'LIVREUR_AGENCE';

    // Les livreurs doivent avoir un type de vehicule.
    if (estLivreur && !donnees.typeVehicule) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['typeVehicule'],
        message: 'Le type de vehicule est requis pour un livreur.',
      });
    }

    // Si "Autre", preciser le type.
    if (donnees.typeVehicule === 'AUTRE' && !donnees.typeVehiculeAutre?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['typeVehiculeAutre'],
        message: 'Precisez le type de vehicule.',
      });
    }

    // Le livreur agence doit etre rattache a une compagnie.
    if (donnees.role === 'LIVREUR_AGENCE' && !donnees.compagnieId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['compagnieId'],
        message: 'La compagnie est requise pour un livreur agence.',
      });
    }
  });

export class CreerPersonneDto extends createZodDto(CreerPersonneSchema) {}

// --- Modification (tous les champs optionnels, sans l'affinement strict) ---
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
  compagnieId: z.uuid().optional(),
  statutChauffeur: z.string().trim().max(20).optional(),
  mobileMoneyNumero: mobileMoneySchema,
  mobileMoneyOperateur: z.enum(['MTN', 'ORANGE']).optional(),
});
export class ModifierPersonneDto extends createZodDto(ModifierPersonneSchema) {}
