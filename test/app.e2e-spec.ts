import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface CorpsSante {
  statut: string;
  version: string;
  environnement: string;
  horodatage: string;
  demarreDepuis: number;
}

describe('Sante du service (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /health repond 200 avec un statut ok', async () => {
    const reponse = await request(app.getHttpServer()).get('/health').expect(200);
    const corps = reponse.body as CorpsSante;

    expect(corps.statut).toBe('ok');
    expect(typeof corps.environnement).toBe('string');
    expect(typeof corps.demarreDepuis).toBe('number');
  });

  it('GET sur une route inconnue repond 404', async () => {
    await request(app.getHttpServer()).get('/route-inexistante').expect(404);
  });
});
