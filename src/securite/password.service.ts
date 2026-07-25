import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Caracteres sans ambiguite : ni 0/O, ni 1/l/I.
const CARACTERES = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

@Injectable()
export class PasswordService {
  // Transforme un mot de passe en empreinte chiffree, stockee en base.
  async chiffrer(motDePasse: string): Promise<string> {
    return bcrypt.hash(motDePasse, 12);
  }

  // Compare un mot de passe saisi a l'empreinte stockee.
  async verifier(motDePasse: string, empreinte: string): Promise<boolean> {
    return bcrypt.compare(motDePasse, empreinte);
  }

  // Genere un mot de passe temporaire de 8 caracteres lisibles.
  // Transmis a l'agent par l'admin, a usage unique.
  genererTemporaire(longueur = 8): string {
    let resultat = '';
    for (let i = 0; i < longueur; i++) {
      const index = Math.floor(Math.random() * CARACTERES.length);
      resultat += CARACTERES[index];
    }
    return resultat;
  }
}
