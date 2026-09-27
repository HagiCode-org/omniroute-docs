const HOSTNAME = "omniroute.hagicode.com";

function appendScript(documentRef, id, src) {
  const script = documentRef.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  documentRef.head.appendChild(script);
  return script;
}

export function initializeAnalytics({ hostname, googleId = "", fiftyOneLaId = "" }, browser) {
  if (hostname !== HOSTNAME || !browser) return;
  browser.__omnirouteAnalyticsLoaded ??= new Set();
  if (googleId && !browser.__omnirouteAnalyticsLoaded.has("google")) {
    browser.__omnirouteAnalyticsLoaded.add("google");
    browser.dataLayer ??= [];
    browser.gtag ??= (...args) => browser.dataLayer.push(args);
    browser.gtag("js", new Date());
    browser.gtag("config", googleId);
    appendScript(browser.document, "omniroute-google-analytics", `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleId)}`);
  }
  if (fiftyOneLaId && !browser.__omnirouteAnalyticsLoaded.has("51la")) {
    browser.__omnirouteAnalyticsLoaded.add("51la");
    const script = appendScript(browser.document, "omniroute-51la-analytics", "https://sdk.51.la/js-sdk-pro.min.js");
    script.onload = () => {
      browser.LA?.init({ id: fiftyOneLaId, ck: fiftyOneLaId, autoTrack: true, hashMode: true, screenRecord: false });
    };
  }
}
