import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { Injectable } from '@nestjs/common';

// Service de stockage des fichiers.
// Version disque local. Pour passer au cloud, remplacer le corps des methodes
// sans changer leur signature : le reste du code n'y verra rien.
@Injectable()
export class StockageService {
  private readonly dossier = join(process.cwd(), 'uploads');

  // Enregistre un fichier et renvoie son chemin relatif (stocke en base).
  async enregistrer(fichier: Express.Multer.File, sousDossier: string): Promise<string> {
    const cible = join(this.dossier, sousDossier);
    await mkdir(cible, { recursive: true });

    const nom = `${randomUUID()}${extname(fichier.originalname)}`;
    const cheminComplet = join(cible, nom);
    await writeFile(cheminComplet, fichier.buffer);

    // Chemin relatif servi ensuite sur /uploads/...
    return `${sousDossier}/${nom}`;
  }

  // Supprime un fichier du stockage.
  async supprimer(cheminRelatif: string): Promise<void> {
    try {
      await unlink(join(this.dossier, cheminRelatif));
    } catch {
      // Fichier deja absent : on ignore.
    }
  }
}
