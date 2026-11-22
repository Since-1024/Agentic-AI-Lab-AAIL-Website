// Generates the repetitive partials (research, news, people, life) from the data below.
// Run: node scripts/gen-partials.mjs   (text lives in public/assets/lang/*.json, keyed by data-lang)
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = (name, html) => writeFileSync(resolve(root, 'src/partials', name), html);

const arrow = '<svg class="m-arrow" viewBox="0 0 12 12" aria-hidden="true"><path class="m-arrow__stem" d="M1 6h8"/><path class="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5"/></svg>';

/* ---------------- research: three years, six papers each, two rows of three ---------------- */
const papers = {
  2026: [
    { k: 'p18', venue: null, img: 'papers/turingunion-method.webp', paper: 'https://arxiv.org/abs/2610.40492', web: 'https://turingu.cn/' },
    { k: 'p16', venue: 'NeurIPS 2026', img: 'papers/prism.webp', paper: 'https://arxiv.org/abs/2605.19382', code: 'https://github.com/positionprivacy/PRISM' },
    { k: 'p13', venue: 'ICML 2026', img: 'papers/agentxray.webp', paper: 'https://arxiv.org/abs/2602.05353' },
    { k: 'p14', venue: null, img: 'papers/devicesworld.webp', paper: 'https://arxiv.org/abs/2607.13465', code: 'https://github.com/AgenticOrgLab/DevicesWorld' },
    { k: 'p15', venue: null, img: 'papers/replan.webp', paper: 'https://arxiv.org/abs/2606.20487' },
    { k: 'p12', venue: null, img: 'papers/position.webp', paper: 'https://arxiv.org/abs/2602.05289' },
  ],
  2025: [
    { k: 'p3', venue: 'ICLR 2025', img: 'papers/macnet.webp', paper: 'https://arxiv.org/abs/2406.07155' },
    { k: 'p4', venue: 'NeurIPS 2025', img: 'papers/puppeteer.webp', paper: 'https://arxiv.org/abs/2505.19591' },
    { k: 'p6', venue: 'ACL 2025', img: 'papers/ctc.webp', paper: 'https://arxiv.org/abs/2406.08979' },
    { k: 'p8', venue: 'ICLR 2025', img: 'papers/ioa.webp', paper: 'https://arxiv.org/abs/2407.07061' },
    { k: 'p9', venue: 'ACL 2025', img: 'papers/optima.webp', paper: 'https://arxiv.org/abs/2410.08115' },
    { k: 'p17', venue: null, img: 'video/appcopilot.jpg', paper: 'https://arxiv.org/abs/2509.02444', code: 'https://github.com/OpenBMB/AppCopilot' },
  ],
  2024: [
    { k: 'p1', venue: 'ACL 2024', img: 'papers/chatdev.webp', paper: 'https://aclanthology.org/2024.acl-long.810/' },
    { k: 'p2', venue: 'ACL 2024', img: 'papers/co-learning.webp', paper: 'https://aclanthology.org/2024.acl-long.305/' },
    { k: 'p5', venue: 'NeurIPS 2024', img: 'papers/iagents.webp', paper: 'https://neurips.cc/virtual/2024/poster/93728' },
    { k: 'p7', venue: 'ICLR 2024', img: 'papers/agentverse.webp', paper: 'https://iclr.cc/virtual/2024/poster/19109' },
    { k: 'p10', venue: 'EMNLP 2024', img: 'papers/autoform.webp', paper: 'https://aclanthology.org/2024.findings-emnlp.623/' },
    { k: 'p11', venue: 'eBook', img: 'papers/ebook.webp', paper: 'https://thinkwee.top/multiagent_ebook/' },
  ],
};
const years = Object.keys(papers).sort().reverse();
const paperCard = p => `
            <article class="card card--open paper span-4">
              <div class="panel panel--top panel--fig"><img class="frame__img" src="assets/img/${p.img}" alt="" loading="lazy"></div>
              ${p.venue ? `<p class="t-label paper__venue">${p.venue}</p>` : '<p class="t-label paper__venue" data-lang="venuePreprint"></p>'}
              <h3 data-lang="${p.k}Title"></h3>
              <p data-lang="${p.k}Desc"></p>
              <p class="paper__links"><a class="link" href="${p.paper}" target="_blank" rel="noopener" data-lang="paper"></a>${p.code ? `<a class="link" href="${p.code}" target="_blank" rel="noopener" data-lang="code"></a>` : ''}${p.web ? `<a class="link" href="${p.web}" target="_blank" rel="noopener" data-lang="website"></a>` : ''}</p>
            </article>`;
const panelRow = (y, row) => `
          <div class="grid" role="tabpanel" id="papers-${y}-${row}" aria-labelledby="tab-${y}"${y === years[0] ? '' : ' hidden'}>${papers[y].slice(row * 3, row * 3 + 3).map(paperCard).join('')}
          </div>`;
out('4-research.html', `  <section class="section g2" id="research" aria-labelledby="research-h">
    <div class="wrap">
      <div class="group">
        <div class="section-head section-head--row">
          <h2 id="research-h"><span data-lang="resTitle"></span> <span class="muted" data-lang="resTitleMuted"></span></h2>
          <div class="tabs" role="tablist" data-lang-aria="resTabAria">${years.map((y, i) => `
            <button class="tab" type="button" role="tab" id="tab-${y}" aria-selected="${i === 0}" aria-controls="papers-${y}-0 papers-${y}-1" data-lang="tab${y}"></button>`).join('')}
          </div>
        </div>
        <div class="paper-rows">${years.map(y => panelRow(y, 0)).join('')}
        </div>
      </div>
      <div class="paper-rows">${years.map(y => panelRow(y, 1)).join('')}
      </div>
    </div>
  </section>
`);

/* ---------------- news: one list over two screens, the latest demo beside the first half ---------------- */
const news = [
  ['2026-10', 'n14', [['paper', 'https://arxiv.org/abs/2610.40492'], ['website', 'https://turingu.cn/']]],
  ['2026-09', 'n15', [['paper', 'https://arxiv.org/abs/2605.19382']]],
  ['2026-08', 'n7', [['code', 'https://github.com/OpenBMB/ChatDev']]],
  ['2026-07', 'n8', [['paper', 'https://arxiv.org/abs/2607.13465']]],
  ['2026-06', 'n9', [['paper', 'https://arxiv.org/abs/2606.20487']]],
  ['2026-05', 'n10', [['paper', 'https://arxiv.org/abs/2605.19382']]],
  ['2026-05', 'n1', [['website', 'https://www.teachmaster.cn/V2/']]],
  ['2026-05', 'n2', [['paper', 'https://arxiv.org/abs/2602.05353']]],
  ['2026-04', 'n3', [['paper', 'https://arxiv.org/abs/2601.04204']]],
  ['2026-02', 'n11', [['paper', 'https://www.nature.com/articles/s44387-026-00076-4']]],
  ['2026-02', 'n4', [['paper', 'https://arxiv.org/abs/2602.05289']]],
  ['2026-02', 'n5', [['paper', 'https://arxiv.org/abs/2602.05353']]],
  ['2026-02', 'n6', [['website', 'https://weakaccept.top/']]],
  ['2026-01', 'n12', [['paper', 'https://arxiv.org/abs/2601.04204']]],
  ['2026-01', 'n13', [['code', 'https://github.com/OpenBMB/ChatDev']]],
];
const newsRow = ([date, k, links]) => `
            <li><span class="rows__name news__date">${date}</span><p data-lang="${k}"></p><span class="rows__value news__links">${links.map(([l, h]) => `<a class="link" href="${h}" target="_blank" rel="noopener" data-lang="${l}"></a>`).join('')}</span></li>`;
out('5-news.html', `  <section class="section ground-tint" id="news" aria-labelledby="news-h">
    <div class="wrap">
      <div class="section-head">
        <h2 id="news-h"><span data-lang="newsTitle"></span> <span class="muted" data-lang="newsTitleMuted"></span></h2>
      </div>
      <div class="grid grid--top">
        <ul class="rows news span-6">${news.slice(0, 8).map(newsRow).join('')}
        </ul>
        <ul class="rows news span-6">${news.slice(8).map(newsRow).join('')}
        </ul>
      </div>
    </div>
  </section>
`);

/* ---------------- people: the lead on four columns, then tiles of two ---------------- */
const person = (img, name, role, href) => `
          <${href ? `a href="${href}" target="_blank" rel="noopener"` : 'div'} class="tile person-tile span-2">
            <div class="tile__media tile--portrait"><img src="assets/img/people/${img}.webp" data-lang-alt="${name}" loading="lazy"></div>
            <div class="person-tile__text"><h3 data-lang="${name}"></h3><p class="t-small muted" data-lang="${role}"></p></div>
          </${href ? 'a' : 'div'}>`;
const row1 = [
  ['fanjingru', 'Namefanjingru', 'rolePhD25', 'https://ffcosmos.github.io/'],
  ['wangyuheng', 'Namewangyuheng', 'rolePhD26', 'https://hendrick-wang.github.io/'],
  ['liyihan', 'Nameliyihan', 'rolePhD26'],
  ['yaoshu', 'Nameyaoshu', 'rolePhD26'],
];
const row2 = [
  ['lizhi', 'Namelizhi', 'rolePhD26'],
  ['lihuatao', 'Namelihuatao', 'roleMaster25'],
  ['dangyufan', 'Namedangyufan', 'roleMasterJoint'],
  ['liangweicheng', 'Namelianweicheng', 'roleMasterJoint'],
  ['wulin', 'Namewulin', 'roleMaster26'],
  ['zhoujinqian', 'Namejinqian', 'JinqianRole'],
];
const row3 = [
  ['zhangjie', 'Namezhangjie', 'Desczhangjie'],
  ['zhoutianle', 'Namezhoutianle', 'Desczhoutianle'],
  ['yangrunde', 'Nameyangrunde', 'Descyangrunde'],
  ['zhangqiran', 'Namezhangqiran', 'Desczhangqiran'],
  ['wukezhao', 'Namewukezhao', 'Descwukezhao'],
  ['zhouyunjie', 'Namezhouyunjie', 'Desczhouyunjie'],
];
const p = r => r.map(x => person(...x)).join('');
out('7-people.html', `  <section class="section g2" id="people" aria-labelledby="people-h">
    <div class="wrap">
      <div class="group">
        <div class="section-head">
          <h2 id="people-h"><span data-lang="peopleTitle"></span> <span class="muted" data-lang="peopleTitleMuted"></span></h2>
        </div>
        <div class="grid grid--top">
          <a class="tile lead-tile span-4" href="https://qianc62.github.io/" target="_blank" rel="noopener">
            <div class="tile__media tile--portrait"><img src="assets/img/people/qianchen.webp" data-lang-alt="ProfqianchenName" loading="lazy"></div>
            <div class="lead-tile__text stack-2">
              <h3 data-lang="ProfqianchenName"></h3>
              <p class="t-small muted" data-lang="rolePI"></p>
              <p data-lang="ProfqianchenDesc"></p>
              <span class="link" data-lang="profile"></span>
            </div>
          </a>${p(row1)}
        </div>
      </div>
      <div class="people-rest">
        <div class="grid grid--top">${p(row2)}
        </div>
        <div class="grid grid--top">${p(row3)}
        </div>
      </div>
    </div>
  </section>
`);

/* ---------------- life: a picture wall over two screens, no captions (the alt says it) ---------------- */
// 16 photographs, each once (the ACL photograph is the hero's, so it is not repeated here)
const shots = ['20260913', '20260911', '20260718', '20260418', '20260418-2', '20260320', '20260318', '20260318-2',
  '20260315-2', '20260312', '20251223', '20250927', '20250914', '20250728', '20250725', '20250620'];
const shot = s => `
          <figure class="wall__cell"><img src="assets/img/activity/${s}.webp" data-lang-alt="a${s}" data-lang-title="a${s}" loading="lazy"></figure>`;
out('8-activities.html', `  <section class="section g2 ground-inverse" id="life" aria-labelledby="life-h">
    <div class="wrap">
      <div class="group">
        <div class="section-head">
          <h2 id="life-h"><span data-lang="actTitle"></span> <span class="muted" data-lang="actTitleMuted"></span></h2>
        </div>
        <div class="wall wall--a fill">${shots.slice(0, 8).map(shot).join('')}
        </div>
      </div>
      <div class="wall wall--b">${shots.slice(8).map(shot).join('')}
      </div>
    </div>
  </section>
`);
console.log('partials written');
