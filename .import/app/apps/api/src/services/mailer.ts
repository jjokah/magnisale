import nodemailer from "nodemailer";
import type { Env } from "../env.js";

export interface Mail {
  to: string;
  subject: string;
  text: string;
}

export interface Mailer {
  send(mail: Mail): Promise<void>;
}

type Log = { info(message: string): void; warn(message: string): void };

export function createMailer(env: Env, log: Log): Mailer {
  if (env.SMTP_URL) {
    const transport = nodemailer.createTransport(env.SMTP_URL);
    return {
      async send(mail) {
        await transport.sendMail({ from: env.MAIL_FROM, ...mail });
      },
    };
  }

  // Emails carry sign-in links, so their text reaches the log only in development.
  if (env.NODE_ENV === "production") {
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
