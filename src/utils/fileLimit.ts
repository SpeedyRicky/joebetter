export const DAILY_FILE_LIMIT = 6;

function getTodayKey(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `gret_daily_files_${today}`;
}

export function getTodayUploadCount(): number {
  try {
    const raw = localStorage.getItem(getTodayKey());
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function getUploadStatus(): {
  used: number;
  remaining: number;
  max: number;
  isLimitReached: boolean;
} {
  const used = getTodayUploadCount();
  const remaining = Math.max(0, DAILY_FILE_LIMIT - used);
  return {
    used,
    remaining,
    max: DAILY_FILE_LIMIT,
    isLimitReached: remaining <= 0,
  };
}

export function recordFileUploads(count: number = 1): boolean {
  try {
    const key = getTodayKey();
    const current = getTodayUploadCount();
    const next = current + count;
    localStorage.setItem(key, next.toString());
    return true;
  } catch {
    return false;
  }
}
