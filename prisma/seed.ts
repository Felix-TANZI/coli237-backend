import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const telephone = process.env.ADMIN_TELEPHONE;
  const motDePasse = process.env.ADMIN_MOT_DE_PASSE;

  if (!email || !telephone || !motDePasse) {
    throw new Error('Renseignez ADMIN_EMAIL, ADMIN_TELEPHONE et ADMIN_MOT_DE_PASSE dans .env');
  }

  const existant = await prisma.agent.findFirst({
    where: { OR: [{ email }, { telephone }] },
  });

  if (existant) {
    console.warn('Un agent avec cet email ou telephone existe deja. Ignore.');
    return;
  }

  const empreinte = await bcrypt.hash(motDePasse, 12);

  const admin = await prisma.agent.create({
    data: {
      nom: 'Administrateur',
      email,
      telephone,
      motDePasse: empreinte,
      role: 'ADMIN',
      // L'admin d'amorçage n'est pas force de changer son mot de passe :
      // il l'a lui-meme defini dans .env.
      doitChangerMotDePasse: false,
    },
  });

  console.warn(`Admin cree : ${admin.email}`);
}

main()
  .catch((erreur) => {
    console.error(erreur);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect().catch((e) => console.error(e));
  });
