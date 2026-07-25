import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SanteSchema = z.object({
  statut: z.enum(['ok', 'degrade', 'indisponible']).meta({
    description: 'Etat global du service',
  }),
  version: z.string().meta({ example: '0.1.0' }),
  environnement: z.string().meta({ example: 'development' }),
  horodatage: z.iso.datetime().meta({ example: '2026-07-24T14:24:04.000Z' }),
  demarreDepuis: z.number().int().meta({
    description: 'Duree depuis le demarrage, en secondes',
    example: 1284,
  }),
});

export class SanteDto extends createZodDto(SanteSchema) {}
