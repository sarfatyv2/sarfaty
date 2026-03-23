import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const service = new PasswordService();

  describe('hash', () => {
    it('should return an argon2id hash string', async () => {
      const hash = await service.hash('secret-password');
      expect(hash).toMatch(/^\$argon2id\$/);
    });
  });

  describe('verify', () => {
    it('should return true for correct password', async () => {
      const hash = await service.hash('correct-plain');
      await expect(service.verify(hash, 'correct-plain')).resolves.toBe(true);
    });

    it('should return false for wrong password', async () => {
      const hash = await service.hash('stored-password');
      await expect(service.verify(hash, 'wrong-password')).resolves.toBe(false);
    });

    it('should return false for corrupted hash', async () => {
      await expect(service.verify('not-a-valid-hash', 'any')).resolves.toBe(false);
    });
  });
});
