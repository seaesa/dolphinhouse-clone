// Shared listing logic for cua-hang.html (all products) and danh-muc.html (filtered by category).
// Reads state from the query string: ?slug=<category>&q=<search>&sort=<key>&paged=<n>

const PER_PAGE = 16;

function getCategoryDescendantSlugs(slug) {
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return [slug];
  const children = CATEGORIES.filter((c) => c.parent === cat.id).map((c) => c.slug);
  return [slug, ...children];
}

function filterProducts({ categorySlug, query }) {
  let list = PRODUCTS.slice();
  if (categorySlug) {
    const slugs = getCategoryDescendantSlugs(categorySlug);
    list = list.filter((p) => p.categories.some((c) => slugs.includes(c.slug)));
  }
  if (query) {
    const q = query.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q));
  }
  return list;
}

function sortProducts(list, sortKey) {
  const arr = list.slice();
  switch (sortKey) {
    case "price-asc":
      return arr.sort((a, b) => Number(a.prices.price) - Number(b.prices.price));
    case "price-desc":
      return arr.sort((a, b) => Number(b.prices.price) - Number(a.prices.price));
    case "latest":
      return arr.sort((a, b) => b.id - a.id);
    default:
      return arr;
  }
}

function renderListing(opts) {
  const categorySlug = opts.categorySlug || null;
  const query = qs("q") || "";
  const sortKey = qs("sort") || "default";
  const page = Math.max(1, parseInt(qs("paged") || "1", 10));

  const filtered = sortProducts(filterProducts({ categorySlug, query }), sortKey);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PER_PAGE;
  const pageItems = filtered.slice(start, start + PER_PAGE);

  const grid = document.getElementById("product-listing");
  const countEl = document.getElementById("result-count");
  const titleEl = document.getElementById("listing-title");
  const descEl = document.getElementById("listing-desc");

  if (categorySlug) {
    const cat = CATEGORIES.find((c) => c.slug === categorySlug);
    if (cat) {
      titleEl.textContent = cat.name;
      descEl.textContent = `Khám phá ${cat.count} sản phẩm thuộc nhóm ${cat.name} được Dolphin House chọn lọc.`;
    } else {
      titleEl.textContent = "Không tìm thấy danh mục";
      descEl.textContent = "";
    }
  }

  if (query) {
    countEl.textContent = `Kết quả tìm kiếm cho “${query}” — ${total} sản phẩm`;
  } else {
    const from = total === 0 ? 0 : start + 1;
    const to = Math.min(start + PER_PAGE, total);
    countEl.textContent = `Hiển thị ${from}–${to} của ${total} sản phẩm`;
  }

  if (pageItems.length === 0) {
    grid.innerHTML = "";
    grid.insertAdjacentHTML(
      "afterend",
      '<p class="empty-state" id="empty-msg">Không tìm thấy sản phẩm phù hợp. <a class="link-arrow" href="cua-hang.html">Xem tất cả sản phẩm →</a></p>'
    );
  } else {
    const old = document.getElementById("empty-msg");
    if (old) old.remove();
    grid.innerHTML = pageItems.map(productCardHtml).join("");
  }

  renderPagination(totalPages, currentPage);
  renderCategoryChips(categorySlug);

  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) sortSelect.value = sortKey;
}

function renderPagination(totalPages, currentPage) {
  const el = document.getElementById("pagination");
  if (!el) return;
  if (totalPages <= 1) {
    el.innerHTML = "";
    return;
  }
  const params = new URLSearchParams(window.location.search);
  function linkFor(p) {
    params.set("paged", p);
    return "?" + params.toString();
  }
  let html = "";
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
      html += p === currentPage
        ? `<span class="current">${p}</span>`
        : `<a href="${linkFor(p)}">${p}</a>`;
    } else if (html.slice(-10).indexOf("…") === -1) {
      html += `<span>…</span>`;
    }
  }
  if (currentPage < totalPages) html += `<a href="${linkFor(currentPage + 1)}">→</a>`;
  el.innerHTML = html;
}

function renderCategoryChips(activeSlug) {
  const el = document.getElementById("category-chips");
  if (!el) return;
  const roots = CATEGORIES.filter((c) => c.parent === 0);
  el.innerHTML = roots
    .map(
      (c) =>
        `<a class="${c.slug === activeSlug ? "active" : ""}" href="danh-muc.html?slug=${c.slug}">${c.name}</a>`
    )
    .join("");
}

function bindSortHandler() {
  const sel = document.getElementById("sort-select");
  if (!sel) return;
  sel.addEventListener("change", () => {
    const params = new URLSearchParams(window.location.search);
    params.set("sort", sel.value);
    params.delete("paged");
    window.location.search = params.toString();
  });
}
