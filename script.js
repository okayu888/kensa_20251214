
let laxativeCount = 0;
let stoolCount = 0;
let symptomGroupCount = 0;

// 削除対象を一時保持
let targetDeleteRow = null;

/* =========================
   時刻取得
========================= */
function getTime() {
  return new Date().toTimeString().slice(0, 5);
}

/* =========================
   モーダル制御（便性状）
========================= */
function openStoolModal() {
  // loadStoolConditions(); // ← 追加
  document.getElementById('stoolModal').style.display = 'block';
}


function closeStoolModal() {
  const modal = document.getElementById('stoolModal');
  if (modal) {
    modal.style.display = 'none';
  }
}



/* =========================
   記録ボタン
========================= */

// 下剤
function addLaxative() {
  laxativeCount++;

  fetch("http://127.0.0.1:5000/api/exam-days/1/laxatives", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      dose_no: laxativeCount,          // ★ 必須
      taken_at: new Date().toISOString(),
      laxative_type_id: 1              // ★ ダミーでOK
    })
  })
  .then(res => {
    if (!res.ok) throw new Error("下剤POST失敗");
    return res.json();
  })
  .then(() => {
    
  })
  .catch(err => {
    console.error("下剤 保存エラー:", err);
    
  });
}





// 症状（腹痛・吐き気・その他は1グループ）
function addSymptom(symptomName) {
  symptomGroupCount++;
  addRow(
    'symptom',
    '',
    `⚠️ ${symptomName}(${symptomGroupCount})`,
    ''
  );
}

// 排便（画像選択）
function addStoolImage(imagePath) {
  stoolCount++;

  const imageHtml = `
    <img src="${imagePath}"
         alt="便性状"
         style="width:50px; border-radius:4px;">
  `;

  addRow(
    'stool',
    '',
    `💩 排便(${stoolCount})`,
    imageHtml
  );

  const modal = document.getElementById('stoolModal');
  if (modal) {
    modal.style.display = 'none';
  }
}


  


/* =========================
   行追加
========================= */
function addRow(type, laxativeText, contentText, note) {

  const tbody = document.querySelector('#logTable tbody');
  if (!tbody) return; // ← ★ これを追加
  const tr = document.createElement('tr');

  // 種類を保存（削除時に使用）
  tr.dataset.type = type;
  
  tr.innerHTML = `
  <td>${index + 1}</td>

  <!-- 下剤 -->
  <td>
    ${row.event_type === 'laxative'
      ? `💊 下剤（${row.count_no}）`
      : ''}
  </td>

  <!-- 時間 -->
  <td>${row.recorded_at.slice(11, 16)}</td>

  <!-- 内容（排便＋症状） -->
  <td>
    ${row.event_type === 'stool'
      ? `💩 排便（${row.count_no}）`
      : row.event_type === 'symptom'
        ? `⚠️ ${row.event_name}（${row.count_no}）`
        : ''}
  </td>

  <!-- 便の性状（排便のみ） -->
  <td>
    ${row.event_type === 'stool' && row.image_path
      ? `<img src="http://127.0.0.1:5000/${row.image_path}"
            alt="${row.label || ''}"
            style="width:40px; border-radius:4px;">`
    : ''}
  </td>
  <td>
    <button class="delete-btn" onclick="deleteRow(this)">🗑</button>
  </td>
`;


  // 新しい記録を上に追加
  tbody.prepend(tr);
  renumberRows();
}

/* =========================
   削除（確認付き）
========================= */

// 🗑 クリック時：確認モーダルを開く
function deleteRow(button) {
  targetDeleteRow = button.closest('tr');
  document.getElementById('deleteConfirmModal').style.display = 'block';
}

// 〇 を押したとき
function confirmDelete() {
  if (!targetDeleteRow) return;

  // 行を「取消済み」にする
  targetDeleteRow.classList.add('cancelled');

  // 取消ボタンの表示を変更（🗑 → 取消）
  const btn = targetDeleteRow.querySelector('.delete-btn');
  if (btn) {
    btn.textContent = '取消';
    btn.disabled = true; // 二重取消防止（おすすめ）
  }

  targetDeleteRow = null;
  closeDeleteModal();
}



// × を押したとき
function cancelDelete() {
  targetDeleteRow = null;
  closeDeleteModal();
}

// 確認モーダルを閉じる
function closeDeleteModal() {
  document.getElementById('deleteConfirmModal').style.display = 'none';
}

/* =========================
   No 再採番
========================= */
function renumberRows() {
  const rows = document.querySelectorAll('#logTable tbody tr');
  rows.forEach((row, index) => {
    const noCell = row.querySelector('.no');
    if (noCell) {
      noCell.textContent = index + 1;
    }
  });
}


// ===== スタッフ画面用：DB一覧取得 =====
async function loadStoolRecords() {
  console.log("✅ loadStoolRecords が呼ばれました");

  const res = await fetch(
    "http://127.0.0.1:5000/api/exam-days/1/bowel-movements"
  );
  const data = await res.json();

  const tbody = document.querySelector("#logTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  data.slice().reverse().forEach((row, index) => {

    const tr = document.createElement("tr");
    tr.innerHTML = `
  <td>${index + 1}</td>
  <td></td>
  <td>${row.recorded_at.slice(11, 16)}</td>

  <!-- 内容 -->
  <td>
    ${row.image_path
      ? `💩 排便（${data.length - index}）`
      : `${row.label || ''}`
    }
  </td>

  <!-- 便の性状 -->
  <td>
    ${row.image_path ? `
      <img src="http://127.0.0.1:5000/${row.image_path}"
           alt="${row.label || ''}"
           style="width:40px; border-radius:4px;">
    ` : ''}
  </td>

  <!-- 取消 -->
  <td><button class="delete-btn" onclick="deleteRow(this)">🗑</button></td>
`;

    tbody.appendChild(tr);
  });
}


// ===== スタッフ画面：ページ表示時にDB一覧を取得 =====
document.addEventListener("DOMContentLoaded", () => {
  loadStoolRecords();
});




fetch("http://127.0.0.1:5000/api/stool-conditions")
  .then(res => res.json())
  .then(data => {
    console.log("stool conditions:", data);
    // renderStoolImages(data);   // ← 次のステップで作る関数
  })
  .catch(err => console.error(err));

console.log("script.js loaded");

fetch("http://127.0.0.1:5000/health")
  .then(res => res.json())
  .then(data => {
    console.log("API health:", data);
  })
  .catch(err => {
    console.error("API接続エラー:", err);
  });





