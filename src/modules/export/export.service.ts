import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../../prisma/prisma.service';

const libelleVehicule: Record<string, string> = {
  MOTO: 'Moto',
  TRICYCLE: 'Tricycle',
  VOITURE: 'Voiture',
  CAMIONNETTE: 'Camionnette',
  A_PIED: 'A pied',
  AUTRE: 'Autre',
};

const libelleRole: Record<string, string> = {
  ADMIN_COMPAGNIE: 'Admin compagnie',
  MANAGER_AGENCE: 'Manager agence',
  LIVREUR_INDEPENDANT: 'Livreur independant',
  LIVREUR_AGENCE: 'Livreur agence',
};

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  // Recupere les personnes validees, filtrees par role si demande.
  private async personnesValidees(role?: string) {
    return this.prisma.personne.findMany({
      where: {
        supprimeLe: null,
        statut: 'VALIDE',
        role: role ? (role as never) : undefined,
      },
      orderBy: { createdAt: 'desc' },
      include: { compagnie: { select: { nom: true } } },
    });
  }

  // --- Export Excel des personnes ---
  async personnesExcel(role?: string): Promise<Buffer> {
    const personnes = await this.personnesValidees(role);

    const classeur = new ExcelJS.Workbook();
    classeur.creator = 'COLI237';
    classeur.created = new Date();

    const feuille = classeur.addWorksheet('Personnes');

    feuille.columns = [
      { header: 'Prenom', key: 'prenom', width: 20 },
      { header: 'Nom', key: 'nom', width: 24 },
      { header: 'Role', key: 'role', width: 20 },
      { header: 'Telephone', key: 'telephone', width: 18 },
      { header: 'Email', key: 'email', width: 26 },
      { header: 'Ville', key: 'ville', width: 16 },
      { header: 'Quartier', key: 'quartier', width: 18 },
      { header: 'Vehicule', key: 'vehicule', width: 14 },
      { header: 'Plaque', key: 'plaque', width: 14 },
      { header: 'Compagnie', key: 'compagnie', width: 24 },
      { header: 'Statut chauffeur', key: 'statutChauffeur', width: 16 },
      { header: 'Mobile Money', key: 'momo', width: 18 },
      { header: 'Operateur', key: 'operateur', width: 12 },
    ];

    feuille.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    feuille.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF085041' },
    };

    for (const p of personnes) {
      feuille.addRow({
        prenom: p.prenom,
        nom: p.nom,
        role: libelleRole[p.role] ?? p.role,
        telephone: p.telephone,
        email: p.email ?? '',
        ville: p.ville ?? '',
        quartier: p.quartier ?? '',
        vehicule: p.typeVehicule ? (libelleVehicule[p.typeVehicule] ?? p.typeVehicule) : '',
        plaque: p.plaque ?? '',
        compagnie: p.compagnie?.nom ?? '',
        statutChauffeur: p.statutChauffeur ?? '',
        momo: p.mobileMoneyNumero ?? '',
        operateur: p.mobileMoneyOperateur ?? '',
      });
    }

    const donnees = await classeur.xlsx.writeBuffer();
    return Buffer.from(donnees);
  }

  // --- Export PDF des personnes ---
  async personnesPdf(role?: string): Promise<Buffer> {
    const personnes = await this.personnesValidees(role);
    const titreRole = role ? (libelleRole[role] ?? role) : 'Toutes personnes';

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const morceaux: Buffer[] = [];

      doc.on('data', (m: Buffer) => morceaux.push(m));
      doc.on('end', () => resolve(Buffer.concat(morceaux)));
      doc.on('error', reject);

      // En-tete
      doc
        .fontSize(16)
        .fillColor('#085041')
        .text(`COLI237 — Registre : ${titreRole}`, { align: 'left' });
      doc
        .fontSize(9)
        .fillColor('#666666')
        .text(
          `${personnes.length} personne(s) validee(s)  —  Genere le ${new Date().toLocaleDateString('fr-FR')}`,
        );
      doc.moveDown(1);

      const colonnes = [
        { titre: 'Nom complet', largeur: 140 },
        { titre: 'Role', largeur: 105 },
        { titre: 'Telephone', largeur: 90 },
        { titre: 'Ville', largeur: 70 },
        { titre: 'Compagnie', largeur: 110 },
      ];
      const gauche = 40;
      let y = doc.y;

      const dessinerEntete = () => {
        doc.rect(gauche, y, 515, 20).fill('#085041');
        let x = gauche;
        doc.fillColor('#ffffff').fontSize(9);
        for (const col of colonnes) {
          doc.text(col.titre, x + 4, y + 6, { width: col.largeur - 8 });
          x += col.largeur;
        }
        y += 20;
      };

      dessinerEntete();

      doc.fontSize(8);
      personnes.forEach((p, i) => {
        if (y > 780) {
          doc.addPage();
          y = 40;
          dessinerEntete();
          doc.fontSize(8);
        }

        if (i % 2 === 0) {
          doc.rect(gauche, y, 515, 18).fill('#f2f5f1');
        }

        const valeurs = [
          `${p.prenom} ${p.nom}`,
          libelleRole[p.role] ?? p.role,
          p.telephone,
          p.ville ?? '',
          p.compagnie?.nom ?? '',
        ];

        let x = gauche;
        doc.fillColor('#111111');
        valeurs.forEach((val, j) => {
          const col = colonnes[j];
          if (col) {
            doc.text(val, x + 4, y + 5, { width: col.largeur - 8, ellipsis: true });
            x += col.largeur;
          }
        });
        y += 18;
      });

      doc.end();
    });
  }
}
