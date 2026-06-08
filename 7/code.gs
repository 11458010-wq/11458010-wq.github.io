const SPREADSHEET_ID = '1t0Ww2BIN9oUY8vRauzeVglaR_IV7YKtUzDJOiZ65mhc';
const QUIZ_SIZE = 10;
const TOTAL_SCORE = 100;
const CACHE_TTL_SECONDS = 60 * 30;

function doGet() {
  return HtmlService.createHtmlOutput(buildHtml_())
    .setTitle('English Vocabulary Quiz')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function buildHtml_() {
  return `<!DOCTYPE html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>English Vocabulary Quiz</title>
    <style>
      :root {
        --bg-1: #0b1728;
        --bg-2: #13233d;
        --card: rgba(255, 255, 255, 0.9);
        --text: #172033;
        --muted: #4b5b76;
        --line: rgba(23, 32, 51, 0.15);
        --accent: #ff8a00;
        --accent-2: #ff4d4d;
        --ok: #0f9d58;
        --danger: #d93025;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Noto Sans TC", "Microsoft JhengHei", sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at 8% 12%, rgba(255, 138, 0, 0.35), transparent 30%),
          radial-gradient(circle at 90% 16%, rgba(255, 77, 77, 0.28), transparent 28%),
          linear-gradient(145deg, var(--bg-1), var(--bg-2));
      }

      .page {
        width: min(980px, 94vw);
        margin: 0 auto;
        padding: 24px 0 36px;
      }

      .hero {
        padding: 22px;
        border-radius: 22px;
        background: linear-gradient(130deg, rgba(255, 138, 0, 0.95), rgba(255, 77, 77, 0.9));
        color: #fff;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
        position: relative;
      }

      .designer {
        position: absolute;
        top: 16px;
        right: 16px;
        padding: 0.5rem 0.9rem;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.18);
        border: 1px solid rgba(255, 255, 255, 0.3);
        font-size: 0.9rem;
        font-weight: 600;
        color: #f5f5f5;
      }

      .hero h1 {
        margin: 0;
        font-size: clamp(1.5rem, 4vw, 2.3rem);
      }

      .hero p {
        margin: 0.6rem 0 0;
        line-height: 1.7;
      }

      .meta {
        margin-top: 0.9rem;
        display: inline-flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .chip {
        padding: 0.35rem 0.7rem;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.4);
        background: rgba(255, 255, 255, 0.15);
        font-size: 0.9rem;
      }

      .panel {
        margin-top: 16px;
        border: 1px solid var(--line);
        border-radius: 18px;
        background: var(--card);
        padding: 18px;
        box-shadow: 0 12px 34px rgba(0, 0, 0, 0.15);
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 12px;
      }

      button {
        border: none;
        border-radius: 12px;
        padding: 11px 18px;
        cursor: pointer;
        color: #fff;
        font-size: 1rem;
        font-weight: 800;
        background: linear-gradient(130deg, var(--accent), var(--accent-2));
      }

      button.secondary {
        background: linear-gradient(130deg, #3a6ff7, #2852c8);
      }

      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .status {
        min-height: 1.5rem;
        color: var(--muted);
      }

      .status.error {
        color: var(--danger);
      }

      .status.success {
        color: var(--ok);
      }

      .question {
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 14px;
        margin-top: 12px;
        background: #ffffff;
      }

      .q-title {
        margin: 0;
        line-height: 1.55;
        font-size: 1.06rem;
      }

      .options {
        margin-top: 10px;
        display: grid;
        gap: 8px;
      }

      .option {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        padding: 8px 9px;
        border: 1px solid var(--line);
        border-radius: 10px;
      }

      .result {
        margin-top: 14px;
        padding: 14px;
        border-radius: 12px;
        border: 1px dashed var(--line);
        background: #fff;
      }

      .result h2 {
        margin: 0 0 0.4rem;
        font-size: 1.25rem;
      }

      @media (max-width: 640px) {
        .page {
          width: 96vw;
          padding-top: 14px;
        }

        .hero,
        .panel {
          border-radius: 14px;
        }

        button {
          width: 100%;
        }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="hero">
        <div class="designer">資訊一 李宥叡</div>
        <h1>English Vocabulary Quiz</h1>
        <p>每次隨機抽 10 題，題目固定用中文發問，選項只提供英文可選，滿分 100 分。</p>
        <div class="meta">
          <span class="chip">10 Questions</span>
          <span class="chip">Multiple Choice</span>
          <span class="chip">Total: 100</span>
        </div>
      </section>

      <section class="panel">
        <div class="actions">
          <button id="startBtn" type="button">開始測驗</button>
          <button id="submitBtn" class="secondary" type="button" disabled>送出答案</button>
        </div>

        <p id="status" class="status">按下「開始測驗」後會載入隨機題目。</p>
        <div id="quizContainer"></div>
        <div id="result" class="result" style="display: none;"></div>
      </section>
    </main>

    <script>
      const startBtn = document.getElementById('startBtn');
      const submitBtn = document.getElementById('submitBtn');
      const statusEl = document.getElementById('status');
      const quizContainer = document.getElementById('quizContainer');
      const resultEl = document.getElementById('result');

      let currentQuiz = null;

      startBtn.addEventListener('click', loadQuiz);
      submitBtn.addEventListener('click', submitQuiz);

      function setStatus(message, type) {
        statusEl.textContent = message;
        statusEl.className = 'status' + (type ? ' ' + type : '');
      }

      function loadQuiz() {
        startBtn.disabled = true;
        submitBtn.disabled = true;
        resultEl.style.display = 'none';
        setStatus('題目載入中，請稍候...');

        google.script.run
          .withSuccessHandler(function(data) {
            currentQuiz = data;
            renderQuiz(data.questions);
            startBtn.disabled = false;
            submitBtn.disabled = false;
            setStatus('題目已載入，請完成 10 題後送出。', 'success');
          })
          .withFailureHandler(function(error) {
            startBtn.disabled = false;
            setStatus(error.message || '載入失敗，請稍後再試。', 'error');
          })
          .getQuiz();
      }

      function renderQuiz(questions) {
        quizContainer.innerHTML = '';

        questions.forEach(function(question) {
          const block = document.createElement('section');
          block.className = 'question';

          const title = document.createElement('p');
          title.className = 'q-title';
          title.textContent = question.order + '. ' + question.prompt;
          block.appendChild(title);

          const optionsWrap = document.createElement('div');
          optionsWrap.className = 'options';

          question.options.forEach(function(option, idx) {
            const label = document.createElement('label');
            label.className = 'option';

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = question.id;
            input.value = option.key;
            input.id = question.id + '_' + idx;

            const text = document.createElement('span');
            text.textContent = option.label;

            label.appendChild(input);
            label.appendChild(text);
            optionsWrap.appendChild(label);
          });

          block.appendChild(optionsWrap);
          quizContainer.appendChild(block);
        });
      }

      function submitQuiz() {
        if (!currentQuiz) {
          setStatus('請先載入題目。', 'error');
          return;
        }

        const answers = currentQuiz.questions.map(function(question) {
          const selected = document.querySelector('input[name="' + question.id + '"]:checked');
          return {
            id: question.id,
            answer: selected ? selected.value : ''
          };
        });

        const unansweredCount = answers.filter(function(item) {
          return !item.answer;
        }).length;

        if (unansweredCount > 0) {
          setStatus('還有 ' + unansweredCount + ' 題未作答。', 'error');
          return;
        }

        startBtn.disabled = true;
        submitBtn.disabled = true;
        setStatus('答案送出中...');

        google.script.run
          .withSuccessHandler(function(result) {
            startBtn.disabled = false;
            submitBtn.disabled = true;
            showResult(result);
            setStatus('測驗完成。', 'success');
          })
          .withFailureHandler(function(error) {
            startBtn.disabled = false;
            submitBtn.disabled = false;
            setStatus(error.message || '送出失敗，請再試一次。', 'error');
          })
          .submitQuiz({
            token: currentQuiz.token,
            answers: answers
          });
      }

      function showResult(result) {
        resultEl.style.display = 'block';
        resultEl.innerHTML =
          '<h2>你的分數：' + result.score + ' / ' + result.totalScore + '</h2>' +
          '<p>答對題數：' + result.correctCount + ' / ' + result.quizSize + '</p>';
      }
    </script>
  </body>
</html>`;
}

function getQuiz() {
  const wordPairs = getWordPairs_();

  if (wordPairs.length < QUIZ_SIZE) {
    throw new Error('資料不足，至少需要 10 組單字。');
  }

  const selectedPairs = pickRandomItems_(wordPairs, QUIZ_SIZE);
  const questions = selectedPairs.map(function(pair, index) {
    return buildQuestion_(pair, wordPairs, index + 1);
  });

  const answerMap = {};
  questions.forEach(function(question) {
    answerMap[question.id] = question.correct;
    delete question.correct;
  });

  const token = Utilities.getUuid();
  CacheService.getScriptCache().put(token, JSON.stringify(answerMap), CACHE_TTL_SECONDS);

  return {
    token: token,
    totalScore: TOTAL_SCORE,
    perQuestionScore: TOTAL_SCORE / QUIZ_SIZE,
    quizSize: QUIZ_SIZE,
    questions: questions
  };
}

function submitQuiz(payload) {
  if (!payload || !payload.token || !Array.isArray(payload.answers)) {
    throw new Error('送出資料格式不正確。');
  }

  const cache = CacheService.getScriptCache();
  const answerMapRaw = cache.get(payload.token);
  if (!answerMapRaw) {
    throw new Error('測驗已過期，請重新開始。');
  }

  const answerMap = JSON.parse(answerMapRaw);
  const answerById = {};
  payload.answers.forEach(function(item) {
    if (item && typeof item.id === 'string') {
      answerById[item.id] = item.answer;
    }
  });

  const questionIds = Object.keys(answerMap);
  const perQuestionScore = TOTAL_SCORE / QUIZ_SIZE;
  let correctCount = 0;

  const details = questionIds.map(function(questionId) {
    const expected = answerMap[questionId];
    const actual = answerById[questionId] || '';
    const isCorrect = actual === expected;
    if (isCorrect) {
      correctCount += 1;
    }

    return {
      id: questionId,
      correctAnswer: expected,
      yourAnswer: actual,
      isCorrect: isCorrect
    };
  });

  const score = Math.round(correctCount * perQuestionScore);

  return {
    score: score,
    totalScore: TOTAL_SCORE,
    correctCount: correctCount,
    quizSize: QUIZ_SIZE,
    details: details
  };
}

function getWordPairs_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheets()[0];
  const values = sheet.getDataRange().getValues();

  if (!values || values.length < 2) {
    throw new Error('試算表沒有可用題目。');
  }

  const headers = values[0].map(function(cell) {
    return normalizeText_(cell).toLowerCase();
  });
  const columnMap = resolveColumns_(headers);

  const records = values.slice(1).map(function(row) {
    return {
      left: normalizeText_(row[columnMap.left]),
      right: normalizeText_(row[columnMap.right])
    };
  }).filter(function(item) {
    return item.left && item.right;
  });

  return deduplicatePairs_(records);
}

function resolveColumns_(headers) {
  const leftIndex = findColumnIndex_(headers, /(中文|chinese|zh|國語|華語)/);
  const rightIndex = findColumnIndex_(headers, /(英文|english|en)/);

  if (leftIndex >= 0 && rightIndex >= 0 && leftIndex !== rightIndex) {
    return { left: leftIndex, right: rightIndex };
  }

  return { left: 0, right: 1 };
}

function findColumnIndex_(headers, pattern) {
  for (let i = 0; i < headers.length; i += 1) {
    if (pattern.test(headers[i])) {
      return i;
    }
  }
  return -1;
}

function deduplicatePairs_(records) {
  const seen = {};
  const result = [];

  records.forEach(function(item) {
    const key = item.left + '||' + item.right;
    if (!seen[key]) {
      seen[key] = true;
      result.push(item);
    }
  });

  return result;
}

function buildQuestion_(pair, allPairs, order) {
  const prompt = '中文：「' + pair.left + '」對應哪個英文？';

  const distractorCandidates = allPairs.filter(function(item) {
    return pairKey_(item) !== pairKey_(pair);
  });
  const distractors = pickRandomItems_(distractorCandidates, Math.min(3, distractorCandidates.length));

  // 題庫不足時，以現有題目補齊，並於前端去除重複鍵。
  while (distractors.length < 3 && allPairs.length > 0) {
    distractors.push(allPairs[distractors.length % allPairs.length]);
  }

  const optionPairs = shuffle_(distractors.concat([pair]));
  const seenOptionKeys = {};
  const options = optionPairs.filter(function(item) {
    const key = pairKey_(item);
    if (seenOptionKeys[key]) {
      return false;
    }
    seenOptionKeys[key] = true;
    return true;
  }).map(function(item) {
    return {
      key: pairKey_(item),
      label: item.right
    };
  });

  while (options.length < 4 && allPairs.length > 0) {
    const filler = allPairs[options.length % allPairs.length];
    const fillerKey = pairKey_(filler);
    if (seenOptionKeys[fillerKey]) {
      continue;
    }
    seenOptionKeys[fillerKey] = true;
    options.push({
      key: fillerKey,
      label: filler.right
    });
  }

  return {
    id: Utilities.getUuid(),
    order: order,
    prompt: prompt,
    options: options,
    correct: pairKey_(pair)
  };
}

function pairKey_(pair) {
  return pair.left + '||' + pair.right;
}

function pickRandomItems_(source, count) {
  const copy = source.slice();
  shuffle_(copy);
  return copy.slice(0, count);
}

function shuffle_(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
  return array;
}

function normalizeText_(value) {
  return value == null ? '' : String(value).trim();
}
