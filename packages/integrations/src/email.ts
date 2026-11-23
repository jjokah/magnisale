import nodemailer from "nodemailer";

export interface Mail {
  to: string;
  subject: string;
  text: string;
}

export interface Mailer {
  send(mail: Mail): Promise<void>;
}

export interface MailerOptions {
  smtpUrl: string;
  from: string;
  production: boolean;
  log: { info(message: string): void; warn(message: string): void };
}

export function createMailer({ smtpUrl, from, production, log }: MailerOptions): Mailer {
  if (smtpUrl) {
    const transport = nodemailer.createTransport(smtpUrl);
    return {
      async send(mail) {
        await transport.sendMail({ from, ...mail });
      },
    };
  }

  // Emails carry sign-in links, so their text reaches the log only in development.
  if (production) {
    return {
      async send() {
        log.warn("An email was not sent because SMTP_URL is not set.");
      },
    };
  }
  return {
    async send(mail) {
      log.info(`[dev mail] To: ${mail.to} | ${mail.subject}\n${mail.text}`);
    },
  };
}
