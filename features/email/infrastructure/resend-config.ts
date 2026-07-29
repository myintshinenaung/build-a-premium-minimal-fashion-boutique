export function getResendApiKey() {
  const key = process.env.RESEND_API_KEY?.trim();

  if (!key) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return key;
}

export function getEmailFromAddress() {
  return process.env.EMAIL_FROM?.trim() || "Daily Outfit <onboarding@resend.dev>";
}
