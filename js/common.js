// Shared header/footer render + site-wide behavior for the Dolphin House clone.

function formatVnd(n) {
  return Number(n).toLocaleString("vi-VN") + " ₫";
}

function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function categoryTree() {
  const roots = CATEGORIES.filter((c) => c.parent === 0);
  return roots.map((r) => ({
    ...r,
    children: CATEGORIES.filter((c) => c.parent === r.id),
  }));
}

const NAV_LINKS = [
  { label: "Trang chủ", href: "index.html" },
  { label: "Cửa hàng", href: "cua-hang.html" },
  { label: "Danh mục sản phẩm", href: "cua-hang.html" },
  { label: "Góc Chuyên Gia", href: "#" },
  { label: "Giới thiệu", href: "#" },
  { label: "Liên hệ", href: "#" },
  { label: "Videos", href: "#" },
];

function renderHeader() {
  const tree = categoryTree();
  const drawerHtml = tree
    .map(
      (c) => `
      <a href="danh-muc.html?slug=${c.slug}">${c.name} <span style="color:#999;font-weight:400;">(${c.count})</span></a>
      ${c.children.map((s) => `<a class="sub" href="danh-muc.html?slug=${s.slug}">${s.name} (${s.count})</a>`).join("")}
    `
    )
    .join("");

  const navHtml = NAV_LINKS.map(
    (l) => `<li><a href="${l.href}">${l.label}</a></li>`
  ).join("");

  const header = `
    <div class="topbar">
      <div class="container">
        <div class="topbar-left">Chào mừng bạn đến với Dolphin House</div>
        <div class="topbar-center"><span class="topbar-hotline">☎ HOTLINE 086 6393 892</span></div>
        <div class="topbar-right">Thứ 2-CN : 8h-17h30</div>
      </div>
    </div>
    <header class="site-header">
      <div class="container">
        <a class="logo" href="index.html"><img src="assets/images/site/dolphin-house-logo-320x100-1.webp" alt="Dolphin House"></a>
        <form class="search-form" onsubmit="return doSearch(event)">
          <input type="search" id="search-input" placeholder="Tìm kiếm sản phẩm">
          <button type="submit">Tìm kiếm</button>
        </form>
        <a class="cart-link" href="#">
          <span class="cart-icon">\u{1F6D2}<span class="cart-badge">0</span></span>
          <span class="cart-text"><strong>Giỏ hàng của bạn</strong><span>Chưa có sản phẩm</span></span>
        </a>
      </div>
    </header>
    <nav class="main-nav">
      <div class="container">
        <button class="cat-toggle" id="cat-toggle-btn">☰ Danh mục sản phẩm</button>
        <div class="cat-drawer" id="cat-drawer">${drawerHtml}</div>
        <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Menu">☰</button>
        <ul class="nav-links" id="nav-links">${navHtml}</ul>
      </div>
    </nav>
  `;
  document.getElementById("site-header").innerHTML = header;

  const catBtn = document.getElementById("cat-toggle-btn");
  const drawer = document.getElementById("cat-drawer");
  catBtn.addEventListener("click", () => drawer.classList.toggle("open"));
  document.addEventListener("click", (e) => {
    if (!catBtn.contains(e.target) && !drawer.contains(e.target)) drawer.classList.remove("open");
  });

  const mobileBtn = document.getElementById("mobile-menu-btn");
  const navLinks = document.getElementById("nav-links");
  mobileBtn.addEventListener("click", () => navLinks.classList.toggle("open"));

  const path = window.location.pathname.split("/").pop() || "index.html";
  navLinks.querySelectorAll("a").forEach((a) => {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });
}

function renderFooter() {
  const footer = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <h5>Thông tin liên hệ</h5>
            <p>Địa chỉ: S219 Đại Dương 8, Vinhomes Ocean Park, Gia Lâm, Hà Nội<br>
            Hotline: 086 639 3892<br>
            Email: dolphinhouse.vn@gmail.com<br>
            Tư vấn: Đồ gia dụng thông minh, điện gia dụng và tiện ích cao cấp cho gia đình hiện đại</p>
            <div class="footer-social">
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="YouTube">▶</a>
            </div>
          </div>
          <div>
            <h5>Trợ giúp</h5>
            <ul>
              <li><a href="index.html">Gia dụng thông minh cao cấp</a></li>
              <li><a href="#">Tư vấn chọn mua</a></li>
              <li><a href="#">Về Dolphin House</a></li>
              <li><a href="#">Hỗ trợ khách hàng</a></li>
              <li><a href="#">Hình thức thanh toán</a></li>
              <li><a href="#">Chính sách vận chuyển</a></li>
            </ul>
          </div>
          <div>
            <h5>Dolphin House</h5>
            <p>- sản phẩm chọn lọc, tư vấn rõ ràng, giao diện gọn nhẹ.</p>
          </div>
          <div class="footer-map">
            <h5>Bản đồ</h5>
            <img src="assets/images/site/maps.png" alt="Bản đồ Dolphin House">
            <button type="button">Xem bản đồ</button>
          </div>
        </div>
      </div>
      <div class="footer-bottom">Copyright © 2026 dolphinhouse.vn - All Rights Reserved.</div>
    </footer>
    <a class="zalo-fab" href="https://zalo.me/0866393892" target="_blank" rel="noopener" aria-label="Chat Zalo">Z</a>
    <button class="back-to-top" id="back-to-top" aria-label="Lên đầu trang">↑</button>
  `;
  document.getElementById("site-footer").innerHTML = footer;

  const btn = document.getElementById("back-to-top");
  window.addEventListener("scroll", () => {
    btn.classList.toggle("show", window.scrollY > 400);
  });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function doSearch(e) {
  e.preventDefault();
  const val = document.getElementById("search-input").value.trim();
  window.location.href = "cua-hang.html" + (val ? "?q=" + encodeURIComponent(val) : "");
  return false;
}

function productCardHtml(p) {
  const price = p.prices;
  const isSale = p.on_sale && price.regular_price !== price.price;
  const img = p.images[0] ? p.images[0].src : "";
  const priceHtml = isSale
    ? `<span class="price-old">${formatVnd(price.regular_price)}</span><span class="price-current sale">${formatVnd(price.price)}</span>`
    : `<span class="price-current">${formatVnd(price.price)}</span>`;
  return `
    <div class="product-card">
      ${isSale ? '<span class="onsale">Giảm giá!</span>' : ""}
      <a class="thumb" href="san-pham.html?slug=${p.slug}"><img src="${img}" alt="${p.name}" loading="lazy"></a>
      <h3><a href="san-pham.html?slug=${p.slug}">${p.name}</a></h3>
      <div class="price-row">${priceHtml}</div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
});
