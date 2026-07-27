import { renderHomePage } from "./pages/home.js";
import { renderWalletPage } from "./pages/wallet.js";
import { renderPoolPage } from "./pages/pool.js";
import { renderAdminPage } from "./pages/admin.js";

const routes = {
  "/": renderHomePage,
  "/wallet": renderWalletPage,
  "/pool": renderPoolPage,
  "/admin": renderAdminPage,
};

let appRoot = null;
let activeCleanup = null;

function normalizePath(pathname) {
  const normalized = pathname.replace(/\/$/, "") || "/";
  if (normalized.endsWith(".html")) {
    return normalized.replace(/\/?index\.html$/, "/").replace(".html", "");
  }
  return normalized;
}

function navigate(path) {
  window.history.pushState({}, "", path);
  renderCurrentRoute();
}

export function linkTo(path) {
  return `data-link href="${path}"`;
}

export function renderCurrentRoute() {
  if (!appRoot) return;
  if (typeof activeCleanup === "function") activeCleanup();

  const path = normalizePath(window.location.pathname);
  const render = routes[path] || renderHomePage;
  activeCleanup = render(appRoot, { navigate, path });

  const onboardingBtn = document.getElementById("openOnboardingBtn");
  if (onboardingBtn && window.CareOnboarding) {
    onboardingBtn.addEventListener("click", () => window.CareOnboarding.open(true));
  }

  const feedbackBtn = document.getElementById("openFeedbackBtn");
  if (feedbackBtn && window.CareFeedback) {
    feedbackBtn.addEventListener("click", () => window.CareFeedback.open("manual"));
  }
}

export function initRouter(root) {
  appRoot = root;
  document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a[data-link]");
    if (!anchor) return;
    const url = new URL(anchor.href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    event.preventDefault();
    navigate(`${url.pathname}${url.search}${url.hash}`);
  });
  window.addEventListener("popstate", renderCurrentRoute);
  renderCurrentRoute();
}
