/* ======================================================================
   Firebase 資料載入器
   ----------------------------------------------------------------------
   負責：
   1. 判斷 firebase-config.js 是否已經填好（還沒填就直接跳過，改用
      data.js 內建的本機資料，網頁仍然能正常打開）
   2. 初始化 Firebase 並連線 Firestore
   3. 讀取 categories 集合，回傳給 app.js 覆蓋 HR_DATA.categories
   ====================================================================== */

const FirebaseLoader = (() => {
  let db = null;

  function isConfigured() {
    return typeof FIREBASE_CONFIG !== "undefined"
      && FIREBASE_CONFIG.apiKey
      && !FIREBASE_CONFIG.apiKey.includes("請貼上");
  }

  function init() {
    if (db) return db;
    if (typeof firebase === "undefined") {
      throw new Error("Firebase SDK 尚未載入，請確認 index.html 有引入 firebase-app / firebase-firestore。");
    }
    firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.firestore();
    return db;
  }

  /**
   * 讀取 Firestore 的 categories 集合，依 order 欄位排序後回傳。
   * 若尚未設定 Firebase 或連線失敗，會丟出例外，由呼叫端決定是否
   * 改用 data.js 內建的本機資料當備援。
   */
  async function loadCategories() {
    if (!isConfigured()) {
      throw new Error("尚未設定 firebase-config.js，略過 Firebase 讀取。");
    }
    init();
    const snapshot = await db.collection("categories").orderBy("order").get();
    if (snapshot.empty) {
      throw new Error("Firestore 的 categories 集合目前是空的，請先完成資料匯入步驟。");
    }
    return snapshot.docs.map(doc => doc.data());
  }

  return { isConfigured, init, loadCategories };
})();
