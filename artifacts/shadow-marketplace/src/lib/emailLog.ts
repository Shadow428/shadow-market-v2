/* ──────────────────────────────────────────────────────────
   emailLog.ts — Log of every account delivery sent to buyers
   ────────────────────────────────────────────────────────── */

export interface EmailLogEntry {
  id: string;
  orderId: string;
  productName: string;
  customerEmail: string;
  accountUsername: string;
  accountPassword: string;
  sentAt: string;
}

const LOG_KEY = 'sm_email_log';

export function getEmailLog(): EmailLogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? (JSON.parse(raw) as EmailLogEntry[]) : [];
  } catch {
    return [];
  }
}

export function addEmailLogEntry(
  entry: Omit<EmailLogEntry, 'id' | 'sentAt'>,
): EmailLogEntry {
  const log = getEmailLog();
  const newEntry: EmailLogEntry = {
    ...entry,
    id: `log_${Date.now()}`,
    sentAt: new Date().toISOString(),
  };
  log.unshift(newEntry);
  localStorage.setItem(LOG_KEY, JSON.stringify(log));
  return newEntry;
}

export function deleteEmailLogEntry(id: string): void {
  const log = getEmailLog().filter(e => e.id !== id);
  localStorage.setItem(LOG_KEY, JSON.stringify(log));
}
