import { beforeEach, describe, expect, it, vi } from 'vitest';

const sendMailMock = vi.fn();
const createTransportMock = vi.fn(() => ({
  sendMail: sendMailMock,
}));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: createTransportMock,
  },
}));

describe('sendMail utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.PLATFORM_EMAIL = 'platform@test.com';
    process.env.PLATFORM_EMAIL_PASSWORD = 'secret';
  });

  it('isMailConfigured retourne true quand la configuration email est complete', async () => {
    const { isMailConfigured } = await import('../../src/utils/sendMail.js');

    expect(isMailConfigured()).toBe(true);
  });

  it('envoyerIdentifiants envoie les identifiants par email', async () => {
    const { envoyerIdentifiants } = await import('../../src/utils/sendMail.js');

    sendMailMock.mockResolvedValue({ messageId: 'mail-1' });

    await envoyerIdentifiants({
      email: 'directeur@test.com',
      prenom: 'Sara',
      motDePasse: 'Temp1234',
      institution: 'ENSA Tanger',
    });

    expect(createTransportMock).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        user: 'platform@test.com',
        pass: 'secret',
      },
    });
    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'platform@test.com',
      to: 'directeur@test.com',
      subject: 'Compte directeur cree',
      html: expect.stringContaining('ENSA Tanger'),
    });
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('Temp1234'),
      })
    );
  });

  it('envoyerIdentifiants echoue si la configuration email manque', async () => {
    delete process.env.PLATFORM_EMAIL_PASSWORD;

    const { envoyerIdentifiants } = await import('../../src/utils/sendMail.js');

    await expect(
      envoyerIdentifiants({
        email: 'directeur@test.com',
        prenom: 'Sara',
        motDePasse: 'Temp1234',
        institution: 'ENSA Tanger',
      })
    ).rejects.toThrow(/Configuration email manquante/);
  });

  it('envoyerNotificationEmail envoie lemail de notification', async () => {
    const { envoyerNotificationEmail } = await import('../../src/utils/sendMailnotif.js');

    sendMailMock.mockResolvedValue({ messageId: 'mail-2' });

    await envoyerNotificationEmail({
      email: 'user@test.com',
      sujet: 'Sujet',
      message: 'Contenu',
    });

    expect(createTransportMock).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        user: 'platform@test.com',
        pass: 'secret',
      },
    });
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'platform@test.com',
        to: 'user@test.com',
        subject: 'Sujet',
        html: expect.stringContaining('Contenu'),
      })
    );
  });
});
