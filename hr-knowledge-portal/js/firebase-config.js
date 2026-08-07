/* ======================================================================
   Firebase 設定檔
   ----------------------------------------------------------------------
   請到 Firebase 主控台 → 專案設定 → 一般 → 你的應用程式，
   把系統顯示的設定值貼到下面對應欄位。
   這組值不是密碼，是「這個網頁要連到哪個 Firebase 專案」的地址，
   真正的存取控制交給 Firestore 安全性規則負責（後面步驟會設定）。
   ====================================================================== */

const FIREBASE_CONFIG = {
  apiKey: "請貼上你的 apiKey",
  authDomain: "請貼上你的 authDomain",
  projectId: "請貼上你的 projectId",
  storageBucket: "請貼上你的 storageBucket",
  messagingSenderId: "請貼上你的 messagingSenderId",
  appId: "請貼上你的 appId"
};
