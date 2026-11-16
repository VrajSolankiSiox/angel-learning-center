const BRAND_COLORS = ["#009e4a", "#1a3d8f", "#e85d04", "#ffc107", "#6c63ff"];
const PIECE_COUNT = 22;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Short CSS-only confetti burst (GPU transforms, no canvas loop).
 */
export function fireConfettiCelebration() {
  if (typeof document === "undefined") return;

  const root = document.createElement("div");
  root.className = "confetti-burst";
  root.setAttribute("aria-hidden", "true");

  for (let i = 0; i < PIECE_COUNT; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.setProperty("--x", `${randomBetween(8, 92)}%`);
    piece.style.setProperty("--drift", `${randomBetween(-120, 120)}px`);
    piece.style.setProperty("--delay", `${randomBetween(0, 180)}ms`);
    piece.style.setProperty("--spin", `${randomBetween(180, 720)}deg`);
    piece.style.setProperty("--color", BRAND_COLORS[i % BRAND_COLORS.length]);
    root.appendChild(piece);
  }

  document.body.appendChild(root);
  window.setTimeout(() => root.remove(), 1500);
}