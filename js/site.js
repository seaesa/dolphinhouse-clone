// Site-wide interactive behavior only (content is now baked into static HTML
// at build time — see scripts/build.mjs — so this file no longer renders
// header/footer/product markup at runtime).
document.addEventListener("DOMContentLoaded", () => {
  const catBtn = document.getElementById("cat-toggle-btn");
  const drawer = document.getElementById("cat-drawer");
  if (catBtn && drawer) {
    catBtn.addEventListener("click", () => drawer.classList.toggle("open"));
    document.addEventListener("click", (e) => {
      if (!catBtn.contains(e.target) && !drawer.contains(e.target)) drawer.classList.remove("open");
    });
  }

  const mobileBtn = document.getElementById("mobile-menu-btn");
  const navLinks = document.getElementById("nav-links");
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
  }

  const backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    window.addEventListener("scroll", () => {
      backToTop.classList.toggle("show", window.scrollY > 400);
    });
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
});
