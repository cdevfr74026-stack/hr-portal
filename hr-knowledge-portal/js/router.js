/* ======================================================================
   HR 作業中心 — Router
   ----------------------------------------------------------------------
   Simple hash router. Adding a new HR module never requires touching
   this file — only data.js grows.
   Routes:
     #/                              → Home
     #/category/:catId               → Category page
     #/sop/:catId/:cardId            → SOP / downloads / FAQ detail page
     #/search?q=...&page=N           → Search results
   ====================================================================== */

const Router = (() => {
  const sidebarEl = document.getElementById("sidebarNav");
  const contentEl = document.getElementById("contentInner");

  function parseHash() {
    const raw = window.location.hash.replace(/^#/, "") || "/";
    const [pathPart, queryPart] = raw.split("?");
    const segments = pathPart.split("/").filter(Boolean);
    const params = new URLSearchParams(queryPart || "");
    return { segments, params };
  }

  function render() {
    const { segments, params } = parseHash();
    let html = "";
    let activeCatId = null;

    if (segments.length === 0) {
      html = Render.home();
    } else if (segments[0] === "category" && segments[1]) {
      activeCatId = segments[1];
      html = Render.category(segments[1]);
    } else if (segments[0] === "sop" && segments[1] && segments[2]) {
      activeCatId = segments[1];
      html = Render.cardDetail(segments[1], segments[2]);
    } else if (segments[0] === "search") {
      const q = params.get("q") || "";
      const page = parseInt(params.get("page") || "1", 10);
      html = Render.search(q, page);
    } else {
      html = Render.notFound();
    }

    contentEl.innerHTML = html;
    sidebarEl.innerHTML = Render.sidebar(activeCatId);
    App.afterRender();
    window.scrollTo(0, 0);
    App.closeMobileSidebar();
  }

  function navigateToSearch(query, page) {
    const q = encodeURIComponent(query || "");
    window.location.hash = `#/search?q=${q}&page=${page || 1}`;
  }

  function init() {
    window.addEventListener("hashchange", render);
    render();
  }

  return { init, render, navigateToSearch };
})();
