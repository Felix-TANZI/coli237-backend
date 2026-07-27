import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreerCompagnieSchema = z.object({
  nom: z.string().trim().min(2, 'Le nom est requis').max(160),
  statut: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
});
export class CreerCompagnieDto extends createZodDto(CreerCompagnieSchema) {}

export const ModifierCompagnieSchema = CreerCompagnieSchema.partial();
export class ModifierCompagnieDto extends createZodDto(ModifierCompagnieSchema) {}
