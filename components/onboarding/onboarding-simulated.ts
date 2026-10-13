/**
 * Client-only stand-ins until the backend can store these choices.
 * Nothing here is sent to an API.
 */

/** TODO(backend): persist the assisted WhatsApp connection request. */
export async function requestAssistedWhatsApp(input: {
  e164: string;
  clientsAlreadyWrite: boolean;
}): Promise<{ ok: true }> {
  void input;
  return { ok: true };
}

/** TODO(backend): persist TikTok waitlist interest for this merchant. */
export async function registerTikTokInterest(): Promise<{ ok: true }> {
  return { ok: true };
}
