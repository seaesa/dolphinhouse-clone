// Generates /tin-tuc/, /gioi-thieu/, /lien-he/, /videos/(+2 posts), and the 5
// top-level blog post pages (dolphinhouse.vn uses flat slugs for posts, not
// nested under /tin-tuc/ — matched here exactly).
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { page } from "./partials.mjs";
import { loadDataFile } from "./load-data.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const DATA_DIR = join(ROOT, "scripts/data");

const { BLOG_POSTS, BLOG_LISTING_SLUGS, BLOG_CATEGORIES_WIDGET, BLOG_TAGS_WIDGET, VIDEOS } = loadDataFile(
  join(ROOT, "js/data/blog.data.js")
);

function readBody(file) {
  return readFileSync(join(DATA_DIR, file), "utf8");
}

function sidebarCategoriesTags() {
  return `
  <aside class="blog-sidebar">
    <form class="blog-search" action="/tin-tuc/" method="get"><input type="search" placeholder="Tìm kiếm tin tức"><button type="submit">Tìm kiếm</button></form>
    <div class="widget">
      <div class="title-sidebar">Danh mục tin tức</div>
      <ul class="widget-list">${BLOG_CATEGORIES_WIDGET.map((c) => `<li><a href="#">${c.name} (${c.count})</a></li>`).join("")}</ul>
    </div>
    <div class="widget">
      <div class="title-sidebar">Từ khóa</div>
      <div class="tagcloud">${BLOG_TAGS_WIDGET.map((t) => `<a href="#">${t}</a>`).join("")}</div>
    </div>
  </aside>`;
}

function sidebarRecentPosts() {
  const items = BLOG_POSTS.map(
    (p) => `
    <li><a class="link_recent_thumb" href="/${p.slug}/"><img src="${p.heroImg}" alt="${p.title}"></a>
      <div><a href="/${p.slug}/">${p.title}</a><small>${p.date}</small></div>
    </li>`
  ).join("");
  return `
  <aside class="blog-sidebar">
    <div class="widget">
      <div class="title-sidebar">Tin tức mới</div>
      <ul class="widget-list recent-posts">${items}</ul>
    </div>
  </aside>`;
}

function postCardHtml(p) {
  return `
  <article class="blog-card">
    <a class="blog-card-thumb" href="/${p.slug}/"><img src="${p.heroImg}" alt="${p.title}" loading="lazy"></a>
    <div class="blog-card-body">
      <a class="blog-card-title" href="/${p.slug}/">${p.title}</a>
      <div class="blog-card-date">Ngày cập nhật <strong>${p.date}</strong></div>
      ${p.excerpt ? `<p class="blog-card-excerpt">${p.excerpt}</p>` : ""}
    </div>
  </article>`;
}

function relatedPostsHtml(currentSlug) {
  const related = BLOG_POSTS.filter((p) => p.slug !== currentSlug).slice(0, 3);
  return `
  <div class="relatedcat">
    <div class="section-title"><span>Có thể bạn quan tâm</span></div>
    <div class="related-grid">
      ${related.map((p) => `
      <a class="related-item" href="/${p.slug}/">
        <img src="${p.heroImg}" alt="${p.title}" loading="lazy">
        <span>${p.title}</span>
        <small>${p.date}</small>
      </a>`).join("")}
    </div>
  </div>`;
}

export function buildBlogListing(write, categories) {
  const cards = BLOG_LISTING_SLUGS.map((slug) => BLOG_POSTS.find((p) => p.slug === slug)).map(postCardHtml).join("");
  const bodyMain = `
<main class="container blog-page">
  <nav class="breadcrumb"><a href="/">Trang chủ</a> / Tin tức &amp; Kinh nghiệm gia dụng</nav>
  <div class="blog-hero">
    <small>GÓC CHUYÊN GIA DOLPHIN HOUSE</small>
    <h2>Kinh nghiệm chọn đồ gia dụng cho gia đình hiện đại</h2>
    <p>Tư vấn chọn mua &nbsp;•&nbsp; Mẹo sử dụng &nbsp;•&nbsp; Không gian sống tiện nghi</p>
  </div>
  <div class="blog-layout">
    <div class="blog-main">
      <div class="blog-section-title"><span>GÓC CHUYÊN GIA DOLPHIN HOUSE</span><h1>Tin tức &amp; Kinh nghiệm gia dụng</h1></div>
      <div class="blog-grid">${cards}</div>
    </div>
    ${sidebarCategoriesTags()}
  </div>
</main>`;
  write(
    "tin-tuc/index.html",
    page({
      title: "Tin tức & Kinh nghiệm gia dụng | Dolphin House",
      description: "Góc chuyên gia Dolphin House: kinh nghiệm chọn đồ gia dụng, mẹo chăm sóc không gian sống và tư vấn nhà thông minh.",
      categories,
      activePath: "/tin-tuc/",
      bodyMain,
      extraScripts: ["/js/site.js"],
    })
  );
}

export function buildBlogPosts(write, categories) {
  for (let i = 0; i < BLOG_POSTS.length; i++) {
    const p = BLOG_POSTS[i];
    const prev = BLOG_POSTS[i + 1];
    const next = BLOG_POSTS[i - 1];
    const bodyMain = `
<main class="container blog-page">
  <nav class="breadcrumb"><a href="/">Trang chủ</a> / <a href="/tin-tuc/">Góc Chuyên Gia</a> / ${p.title}</nav>
  <div class="blog-layout">
    <article class="blog-main blog-post">
      <header class="blog-post-header">
        <h1>${p.title}</h1>
        <div class="post-info"><span>${p.date}</span><span>${p.views}</span></div>
      </header>
      <div class="tinymce">${readBody(p.bodyFile)}</div>
      <nav class="post-navigation">
        ${prev ? `<a class="nav-prev" href="/${prev.slug}/"><small>Bài trước</small>${prev.title}</a>` : "<span></span>"}
        ${next ? `<a class="nav-next" href="/${next.slug}/"><small>Bài tiếp</small>${next.title}</a>` : ""}
      </nav>
      ${relatedPostsHtml(p.slug)}
    </article>
    ${sidebarCategoriesTags()}
  </div>
</main>`;
    write(
      `${p.slug}/index.html`,
      page({
        title: `${p.title} | Dolphin House`,
        categories,
        activePath: "/tin-tuc/",
        bodyMain,
        extraScripts: ["/js/site.js"],
      })
    );
  }
}

export function buildGioiThieu(write, categories) {
  const bodyMain = `
<main class="container blog-page">
  <nav class="breadcrumb"><a href="/">Trang chủ</a> / Về Dolphin House</nav>
  <div class="blog-layout blog-layout--narrow-sidebar">
    ${sidebarRecentPosts(categories)}
    <article class="blog-main page-article">
      <h1 class="page-title">Về Dolphin House</h1>
      <div class="tinymce">${readBody("gioithieu.body.html")}</div>
    </article>
  </div>
</main>`;
  write(
    "gioi-thieu/index.html",
    page({
      title: "Về Dolphin House | Câu Chuyện Thương Hiệu Gia Dụng Thông Minh",
      categories,
      activePath: "/gioi-thieu/",
      bodyMain,
      extraScripts: ["/js/site.js"],
    })
  );
}

export function buildLienHe(write, categories) {
  const bodyMain = `
<main class="container blog-page">
  <nav class="breadcrumb"><a href="/">Trang chủ</a> / Liên hệ</nav>
  <div class="blog-layout blog-layout--narrow-sidebar">
    ${sidebarRecentPosts(categories)}
    <article class="blog-main page-article">
      <h1 class="page-title">Liên hệ</h1>
      <div class="tinymce">
        <h2>Liên hệ Dolphin House</h2>
        <p><strong>Dolphin House</strong> tư vấn đồ gia dụng thông minh, tiện ích cao cấp và điện gia dụng cho gia đình hiện đại.</p>
        <p><strong>Địa chỉ:</strong> S219 Đại Dương 8, Vinhomes Ocean Park, Gia Lâm, Hà Nội</p>
        <p><strong>Hotline:</strong> 086 639 3892</p>
        <p><strong>Email:</strong> dolphinhouse.vn@gmail.com</p>
        <p><strong>Thời gian hỗ trợ:</strong> 8h30 – 21h30 hằng ngày</p>
        <p>Hãy để lại nhu cầu của bạn: sản phẩm quan tâm, ngân sách dự kiến, không gian sử dụng hoặc vấn đề cần giải quyết. Dolphin House sẽ tư vấn theo nhu cầu thật của gia đình.</p>
      </div>
      <form class="contact-form" id="contact-form">
        <div class="contact-form-row">
          <input type="text" placeholder="Họ và tên" required>
          <input type="tel" placeholder="Số điện thoại" required>
        </div>
        <input type="email" placeholder="Email" required>
        <textarea rows="6" placeholder="Tin nhắn"></textarea>
        <button type="submit">Gửi</button>
      </form>
    </article>
  </div>
</main>`;
  write(
    "lien-he/index.html",
    page({
      title: "Liên Hệ Dolphin House | Tư Vấn Đồ Gia Dụng Thông Minh",
      categories,
      activePath: "/lien-he/",
      bodyMain,
      extraScripts: ["/js/site.js", "/js/contact-form.js"],
    })
  );
}

// Generic "simple content page" builder for the small policy/help pages
// (Hỗ trợ khách hàng, Hình thức thanh toán, Chính sách vận chuyển) — same
// title-page + tinymce + recent-posts-sidebar layout as Giới thiệu/Liên hệ.
export function buildSimplePage(write, categories, { slug, title, bodyFile }) {
  const bodyMain = `
<main class="container blog-page">
  <nav class="breadcrumb"><a href="/">Trang chủ</a> / ${title.split(" | ")[0]}</nav>
  <div class="blog-layout blog-layout--narrow-sidebar">
    ${sidebarRecentPosts()}
    <article class="blog-main page-article">
      <h1 class="page-title">${title.split(" | ")[0]}</h1>
      <div class="tinymce">${readBody(bodyFile)}</div>
    </article>
  </div>
</main>`;
  write(
    `${slug}/index.html`,
    page({
      title,
      categories,
      bodyMain,
      extraScripts: ["/js/site.js"],
    })
  );
}

export function buildVideos(write, categories) {
  const cards = VIDEOS.map(
    (v) => `
    <article class="video-card">
      <a href="/videos/${v.slug}/" class="video-card-thumb"><img src="${v.thumb}" alt="${v.title}" loading="lazy"><span class="play-btn">▶</span></a>
      <h2><a href="/videos/${v.slug}/">${v.title}</a></h2>
      <div class="post-info"><span>${v.date}</span></div>
    </article>`
  ).join("");

  write(
    "videos/index.html",
    page({
      title: "Videos - Dolphin House",
      categories,
      activePath: "/videos/",
      bodyMain: `
<main class="container blog-page">
  <nav class="breadcrumb"><a href="/">Trang chủ</a> / Videos</nav>
  <div class="blog-layout">
    <div class="blog-main">
      <h1 class="page-title">Videos</h1>
      <div class="video-grid">${cards}</div>
    </div>
    ${sidebarCategoriesTags()}
  </div>
</main>`,
      extraScripts: ["/js/site.js"],
    })
  );

  for (let i = 0; i < VIDEOS.length; i++) {
    const v = VIDEOS[i];
    const other = VIDEOS[(i + 1) % VIDEOS.length];
    write(
      `videos/${v.slug}/index.html`,
      page({
        title: `${v.title} - Dolphin House`,
        categories,
        activePath: "/videos/",
        bodyMain: `
<main class="container blog-page">
  <nav class="breadcrumb"><a href="/">Trang chủ</a> / <a href="/videos/">Videos</a> / ${v.title}</nav>
  <div class="blog-layout">
    <article class="blog-main blog-post">
      <header class="blog-post-header">
        <h1>${v.title}</h1>
        <div class="post-info"><span>${v.date}</span><span>${v.views}</span></div>
      </header>
      <div class="tinymce"><div class="video-embed"><iframe src="https://www.youtube.com/embed/${v.youtube}" title="${v.title}" frameborder="0" allowfullscreen></iframe></div></div>
      <nav class="post-navigation">
        <a class="nav-next" href="/videos/${other.slug}/"><small>Video khác</small>${other.title}</a>
      </nav>
    </article>
    ${sidebarCategoriesTags()}
  </div>
</main>`,
        extraScripts: ["/js/site.js"],
      })
    );
  }
}
