/* ======================================================================
   HR 作業中心 — 內容編輯後台
   ----------------------------------------------------------------------
   運作方式：
   1. Firebase Authentication 擋門，只有登入的帳號能看到編輯畫面
   2. 左側列出 Firestore 裡的所有分類，點選後載入該分類文件
   3. 右側是整份分類的巢狀編輯表單（分類資訊／卡片／步驟／FAQ／表單／
      資料路徑／系統存取資訊／範例圖片），全部透過 data-bind 路徑
      直接寫回記憶體中的 workingCategory，按「儲存」才真的寫回 Firestore
   ====================================================================== */

const Admin = (() => {
  let db = null;
  let auth = null;
  let categoriesList = [];   // 左側清單用的簡易列表
  let workingCategory = null; // 目前正在編輯的分類（深拷貝，尚未存檔）

  const notConfiguredView = document.getElementById("notConfiguredView");
  const loginView = document.getElementById("loginView");
  const adminView = document.getElementById("adminView");
  const categoryListEl = document.getElementById("categoryListEl");
  const categoryEditorEl = document.getElementById("categoryEditor");
  const toastStack = document.getElementById("toastStack");

  function showToast(message) {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${message}</span>`;
    toastStack.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity 200ms"; setTimeout(() => el.remove(), 220); }, 2600);
  }

  /* ---------------- 進場檢查 ---------------- */
  function init() {
    if (typeof FirebaseLoader === "undefined" || !FirebaseLoader.isConfigured()) {
      notConfiguredView.style.display = "flex";
      return;
    }
    db = FirebaseLoader.init();
    auth = firebase.auth();

    document.getElementById("loginForm").addEventListener("submit", handleLogin);
    document.getElementById("logoutBtn").addEventListener("click", () => auth.signOut());
    document.getElementById("addCategoryBtn").addEventListener("click", handleAddCategory);

    categoryEditorEl.addEventListener("input", handleFieldInput);
    categoryEditorEl.addEventListener("change", handleFieldInput);
    categoryEditorEl.addEventListener("click", handleEditorClick);

    auth.onAuthStateChanged(user => {
      if (user) {
        loginView.style.display = "none";
        adminView.style.display = "flex";
        document.getElementById("loginUserEmail").textContent = user.email || "";
        loadCategoryList();
      } else {
        adminView.style.display = "none";
        loginView.style.display = "flex";
      }
    });
  }

  async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const errEl = document.getElementById("loginError");
    errEl.style.display = "none";
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      errEl.textContent = "登入失敗：" + (err.message || "帳號或密碼錯誤");
      errEl.style.display = "block";
    }
  }

  /* ---------------- 分類清單 ---------------- */
  async function loadCategoryList() {
    const snapshot = await db.collection("categories").orderBy("order").get();
    categoriesList = snapshot.docs.map(doc => doc.data());
    renderCategoryList();
  }

  function renderCategoryList() {
    categoryListEl.innerHTML = categoriesList.map(cat => `
      <li class="admin-category-item ${workingCategory && workingCategory.id === cat.id ? "is-active" : ""}" data-open-category="${cat.id}">
        <span>${cat.icon || "📁"}</span><span>${escapeHtml(cat.name || cat.id)}</span>
      </li>`).join("");

    categoryListEl.querySelectorAll("[data-open-category]").forEach(li => {
      li.addEventListener("click", () => loadCategory(li.dataset.openCategory));
    });
  }

  async function loadCategory(id) {
    const doc = await db.collection("categories").doc(id).get();
    if (!doc.exists) { showToast("找不到這個分類"); return; }
    workingCategory = JSON.parse(JSON.stringify(doc.data()));
    renderCategoryList();
    renderEditor();
  }

  async function handleAddCategory() {
    const id = prompt("請輸入分類代號（英文小寫，例如 travel，之後不能更改）：");
    if (!id) return;
    if (categoriesList.some(c => c.id === id)) { alert("這個代號已經存在了"); return; }
    const name = prompt("請輸入分類名稱（例如：出差旅費）：") || id;
    const newCat = {
      id, icon: "📁", name, tagline: "", description: "",
      order: categoriesList.length, cards: []
    };
    await db.collection("categories").doc(id).set(newCat);
    showToast("已新增分類，正在載入...");
    await loadCategoryList();
    await loadCategory(id);
  }

  async function handleDeleteCategory() {
    if (!workingCategory) return;
    if (!confirm(`確定要刪除「${workingCategory.name}」整個分類嗎？此動作無法復原。`)) return;
    await db.collection("categories").doc(workingCategory.id).delete();
    showToast("分類已刪除");
    workingCategory = null;
    categoryEditorEl.innerHTML = `<div class="empty-state"><div class="icon">👈</div><h3>請先從左側選擇一個分類</h3><p>點選分類後，會在這裡顯示可編輯的表單。</p></div>`;
    await loadCategoryList();
  }

  async function handleSave() {
    if (!workingCategory) return;
    try {
      await db.collection("categories").doc(workingCategory.id).set(workingCategory);
      showToast("已儲存變更");
      const idx = categoriesList.findIndex(c => c.id === workingCategory.id);
      if (idx > -1) categoriesList[idx] = workingCategory;
      renderCategoryList();
    } catch (err) {
      showToast("儲存失敗：" + err.message);
    }
  }

  /* ---------------- 路徑存取工具 ---------------- */
  function setByPath(obj, path, value) {
    const parts = path.split(".");
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = /^\d+$/.test(parts[i]) ? Number(parts[i]) : parts[i];
      const nextKey = parts[i + 1];
      if (cur[key] == null) cur[key] = /^\d+$/.test(nextKey) ? [] : {};
      cur = cur[key];
    }
    const lastKey = /^\d+$/.test(parts[parts.length - 1]) ? Number(parts[parts.length - 1]) : parts[parts.length - 1];
    cur[lastKey] = value;
  }

  function getByPath(obj, path) {
    return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[/^\d+$/.test(key) ? Number(key) : key]), obj);
  }

  function handleFieldInput(e) {
    const el = e.target;
    const path = el.dataset.bind;
    if (!path || !workingCategory) return;
    let value = el.value;
    if (el.dataset.lines === "true") {
      const lines = value.split("\n").map(s => s.trim()).filter(Boolean);
      if (el.dataset.pipe === "true") {
        value = lines.map(line => {
          const [label, categoryId, cardId] = line.split("｜").map(s => (s || "").trim());
          return { label: label || "", categoryId: categoryId || "", cardId: cardId || "" };
        });
      } else {
        value = lines;
      }
    }
    setByPath(workingCategory, path, value);
  }

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ---------------- 結構性操作（新增／刪除 → 重新渲染整份表單） ---------------- */
  function blankSop() {
    return { version: "v1.0", updatedDate: new Date().toISOString().slice(0, 10), summary: "", flow: [], steps: [], faqs: [], downloads: [], related: [], versionHistory: [] };
  }
  function blankStep() {
    return { title: "新步驟", purpose: "", scope: "", actions: [], notes: [], documents: [], completion: "", resourcePath: [], resourceLink: null, images: [] };
  }
  function blankCard() {
    return { id: "new-card-" + Date.now(), icon: "📌", title: "新卡片", description: "", type: "sop", sop: blankSop() };
  }

  function handleEditorClick(e) {
    const btn = e.target.closest("[data-action]");
    if (!btn || !workingCategory) return;
    const action = btn.dataset.action;
    const cardIdx = btn.dataset.cardIdx != null ? Number(btn.dataset.cardIdx) : null;
    const stepIdx = btn.dataset.stepIdx != null ? Number(btn.dataset.stepIdx) : null;
    const rowIdx = btn.dataset.rowIdx != null ? Number(btn.dataset.rowIdx) : null;

    if (action === "save") return handleSave();
    if (action === "delete-category") return handleDeleteCategory();

    if (action === "add-card") { workingCategory.cards.push(blankCard()); renderEditor(); return; }
    if (action === "remove-card") { if (confirm("確定要刪除這張卡片嗎？")) { workingCategory.cards.splice(cardIdx, 1); renderEditor(); } return; }

    const card = workingCategory.cards[cardIdx];
    if (!card) return;

    if (action === "add-step") { card.sop = card.sop || blankSop(); card.sop.steps.push(blankStep()); renderEditor(); return; }
    if (action === "remove-step") { card.sop.steps.splice(stepIdx, 1); renderEditor(); return; }

    if (action === "add-faq") { const target = card.type === "faq" ? (card.faqs = card.faqs || []) : (card.sop.faqs = card.sop.faqs || []); target.push({ q: "", a: "" }); renderEditor(); return; }
    if (action === "remove-faq") { const target = card.type === "faq" ? card.faqs : card.sop.faqs; target.splice(rowIdx, 1); renderEditor(); return; }

    if (action === "add-download") { const target = card.type === "downloads" ? (card.downloads = card.downloads || []) : (card.sop.downloads = card.sop.downloads || []); target.push({ name: "", type: "PDF", size: "" }); renderEditor(); return; }
    if (action === "remove-download") { const target = card.type === "downloads" ? card.downloads : card.sop.downloads; target.splice(rowIdx, 1); renderEditor(); return; }

    if (action === "add-image") { card.sop.steps[stepIdx].images = card.sop.steps[stepIdx].images || []; card.sop.steps[stepIdx].images.push({ src: "", caption: "" }); renderEditor(); return; }
    if (action === "remove-image") { card.sop.steps[stepIdx].images.splice(rowIdx, 1); renderEditor(); return; }

    if (action === "toggle-resource-link") {
      const step = card.sop.steps[stepIdx];
      step.resourceLink = step.resourceLink ? null : { url: "", urlLabel: "", account: "", password: "", note: "" };
      renderEditor();
      return;
    }

    if (action === "change-card-type") {
      card.type = btn.value;
      if (card.type === "sop" && !card.sop) card.sop = blankSop();
      if (card.type === "downloads" && !card.downloads) card.downloads = [];
      if (card.type === "faq" && !card.faqs) card.faqs = [];
      renderEditor();
      return;
    }
  }

  /* ---------------- 渲染：整份分類編輯表單 ---------------- */
  function renderEditor() {
    if (!workingCategory) return;
    const cat = workingCategory;
    categoryEditorEl.innerHTML = `
      <div class="admin-toolbar">
        <h1>${cat.icon || "📁"} ${escapeHtml(cat.name || cat.id)}</h1>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary btn-sm" type="button" data-action="delete-category">刪除整個分類</button>
          <button class="btn btn-primary btn-sm" type="button" data-action="save">💾 儲存變更</button>
        </div>
      </div>

      <div class="admin-section-block">
        <h2>分類資訊</h2>
        <div class="admin-field-row">
          <div><label class="admin-label">圖示（Emoji）</label><input class="admin-input" data-bind="icon" value="${escapeHtml(cat.icon)}"></div>
          <div><label class="admin-label">分類名稱</label><input class="admin-input" data-bind="name" value="${escapeHtml(cat.name)}"></div>
        </div>
        <label class="admin-label">一句話介紹（首頁卡片顯示）</label>
        <input class="admin-input" data-bind="tagline" value="${escapeHtml(cat.tagline)}">
        <label class="admin-label">分類說明（分類頁面顯示）</label>
        <textarea class="admin-textarea" data-bind="description" style="min-height:56px;">${escapeHtml(cat.description)}</textarea>
      </div>

      <div class="admin-section-block">
        <div class="admin-toolbar" style="margin-bottom: var(--sp-3);">
          <h2 style="margin:0;">卡片（${cat.cards.length}）</h2>
          <button class="btn btn-secondary btn-sm" type="button" data-action="add-card">＋ 新增卡片</button>
        </div>
        ${cat.cards.map((card, i) => renderCardBlock(card, i)).join("") || `<p class="admin-hint">目前還沒有卡片，點上方「新增卡片」開始建立。</p>`}
      </div>

      <div class="admin-save-bar">
        <button class="btn btn-primary" type="button" data-action="save">💾 儲存變更</button>
      </div>
    `;
  }

  function renderCardBlock(card, cardIdx) {
    const p = `cards.${cardIdx}`;
    let typeEditor = "";
    if (card.type === "sop") typeEditor = renderSopEditor(card, cardIdx);
    else if (card.type === "downloads") typeEditor = renderDownloadsEditor(card.downloads || [], cardIdx, null);
    else if (card.type === "faq") typeEditor = renderFaqEditor(card.faqs || [], cardIdx, null);

    return `
      <div class="admin-card-block">
        <div class="admin-card-head">
          <div class="admin-card-head-left">
            <input class="admin-input" style="width:52px; text-align:center; padding:8px;" data-bind="${p}.icon" value="${escapeHtml(card.icon)}">
            <input class="admin-input" style="width:220px;" data-bind="${p}.title" value="${escapeHtml(card.title)}">
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <select class="admin-type-select" data-action="change-card-type" data-card-idx="${cardIdx}">
              <option value="sop" ${card.type === "sop" ? "selected" : ""}>流程 SOP</option>
              <option value="downloads" ${card.type === "downloads" ? "selected" : ""}>表單下載</option>
              <option value="faq" ${card.type === "faq" ? "selected" : ""}>FAQ</option>
            </select>
            <button class="admin-btn-icon" type="button" data-action="remove-card" data-card-idx="${cardIdx}" title="刪除卡片">🗑</button>
          </div>
        </div>
        <label class="admin-label">卡片說明（分類頁的簡短描述，佔位卡片會用到）</label>
        <input class="admin-input" data-bind="${p}.description" value="${escapeHtml(card.description)}">
        <div style="margin-top: var(--sp-4);">${typeEditor}</div>
      </div>
    `;
  }

  function renderSopEditor(card, cardIdx) {
    const sop = card.sop = card.sop || blankSop();
    const p = `cards.${cardIdx}.sop`;
    return `
      <div class="admin-field-row">
        <div><label class="admin-label">版本</label><input class="admin-input" data-bind="${p}.version" value="${escapeHtml(sop.version)}"></div>
        <div><label class="admin-label">最後更新日期</label><input class="admin-input" data-bind="${p}.updatedDate" value="${escapeHtml(sop.updatedDate)}"></div>
      </div>
      <label class="admin-label">流程說明</label>
      <textarea class="admin-textarea" data-bind="${p}.summary">${escapeHtml(sop.summary)}</textarea>
      <label class="admin-label">流程圖步驟（一行一個，依序顯示）</label>
      <textarea class="admin-textarea" data-bind="${p}.flow" data-lines="true" style="min-height:64px;">${(sop.flow || []).join("\n")}</textarea>

      <div style="margin-top: var(--sp-4);">
        <div class="admin-toolbar" style="margin-bottom: var(--sp-2);">
          <h2 style="margin:0; font-size:14.5px;">操作步驟（${sop.steps.length}）</h2>
          <button class="btn btn-secondary btn-sm" type="button" data-action="add-step" data-card-idx="${cardIdx}">＋ 新增步驟</button>
        </div>
        ${sop.steps.map((step, si) => renderStepBlock(card, cardIdx, step, si)).join("") || `<p class="admin-hint">還沒有步驟，點「新增步驟」開始。</p>`}
      </div>

      <div style="margin-top: var(--sp-4);">
        <h2 style="font-size:14.5px; margin-bottom: var(--sp-2);">FAQ</h2>
        ${renderFaqEditor(sop.faqs || [], cardIdx, "sop")}
      </div>

      <div style="margin-top: var(--sp-4);">
        <h2 style="font-size:14.5px; margin-bottom: var(--sp-2);">附件下載</h2>
        ${renderDownloadsEditor(sop.downloads || [], cardIdx, "sop")}
      </div>

      <div style="margin-top: var(--sp-4);">
        <label class="admin-label">相關制度（格式：顯示文字｜分類代號｜卡片代號，一行一筆）</label>
        <textarea class="admin-textarea" data-bind="${p}.related" data-lines="true" data-pipe="true" style="min-height:64px;">${(sop.related || []).map(r => `${r.label}｜${r.categoryId}｜${r.cardId}`).join("\n")}</textarea>
      </div>
    `;
  }

  function renderStepBlock(card, cardIdx, step, stepIdx) {
    const p = `cards.${cardIdx}.sop.steps.${stepIdx}`;
    return `
      <div class="admin-step-block">
        <div class="admin-step-head">
          <strong>STEP ${stepIdx + 1}</strong>
          <button class="admin-btn-icon" type="button" data-action="remove-step" data-card-idx="${cardIdx}" data-step-idx="${stepIdx}" title="刪除步驟">🗑</button>
        </div>
        <label class="admin-label">步驟標題</label>
        <input class="admin-input" data-bind="${p}.title" value="${escapeHtml(step.title)}">
        <div class="admin-field-row">
          <div><label class="admin-label">目的</label><textarea class="admin-textarea" data-bind="${p}.purpose" style="min-height:60px;">${escapeHtml(step.purpose)}</textarea></div>
          <div><label class="admin-label">適用情境</label><textarea class="admin-textarea" data-bind="${p}.scope" style="min-height:60px;">${escapeHtml(step.scope)}</textarea></div>
        </div>
        <label class="admin-label">操作步驟（一行一項）</label>
        <textarea class="admin-textarea" data-bind="${p}.actions" data-lines="true">${(step.actions || []).join("\n")}</textarea>
        <div class="admin-field-row">
          <div><label class="admin-label">注意事項（一行一項）</label><textarea class="admin-textarea" data-bind="${p}.notes" data-lines="true">${(step.notes || []).join("\n")}</textarea></div>
          <div><label class="admin-label">所需文件（一行一項）</label><textarea class="admin-textarea" data-bind="${p}.documents" data-lines="true">${(step.documents || []).join("\n")}</textarea></div>
        </div>
        <label class="admin-label">完成條件</label>
        <textarea class="admin-textarea" data-bind="${p}.completion" style="min-height:52px;">${escapeHtml(step.completion)}</textarea>

        <label class="admin-label">📁 資料存放路徑（一行一段，例如「🗂️ HR公槽」）</label>
        <textarea class="admin-textarea" data-bind="${p}.resourcePath" data-lines="true" style="min-height:52px;">${(step.resourcePath || []).join("\n")}</textarea>

        <div style="margin-top: var(--sp-3);">
          <label class="admin-label" style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            🔗 系統存取資訊
            <button class="cred-btn" type="button" data-action="toggle-resource-link" data-card-idx="${cardIdx}" data-step-idx="${stepIdx}">${step.resourceLink ? "移除此欄位" : "＋ 加入此欄位"}</button>
          </label>
          ${step.resourceLink ? `
          <div class="admin-field-row">
            <div><label class="admin-label">網址</label><input class="admin-input" data-bind="${p}.resourceLink.url" value="${escapeHtml(step.resourceLink.url)}"></div>
            <div><label class="admin-label">按鈕文字</label><input class="admin-input" data-bind="${p}.resourceLink.urlLabel" value="${escapeHtml(step.resourceLink.urlLabel)}" placeholder="例如：申請網站"></div>
          </div>
          <div class="admin-field-row">
            <div><label class="admin-label">帳號</label><input class="admin-input" data-bind="${p}.resourceLink.account" value="${escapeHtml(step.resourceLink.account)}"></div>
            <div><label class="admin-label">密碼／查詢方式</label><input class="admin-input" data-bind="${p}.resourceLink.password" value="${escapeHtml(step.resourceLink.password)}" placeholder="建議填查詢方式，避免存明碼"></div>
          </div>
          <label class="admin-label">提醒文字</label>
          <input class="admin-input" data-bind="${p}.resourceLink.note" value="${escapeHtml(step.resourceLink.note)}">
          ` : ""}
        </div>

        <div style="margin-top: var(--sp-3);">
          <label class="admin-label">🖼 範例圖解</label>
          ${(step.images || []).map((img, ri) => `
            <div class="admin-row">
              <input class="admin-input" data-bind="${p}.images.${ri}.src" value="${escapeHtml(img.src)}" placeholder="圖片路徑，例如 assets/images/xxx.png">
              <input class="admin-input" data-bind="${p}.images.${ri}.caption" value="${escapeHtml(img.caption)}" placeholder="圖片說明文字">
              <button class="admin-btn-icon" type="button" data-action="remove-image" data-card-idx="${cardIdx}" data-step-idx="${stepIdx}" data-row-idx="${ri}">🗑</button>
            </div>`).join("")}
          <a class="admin-add-link" href="javascript:void(0)" data-action="add-image" data-card-idx="${cardIdx}" data-step-idx="${stepIdx}">＋ 新增一張圖片</a>
        </div>
      </div>
    `;
  }

  function renderFaqEditor(faqs, cardIdx, scope) {
    const base = scope ? `cards.${cardIdx}.sop.faqs` : `cards.${cardIdx}.faqs`;
    return `
      ${faqs.map((f, ri) => `
        <div class="admin-row" style="align-items:flex-start;">
          <div style="flex:1;">
            <input class="admin-input" style="margin-bottom:6px;" data-bind="${base}.${ri}.q" value="${escapeHtml(f.q)}" placeholder="問題">
            <textarea class="admin-textarea" data-bind="${base}.${ri}.a" style="min-height:48px;" placeholder="答案">${escapeHtml(f.a)}</textarea>
          </div>
          <button class="admin-btn-icon" type="button" data-action="remove-faq" data-card-idx="${cardIdx}" data-row-idx="${ri}">🗑</button>
        </div>`).join("")}
      <a class="admin-add-link" href="javascript:void(0)" data-action="add-faq" data-card-idx="${cardIdx}">＋ 新增一則 FAQ</a>
    `;
  }

  function renderDownloadsEditor(downloads, cardIdx, scope) {
    const base = scope ? `cards.${cardIdx}.sop.downloads` : `cards.${cardIdx}.downloads`;
    return `
      ${downloads.map((d, ri) => `
        <div class="admin-row">
          <input class="admin-input" style="flex:2;" data-bind="${base}.${ri}.name" value="${escapeHtml(d.name)}" placeholder="檔名，例如 申請表.docx">
          <input class="admin-input" style="flex:1;" data-bind="${base}.${ri}.type" value="${escapeHtml(d.type)}" placeholder="類型">
          <input class="admin-input" style="flex:1;" data-bind="${base}.${ri}.size" value="${escapeHtml(d.size)}" placeholder="大小">
          <button class="admin-btn-icon" type="button" data-action="remove-download" data-card-idx="${cardIdx}" data-row-idx="${ri}">🗑</button>
        </div>`).join("")}
      <a class="admin-add-link" href="javascript:void(0)" data-action="add-download" data-card-idx="${cardIdx}">＋ 新增一個表單</a>
    `;
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", Admin.init);
