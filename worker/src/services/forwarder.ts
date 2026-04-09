import type { Env } from "../index.ts";

declare const EmailMessage: {
  new (from: string, to: string, raw: ReadableStream | Blob | string): EmailMessage;
};

interface ForwardOptions {
  env: Env;
  to: string;
  from: string;
  subject: string;
  bodyPreview: string;
  originalFrom: string;
  classification?: string | null;
}

export async function forwardEmail(options: ForwardOptions): Promise<boolean> {
  const { env, to, from, subject, bodyPreview, originalFrom, classification } = options;

  if (!env.SEND_EMAIL) {
    console.error("SEND_EMAIL binding not configured");
    return false;
  }

  const tag = classification ? `[${classification}]` : "[unclassified]";
  const msg = createMimeMessage({
    from,
    to,
    subject: `${tag} ${subject}`,
    body: `Forwarded from: ${originalFrom}\n\n${bodyPreview}`,
  });

  try {
    if (typeof EmailMessage === "undefined") {
      // Local dev — EmailMessage is only available in the Cloudflare runtime
      console.log(`[dev] Would forward email to ${to}: ${tag} ${subject}`);
      return true;
    }
    const message = new EmailMessage(from, to, new Blob([msg]));
    await env.SEND_EMAIL.send(message);
    return true;
  } catch (e) {
    console.error("Failed to forward email:", e);
    return false;
  }
}

function createMimeMessage(opts: {
  from: string;
  to: string;
  subject: string;
  body: string;
}): string {
  return [
    `From: ${opts.from}`,
    `To: ${opts.to}`,
    `Subject: ${opts.subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=utf-8`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@chatterbox3000>`,
    ``,
    opts.body,
  ].join("\r\n");
}
