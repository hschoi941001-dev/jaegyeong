const QUEST_TEAMS = {
  FA: {name: '재무팀', scene: '결산실', colors: ['#f7bd86', '#283a5d', '#5271dd'], shape: 'ledger'},
  TX: {name: '세무팀', scene: '신고 검토실', colors: ['#bd7d57', '#292136', '#c7543e'], shape: 'stamp'},
  CM: {name: '원가팀', scene: '프로젝트 상황실', colors: ['#e5a67c', '#302742', '#167a64'], shape: 'chart'}
};

const questMap = () => load('quest-results', {});
const questCount = n => (STUDY[n.r] || []).length;
const questCompleted = (n, results) => questCount(n) > 0 && results[n.r]?.total === questCount(n);

function questSave(r, correct, total) {
  const results = questMap();
  if (results[r]?.total === total && results[r].correct >= correct) return;
  results[r] = {correct, total};
  save('quest-results', results);
}

function questAvatar(t, speaker = 'lead') {
  const team = QUEST_TEAMS[t];
  const [skin, hair, shirt] = speaker === 'new' ? ['#e7a574', '#32243b', '#f5ba55'] : team.colors;
  return `<span class="quest-avatar quest-avatar--${speaker}" style="--qs-skin:${skin};--qs-hair:${hair};--qs-shirt:${shirt}" aria-hidden="true">
    <i class="quest-avatar__body"></i><i class="quest-avatar__head"></i><i class="quest-avatar__fringe"></i>
  </span>`;
}

function questDesk(f) {
  const available = N.filter(questCount);
  if (!available.length || f !== 'all') return '';
  const results = questMap();
  const done = available.filter(n => questCompleted(n, results)).length;
  const lastRead = load('nlast', null);
  const last = available.find(n => n.r === lastRead);
  const next = last || available.find(n => !questCompleted(n, results)) || available[0];
  const rooms = SUBJ.map(t => {
    const chapters = available.filter(n => n.tp === t);
    if (!chapters.length) return '';
    const count = chapters.filter(n => questCompleted(n, results)).length;
    return `<a class="quest-room quest-${t}" href="#/notes/${t}">${questAvatar(t)}
      <span><strong>${TN[t]}</strong><small>미션 ${count} / ${chapters.length}</small></span>
    </a>`;
  }).join('');
  return `<section class="quest-desk" aria-labelledby="quest-desk-title">
    <div class="quest-desk__head"><div><h2 id="quest-desk-title">회계팀 출근하기</h2>
      <p>숫자를 움직이고 거래 카드를 정리한 뒤, 시험형 문제를 풀어요.</p></div>
      <div class="quest-desk__progress"><b>${done} / ${available.length}</b><span>완료한 장</span></div>
    </div>
    <div class="quest-rooms">${rooms}</div>
    <a class="quest-desk__continue" href="#/note/${next.r}">${last ? '이어서 공부하기' : '학습 시작'}<span>${TN[next.tp]} ${chap(next.r)}</span></a>
  </section>`;
}

function questBadge(n, results) {
  if (!questCompleted(n, results)) return '';
  const result = results[n.r];
  return `<span class="quest-badge" aria-label="미션 ${result.correct === result.total ? '만점' : '완료'}">${result.correct === result.total ? '만점' : '미션 완료'}</span>`;
}

function questCases(n) {
  return [n.study?.case, ...(n.sec || []).map(s => s.case)].filter(item => item?.steps?.length);
}

function questPanel(n, cases) {
  const count = questCount(n), result = questMap()[n.r];
  const score = result?.total === count && count ? `<span class="quest-story__score">최고 기록 ${result.correct} / ${count}</span>` : '';
  const choices = cases.length > 1 ? `<label class="quest-select" for="quest-case">사례 선택
    <select id="quest-case">${cases.map((item, i) => `<option value="${i}">${esc(item.title)}</option>`).join('')}</select>
  </label>` : '';
  return `<section id="note-quest" class="quest-story quest-${n.tp}" aria-labelledby="quest-story-title">
    <div class="quest-story__head"><div><p>${QUEST_TEAMS[n.tp].scene}</p><h2 id="quest-story-title">실무 스토리</h2></div>${score}</div>
    ${choices}
    <div id="quest-scene"></div>
    <div class="quest-story__actions">
      ${count ? `<a href="#/mission/${n.r}" class="quest-action">미션 풀기 <span>${count}문제</span></a>` : ''}
      <button type="button" class="quest-text-button" id="quest-go-note">원본 노트 읽기</button>
    </div>
  </section>`;
}

function questScene(n, sample, step) {
  const team = QUEST_TEAMS[n.tp], [title, body] = sample.steps[step], total = sample.steps.length;
  const speaker = step === 0 ? 'new' : 'lead';
  const name = speaker === 'new' ? '신입 담당자' : `${team.name} 선배`;
  const pages = sample.steps.map((_, i) => `<button type="button" class="quest-page" data-page="${i}" aria-label="${i + 1}컷 보기" ${i === step ? 'aria-current="step"' : ''}>${i + 1}</button>`).join('');
  return `<figure class="quest-comic" aria-label="${esc(sample.title)}">
    <figcaption>${inl(sample.title)}</figcaption>
    <div class="quest-comic__panel" data-step="${step % 3}">
      <div class="quest-comic__set" aria-hidden="true"><span class="quest-prop quest-prop--${team.shape}"></span>${questAvatar(n.tp, speaker)}</div>
      <div class="quest-bubble" id="quest-current-panel" tabindex="-1">
        <p class="quest-speaker">${name} <span>${step + 1} / ${total}컷</span></p>
        <h3>${inl(title)}</h3><p>${inl(body)}</p>
      </div>
    </div>
  </figure>
  <div class="quest-controls" aria-label="만화 컷 이동">
    <button type="button" class="quest-move" data-page="${step - 1}" ${step === 0 ? 'disabled' : ''}>이전 컷</button>
    <div class="quest-pages">${pages}</div>
    <button type="button" class="quest-move" data-page="${step + 1}" ${step === total - 1 ? 'disabled' : ''}>다음 컷</button>
  </div>`;
}

function questBind(n, cases, behavior) {
  const scene = $('#quest-scene');
  let sample = cases[0];
  const show = (page, focus) => {
    scene.innerHTML = questScene(n, sample, page);
    if (focus) $('#quest-current-panel').focus({preventScroll: true});
  };
  scene.onclick = event => {
    const button = event.target.closest('button[data-page]');
    if (button && !button.disabled) show(Number(button.dataset.page), true);
  };
  const select = $('#quest-case');
  if (select) select.onchange = () => { sample = cases[Number(select.value)]; show(0, false); };
  $('#quest-go-note').onclick = () => {
    const note = $('#note-intro');
    note.setAttribute('tabindex', '-1');
    note.focus({preventScroll: true});
    note.scrollIntoView({behavior});
  };
  show(0, false);
}

function questMissionHead(n, current, total) {
  return `<div class="quest-mission-head quest-${n.tp}">${questAvatar(n.tp)}<div>
    <p>${QUEST_TEAMS[n.tp].name} 미션 · ${current} / ${total}</p><h1>${esc(n.t)}</h1>
  </div></div>`;
}

function questMissionResult(dr, correct, total) {
  const n = noteBy(dr.r);
  questSave(dr.r, correct, total);
  const results = questMap();
  const more = N.filter(x => x.tp === n.tp && questCount(x) && !questCompleted(x, results));
  const next = more.find(x => x.r > n.r) || more[0];
  paint(`<div class="bar"><div class="in"><a class="btn icon ghost" href="${dr.back}" aria-label="노트로 돌아가기">${I.back}</a><span class="ttl">미션 결과</span></div></div>
    <div class="wrap" style="padding-top:12px"><section class="quest-result quest-${n.tp}" aria-labelledby="quest-result-title">
      ${questAvatar(n.tp)}<h1 id="quest-result-title" tabindex="-1">${correct === total ? '미션 만점!' : '미션 완료'}</h1>
      <p class="quest-result__score">${correct} / ${total}<span> 정답</span></p>
      <p>${esc(n.t)}${correct < total ? `<br>틀린 ${total - correct}문제는 오답 복습함에 넣었어요.` : ''}</p>
      <div class="quest-result__links">${next ? `<a class="quest-action" href="#/note/${next.r}">다음 미션 <span>${chap(next.r)}</span></a>` : `<a class="quest-action" href="#/notes/${n.tp}">과목 지도 보기</a>`}
      <a class="quest-text-button" href="${dr.back}">노트로 돌아가기</a>
      <button type="button" class="quest-text-button" onclick="nav('#/mission/${n.r}')">다시 풀기</button></div>
    </section></div>`);
  $('#quest-result-title').focus({preventScroll: true});
}
