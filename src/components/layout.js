import { linkTo } from "../router.js";

export function renderShell(active, content, { admin = false } = {}) {
  return `
    <canvas id="bgCanvas"></canvas>
    <div class="bg-radial-gradients"></div>
    <nav class="site-nav">
      <div class="container">
        <a class="brand" ${linkTo("/")}>
          <span class="brand-mark-logo">CC</span> CareCredits${admin ? ' <span class="admin-pill">ADMIN</span>' : ""}
        </a>
        <ul class="nav-links">
          <li><a ${linkTo("/")} class="${active === "home" ? "active" : ""}">Home</a></li>
          <li><a ${linkTo("/wallet")} class="${active === "wallet" ? "active" : ""}">Wallet</a></li>
          <li><a ${linkTo("/pool")} class="${active === "pool" ? "active" : ""}">Fund Pool</a></li>
          <li><a ${linkTo("/admin")} class="${active === "admin" ? "active" : ""}">Admin</a></li>
          ${admin ? "" : '<li><button id="openOnboardingBtn" class="btn btn-outline nav-action">Tour</button></li><li><button id="openFeedbackBtn" class="btn btn-outline nav-action open-feedback-btn">Feedback</button></li>'}
        </ul>
      </div>
    </nav>
    ${content}
    <footer>
      <div class="container">
        <p>Stellar Testnet Only | CareCredits | Root Vite dApp | Built on Stellar and Soroban</p>
      </div>
    </footer>
  `;
}

export function initPageChrome() {
  const nav = document.querySelector(".site-nav");
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 24);
  };
  window.addEventListener("scroll", onScroll);
  onScroll();

  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return () => window.removeEventListener("scroll", onScroll);

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  let frameId = null;
  const mouse = { x: null, y: null };

  const onResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  const onMouseMove = (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  };
  const onMouseLeave = () => {
    mouse.x = null;
    mouse.y = null;
  };

  function drawGrid() {
    ctx.clearRect(0, 0, width, height);
    const spacing = 36;
    const cols = Math.ceil(width / spacing);
    const rows = Math.ceil(height / spacing);
    ctx.fillStyle = "rgba(100, 116, 139, 0.12)";

    for (let c = 0; c < cols; c += 1) {
      for (let r = 0; r < rows; r += 1) {
        const x = c * spacing;
        const y = r * spacing;
        let dx = 0;
        let dy = 0;

        if (mouse.x !== null && mouse.y !== null) {
          const distDx = mouse.x - x;
          const distDy = mouse.y - y;
          const dist = Math.sqrt(distDx * distDx + distDy * distDy);
          if (dist > 0 && dist < 100) {
            const force = (100 - dist) / 100;
            dx = -(distDx / dist) * force * 4;
            dy = -(distDy / dist) * force * 4;
          }
        }

        ctx.beginPath();
        ctx.arc(x + dx, y + dy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    frameId = requestAnimationFrame(drawGrid);
  }

  window.addEventListener("resize", onResize);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseleave", onMouseLeave);
  drawGrid();

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseleave", onMouseLeave);
    if (frameId) cancelAnimationFrame(frameId);
  };
}
