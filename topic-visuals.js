const topicColors = ['cash', 'due', 'asset', 'debt'];

function topicPanel(type, label, body) {
  return `<div class="balance-cell balance-cell--${type} topic-cell">${label ? `<h5>${inl(label)}</h5>` : ''}<p>${inl(body)}</p></div>`;
}

function topicRule(source) {
  const match = String(source).match(/^([^=:→]+?)\s*([=:→])\s*(.+)$/);
  if (!match || match[1].trim().length > 28) return {label: '', rule: String(source), relation: ''};
  return {label: match[1].trim(), rule: match[3].trim(), relation: match[2]};
}

function topicGuide(section, easy, diagram) {
  const rules = section.key.map(topicRule);
  const focus = rules.find(item => item.label) || rules[0];
  const question = focus.label
    ? `‘${focus.label}’에 해당하는 판단 기준이나 계산식은 무엇일까요?`
    : '눈을 떼고 방금 본 첫 번째 기준을 말해 볼까요?';
  const sentence = focus.label ? [focus.label, focus.relation, focus.rule].join(' ') : focus.rule;
  const sample = section.ex
    ? `<details class="topic-example"><summary>예시와 계산 살펴보기</summary><p>${inl(section.ex)}</p></details>`
    : '';
  const situation = easy && section.hook !== easy
    ? `<div class="topic-situation"><b>상황으로 이해하기</b><p>${inl(section.hook)}</p></div>` : '';
  return `<div class="topic-guide">
    <p class="topic-language">${inl(easy || section.hook)}</p>
    ${situation}
    <figure class="balance-figure topic-figure topic-figure--${rules.length}">
      <figcaption>판단 기준 한눈에 보기</figcaption>
      <div class="balance-grid">${rules.map((item, i) => topicPanel(topicColors[i % topicColors.length], item.label, item.rule)).join('')}</div>
    </figure>
    ${diagram ? `<div class="topic-diagram">${diagram}</div>` : ''}
    ${sample}
    <details class="topic-recall">
      <summary><span>확인 문제</span>${inl(question)}</summary>
      <div><b>정답</b><p>${inl(sentence)}</p></div>
    </details>
  </div>`;
}

const ociQuestions = [
  {q: '당기순이익 1,000에 기타포괄이익 200을 더했어요. 총포괄이익은?', first:'1,000', second:'1,200', correct:1, why:'1,000은 당기순이익이에요. 당기순이익 1,000에 OCI 200을 더하면 총포괄이익 1,200이에요.'},
  {q: '기타포괄손익으로 평가한 채권을 처분하면 기존 누적 평가손익은?', first:'당기손익으로 옮겨요', second:'당기손익으로 옮기지 않아요', correct:0, why:'FVOCI 채무상품은 제거할 때 기간 중 자본에 쌓인 누적 평가손익을 당기손익으로 재분류해요.'},
  {q: '기타포괄손익 표시를 최초 선택한 주식을 처분하면 기존 누적 평가손익은?', first:'당기손익으로 옮겨요', second:'당기손익으로 옮기지 않아요', correct:1, why:'FVOCI 지분상품은 처분해도 당기손익으로 재분류하지 않아요. 자본 안에서 옮길 수는 있어요.'},
  {q: '급여와 감가상각비의 금액을 따로 보여주면 비용을 어떻게 나눈 걸까요?', first:'성격별', second:'기능별', correct:0, why:'무엇에 썼는지 묻는 급여·감가상각비는 성격별이에요. 매출원가·판매비·관리비처럼 무슨 일에 썼는지를 보면 기능별이에요.'}
];

function ociGuide() {
  const definitions = [
    ['cash', '당기순이익', '당기손익으로 분류하는 수익과 비용을 반영한 이번 기간의 결과'],
    ['asset', '기타포괄손익 · OCI', '기준서가 그해 당기손익 밖에 따로 기록하라고 정한 일부 수익과 비용'],
    ['debt', '총포괄이익', '그해 당기순이익과 기타포괄이익을 합쳐 보여주는 금액'],
    ['due', '재분류조정', '예전에 OCI로 표시한 금액을 기준서가 정한 시점에 당기손익으로 옮기는 일']
  ];
  return `<div class="topic-guide" id="oci-guide">
    <h4>순이익이 1,000인데, 왜 1,200도 적을까요?</h4>
    <p class="topic-language">IT 회사의 한 해 결산을 본다고 생각해 보세요. 여기에는 <strong>당기손익을 계산할 때 넣는 항목</strong>과 <strong>기준서에 따라 OCI 칸에 따로 적는 항목</strong>이 있어요. 두 칸을 함께 보면 총포괄손익이에요.</p>
    <figure class="balance-figure topic-figure">
      <figcaption>포괄손익계산서를 읽는 네 가지 말</figcaption>
      <div class="balance-grid">${definitions.map(values => topicPanel(...values)).join('')}</div>
    </figure>
    <h4>결산표에 숫자를 써 볼까요?</h4>
    <div class="oci-scores" aria-label="단위 백만 원. 당기순이익 천, 기타포괄이익 이백, 총포괄이익 천이백">
      <div><span>당기순이익</span><strong>1,000</strong></div><b aria-hidden="true">+</b>
      <div><span>기타포괄이익</span><strong>200</strong></div><b aria-hidden="true">=</b>
      <div><span>총포괄이익</span><strong>1,200</strong></div>
    </div>
    <p class="oci-unit">백만 원, OCI는 세후 가정</p>
    <p>OCI 200은 <strong>채권 평가이익 150 + 장비 재평가이익 100 − 퇴직급여 재측정손실 50</strong>이에요. 이 200을 당기순이익에 합쳐 1,200을 보여줘요.</p>
    <h4>나중에 당기손익으로 갈 수 있을까요?</h4>
    <p>이번에는 <strong>평가손익을 OCI에 기록하는 채권과 주식</strong>을 비교해요. 각각 누적 평가이익 150이 있다고 가정하고, 팔 때 어디로 가는지 바꿔 보세요.</p>
    <div class="liquidity-game oci-game" data-asset="bond">
      <fieldset><legend>처분할 자산을 선택해 보세요</legend>
        <label><input type="radio" name="oci-asset" value="bond" checked> 채권</label>
        <label><input type="radio" name="oci-asset" value="share"> 주식</label>
      </fieldset>
      <div class="oci-scores oci-scores--result">
        <div><span>처분 전 · OCI 누계액</span><strong>150</strong></div>
        <b aria-hidden="true">→</b>
        <div><span>당기손익으로 옮기는 금액</span><strong data-oci-value>150</strong></div>
      </div>
      <p data-oci-text role="status">FVOCI 채권은 처분할 때 누적 평가이익 150이 당기손익으로 옮겨져요.</p>
    </div>
    <div class="walk-compare">
      <div class="walk-view"><h5>손익으로 옮길 수 있어요</h5><p>FVOCI 채무상품, 해외사업장 환산차이, 일부 현금흐름위험회피 금액. 항목별 시점과 예외는 아래 시험 기준에서 확인해요.</p></div>
      <div class="walk-view"><h5>손익으로 옮기지 않아요</h5><p>FVOCI 지분상품, 재평가잉여금, 확정급여 재측정요소 등. 자본 안에서 옮기는 경우는 당기손익 이동과 달라요.</p></div>
    </div>
    <h4>비용은 두 가지 방법으로 읽을 수 있어요</h4>
    <div class="walk-compare">
      <div class="walk-view"><h5>무엇에 썼을까? · 성격별</h5><p>급여는 사람에게, 감가상각비는 장비를 사용한 만큼 발생한 비용이에요.</p></div>
      <div class="walk-view"><h5>무슨 일에 썼을까? · 기능별</h5><p>서비스 제공에 썼으면 매출원가, 회사 운영에 썼으면 관리비처럼 보여줘요. 급여·상각비 등 성격별 정보도 추가 공시해요.</p></div>
    </div>
    <div class="liquidity-practice oci-practice"><div class="liquidity-progress"><strong>미니 퀴즈</strong><span data-oci-progress>0 / ${ociQuestions.length} 정답</span></div>
      ${ociQuestions.map((q,i) => `<fieldset><legend>${i+1}. ${esc(q.q)}</legend>
        <button type="button" data-oci-question="${i}" data-oci-choice="0" aria-pressed="false">${esc(q.first)}</button>
        <button type="button" data-oci-question="${i}" data-oci-choice="1" aria-pressed="false">${esc(q.second)}</button>
        <p class="liquidity-feedback" role="status" hidden></p>
      </fieldset>`).join('')}
    </div>
    <p class="walk-takeaway"><strong>시험 직전</strong> 먼저 당기순이익과 OCI를 더해요. 그다음 OCI 항목별로 나중에 당기손익으로 옮길 수 있는지 따로 확인해요.</p>
  </div>`;
}

function topicVisualBind() {
  const guide = $('#oci-guide');
  if (!guide) return;
  const correct = new Set();
  guide.addEventListener('change', event => {
    if (event.target.name !== 'oci-asset') return;
    const selection = event.target.value;
    guide.querySelector('.oci-game').dataset.asset = selection;
    guide.querySelector('[data-oci-value]').textContent = selection === 'bond' ? '150' : '0';
    guide.querySelector('[data-oci-text]').textContent = selection === 'bond'
      ? 'FVOCI 채권은 처분할 때 누적 평가이익 150이 당기손익으로 옮겨져요.'
      : '최초에 OCI 표시를 선택한 FVOCI 주식은 처분해도 누적 평가이익 150을 당기손익으로 옮기지 않아요.';
  });
  guide.addEventListener('click', event => {
    const button = event.target.closest('button[data-oci-question]');
    if (!button) return;
    const i = Number(button.dataset.ociQuestion), question = ociQuestions[i];
    const fieldset = button.closest('fieldset'), feedback = fieldset.querySelector('[role="status"]');
    const right = Number(button.dataset.ociChoice) === question.correct;
    fieldset.querySelectorAll('button').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    feedback.hidden = false;
    feedback.dataset.result = right ? 'right' : 'wrong';
    feedback.textContent = (right ? '정답이에요. ' : '다시 확인해요. ') + question.why;
    if (right) correct.add(i); else correct.delete(i);
    guide.querySelector('[data-oci-progress]').textContent = `${correct.size} / ${ociQuestions.length} 정답`;
  });
}
