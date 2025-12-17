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
  addRow('laxative', `💊 下剤(${laxativeCount})`, '', '');
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

  // ★★★ ここを追加 ★★★
  const modal = document.getElementById('stoolModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

  

// ★ ここで直接モーダルを閉じる（スコープ問題を回避）
const modal = document.getElementById('stoolModal');
if (modal) {
  modal.style.display = 'none';
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
  <td class="no"></td>
  <td>${laxativeText}</td>
  <td>${getTime()}</td>
  <td>${contentText}</td>
  <td>${note}</td>
  <td>
    <button class="delete-btn" onclick="deleteRow(this)">🗑</button>
  </td>
`;


  // 新しい記録を上に追加
  tbody.prepend(tr);
  renumberRows();
  applyLatestLimit(5); // ← 追加
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


// ===== スタッフ画面用：ダミー一覧 =====
document.addEventListener('DOMContentLoaded', () => {
  const table = document.querySelector('#logTable tbody');
  if (!table) return; // 患者画面では何もしない

  const dummyLogs = [
  { laxative: '', time: '20:19', content: '⚠️ 吐き気(8)', note: '' },  
  { laxative: '', time: '20:19', content: '⚠️ 吐き気(7)', note: '' },
  { laxative: '', time: '20:19', content: '⚠️ 腹痛(6)', note: '' },
  { laxative: '', time: '20:03', content: '⚠️ 腹痛(5)', note: '' },
  { laxative: '💊 下剤(7)', time: '20:03', content: '', note: '' },
  { laxative: '', time: '19:59', content: '💩 排便(5)', note: '<img src="images/ben5.jpg" style="width:40px; border-radius:4px;">' },
];



  dummyLogs.forEach((log, index) => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
  <td>${index + 1}</td>
  <td>${log.laxative || ''}</td>
  <td>${log.time}</td>
  <td>${log.content}</td>
  <td>${log.note}</td>
  <td>
    <button class="delete-btn" onclick="deleteRow(this)">🗑</button>
  </td>
`;

  table.appendChild(tr);
});

applyLatestLimit(5); // ← ここに追加
});

function applyLatestLimit(limit = 5) {
  const rows = document.querySelectorAll('#logTable tbody tr');

  rows.forEach((row, index) => {
    if (index >= limit) {
      row.classList.add('is-hidden');
    } else {
      row.classList.remove('is-hidden');
    }
  });
}

