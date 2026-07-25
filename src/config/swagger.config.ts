import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

const habillageColi = `
(function () {
  var poser = function () {
    var racine = document.getElementById('swagger-ui');
    if (!racine || document.querySelector('.coli-entete')) return;

    var entete = document.createElement('header');
    entete.className = 'coli-entete';
    entete.innerHTML =
      '<div class="coli-entete__interieur">' +
      '  <img class="coli-entete__logo" src="/public/logo512.png" alt="COLI237"' +
      '       onerror="this.style.display=\\'none\\'">' +
      '  <div>' +
      '    <p class="coli-entete__titre">COLI237</p>' +
      '    <p class="coli-entete__sous-titre">Documentation API</p>' +
      '  </div>' +
      '  <div class="coli-entete__meta">' +
      '    <a class="coli-jeton" href="/openapi.json">openapi.json</a>' +
      '    <a class="coli-jeton" href="/health">/health</a>' +
      '  </div>' +
      '</div>';
    racine.parentNode.insertBefore(entete, racine);

    var pied = document.createElement('footer');
    pied.className = 'coli-pied';
    pied.innerHTML =
      '<span>NET AND PROSYSTEMS SARL — Yaounde</span>' +
      '<a href="https://coli237.com">coli237.com</a>';
    racine.parentNode.appendChild(pied);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', poser);
  } else {
    poser();
  }
})();
`;

export function configurerSwagger(app: INestApplication) {
  const configuration = new DocumentBuilder()
    .setTitle('COLI237 — API plateforme')
    .setDescription(
      [
        'API de la plateforme de livraison COLI237, operee par NET AND PROSYSTEMS SARL.',
        '',
        '### Conventions',
        '',
        '- Les montants sont en francs CFA, en entiers, sans decimale.',
        '- Les telephones sont au format international (`+237…`).',
        '- Les horodatages sont en UTC, au format ISO 8601.',
      ].join('\n'),
    )
    .setVersion('0.1.0')
    .setContact('NET AND PROSYSTEMS SARL', 'https://coli237.com', '')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'jetonVendeur')
    .addTag('Systeme', 'Etat du service et metadonnees techniques')
    .build();

  const document = cleanupOpenApiDoc(SwaggerModule.createDocument(app, configuration));

  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'openapi.json',
    customSiteTitle: 'COLI237 — Documentation API',
    customCssUrl: '/public/docs/theme.css',
    customfavIcon: '/public/logo512.png',
    customJsStr: habillageColi,
    swaggerOptions: {
      docExpansion: 'list',
      displayRequestDuration: true,
      filter: true,
      persistAuthorization: true,
      tryItOutEnabled: true,
    },
  });
}
