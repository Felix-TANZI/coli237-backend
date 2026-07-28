import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// --- Creation d'une compagnie ---
export const CreerCompagnieSchema = z.object({
  nom: z.string().trim().min(2, 'Le nom est requis').max(160),
  statut: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  // Admin compagnie rattache (optionnel) : une personne de role ADMIN_COMPAGNIE.
  adminId: z.string().uuid().optional(),
});

export class CreerCompagnieDto extends createZodDto(CreerCompagnieSchema) {}

// --- Modification (tous les champs optionnels) ---
export const ModifierCompagnieSchema = z.object({
  nom: z.string().trim().min(2).max(160).optional(),
  statut: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  adminId: z.string().uuid().optional(),
});

export class ModifierCompagnieDto extends createZodDto(ModifierCompagnieSchema) {}
