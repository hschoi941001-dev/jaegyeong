function walkIntro(n, lesson, labs, cases, quiz) {
  const panels = lesson.views.map(([label, result]) =>
    `<div class="walk-view"><h3>${inl(label)}</h3><p>${inl(result)}</p></div>`).join('');
  return `<section class="walk-intro" id="walk-intro" aria-labelledby="walk-title">
    <p class="walk-scene">${inl(lesson.setting)}</p>
    <h2 id="walk-title">${inl(lesson.title)}</h2>
    <p>${inl(lesson.scenario)}</p>
    <div class="walk-compare">${panels}</div>
    <p class="walk-takeaway"><strong>이렇게 판단해요</strong> ${inl(lesson.reason)}</p>
    <nav class="easy-nav" aria-label="이 장에서 이어서 보기">
      ${labs.length ? '<button type="button" data-go="note-lab">직접 해보기</button>' : ''}
      ${n.r === 101 ? '<a href="#/note/101/101.e">유동·비유동</a><a href="#/note/101/101.f">포괄손익</a>' : ''}
      <button type="button" data-go="s-core">세부 개념 보기</button>
      ${cases.length ? '<button type="button" data-go="note-quest">실무 사례</button>' : ''}
      ${quiz ? `<a href="#/mission/${n.r}">시험형 문제 ${quiz}개</a>` : ''}
    </nav>
  </section>`;
}

function walkRecall(easy) {
  return `<section class="walk-recall" aria-label="연습 문제와 암기">
    <div class="easy-recall"><h3>혼자 풀어보기</h3><p>${inl(easy.question)}</p>
      <details><summary>정답과 풀이 보기</summary><p class="easy-answer">${inl(easy.answer)}</p></details>
    </div>
    <p class="walk-takeaway"><strong>시험 직전 한 줄</strong> ${inl(easy.memory)}</p>
  </section>`;
}

const liquidityQuestions = [
  {q:'장비를 사서 구축하고 돈을 받는 데 보통 15개월 걸려요. 구축 매출채권을 13개월 뒤에 받는다면?', answer:0, why:'13개월은 정상영업주기 15개월 안이에요. 영업상 매출채권은 유동자산이에요.'},
  {q:'결산 전에 약정을 어겼고 은행이 당장 갚으라고 할 수 있어요. 1월에야 18개월 유예를 받았다면 그 전해 12월 결산은?', answer:0, why:'12월 31일에는 미룰 권리가 없었어요. 이후 합의로 기말 분류가 바뀌지는 않아요.'},
  {q:'같은 회사가 12월 30일에 결산일로부터 18개월 유예를 받았어요. 다른 유동 요건이 없다면?', answer:1, why:'결산일에 적어도 12개월 동안 상환을 미룰 권리가 있었으므로 비유동부채예요.'},
  {q:'6개월 뒤 환입될 이연법인세부채예요. 회사가 유동·비유동을 나눠 표시한다면?', answer:1, why:'유동·비유동을 구분 표시할 때 이연법인세자산과 부채는 비유동이에요.'},
  {q:'앞으로 18개월간 교환이나 부채 결제에 사용할 수 없고 다른 유동 요건도 없는 제한 현금은?', answer:1, why:'보고기간 후 적어도 12개월 동안 사용이 제한된 현금은 현금이라는 이유로 유동자산이 되지 않아요.'}
];

function liquidityBalance() {
  const items = [
    ['유동자산', '현금, 매출채권', '가까운 시기에 돈으로 바뀌거나 쓸 재산', 'cash'],
    ['유동부채', '단기차입금, 매입채무', '가까운 시기에 갚을 빚', 'due'],
    ['비유동자산', '서버, 건물, 토지', '회사에서 오래 쓸 재산', 'asset'],
    ['비유동부채', '장기차입금', '상환을 장기간 미룰 권리가 있는 빚', 'debt']
  ];
  return `<figure class="balance-figure" aria-labelledby="liquidity-balance-title">
    <figcaption id="liquidity-balance-title">우리 회사의 재무상태표</figcaption>
    <div class="balance-grid">${items.map(([title, examples, note, type]) =>
      `<div class="balance-cell balance-cell--${type}">
        <span class="balance-icon" aria-hidden="true"></span><h5>${title}</h5>
        <p>${examples}</p><p>${note}</p>
      </div>`).join('')}</div>
  </figure>`;
}

function liquidityCompany({name, when, shortfall, note}) {
  return `<div class="company-case">
    <h5>${name}</h5>
    <div class="company-line"><span>보유 현금</span><strong>1억 원</strong><i aria-hidden="true"></i></div>
    <div class="company-line company-line--loan"><span>${when}</span><strong>3억 원</strong><i aria-hidden="true"></i></div>
    <p class="company-result"><strong>${shortfall}</strong><br>${note}</p>
  </div>`;
}

function liquidityGuide() {
  const rows = [
    ['회사 일에 쓰이거나 회수돼요', '정상영업주기 중 팔 서버나 회수할 매출채권', '정상영업주기 중 줄 외주대금'],
    ['단기매매 목적으로 갖고 있어요', '단기 시세차익을 노리는 주식', '단기매매 목적 금융부채'],
    ['12개월 이내에 실현·결제돼요', '6개월 후 만기 예금', '6개월 후 만기이고 장기 연기 권리가 없는 차입금'],
    ['현금 또는 상환을 미룰 권리', '현금·현금성자산. 보고기간 후 적어도 12개월간 교환 또는 부채 결제에 사용할 수 없다면 이 조건에서 제외', '기말에 적어도 12개월 결제를 미룰 실질적인 권리가 없다면 유동']
  ];
  return `<div id="liquidity-guide" class="liquidity-guide">
    <h4>유동과 비유동, 무슨 뜻일까요?</h4>
    <p>IT회사의 장부를 본다고 생각해 보세요. 회사가 가진 돈·장비·받을 권리를 <strong>자산</strong>, 회사가 갚거나 지급할 의무를 <strong>부채</strong>라고 해요. 둘을 언제 쓰거나 갚아야 하는지에 따라 나눠 볼게요.</p>
    ${liquidityBalance()}
    <p>처음에는 <strong>12개월</strong>을 기준으로 생각하면 돼요. 사업 한 건이 1년보다 긴 경우와 같은 예외는 아래에서 볼게요.</p>
    <h4>왜 같은 빚 3억 원을 다르게 보여줄까요?</h4>
    <p>두 IT회사 모두 현금이 <strong>1억 원</strong>, 은행 빚이 <strong>3억 원</strong>이에요. 당분간 수금이나 추가 조달은 없다고 가정할게요.</p>
    <div class="company-compare">
      ${liquidityCompany({name:'A사', when:'다음 달 갚을 빚', shortfall:'다음 달 상환에 2억 원 부족', note:'다음 달까지 마련해야 할 돈이 있어요.'})}
      ${liquidityCompany({name:'B사', when:'5년 뒤 갚을 빚', shortfall:'이 대출의 당장 상환 부담은 0원', note:'다음 달까지 3억 원을 마련할 필요는 없어요.'})}
    </div>
    <p>두 회사의 빚 총액은 같아요. <strong>언제 돈이 나가는지</strong>를 구분해야 지금 쓸 수 있는 돈으로 버틸 수 있는지 보여요.</p>
    <h4>사업 한 건이 1년을 넘으면요?</h4>
    <p>ERP 구축사는 장비를 사서 설치하고 수금할 때까지 보통 <strong>15개월</strong> 걸려요. 이 기간이 정상영업주기예요. 13개월 뒤 회수할 영업상 매출채권이나 13개월 뒤 줄 외주대금도 이 주기 안에 있으므로 유동이에요. 정상영업주기가 분명하지 않으면 12개월로 봐요.</p>
    <h4>언제 합의했느냐에 따라 빚의 칸이 바뀌어요</h4>
    <p>원래 3년 뒤에 갚을 대출이에요. 계약서에는 <strong>부채비율이 200%를 넘으면 은행이 바로 상환을 요구할 수 있다</strong>는 조건이 있어요. 이런 조건을 <strong>약정</strong>이라고 해요. 12월 28일 부채비율이 250%가 됐어요.</p>
    <div class="bank-dialogue">
      <p><b>은행</b> 약정 조건을 넘었으니 지금 3억 원을 갚으셔야 합니다.</p>
      <p><b>회사</b> 시간을 더 주세요. 상환을 18개월 미룰 수 있을까요?</p>
    </div>
    <p>은행이 결산일 이후 18개월 동안 상환을 요구하지 않기로 합의했어요. 두 날짜를 바꿔 봐요. 다른 유동 요건은 없다고 가정할게요.</p>
    <div class="liquidity-game" data-agreed="after">
      <fieldset><legend>은행이 유예에 동의한 날을 선택해 보세요</legend>
        <label><input type="radio" name="liquidity-date" value="before"> 12월 30일</label>
        <label><input type="radio" name="liquidity-date" value="after" checked> 1월 15일</label>
      </fieldset>
      <ol class="liquidity-timeline" aria-label="약정 위반, 결산일, 합의일">
        <li><span class="timeline-event">약정 위반</span><time datetime="12-28">12/28</time></li>
        <li data-date="before" data-caption="결산 전"><span class="timeline-event">결산 전</span><time datetime="12-30">12/30</time></li>
        <li class="timeline-close"><span class="timeline-event">결산일</span><time datetime="12-31">12/31</time></li>
        <li data-date="after" data-caption="결산 후" class="picked"><span class="timeline-event">유예 합의</span><time datetime="01-15">1/15</time></li>
      </ol>
      <p class="liquidity-result-label">12월 31일 기준 재무상태표</p>
      <div class="walk-compare liquidity-result">
        <div class="walk-view">유동부채<strong data-current>3억 원</strong></div>
        <div class="walk-view">비유동부채<strong data-long>0원</strong></div>
      </div>
      <p data-liquidity-result role="status">1월 15일에 합의했어요. 12월 31일에는 상환을 미룰 권리가 없었으므로 3억 원 전액이 유동부채예요.</p>
    </div>
    <p>재무상태표는 <strong>12월 31일에 찍은 사진</strong>과 같아요. 기말 뒤에 새로 얻은 권리로 사진을 바꾸지 않아요. 중요한 기말 후 합의는 공시 여부를 별도로 판단해요. 차환은 새 대출로 기존 대출을 갚는 일이에요.</p>
    <h4>시험에서는 네 조건 중 하나라도 맞는지 봐요</h4>
    <div class="walk-table" tabindex="0" role="region" aria-label="유동 자산과 부채 판단">
      <table><thead><tr><th scope="col">판단</th><th scope="col">유동자산</th><th scope="col">유동부채</th></tr></thead>
      <tbody>${rows.map(([label, asset, debt]) => `<tr><th scope="row">${esc(label)}</th><td>${esc(asset)}</td><td>${esc(debt)}</td></tr>`).join('')}</tbody></table>
    </div>
    <ul class="liquidity-traps">
      <li><strong>약정을 언제 지켜야 했는지</strong>가 중요해요. 12월 31일 기준 수치를 1월에 확인해도 결산일 분류에 영향이 있어요. 다음 해에만 지키면 되는 약정은 기말 분류에 영향이 없고, 관련 상환 위험은 공시 여부를 확인해요.</li>
      <li><strong>이연법인세자산·부채</strong>는 유동·비유동을 구분해 표시하는 경우 비유동이에요.</li>
    </ul>
    <h4>유동과 비유동 직접 골라보기</h4>
    <div class="liquidity-practice"><div class="liquidity-progress"><strong>미니 퀴즈</strong><span data-quiz-progress>0 / ${liquidityQuestions.length} 정답</span></div>${liquidityQuestions.map((q,i) => `<fieldset>
      <legend>${i+1}. ${esc(q.q)}</legend>
      <button type="button" data-question="${i}" data-answer="0" aria-pressed="false">유동</button>
      <button type="button" data-question="${i}" data-answer="1" aria-pressed="false">비유동</button>
      <p role="status" class="liquidity-feedback" hidden></p>
    </fieldset>`).join('')}</div>
    <p class="walk-takeaway"><strong>시험 직전 한 줄</strong> 12개월 → 정상영업주기 확인 → 빚은 결산일 현재 미룰 권리 확인.</p>
  </div>`;
}

function walkBind() {
  const guide = $('#liquidity-guide');
  if (!guide) return;
  const game = guide.querySelector('.liquidity-game');
  const correctQuestions = new Set();
  guide.onchange = event => {
    if (event.target.name !== 'liquidity-date') return;
    const early = event.target.value === 'before';
    game.dataset.agreed = event.target.value;
    guide.querySelectorAll('[data-date]').forEach(date => {
      const selected = date.dataset.date === event.target.value;
      date.classList.toggle('picked', selected);
      date.querySelector('.timeline-event').textContent = selected ? '유예 합의' : date.dataset.caption;
    });
    guide.querySelector('[data-current]').textContent = early ? '0원' : '3억 원';
    guide.querySelector('[data-long]').textContent = early ? '3억 원' : '0원';
    guide.querySelector('[data-liquidity-result]').textContent = early
      ? '12월 30일에 합의했어요. 12월 31일에 이미 상환을 미룰 권리가 있었으므로 3억 원 전액이 비유동부채예요.'
      : '1월 15일에 합의했어요. 12월 31일에는 상환을 미룰 권리가 없었으므로 3억 원 전액이 유동부채예요.';
  };
  guide.onclick = event => {
    const choice = event.target.closest('button[data-question]');
    if (!choice) return;
    const group = choice.closest('fieldset'), prompt = liquidityQuestions[Number(choice.dataset.question)];
    group.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button === choice)));
    const feedback = group.querySelector('[role="status"]'), correct = Number(choice.dataset.answer) === prompt.answer;
    feedback.hidden = false;
    feedback.dataset.result = correct ? 'right' : 'wrong';
    feedback.textContent = (correct ? '정답이에요. ' : '다시 확인해요. ') + prompt.why;
    if (correct) correctQuestions.add(choice.dataset.question); else correctQuestions.delete(choice.dataset.question);
    guide.querySelector('[data-quiz-progress]').textContent = correctQuestions.size + ' / ' + liquidityQuestions.length + ' 정답';
  };
}
