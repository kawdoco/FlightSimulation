export function telemetryFreshness(lastReceivedAt, now, staleAfterMs = 10000) {
  if (lastReceivedAt == null) return 'waiting';
  return now - lastReceivedAt >= staleAfterMs ? 'stale' : 'live';
}
