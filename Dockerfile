# build
FROM node:24-slim AS build

# pnpm fige a la meme version que le projet (evite les mismatch de lockfile)
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

WORKDIR /app

# Dependances (cache optimise : on copie d'abord les manifestes)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Code source
COPY . .

# Client Prisma + build NestJS.
# DATABASE_URL bidon : "generate" ne se connecte pas, mais prisma.config.ts
# exige que la variable existe. La vraie URL est fournie au demarrage.
RUN DATABASE_URL="postgresql://user:pass@localhost:5432/db" pnpm prisma generate
RUN pnpm build

# On retire les dependances de dev pour l'image finale
RUN pnpm prune --prod

# image finale
FROM node:24-slim AS production

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# openssl est requis par Prisma a l'execution
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

# On copie uniquement le necessaire depuis l'etape de build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/package.json ./package.json

# Utilisateur non-root (securite)
RUN useradd --user-group --create-home --shell /bin/false app \
  && chown -R app:app /app
USER app

EXPOSE 3000

# Au demarrage : on applique les migrations puis on lance l'API.
CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/main"]
