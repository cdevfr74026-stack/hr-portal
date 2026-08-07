/* ======================================================================
   HR 作業中心 — Render Layer
   ----------------------------------------------------------------------
   Pure functions that turn HR_DATA into HTML strings. No routing logic
   here — router.js decides *which* of these to call and where to mount
   the result.
   ====================================================================== */

const Render = (() => {

  function esc(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function findCategory(catId) {
    return HR_DATA.categories.find(c => c.id === catId) || null;
  }
  function findCard(catId, cardId) {
    const cat = findCategory(catId);
    if (!cat) return null;
    const card = cat.cards.find(c => c.id === cardId);
    return card ? { cat, card } : null;
  }

  /* ---------------- Sidebar ---------------- */
  function sidebar(activeCatId) {
    const links = HR_DATA.categories.map(cat => `
      <a class="sidebar-link ${cat.id === activeCatId ? "is-active" : ""}" href="#/category/${cat.id}">
        <span class="icon">${cat.icon}</span><span class="label">${esc(cat.name)}</span>
      </a>`).join("");

    return `
      <div class="sidebar-brand">
        <div class="sidebar-brand-mark">HR</div>
        <div class="sidebar-brand-text">HR 作業中心</div>
      </div>
      <button class="sidebar-collapse-btn" id="sidebarCollapseBtn" aria-label="收合側邊欄" title="收合／展開側邊欄">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 4L15 12L9 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <nav class="sidebar-nav">
        <a class="sidebar-link ${!activeCatId ? "is-active" : ""}" href="#/">
          <span class="icon">🏠</span><span class="label">首頁</span>
        </a>
        <div class="sidebar-nav-divider"></div>
        ${links}
      </nav>
      <div class="sidebar-footer">HR 作業中心 · 內部版</div>
    `;
  }

  /* ---------------- Breadcrumb ---------------- */
  function breadcrumb(parts) {
    // parts: [{label, href}] — last item has no href (current page)
    return `<nav class="breadcrumb" aria-label="Breadcrumb">` + parts.map((p, i) => {
      const isLast = i === parts.length - 1;
      const sep = i > 0 ? `<span class="sep">/</span>` : "";
      if (isLast) return `${sep}<span class="current">${esc(p.label)}</span>`;
      return `${sep}<a href="${p.href}">${esc(p.label)}</a>`;
    }).join("") + `</nav>`;
  }

  /* ---------------- Home ---------------- */
  function home() {
    const cards = HR_DATA.categories.map(cat => `
      <a class="category-card" href="#/category/${cat.id}">
        <div class="card-icon">${cat.icon}</div>
        <h3>${esc(cat.name)}</h3>
        <p>${esc(cat.tagline)}</p>
        <span class="card-arrow">前往查看
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </a>`).join("");

    return `
      <div class="hero">
        <div class="hero-eyebrow">HR Knowledge Portal</div>
        <h1 class="hero-title">HR 作業中心</h1>
        <p class="hero-subtitle">所有制度、流程與表單，都在這裡。找到你需要的 SOP，安心完成每一項作業。</p>
        <form class="search-bar" id="homeSearchForm" role="search">
          <span class="search-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </span>
          <input type="search" id="homeSearchInput" placeholder="搜尋制度、流程、SOP、表單..." aria-label="搜尋">
        </form>
        <p class="search-hint">試試看：績效面談、調薪、健檢、報到</p>
      </div>
      <div class="card-grid">${cards}</div>
    `;
  }

  /* ---------------- Category Page ---------------- */
  function category(catId) {
    const cat = findCategory(catId);
    if (!cat) return notFound();

    const cards = cat.cards.map(card => {
      const meta = cardMeta(card);
      const preview = cardPreview(card);
      return `
      <a class="sop-card" href="#/sop/${cat.id}/${card.id}">
        <div class="sop-card-top">
          <div class="card-icon">${card.icon}</div>
          <h4>${esc(card.title)}</h4>
        </div>
        ${preview.length
          ? `<ul class="sop-card-preview">${preview.map(p => `<li>${esc(p)}</li>`).join("")}</ul>`
          : `<p class="sop-card-empty">${esc(card.description)}</p>`}
        <div class="sop-card-footer">
          <span class="badge ${meta.badgeClass}">${meta.badgeLabel}</span>
          <span class="read-link">${meta.ctaLabel}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </div>
      </a>`;
    }).join("");

    return `
      ${breadcrumb([{ label: "首頁", href: "#/" }, { label: cat.name }])}
      <div class="page-header">
        <div class="cat-icon-lg">${cat.icon}</div>
        <h1>${esc(cat.name)}</h1>
        <p class="page-desc">${esc(cat.description)}</p>
      </div>
      <div class="card-grid">${cards}</div>
    `;
  }

  /* Short preview list shown on the category-page card, before drilling
     into the full detail page. sop → first steps' titles;
     downloads → file names; faq → the questions themselves. */
  function cardPreview(card) {
    const LIMIT = 4;
    if (card.type === "sop" && card.sop && card.sop.steps && card.sop.steps.length) {
      return card.sop.steps.slice(0, LIMIT).map(s => s.title);
    }
    if (card.type === "downloads" && card.downloads && card.downloads.length) {
      return card.downloads.slice(0, LIMIT).map(d => d.name.replace(/\.[a-zA-Z0-9]+$/, ""));
    }
    if (card.type === "faq" && card.faqs && card.faqs.length) {
      return card.faqs.slice(0, LIMIT).map(f => f.q);
    }
    return [];
  }

  function cardMeta(card) {
    if (card.type === "downloads") return { badgeClass: "badge-accent", badgeLabel: "表單", ctaLabel: "查看表單" };
    if (card.type === "faq") return { badgeClass: "badge-muted", badgeLabel: "FAQ", ctaLabel: "查看 FAQ" };
    if (card.sop) return { badgeClass: "badge-primary", badgeLabel: card.sop.version, ctaLabel: "查看流程" };
    return { badgeClass: "badge-muted", badgeLabel: "建置中", ctaLabel: "查看流程" };
  }

  /* ---------------- SOP / Card Detail Page ---------------- */
  function cardDetail(catId, cardId) {
    const found = findCard(catId, cardId);
    if (!found) return notFound();
    const { cat, card } = found;

    const crumbs = [{ label: "首頁", href: "#/" }, { label: cat.name, href: `#/category/${cat.id}` }, { label: card.title }];

    if (card.type === "downloads") {
      return `
        ${breadcrumb(crumbs)}
        <div class="page-header">
          <div class="cat-icon-lg">${card.icon}</div>
          <h1>${esc(card.title)}</h1>
          <p class="page-desc">${esc(card.description)}</p>
        </div>
        ${card.downloads && card.downloads.length ? downloadGrid(card.downloads) : emptyState("表單建置中", "此分類的表單尚未上傳，補充後將於此處顯示。")}
        ${feedbackStrip()}
      `;
    }

    if (card.type === "faq") {
      return `
        ${breadcrumb(crumbs)}
        <div class="page-header">
          <div class="cat-icon-lg">${card.icon}</div>
          <h1>${esc(card.title)}</h1>
          <p class="page-desc">${esc(card.description)}</p>
        </div>
        ${card.faqs && card.faqs.length ? accordionList(card.faqs, "faq") : emptyState("尚無常見問題", "此分類的 FAQ 尚未建置，補充後將於此處顯示。")}
        ${feedbackStrip()}
      `;
    }

    // type === 'sop'
    if (!card.sop) {
      return `
        ${breadcrumb(crumbs)}
        <div class="page-header">
          <div class="cat-icon-lg">${card.icon}</div>
          <h1>${esc(card.title)}</h1>
          <p class="page-desc">${esc(card.description)}</p>
        </div>
        ${emptyState("內容建置中", "這份 SOP 尚未撰寫完成，歡迎補充內容，架構已備妥可直接套用範本。")}
      `;
    }

    const sop = card.sop;
    return `
      ${breadcrumb(crumbs)}
      <div class="page-header">
        <div class="cat-icon-lg">${card.icon}</div>
        <h1>${esc(card.title)}</h1>
        <p class="page-desc">${esc(card.description)}</p>
        <div class="meta-row">
          <span class="badge badge-primary">版本 ${esc(sop.version)}</span>
          <span class="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/></svg>
            最後更新於 ${esc(sop.updatedDate)}
          </span>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title"><span class="num">1</span>流程說明</div>
        <div class="section-panel"><p>${esc(sop.summary)}</p></div>
      </div>

      ${sop.flow && sop.flow.length ? `
      <div class="doc-section">
        <div class="doc-section-title"><span class="num">2</span>流程圖</div>
        ${flowChart(sop.flow)}
      </div>` : ""}

      <div class="doc-section">
        <div class="doc-section-title"><span class="num">3</span>操作步驟</div>
        ${sop.steps.map((s, i) => stepCard(s, i + 1)).join("")}
      </div>

      ${sop.faqs && sop.faqs.length ? `
      <div class="doc-section">
        <div class="doc-section-title"><span class="num">4</span>FAQ</div>
        ${accordionList(sop.faqs, "faq")}
      </div>` : ""}

      ${sop.downloads && sop.downloads.length ? `
      <div class="doc-section">
        <div class="doc-section-title"><span class="num">5</span>附件下載</div>
        ${downloadGrid(sop.downloads)}
      </div>` : ""}

      ${sop.related && sop.related.length ? `
      <div class="doc-section">
        <div class="doc-section-title"><span class="num">6</span>相關制度</div>
        <div class="related-list">
          ${sop.related.map(r => `
            <a class="related-item" href="#/sop/${r.categoryId}/${r.cardId}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              ${esc(r.label)}
            </a>`).join("")}
        </div>
      </div>` : ""}

      <div class="doc-section">
        <div class="doc-section-title"><span class="num">7</span>版本紀錄</div>
        <div class="section-panel">
          <table class="version-table">
            <thead><tr><th>版本</th><th>日期</th><th>說明</th></tr></thead>
            <tbody>
              ${sop.versionHistory.map(v => `<tr><td>${esc(v.version)}</td><td>${esc(v.date)}</td><td>${esc(v.note)}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>

      ${feedbackStrip()}
    `;
  }

  function flowChart(steps) {
    const items = steps.map((s, i) => {
      const arrow = i < steps.length - 1 ? `
        <div class="flow-arrow">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>` : "";
      return `<div class="flow-step">${esc(s)}</div>${arrow}`;
    }).join("");
    return `<div class="section-panel"><div class="flow-chart">${items}</div></div>`;
  }

  function stepCard(step, index) {
    return `
      <div class="step-card">
        <div class="step-card-head">
          <div class="step-badge">${index < 10 ? "0" + index : index}</div>
          <h3>STEP ${index}．${esc(step.title)}</h3>
        </div>
        <div class="step-grid">
          <div class="step-field"><div class="field-label">目的</div><div class="field-body">${esc(step.purpose)}</div></div>
          <div class="step-field"><div class="field-label">適用情境</div><div class="field-body">${esc(step.scope)}</div></div>
          <div class="step-field full"><div class="field-label">操作步驟</div>
            <ul class="dash-list">${step.actions.map(a => `<li>${esc(a)}</li>`).join("")}</ul>
          </div>
          <div class="step-field"><div class="field-label">注意事項</div>
            <ul class="dash-list">${step.notes.map(n => `<li>${esc(n)}</li>`).join("")}</ul>
          </div>
          <div class="step-field">
            <div class="field-label">所需文件</div>
            <ul class="dash-list">${step.documents.map(d => `<li>${esc(d)}</li>`).join("")}</ul>
          </div>
          <div class="step-field full"><div class="field-label">完成條件</div><div class="field-body">${esc(step.completion)}</div></div>
          ${step.resourcePath ? resourcePathField(step.resourcePath) : ""}
          ${step.resourceLink ? resourceLinkField(step.resourceLink) : ""}
          ${step.images && step.images.length ? imageGalleryField(step.images) : ""}
        </div>
      </div>
    `;
  }

  /* Folder/path breadcrumb — "supporting materials live here" style,
     distinct from page navigation breadcrumb at the top of the page. */
  function resourcePathField(path) {
    const chips = path.map((p, i) => {
      const arrow = i < path.length - 1
        ? `<span class="path-arrow"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`
        : "";
      return `<span class="path-chip">${esc(p)}</span>${arrow}`;
    }).join("");
    return `
      <div class="step-field full">
        <div class="field-label">📁 資料存放路徑</div>
        <div class="resource-path">${chips}</div>
      </div>`;
  }

  /* External system link + shared account/password reference. */
  function resourceLinkField(link) {
    return `
      <div class="step-field full">
        <div class="field-label">🔗 系統存取資訊</div>
        <div class="resource-link-card">
          ${link.url ? `
          <a class="btn btn-secondary btn-sm" href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">
            前往${esc(link.urlLabel || "申請網站")}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>` : ""}
          ${link.account ? `
          <div class="resource-cred-row">
            <span class="cred-label">帳號</span>
            <code class="cred-value">${esc(link.account)}</code>
            <button class="cred-btn copy-btn" type="button" data-copy="${esc(link.account)}">複製</button>
          </div>` : ""}
          ${link.password ? `
          <div class="resource-cred-row">
            <span class="cred-label">密碼</span>
            <code class="cred-value cred-masked" data-secret="${esc(link.password)}">••••••••</code>
            <button class="cred-btn reveal-btn" type="button">顯示</button>
            <button class="cred-btn copy-btn" type="button" data-copy="${esc(link.password)}">複製</button>
          </div>` : ""}
          <p class="resource-note">⚠️ ${esc(link.note || "此為共用帳號，請妥善保管，勿轉傳至外部或公開頻道。")}</p>
        </div>
      </div>`;
  }

  /* Example screenshots with captions — walks the reader through what
     the actual screen/form looks like at this step. */
  function imageGalleryField(images) {
    const figures = images.map(img => `
      <figure class="example-figure">
        <div class="example-image-wrap">
          ${img.src
            ? `<img src="${esc(img.src)}" alt="${esc(img.caption || "")}" loading="lazy">`
            : `<div class="example-image-placeholder">🖼<span>尚未加入範例圖片<br>將圖片放入 assets/images/ 後於 data.js 填入路徑</span></div>`}
        </div>
        ${img.caption ? `<figcaption>${esc(img.caption)}</figcaption>` : ""}
      </figure>`).join("");
    return `
      <div class="step-field full">
        <div class="field-label">🖼 範例圖解</div>
        <div class="example-gallery">${figures}</div>
      </div>`;
  }

  function accordionList(items, kind) {
    const rows = items.map((item, i) => `
      <div class="accordion-item" data-kind="${kind}">
        <button class="accordion-trigger" type="button" aria-expanded="false">
          <span>${esc(item.q)}</span>
          <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="accordion-panel"><p>${esc(item.a)}</p></div>
      </div>`).join("");
    return `<div class="accordion-list">${rows}</div>`;
  }

  function downloadGrid(downloads) {
    const cards = downloads.map(d => `
      <a class="download-card" href="#" data-file-name="${esc(d.name)}">
        <div class="file-icon">${esc(d.type)}</div>
        <div class="file-info">
          <div class="file-name">${esc(d.name)}</div>
          <div class="file-meta">${esc(d.type)} · ${esc(d.size)}</div>
        </div>
        <div class="file-action">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 4V16M12 16L7 11M12 16L17 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 20H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </div>
      </a>`).join("");
    return `<div class="download-grid">${cards}</div>`;
  }

  function emptyState(title, desc) {
    return `
      <div class="empty-state">
        <div class="icon">🌱</div>
        <h3>${esc(title)}</h3>
        <p>${esc(desc)}</p>
      </div>`;
  }

  function feedbackStrip() {
    return `
      <div class="feedback-strip">
        <p>這份 SOP 對你有幫助嗎？歡迎回報問題或提出建議。</p>
        <button class="btn btn-secondary btn-sm" id="openFeedbackBtn" type="button">回報問題</button>
      </div>`;
  }

  function notFound() {
    return `
      ${breadcrumb([{ label: "首頁", href: "#/" }, { label: "找不到頁面" }])}
      ${emptyState("找不到這個頁面", "連結可能已失效，請回到首頁重新尋找需要的制度或流程。")}
      <div style="text-align:center; margin-top: 24px;">
        <a class="btn btn-primary" href="#/">回到首頁</a>
      </div>
    `;
  }

  /* ---------------- Search ---------------- */
  function buildSearchIndex() {
    const index = [];
    HR_DATA.categories.forEach(cat => {
      cat.cards.forEach(card => {
        index.push({
          title: card.title,
          desc: card.description,
          path: `${cat.name} / ${card.title}`,
          href: `#/sop/${cat.id}/${card.id}`
        });
        if (card.type === "faq" && card.faqs) {
          card.faqs.forEach(f => index.push({
            title: f.q, desc: f.a, path: `${cat.name} / FAQ`, href: `#/sop/${cat.id}/${card.id}`
          }));
        }
        if (card.sop && card.sop.faqs) {
          card.sop.faqs.forEach(f => index.push({
            title: f.q, desc: f.a, path: `${cat.name} / ${card.title} / FAQ`, href: `#/sop/${cat.id}/${card.id}`
          }));
        }
      });
    });
    return index;
  }

  function search(query, page) {
    page = page || 1;
    const perPage = 6;
    const q = (query || "").trim().toLowerCase();
    const all = buildSearchIndex();
    const results = q ? all.filter(item =>
      (item.title + item.desc).toLowerCase().includes(q)
    ) : [];

    const totalPages = Math.max(1, Math.ceil(results.length / perPage));
    const clampedPage = Math.min(Math.max(1, page), totalPages);
    const pageItems = results.slice((clampedPage - 1) * perPage, clampedPage * perPage);

    const list = pageItems.map(r => `
      <a class="result-item" href="${r.href}">
        <div class="result-path">${esc(r.path)}</div>
        <h4>${esc(r.title)}</h4>
        <p>${esc(r.desc)}</p>
      </a>`).join("");

    return `
      ${breadcrumb([{ label: "首頁", href: "#/" }, { label: "搜尋結果" }])}
      <div class="page-header">
        <h1>搜尋結果</h1>
        <p class="page-desc">「${esc(query || "")}」共找到 ${results.length} 筆結果</p>
        <form class="search-bar compact" id="searchPageForm" role="search" style="margin: var(--sp-4) 0 0;">
          <span class="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </span>
          <input type="search" id="searchPageInput" value="${esc(query || "")}" placeholder="搜尋制度、流程、SOP、表單...">
        </form>
      </div>
      ${results.length ? list : emptyState("查無相關結果", "換個關鍵字試試，或直接從左側選單瀏覽分類。")}
      ${totalPages > 1 ? pagination(clampedPage, totalPages, query) : ""}
    `;
  }

  function pagination(current, total, query) {
    let buttons = "";
    for (let i = 1; i <= total; i++) {
      buttons += `<button class="page-btn ${i === current ? "is-active" : ""}" data-page="${i}">${i}</button>`;
    }
    return `
      <div class="pagination" data-query="${esc(query || "")}">
        <button class="page-btn" data-page="${current - 1}" ${current === 1 ? "disabled" : ""} aria-label="上一頁">‹</button>
        ${buttons}
        <button class="page-btn" data-page="${current + 1}" ${current === total ? "disabled" : ""} aria-label="下一頁">›</button>
      </div>`;
  }

  return { sidebar, breadcrumb, home, category, cardDetail, search, notFound, esc };
})();
