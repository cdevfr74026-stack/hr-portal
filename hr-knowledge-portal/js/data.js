/* ======================================================================
   HR 作業中心 — Data Layer
   ----------------------------------------------------------------------
   All site content lives here as plain data. To add a new HR module,
   duplicate a category object and fill in its cards — no template or
   layout code needs to change. render.js reads this structure only.
   ====================================================================== */

/**
 * Helper: build a fully-structured SOP object so every process page
 * follows the same fixed template (flow → 4 steps → FAQ → downloads
 * → related → version history).
 */
function makeSOP(cfg) {
  return {
    version: cfg.version || "v1.0",
    updatedDate: cfg.updatedDate || "2026-07-01",
    summary: cfg.summary,
    flow: cfg.flow || [],
    steps: cfg.steps || [],
    faqs: cfg.faqs || [],
    downloads: cfg.downloads || [],
    related: cfg.related || [],
    versionHistory: cfg.versionHistory || [
      { version: cfg.version || "v1.0", date: cfg.updatedDate || "2026-07-01", note: "首次發佈" }
    ]
  };
}

const HR_DATA = {
  categories: [

    /* ================= 1. 績效考核（完整示範） ================= */
    {
      id: "performance",
      icon: "📈",
      name: "績效考核",
      tagline: "年度考核與獎金作業的完整操作指南",
      description: "涵蓋績效考核從前置準備、系統設定、評核執行到結案歸檔的全流程 SOP，協助 HR 快速掌握每個階段的操作步驟與注意事項。",
      cards: [
        {
          id: "prep", icon: "📌", title: "前置準備", type: "sop",
          description: "考核季開始前需完成的資料盤點與時程規劃。",
          sop: makeSOP({
            version: "v2.3", updatedDate: "2026-06-12",
            summary: "考核前置準備是整個績效循環的起點，目的在於確認考核範圍、名單與時程，避免正式啟動後因資料缺漏而延誤進度。此階段建議於考核期開始前 2 週完成。",
            flow: ["確認考核範圍", "彙整員工名單", "核對組織架構", "設定考核時程", "知會用人主管"],
            steps: [
              {
                title: "盤點考核範圍與名單", purpose: "確保所有應納入考核之在職員工皆被正確涵蓋，避免遺漏或誤植。",
                scope: "適用於每年 1 月／7 月半年度考核，以及新進滿三個月之試用期考核。",
                actions: ["自 HRIS 匯出當期在職員工清單", "排除到職未滿考核資格門檻之人員", "核對留職停薪、借調人員之考核歸屬單位", "與各部門主管確認名單無誤並取得回簽"],
                notes: ["留職停薪人員原則上不納入當期考核，如有爭議請簽會人資主管", "組織異動人員以考核期間最後在職單位認列"],
                documents: ["在職員工清冊", "組織架構圖", "考核名單確認回條"],
                completion: "各部門主管回簽確認考核名單，且無待釐清之組織歸屬問題。"
              },
              {
                title: "設定考核時程", purpose: "訂定自評、主管評核、校正會議至結果發佈的完整時間軸，供全體同仁依循。",
                scope: "適用於所有考核週期之時程規劃作業。",
                actions: ["依考核類型套用標準時程模板", "保留至少 3 個工作天作為系統緩衝期", "將重要節點同步至公司行事曆", "提前公告時程於內部公告欄"],
                notes: ["避開重大假期與月底結帳週，以免影響填寫率"],
                documents: ["考核時程表", "公告範本"],
                completion: "時程表經人資主管核准並完成公告。"
              }
            ],
            faqs: [
              { q: "留職停薪人員需要參與考核嗎？", a: "原則上留職停薪期間不納入當期考核，但復職後之比例年資將併入下一考核週期計算。若有特殊情形，請簽會人資主管個案認定。" },
              { q: "新進人員多久後開始納入考核？", a: "到職滿三個月即納入試用期考核；正式考核則依到職月份對應之考核週期辦理，未滿三個月者原則上不納入當期正式考核。" },
              { q: "考核名單確認後還能修改嗎？", a: "可以，但需由用人主管提出書面異動申請並經人資覆核，修改期限為系統開放填寫前 3 個工作天。" }
            ],
            downloads: [
              { name: "考核名單確認回條.xlsx", type: "XLSX", size: "24 KB" },
              { name: "考核時程公告範本.docx", type: "DOCX", size: "18 KB" }
            ],
            related: [
              { label: "系統設定", categoryId: "performance", cardId: "system" },
              { label: "發送通知", categoryId: "performance", cardId: "notify" }
            ],
            versionHistory: [
              { version: "v2.3", date: "2026-06-12", note: "更新留職停薪人員認定原則" },
              { version: "v2.2", date: "2025-12-20", note: "新增組織異動歸屬說明" },
              { version: "v2.0", date: "2025-06-01", note: "改版為現行流程架構" }
            ]
          })
        },
        {
          id: "system", icon: "⚙", title: "系統設定", type: "sop",
          description: "於考核系統建立當期考核專案與權限設定。",
          sop: makeSOP({
            version: "v1.8", updatedDate: "2026-06-15",
            summary: "本階段於績效考核系統中建立當期考核專案，設定評核關卡、權重與人員權限，確保系統開放時各角色皆能正確登入並看到對應的考核表單。",
            flow: ["建立考核專案", "匯入名單與組織關係", "設定評核關卡與權重", "測試帳號驗證", "正式開放系統"],
            steps: [
              {
                title: "建立考核專案並匯入名單", purpose: "於系統中建立本期考核專案，並將確認過的名單與主管對應關係匯入。",
                scope: "適用於每期考核系統啟用前之建置作業。",
                actions: ["複製上一期考核專案作為範本", "更新考核期間與評核關卡開放時間", "匯入員工與主管對應清單", "執行資料驗證報表，確認無孤兒帳號"],
                notes: ["匯入前務必於測試環境先行驗證，避免影響正式資料"],
                documents: ["考核專案建置檢查表", "名單匯入範本"],
                completion: "系統驗證報表顯示零錯誤，且測試帳號可正常登入查看表單。"
              },
              {
                title: "設定評核關卡與權重", purpose: "依考核制度設定自評、主管評核、跨部門評核等關卡順序與各項權重占比。",
                scope: "適用於績效考核制度所定義之標準評核流程。",
                actions: ["依制度文件設定各關卡開放與截止日", "輸入各構面權重並確認加總為 100%", "設定關卡間之自動提醒通知規則", "邀請 2 位測試人員模擬完整填寫流程"],
                notes: ["權重變更需經人資主管簽核後才可上線"],
                documents: ["評核權重設定表"],
                completion: "測試人員完整跑過一輪評核流程且無異常。"
              }
            ],
            faqs: [
              { q: "系統帳號密碼忘記怎麼辦？", a: "請至員工自助服務系統點選「忘記密碼」，或聯繫 IT 服務台協助重設，人資無法直接重設系統密碼。" },
              { q: "主管對應關係跑錯了怎麼修正？", a: "請填寫「組織對應異動申請」並提供正確之主管職務資訊，人資將於 1 個工作天內於系統後台更正。" }
            ],
            downloads: [
              { name: "考核專案建置檢查表.pdf", type: "PDF", size: "142 KB" },
              { name: "名單匯入範本.xlsx", type: "XLSX", size: "31 KB" }
            ],
            related: [
              { label: "前置準備", categoryId: "performance", cardId: "prep" },
              { label: "發送通知", categoryId: "performance", cardId: "notify" }
            ]
          })
        },
        {
          id: "notify", icon: "📢", title: "發送通知", type: "sop",
          description: "系統開放前後的正式公告與提醒信件發送。",
          sop: makeSOP({
            version: "v1.5", updatedDate: "2026-06-18",
            summary: "系統設定完成後，需以正式信件與內部公告通知全體同仁考核開始，並於期間規劃提醒通知，確保各關卡如期完成填寫。",
            flow: ["撰寫公告內容", "寄發開始通知", "期間提醒通知", "截止前最終提醒"],
            steps: [
              {
                title: "寄發考核開始通知", purpose: "讓全體同仁與主管清楚知悉考核開始時間、操作方式及截止日期。",
                scope: "適用於系統正式開放當日之通知作業。",
                actions: ["套用標準通知信範本並更新本期時程", "確認收件範圍涵蓋全體受評人員與評核主管", "附上操作指引連結與常見問題連結", "寄發後於群組公告置頂"],
                notes: ["建議於系統開放當日上午發送，避免下班前寄出降低閱讀率"],
                documents: ["考核開始通知信範本"],
                completion: "通知信件成功寄出且群組公告已置頂。"
              },
              {
                title: "安排期間與截止提醒", purpose: "針對尚未完成填寫之人員於期間內進行提醒，降低最後一天大量湧入的系統負載風險。",
                scope: "適用於自評與主管評核開放期間。",
                actions: ["於截止前 5 天匯出未完成名單", "寄送個別提醒信予未完成人員及其主管", "於截止前 1 天發送最終提醒", "彙整逾期名單提報人資主管"],
                notes: ["連續兩次提醒仍未完成者，需簽會單位主管處理"],
                documents: ["未完成名單匯出範本"],
                completion: "截止日前完成兩輪提醒，逾期名單已提報。"
              }
            ],
            faqs: [
              { q: "通知信被歸類為垃圾郵件怎麼辦？", a: "請提醒同仁將人資公告信箱加入白名單，或改以內部公告系統同步發布，確保訊息觸及率。" }
            ],
            downloads: [
              { name: "考核開始通知信範本.docx", type: "DOCX", size: "16 KB" },
              { name: "提醒信範本組.docx", type: "DOCX", size: "20 KB" }
            ],
            related: [
              { label: "系統設定", categoryId: "performance", cardId: "system" },
              { label: "評核期間", categoryId: "performance", cardId: "review" }
            ]
          })
        },
        {
          id: "review", icon: "📝", title: "評核期間", type: "sop",
          description: "自評、主管評核與跨部門評核的執行與追蹤。",
          sop: makeSOP({
            version: "v2.0", updatedDate: "2026-06-20",
            summary: "評核期間為員工自評、主管評核及必要之跨部門評核陸續進行的階段，人資需持續追蹤填寫進度並處理過程中的疑問與異常。",
            flow: ["員工自評", "主管初評", "跨部門評核（如適用）", "進度追蹤與催辦"],
            steps: [
              {
                title: "追蹤填寫進度", purpose: "掌握各單位填寫進度，及早發現異常並協助排除障礙。",
                scope: "適用於自評與主管評核開放之整個期間。",
                actions: ["每週匯出進度報表並分單位統計", "針對進度落後單位主動聯繫窗口", "記錄常見系統問題並更新 FAQ", "彙整跨部門評核之協作需求"],
                notes: ["進度報表建議於每週一發送予各單位人資窗口"],
                documents: ["填寫進度週報表"],
                completion: "每週進度報表如期產出並發送，異常事項均已記錄追蹤。"
              },
              {
                title: "處理評核異常與申訴", purpose: "受理並妥善處理評核期間發生之系統異常、資料錯誤或初步疑義反映。",
                scope: "適用於評核期間任何時間點發生之異常通報。",
                actions: ["建立異常通報紀錄表單", "依問題類型轉派 IT 或人資窗口處理", "重大爭議案件簽會人資主管裁示", "回覆通報人處理結果並結案"],
                notes: ["涉及考核分數爭議者，一律於評核完成後依申訴程序辦理，不於期間內個別調整"],
                documents: ["異常通報紀錄表"],
                completion: "所有通報案件皆已回覆並完成結案登記。"
              }
            ],
            faqs: [
              { q: "自評表可以填寫後再修改嗎？", a: "在自評關卡截止前，員工可重複登入修改並儲存，系統以最後一次送出的版本為準。" },
              { q: "主管休假無法如期完成評核怎麼辦？", a: "請指定代理主管於系統中協助完成，並於填寫時備註原評核主管姓名以利後續追溯。" }
            ],
            downloads: [
              { name: "填寫進度週報表範本.xlsx", type: "XLSX", size: "28 KB" },
              { name: "異常通報紀錄表.xlsx", type: "XLSX", size: "19 KB" }
            ],
            related: [
              { label: "發送通知", categoryId: "performance", cardId: "notify" },
              { label: "分數校正", categoryId: "performance", cardId: "calibration" }
            ]
          })
        },
        {
          id: "calibration", icon: "📊", title: "分數校正", type: "sop",
          description: "跨部門評分一致性檢視與校正會議籌辦。",
          sop: makeSOP({
            version: "v1.6", updatedDate: "2026-06-25",
            summary: "為避免不同主管評分尺度不一，人資需彙整初評分數並籌辦校正會議，透過跨部門討論確保評等分佈與制度精神一致。",
            flow: ["彙整初評分數", "產出分佈分析", "籌辦校正會議", "會議結論回寫系統"],
            steps: [
              {
                title: "產出評等分佈分析", purpose: "檢視各單位評等分佈是否過度集中或偏離常態，作為校正會議討論依據。",
                scope: "適用於全公司或事業處層級之校正會議前置分析。",
                actions: ["彙整各單位初評分數與評等分佈", "標示明顯偏離常態分佈之單位", "製作校正會議簡報，附上匿名化統計圖表", "提前 3 天將資料送交與會主管預閱"],
                notes: ["個人分數資料僅限校正會議與會者於會議中查閱，會後不得外流"],
                documents: ["評等分佈分析簡報範本"],
                completion: "分佈分析簡報完成並於會議前送達與會主管。"
              },
              {
                title: "召開跨部門校正會議", purpose: "由各單位主管共同討論並調整評等，確保整體評等分佈符合制度設計原則。",
                scope: "適用於半年度／年度正式考核之校正流程。",
                actions: ["說明本次校正會議之目的與規則", "逐單位檢視評等分佈並討論調整建議", "記錄各單位確認之最終評等異動", "會後將結論回寫至考核系統"],
                notes: ["任何評等調整需徵得原評核主管同意並留存紀錄"],
                documents: ["校正會議紀錄表"],
                completion: "校正會議紀錄完成簽署，且系統分數已完成回寫。"
              }
            ],
            faqs: [
              { q: "校正會議可以調整員工的分數嗎？", a: "校正會議討論的是『評等』而非個別分數細項，若需調整評等，須由原評核主管於會議中確認同意後，由人資統一於系統回寫。" },
              { q: "校正後的結果員工可以申訴嗎？", a: "可以，員工於績效面談收到結果後，如對最終評等有疑義，可依申訴辦法於期限內提出。" }
            ],
            downloads: [
              { name: "評等分佈分析簡報範本.pptx", type: "PPTX", size: "512 KB" },
              { name: "校正會議紀錄表.docx", type: "DOCX", size: "22 KB" }
            ],
            related: [
              { label: "評核期間", categoryId: "performance", cardId: "review" },
              { label: "績效面談", categoryId: "performance", cardId: "interview" }
            ]
          })
        },
        {
          id: "interview", icon: "💬", title: "績效面談", type: "sop",
          description: "主管與員工進行績效面談的完整操作流程。",
          sop: makeSOP({
            version: "v3.1", updatedDate: "2026-07-05",
            summary: "績效面談是考核循環中最關鍵的一環，主管需將校正後的評核結果與員工進行一對一溝通，說明評等依據、肯定表現亮點，並共同訂定下一階段的發展目標。人資於此階段主要負責提供工具、追蹤完成率與處理面談後的申訴申請。",
            flow: ["面談前準備", "安排面談時間", "進行面談", "紀錄與存檔", "追蹤申訴案件"],
            steps: [
              {
                title: "面談前資料準備", purpose: "協助主管在面談前備妥必要資料，確保面談內容有憑有據、聚焦於發展而非僅止於分數公布。",
                scope: "適用於所有需進行正式績效面談之主管與受評員工。",
                actions: [
                  "系統開放面談結果查詢權限予各級主管",
                  "提供「績效面談準備指引」予首次擔任評核主管者",
                  "提醒主管於面談前預先整理具體事例與佐證資料",
                  "確認面談場地為獨立空間，避免於開放辦公區進行"
                ],
                notes: [
                  "面談應避免安排於員工休假返回當日或重大專案交付前",
                  "評等為待改善（PIP 適用）者，建議人資 BP 陪同面談"
                ],
                documents: ["績效面談準備指引", "面談紀錄表"],
                completion: "主管已完成面談前資料準備，且面談場地與時間已確認。"
              },
              {
                title: "安排面談時間表", purpose: "統籌全公司面談排程，確保於規定期限內完成所有面談並降低時間衝突。",
                scope: "適用於面談週期開始至截止日之排程管理。",
                actions: [
                  "請各單位主管於系統填報預計面談日期",
                  "彙整全公司面談排程表並標示逾期風險名單",
                  "面談截止前一週發送排程提醒予尚未安排之主管",
                  "特殊情形（如出差、病假）協助協調備案時間"
                ],
                notes: ["建議每位員工面談時間至少保留 30 分鐘，避免匆促帶過"],
                documents: ["面談排程總表"],
                completion: "全數員工皆已完成排程，且排程表已更新至最新狀態。"
              },
              {
                title: "進行績效面談", purpose: "由主管與員工就本期表現、評等結果與發展方向進行雙向溝通。",
                scope: "適用於實際面談進行之當下，以主管為主要執行角色，人資提供工具支援。",
                actions: [
                  "說明本期整體表現與評等結果之依據",
                  "具體討論表現亮點與待加強之處",
                  "共同訂定下一週期之發展目標與所需資源",
                  "當場請員工於面談紀錄表確認已完成面談"
                ],
                notes: [
                  "面談應以雙向對話為主，避免單向宣讀分數",
                  "如員工當場提出異議，主管應記錄但無需當場承諾調整結果"
                ],
                documents: ["面談紀錄表", "個人發展計畫表"],
                completion: "面談紀錄表由主管與員工雙方完成簽名或系統確認。"
              },
              {
                title: "紀錄存檔與申訴受理", purpose: "彙整已完成面談之紀錄並存檔，同時開放申訴管道供有疑義之員工提出。",
                scope: "適用於面談完成後至申訴期限截止之作業期間。",
                actions: [
                  "回收並掃描面談紀錄表存入人事檔案系統",
                  "彙整未完成面談名單並簽報單位主管",
                  "開放線上申訴表單，公告受理期限",
                  "受理之申訴案件轉交考核申訴小組審理"
                ],
                notes: ["申訴期限一般為面談完成後 5 個工作天內提出，逾期原則不受理"],
                documents: ["面談完成率統計表", "考核申訴表單"],
                completion: "面談紀錄已全數存檔，申訴案件已轉交審理並開立追蹤編號。"
              }
            ],
            faqs: [
              { q: "員工對評等結果不服，可以怎麼做？", a: "員工可於面談完成後 5 個工作天內填寫「考核申訴表單」，並敘明具體理由與佐證，交由考核申訴小組進行審理，審理結果將於 10 個工作天內回覆。" },
              { q: "主管休假無法如期完成面談怎麼辦？", a: "請於排程系統中回報預計延後之時間並知會人資，原則上面談仍應於整體考核截止日前完成，特殊情況需簽報單位主管核准延期。" },
              { q: "面談紀錄表一定要紙本簽名嗎？", a: "不一定，如公司已啟用電子簽核流程，可於系統中以帳號登入確認取代紙本簽名，效力相同。" },
              { q: "面談時員工情緒激動該怎麼處理？", a: "主管應保持專業與同理，先傾聽員工感受，避免當場升溫爭執；如有需要，可請人資 BP 協助居中溝通或安排後續追加會談。" }
            ],
            downloads: [
              { name: "績效面談準備指引.pdf", type: "PDF", size: "268 KB" },
              { name: "面談紀錄表.docx", type: "DOCX", size: "24 KB" },
              { name: "個人發展計畫表.xlsx", type: "XLSX", size: "26 KB" },
              { name: "考核申訴表單.docx", type: "DOCX", size: "18 KB" }
            ],
            related: [
              { label: "分數校正", categoryId: "performance", cardId: "calibration" },
              { label: "調薪作業", categoryId: "performance", cardId: "raise" },
              { label: "升遷制度", categoryId: "promotion", cardId: "overview" }
            ],
            versionHistory: [
              { version: "v3.1", date: "2026-07-05", note: "新增面談情緒處理 FAQ" },
              { version: "v3.0", date: "2026-01-10", note: "導入個人發展計畫表" },
              { version: "v2.4", date: "2025-06-15", note: "申訴期限由 7 天調整為 5 個工作天" }
            ]
          })
        },
        {
          id: "raise", icon: "💰", title: "調薪作業", type: "sop",
          description: "依考核結果進行調薪試算與簽核作業。",
          sop: makeSOP({
            version: "v2.1", updatedDate: "2026-07-10",
            summary: "面談完成且申訴案件處理告一段落後，人資將依最終評等與調薪矩陣進行試算，並依權限層級送核，最終於發薪前完成系統異動。",
            flow: ["套用調薪矩陣試算", "部門預算檢核", "分層簽核", "系統異動與生效"],
            steps: [
              {
                title: "調薪試算與預算檢核", purpose: "依最終評等套用當年度調薪矩陣進行試算，並檢核是否超出各單位調薪預算上限。",
                scope: "適用於已完成面談與申訴處理之全體員工。",
                actions: ["匯入最終評等與現職薪資資料", "套用當年度調薪矩陣進行試算", "彙總各單位調薪總額並比對預算上限", "超出預算之單位標示並通知主管調整"],
                notes: ["調薪矩陣參數屬機密文件，僅限授權人員存取"],
                documents: ["調薪矩陣參數表", "部門調薪試算彙總表"],
                completion: "各單位試算結果皆落於預算範圍內，或已完成必要調整。"
              },
              {
                title: "分層簽核與系統異動", purpose: "依公司簽核權限表完成調薪案之逐級核准，並於生效日前完成薪資系統異動。",
                scope: "適用於調薪金額達各層級簽核門檻之案件。",
                actions: ["產出簽核用調薪明細表", "依權限金額分層送核（單位主管、處級主管、人資長）", "核准後於薪資系統建檔異動", "產出調薪確認通知並轉交各單位主管轉知員工"],
                notes: ["系統異動需於發薪作業截止日前 5 個工作天完成，以免影響當期發薪"],
                documents: ["調薪簽核明細表", "調薪確認通知範本"],
                completion: "全數調薪案完成簽核並於系統中生效，通知已送達各單位。"
              }
            ],
            faqs: [
              { q: "調薪金額什麼時候會反映在薪資單上？", a: "原則上於簽核完成並完成系統異動後的下一個發薪週期生效，實際生效月份將於調薪確認通知中載明。" },
              { q: "評等優異但單位預算不足怎麼辦？", a: "可由單位主管提出專案加碼申請，經人資長核准後動支公司預備調薪額度，惟核准與否依當年度整體財務狀況而定。" }
            ],
            downloads: [
              { name: "部門調薪試算彙總表.xlsx", type: "XLSX", size: "34 KB" },
              { name: "調薪簽核明細表.xlsx", type: "XLSX", size: "29 KB" }
            ],
            related: [
              { label: "績效面談", categoryId: "performance", cardId: "interview" },
              { label: "結案歸檔", categoryId: "performance", cardId: "closure" },
              { label: "薪酬福利", categoryId: "compensation", cardId: "overview" }
            ]
          })
        },
        {
          id: "closure", icon: "📦", title: "結案歸檔", type: "sop",
          description: "考核週期結束後的資料彙整與正式歸檔。",
          sop: makeSOP({
            version: "v1.4", updatedDate: "2026-07-15",
            summary: "調薪作業完成後，人資需彙整本期考核之各項紀錄與統計資料，完成正式歸檔並產出總結報告，作為下一週期規劃之參考依據。",
            flow: ["彙整全部紀錄", "產出總結報告", "資料歸檔與保存", "檢討會議"],
            steps: [
              {
                title: "彙整紀錄並產出總結報告", purpose: "統整本期考核之完成率、評等分佈、申訴案件與調薪結果，產出總結報告供管理層參考。",
                scope: "適用於每期考核作業正式結束後之彙整作業。",
                actions: ["彙整面談完成率、申訴案件數與處理結果", "統計最終評等分佈與去年度比較", "彙整調薪總額與預算執行率", "製作總結報告並提交人資主管審閱"],
                notes: ["總結報告應標示異常趨勢，如特定單位評等連續偏高或偏低"],
                documents: ["考核總結報告範本"],
                completion: "總結報告完成並經人資主管核閱通過。"
              },
              {
                title: "資料歸檔與保存", purpose: "將本期考核相關紀錄依保存年限規定完成歸檔，確保未來查閱與稽核需求皆能追溯。",
                scope: "適用於面談紀錄、申訴紀錄、調薪簽核文件等全部考核相關文件。",
                actions: ["掃描紙本紀錄並上傳至人事檔案系統", "依保存年限規則設定電子檔案標籤", "紙本文件送交檔案室依規保存", "更新系統中之考核專案狀態為「已結案」"],
                notes: ["個人考核紀錄依規定至少保存 5 年，涉及勞資爭議案件另依法規延長保存"],
                documents: ["文件歸檔清單"],
                completion: "全部文件完成歸檔，系統考核專案狀態已更新為結案。"
              }
            ],
            faqs: [
              { q: "考核紀錄可以保存多久？", a: "一般考核紀錄依內部規定保存 5 年，如涉及勞資爭議或申訴案件，將依相關法規延長保存期限。" },
              { q: "結案後還能查詢個人歷史考核紀錄嗎？", a: "可以，員工可透過人資單一窗口申請查閱個人歷史考核紀錄，惟不提供他人考核資料查詢。" }
            ],
            downloads: [
              { name: "考核總結報告範本.pptx", type: "PPTX", size: "486 KB" },
              { name: "文件歸檔清單.xlsx", type: "XLSX", size: "17 KB" }
            ],
            related: [
              { label: "調薪作業", categoryId: "performance", cardId: "raise" },
              { label: "前置準備", categoryId: "performance", cardId: "prep" }
            ]
          })
        },
        {
          id: "forms", icon: "📂", title: "表單下載", type: "downloads",
          description: "績效考核全流程所需之各式表單彙整。",
          downloads: [
            { name: "考核名單確認回條.xlsx", type: "XLSX", size: "24 KB" },
            { name: "考核專案建置檢查表.pdf", type: "PDF", size: "142 KB" },
            { name: "考核開始通知信範本.docx", type: "DOCX", size: "16 KB" },
            { name: "異常通報紀錄表.xlsx", type: "XLSX", size: "19 KB" },
            { name: "校正會議紀錄表.docx", type: "DOCX", size: "22 KB" },
            { name: "面談紀錄表.docx", type: "DOCX", size: "24 KB" },
            { name: "個人發展計畫表.xlsx", type: "XLSX", size: "26 KB" },
            { name: "考核申訴表單.docx", type: "DOCX", size: "18 KB" },
            { name: "調薪簽核明細表.xlsx", type: "XLSX", size: "29 KB" },
            { name: "考核總結報告範本.pptx", type: "PPTX", size: "486 KB" }
          ]
        },
        {
          id: "faq", icon: "❓", title: "FAQ", type: "faq",
          description: "績效考核作業中最常被詢問的問題彙整。",
          faqs: [
            { q: "留職停薪人員需要參與考核嗎？", a: "原則上留職停薪期間不納入當期考核，但復職後之比例年資將併入下一考核週期計算。若有特殊情形，請簽會人資主管個案認定。" },
            { q: "員工對評等結果不服，可以怎麼做？", a: "員工可於面談完成後 5 個工作天內填寫「考核申訴表單」，並敘明具體理由與佐證，交由考核申訴小組進行審理，審理結果將於 10 個工作天內回覆。" },
            { q: "調薪金額什麼時候會反映在薪資單上？", a: "原則上於簽核完成並完成系統異動後的下一個發薪週期生效，實際生效月份將於調薪確認通知中載明。" },
            { q: "考核紀錄可以保存多久？", a: "一般考核紀錄依內部規定保存 5 年，如涉及勞資爭議或申訴案件，將依相關法規延長保存期限。" },
            { q: "主管休假無法如期完成評核怎麼辦？", a: "請指定代理主管於系統中協助完成，並於填寫時備註原評核主管姓名以利後續追溯。" },
            { q: "校正會議可以調整員工的分數嗎？", a: "校正會議討論的是『評等』而非個別分數細項，若需調整評等，須由原評核主管於會議中確認同意後，由人資統一於系統回寫。" }
          ]
        }
      ]
    },

    /* ================= 其餘分類：完整介面 + 內容待補充 ================= */
    {
      id: "promotion", icon: "🚀", name: "升遷制度",
      tagline: "晉升評議與職等調整的申請流程",
      description: "說明升遷申請資格、評議會議籌辦與職等調整之標準作業流程。",
      cards: [
        { id: "overview", icon: "📌", title: "升遷申請資格", type: "sop", description: "適用資格與申請條件說明。", sop: null },
        { id: "committee", icon: "🗂", title: "評議會籌辦", type: "sop", description: "跨部門評議會議之籌辦流程。", sop: null },
        { id: "forms", icon: "📂", title: "表單下載", type: "downloads", description: "升遷申請相關表單。", downloads: [] },
        { id: "faq", icon: "❓", title: "FAQ", type: "faq", description: "升遷制度常見問題。", faqs: [] }
      ]
    },
    {
      id: "clinic", icon: "🩺", name: "臨場醫護",
      tagline: "職場健康服務與臨場健康管理",
      description: "涵蓋健康檢查追蹤、職場健康服務預約與異常個案管理流程。",
      cards: [
        { id: "checkup", icon: "📌", title: "健檢追蹤作業", type: "sop", description: "年度健康檢查結果追蹤與異常管理。", sop: null },
        { id: "service", icon: "🗂", title: "臨場服務預約", type: "sop", description: "臨場健康服務之預約與執行流程。", sop: null },
        {
          id: "subsidy", icon: "🧾", title: "補助申請", type: "sop",
          description: "員工職業健康相關補助之線上申請與資料準備流程。",
          sop: makeSOP({
            version: "v1.0", updatedDate: "2026-07-28",
            summary: "本流程說明員工申請職業健康相關補助時，人資窗口需協助確認資格、準備佐證資料、於補助系統完成填寫並送出申請的完整步驟。",
            flow: ["確認申請資格", "準備申請資料", "登入系統填寫", "送出並歸檔"],
            steps: [
              {
                title: "確認申請資格與補助類型", purpose: "確認申請人符合本次補助之資格條件，避免送出後才發現不符資格而需重新申請。",
                scope: "適用於員工本人或人資窗口代為確認補助資格之情形。",
                actions: ["核對申請人到職年資是否符合補助門檻", "確認本年度是否已申請過同類型補助", "確認補助類型對應之申請額度上限"],
                notes: ["同一補助類型原則上每年僅能申請一次，如有疑義請洽勞健保窗口確認"],
                documents: ["補助資格對照表"],
                completion: "已確認申請人符合資格，且補助類型與額度上限已明確。"
              },
              {
                title: "準備申請資料", purpose: "彙整補助申請所需之佐證文件，於送出線上申請前備妥，避免系統填寫到一半才發現缺件。",
                scope: "適用於所有需檢附佐證文件之補助申請案件。",
                actions: ["依補助類型準備對應之佐證文件（如收據、診斷證明）", "至公司共用資料夾下載申請範本與參考資料", "檢查文件掃描檔案是否清晰完整"],
                notes: ["資料夾內容會依年度更新，請確認取用的是當年度版本"],
                documents: ["補助申請範本", "佐證文件檢查清單"],
                completion: "所有應備文件皆已備妥，且掃描檔案清晰可辨識。",
                resourcePath: ["🗂️ HR公槽", "🗂️ 員工關懷", "🗂️ 115年補助申請"]
              },
              {
                title: "登入補助系統並填寫申請表單", purpose: "登入補助申請網站，依系統欄位填寫申請資訊並上傳準備好的佐證資料。",
                scope: "適用於員工本人或授權代辦之人資窗口。",
                actions: ["以共用帳號登入補助申請網站", "依畫面指示填寫申請人資料與補助項目", "上傳已準備好的佐證文件", "填寫完成後先儲存草稿，再次核對無誤後送出"],
                notes: ["共用帳密僅供內部作業使用，切勿轉傳或公開分享", "填寫中途逾時可能導致資料遺失，建議先在文件中打好草稿再貼入系統"],
                documents: ["補助申請表單填寫指引"],
                completion: "申請表單已完整填寫，佐證文件皆已上傳，且已成功送出。",
                resourceLink: {
                  url: "https://example-subsidy.gov.tw/apply",
                  urlLabel: "補助申請網站",
                  account: "hr.welfare01",
                  password: "請至公司密碼保管工具查詢，不建議明碼存放於此",
                  note: "此為部門共用帳號，密碼建議改存於公司密碼管理工具並在此僅放置查詢連結，避免外流風險。"
                },
                images: [
                  { src: "", caption: "範例：補助申請表單填寫畫面（以此案例示範應填欄位）" },
                  { src: "", caption: "範例：佐證文件上傳成功後的確認畫面" }
                ]
              },
              {
                title: "送出申請並完成歸檔", purpose: "確認申請送出成功，並將本次申請紀錄留存，作為後續追蹤與稽核依據。",
                scope: "適用於所有已送出之補助申請案件。",
                actions: ["截圖或下載送出成功之確認頁面", "將確認截圖與申請表單存入人事檔案系統", "於補助申請追蹤表登錄本次申請紀錄"],
                notes: ["補助核定結果依主管機關作業時間而定，如逾一個月未收到通知可主動查詢進度"],
                documents: ["補助申請追蹤表"],
                completion: "申請確認畫面已存檔，且追蹤表已完成登錄。"
              }
            ],
            faqs: [
              { q: "同一位員工可以同時申請多種補助嗎？", a: "可以，只要每種補助類型分別符合各自的資格條件即可，但同一類型補助原則上每年僅能申請一次。" },
              { q: "佐證資料放在哪裡可以先參考範本？", a: "可至公司共用資料夾「HR公槽 > 員工關懷 > 當年度補助申請」資料夾下載範本與參考資料，資料夾內容會隨年度更新。" },
              { q: "共用帳號密碼要去哪裡查詢？", a: "請至公司密碼保管工具查詢，人資不會將明碼密碼直接寫在 SOP 文件中，以降低外流風險。" }
            ],
            downloads: [
              { name: "補助資格對照表.xlsx", type: "XLSX", size: "21 KB" },
              { name: "補助申請表單填寫指引.pdf", type: "PDF", size: "188 KB" },
              { name: "補助申請追蹤表.xlsx", type: "XLSX", size: "16 KB" }
            ],
            related: [
              { label: "健檢追蹤作業", categoryId: "clinic", cardId: "checkup" },
              { label: "薪酬福利", categoryId: "compensation", cardId: "overview" }
            ]
          })
        },
        { id: "forms", icon: "📂", title: "表單下載", type: "downloads", description: "臨場醫護相關表單。", downloads: [] },
        { id: "faq", icon: "❓", title: "FAQ", type: "faq", description: "臨場醫護常見問題。", faqs: [] }
      ]
    },
    {
      id: "onboarding", icon: "👥", name: "新進人員",
      tagline: "從報到到融入的新人旅程",
      description: "涵蓋錄取通知、報到作業、新人訓練與試用期追蹤之完整流程。",
      cards: [
        { id: "offer", icon: "📌", title: "報到前準備", type: "sop", description: "錄取通知後之報到前置作業。", sop: null },
        { id: "orientation", icon: "🗂", title: "新人訓練", type: "sop", description: "到職當日與新人訓練安排。", sop: null },
        { id: "forms", icon: "📂", title: "表單下載", type: "downloads", description: "新進人員相關表單。", downloads: [] },
        { id: "faq", icon: "❓", title: "FAQ", type: "faq", description: "新進人員常見問題。", faqs: [] }
      ]
    },
    {
      id: "compensation", icon: "💰", name: "薪酬福利",
      tagline: "薪資結構、獎金與員工福利說明",
      description: "涵蓋每月薪資作業、獎金發放與各項員工福利申請流程。",
      cards: [
        { id: "overview", icon: "📌", title: "薪資作業時程", type: "sop", description: "每月薪資計算與發放時程。", sop: null },
        { id: "benefits", icon: "🗂", title: "福利申請流程", type: "sop", description: "各項員工福利之申請方式。", sop: null },
        { id: "forms", icon: "📂", title: "表單下載", type: "downloads", description: "薪酬福利相關表單。", downloads: [] },
        { id: "faq", icon: "❓", title: "FAQ", type: "faq", description: "薪酬福利常見問題。", faqs: [] }
      ]
    },
    {
      id: "insurance", icon: "📄", name: "勞健保",
      tagline: "勞保、健保與退休金相關作業",
      description: "涵蓋加保、退保、投保金額調整與退休金提繳之標準作業流程。",
      cards: [
        { id: "enroll", icon: "📌", title: "加保與退保", type: "sop", description: "到職與離職之保險異動作業。", sop: null },
        { id: "adjust", icon: "🗂", title: "投保金額調整", type: "sop", description: "定期調整投保金額之作業流程。", sop: null },
        { id: "forms", icon: "📂", title: "表單下載", type: "downloads", description: "勞健保相關表單。", downloads: [] },
        { id: "faq", icon: "❓", title: "FAQ", type: "faq", description: "勞健保常見問題。", faqs: [] }
      ]
    },
    {
      id: "legal", icon: "⚖", name: "法規專區",
      tagline: "勞動法令與內部規章查詢",
      description: "彙整與人資作業相關之勞動法令重點、修法更新與內部規章。",
      cards: [
        { id: "updates", icon: "📌", title: "法規異動追蹤", type: "sop", description: "重大勞動法規修訂之因應作業。", sop: null },
        { id: "policy", icon: "🗂", title: "內部規章管理", type: "sop", description: "內部規章制修訂之流程。", sop: null },
        { id: "forms", icon: "📂", title: "表單下載", type: "downloads", description: "法規專區相關表單。", downloads: [] },
        { id: "faq", icon: "❓", title: "FAQ", type: "faq", description: "法規專區常見問題。", faqs: [] }
      ]
    },
    {
      id: "docs", icon: "🗄", name: "文管中心",
      tagline: "文件分類、版本管控與調閱申請",
      description: "彙整公司文件之分類原則、命名規範、版本管控與調閱申請流程，確保各單位文件存取一致且可追溯。",
      cards: [
        { id: "classification", icon: "📌", title: "文件分類原則", type: "sop", description: "文件分類架構與命名規範說明。", sop: null },
        { id: "upload", icon: "🗂", title: "文件上傳流程", type: "sop", description: "文件上傳共用資料夾之標準作業。", sop: null },
        { id: "version", icon: "📝", title: "版本管控", type: "sop", description: "文件改版、標註與舊版保留原則。", sop: null },
        { id: "request", icon: "📮", title: "文件調閱申請", type: "sop", description: "跨部門調閱機密或限閱文件之申請流程。", sop: null },
        { id: "forms", icon: "📂", title: "表單下載", type: "downloads", description: "文管中心相關表單。", downloads: [] },
        { id: "faq", icon: "❓", title: "FAQ", type: "faq", description: "文管中心常見問題。", faqs: [] }
      ]
    }
  ]
};
