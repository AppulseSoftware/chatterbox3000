interface EmailData {
  subject: string;
  bodyPreview: string;
  spfPass: boolean;
  dkimPass: boolean;
  sender: string;
  headers?: Record<string, string>;
}

interface Classification {
  classification: string;
  reason: string;
}

const COLD_OUTREACH_SUBJECT_PATTERNS = [
  /quick question/i,
  /following up/i,
  /partnership/i,
  /\b15 min(ute)? call\b/i,
  /scale your/i,
  /grow your/i,
  /looking to connect/i,
  /^[A-Z][a-z]+\?$/,
  /let'?s (chat|connect|talk)/i,
  /intro(?:duction)?\b/i,
  /collaboration opportunity/i,
  /reaching out/i,
  /mutual connection/i,
  /thought you'd be interested/i,
  /love to connect/i,
  /synerg/i,
];

const COLD_OUTREACH_BODY_PATTERNS = [
  /book a time/i,
  /schedule a call/i,
  /calendly\.com/i,
  /cal\.com/i,
  /hubspot\.com\/meetings/i,
];

const FREEMAIL_DOMAINS = [
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "aol.com",
  "icloud.com",
  "mail.com",
  "protonmail.com",
  "zoho.com",
];

const CF_SPAM_THRESHOLD = 40;

export function classify(email: EmailData): Classification {
  // Cloudflare spam score (0–100, higher = more spammy)
  const spamScoreRaw =
    email.headers?.["x-cf-spamh-score"] ??
    email.headers?.["X-Cf-Spamh-Score"];
  if (spamScoreRaw) {
    const spamScore = parseInt(spamScoreRaw, 10);
    if (!isNaN(spamScore) && spamScore >= CF_SPAM_THRESHOLD) {
      return {
        classification: "spam",
        reason: `Cloudflare spam score ${spamScore} >= ${CF_SPAM_THRESHOLD}`,
      };
    }
  }

  if (!email.spfPass && !email.dkimPass) {
    return {
      classification: "spam",
      reason: "Both SPF and DKIM failed",
    };
  }

  for (const pattern of COLD_OUTREACH_SUBJECT_PATTERNS) {
    if (pattern.test(email.subject)) {
      return {
        classification: "cold_outreach",
        reason: `Subject matches cold outreach pattern: ${pattern.source}`,
      };
    }
  }

  if (
    email.headers?.["list-unsubscribe"] ||
    email.headers?.["List-Unsubscribe"]
  ) {
    return {
      classification: "newsletter",
      reason: "Has List-Unsubscribe header",
    };
  }

  for (const pattern of COLD_OUTREACH_BODY_PATTERNS) {
    if (pattern.test(email.bodyPreview)) {
      return {
        classification: "cold_outreach",
        reason: `Body matches cold outreach pattern: ${pattern.source}`,
      };
    }
  }

  const senderDomain = email.sender.split("@")[1]?.toLowerCase();
  if (senderDomain && FREEMAIL_DOMAINS.includes(senderDomain)) {
    const vague = /^(hi|hello|hey|question|help|info|request)$/i;
    if (vague.test(email.subject.trim())) {
      return {
        classification: "unknown",
        reason: "Freemail domain with vague subject",
      };
    }
  }

  return {
    classification: "legitimate",
    reason: "No suspicious patterns detected",
  };
}
