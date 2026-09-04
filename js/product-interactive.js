// Product page interactivity (gallery swap, qty stepper, copy name, description
// expand/collapse). Content itself is static HTML baked at build time.
document.addEventListener("DOMContentLoaded", () => {
  const mainImg = document.getElementById("gallery-main-img");
  document.querySelectorAll("#gallery-thumbs img").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      mainImg.src = thumb.dataset.full;
      document.querySelectorAll("#gallery-thumbs img").forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  const qtyMinus = document.getElementById("qty-minus");
  const qtyPlus = document.getElementById("qty-plus");
  const qtyValue = document.getElementById("qty-value");
  if (qtyMinus && qtyPlus && qtyValue) {
    qtyMinus.addEventListener("click", () => {
      qtyValue.value = Math.max(1, parseInt(qtyValue.value || "1", 10) - 1);
    });
    qtyPlus.addEventListener("click", () => {
      qtyValue.value = parseInt(qtyValue.value || "1", 10) + 1;
    });
  }

  const copyBtn = document.getElementById("copy-name-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      navigator.clipboard?.writeText(copyBtn.dataset.name || "");
      const old = copyBtn.textContent;
      copyBtn.textContent = "Đã sao chép!";
      setTimeout(() => (copyBtn.textContent = old), 1500);
    });
  }

  const addToCartBtn = document.getElementById("add-to-cart-btn");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      alert(`Đã thêm "${addToCartBtn.dataset.name || ""}" vào giỏ hàng (demo).`);
    });
  }

  const descBody = document.getElementById("description-body");
  const expandBtn = document.getElementById("expand-toggle");
  if (descBody && expandBtn) {
    if (descBody.scrollHeight <= 640) {
      expandBtn.style.display = "none";
      descBody.classList.add("expanded");
    } else {
      expandBtn.addEventListener("click", () => {
        const expanded = descBody.classList.toggle("expanded");
        expandBtn.textContent = expanded ? "Thu gọn ▲" : "Xem thêm ▼";
      });
    }
  }
});
