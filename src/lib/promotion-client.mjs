const STORAGE_PREFIX = "hagicode:omniroute-docs:promotion:dismissed:";

/**
 * @param {HTMLElement | null | undefined} root
 * @param {{
 *   loadPromotion?: () => Promise<{
 *     id: string, title: string, description: string, ctaLabel: string, href: string,
 *     image?: { src: string, alt: string, width?: number, height?: number } | null
 *   } | null>,
 *   windowObject?: Window,
 *   documentObject?: Document,
 *   Observer?: typeof IntersectionObserver
 * }} options
 */
export function enhancePromotionCard(root, {
  loadPromotion,
  windowObject = globalThis.window,
  documentObject = root?.ownerDocument ?? globalThis.document,
  Observer = windowObject?.IntersectionObserver,
} = {}) {
  const title = root?.querySelector("[data-promotion-title]");
  const description = root?.querySelector("[data-promotion-description]");
  const link = root?.querySelector("[data-promotion-link]");
  const dismiss = root?.querySelector("[data-promotion-dismiss]");
  const image = root?.querySelector("[data-promotion-image]");
  if (!root || !title || !description || !link || !dismiss || !image) {
    throw new Error("Floating promotion is missing required elements.");
  }
  const dismissed = new Set();
  let footerVisible = false;
  const signature = () => root.getAttribute("data-promotion-signature") ?? "fallback:hagicode";
  const key = () => `${STORAGE_PREFIX}${encodeURIComponent(signature())}`;
  const isDismissed = () => {
    if (dismissed.has(signature())) return true;
    try {
      return windowObject?.localStorage?.getItem(key()) === "1";
    } catch {
      return false;
    }
  };
  const render = () => {
    root.hidden = footerVisible || isDismissed();
    root.inert = root.hidden;
    root.setAttribute("aria-hidden", String(root.hidden));
  };
  image.addEventListener("error", () => {
    image.src = image.dataset.fallbackSrc;
    image.alt = image.dataset.fallbackAlt;
  }, { once: true });
  dismiss.addEventListener("click", () => {
    dismissed.add(signature());
    try {
      windowObject?.localStorage?.setItem(key(), "1");
    } catch {
      // The in-memory dismissal still applies when storage is blocked.
    }
    render();
  });
  const footer = documentObject?.querySelector("footer.site-footer");
  let observer;
  let onViewportChange;
  if (footer && Observer) {
    observer = new Observer((entries) => {
      footerVisible = Boolean(entries[0]?.isIntersecting);
      render();
    }, { threshold: 0 });
    observer.observe(footer);
  } else if (footer && windowObject) {
    onViewportChange = () => {
      const bounds = footer.getBoundingClientRect();
      footerVisible = bounds.top < windowObject.innerHeight && bounds.bottom > 0;
      render();
    };
    windowObject.addEventListener("scroll", onViewportChange, { passive: true });
    windowObject.addEventListener("resize", onViewportChange);
    onViewportChange();
  }
  if (loadPromotion) {
    void loadPromotion().then((campaign) => {
      if (!campaign) return;
      const closedBeforeLoad = dismissed.has(signature());
      title.textContent = campaign.title;
      description.textContent = campaign.description;
      link.textContent = campaign.ctaLabel;
      link.href = campaign.href;
      image.alt = campaign.image?.alt ?? campaign.title;
      if (campaign.image?.src) {
        image.src = campaign.image.src;
        if (campaign.image.width) image.width = campaign.image.width;
        if (campaign.image.height) image.height = campaign.image.height;
      }
      root.setAttribute("data-promotion-signature", `campaign:${campaign.id}`);
      if (closedBeforeLoad) dismissed.add(signature());
      render();
    }).catch((error) => {
      console.warn("Unable to enhance OmniRoute promotion; retaining local content.", error);
    });
  }
  render();
  return () => {
    observer?.disconnect();
    if (onViewportChange) {
      windowObject.removeEventListener("scroll", onViewportChange);
      windowObject.removeEventListener("resize", onViewportChange);
    }
  };
}
