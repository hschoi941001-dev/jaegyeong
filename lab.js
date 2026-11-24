const LAB_LABELS = {class: '분류 게임', order: '순서 게임', sim: '숫자 실험'};
const labProgress = () => load('lab-completed', {});
const labKey = (chapter, game) => chapter + '-' + game;
const labNumber = value => new Intl.NumberFormat('ko-KR', {maximumFractionDigits: 2}).format(Object.is(value, -0) ? 0 : value);

function labHTML(n, activities, quizCount) {
  return `<section id="note-lab" class="lab" aria-labelledby="lab-heading">
    <div class="lab__header">
      <div><p id="lab-kind"></p><h2 id="lab-heading"></h2></div>
      <div class="lab__actions">
        <button type="button" class="lab__secondary" data-lab-anchor="s-core">시험 기준 보기</button>
        ${quizCount ? `<a class="lab__secondary" href="#/mission/${n.r}">시험형 문제</a>` : ''}
      </div>
    </div>
    ${activities.length > 1 ? `<div class="lab__modes" aria-label="활동 고르기">${activities.map((game, i) =>
      `<button type="button" data-lab-activity="${i}" aria-pressed="${i===0}">${LAB_LABELS[game.type]}</button>`).join('')}</div>` : ''}
    <p id="lab-scenario" class="lab__scenario"></p>
    <div id="lab-body"></div>
    <div id="lab-feedback" class="lab__feedback" role="status" aria-live="polite"></div>
  </section>`;
}

function labSimulation(game, state) {
  const {low, high, step, input, output, unit, goal} = game;
  return `<div class="lab-sim">
    <div class="lab-sim__readings">
      <div><span>${esc(output)}</span><strong id="lab-output"></strong></div>
      <div class="lab-sim__goal"><span>목표</span><b>${labNumber(goal)} ${esc(unit)}</b></div>
    </div>
    <div class="lab-plot" aria-hidden="true">
      <div class="lab-plot__track"><i id="lab-bar"></i><i id="lab-zero"></i><i id="lab-goal"></i></div>
      <div class="lab-plot__scale"><span id="lab-plot-start"></span><span id="lab-plot-end"></span></div>
    </div>
    <label class="lab-slider" for="lab-input"><span>${esc(input)}</span><output id="lab-input-value" for="lab-input"></output></label>
    <input id="lab-input" type="range" min="${low}" max="${high}" step="${step}" value="${state.value}" aria-describedby="lab-equation">
    <p id="lab-equation" class="lab-equation"></p>
    <div class="lab-sim__actions">
      <button type="button" class="lab-button" data-lab-check>목표 확인</button>
      <button type="button" class="lab-link" data-lab-restart>다시 시작</button>
    </div>
  </div>`;
}

const labResult = (game, x) => Math.round((game.base + game.rate * x) * 100) / 100;

function labUpdatePlot(game, input) {
  const result = labResult(game, input);
  const bounds = [labResult(game, game.low), labResult(game, game.high), 0, game.goal];
  const min = Math.min(...bounds), max = Math.max(...bounds);
  const pct = x => (x - min) / (max - min) * 100;
  const zero = pct(0), value = pct(result), bar = $('#lab-bar');
  $('#lab-output').textContent = labNumber(result) + ' ' + game.unit;
  $('#lab-input-value').textContent = labNumber(input) + ' ' + game.inputUnit;
  $('#lab-input').setAttribute('aria-valuetext', labNumber(input) + ' ' + game.inputUnit);
  $('#lab-equation').textContent = game.formula.replace('{x}', labNumber(input)).replace('{y}', labNumber(result));
  $('#lab-plot-start').textContent = labNumber(min);
  $('#lab-plot-end').textContent = labNumber(max);
  $('#lab-zero').style.left = zero + '%';
  $('#lab-goal').style.left = pct(game.goal) + '%';
  bar.style.left = Math.min(zero, value) + '%';
  bar.style.width = Math.abs(zero - value) + '%';
  bar.classList.toggle('negative', result < 0);
  return result;
}

function labClassification(game, state) {
  const item = game.items[state.position];
  const zones = game.labels.map((label, i) => {
    const placed = state.placed.filter(card => card.bin === i);
    return `<div class="lab-bin">
      <button type="button" data-lab-choice="${i}" ${state.done ? 'disabled' : ''}>${esc(label)}</button>
      ${placed.length ? `<ul>${placed.map(card => `<li><details><summary>${esc(card.text)}</summary><p>${esc(card.reason)}</p></details></li>`).join('')}</ul>` : '<span class="lab-bin__empty" aria-hidden="true"></span>'}
    </div>`;
  }).join('');
  return `<div class="lab-board">
    <div class="lab-ticket" id="lab-ticket" tabindex="-1">
      <span>${state.done ? `${game.items.length}장 분류 완료` : `거래 카드 ${state.position + 1} / ${game.items.length}`}</span>
      <p>${state.done ? '아래 장부에서 분류 결과를 비교해 보세요.' : esc(item.text)}</p>
    </div>
    <div class="lab-bins" aria-label="거래 분류">${zones}</div>
    <button type="button" class="lab-link" data-lab-restart>다시 시작</button>
  </div>`;
}

function labSequence(game, state) {
  const order = game.items.map((_, i) => i).sort((a, b) => (a % 2) - (b % 2) || b - a);
  return `<div class="lab-board">
    <ol class="lab-route" aria-label="완성 중인 순서">${game.items.map((item, i) =>
      `<li class="${i < state.position ? 'placed' : ''}"><b>${i+1}</b><span>${i < state.position ? esc(item.text) : '빈 자리'}</span></li>`).join('')}</ol>
    <div class="lab-order" aria-label="놓을 단계">
      ${state.done ? '<p>모든 단계가 제자리에 들어갔어요.</p>' : order.filter(i => i >= state.position).map(i =>
        `<button type="button" data-lab-choice="${i}">${esc(game.items[i].text)}</button>`).join('')}
    </div>
    <button type="button" class="lab-link" data-lab-restart>다시 시작</button>
  </div>`;
}

function labBind(n, games, smooth) {
  const lab = $('#note-lab'), body = $('#lab-body'), feedback = $('#lab-feedback');
  let active = 0, state, game;
  const report = (kind, message) => {
    feedback.dataset.status = kind;
    if (feedback.textContent !== message) feedback.textContent = message;
  };
  const render = () => {
    body.innerHTML = game.type === 'sim' ? labSimulation(game, state)
      : game.type === 'class' ? labClassification(game, state) : labSequence(game, state);
    if (game.type === 'sim') labUpdatePlot(game, state.value);
  };
  const begin = (index, focus = false) => {
    active = index;
    game = games[active];
    state = {position: 0, done: false, value: game.start, placed: []};
    lab.querySelectorAll('[data-lab-activity]').forEach(button => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.labActivity) === active));
    });
    $('#lab-heading').textContent = game.title;
    $('#lab-kind').textContent = LAB_LABELS[game.type];
    $('#lab-scenario').textContent = game.scenario;
    render();
    const completed = labProgress()[labKey(n.r, active)];
    report('', completed ? '완료한 활동이에요. 다시 연습할 수 있어요.' : game.type === 'sim'
      ? '숫자를 움직여 목표에 맞춰 보세요.' : game.type === 'class'
        ? '카드를 읽고 아래에서 보낼 곳을 고르세요.' : '아래 카드 중 다음 단계에 들어갈 것을 고르세요.');
    if (focus) body.querySelector('input, button')?.focus({preventScroll: true});
  };
  const finish = () => {
    state.done = true;
    const progress = labProgress();
    progress[labKey(n.r, active)] = true;
    save('lab-completed', progress);
  };
  begin(0);
  lab.oninput = event => {
    if (event.target.id !== 'lab-input') return;
    state.value = Number(event.target.value);
    labUpdatePlot(game, state.value);
    report('', '결과가 바뀌었어요. 목표값과 비교해 보세요.');
  };
  lab.onclick = event => {
    const control = event.target.closest('button');
    if (!control || control.disabled) return;
    const {labAnchor, labActivity, labRestart, labCheck, labChoice} = control.dataset;
    if (labAnchor) {
      const target = $('#' + labAnchor);
      target.setAttribute('tabindex', '-1');
      target.focus({preventScroll: true});
      target.scrollIntoView({behavior: smooth});
      return;
    }
    if (labActivity !== undefined) return begin(Number(labActivity));
    if (labRestart !== undefined) return begin(active, true);
    if (labCheck !== undefined) {
      const current = labResult(game, state.value);
      if (current === game.goal) {
        finish();
        report('good', '목표 달성! ' + game.explanation);
      } else {
        report('retry', '현재 ' + labNumber(current) + ' ' + game.unit + ' · 목표 ' + labNumber(game.goal) + ' ' + game.unit + '. 그래프를 보며 다시 조절해 보세요.');
      }
      return;
    }
    if (labChoice === undefined || state.done) return;
    const choice = Number(labChoice), item = game.items[state.position];
    const correct = game.type === 'class' ? item.bin : state.position;
    if (choice !== correct) {
      report('retry', game.type === 'class' ? '그 분류는 아니에요. 거래 조건을 한 번 더 읽어보세요.' : '지금 자리에 들어갈 앞 단계를 찾아보세요.');
      return;
    }
    state.position++;
    if (game.type === 'class') state.placed.push(item);
    if (state.position === game.items.length) finish();
    render();
    report('good', (state.done ? '활동 완료! ' : '맞았어요. ') + item.reason);
    (game.type === 'class' ? $('#lab-ticket') : body.querySelector('button'))?.focus({preventScroll: true});
  };
}
