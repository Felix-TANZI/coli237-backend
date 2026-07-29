import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Service de stockage des fichiers, base sur Supabase Storage.
// Bucket prive : les documents (CNI, permis) ne sont pas accessibles
// publiquement. On genere des URL signees temporaires a la demande.
@Injectable()
export class StockageService {
  private readonly logger = new Logger(StockageService.name);
  private readonly bucket = 'documents';
  private clientCache: SupabaseClient | null = null;

  constructor(private readonly config: ConfigService) {}

  // Cree le client a la demande (pas au demarrage), pour que l'application
  // puisse demarrer meme sans config Supabase. L'erreur n'apparait qu'au
  // premier usage reel du stockage.
  private client(): SupabaseClient {
    if (this.clientCache) return this.clientCache;

    const url = this.config.get<string>('SUPABASE_URL');
    const cle = this.config.get<string>('SUPABASE_SERVICE_KEY');

    if (!url || !cle) {
      throw new Error(
        'Stockage indisponible : renseignez SUPABASE_URL et SUPABASE_SERVICE_KEY dans le fichier .env.',
      );
    }

    this.clientCache = createClient(url, cle, {
      auth: { persistSession: false },
    });
    return this.clientCache;
  }

  // Enregistre un fichier et renvoie son chemin (stocke en base).
  async enregistrer(fichier: Express.Multer.File, sousDossier: string): Promise<string> {
    const nom = `${randomUUID()}${extname(fichier.originalname)}`;
    const chemin = `${sousDossier}/${nom}`;

    const { error } = await this.client().storage.from(this.bucket).upload(chemin, fichier.buffer, {
      contentType: fichier.mimetype,
      upsert: false,
    });

    if (error) {
      this.logger.error(`Echec de l'upload Supabase : ${error.message}`);
      throw new Error('Impossible d enregistrer le fichier.');
    }

    return chemin;
  }

  // Supprime un fichier du stockage.
  async supprimer(chemin: string): Promise<void> {
    try {
      const { error } = await this.client().storage.from(this.bucket).remove([chemin]);
      if (error) {
        this.logger.warn(`Echec de la suppression Supabase : ${error.message}`);
      }
    } catch (e) {
      this.logger.warn(`Suppression ignoree : ${(e as Error).message}`);
    }
  }

  // Genere une URL signee temporaire pour telecharger un fichier prive.
  // dureeSecondes : validite du lien (par defaut 1 heure).
  async urlSignee(chemin: string, dureeSecondes = 3600): Promise<string> {
    const { data, error } = await this.client()
      .storage.from(this.bucket)
      .createSignedUrl(chemin, dureeSecondes);

    if (error || !data) {
      this.logger.error(`Echec de la generation d URL signee : ${error?.message}`);
      throw new Error('Impossible de generer le lien de telechargement.');
    }

    return data.signedUrl;
  }
}
