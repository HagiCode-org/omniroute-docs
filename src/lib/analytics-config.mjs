export function getAnalyticsIdentifiers(isProduction, googleId = "", fiftyOneLaId = "") {
  if (!isProduction) return undefined;
  const identifiers = {
    googleId: googleId.trim(),
    fiftyOneLaId: fiftyOneLaId.trim(),
  };
  return identifiers.googleId || identifiers.fiftyOneLaId ? identifiers : undefined;
}
