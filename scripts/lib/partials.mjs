// Shared HTML partials: header/footer/nav (previously built at runtime by js/common.js
// renderHeader()/renderFooter()) and the product-card markup, now emitted at build time.
import { CATEGORY_ICONS, hexToRgba } from "./mega-menu-icons.mjs";

export function formatVnd(n) {
  return Number(n).toLocaleString("vi-VN") + " ₫";
}

// `match` is the path prefix that marks this item active (see renderHeader).
const NAV_LINKS = [
  { label: "Trang chủ", href: "/", match: "/", exact: true },
  { label: "Cửa hàng", href: "/cua-hang/", match: "/cua-hang/" },
  { label: "Danh mục sản phẩm", href: "/cua-hang/", match: "/danh-muc/" },
  { label: "Góc Chuyên Gia", href: "/tin-tuc/", match: "/tin-tuc/" },
  { label: "Giới thiệu", href: "/gioi-thieu/", match: "/gioi-thieu/" },
  { label: "Liên hệ", href: "/lien-he/", match: "/lien-he/" },
  { label: "Videos", href: "/videos/", match: "/videos/" },
];

export function categoryTree(categories) {
  const roots = categories.filter((c) => c.parent === 0);
  return roots.map((r) => ({
    ...r,
    children: categories.filter((c) => c.parent === r.id),
  }));
}

// Subcategories live nested under their parent's slug on the real site
// (e.g. /danh-muc/do-dung-nha-bep/xong-noi/), top-level categories don't.
export function categoryUrl(cat, categories) {
  if (cat.parent === 0) return `/danh-muc/${cat.slug}/`;
  const parent = categories.find((c) => c.id === cat.parent);
  return `/danh-muc/${parent.slug}/${cat.slug}/`;
}

function megaMenuIcon(slug) {
  const ic = CATEGORY_ICONS[slug] || CATEGORY_ICONS["tat-ca"];
  return `<span class="dh-cat-ic" style="background:${hexToRgba(ic.color, 0.12)};color:${ic.color}">${ic.svg}</span>`;
}

// `activePath` is the current page's pathname, used to highlight the matching
// nav item (mirrors the old client-side `location.pathname` match, now
// resolved at build time) and to render the mega menu's flyout submenus.
export function renderHeader(categories, activePath = "") {
  const tree = categoryTree(categories);

  const megaMenuHtml = tree
    .map((c) => {
      const hasChildren = c.children.length > 0;
      const sub = hasChildren
        ? `<ul class="dh-cat-sub">${c.children
            .map((s) => `<li><a href="${categoryUrl(s, categories)}"><span class="dh-cat-name">${s.name}</span></a></li>`)
            .join("")}</ul>`
        : "";
      return `
      <li class="dh-cat-item${hasChildren ? " has-children" : ""}">
        <a href="${categoryUrl(c, categories)}">${megaMenuIcon(c.slug)}<span class="dh-cat-name">${c.name}</span>${hasChildren ? '<span class="dh-cat-arrow">›</span>' : ""}</a>
        ${sub}
      </li>`;
    })
    .join("");

  const navHtml = NAV_LINKS.map((l) => {
    const active = l.exact ? activePath === l.match : activePath.startsWith(l.match);
    return `<li><a href="${l.href}"${active ? ' class="active"' : ""}>${l.label}</a></li>`;
  }).join("");

  return `
    <div class="topbar">
      <div class="container">
        <div class="topbar-left">Chào mừng bạn đến với Dolphin House</div>
        <div class="topbar-center"><span class="topbar-hotline">☎ HOTLINE 086 6393 892</span></div>
        <div class="topbar-right">Thứ 2-CN : 8h-17h30</div>
      </div>
    </div>
    <header class="site-header">
      <div class="container">
        <a class="logo" href="/"><img src="/assets/images/site/dolphin-house-logo-320x100-1.webp" alt="Dolphin House"></a>
        <form class="search-form" action="/cua-hang/" method="get">
          <input type="search" name="q" id="search-input" placeholder="Tìm kiếm sản phẩm">
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
        <div class="danhmuc-menu" id="danhmuc-menu">
          <div class="cat-toggle" id="cat-toggle-btn" role="button" aria-label="Mở hoặc đóng danh mục sản phẩm">Danh mục sản phẩm<i>☰</i></div>
          <div class="cat-drawer" id="cat-drawer">
            <ul class="dh-cat-list">
              ${megaMenuHtml}
              <li class="dh-cat-item">
                <a href="/cua-hang/">${megaMenuIcon("tat-ca")}<span class="dh-cat-name">Tất cả sản phẩm</span></a>
              </li>
            </ul>
          </div>
        </div>
        <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Menu">☰</button>
        <ul class="nav-links" id="nav-links">${navHtml}</ul>
      </div>
    </nav>
  `;
}

export function renderFooter() {
  return `
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
              <li><a href="/">Gia dụng thông minh cao cấp</a></li>
              <li><a href="/tin-tuc/">Tư vấn chọn mua</a></li>
              <li><a href="/gioi-thieu/">Về Dolphin House</a></li>
              <li><a href="/ho-tro-khach-hang/">Hỗ trợ khách hàng</a></li>
              <li><a href="/hinh-thuc-thanh-toan/">Hình thức thanh toán</a></li>
              <li><a href="/hinh-thuc-van-chuyen/">Chính sách vận chuyển</a></li>
            </ul>
          </div>
          <div>
            <h5>Dolphin House</h5>
            <p>- sản phẩm chọn lọc, tư vấn rõ ràng, giao diện gọn nhẹ.</p>
          </div>
          <div class="footer-map">
            <h5>Bản đồ</h5>
            <img src="/assets/images/site/maps.png" alt="Bản đồ Dolphin House">
            <button type="button">Xem bản đồ</button>
          </div>
        </div>
      </div>
      <div class="footer-bottom">Copyright © 2026 dolphinhouse.vn - All Rights Reserved.</div>
    </footer>
    <a class="zalo-fab" href="https://zalo.me/0866393892" target="_blank" rel="noopener" aria-label="Chat Zalo">Z</a>
    <button class="back-to-top" id="back-to-top" aria-label="Lên đầu trang">↑</button>
  `;
}

export function productCardHtml(p) {
  const price = p.prices;
  const isSale = p.on_sale && price.regular_price !== price.price;
  const img = p.images[0] ? p.images[0].src : "";
  const priceHtml = isSale
    ? `<span class="price-old">${formatVnd(price.regular_price)}</span><span class="price-current sale">${formatVnd(price.price)}</span>`
    : `<span class="price-current">${formatVnd(price.price)}</span>`;
  return `
    <div class="product-card">
      ${isSale ? '<span class="onsale">Giảm giá!</span>' : ""}
      <a class="thumb" href="/san-pham/${p.slug}/"><img src="${img}" alt="${p.name}" loading="lazy"></a>
      <h3><a href="/san-pham/${p.slug}/">${p.name}</a></h3>
      <div class="price-row">${priceHtml}</div>
      <a class="card-add-to-cart" href="/san-pham/${p.slug}/">Thêm vào giỏ hàng</a>
    </div>
  `;
}

// The "Tin tức" / "Videos" aside that sits beside shop & category product
// grids on the real site — both widgets are just a title bar with no body
// content there too (verified on the live site, not a rendering gap here).
export function shopSidebarHtml() {
  return `
  <aside class="shop-sidebar">
    <div class="widget"><div class="title-sidebar">Tin tức</div></div>
    <div class="widget"><div class="title-sidebar">Videos</div></div>
  </aside>`;
}

// Wraps a page's <main> content with the shared <head>/header/footer shell.
// header/footer are fully-rendered markup (real static HTML, not a JS mount point).
export function page({ title, description, categories, activePath = "", bodyMain, extraScripts = [] }) {
  const scripts = extraScripts.map((s) => `<script src="${s}"></script>`).join("\n");
  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
${description ? `<meta name="description" content="${description}">` : ""}
<link rel="icon" href="/assets/favicon/favicon-32x32.png" sizes="32x32">
<link rel="apple-touch-icon" href="/assets/favicon/apple-touch-icon.png">
<link rel="stylesheet" href="/css/styles.css">
</head>
<body>
${renderHeader(categories, activePath)}
${bodyMain}
${renderFooter()}
${scripts}
</body>
</html>
`;
}
