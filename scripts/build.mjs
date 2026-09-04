// Static-site generator for the Dolphin House clone.
// Replaces runtime JS templating (js/common.js, js/shop.js, js/product.js) with
// real static HTML written at build time, using clean (extensionless, trailing-slash)
// URLs that mirror dolphinhouse.vn's actual permalink structure.
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDataFile } from "./lib/load-data.mjs";
import { page, productCardHtml, formatVnd, categoryUrl, shopSidebarHtml } from "./lib/partials.mjs";
import { buildBlogListing, buildBlogPosts, buildGioiThieu, buildLienHe, buildVideos, buildSimplePage } from "./lib/blog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIRS = [
  "cua-hang",
  "danh-muc",
  "san-pham",
  "tin-tuc",
  "videos",
  "gioi-thieu",
  "lien-he",
  "ho-tro-khach-hang",
  "hinh-thuc-thanh-toan",
  "hinh-thuc-van-chuyen",
]; // regenerated fresh every build
const { BLOG_POSTS } = loadDataFile(join(ROOT, "js/data/blog.data.js"));

const { PRODUCTS } = loadDataFile(join(ROOT, "js/data/products.data.js"));
const { CATEGORIES } = loadDataFile(join(ROOT, "js/data/categories.data.js"));
const { HOME_HERO_MENU, HOME_BRANDS, HOME_BLOCKS } = loadDataFile(join(ROOT, "js/data/home-new.data.js"));
const { CATEGORY_META } = loadDataFile(join(ROOT, "js/data/category-meta.data.js"));

const PER_PAGE = 16;

function write(relPath, html) {
  const full = join(ROOT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, html);
}

function legacyHref(href) {
  if (href === "index.html") return "/";
  if (href === "cua-hang.html") return "/cua-hang/";
  let m = href.match(/^danh-muc\.html\?slug=(.+)$/);
  if (m) {
    const cat = CATEGORIES.find((c) => c.slug === m[1]);
    return cat ? categoryUrl(cat, CATEGORIES) : `/danh-muc/${m[1]}/`;
  }
  m = href.match(/^san-pham\.html\?slug=(.+)$/);
  if (m) return `/san-pham/${m[1]}/`;
  return href;
}

function getCategoryDescendantSlugs(slug) {
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return [slug];
  const children = CATEGORIES.filter((c) => c.parent === cat.id).map((c) => c.slug);
  return [slug, ...children];
}

function productsForCategory(slug) {
  const slugs = getCategoryDescendantSlugs(slug);
  return PRODUCTS.filter((p) => p.categories.some((c) => slugs.includes(c.slug)));
}

// ---------- Home page ----------
function buildHome() {
  const retailMenu = HOME_HERO_MENU.map(
    (m) => `
    <a class="dh-home-retail-menu-item" href="/danh-muc/${m.slug}/">
      <span class="dh-home-retail-menu-index">${m.n}</span>
      <span class="dh-home-retail-menu-copy"><strong>${m.t}</strong><small>${m.s}</small></span>
      <span class="dh-home-retail-menu-arrow">→</span>
    </a>`
  ).join("");

  const brandsGrid = HOME_BRANDS.map(
    (b) => `<a class="dh-home-brand-link" href="/cua-hang/"><strong>${b.t}</strong><small>${b.s}</small></a>`
  ).join("");

  const blocks = HOME_BLOCKS.map(
    (blk) => `
    <section class="dh-home-category-block">
      <div class="dh-home-shelf-heading">
        <h2>${blk.title}</h2>
        <a href="${legacyHref(blk.more)}">Xem thêm →</a>
      </div>
      <div class="dh-home-shelf-body">
        <aside class="dh-home-shelf-subcategories">
          <span class="dh-home-shelf-subcategories-title">${blk.sideTitle}</span>
          <div class="dh-home-shelf-subcategories-list">
            ${blk.links.map((l) => `<a href="${legacyHref(l.href)}">${l.t}</a>`).join("")}
          </div>
        </aside>
        <div class="dh-home-shelf-products">
          ${blk.items.map((p) => `
          <a class="dh-home-category-product" href="/san-pham/${p.slug}/">
            <img src="${p.img}" alt="${p.title.replace(/"/g, "&quot;")}" loading="lazy">
            <span class="dh-home-category-product-body">
              <strong>${p.title}</strong>
              ${p.del ? `<del>${p.del}</del>` : ""}
              <span class="dh-home-category-product-price">${p.price}</span>
            </span>
          </a>`).join("")}
        </div>
      </div>
    </section>`
  ).join("");

  const bodyMain = `
<main>
  <div class="container">
    <div class="dh-home-head">
      <div>
        <h1>Dolphin House – Gia dụng thông minh cho gia đình hiện đại</h1>
        <p>Khám phá các nhóm sản phẩm được chọn lọc cho căn bếp, việc nhà và không gian sống — mỗi danh mục có lối đi riêng để bạn tìm nhanh hơn.</p>
      </div>
      <a class="link-arrow" href="/cua-hang/">Xem toàn bộ cửa hàng →</a>
    </div>

    <section class="dh-home-retail-top">
      <div class="dh-home-retail-menu">
        <div class="dh-home-retail-menu-head">
          <small>Khám phá Dolphin House</small>
          <strong>Chọn theo nhu cầu của gia đình</strong>
        </div>
        <div class="dh-home-retail-menu-list">${retailMenu}</div>
      </div>
      <div class="dh-home-retail-hero">
        <div class="dh-home-retail-hero-media">
          <img src="https://dolphinhouse.vn/wp-content/uploads/2026/09/joseph-rack-851690-grounded.webp" alt="Góc bếp gọn gàng với đồ gia dụng Dolphin House" loading="eager">
        </div>
        <div class="dh-home-retail-hero-copy">
          <small>Góc chọn đồ của Dolphin House</small>
          <h2>Nhà gọn hơn, mỗi ngày nhẹ hơn</h2>
          <p>Từ căn bếp đến góc phòng khách, những món đồ được chọn vì công dụng thật và cảm giác dùng dễ chịu.</p>
          <a href="/cua-hang/">Xem toàn bộ sản phẩm →</a>
        </div>
      </div>
    </section>

    <section class="dh-home-brands">
      <div class="dh-home-brands-head">
        <div>
          <strong>Thương hiệu được chọn lọc</strong>
          <span>Những cái tên quen thuộc trong căn bếp và không gian sống của gia đình.</span>
        </div>
        <a class="link-arrow" href="/cua-hang/">Xem tất cả sản phẩm →</a>
      </div>
      <div class="dh-home-brands-grid">${brandsGrid}</div>
    </section>

    <div id="home-blocks">${blocks}</div>
  </div>
</main>`;

  write(
    "index.html",
    page({
      title: "Dolphin House | Gia Dụng Thông Minh Cao Cấp Cho Gia Đình Hiện Đại",
      description: "Dolphin House chọn lọc đồ gia dụng thông minh, thiết bị bếp, điện gia dụng và tiện ích nhà cửa cho gia đình hiện đại.",
      categories: CATEGORIES,
      activePath: "/",
      bodyMain,
      extraScripts: ["/js/site.js"],
    })
  );
}

// ---------- Listing (shop + category), with static pagination ----------
function paginationHtml(basePath, totalPages, currentPage) {
  if (totalPages <= 1) return "";
  const pageHref = (p) => (p === 1 ? basePath : `${basePath}page/${p}/`);
  let html = "";
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
      html += p === currentPage ? `<span class="current">${p}</span>` : `<a href="${pageHref(p)}">${p}</a>`;
    } else if (html.slice(-10).indexOf("…") === -1) {
      html += `<span>…</span>`;
    }
  }
  if (currentPage < totalPages) html += `<a href="${pageHref(currentPage + 1)}">→</a>`;
  return html;
}

// basePath must end with "/". Emits one static page per pagination page.
// `banner`/`description` are real per-category content — most categories have
// neither on the live site (only heading + product grid), which is faithfully
// reproduced here rather than filled in with invented copy.
function buildListing({ basePath, title, description, banner, activePath, products, breadcrumbCurrent, breadcrumbHref, breadcrumbHrefLabel, embedJsonId }) {
  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
    const start = (currentPage - 1) * PER_PAGE;
    const pageItems = products.slice(start, start + PER_PAGE);
    const from = products.length === 0 ? 0 : start + 1;
    const to = Math.min(start + PER_PAGE, products.length);

    const grid = pageItems.length
      ? `<div class="product-grid" id="product-listing">${pageItems.map(productCardHtml).join("")}</div>`
      : `<p class="empty-state" id="empty-msg">Không tìm thấy sản phẩm phù hợp. <a class="link-arrow" href="/cua-hang/">Xem tất cả sản phẩm →</a></p>`;

    const breadcrumb = breadcrumbHref
      ? `<a href="/">Trang chủ</a> / <a href="${breadcrumbHref}">${breadcrumbHrefLabel}</a> / <span>${breadcrumbCurrent}</span>`
      : `<a href="/">Trang chủ</a> / ${breadcrumbCurrent}`;

    const bodyMain = `
<main class="container listing-page">
  <nav class="breadcrumb">${breadcrumb}</nav>
  ${banner ? `<div class="listing-banner"><img src="${banner}" alt="Banner danh mục ${title}" loading="eager"></div>` : ""}
  <div class="listing-layout">
    <div class="listing-main">
      <h1 class="listing-title">${title}</h1>
      ${description ? `<div class="listing-description">${description}</div>` : ""}
      <div class="shop-toolbar">
        <p id="result-count">Hiển thị ${from}–${to} của ${products.length} sản phẩm</p>
        <select id="sort-select">
          <option value="default">Sắp xếp mặc định</option>
          <option value="latest">Sắp xếp theo mới nhất</option>
          <option value="price-asc">Sắp xếp theo giá: thấp đến cao</option>
          <option value="price-desc">Sắp xếp theo giá: cao đến thấp</option>
        </select>
      </div>
      <div id="listing-dynamic" data-base="${basePath}" data-page="${currentPage}">
      ${grid}
      <nav class="pagination" id="pagination">${paginationHtml(basePath, totalPages, currentPage)}</nav>
      </div>
    </div>
    ${shopSidebarHtml()}
  </div>
</main>
<script type="application/json" id="${embedJsonId}">${JSON.stringify(products.map(compactProduct))}</script>`;

    const outPath = currentPage === 1 ? `${basePath}index.html` : `${basePath}page/${currentPage}/index.html`;
    write(
      outPath.replace(/^\//, ""),
      page({
        title: `${title} | Dolphin House`,
        description: typeof description === "string" ? description.replace(/<[^>]+>/g, "").slice(0, 160) : description,
        categories: CATEGORIES,
        activePath,
        bodyMain,
        extraScripts: ["/js/site.js", "/js/listing.js"],
      })
    );
  }
}

// Trimmed fields the client-side sort re-render actually needs (keeps the
// embedded JSON small instead of shipping full WooCommerce payloads).
function compactProduct(p) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    img: p.images[0] ? p.images[0].src : "",
    price: p.prices.price,
    regular_price: p.prices.regular_price,
    on_sale: p.on_sale,
  };
}

function buildShop() {
  buildListing({
    basePath: "/cua-hang/",
    title: "Cửa hàng gia dụng thông minh",
    description: "Khám phá đồ gia dụng thông minh, thiết bị bếp, điện gia dụng và tiện ích nhà cửa được Dolphin House chọn lọc cho gia đình hiện đại.",
    activePath: "/cua-hang/",
    products: PRODUCTS,
    breadcrumbCurrent: "Cửa hàng gia dụng thông minh",
    embedJsonId: "listing-data",
  });
}

function buildCategories() {
  for (const cat of CATEGORIES) {
    const products = productsForCategory(cat.slug);
    const meta = CATEGORY_META[cat.slug] || {};
    const parent = cat.parent !== 0 ? CATEGORIES.find((c) => c.id === cat.parent) : null;
    buildListing({
      basePath: categoryUrl(cat, CATEGORIES),
      title: cat.name,
      description: meta.description || null,
      banner: meta.banner || null,
      activePath: "/danh-muc/",
      products,
      breadcrumbCurrent: cat.name,
      breadcrumbHref: parent ? categoryUrl(parent, CATEGORIES) : undefined,
      breadcrumbHrefLabel: parent ? parent.name : undefined,
      embedJsonId: "listing-data",
    });
  }
}

// ---------- Product detail ----------
const TRUST_LIST_ITEMS = [
  { icon: 1, html: "Giao hàng trên toàn quốc" },
  { icon: 2, html: "Đổi trả trong 15 ngày nếu lỗi kỹ thuật" },
  { icon: 3, html: "Thanh toán tại nhà hoặc qua thẻ" },
  { icon: 4, html: "Tổng CSKH 8h30 - 18h00<br><strong>086 639 3892</strong>" },
  { icon: 4, html: "Kinh doanh<br><strong>086 639 3892<br>0378 840 450</strong>" },
  { icon: 4, html: "Kỹ thuật<br><strong>086 639 3892</strong>" },
  { icon: 5, html: "Lắp đặt tại các thành phố lớn" },
];

function trustListHtml() {
  return `
  <aside class="chinh-sach-cua-shop">
    <ul>
      ${TRUST_LIST_ITEMS.map(
        (it) => `<li class="has-icon"><div class="chinhsach-icon"><img src="/assets/images/site/policy-icons/icon-policy-${it.icon}.png" alt="" width="42" height="42"></div><div class="chinhsach-content">${it.html}</div></li>`
      ).join("")}
    </ul>
  </aside>`;
}

function buildProducts() {
  for (const product of PRODUCTS) {
    const cat = product.categories[0];
    const catFull = cat ? CATEGORIES.find((c) => c.slug === cat.slug) : null;
    const catHref = catFull ? categoryUrl(catFull, CATEGORIES) : null;
    const isSale = product.on_sale && product.prices.regular_price !== product.prices.price;
    const priceHtml = isSale
      ? `<span class="price-old">${formatVnd(product.prices.regular_price)}</span> ${formatVnd(product.prices.price)}`
      : formatVnd(product.prices.price);
    const images = product.images.length ? product.images : [{ src: "", alt: product.name }];

    const related = PRODUCTS.filter(
      (p) => p.slug !== product.slug && p.categories.some((c) => cat && c.slug === cat.slug)
    ).slice(0, 4);
    const fallback = related.length ? related : PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 4);

    const bodyMain = `
<main class="container">
  <nav class="breadcrumb">
    <a href="/">Trang chủ</a>${catHref ? ` / <a href="${catHref}">${cat.name}</a>` : ""} / <span>${product.name}</span>
  </nav>
  <div id="product-root">
    <div class="product-detail">
      <div>
        <div class="gallery-main"><img id="gallery-main-img" src="${images[0].src}" alt="${images[0].alt}"></div>
        <div class="gallery-thumbs" id="gallery-thumbs">
          ${images.map((im, i) => `<img src="${im.thumbnail || im.src}" data-full="${im.src}" alt="${im.alt}" class="${i === 0 ? "active" : ""}">`).join("")}
        </div>
      </div>

      <div class="summary">
        <h1>${product.name}</h1>
        <button class="copy-name-btn" id="copy-name-btn" data-name="${product.name.replace(/"/g, "&quot;")}">Sao chép tên</button>
        <div class="price-block">${priceHtml}</div>
        <div class="short-desc">${product.short_description || ""}</div>
        <div class="qty-row">
          <div class="qty-input">
            <button type="button" id="qty-minus">-</button>
            <input type="text" id="qty-value" value="1">
            <button type="button" id="qty-plus">+</button>
          </div>
          <button class="btn-purple" id="add-to-cart-btn" data-name="${product.name.replace(/"/g, "&quot;")}">Thêm vào giỏ hàng</button>
          <button class="btn-gray">Liên hệ</button>
        </div>
        <a class="btn-orange" href="tel:0866393892">
          MUA NGAY
          <small>Gọi điện xác nhận và giao hàng tận nơi</small>
        </a>
        <div class="summary-meta">
          ${product.sku ? `<div>SKU: <strong>${product.sku}</strong></div>` : ""}
          ${catHref ? `<div>Danh mục: <a href="${catHref}">${cat.name}</a></div>` : ""}
          ${product.brand_names.length ? `<div>Thương hiệu: ${product.brand_names.join(", ")}</div>` : ""}
        </div>
        <button class="chat-fb-btn" type="button">💬 Chat Facebook tư vấn — phản hồi nhanh</button>
      </div>

      ${trustListHtml()}
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
      <div class="product-grid" id="related-grid">${fallback.map(productCardHtml).join("")}</div>
    </section>
  </div>
</main>`;

    write(
      `san-pham/${product.slug}/index.html`,
      page({
        title: `${product.name} | Dolphin House`,
        categories: CATEGORIES,
        bodyMain,
        extraScripts: ["/js/site.js", "/js/product-interactive.js"],
      })
    );
  }
}

function clean() {
  for (const d of [...OUT_DIRS, ...BLOG_POSTS.map((p) => p.slug)]) {
    const full = join(ROOT, d);
    if (existsSync(full)) rmSync(full, { recursive: true, force: true });
  }
}

clean();
buildHome();
buildShop();
buildCategories();
buildProducts();
buildBlogListing(write, CATEGORIES);
buildBlogPosts(write, CATEGORIES);
buildGioiThieu(write, CATEGORIES);
buildLienHe(write, CATEGORIES);
buildVideos(write, CATEGORIES);
buildSimplePage(write, CATEGORIES, {
  slug: "ho-tro-khach-hang",
  title: "Hỗ trợ khách hàng | Dolphin House",
  bodyFile: "ho-tro-khach-hang.body.html",
});
buildSimplePage(write, CATEGORIES, {
  slug: "hinh-thuc-thanh-toan",
  title: "Hình thức thanh toán | Dolphin House",
  bodyFile: "hinh-thuc-thanh-toan.body.html",
});
buildSimplePage(write, CATEGORIES, {
  slug: "hinh-thuc-van-chuyen",
  title: "Chính sách vận chuyển | Dolphin House",
  bodyFile: "hinh-thuc-van-chuyen.body.html",
});

console.log(
  `Built: 1 home + shop (+pagination) + ${CATEGORIES.length} categories (+pagination) + ${PRODUCTS.length} products + tin-tuc (+${BLOG_POSTS.length} posts) + gioi-thieu + lien-he + videos (+2) + 3 policy pages`
);
