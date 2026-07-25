import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const service = new PasswordService();

  it('chiffre puis verifie un mot de passe correct', async () => {
    const empreinte = await service.chiffrer('MonSecret123');
    const ok = await service.verifier('MonSecret123', empreinte);
    expect(ok).toBe(true);
  });

  it('rejette un mauvais mot de passe', async () => {
    const empreinte = await service.chiffrer('MonSecret123');
    const ok = await service.verifier('MauvaisMotDePasse', empreinte);
    expect(ok).toBe(false);
  });

  it('ne stocke jamais le mot de passe en clair', async () => {
    const empreinte = await service.chiffrer('MonSecret123');
    expect(empreinte).not.toContain('MonSecret123');
  });

  it('genere un mot de passe temporaire de 8 caracteres', () => {
    const mdp = service.genererTemporaire();
    expect(mdp).toHaveLength(8);
  });

  it('genere des mots de passe differents a chaque appel', () => {
    const a = service.genererTemporaire();
    const b = service.genererTemporaire();
    expect(a).not.toBe(b);
  });

  it('n utilise pas de caracteres ambigus', () => {
    const mdp = service.genererTemporaire(50);
    expect(mdp).not.toMatch(/[0O1lI]/);
  });
});
