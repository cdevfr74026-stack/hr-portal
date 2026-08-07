/* ======================================================================
   HR 作業中心 — App Bootstrap & Global Interactions
   ====================================================================== */

const App = (() => {
  const sidebar = document.getElementById("sidebar");
  const scrim = document.getElementById("sidebarScrim");
  const toastStack = document.getElementById("toastStack");

  /* ---------- Toast ---------- */
  function showToast(message) {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span>${message}</span>`;
    toastStack.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transition = "opacity 200ms ease";
      setTimeout(() => el.remove(), 220);
    }, 2600);
  }

  /* ---------- Modal (Feedback) ---------- */
  function openFeedbackModal() {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "feedbackOverlay";
    overlay.innerHTML = `
      <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="feedbackTitle">
        <h3 id="feedbackTitle">回報此頁問題</h3>
        <p>告訴我們這份 SOP 哪裡看不懂、資訊過時，或有任何建議，我們會盡快更新內容。</p>
        <textarea id="feedbackText" placeholder="請輸入你的意見..."></textarea>
        <div class="modal-actions">
          <button class="btn btn-ghost btn-sm" id="feedbackCancel" type="button">取消</button>
          <button class="btn btn-primary btn-sm" id="feedbackSubmit" type="button">送出回饋</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    function close() { overlay.remove(); }
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    overlay.querySelector("#feedbackCancel").addEventListener("click", close);
    overlay.querySelector("#feedbackSubmit").addEventListener("click", () => {
      close();
      showToast("已送出，感謝你的回饋");
    });
    overlay.querySelector("textarea").focus();
  }

  /* ---------- Sidebar: collapse (desktop/tablet) & mobile drawer ---------- */
  function toggleCollapse() {
    sidebar.classList.toggle("is-collapsed");
  }
  function openMobileSidebar() {
    sidebar.classList.add("is-open");
    scrim.classList.add("is-visible");
  }
  function closeMobileSidebar() {
    sidebar.classList.remove("is-open");
    scrim.classList.remove("is-visible");
  }

  /* ---------- Accordion (event delegation, lives across re-renders) ---------- */
  function bindAccordionDelegation() {
    document.getElementById("contentInner").addEventListener("click", (e) => {
      const trigger = e.target.closest(".accordion-trigger");
      if (!trigger) return;
      const item = trigger.closest(".accordion-item");
      const panel = item.querySelector(".accordion-panel");
      const isOpen = item.classList.contains("is-open");

      if (isOpen) {
        panel.style.maxHeight = "0px";
        item.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + 24 + "px";
      }
    });
  }

  /* ---------- Download click → toast (prototype has no real files) ---------- */
  function bindDownloadDelegation() {
    document.getElementById("contentInner").addEventListener("click", (e) => {
      const dl = e.target.closest(".download-card");
      if (!dl) return;
      e.preventDefault();
      showToast(`已開始下載「${dl.dataset.fileName}」`);
    });
  }

  /* ---------- Feedback button delegation ---------- */
  function bindFeedbackDelegation() {
    document.getElementById("contentInner").addEventListener("click", (e) => {
      if (e.target.closest("#openFeedbackBtn")) openFeedbackModal();
    });
  }

  /* ---------- Credential reveal / copy (resource-link step field) ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for non-secure contexts (e.g. opened via file://)
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (err) { /* no-op */ }
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  function bindCredentialDelegation() {
    document.getElementById("contentInner").addEventListener("click", (e) => {
      const revealBtn = e.target.closest(".reveal-btn");
      if (revealBtn) {
        const code = revealBtn.parentElement.querySelector(".cred-value");
        const isMasked = code.classList.contains("cred-masked");
        if (isMasked) {
          code.textContent = code.dataset.secret;
          code.classList.remove("cred-masked");
          revealBtn.textContent = "隱藏";
        } else {
          code.textContent = "••••••••";
          code.classList.add("cred-masked");
          revealBtn.textContent = "顯示";
        }
        return;
      }
      const copyBtn = e.target.closest(".copy-btn");
      if (copyBtn) {
        copyText(copyBtn.dataset.copy).then(() => showToast("已複製到剪貼簿"));
      }
    });
  }

  /* ---------- Search forms (home hero + search page) ---------- */
  function bindSearchDelegation() {
    document.getElementById("contentInner").addEventListener("submit", (e) => {
      const form = e.target.closest("#homeSearchForm, #searchPageForm");
      if (!form) return;
      e.preventDefault();
      const input = form.querySelector("input[type=search]");
      Router.navigateToSearch(input.value, 1);
    });

    document.getElementById("contentInner").addEventListener("click", (e) => {
      const pageBtn = e.target.closest(".page-btn");
      if (!pageBtn || pageBtn.disabled) return;
      const wrap = pageBtn.closest(".pagination");
      const query = wrap ? wrap.dataset.query : "";
      Router.navigateToSearch(query, parseInt(pageBtn.dataset.page, 10));
    });
  }

  /* ---------- Global (persistent) bindings — run once ---------- */
  function bindGlobal() {
    document.getElementById("hamburgerBtn").addEventListener("click", openMobileSidebar);
    scrim.addEventListener("click", closeMobileSidebar);

    bindAccordionDelegation();
    bindDownloadDelegation();
    bindFeedbackDelegation();
    bindCredentialDelegation();
    bindSearchDelegation();
  }

  /* ---------- Called by Router after every render (re-binds dynamic sidebar button) ---------- */
  function afterRender() {
    const collapseBtn = document.getElementById("sidebarCollapseBtn");
    if (collapseBtn) collapseBtn.addEventListener("click", toggleCollapse);
  }

  /* ---------- Data bootstrap: Firestore first, local data.js as fallback ---------- */
  async function bootstrapData() {
    if (typeof FirebaseLoader === "undefined" || !FirebaseLoader.isConfigured()) {
      // firebase-config.js 還沒填，直接用 data.js 內建的本機資料
      return;
    }
    try {
      const categories = await FirebaseLoader.loadCategories();
      HR_DATA.categories = categories;
      console.info("已從 Firebase 載入最新內容。");
    } catch (err) {
      console.warn("Firebase 資料載入失敗，改用內建本機資料：", err.message);
    }
  }

  async function init() {
    bindGlobal();
    document.getElementById("contentInner").innerHTML = `
      <div class="empty-state">
        <div class="icon">☁️</div>
        <h3>載入中...</h3>
        <p>正在準備內容，請稍候。</p>
      </div>`;
    await bootstrapData();
    Router.init();
  }

  return { init, afterRender, closeMobileSidebar, showToast };
})();

document.addEventListener("DOMContentLoaded", App.init);
