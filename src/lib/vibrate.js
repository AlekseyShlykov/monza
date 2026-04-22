export function safeVibrate(pattern) {
  try {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return false;
    navigator.vibrate(pattern);
    return true;
  } catch {
    return false;
  }
}
