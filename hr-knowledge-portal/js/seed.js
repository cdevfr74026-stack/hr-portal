/* ======================================================================
   一次性資料匯入腳本
   ----------------------------------------------------------------------
   把 data.js 裡的 HR_DATA.categories 逐筆寫入 Firestore 的
   categories 集合，文件 ID 使用 category.id，並補上 order 欄位
   以保留原本的分類排序（Firestore 本身不保證陣列順序）。
   ====================================================================== */

const logEl = document.getElementById("seedLog");
const btnEl = document.getElementById("seedBtn");

function log(line) {
  logEl.textContent += "\n" + line;
  logEl.scrollTop = logEl.scrollHeight;
}

btnEl.addEventListener("click", async () => {
  btnEl.disabled = true;
  logEl.textContent = "開始匯入...";

  if (!FirebaseLoader.isConfigured()) {
    log("❌ 尚未設定 js/firebase-config.js，請先填好你的 Firebase 設定值再重新整理此頁。");
    btnEl.disabled = false;
    return;
  }

  try {
    const db = FirebaseLoader.init();
    const categories = HR_DATA.categories;

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      await db.collection("categories").doc(cat.id).set({ ...cat, order: i });
      log(`✅ 已寫入：${cat.name}（${cat.id}）`);
    }

    log(`\n🎉 全部完成，共匯入 ${categories.length} 個分類。`);
    log("接下來請到 Firebase 主控台把 Firestore 安全性規則改回唯讀，再回到 index.html 測試網頁是否能正確讀到資料。");
  } catch (err) {
    log(`❌ 發生錯誤：${err.message}`);
    log("常見原因：Firestore 安全性規則目前不允許寫入，請先暫時開放寫入權限再重試。");
  } finally {
    btnEl.disabled = false;
  }
});
