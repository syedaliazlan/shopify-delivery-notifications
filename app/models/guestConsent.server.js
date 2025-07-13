import db from "../db.server";

/**
 * ✅ Save or Update Guest SMS Consent in Database
 * - Uses `sessionId` to track guests instead of email.
 */
export async function saveGuestConsent(sessionId, consent) {
  if (!sessionId) return;

  await db.guestConsent.upsert({
    where: { sessionId },
    update: { consent },
    create: { sessionId, consent },
  });

  console.log(`✅ Saved guest consent: ${sessionId} - ${consent}`);
}

/**
 * ✅ Fetch Guest SMS Consent from Database
 * - Retrieves consent using `sessionId`.
 */
export async function getGuestConsent(sessionId) {
  if (!sessionId) return false;

  const guest = await db.guestConsent.findUnique({ where: { sessionId } });
  return guest ? guest.consent : false;
}

/**
 * ✅ Remove Guest Consent After Order is Placed
 * - Deletes guest consent entry after order is completed.
 */
export async function deleteGuestConsent(sessionId) {
  if (!sessionId) return;
  
  await db.guestConsent.deleteMany({ where: { sessionId } });

  console.log(`🗑️ Deleted guest consent for session: ${sessionId}`);
}
