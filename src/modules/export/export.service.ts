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

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  // Recupere les coursiers valides (le registre officiel).
  private async coursiersValides() {
    return this.prisma.coursier.findMany({
      where: { supprimeLe: null, statut: 'VALIDE' },
      orderBy: { createdAt: 'desc' },
      include: { partenaire: { select: { nom: true } } },
    });
  }

  // --- Export Excel des coursiers ---
  async coursiersExcel(): Promise<Buffer> {
    const coursiers = await this.coursiersValides();

    const classeur = new ExcelJS.Workbook();
    classeur.creator = 'COLI237';
    classeur.created = new Date();

    const feuille = classeur.addWorksheet('Coursiers');

    feuille.columns = [
      { header: 'Nom', key: 'nom', width: 28 },
      { header: 'Telephone', key: 'telephone', width: 18 },
      { header: 'CNI', key: 'cni', width: 16 },
      { header: 'Ville', key: 'ville', width: 16 },
      { header: 'Quartier', key: 'quartier', width: 18 },
      { header: 'Vehicule', key: 'vehicule', width: 14 },
      { header: 'Plaque', key: 'plaque', width: 14 },
      { header: 'Permis', key: 'permis', width: 10 },
      { header: 'Mobile Money', key: 'momo', width: 18 },
      { header: 'Operateur', key: 'operateur', width: 12 },
      { header: 'Partenaire', key: 'partenaire', width: 24 },
    ];

    feuille.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    feuille.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF085041' },
    };

    for (const c of coursiers) {
      feuille.addRow({
        nom: c.nom,
        telephone: c.telephone,
        cni: c.cni ?? '',
        ville: c.ville ?? '',
        quartier: c.quartier ?? '',
        vehicule: libelleVehicule[c.typeVehicule] ?? c.typeVehicule,
        plaque: c.plaque ?? '',
        permis: c.aPermis ? (c.permisCategorie ?? 'Oui') : 'Non',
        momo: c.mobileMoneyNumero ?? '',
        operateur: c.mobileMoneyOperateur ?? '',
        partenaire: c.partenaire?.nom ?? 'Freelance',
      });
    }

    const donnees = await classeur.xlsx.writeBuffer();
    return Buffer.from(donnees);
  }

  // --- Export PDF des coursiers ---
  async coursiersPdf(): Promise<Buffer> {
    const coursiers = await this.coursiersValides();

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
        .text('COLI237 — Registre des coursiers', { align: 'left' });
      doc
        .fontSize(9)
        .fillColor('#666666')
        .text(
          `${coursiers.length} coursier(s) valide(s)  —  Genere le ${new Date().toLocaleDateString('fr-FR')}`,
        );
      doc.moveDown(1);

      // Colonnes du tableau
      const colonnes = [
        { titre: 'Nom', largeur: 130 },
        { titre: 'Telephone', largeur: 90 },
        { titre: 'Ville', largeur: 80 },
        { titre: 'Vehicule', largeur: 70 },
        { titre: 'Partenaire', largeur: 145 },
      ];
      const gauche = 40;
      let y = doc.y;

      // Ligne d'en-tete du tableau
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

      // Lignes de donnees
      doc.fontSize(8);
      coursiers.forEach((c, i) => {
        // Nouvelle page si on atteint le bas
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
          c.nom,
          c.telephone,
          c.ville ?? '',
          libelleVehicule[c.typeVehicule] ?? c.typeVehicule,
          c.partenaire?.nom ?? 'Freelance',
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
  // --- Partenaires (entreprises) valides ---
  private async partenairesValides() {
    return this.prisma.partenaire.findMany({
      where: { supprimeLe: null, statut: 'VALIDE' },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { coursiers: true } } },
    });
  }

  // --- Export Excel des partenaires ---
  async partenairesExcel(): Promise<Buffer> {
    const partenaires = await this.partenairesValides();

    const classeur = new ExcelJS.Workbook();
    classeur.creator = 'COLI237';
    classeur.created = new Date();

    const feuille = classeur.addWorksheet('Partenaires');

    feuille.columns = [
      { header: 'Entreprise', key: 'nom', width: 28 },
      { header: 'Sigle', key: 'sigle', width: 14 },
      { header: 'NIU', key: 'niu', width: 18 },
      { header: 'Registre commerce', key: 'rccm', width: 22 },
      { header: 'Responsable', key: 'responsable', width: 24 },
      { header: 'Telephone', key: 'telephone', width: 18 },
      { header: 'Email', key: 'email', width: 26 },
      { header: 'Ville', key: 'ville', width: 16 },
      { header: 'Quartier', key: 'quartier', width: 18 },
      { header: 'Mobile Money', key: 'momo', width: 18 },
      { header: 'Operateur', key: 'operateur', width: 12 },
      { header: 'Nb coursiers', key: 'nbCoursiers', width: 14 },
    ];

    feuille.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    feuille.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF085041' },
    };

    for (const p of partenaires) {
      feuille.addRow({
        nom: p.nom,
        sigle: p.sigle ?? '',
        niu: p.niu ?? '',
        rccm: p.registreCommerce ?? '',
        responsable: p.responsableNom,
        telephone: p.responsableTelephone,
        email: p.responsableEmail ?? '',
        ville: p.ville ?? '',
        quartier: p.quartier ?? '',
        momo: p.mobileMoneyNumero ?? '',
        operateur: p.mobileMoneyOperateur ?? '',
        nbCoursiers: p._count.coursiers,
      });
    }

    const donnees = await classeur.xlsx.writeBuffer();
    return Buffer.from(donnees);
  }

  // --- Export PDF des partenaires ---
  async partenairesPdf(): Promise<Buffer> {
    const partenaires = await this.partenairesValides();

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const morceaux: Buffer[] = [];

      doc.on('data', (m: Buffer) => morceaux.push(m));
      doc.on('end', () => resolve(Buffer.concat(morceaux)));
      doc.on('error', reject);

      doc
        .fontSize(16)
        .fillColor('#085041')
        .text('COLI237 - Registre des partenaires', { align: 'left' });
      doc
        .fontSize(9)
        .fillColor('#666666')
        .text(
          `${partenaires.length} partenaire(s) valide(s)  -  Genere le ${new Date().toLocaleDateString('fr-FR')}`,
        );
      doc.moveDown(1);

      const colonnes = [
        { titre: 'Entreprise', largeur: 150 },
        { titre: 'Responsable', largeur: 120 },
        { titre: 'Telephone', largeur: 90 },
        { titre: 'Ville', largeur: 75 },
        { titre: 'Coursiers', largeur: 80 },
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
      partenaires.forEach((p, i) => {
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
          p.nom,
          p.responsableNom,
          p.responsableTelephone,
          p.ville ?? '',
          String(p._count.coursiers),
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
