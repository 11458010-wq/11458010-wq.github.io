const FOLDER_ID = '1Zqg7LmQ7Yt7pjITFzsLM4_YLwuFzcNIK';
const NOTE_FILE_NAME = '記事本.txt';

function doGet() {
  const data = getNotebookData_();
  const html = buildHtml_(data);
  return HtmlService.createHtmlOutput(html)
    .setTitle('雲端記事本')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getNotebookData() {
  return getNotebookData_();
}

function saveNotebookData(content) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const file = getOrCreateNotebookFile_();
    file.setContent(content == null ? '' : String(content));

    return {
      ok: true,
      name: file.getName(),
      fileId: file.getId(),
      updatedAt: file.getLastUpdated().toISOString(),
      message: '已儲存'
    };
  } finally {
    lock.releaseLock();
  }
}

function getNotebookData_() {
  const file = getOrCreateNotebookFile_();
  return {
    ok: true,
    name: file.getName(),
    fileId: file.getId(),
    content: file.getBlob().getDataAsString(),
    updatedAt: file.getLastUpdated().toISOString(),
    folderId: FOLDER_ID
  };
}

function getOrCreateNotebookFile_() {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFilesByName(NOTE_FILE_NAME);

  if (files.hasNext()) {
    return files.next();
  }

  return folder.createFile(NOTE_FILE_NAME, '', MimeType.PLAIN_TEXT);
}

function buildHtml_(data) {
  const safeData = JSON.stringify(data).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>雲端記事本</title>
  <style>
    :root {
      --bg: #121212;
      --panel: #1d1d1f;
      --panel-2: #2a2a2f;
      --text: #f5f5f7;
      --muted: #9ca3af;
      --border: #3a3a40;
      --accent: #7c8cff;
      --accent-2: #8a5cff;
      --shadow: rgba(124, 140, 255, 0.35);
      --ok: #f5b84d;
      --danger: #ff7070;
      --radius: 18px;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      background:
        radial-gradient(circle at top left, rgba(124, 140, 255, 0.20), transparent 38%),
        radial-gradient(circle at top right, rgba(138, 92, 255, 0.18), transparent 30%),
        linear-gradient(180deg, #101012 0%, #161618 100%);
      color: var(--text);
      font-family: 'Segoe UI', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif;
    }

    .app {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 18px;
    }

    .hero {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 18px 22px;
      border-radius: 20px;
      background: linear-gradient(135deg, rgba(91, 116, 255, 0.95), rgba(138, 92, 255, 0.90));
      box-shadow: 0 18px 40px rgba(79, 92, 214, 0.28);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 0;
    }

    .brand-mark {
      width: 42px;
      height: 42px;
      flex: 0 0 auto;
      display: grid;
      place-items: center;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.16);
      border: 1px solid rgba(255, 255, 255, 0.22);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
      font-size: 24px;
    }

    .brand-title {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 0.04em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .status-chip {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      border-radius: 999px;
      background: rgba(48, 33, 78, 0.52);
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(8px);
      font-weight: 700;
      flex: 0 0 auto;
    }

    .status-dot {
      width: 13px;
      height: 13px;
      border-radius: 999px;
      background: var(--ok);
      box-shadow: 0 0 0 6px rgba(245, 184, 77, 0.16);
    }

    .workspace {
      flex: 1;
      display: grid;
      grid-template-rows: auto 1fr auto;
      gap: 14px;
      padding: 10px 6px 0;
      min-height: 0;
    }

    .file-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      color: #e5e7eb;
      font-weight: 700;
      padding: 0 6px;
    }

    .file-name {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      color: #d7dbe6;
    }

    .file-name span:last-child {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .editor-shell {
      position: relative;
      min-height: 0;
      border-radius: var(--radius);
      border: 2px solid rgba(124, 140, 255, 0.56);
      background: linear-gradient(180deg, #2a2a2d 0%, #333338 100%);
      box-shadow:
        0 0 0 4px rgba(124, 140, 255, 0.15),
        0 18px 40px rgba(0, 0, 0, 0.35);
      overflow: hidden;
    }

    .editor {
      width: 100%;
      height: 100%;
      min-height: 100%;
      resize: none;
      border: none;
      outline: none;
      background: transparent;
      color: #f8fafc;
      padding: 20px 22px;
      font-size: 18px;
      line-height: 1.8;
      letter-spacing: 0.01em;
      font-family: inherit;
    }

    .editor::placeholder {
      color: rgba(255, 255, 255, 0.35);
    }

    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      padding: 8px 6px 0;
      color: var(--muted);
      font-size: 14px;
    }

    .footer-left,
    .footer-right {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      min-width: 130px;
      padding: 14px 22px;
      border: none;
      border-radius: 14px;
      cursor: pointer;
      color: white;
      font-size: 18px;
      font-weight: 800;
      background: linear-gradient(135deg, #6f84ff, #8b5cf6);
      box-shadow: 0 12px 28px rgba(111, 132, 255, 0.30);
      transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
    }

    .action-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 16px 30px rgba(111, 132, 255, 0.38);
    }

    .action-btn:active {
      transform: translateY(0);
    }

    .action-btn:disabled {
      opacity: 0.7;
      cursor: progress;
    }

    .hint {
      color: #c7cbd5;
    }

    .saving {
      color: #fbbf24;
    }

    .saved {
      color: #86efac;
    }

    .error {
      color: #fca5a5;
    }

    @media (max-width: 720px) {
      .app {
        padding: 12px;
      }

      .hero {
        padding: 16px;
        flex-direction: column;
        align-items: flex-start;
      }

      .brand-title {
        font-size: 22px;
      }

      .editor {
        font-size: 16px;
        padding: 16px;
      }

      .action-btn {
        width: 100%;
      }

      .footer {
        flex-direction: column;
        align-items: stretch;
      }

      .footer-right {
        justify-content: flex-start;
      }
    }
  </style>
</head>
<body>
  <div class="app">
    <header class="hero">
      <div class="brand">
        <div class="brand-mark">☁</div>
        <div class="brand-title">雲端記事本</div>
      </div>
      <div class="status-chip" id="cloudStatus">
        <span class="status-dot" id="statusDot"></span>
        <span id="statusText">未保存</span>
      </div>
    </header>

    <main class="workspace">
      <div class="file-bar">
        <div class="file-name">
          <span>📄</span>
          <span id="fileName">記事本.txt</span>
        </div>
      </div>

      <section class="editor-shell">
        <textarea id="editor" class="editor" placeholder="開始輸入您的筆記..."></textarea>
      </section>

      <footer class="footer">
        <div class="footer-left">
          <div id="editState" class="hint">編輯狀態：載入中</div>
          <div id="lastModified" class="hint">最後修改時間：-</div>
        </div>
        <div class="footer-right">
          <button id="saveBtn" class="action-btn" type="button">💾 Save</button>
        </div>
      </footer>
    </main>
  </div>

  <script>
    const initialData = ${safeData};
    const editor = document.getElementById('editor');
    const saveBtn = document.getElementById('saveBtn');
    const editState = document.getElementById('editState');
    const lastModified = document.getElementById('lastModified');
    const statusText = document.getElementById('statusText');
    const statusDot = document.getElementById('statusDot');
    const fileName = document.getElementById('fileName');

    let isDirty = false;
    let isSaving = false;
    let loadedAt = null;

    function formatDateTime(value) {
      if (!value) return '-';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '-';
      return new Intl.DateTimeFormat('zh-TW', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    }

    function setStatus(kind, text) {
      statusText.textContent = text;
      statusDot.style.background = kind === 'error' ? 'var(--danger)' : kind === 'saved' ? '#86efac' : kind === 'saving' ? '#fbbf24' : 'var(--ok)';
      statusDot.style.boxShadow = kind === 'error'
        ? '0 0 0 6px rgba(255, 112, 112, 0.16)'
        : kind === 'saved'
          ? '0 0 0 6px rgba(134, 239, 172, 0.16)'
          : kind === 'saving'
            ? '0 0 0 6px rgba(251, 191, 36, 0.16)'
            : '0 0 0 6px rgba(245, 184, 77, 0.16)';
    }

    function setEditState(text, cls) {
      editState.textContent = text;
      editState.className = cls;
    }

    function setLastModified(value) {
      lastModified.textContent = '最後修改時間：' + formatDateTime(value);
    }

    function refreshDirtyState() {
      if (isSaving) {
        setEditState('編輯狀態：儲存中', 'saving');
        return;
      }
      if (isDirty) {
        setEditState('編輯狀態：尚未儲存', 'hint');
        setStatus('unsaved', '未保存');
      } else {
        setEditState('編輯狀態：已同步至雲端', 'saved');
        setStatus('saved', '已保存');
      }
    }

    function loadNotebook() {
      fileName.textContent = initialData.name || '記事本.txt';
      editor.value = initialData.content || '';
      loadedAt = initialData.updatedAt || null;
      setLastModified(loadedAt);
      isDirty = false;
      refreshDirtyState();
      editor.focus();
      editor.setSelectionRange(editor.value.length, editor.value.length);
    }

    function saveNotebook() {
      if (isSaving) return;
      isSaving = true;
      saveBtn.disabled = true;
      setStatus('saving', '儲存中');
      setEditState('編輯狀態：儲存中', 'saving');

      google.script.run
        .withSuccessHandler((result) => {
          isSaving = false;
          saveBtn.disabled = false;
          isDirty = false;
          loadedAt = result.updatedAt || new Date().toISOString();
          setLastModified(loadedAt);
          setStatus('saved', '已保存');
          setEditState('編輯狀態：已同步至雲端', 'saved');
        })
        .withFailureHandler((error) => {
          isSaving = false;
          saveBtn.disabled = false;
          setStatus('error', '儲存失敗');
          setEditState('編輯狀態：儲存失敗', 'error');
          alert('儲存失敗：' + (error && error.message ? error.message : error));
          refreshDirtyState();
        })
        .saveNotebookData(editor.value);
    }

    editor.addEventListener('input', () => {
      isDirty = true;
      refreshDirtyState();
    });

    saveBtn.addEventListener('click', saveNotebook);

    window.addEventListener('beforeunload', (event) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    });

    loadNotebook();
  </script>
</body>
</html>`;
}
