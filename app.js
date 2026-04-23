// ====================================
// APP PRINCIPAL - SIMPLE PAST
// ====================================

// ============ ESTADO GLOBAL ============
let state = {
  nie: null,
  student: null,
  partners: [],
  answers: {},
  exercises: [],
  scores: {},
  extraPoints: 0,
  tttPlayed: false
};

const STORAGE_KEY = 'simplePast_v1_state';

// ============ ANTI-COPY / ANTI-TRANSLATE ============
document.addEventListener('copy', e => e.preventDefault());
document.addEventListener('cut', e => e.preventDefault());
document.addEventListener('paste', e => {
  // Permitir pegar solo en inputs del login y NIE del compañero
  const target = e.target;
  if (!target.matches('#nieInput, #partnerNie')) {
    e.preventDefault();
  }
});
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('selectstart', e => {
  const target = e.target;
  if (!target.matches('input, textarea')) {
    e.preventDefault();
  }
});

// ============ AUTO-SCROLL PARA DRAG ============
let autoScrollInterval = null;
function startAutoScroll() {
  if (autoScrollInterval) return;
  autoScrollInterval = setInterval(() => {
    if (window._dragY === undefined) return;
    const y = window._dragY;
    const h = window.innerHeight;
    const zone = 70;
    if (y < zone) {
      window.scrollBy(0, -10);
    } else if (y > h - zone) {
      window.scrollBy(0, 10);
    }
  }, 20);
}
function stopAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
  window._dragY = undefined;
}

// ============ UTILIDADES ============
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      nie: state.nie,
      student: state.student,
      partners: state.partners,
      answers: state.answers,
      scores: state.scores,
      extraPoints: state.extraPoints,
      tttPlayed: state.tttPlayed,
      exerciseTypes: state.exercises.map(e => ({ type: e.type, title: e.title }))
    }));
  } catch (e) {
    console.warn('No se pudo guardar estado', e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

function normalizeText(t) {
  return (t || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============ LOGIN ============
const mascotEmojis = ['🤖', '😊', '🎓', '📚', '✏️', '🌟'];
let mascotIdx = 0;
setInterval(() => {
  const mascot = document.getElementById('mascot');
  if (mascot) {
    mascotIdx = (mascotIdx + 1) % mascotEmojis.length;
    mascot.textContent = mascotEmojis[mascotIdx];
  }
}, 2000);

document.getElementById('loginBtn').addEventListener('click', handleLogin);
document.getElementById('nieInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleLogin();
});

function handleLogin() {
  const nie = document.getElementById('nieInput').value.trim();
  const errorEl = document.getElementById('loginError');
  if (!nie) {
    errorEl.textContent = 'Por favor ingresa tu NIE';
    return;
  }
  const student = STUDENTS[nie];
  if (!student) {
    errorEl.textContent = 'NIE no encontrado. Verifica con tu profesor.';
    const mascot = document.getElementById('mascot');
    mascot.textContent = '😕';
    setTimeout(() => { mascot.textContent = '🤖'; }, 1500);
    return;
  }
  state.nie = nie;
  state.student = student;
  enterApp();
}

function enterApp() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');
  document.getElementById('studentName').textContent = state.student.name;
  document.getElementById('studentNie').textContent = state.nie;
  document.getElementById('studentGrade').textContent = state.student.grade;
  renderPartners();
  initExercises();
  saveState();
}

// ============ COMPANEROS ============
document.getElementById('addPartnerBtn').addEventListener('click', () => {
  document.getElementById('partnerModal').classList.remove('hidden');
  document.getElementById('partnerNie').value = '';
  document.getElementById('partnerError').textContent = '';
});

document.getElementById('cancelPartnerBtn').addEventListener('click', () => {
  document.getElementById('partnerModal').classList.add('hidden');
});

document.getElementById('confirmPartnerBtn').addEventListener('click', () => {
  const nie = document.getElementById('partnerNie').value.trim();
  const errorEl = document.getElementById('partnerError');
  if (!nie) {
    errorEl.textContent = 'Ingresa un NIE';
    return;
  }
  if (nie === state.nie) {
    errorEl.textContent = 'Ese es tu propio NIE';
    return;
  }
  if (state.partners.some(p => p.nie === nie)) {
    errorEl.textContent = 'Ya agregaste a ese companero';
    return;
  }
  const student = STUDENTS[nie];
  if (!student) {
    errorEl.textContent = 'NIE no encontrado';
    return;
  }
  state.partners.push({ nie, name: student.name, grade: student.grade });
  renderPartners();
  saveState();
  document.getElementById('partnerModal').classList.add('hidden');
});

function renderPartners() {
  const container = document.getElementById('partnersContainer');
  container.innerHTML = '';
  if (state.partners.length === 0) return;
  const label = document.createElement('p');
  label.innerHTML = '<strong>Companeros:</strong>';
  container.appendChild(label);
  state.partners.forEach((p, idx) => {
    const chip = document.createElement('span');
    chip.className = 'partner-chip';
    chip.innerHTML = `${p.name} (${p.nie}) <span class="remove-p" data-idx="${idx}">✕</span>`;
    container.appendChild(chip);
  });
  container.querySelectorAll('.remove-p').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = parseInt(e.target.dataset.idx);
      state.partners.splice(idx, 1);
      renderPartners();
      saveState();
    });
  });
}

// ============ INIT EXERCISES ============
function initExercises() {
  const saved = loadState();
  // Si hay ejercicios guardados del mismo usuario, los mantenemos
  if (saved && saved.nie === state.nie && saved.exerciseTypes && saved.exerciseTypes.length) {
    // Reconstruir ejercicios iguales (mismo pool, mismo título)
    state.exercises = saved.exerciseTypes.map(savedEx => {
      const pool = EXERCISES_POOL[savedEx.type];
      if (!pool) return null;
      const found = pool.find(e => e.title === savedEx.title);
      return found || pool[0];
    }).filter(e => e !== null);
    state.answers = saved.answers || {};
    state.scores = saved.scores || {};
    state.partners = saved.partners || [];
    state.extraPoints = saved.extraPoints || 0;
    state.tttPlayed = saved.tttPlayed || false;
    renderPartners();
  } else {
    state.exercises = getExercisesList();
    state.answers = {};
    state.scores = {};
  }
  renderExercises();
}

function renderExercises() {
  const container = document.getElementById('exercisesContainer');
  container.innerHTML = '';
  state.exercises.forEach((ex, idx) => {
    const card = buildExerciseCard(ex, idx);
    container.appendChild(card);
  });
  // Agregar el juego XO como último
  const tttCard = buildTicTacToe();
  container.appendChild(tttCard);
}

function buildExerciseCard(exercise, index) {
  const card = document.createElement('div');
  card.className = 'exercise-card';
  card.dataset.exerciseIndex = index;

  const header = document.createElement('div');
  header.className = 'exercise-header';
  header.innerHTML = `
    <div class="exercise-number">${index + 1}</div>
    <div class="exercise-title">${exercise.title}</div>
  `;
  card.appendChild(header);

  const instructions = document.createElement('div');
  instructions.className = 'exercise-instructions';
  instructions.textContent = '📝 ' + exercise.instructions;
  card.appendChild(instructions);

  const body = document.createElement('div');
  body.className = 'exercise-body';
  renderExerciseBody(exercise, index, body);
  card.appendChild(body);

  return card;
}

function renderExerciseBody(exercise, index, container) {
  switch (exercise.type) {
    case 'multipleChoice': renderMultipleChoice(exercise, index, container); break;
    case 'fillInTheBlank': renderFillInTheBlank(exercise, index, container); break;
    case 'dragDropWords': renderDragDropWords(exercise, index, container); break;
    case 'unscrambleWords': renderUnscrambleWords(exercise, index, container); break;
    case 'reorderSentences': renderReorderSentences(exercise, index, container); break;
    case 'trueFalse': renderTrueFalse(exercise, index, container); break;
    case 'wordSearch': renderWordSearch(exercise, index, container); break;
    case 'categorization': renderCategorization(exercise, index, container); break;
    case 'dropdown': renderDropdown(exercise, index, container); break;
    case 'errorIdentification': renderErrorIdentification(exercise, index, container); break;
    case 'emojiSentence': renderEmojiSentence(exercise, index, container); break;
    case 'matchImages': renderMatchImages(exercise, index, container); break;
    case 'matchingLines': renderMatchingLines(exercise, index, container); break;
  }
}

// ============ 1. MULTIPLE CHOICE ============
function renderMultipleChoice(ex, idx, container) {
  const answerKey = `ex${idx}`;
  if (!state.answers[answerKey]) state.answers[answerKey] = {};
  ex.questions.forEach((q, qi) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'mc-question';
    const qP = document.createElement('p');
    qP.textContent = `${qi + 1}. ${q.q}`;
    qDiv.appendChild(qP);
    const optsDiv = document.createElement('div');
    optsDiv.className = 'mc-options';
    q.options.forEach((opt, oi) => {
      const label = document.createElement('label');
      label.className = 'mc-option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `mc-${idx}-${qi}`;
      input.value = oi;
      if (state.answers[answerKey][qi] === oi) {
        input.checked = true;
        label.classList.add('selected');
      }
      input.addEventListener('change', () => {
        state.answers[answerKey][qi] = oi;
        optsDiv.querySelectorAll('.mc-option').forEach(l => l.classList.remove('selected'));
        label.classList.add('selected');
        saveState();
      });
      label.appendChild(input);
      label.appendChild(document.createTextNode(' ' + opt));
      optsDiv.appendChild(label);
    });
    qDiv.appendChild(optsDiv);
    container.appendChild(qDiv);
  });
}

// ============ 2. FILL IN THE BLANK ============
function renderFillInTheBlank(ex, idx, container) {
  const answerKey = `ex${idx}`;
  if (!state.answers[answerKey]) state.answers[answerKey] = {};
  ex.sentences.forEach((s, si) => {
    const div = document.createElement('div');
    div.className = 'fib-sentence';
    const span1 = document.createElement('span');
    span1.textContent = `${si + 1}. ${s.parts[0]}`;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'fib-input';
    input.autocomplete = 'off';
    input.autocapitalize = 'none';
    input.spellcheck = false;
    input.value = state.answers[answerKey][si] || '';
    input.addEventListener('input', () => {
      state.answers[answerKey][si] = input.value;
      saveState();
    });
    const span2 = document.createElement('span');
    span2.textContent = s.parts[1];
    div.appendChild(span1);
    div.appendChild(input);
    div.appendChild(span2);
    container.appendChild(div);
  });
}

// ============ DRAG & DROP HELPERS (mouse + touch) ============
function setupDraggable(el, onDrop) {
  el.draggable = true;
  el.dataset.draggable = 'true';

  // Mouse
  el.addEventListener('dragstart', e => {
    el.classList.add('dragging');
    e.dataTransfer.setData('text/plain', el.dataset.word || el.textContent);
    window._currentDragEl = el;
  });
  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
    window._currentDragEl = null;
  });

  // Touch - crear clon para seguir el dedo
  let clone = null;
  let touchActive = false;

  el.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    touchActive = true;
    window._currentDragEl = el;
    el.classList.add('dragging');
    const touch = e.touches[0];
    const rect = el.getBoundingClientRect();
    clone = el.cloneNode(true);
    clone.classList.add('drag-clone');
    clone.style.width = rect.width + 'px';
    clone.style.left = (touch.clientX - rect.width / 2) + 'px';
    clone.style.top = (touch.clientY - rect.height / 2) + 'px';
    document.body.appendChild(clone);
    startAutoScroll();
  }, { passive: true });

  el.addEventListener('touchmove', e => {
    if (!touchActive || !clone) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = clone.getBoundingClientRect();
    clone.style.left = (touch.clientX - rect.width / 2) + 'px';
    clone.style.top = (touch.clientY - rect.height / 2) + 'px';
    window._dragY = touch.clientY;

    // Resaltar zonas
    document.querySelectorAll('.drop-zone, .drop-zone-match, .cat-column, .word-bank').forEach(z => {
      z.classList.remove('drag-over');
    });
    const below = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropTarget = below?.closest('.drop-zone, .drop-zone-match, .cat-column, .word-bank');
    if (dropTarget) dropTarget.classList.add('drag-over');
  }, { passive: false });

  el.addEventListener('touchend', e => {
    if (!touchActive) return;
    touchActive = false;
    el.classList.remove('dragging');
    stopAutoScroll();

    const touch = e.changedTouches[0];
    if (clone) clone.style.display = 'none';
    const below = document.elementFromPoint(touch.clientX, touch.clientY);
    if (clone) { clone.remove(); clone = null; }

    document.querySelectorAll('.drop-zone, .drop-zone-match, .cat-column, .word-bank').forEach(z => {
      z.classList.remove('drag-over');
    });

    const dropTarget = below?.closest('.drop-zone, .drop-zone-match, .cat-column, .word-bank');
    if (dropTarget && onDrop) {
      onDrop(dropTarget, el);
    }
    window._currentDragEl = null;
  });

  el.addEventListener('touchcancel', () => {
    touchActive = false;
    el.classList.remove('dragging');
    stopAutoScroll();
    if (clone) { clone.remove(); clone = null; }
    document.querySelectorAll('.drop-zone, .drop-zone-match, .cat-column, .word-bank').forEach(z => {
      z.classList.remove('drag-over');
    });
  });
}

function setupDropZone(zone, onDrop) {
  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });
  zone.addEventListener('dragleave', () => {
    zone.classList.remove('drag-over');
  });
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const el = window._currentDragEl;
    if (el && onDrop) onDrop(zone, el);
  });
}

// ============ 3. DRAG & DROP WORDS ============
function renderDragDropWords(ex, idx, container) {
  const answerKey = `ex${idx}`;
  if (!state.answers[answerKey]) state.answers[answerKey] = {};

  const bank = document.createElement('div');
  bank.className = 'word-bank';
  bank.dataset.role = 'bank';
  bank.dataset.exerciseIdx = idx;

  // Palabras que aún no han sido colocadas
  const usedAnswers = Object.values(state.answers[answerKey] || {});
  const wordsInBank = [...ex.wordBank];

  ex.wordBank.forEach((word, wi) => {
    const w = document.createElement('div');
    w.className = 'draggable-word';
    w.textContent = word;
    w.dataset.word = word;
    w.dataset.originalBank = idx;
    setupDraggable(w, (target, draggedEl) => handleDropWord(target, draggedEl, idx));
    bank.appendChild(w);
  });

  setupDropZone(bank, (target, draggedEl) => handleDropWord(target, draggedEl, idx));
  container.appendChild(bank);

  const sentencesDiv = document.createElement('div');
  ex.sentences.forEach((s, si) => {
    const sDiv = document.createElement('div');
    sDiv.className = 'dd-sentence';
    const t1 = document.createElement('span');
    t1.textContent = `${si + 1}. ${s.parts[0]}`;
    const zone = document.createElement('span');
    zone.className = 'drop-zone';
    zone.dataset.sentenceIdx = si;
    zone.dataset.exerciseIdx = idx;
    const t2 = document.createElement('span');
    t2.textContent = s.parts[1];
    sDiv.appendChild(t1);
    sDiv.appendChild(zone);
    sDiv.appendChild(t2);
    setupDropZone(zone, (target, draggedEl) => handleDropWord(target, draggedEl, idx));
    sentencesDiv.appendChild(sDiv);
  });
  container.appendChild(sentencesDiv);

  // Restaurar respuestas guardadas
  setTimeout(() => restoreDragDropWords(idx, bank, sentencesDiv), 50);
}

function restoreDragDropWords(idx, bank, sentencesDiv) {
  const answerKey = `ex${idx}`;
  const answers = state.answers[answerKey] || {};
  Object.entries(answers).forEach(([sentIdx, word]) => {
    if (!word) return;
    const wordEl = bank.querySelector(`[data-word="${CSS.escape(word)}"]`);
    const zone = sentencesDiv.querySelector(`.drop-zone[data-sentence-idx="${sentIdx}"]`);
    if (wordEl && zone && !zone.querySelector('.draggable-word')) {
      zone.appendChild(wordEl);
      zone.classList.add('filled');
    }
  });
}

function handleDropWord(target, draggedEl, exerciseIdx) {
  const answerKey = `ex${exerciseIdx}`;
  if (!state.answers[answerKey]) state.answers[answerKey] = {};

  // Si la zona tiene ya un item, regresarlo al banco
  const bank = document.querySelector(`.word-bank[data-exercise-idx="${exerciseIdx}"]`);

  if (target.classList.contains('drop-zone')) {
    const existing = target.querySelector('.draggable-word');
    if (existing && existing !== draggedEl) {
      bank.appendChild(existing);
    }
    // Si el elemento arrastrado venía de otra zona, limpiar esa zona
    const prevZone = draggedEl.parentElement;
    if (prevZone && prevZone.classList.contains('drop-zone')) {
      prevZone.classList.remove('filled');
      const prevSi = prevZone.dataset.sentenceIdx;
      if (prevSi !== undefined) delete state.answers[answerKey][prevSi];
    }
    target.appendChild(draggedEl);
    target.classList.add('filled');
    state.answers[answerKey][target.dataset.sentenceIdx] = draggedEl.dataset.word;
  } else if (target.classList.contains('word-bank')) {
    // Regresar al banco
    const prevZone = draggedEl.parentElement;
    if (prevZone && prevZone.classList.contains('drop-zone')) {
      prevZone.classList.remove('filled');
      const prevSi = prevZone.dataset.sentenceIdx;
      if (prevSi !== undefined) delete state.answers[answerKey][prevSi];
    }
    target.appendChild(draggedEl);
  }
  saveState();
}

// ============ 4. UNSCRAMBLE WORDS ============
function renderUnscrambleWords(ex, idx, container) {
  const answerKey = `ex${idx}`;
  if (!state.answers[answerKey]) state.answers[answerKey] = {};
  ex.words.forEach((w, wi) => {
    const div = document.createElement('div');
    div.className = 'scramble-item';
    const label = document.createElement('div');
    label.className = 'scramble-label';
    label.textContent = `${wi + 1}. ${w.hint}`;
    const scrDiv = document.createElement('div');
    const scrSpan = document.createElement('span');
    scrSpan.className = 'scrambled-word';
    scrSpan.textContent = w.scrambled;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'scramble-input';
    input.placeholder = 'Escribe el verbo...';
    input.autocomplete = 'off';
    input.autocapitalize = 'none';
    input.spellcheck = false;
    input.value = state.answers[answerKey][wi] || '';
    input.addEventListener('input', () => {
      state.answers[answerKey][wi] = input.value;
      saveState();
    });
    scrDiv.appendChild(scrSpan);
    scrDiv.appendChild(input);
    div.appendChild(label);
    div.appendChild(scrDiv);
    container.appendChild(div);
  });
}

// ============ 5. REORDER SENTENCES (con audio) ============
function renderReorderSentences(ex, idx, container) {
  const answerKey = `ex${idx}`;

  if (ex.audioFile) {
    const audioDiv = document.createElement('div');
    audioDiv.className = 'audio-player';
    audioDiv.innerHTML = `
      <p>🔊 Escucha el audio tantas veces como necesites:</p>
      <audio controls controlsList="nodownload" src="${ex.audioFile}"></audio>
    `;
    container.appendChild(audioDiv);
  }

  // Orden guardado o inicial
  let currentOrder = state.answers[answerKey] && state.answers[answerKey].order
    ? state.answers[answerKey].order
    : [...ex.scrambled];

  const list = document.createElement('div');
  list.className = 'reorder-list';
  list.dataset.exerciseIdx = idx;

  function renderList() {
    list.innerHTML = '';
    currentOrder.forEach((sentence, si) => {
      const item = document.createElement('div');
      item.className = 'reorder-item';
      item.textContent = `${si + 1}. ${sentence}`;
      item.dataset.sentence = sentence;
      item.dataset.position = si;
      setupReorderItem(item, list, idx);
      list.appendChild(item);
    });
  }

  renderList();
  container.appendChild(list);

  state.answers[answerKey] = { order: currentOrder };
  saveState();

  // Función para cuando se suelta un item
  list._onReorder = () => {
    const newOrder = Array.from(list.querySelectorAll('.reorder-item')).map(el => el.dataset.sentence);
    state.answers[answerKey] = { order: newOrder };
    currentOrder = newOrder;
    renderList();
    saveState();
  };
}

function setupReorderItem(item, list, idx) {
  item.draggable = true;
  let clone = null;
  let touchActive = false;

  item.addEventListener('dragstart', e => {
    item.classList.add('dragging');
    window._reorderDragEl = item;
    e.dataTransfer.effectAllowed = 'move';
  });
  item.addEventListener('dragend', () => {
    item.classList.remove('dragging');
    window._reorderDragEl = null;
  });
  item.addEventListener('dragover', e => {
    e.preventDefault();
    const dragged = window._reorderDragEl;
    if (!dragged || dragged === item) return;
    const rect = item.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    if (after) {
      item.parentNode.insertBefore(dragged, item.nextSibling);
    } else {
      item.parentNode.insertBefore(dragged, item);
    }
  });
  item.addEventListener('drop', () => {
    if (list._onReorder) list._onReorder();
  });

  // Touch
  item.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    touchActive = true;
    const touch = e.touches[0];
    const rect = item.getBoundingClientRect();
    clone = item.cloneNode(true);
    clone.classList.add('drag-clone');
    clone.style.width = rect.width + 'px';
    clone.style.left = rect.left + 'px';
    clone.style.top = (touch.clientY - rect.height / 2) + 'px';
    document.body.appendChild(clone);
    item.style.opacity = '0.3';
    window._reorderDragEl = item;
    startAutoScroll();
  }, { passive: true });

  item.addEventListener('touchmove', e => {
    if (!touchActive || !clone) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = clone.getBoundingClientRect();
    clone.style.top = (touch.clientY - rect.height / 2) + 'px';
    window._dragY = touch.clientY;

    // Detectar posición
    clone.style.display = 'none';
    const below = document.elementFromPoint(touch.clientX, touch.clientY);
    clone.style.display = '';
    const overItem = below?.closest('.reorder-item');
    if (overItem && overItem !== item && overItem.parentNode === list) {
      const rect2 = overItem.getBoundingClientRect();
      const after = touch.clientY > rect2.top + rect2.height / 2;
      if (after) {
        list.insertBefore(item, overItem.nextSibling);
      } else {
        list.insertBefore(item, overItem);
      }
    }
  }, { passive: false });

  item.addEventListener('touchend', () => {
    if (!touchActive) return;
    touchActive = false;
    item.style.opacity = '';
    if (clone) { clone.remove(); clone = null; }
    stopAutoScroll();
    if (list._onReorder) list._onReorder();
    window._reorderDragEl = null;
  });

  item.addEventListener('touchcancel', () => {
    touchActive = false;
    item.style.opacity = '';
    if (clone) { clone.remove(); clone = null; }
    stopAutoScroll();
  });
}

// ============ 6. TRUE / FALSE ============
function renderTrueFalse(ex, idx, container) {
  const answerKey = `ex${idx}`;
  if (!state.answers[answerKey]) state.answers[answerKey] = {};
  ex.questions.forEach((q, qi) => {
    const div = document.createElement('div');
    div.className = 'tf-question';
    const p = document.createElement('p');
    p.textContent = `${qi + 1}. ${q.q}`;
    const btns = document.createElement('div');
    btns.className = 'tf-buttons';
    const tBtn = document.createElement('button');
    tBtn.className = 'tf-btn';
    tBtn.textContent = '✓ V';
    const fBtn = document.createElement('button');
    fBtn.className = 'tf-btn';
    fBtn.textContent = '✗ F';
    if (state.answers[answerKey][qi] === true) tBtn.classList.add('selected-true');
    if (state.answers[answerKey][qi] === false) fBtn.classList.add('selected-false');
    tBtn.addEventListener('click', () => {
      state.answers[answerKey][qi] = true;
      tBtn.classList.add('selected-true');
      fBtn.classList.remove('selected-false');
      saveState();
    });
    fBtn.addEventListener('click', () => {
      state.answers[answerKey][qi] = false;
      fBtn.classList.add('selected-false');
      tBtn.classList.remove('selected-true');
      saveState();
    });
    btns.appendChild(tBtn);
    btns.appendChild(fBtn);
    div.appendChild(p);
    div.appendChild(btns);
    container.appendChild(div);
  });
}

// ============ 7. WORD SEARCH ============
function renderWordSearch(ex, idx, container) {
  const answerKey = `ex${idx}`;
  if (!state.answers[answerKey]) state.answers[answerKey] = { found: [] };

  const wrap = document.createElement('div');
  wrap.className = 'wordsearch-container';

  const gridSize = 11;
  const grid = generateWordSearchGrid(ex.words, gridSize);

  const gridEl = document.createElement('div');
  gridEl.className = 'wordsearch-grid';
  gridEl.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

  const cells = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const cell = document.createElement('div');
      cell.className = 'ws-cell';
      cell.textContent = grid[r][c];
      cell.dataset.r = r;
      cell.dataset.c = c;
      gridEl.appendChild(cell);
      cells.push(cell);
    }
  }

  const listEl = document.createElement('div');
  listEl.className = 'wordsearch-words';
  listEl.innerHTML = '<h4>🔎 Palabras a encontrar:</h4>';
  const ul = document.createElement('ul');
  ex.words.forEach(w => {
    const li = document.createElement('li');
    li.textContent = w;
    li.dataset.word = w;
    if (state.answers[answerKey].found.includes(w)) li.classList.add('found');
    ul.appendChild(li);
  });
  listEl.appendChild(ul);

  wrap.appendChild(gridEl);
  wrap.appendChild(listEl);
  container.appendChild(wrap);

  // Restaurar celdas encontradas
  if (state.answers[answerKey].foundCells) {
    state.answers[answerKey].foundCells.forEach(coord => {
      const [r, c] = coord;
      const cell = cells.find(x => parseInt(x.dataset.r) === r && parseInt(x.dataset.c) === c);
      if (cell) cell.classList.add('found');
    });
  }

  // Selección arrastrando
  let selecting = false;
  let startCell = null;
  let selected = [];

  function getCellAt(x, y) {
    const el = document.elementFromPoint(x, y);
    if (el && el.classList.contains('ws-cell')) return el;
    return null;
  }

  function clearSelection() {
    selected.forEach(c => c.classList.remove('selecting'));
    selected = [];
  }

  function lineCells(start, end) {
    const r1 = parseInt(start.dataset.r), c1 = parseInt(start.dataset.c);
    const r2 = parseInt(end.dataset.r), c2 = parseInt(end.dataset.c);
    const dr = Math.sign(r2 - r1), dc = Math.sign(c2 - c1);
    const len = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1)) + 1;
    // Solo lineas rectas (horizontal, vertical, diagonal)
    if (!(dr === 0 || dc === 0 || Math.abs(r2 - r1) === Math.abs(c2 - c1))) return null;
    const result = [];
    for (let i = 0; i < len; i++) {
      const r = r1 + dr * i, c = c1 + dc * i;
      const cell = cells.find(x => parseInt(x.dataset.r) === r && parseInt(x.dataset.c) === c);
      if (!cell) return null;
      result.push(cell);
    }
    return result;
  }

  function updateSelection(endCell) {
    clearSelection();
    const line = lineCells(startCell, endCell);
    if (line) {
      line.forEach(c => c.classList.add('selecting'));
      selected = line;
    }
  }

  function commitSelection() {
    const word = selected.map(c => c.textContent).join('');
    const reversed = word.split('').reverse().join('');
    let found = null;
    if (ex.words.includes(word)) found = word;
    else if (ex.words.includes(reversed)) found = reversed;
    if (found && !state.answers[answerKey].found.includes(found)) {
      state.answers[answerKey].found.push(found);
      selected.forEach(c => {
        c.classList.add('found');
        c.classList.remove('selecting');
        if (!state.answers[answerKey].foundCells) state.answers[answerKey].foundCells = [];
        state.answers[answerKey].foundCells.push([parseInt(c.dataset.r), parseInt(c.dataset.c)]);
      });
      const li = ul.querySelector(`[data-word="${found}"]`);
      if (li) li.classList.add('found');
      saveState();
    } else {
      clearSelection();
    }
  }

  // Mouse events
  gridEl.addEventListener('mousedown', e => {
    if (e.target.classList.contains('ws-cell')) {
      selecting = true;
      startCell = e.target;
      clearSelection();
      e.target.classList.add('selecting');
      selected = [e.target];
    }
  });
  gridEl.addEventListener('mousemove', e => {
    if (!selecting) return;
    const cell = getCellAt(e.clientX, e.clientY);
    if (cell) updateSelection(cell);
  });
  document.addEventListener('mouseup', () => {
    if (selecting) {
      selecting = false;
      commitSelection();
    }
  });

  // Touch events
  gridEl.addEventListener('touchstart', e => {
    const touch = e.touches[0];
    const cell = getCellAt(touch.clientX, touch.clientY);
    if (cell) {
      selecting = true;
      startCell = cell;
      clearSelection();
      cell.classList.add('selecting');
      selected = [cell];
      startAutoScroll();
    }
  }, { passive: true });
  gridEl.addEventListener('touchmove', e => {
    if (!selecting) return;
    e.preventDefault();
    const touch = e.touches[0];
    window._dragY = touch.clientY;
    const cell = getCellAt(touch.clientX, touch.clientY);
    if (cell) updateSelection(cell);
  }, { passive: false });
  gridEl.addEventListener('touchend', () => {
    if (selecting) {
      selecting = false;
      stopAutoScroll();
      commitSelection();
    }
  });
}

function generateWordSearchGrid(words, size) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  const directions = [
    [0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]
  ];

  function canPlace(word, r, c, dr, dc) {
    for (let i = 0; i < word.length; i++) {
      const nr = r + dr * i, nc = c + dc * i;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) return false;
      if (grid[nr][nc] !== null && grid[nr][nc] !== word[i]) return false;
    }
    return true;
  }

  function placeWord(word) {
    for (let attempt = 0; attempt < 200; attempt++) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      if (canPlace(word, r, c, dir[0], dir[1])) {
        for (let i = 0; i < word.length; i++) {
          grid[r + dir[0] * i][c + dir[1] * i] = word[i];
        }
        return true;
      }
    }
    return false;
  }

  words.forEach(w => placeWord(w.toUpperCase()));

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === null) {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
  return grid;
}

// ============ 8. CATEGORIZATION ============
function renderCategorization(ex, idx, container) {
  const answerKey = `ex${idx}`;
  if (!state.answers[answerKey]) state.answers[answerKey] = {};

  // Banco de items
  const bank = document.createElement('div');
  bank.className = 'word-bank';
  bank.dataset.exerciseIdx = idx;
  bank.dataset.role = 'cat-bank';

  ex.items.forEach((item, ii) => {
    const w = document.createElement('div');
    w.className = 'draggable-word';
    w.textContent = item.word;
    w.dataset.word = item.word;
    w.dataset.itemIdx = ii;
    setupDraggable(w, (target, draggedEl) => handleCatDrop(target, draggedEl, idx));
    bank.appendChild(w);
  });

  setupDropZone(bank, (target, draggedEl) => handleCatDrop(target, draggedEl, idx));
  container.appendChild(bank);

  const cols = document.createElement('div');
  cols.className = 'cat-columns';
  ex.categories.forEach(cat => {
    const col = document.createElement('div');
    col.className = 'cat-column';
    col.dataset.catId = cat.id;
    col.dataset.exerciseIdx = idx;
    const h = document.createElement('h4');
    h.textContent = cat.label;
    const itemsDiv = document.createElement('div');
    itemsDiv.className = 'cat-items';
    col.appendChild(h);
    col.appendChild(itemsDiv);
    setupDropZone(col, (target, draggedEl) => handleCatDrop(target, draggedEl, idx));
    cols.appendChild(col);
  });
  container.appendChild(cols);

  // Restaurar
  setTimeout(() => {
    Object.entries(state.answers[answerKey]).forEach(([word, catId]) => {
      const el = bank.querySelector(`[data-word="${CSS.escape(word)}"]`);
      const col = cols.querySelector(`[data-cat-id="${catId}"] .cat-items`);
      if (el && col) col.appendChild(el);
    });
  }, 50);
}

function handleCatDrop(target, draggedEl, exerciseIdx) {
  const answerKey = `ex${exerciseIdx}`;
  if (!state.answers[answerKey]) state.answers[answerKey] = {};
  const word = draggedEl.dataset.word;
  if (target.classList.contains('cat-column')) {
    const itemsDiv = target.querySelector('.cat-items');
    itemsDiv.appendChild(draggedEl);
    state.answers[answerKey][word] = target.dataset.catId;
  } else if (target.classList.contains('word-bank')) {
    target.appendChild(draggedEl);
    delete state.answers[answerKey][word];
  }
  saveState();
}

// ============ 9. DROPDOWN ============
function renderDropdown(ex, idx, container) {
  const answerKey = `ex${idx}`;
  if (!state.answers[answerKey]) state.answers[answerKey] = {};
  ex.sentences.forEach((s, si) => {
    const div = document.createElement('div');
    div.className = 'fib-sentence';
    const t1 = document.createElement('span');
    t1.textContent = `${si + 1}. ${s.parts[0]}`;
    const select = document.createElement('select');
    select.className = 'dd-select';
    const empty = document.createElement('option');
    empty.value = '';
    empty.textContent = '--elige--';
    select.appendChild(empty);
    s.options.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt;
      o.textContent = opt;
      if (state.answers[answerKey][si] === opt) o.selected = true;
      select.appendChild(o);
    });
    select.addEventListener('change', () => {
      state.answers[answerKey][si] = select.value;
      saveState();
    });
    const t2 = document.createElement('span');
    t2.textContent = s.parts[1];
    div.appendChild(t1);
    div.appendChild(select);
    div.appendChild(t2);
    container.appendChild(div);
  });
}

// ============ 10. ERROR IDENTIFICATION ============
function renderErrorIdentification(ex, idx, container) {
  const answerKey = `ex${idx}`;
  if (!state.answers[answerKey]) state.answers[answerKey] = {};
  ex.sentences.forEach((s, si) => {
    const div = document.createElement('div');
    div.className = 'error-sentence';
    div.appendChild(document.createTextNode(`${si + 1}. `));
    s.words.forEach((word, wi) => {
      const span = document.createElement('span');
      span.className = 'error-word';
      span.textContent = word;
      span.dataset.wi = wi;
      if (state.answers[answerKey][si] === wi) span.classList.add('selected');
      span.addEventListener('click', () => {
        div.querySelectorAll('.error-word').forEach(el => el.classList.remove('selected'));
        span.classList.add('selected');
        state.answers[answerKey][si] = wi;
        saveState();
      });
      div.appendChild(span);
      if (wi < s.words.length - 1) div.appendChild(document.createTextNode(' '));
    });
    container.appendChild(div);
  });
}

// ============ 11. EMOJI SENTENCE ============
function renderEmojiSentence(ex, idx, container) {
  const answerKey = `ex${idx}`;
  if (!state.answers[answerKey]) state.answers[answerKey] = {};
  ex.prompts.forEach((p, pi) => {
    const div = document.createElement('div');
    div.className = 'emoji-prompt';
    const em = document.createElement('div');
    em.className = 'emoji-display';
    em.textContent = p.emojis;
    const ta = document.createElement('textarea');
    ta.placeholder = `Escribe una oracion en pasado. ${p.hint}`;
    ta.value = state.answers[answerKey][pi] || '';
    ta.addEventListener('input', () => {
      state.answers[answerKey][pi] = ta.value;
      saveState();
    });
    div.appendChild(em);
    div.appendChild(ta);
    container.appendChild(div);
  });
}

// ============ 12. MATCH WITH IMAGES ============
function renderMatchImages(ex, idx, container) {
  const answerKey = `ex${idx}`;
  if (!state.answers[answerKey]) state.answers[answerKey] = {};

  // Banco con las oraciones (mezcladas)
  const bank = document.createElement('div');
  bank.className = 'word-bank';
  bank.dataset.exerciseIdx = idx;

  const shuffledTexts = shuffleArray(ex.items.map(i => i.text));
  shuffledTexts.forEach((text, ti) => {
    const w = document.createElement('div');
    w.className = 'draggable-word';
    w.textContent = text;
    w.dataset.word = text;
    setupDraggable(w, (target, draggedEl) => handleMatchImgDrop(target, draggedEl, idx));
    bank.appendChild(w);
  });
  setupDropZone(bank, (target, draggedEl) => handleMatchImgDrop(target, draggedEl, idx));
  container.appendChild(bank);

  // Grid de imágenes
  const imgGrid = document.createElement('div');
  imgGrid.style.display = 'grid';
  imgGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(140px, 1fr))';
  imgGrid.style.gap = '12px';
  imgGrid.style.marginTop = '10px';

  ex.items.forEach((item, ii) => {
    const box = document.createElement('div');
    box.className = 'match-image-box';
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.alt;
    img.onerror = function() {
      this.style.display = 'none';
      const fallback = document.createElement('div');
      fallback.style.cssText = 'width:100px;height:100px;background:#e0e0e0;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#888;';
      fallback.textContent = item.alt;
      box.insertBefore(fallback, box.firstChild);
    };
    const zone = document.createElement('div');
    zone.className = 'drop-zone-match';
    zone.dataset.expected = item.text;
    zone.dataset.imageIdx = ii;
    zone.dataset.exerciseIdx = idx;
    box.appendChild(img);
    box.appendChild(zone);
    setupDropZone(zone, (target, draggedEl) => handleMatchImgDrop(target, draggedEl, idx));
    imgGrid.appendChild(box);
  });
  container.appendChild(imgGrid);

  // Restaurar
  setTimeout(() => {
    Object.entries(state.answers[answerKey]).forEach(([imgIdx, text]) => {
      const el = bank.querySelector(`[data-word="${CSS.escape(text)}"]`);
      const zone = imgGrid.querySelector(`.drop-zone-match[data-image-idx="${imgIdx}"]`);
      if (el && zone && !zone.querySelector('.draggable-word')) zone.appendChild(el);
    });
  }, 50);
}

function handleMatchImgDrop(target, draggedEl, exerciseIdx) {
  const answerKey = `ex${exerciseIdx}`;
  if (!state.answers[answerKey]) state.answers[answerKey] = {};
  const bank = document.querySelector(`.word-bank[data-exercise-idx="${exerciseIdx}"]`);

  // Si arrastrado venía de otro zone, limpiarlo
  const prev = draggedEl.parentElement;
  if (prev && prev.classList.contains('drop-zone-match')) {
    delete state.answers[answerKey][prev.dataset.imageIdx];
  }

  if (target.classList.contains('drop-zone-match')) {
    const existing = target.querySelector('.draggable-word');
    if (existing && existing !== draggedEl) bank.appendChild(existing);
    target.appendChild(draggedEl);
    state.answers[answerKey][target.dataset.imageIdx] = draggedEl.dataset.word;
  } else if (target.classList.contains('word-bank')) {
    target.appendChild(draggedEl);
  }
  saveState();
}

// ============ 13. MATCHING LINES (SVG) ============
function renderMatchingLines(ex, idx, container) {
  const answerKey = `ex${idx}`;
  if (!state.answers[answerKey]) state.answers[answerKey] = {};

  const wrap = document.createElement('div');
  wrap.className = 'lines-container';
  wrap.style.position = 'relative';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'lines-svg');
  wrap.appendChild(svg);

  const leftCol = document.createElement('div');
  leftCol.className = 'lines-left';
  const rightCol = document.createElement('div');
  rightCol.className = 'lines-right';

  // Mezclar la columna derecha
  const rightShuffled = shuffleArray(ex.pairs.map(p => p.right));

  ex.pairs.forEach((pair, pi) => {
    const l = document.createElement('div');
    l.className = 'line-item';
    l.textContent = pair.left;
    l.dataset.side = 'left';
    l.dataset.value = pair.left;
    leftCol.appendChild(l);
  });
  rightShuffled.forEach(right => {
    const r = document.createElement('div');
    r.className = 'line-item';
    r.textContent = right;
    r.dataset.side = 'right';
    r.dataset.value = right;
    rightCol.appendChild(r);
  });

  wrap.appendChild(leftCol);
  const spacer = document.createElement('div');
  wrap.appendChild(spacer);
  wrap.appendChild(rightCol);

  const clearBtn = document.createElement('button');
  clearBtn.className = 'lines-clear';
  clearBtn.textContent = '🔄 Reiniciar uniones';

  container.appendChild(wrap);
  container.appendChild(clearBtn);

  let selectedLeft = null;

  function drawLines() {
    svg.innerHTML = '';
    const wrapRect = wrap.getBoundingClientRect();
    svg.setAttribute('width', wrapRect.width);
    svg.setAttribute('height', wrapRect.height);
    Object.entries(state.answers[answerKey]).forEach(([leftVal, rightVal]) => {
      const leftEl = leftCol.querySelector(`[data-value="${CSS.escape(leftVal)}"]`);
      const rightEl = rightCol.querySelector(`[data-value="${CSS.escape(rightVal)}"]`);
      if (!leftEl || !rightEl) return;
      const lr = leftEl.getBoundingClientRect();
      const rr = rightEl.getBoundingClientRect();
      const x1 = lr.right - wrapRect.left;
      const y1 = lr.top + lr.height / 2 - wrapRect.top;
      const x2 = rr.left - wrapRect.left;
      const y2 = rr.top + rr.height / 2 - wrapRect.top;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', '#4caf50');
      line.setAttribute('stroke-width', '3');
      line.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line);
      leftEl.classList.add('matched');
      rightEl.classList.add('matched');
    });
  }

  leftCol.addEventListener('click', e => {
    const item = e.target.closest('.line-item');
    if (!item) return;
    leftCol.querySelectorAll('.line-item').forEach(el => el.classList.remove('selected'));
    item.classList.add('selected');
    selectedLeft = item.dataset.value;
  });

  rightCol.addEventListener('click', e => {
    const item = e.target.closest('.line-item');
    if (!item || !selectedLeft) return;
    // Remover uniones previas de este lado o del seleccionado
    const rightVal = item.dataset.value;
    // Quitar cualquier izquierda que apuntara a este right
    Object.keys(state.answers[answerKey]).forEach(k => {
      if (state.answers[answerKey][k] === rightVal) delete state.answers[answerKey][k];
    });
    state.answers[answerKey][selectedLeft] = rightVal;
    selectedLeft = null;
    leftCol.querySelectorAll('.line-item').forEach(el => {
      el.classList.remove('selected');
      el.classList.remove('matched');
    });
    rightCol.querySelectorAll('.line-item').forEach(el => el.classList.remove('matched'));
    drawLines();
    saveState();
  });

  clearBtn.addEventListener('click', () => {
    state.answers[answerKey] = {};
    leftCol.querySelectorAll('.line-item').forEach(el => { el.classList.remove('selected'); el.classList.remove('matched'); });
    rightCol.querySelectorAll('.line-item').forEach(el => el.classList.remove('matched'));
    svg.innerHTML = '';
    saveState();
  });

  // Redibujar líneas cuando se redimensiona o scroll
  setTimeout(drawLines, 100);
  window.addEventListener('resize', drawLines);
}

// ============ TIC TAC TOE ============
function buildTicTacToe() {
  const card = document.createElement('div');
  card.className = 'exercise-card';

  const header = document.createElement('div');
  header.className = 'exercise-header';
  header.innerHTML = `
    <div class="exercise-number">🎮</div>
    <div class="exercise-title">Juego Bonus: Tic-Tac-Toe (XO)</div>
  `;
  card.appendChild(header);

  const instr = document.createElement('div');
  instr.className = 'exercise-instructions';
  instr.textContent = '📝 Juega contra el personaje. Tu eres X y la computadora es O. Solo puedes jugar UNA vez!';
  card.appendChild(instr);

  const ttt = document.createElement('div');
  ttt.className = 'ttt-container';

  const npc = document.createElement('div');
  npc.className = 'ttt-npc';
  npc.id = 'tttNpc';
  npc.textContent = '😊';

  const msg = document.createElement('div');
  msg.className = 'ttt-message';
  msg.id = 'tttMessage';
  msg.textContent = '¡Hagamos una partida! Tu turno.';

  const board = document.createElement('div');
  board.className = 'ttt-board';
  board.id = 'tttBoard';

  const cells = [];
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'ttt-cell';
    cell.dataset.i = i;
    cell.addEventListener('click', () => handleTTTClick(i, cells));
    board.appendChild(cell);
    cells.push(cell);
  }

  const resetBtn = document.createElement('button');
  resetBtn.className = 'ttt-reset';
  resetBtn.textContent = '🔄 Nuevo juego';
  resetBtn.addEventListener('click', () => {
    if (state.tttPlayed) {
      alert('Ya jugaste tu partida. No puedes jugar de nuevo!');
      return;
    }
    resetTTT(cells);
  });

  const scoreInfo = document.createElement('div');
  scoreInfo.className = 'ttt-score';
  scoreInfo.id = 'tttScoreInfo';
  scoreInfo.textContent = state.extraPoints > 0 ? `¡Puntos extra ganados: +${state.extraPoints}!` : 'Puntos extra: 0';

  ttt.appendChild(npc);
  ttt.appendChild(msg);
  ttt.appendChild(board);
  ttt.appendChild(resetBtn);
  ttt.appendChild(scoreInfo);
  card.appendChild(ttt);

  // Estado inicial
  window._tttState = {
    board: Array(9).fill(''),
    gameOver: state.tttPlayed,
    playerTurn: true
  };

  if (state.tttPlayed) {
    msg.textContent = 'Ya completaste tu partida.';
    cells.forEach(c => c.classList.add('filled'));
  }

  return card;
}

function resetTTT(cells) {
  window._tttState = {
    board: Array(9).fill(''),
    gameOver: false,
    playerTurn: true
  };
  cells.forEach(c => {
    c.textContent = '';
    c.classList.remove('X', 'O', 'filled');
  });
  document.getElementById('tttMessage').textContent = '¡Tu turno! Eres X.';
  document.getElementById('tttNpc').textContent = '🤔';
}

function handleTTTClick(i, cells) {
  const s = window._tttState;
  if (s.gameOver || !s.playerTurn || s.board[i] !== '') return;

  s.board[i] = 'X';
  cells[i].textContent = 'X';
  cells[i].classList.add('X', 'filled');
  s.playerTurn = false;

  if (checkTTT(s.board, cells)) return;

  // NPC piensa
  document.getElementById('tttNpc').textContent = '🤖';
  document.getElementById('tttMessage').textContent = 'La computadora esta pensando...';
  setTimeout(() => {
    const move = findBestTTTMove(s.board);
    if (move !== -1) {
      s.board[move] = 'O';
      cells[move].textContent = 'O';
      cells[move].classList.add('O', 'filled');
    }
    if (!checkTTT(s.board, cells)) {
      s.playerTurn = true;
      document.getElementById('tttNpc').textContent = '😊';
      document.getElementById('tttMessage').textContent = 'Tu turno de nuevo.';
    }
  }, 600);
}

function checkTTT(b, cells) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const w of wins) {
    if (b[w[0]] && b[w[0]] === b[w[1]] && b[w[1]] === b[w[2]]) {
      endTTT(b[w[0]]);
      return true;
    }
  }
  if (b.every(c => c !== '')) {
    endTTT('tie');
    return true;
  }
  return false;
}

function endTTT(result) {
  window._tttState.gameOver = true;
  state.tttPlayed = true;
  const npc = document.getElementById('tttNpc');
  const msg = document.getElementById('tttMessage');
  const scoreInfo = document.getElementById('tttScoreInfo');

  if (result === 'X') {
    npc.textContent = '😭';
    msg.textContent = '¡Felicidades, eres bueno en este juego! Ten 1 punto extra.';
    state.extraPoints = 1;
  } else if (result === 'O') {
    npc.textContent = '😎';
    msg.textContent = 'Oops, mas suerte para la proxima.';
    state.extraPoints = 0;
  } else {
    npc.textContent = '🤝';
    msg.textContent = 'Estamos a mano, ten 0.5 extra para tu nota.';
    state.extraPoints = 0.5;
  }
  scoreInfo.textContent = state.extraPoints > 0 ? `¡Puntos extra ganados: +${state.extraPoints}!` : 'Puntos extra: 0';
  saveState();
  updateScoreDisplay();
}

function findBestTTTMove(b) {
  // Intenta ganar, luego bloquear, luego centro, luego esquinas, luego aleatorio
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  // Ganar
  for (const w of wins) {
    const cells = [b[w[0]], b[w[1]], b[w[2]]];
    const os = cells.filter(c => c === 'O').length;
    const empty = cells.filter(c => c === '').length;
    if (os === 2 && empty === 1) {
      return w[cells.indexOf('')];
    }
  }
  // Bloquear
  for (const w of wins) {
    const cells = [b[w[0]], b[w[1]], b[w[2]]];
    const xs = cells.filter(c => c === 'X').length;
    const empty = cells.filter(c => c === '').length;
    if (xs === 2 && empty === 1) {
      return w[cells.indexOf('')];
    }
  }
  // A veces comete errores intencionales (30% del tiempo juega random para dar chance de ganar)
  if (Math.random() < 0.3) {
    const empties = b.map((v, i) => v === '' ? i : -1).filter(i => i !== -1);
    if (empties.length) return empties[Math.floor(Math.random() * empties.length)];
  }
  // Centro
  if (b[4] === '') return 4;
  // Esquinas
  const corners = [0, 2, 6, 8].filter(i => b[i] === '');
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  // Lados
  const sides = [1, 3, 5, 7].filter(i => b[i] === '');
  if (sides.length) return sides[Math.floor(Math.random() * sides.length)];
  return -1;
}


// ============ CÁLCULO DE NOTAS ============
function calculateAllScores() {
  let totalPct = 0;
  let count = 0;
  state.exercises.forEach((ex, idx) => {
    const score = calculateExerciseScore(ex, idx);
    state.scores[idx] = score;
    totalPct += score.pct;
    count++;
  });
  // Promedio en escala 1-10
  const avgPct = count > 0 ? totalPct / count : 0;
  let finalScore = (avgPct / 100) * 9 + 1; // 1-10
  // Agregar puntos extra
  finalScore += state.extraPoints;
  if (finalScore > 10) finalScore = 10;
  if (finalScore < 1) finalScore = 1;
  return { final: finalScore, avgPct };
}

function calculateExerciseScore(ex, idx) {
  const answerKey = `ex${idx}`;
  const answers = state.answers[answerKey] || {};
  let correct = 0, total = 0;

  switch (ex.type) {
    case 'multipleChoice':
      total = ex.questions.length;
      ex.questions.forEach((q, qi) => {
        if (answers[qi] === q.answer) correct++;
      });
      break;
    case 'fillInTheBlank':
      total = ex.sentences.length;
      ex.sentences.forEach((s, si) => {
        const given = normalizeText(answers[si]);
        const expected = normalizeText(s.answer);
        const alts = (s.alt || []).map(a => normalizeText(a));
        if (given === expected || alts.includes(given)) correct++;
      });
      break;
    case 'dragDropWords':
      total = ex.sentences.length;
      ex.sentences.forEach((s, si) => {
        if (normalizeText(answers[si]) === normalizeText(s.answer)) correct++;
      });
      break;
    case 'unscrambleWords':
      total = ex.words.length;
      ex.words.forEach((w, wi) => {
        if (normalizeText(answers[wi]) === normalizeText(w.answer)) correct++;
      });
      break;
    case 'reorderSentences':
      total = ex.correctOrder.length;
      const order = answers.order || [];
      ex.correctOrder.forEach((s, si) => {
        if (order[si] === s) correct++;
      });
      break;
    case 'trueFalse':
      total = ex.questions.length;
      ex.questions.forEach((q, qi) => {
        if (answers[qi] === q.answer) correct++;
      });
      break;
    case 'wordSearch':
      total = ex.words.length;
      correct = (answers.found || []).length;
      break;
    case 'categorization':
      total = ex.items.length;
      ex.items.forEach(item => {
        if (answers[item.word] === item.category) correct++;
      });
      break;
    case 'dropdown':
      total = ex.sentences.length;
      ex.sentences.forEach((s, si) => {
        if (normalizeText(answers[si]) === normalizeText(s.answer)) correct++;
      });
      break;
    case 'errorIdentification':
      total = ex.sentences.length;
      ex.sentences.forEach((s, si) => {
        if (answers[si] === s.wrongIndex) correct++;
      });
      break;
    case 'emojiSentence':
      total = ex.prompts.length;
      // Se considera respondido si tiene al menos 3 palabras (manual, pero da crédito por esfuerzo)
      ex.prompts.forEach((p, pi) => {
        const ans = (answers[pi] || '').trim();
        if (ans.split(/\s+/).length >= 3) correct++;
      });
      break;
    case 'matchImages':
      total = ex.items.length;
      ex.items.forEach((item, ii) => {
        if (answers[ii] === item.text) correct++;
      });
      break;
    case 'matchingLines':
      total = ex.pairs.length;
      ex.pairs.forEach(pair => {
        if (answers[pair.left] === pair.right) correct++;
      });
      break;
  }
  const pct = total > 0 ? (correct / total) * 100 : 0;
  return { correct, total, pct };
}

function updateScoreDisplay() {
  const { final, avgPct } = calculateAllScores();
  document.getElementById('currentScore').textContent = final.toFixed(1);
  let detail = `Promedio de aciertos: ${avgPct.toFixed(0)}%`;
  if (state.extraPoints > 0) detail += ` · Extra: +${state.extraPoints} pt`;
  document.getElementById('scoreDetail').textContent = detail;
}

document.getElementById('calculateBtn').addEventListener('click', () => {
  updateScoreDisplay();
  const card = document.getElementById('scoreDisplay');
  card.style.transform = 'scale(1.05)';
  setTimeout(() => card.style.transform = '', 300);
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('¿Estas seguro? Se borrara todo tu progreso.')) {
    clearState();
    location.reload();
  }
});

// ============ SANITIZADOR PARA PDF ============
function sanitizeForPDF(text) {
  if (text === null || text === undefined) return '';
  let t = String(text);

  // 1. Eliminar etiquetas HTML
  t = t.replace(/<[^>]*>/g, '');

  // 2. Reemplazar caracteres problemáticos por ASCII
  const replacements = {
    '\u2192': '->', '\u2190': '<-', '\u2191': '^', '\u2193': 'v',
    '\u2014': '-', '\u2013': '-', '\u2012': '-',
    '\u201C': '"', '\u201D': '"', '\u2018': "'", '\u2019': "'",
    '\u2026': '...', '\u2022': '*', '\u00B7': '.',
    '\u00A1': '!', '\u00BF': '?',
    '\u00E1': 'a', '\u00E9': 'e', '\u00ED': 'i', '\u00F3': 'o', '\u00FA': 'u',
    '\u00C1': 'A', '\u00C9': 'E', '\u00CD': 'I', '\u00D3': 'O', '\u00DA': 'U',
    '\u00F1': 'n', '\u00D1': 'N',
    '\u00FC': 'u', '\u00DC': 'U',
    '\u00A9': '(c)', '\u00AE': '(r)', '\u2122': '(tm)',
    '\u2713': '[V]', '\u2717': '[X]', '\u2714': '[V]', '\u2718': '[X]',
    '&': 'and'
  };
  for (const [k, v] of Object.entries(replacements)) {
    t = t.split(k).join(v);
  }

  // 3. Eliminar emojis y caracteres Unicode fuera de ASCII básico
  // Conservar solo caracteres ASCII imprimibles (0x20 a 0x7E) y saltos de línea
  t = t.split('').filter(ch => {
    const code = ch.charCodeAt(0);
    return (code >= 0x20 && code <= 0x7E) || code === 0x0A || code === 0x0D;
  }).join('');

  // Quitar espacios extra
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

// ============ GENERAR PDF ============
document.getElementById('downloadBtn').addEventListener('click', generatePDF);

async function generatePDF() {
  const btn = document.getElementById('downloadBtn');
  btn.disabled = true;
  btn.textContent = '⏳ Generando PDF...';

  try {
    const { final, avgPct } = calculateAllScores();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'letter' });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 15;
    let y = margin;

    // === HEADER ===
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, pageW, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(sanitizeForPDF('COEDUCA - Ejercicios Simple Past'), pageW / 2, 12, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(sanitizeForPDF('English A1+ - Seccion A'), pageW / 2, 19, { align: 'center' });
    doc.text(sanitizeForPDF('Profesor: Jose Eliseo Martinez'), pageW / 2, 25, { align: 'center' });

    y = 38;
    doc.setTextColor(0, 0, 0);

    // === DATOS DEL ESTUDIANTE ===
    doc.setFillColor(240, 244, 255);
    doc.rect(margin, y, pageW - 2 * margin, 22, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(sanitizeForPDF('Nombre: ') + sanitizeForPDF(state.student.name), margin + 3, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(sanitizeForPDF('NIE: ') + sanitizeForPDF(state.nie), margin + 3, y + 12);
    doc.text(sanitizeForPDF('Grado: ') + sanitizeForPDF(state.student.grade), margin + 3, y + 17);
    doc.text(sanitizeForPDF('Tema: Simple Past'), pageW - margin - 50, y + 6);
    const fecha = new Date().toLocaleDateString('es-SV');
    doc.text(sanitizeForPDF('Fecha: ') + sanitizeForPDF(fecha), pageW - margin - 50, y + 12);

    y += 26;

    // Compañeros
    if (state.partners.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(sanitizeForPDF('Companeros de trabajo:'), margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      state.partners.forEach(p => {
        doc.text(sanitizeForPDF(`- ${p.name} (NIE: ${p.nie}) - ${p.grade}`), margin + 3, y);
        y += 4.5;
      });
      y += 3;
    }

    // === NOTA FINAL ===
    doc.setFillColor(76, 175, 80);
    doc.rect(margin, y, pageW - 2 * margin, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(sanitizeForPDF('NOTA FINAL: ') + final.toFixed(1) + ' / 10', pageW / 2, y + 9, { align: 'center' });
    y += 18;
    doc.setTextColor(0, 0, 0);

    // Puntos extra visibles en esquina
    if (state.extraPoints > 0) {
      doc.setFillColor(255, 193, 7);
      doc.rect(pageW - margin - 55, 32, 55, 12, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(sanitizeForPDF(`PUNTOS EXTRA: +${state.extraPoints}`), pageW - margin - 27.5, 39, { align: 'center' });
      doc.setTextColor(0, 0, 0);
    }

    // === RESUMEN POR EJERCICIO ===
    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(sanitizeForPDF('Puntaje por ejercicio:'), margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    state.exercises.forEach((ex, idx) => {
      if (y > pageH - 20) { doc.addPage(); y = margin; }
      const s = state.scores[idx] || { correct: 0, total: 0, pct: 0 };
      const line = sanitizeForPDF(`${idx + 1}. ${ex.title}: ${s.correct}/${s.total} (${s.pct.toFixed(0)}%)`);
      doc.text(line, margin, y);
      y += 4.5;
    });

    // === DETALLE DE RESPUESTAS ===
    doc.addPage();
    y = margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(102, 126, 234);
    doc.text(sanitizeForPDF('Detalle de respuestas'), pageW / 2, y, { align: 'center' });
    y += 10;
    doc.setTextColor(0, 0, 0);

    state.exercises.forEach((ex, idx) => {
      if (y > pageH - 25) { doc.addPage(); y = margin; }
      doc.setFillColor(240, 244, 255);
      doc.rect(margin, y - 4, pageW - 2 * margin, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(sanitizeForPDF(`Ejercicio ${idx + 1}: ${ex.title}`), margin + 2, y);
      y += 6;
      const s = state.scores[idx] || calculateExerciseScore(ex, idx);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(sanitizeForPDF(`Puntaje: ${s.correct}/${s.total}`), margin + 2, y);
      y += 5;

      // Detalles específicos por tipo
      y = addExerciseDetails(doc, ex, idx, y, margin, pageW, pageH);
      y += 3;
    });

    // === FOOTER DE ÚLTIMA PÁGINA ===
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(sanitizeForPDF(`COEDUCA - Pagina ${i} de ${pageCount}`), pageW / 2, pageH - 7, { align: 'center' });
    }

    const filename = sanitizeForPDF(`SimplePast_${state.student.name.replace(/\s+/g, '_')}_${state.nie}.pdf`);

    // Detección de iOS (Safari en iOS no permite descargas directas desde vista previa a veces)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isInAppBrowser = /FBAN|FBAV|Instagram|Line|Twitter|WhatsApp/i.test(navigator.userAgent);

    if (isIOS || isInAppBrowser) {
      // En iOS, abrir en nueva pestaña y permitir al usuario compartir/guardar
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        // Si se bloquea el popup, dar link visible
        const dlLink = document.createElement('a');
        dlLink.href = url;
        dlLink.download = filename;
        dlLink.textContent = '📥 Toca aqui para abrir/descargar el PDF';
        dlLink.style.cssText = 'display:block;background:#4caf50;color:white;padding:15px;text-align:center;border-radius:10px;margin-top:10px;text-decoration:none;font-weight:bold;';
        const parent = btn.parentElement;
        const existing = document.getElementById('iosPdfLink');
        if (existing) existing.remove();
        dlLink.id = 'iosPdfLink';
        parent.appendChild(dlLink);
        alert('En este navegador la descarga directa no funciona. Toca el boton VERDE que aparecera abajo para ver tu PDF.');
      }
    } else {
      doc.save(filename);
    }
  } catch (err) {
    console.error(err);
    alert('Error al generar el PDF: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '📄 Descargar PDF';
  }
}

function addExerciseDetails(doc, ex, idx, y, margin, pageW, pageH) {
  const answers = state.answers[`ex${idx}`] || {};
  const lineH = 4.5;
  const maxW = pageW - 2 * margin - 4;

  function writeLine(text, indent = 2, color = null) {
    if (y > pageH - 15) { doc.addPage(); y = margin; }
    if (color) doc.setTextColor(...color);
    const split = doc.splitTextToSize(sanitizeForPDF(text), maxW - indent);
    split.forEach(l => {
      if (y > pageH - 15) { doc.addPage(); y = margin; }
      doc.text(l, margin + indent, y);
      y += lineH;
    });
    doc.setTextColor(0, 0, 0);
  }

  switch (ex.type) {
    case 'multipleChoice':
      ex.questions.forEach((q, qi) => {
        writeLine(`${qi + 1}. ${q.q}`);
        const ans = answers[qi];
        const userAns = (ans !== undefined) ? q.options[ans] : '(sin respuesta)';
        const correct = q.options[q.answer];
        const isCorrect = ans === q.answer;
        writeLine(`   Tu respuesta: ${userAns} ${isCorrect ? '[V]' : '[X]'}`, 2, isCorrect ? [76,175,80] : [244,67,54]);
        if (!isCorrect) writeLine(`   Correcta: ${correct}`, 2, [76,175,80]);
      });
      break;
    case 'fillInTheBlank':
      ex.sentences.forEach((s, si) => {
        writeLine(`${si + 1}. ${s.parts[0]}_____${s.parts[1]}`);
        const user = answers[si] || '(sin respuesta)';
        const correct = normalizeText(answers[si]) === normalizeText(s.answer) || (s.alt || []).map(a => normalizeText(a)).includes(normalizeText(answers[si]));
        writeLine(`   Tu respuesta: "${user}" ${correct ? '[V]' : '[X]'}`, 2, correct ? [76,175,80] : [244,67,54]);
        if (!correct) writeLine(`   Correcta: "${s.answer}"`, 2, [76,175,80]);
      });
      break;
    case 'dragDropWords':
      ex.sentences.forEach((s, si) => {
        writeLine(`${si + 1}. ${s.parts[0]}[___]${s.parts[1]}`);
        const user = answers[si] || '(sin respuesta)';
        const ok = normalizeText(user) === normalizeText(s.answer);
        writeLine(`   Colocaste: "${user}" ${ok ? '[V]' : '[X]'}`, 2, ok ? [76,175,80] : [244,67,54]);
        if (!ok) writeLine(`   Correcta: "${s.answer}"`, 2, [76,175,80]);
      });
      break;
    case 'unscrambleWords':
      ex.words.forEach((w, wi) => {
        writeLine(`${wi + 1}. Letras: ${w.scrambled} ${w.hint}`);
        const user = answers[wi] || '(sin respuesta)';
        const ok = normalizeText(user) === normalizeText(w.answer);
        writeLine(`   Tu respuesta: "${user}" ${ok ? '[V]' : '[X]'}`, 2, ok ? [76,175,80] : [244,67,54]);
        if (!ok) writeLine(`   Correcta: "${w.answer}"`, 2, [76,175,80]);
      });
      break;
    case 'reorderSentences':
      writeLine('Orden del estudiante:');
      (answers.order || []).forEach((s, si) => {
        const ok = s === ex.correctOrder[si];
        writeLine(`   ${si + 1}. ${s} ${ok ? '[V]' : '[X]'}`, 2, ok ? [76,175,80] : [244,67,54]);
      });
      writeLine('Orden correcto:');
      ex.correctOrder.forEach((s, si) => {
        writeLine(`   ${si + 1}. ${s}`, 2, [76,175,80]);
      });
      break;
    case 'trueFalse':
      ex.questions.forEach((q, qi) => {
        writeLine(`${qi + 1}. ${q.q}`);
        const user = answers[qi];
        const userTxt = user === true ? 'Verdadero' : user === false ? 'Falso' : '(sin respuesta)';
        const correct = q.answer ? 'Verdadero' : 'Falso';
        const ok = user === q.answer;
        writeLine(`   Tu respuesta: ${userTxt} ${ok ? '[V]' : '[X]'}`, 2, ok ? [76,175,80] : [244,67,54]);
        if (!ok) writeLine(`   Correcta: ${correct}`, 2, [76,175,80]);
      });
      break;
    case 'wordSearch':
      const found = answers.found || [];
      writeLine(`Palabras encontradas (${found.length}/${ex.words.length}):`);
      ex.words.forEach(w => {
        const ok = found.includes(w);
        writeLine(`   ${w} ${ok ? '[V]' : '[X]'}`, 2, ok ? [76,175,80] : [244,67,54]);
      });
      break;
    case 'categorization':
      ex.items.forEach(item => {
        const user = answers[item.word];
        const userTxt = user || '(sin clasificar)';
        const correctLabel = ex.categories.find(c => c.id === item.category)?.label || item.category;
        const ok = user === item.category;
        writeLine(`${item.word}: ${userTxt} ${ok ? '[V]' : '[X]'}`);
        if (!ok) writeLine(`   Correcta: ${correctLabel}`, 4, [76,175,80]);
      });
      break;
    case 'dropdown':
      ex.sentences.forEach((s, si) => {
        writeLine(`${si + 1}. ${s.parts[0]}[___]${s.parts[1]}`);
        const user = answers[si] || '(sin respuesta)';
        const ok = normalizeText(user) === normalizeText(s.answer);
        writeLine(`   Elegiste: "${user}" ${ok ? '[V]' : '[X]'}`, 2, ok ? [76,175,80] : [244,67,54]);
        if (!ok) writeLine(`   Correcta: "${s.answer}"`, 2, [76,175,80]);
      });
      break;
    case 'errorIdentification':
      ex.sentences.forEach((s, si) => {
        const fullSentence = s.words.join(' ');
        writeLine(`${si + 1}. ${fullSentence}`);
        const userIdx = answers[si];
        const userWord = userIdx !== undefined ? s.words[userIdx] : '(sin respuesta)';
        const correctWord = s.words[s.wrongIndex];
        const ok = userIdx === s.wrongIndex;
        writeLine(`   Marcaste: "${userWord}" ${ok ? '[V]' : '[X]'}`, 2, ok ? [76,175,80] : [244,67,54]);
        if (!ok) writeLine(`   Error estaba en: "${correctWord}"`, 2, [76,175,80]);
      });
      break;
    case 'emojiSentence':
      ex.prompts.forEach((p, pi) => {
        writeLine(`${pi + 1}. Emojis: ${p.emojis} ${p.hint}`);
        const user = answers[pi] || '(sin respuesta)';
        writeLine(`   Oracion: "${user}"`, 2);
        writeLine(`   [Revisada manualmente por el profesor]`, 2, [150, 150, 150]);
      });
      break;
    case 'matchImages':
      ex.items.forEach((item, ii) => {
        const user = answers[ii] || '(sin respuesta)';
        const ok = user === item.text;
        writeLine(`Imagen ${ii + 1} (${item.alt}):`);
        writeLine(`   Asignaste: "${user}" ${ok ? '[V]' : '[X]'}`, 2, ok ? [76,175,80] : [244,67,54]);
        if (!ok) writeLine(`   Correcta: "${item.text}"`, 2, [76,175,80]);
      });
      break;
    case 'matchingLines':
      ex.pairs.forEach(pair => {
        const user = answers[pair.left] || '(sin unir)';
        const ok = user === pair.right;
        writeLine(`${pair.left} -> ${user} ${ok ? '[V]' : '[X]'}`, 2, ok ? [76,175,80] : [244,67,54]);
        if (!ok) writeLine(`   Correcta: ${pair.left} -> ${pair.right}`, 2, [76,175,80]);
      });
      break;
  }
  return y;
}

// Inicializar display de score cuando se carga
setTimeout(() => {
  if (!document.getElementById('mainApp').classList.contains('hidden')) {
    updateScoreDisplay();
  }
}, 500);

// Si ya había sesión iniciada, restaurar
(function autoRestore() {
  const saved = loadState();
  if (saved && saved.nie && STUDENTS[saved.nie]) {
    state.nie = saved.nie;
    state.student = STUDENTS[saved.nie];
    enterApp();
    setTimeout(updateScoreDisplay, 200);
  }
})();
