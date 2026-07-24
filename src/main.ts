import { join } from 'node:path';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';
import { configurerSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // Politique stricte par defaut : l'API ne sert que du JSON.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
      },
      referrerPolicy: { policy: 'no-referrer' },
    }),
  );

  // Swagger a besoin de styles et scripts en ligne, et le theme charge ses
  // polices depuis Google Fonts. On assouplit sur ce chemin uniquement.
  app.use(
    ['/docs', '/public'],
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:'],
        },
      },
    }),
  );

  app.enableCors({
    origin: config.get<string[]>('CORS_ORIGINS'),
    credentials: true,
    maxAge: 86_400,
  });

  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/public/' });
  app.useGlobalPipes(new ZodValidationPipe());
  app.enableShutdownHooks();

  configurerSwagger(app);

  const port = config.get<number>('PORT')!;
  await app.listen(port);

  Logger.log(`Documentation sur http://localhost:${port}/docs`, 'Bootstrap');
}

void bootstrap();