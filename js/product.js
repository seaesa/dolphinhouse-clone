// Renders a single product page from PRODUCTS data based on ?slug= in the URL.

function renderProductPage() {
  const slug = qs("slug");
  const product = PRODUCTS.find((p) => p.slug === slug);
  const root = document.getElementById("product-root");

  if (!product) {
    root.innerHTML = '<p class="empty-state">Không tìm thấy sản phẩm. <a class="link-arrow" href="cua-hang.html">Quay lại cửa hàng →</a></p>';
    return;
  }

  document.title = product.name + " | Dolphin House";
  const cat = product.categories[0];
  document.getElementById("crumb-cat-wrap").innerHTML = cat
    ? ` / <a href="danh-muc.html?slug=${cat.slug}">${cat.name}</a>`
    : "";
  document.getElementById("crumb-name").textContent = product.name;

  const isSale = product.on_sale && product.prices.regular_price !== product.prices.price;
  const priceHtml = isSale
    ? `<span class="price-old">${formatVnd(product.prices.regular_price)}</span> ${formatVnd(product.prices.price)}`
    : formatVnd(product.prices.price);

  const images = product.images.length ? product.images : [{ src: "", alt: product.name }];

  root.innerHTML = `
    <div class="product-detail">
      <div>
        <div class="gallery-main"><img id="gallery-main-img" src="${images[0].src}" alt="${images[0].alt}"></div>
        <div class="gallery-thumbs" id="gallery-thumbs">
          ${images
            .map(
              (im, i) =>
                `<img src="${im.thumbnail || im.src}" data-full="${im.src}" alt="${im.alt}" class="${i === 0 ? "active" : ""}">`
            )
            .join("")}
        </div>
      </div>

      <div class="summary">
        <h1>${product.name}</h1>
        <button class="copy-name-btn" id="copy-name-btn">Sao chép tên</button>
        <div class="price-block">${priceHtml}</div>
        <div class="short-desc">${product.short_description || ""}</div>
        <div class="qty-row">
          <div class="qty-input">
            <button type="button" id="qty-minus">-</button>
            <input type="text" id="qty-value" value="1">
            <button type="button" id="qty-plus">+</button>
          </div>
          <button class="btn-purple" id="add-to-cart-btn">Thêm vào giỏ hàng</button>
          <button class="btn-gray">Liên hệ</button>
        </div>
        <a class="btn-orange" href="tel:0866393892">
          MUA NGAY
          <small>Gọi điện xác nhận và giao hàng tận nơi</small>
        </a>
        <div class="summary-meta">
          ${product.sku ? `<div>SKU: <strong>${product.sku}</strong></div>` : ""}
          ${cat ? `<div>Danh mục: <a href="danh-muc.html?slug=${cat.slug}">${cat.name}</a></div>` : ""}
          ${product.brand_names.length ? `<div>Thương hiệu: ${product.brand_names.join(", ")}</div>` : ""}
        </div>
        <div class="trust-box">
          <div>✅ Hàng chính hãng 100% — hóa đơn đầy đủ</div>
          <div>🚚 Giao toàn quốc — kiểm tra hàng khi nhận (COD)</div>
          <div>🔁 Đổi trả trong 15 ngày nếu lỗi kỹ thuật</div>
          <div>🛡️ Bảo hành chính hãng 12 tháng</div>
        </div>
        <button class="chat-fb-btn" type="button">💬 Chat Facebook tư vấn — phản hồi nhanh</button>
      </div>

      <aside class="side-panel">
        <div class="trust-list">
          <div class="item"><span class="ic">🚚</span><div>Giao hàng trên toàn quốc</div></div>
          <div class="item"><span class="ic">🔁</span><div>Đổi trả trong 15 ngày nếu lỗi kỹ thuật</div></div>
          <div class="item"><span class="ic">🏠</span><div>Thanh toán tại nhà hoặc qua thẻ</div></div>
          <div class="item"><span class="ic">📞</span><div>Tổng CSKH 8h30 - 18h00<br><b>086 639 3892</b></div></div>
          <div class="item"><span class="ic">📞</span><div>Kinh doanh<br><b>086 639 3892<br>0378 840 450</b></div></div>
          <div class="item"><span class="ic">📞</span><div>Kỹ thuật<br><b>086 639 3892</b></div></div>
          <div class="item"><span class="ic">📦</span><div>Lắp đặt tại các thành phố lớn</div></div>
        </div>
      </aside>
    </div>

    <section class="description-section">
      <span class="description-tab-head">MÔ TẢ SẢN PHẨM</span>
      <div class="description-body" id="description-body">
        ${product.description || "<p>Đang cập nhật mô tả sản phẩm.</p>"}
        <div class="description-fade"></div>
      </div>
      <button class="expand-toggle" id="expand-toggle">Xem thêm ▼</button>
    </section>

    <section class="section related-section">
      <h2>Sản phẩm tương tự</h2>
      <div class="product-grid" id="related-grid"></div>
    </section>
  `;

  const mainImg = document.getElementById("gallery-main-img");
  document.querySelectorAll("#gallery-thumbs img").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      mainImg.src = thumb.dataset.full;
      document.querySelectorAll("#gallery-thumbs img").forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  document.getElementById("qty-minus").addEventListener("click", () => {
    const inp = document.getElementById("qty-value");
    inp.value = Math.max(1, parseInt(inp.value || "1", 10) - 1);
  });
  document.getElementById("qty-plus").addEventListener("click", () => {
    const inp = document.getElementById("qty-value");
    inp.value = parseInt(inp.value || "1", 10) + 1;
  });
  document.getElementById("copy-name-btn").addEventListener("click", () => {
    navigator.clipboard?.writeText(product.name);
    const btn = document.getElementById("copy-name-btn");
    const old = btn.textContent;
    btn.textContent = "Đã sao chép!";
    setTimeout(() => (btn.textContent = old), 1500);
  });
  document.getElementById("add-to-cart-btn").addEventListener("click", () => {
    alert(`Đã thêm "${product.name}" vào giỏ hàng (demo).`);
  });

  const descBody = document.getElementById("description-body");
  const expandBtn = document.getElementById("expand-toggle");
  if (descBody.scrollHeight <= 640) {
    expandBtn.style.display = "none";
    descBody.classList.add("expanded");
  } else {
    expandBtn.addEventListener("click", () => {
      const expanded = descBody.classList.toggle("expanded");
      expandBtn.textContent = expanded ? "Thu gọn ▲" : "Xem thêm ▼";
    });
  }

  const related = PRODUCTS.filter(
    (p) => p.slug !== product.slug && p.categories.some((c) => cat && c.slug === cat.slug)
  ).slice(0, 4);
  const fallback = related.length
    ? related
    : PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 4);
  document.getElementById("related-grid").innerHTML = fallback.map(productCardHtml).join("");
}
