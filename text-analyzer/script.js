const POSITIVE_WORDS = new Set([
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'brilliant',
  'outstanding', 'superb', 'perfect', 'best', 'love', 'like', 'enjoy', 'happy', 'joy',
  'pleased', 'delighted', 'satisfied', 'impressed', 'beautiful', 'lovely', 'nice',
  'positive', 'success', 'successful', 'win', 'won', 'victory', 'achieve', 'achieved',
  'improve', 'improved', 'better', 'strong', 'stronger', 'powerful', 'effective',
  'efficient', 'valuable', 'useful', 'helpful', 'beneficial', 'advantage', 'profit',
  'gain', 'earn', 'earned', 'reward', 'rewarding', 'proud', 'confident', 'optimistic',
  'hopeful', 'excited', 'enthusiastic', 'inspired', 'motivated', 'determined',
  'passionate', 'dedicated', 'committed', 'loyal', 'trust', 'trusted', 'reliable',
  'honest', 'integrity', 'respect', 'admire', 'appreciate', 'grateful', 'thankful',
  'blessed', 'fortunate', 'lucky', 'peace', 'peaceful', 'calm', 'relaxed', 'serene',
  'content', 'fulfilled', 'satisfying', 'rewarding', 'meaningful', 'purposeful',
  'bright', 'brighter', 'light', 'shine', 'sparkle', 'glow', 'radiant', 'vibrant',
  'energetic', 'lively', 'dynamic', 'active', 'healthy', 'strong', 'fit', 'well'
]);

const NEGATIVE_WORDS = new Set([
  'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'dislike', 'angry', 'sad',
  'unhappy', 'disappointed', 'frustrated', 'annoyed', 'upset', 'worried', 'anxious',
  'stressed', 'stress', 'fear', 'afraid', 'scared', 'panic', 'nervous', 'tense',
  'negative', 'fail', 'failed', 'failure', 'lose', 'lost', 'loss', 'defeat', 'defeated',
  'wrong', 'incorrect', 'mistake', 'error', 'problem', 'issue', 'trouble', 'difficult',
  'hard', 'impossible', 'unable', 'cannot', 'cant', 'wont', 'refuse', 'reject', 'denied',
  'denial', 'refusal', 'oppose', 'opposition', 'against', 'conflict', 'fight', 'struggle',
  'suffer', 'suffering', 'pain', 'painful', 'hurt', 'injury', 'damage', 'harm', 'hurtful',
  'cruel', 'mean', 'rude', 'disrespectful', 'insult', 'offensive', 'abusive', 'toxic',
  'poison', 'poisonous', 'deadly', 'fatal', 'dangerous', 'risky', 'unsafe', 'insecure',
  'unstable', 'unreliable', 'untrustworthy', 'dishonest', 'corrupt', 'evil', 'wicked',
  'dark', 'gloomy', 'depressing', 'miserable', 'hopeless', 'helpless', 'worthless',
  'useless', 'pointless', 'meaningless', 'empty', 'lonely', 'isolated', 'abandoned',
  'rejected', 'unwanted', 'unloved', 'uncared', 'ignored', 'neglected', 'forgotten'
]);

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'between', 'among', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she',
  'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our',
  'their', 'mine', 'yours', 'hers', 'ours', 'theirs', 'am', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
  'will', 'would', 'should', 'could', 'may', 'might', 'must', 'shall', 'can', 'need',
  'dare', 'ought', 'not', 'no', 'nor', 'so', 'than', 'too', 'very', 'just', 'only',
  'also', 'even', 'still', 'yet', 'already', 'once', 'again', 'more', 'most', 'much',
  'many', 'few', 'little', 'less', 'least', 'some', 'any', 'each', 'every', 'all',
  'both', 'either', 'neither', 'one', 'two', 'three', 'first', 'last', 'next', 'other',
  'such', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how',
  'there', 'here', 'then', 'now', 'today', 'yesterday', 'tomorrow', 'always', 'never',
  'often', 'sometimes', 'rarely', 'seldom', 'usually', 'generally', 'normally',
  'actually', 'really', 'truly', 'certainly', 'definitely', 'probably', 'possibly',
  'maybe', 'perhaps', 'likely', 'unlikely', 'sure', 'surely', 'indeed', 'of course'
]);

const SAMPLE_TEXTS = {
  lorem: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
  speech: `I have a dream that one day this nation will rise up and live out the true meaning of its creed: "We hold these truths to be self-evident, that all men are created equal." I have a dream that one day on the red hills of Georgia, the sons of former slaves and the sons of former slave owners will be able to sit down together at the table of brotherhood. I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character. I have a dream today!`,
  code: `function calculateReadability(text) { // This function analyzes text complexity
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  return 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
}`,
  email: `Dear Team, I hope this email finds you well. I wanted to provide an update on the project timeline and share some important milestones we have achieved. Over the past few weeks, our development team has successfully completed the core functionality for the user authentication module. The testing phase is currently underway and we expect to have all unit tests passing by end of week. Please review the attached documentation and let me know if you have any questions or concerns. Best regards, Project Manager`
};

const state = {
  text: '',
  language: 'en',
  options: { sentiment: true, keywords: true, summary: true },
  results: null
};

function init() {
  setupBubbles();
  setupEventListeners();
  loadSample('lorem');
}

function setupBubbles() {
  const container = document.getElementById('bubbles');
  for (let i = 0; i < 15; i++) {
    const b = document.createElement('div');
    b.className = 'bubble';
    const size = Math.random() * 60 + 20;
    b.style.width = `${size}px`;
    b.style.height = `${size}px`;
    b.style.left = `${Math.random() * 100}vw`;
    b.style.animationDuration = `${Math.random() * 10 + 6}s`;
    b.style.animationDelay = `${Math.random() * 5}s`;
    container.appendChild(b);
  }
}

function setupEventListeners() {
  document.getElementById('analyzeBtn').addEventListener('click', analyze);
  document.getElementById('clearBtn').addEventListener('click', clearText);
  document.getElementById('exportReportBtn').addEventListener('click', exportReport);
  document.getElementById('copyStatsBtn').addEventListener('click', copyStats);
  document.getElementById('copySummaryBtn').addEventListener('click', copySummary);
  document.getElementById('language').addEventListener('change', e => { state.language = e.target.value; });

  document.querySelectorAll('.sample-buttons .preset-btn').forEach(btn => {
    btn.addEventListener('click', () => loadSample(btn.dataset.sample));
  });

  document.querySelectorAll('.checkbox-label input').forEach(cb => {
    cb.addEventListener('change', () => {
      state.options[cb.id.replace('opt', '').toLowerCase()] = cb.checked;
    });
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function loadSample(key) {
  state.text = SAMPLE_TEXTS[key];
  document.getElementById('textInput').value = state.text;
  analyze();
}

function clearText() {
  state.text = '';
  document.getElementById('textInput').value = '';
  document.querySelectorAll('.tab-content').forEach(t => t.hidden = true);
  document.getElementById('tabOverview').hidden = false;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.tab-btn[data-tab="overview"]').classList.add('active');
  state.results = null;
}

function analyze() {
  state.text = document.getElementById('textInput').value;
  if (!state.text.trim()) {
    alert('Please enter some text to analyze.');
    return;
  }

  state.results = {
    stats: computeStats(state.text),
    readability: computeReadability(state.text),
    sentiment: state.options.sentiment ? computeSentiment(state.text) : null,
    keywords: state.options.keywords ? extractKeywords(state.text) : null,
    summary: state.options.summary ? generateSummary(state.text) : null
  };

  renderResults();
}

function computeStats(text) {
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const paragraphCount = paragraphs.length;
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  const avgCharsPerWord = wordCount > 0 ? charsNoSpaces / wordCount : 0;
  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, ''))).size;
  const readingTime = Math.ceil(wordCount / 200);
  const speakingTime = Math.ceil(wordCount / 130);

  return { chars, charsNoSpaces, wordCount, sentenceCount, paragraphCount, avgWordsPerSentence, avgCharsPerWord, uniqueWords, readingTime, speakingTime };
}

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  let count = 0;
  const vowels = 'aeiouy';
  let prevVowel = false;
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  if (word.endsWith('e')) count--;
  return Math.max(1, count);
}

function countComplexWords(words) {
  return words.filter(w => countSyllables(w) >= 3).length;
}

function computeReadability(text) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const complexWords = countComplexWords(words);

  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllables / wordCount;
  const complexWordPct = (complexWords / wordCount) * 100;

  const fleschKincaid = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  const fleschKincaidGrade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
  const gunningFog = 0.4 * (avgWordsPerSentence + complexWordPct);
  const smog = 1.043 * Math.sqrt(complexWords * (30 / sentenceCount)) + 3.1291;
  const ari = 4.71 * (avgCharsPerWord(words)) + 0.5 * avgWordsPerSentence - 21.43;
  const colemanLiau = 0.0588 * (avgCharsPerWord(words) * 100) - 0.296 * (sentenceCount / wordCount * 100) - 15.8;

  return {
    fleschKincaid: { score: Math.round(fleschKincaid * 10) / 10, grade: Math.round(fleschKincaidGrade * 10) / 10 },
    gunningFog: Math.round(gunningFog * 10) / 10,
    smog: Math.round(smog * 10) / 10,
    ari: Math.round(ari * 10) / 10,
    colemanLiau: Math.round(colemanLiau * 10) / 10
  };
}

function avgCharsPerWord(words) {
  const chars = words.reduce((sum, w) => sum + w.replace(/[^a-z]/gi, '').length, 0);
  return words.length > 0 ? chars / words.length : 0;
}

function getReadabilityLabel(score, type) {
  if (type === 'flesch') {
    if (score >= 90) return { label: 'Very Easy', class: 'easy' };
    if (score >= 80) return { label: 'Easy', class: 'easy' };
    if (score >= 70) return { label: 'Fairly Easy', class: 'easy' };
    if (score >= 60) return { label: 'Standard', class: 'medium' };
    if (score >= 50) return { label: 'Fairly Difficult', class: 'medium' };
    if (score >= 30) return { label: 'Difficult', class: 'hard' };
    return { label: 'Very Difficult', class: 'hard' };
  }
  const grade = type === 'fkgrade' ? score : score;
  if (grade <= 6) return { label: 'Elementary', class: 'easy' };
  if (grade <= 8) return { label: 'Middle School', class: 'easy' };
  if (grade <= 10) return { label: 'High School', class: 'medium' };
  if (grade <= 12) return { label: 'College', class: 'medium' };
  if (grade <= 16) return { label: 'University', class: 'hard' };
  return { label: 'Graduate', class: 'hard' };
}

function computeSentiment(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);

  let pos = 0, neg = 0, neu = 0;
  const sentenceSentiments = [];

  for (const sentence of sentences) {
    const sWords = sentence.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    let sPos = 0, sNeg = 0;
    for (const w of sWords) {
      const clean = w.replace(/[^a-z]/g, '');
      if (POSITIVE_WORDS.has(clean)) sPos++;
      if (NEGATIVE_WORDS.has(clean)) sNeg++;
    }
    let label = 'neutral', score = 0;
    if (sPos > sNeg) { label = 'positive'; score = (sPos - sNeg) / Math.max(1, sWords.length); pos++; }
    else if (sNeg > sPos) { label = 'negative'; score = (sNeg - sPos) / Math.max(1, sWords.length); neg++; }
    else { neu++; }
    sentenceSentiments.push({ text: sentence.trim(), label, score });
  }

  const total = pos + neg + neu || 1;
  const overallScore = (pos - neg) / total;

  let overallLabel = 'Neutral', emoji = '😐';
  if (overallScore > 0.3) { overallLabel = 'Very Positive'; emoji = '😍'; }
  else if (overallScore > 0.1) { overallLabel = 'Positive'; emoji = '😊'; }
  else if (overallScore > -0.1) { overallLabel = 'Neutral'; emoji = '😐'; }
  else if (overallScore > -0.3) { overallLabel = 'Negative'; emoji = '😔'; }
  else { overallLabel = 'Very Negative'; emoji = '😢'; }

  return { overallLabel, overallScore: Math.round(overallScore * 100), emoji, pos, neg, neu, total, sentenceSentiments };
}

function extractKeywords(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const cleanWords = words.map(w => w.replace(/[^a-z]/g, '')).filter(w => w.length > 2 && !STOP_WORDS.has(w));

  const freq = {};
  for (const w of cleanWords) freq[w] = (freq[w] || 0) + 1;

  const docCount = sentences.length;
  const tfidf = {};
  for (const [word, tf] of Object.entries(freq)) {
    let docFreq = 0;
    for (const s of sentences) {
      if (s.toLowerCase().includes(word)) docFreq++;
    }
    const idf = Math.log(docCount / (docFreq || 1));
    tfidf[word] = tf * idf;
  }

  return Object.entries(tfidf)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, score]) => ({ word, score: Math.round(score * 100) / 100, freq: freq[word] }));
}

function generateSummary(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).map(s => s.trim());
  if (sentences.length <= 3) return sentences.join('. ') + '.';

  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const cleanWords = words.map(w => w.replace(/[^a-z]/g, '')).filter(w => w.length > 2 && !STOP_WORDS.has(w));

  const freq = {};
  for (const w of cleanWords) freq[w] = (freq[w] || 0) + 1;
  const maxFreq = Math.max(...Object.values(freq));

  const sentenceScores = sentences.map((sentence, idx) => {
    const sWords = sentence.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z]/g, '')).filter(w => w.length > 0);
    let score = 0;
    for (const w of sWords) {
      if (freq[w]) score += freq[w] / maxFreq;
    }
    score += (sentences.length - idx) * 0.1;
    return { sentence, score, idx };
  });

  sentenceScores.sort((a, b) => b.score - a.score);
  const topSentences = sentenceScores.slice(0, Math.max(2, Math.ceil(sentences.length * 0.3)));
  topSentences.sort((a, b) => a.idx - b.idx);

  return topSentences.map(s => s.sentence).join('. ') + '.';
}

function renderResults() {
  renderOverview();
  renderReadability();
  renderSentiment();
  renderKeywords();
  renderSummary();
}

function renderOverview() {
  const s = state.results.stats;
  const grid = document.getElementById('statsGrid');
  grid.innerHTML = `
    <div class="stat-card"><div class="label">Characters</div><div class="value">${s.chars.toLocaleString()}</div></div>
    <div class="stat-card"><div class="label">Characters (no spaces)</div><div class="value">${s.charsNoSpaces.toLocaleString()}</div></div>
    <div class="stat-card"><div class="label">Words</div><div class="value">${s.wordCount.toLocaleString()}</div></div>
    <div class="stat-card"><div class="label">Sentences</div><div class="value">${s.sentenceCount.toLocaleString()}</div></div>
    <div class="stat-card"><div class="label">Paragraphs</div><div class="value">${s.paragraphCount.toLocaleString()}</div></div>
    <div class="stat-card"><div class="label">Unique Words</div><div class="value">${s.uniqueWords.toLocaleString()}</div></div>
    <div class="stat-card"><div class="label">Avg Words/Sentence</div><div class="value ${s.avgWordsPerSentence > 25 ? 'warn' : ''}">${s.avgWordsPerSentence.toFixed(1)}</div></div>
    <div class="stat-card"><div class="label">Avg Chars/Word</div><div class="value">${s.avgCharsPerWord.toFixed(1)}</div></div>
    <div class="stat-card"><div class="label">Reading Time</div><div class="value">${s.readingTime} min</div></div>
    <div class="stat-card"><div class="label">Speaking Time</div><div class="value">${s.speakingTime} min</div></div>
  `;

  drawCharChart(s);
  drawWordLenChart(s);
}

function drawCharChart(stats) {
  const canvas = document.getElementById('charChart');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  ctx.scale(dpr, dpr);

  const w = canvas.clientWidth, h = canvas.clientHeight;
  const categories = ['Letters', 'Digits', 'Spaces', 'Punctuation', 'Other'];
  const text = state.text;
  let letters = 0, digits = 0, spaces = 0, punct = 0, other = 0;
  for (const ch of text) {
    if (/[a-z]/i.test(ch)) letters++;
    else if (/\d/.test(ch)) digits++;
    else if (/\s/.test(ch)) spaces++;
    else if (/[.,!?;:()\[\]{}"'\/\\-]/.test(ch)) punct++;
    else other++;
  }
  const values = [letters, digits, spaces, punct, other];
  const maxVal = Math.max(...values);
  const colors = ['#00d4aa', '#4ecdc4', '#3742fa', '#ffa502', '#8b8ba3'];

  const barW = w / (values.length * 1.5);
  const gap = barW * 0.5;
  const maxH = h - 40;

  ctx.font = '11px Fredoka';
  ctx.textAlign = 'center';

  values.forEach((val, i) => {
    const x = gap + i * (barW + gap) + barW / 2;
    const barH = maxVal > 0 ? (val / maxVal) * maxH : 0;
    const y = h - 20 - barH;

    const grad = ctx.createLinearGradient(0, h - 20, 0, y);
    grad.addColorStop(0, colors[i]);
    grad.addColorStop(1, colors[i] + '88');
    ctx.fillStyle = grad;
    ctx.fillRect(x - barW / 2, y, barW, barH);

    ctx.fillStyle = '#f0f0f5';
    ctx.fillText(val.toLocaleString(), x, y - 4);
    ctx.fillStyle = '#8b8ba3';
    ctx.fillText(categories[i], x, h - 4);
  });
}

function drawWordLenChart(stats) {
  const canvas = document.getElementById('wordLenChart');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  ctx.scale(dpr, dpr);

  const w = canvas.clientWidth, h = canvas.clientHeight;
  const words = state.text.split(/\s+/).filter(w => w.length > 0);
  const lenCounts = {};
  for (const word of words) {
    const len = word.replace(/[^a-z]/gi, '').length;
    if (len > 0) lenCounts[len] = (lenCounts[len] || 0) + 1;
  }
  const maxLen = Math.min(15, Math.max(...Object.keys(lenCounts).map(Number)));
  const values = [];
  for (let i = 1; i <= maxLen; i++) values.push(lenCounts[i] || 0);
  const maxVal = Math.max(...values);
  const barW = w / (values.length * 1.2);
  const gap = barW * 0.2;
  const maxH = h - 40;

  ctx.font = '11px Fredoka';
  ctx.textAlign = 'center';

  values.forEach((val, i) => {
    const x = gap + i * (barW + gap) + barW / 2;
    const barH = maxVal > 0 ? (val / maxVal) * maxH : 0;
    const y = h - 20 - barH;

    const grad = ctx.createLinearGradient(0, h - 20, 0, y);
    grad.addColorStop(0, '#00d4aa');
    grad.addColorStop(1, '#00d4aa44');
    ctx.fillStyle = grad;
    ctx.fillRect(x - barW / 2, y, barW, barH);

    ctx.fillStyle = '#f0f0f5';
    ctx.fillText(val, x, y - 4);
    ctx.fillStyle = '#8b8ba3';
    ctx.fillText(i + 1, x, h - 4);
  });
}

function renderReadability() {
  const r = state.results.readability;
  const grid = document.getElementById('readabilityGrid');
  const fk = getReadabilityLabel(r.fleschKincaid.score, 'flesch');
  const fkg = getReadabilityLabel(r.fleschKincaid.grade, 'fkgrade');
  const gf = getReadabilityLabel(r.gunningFog, 'grade');
  const smog = getReadabilityLabel(r.smog, 'grade');
  const ari = getReadabilityLabel(r.ari, 'grade');
  const cl = getReadabilityLabel(r.colemanLiau, 'grade');

  grid.innerHTML = `
    <div class="readability-card">
      <div class="name">Flesch Reading Ease</div>
      <div class="score ${fk.class}">${r.fleschKincaid.score}</div>
      <div class="label">${fk.label}</div>
    </div>
    <div class="readability-card">
      <div class="name">Flesch-Kincaid Grade</div>
      <div class="score ${fkg.class}">${r.fleschKincaid.grade}</div>
      <div class="label">${fkg.label}</div>
    </div>
    <div class="readability-card">
      <div class="name">Gunning Fog Index</div>
      <div class="score ${gf.class}">${r.gunningFog}</div>
      <div class="label">${gf.label}</div>
    </div>
    <div class="readability-card">
      <div class="name">SMOG Index</div>
      <div class="score ${smog.class}">${r.smog}</div>
      <div class="label">${smog.label}</div>
    </div>
    <div class="readability-card">
      <div class="name">ARI</div>
      <div class="score ${ari.class}">${r.ari}</div>
      <div class="label">${ari.label}</div>
    </div>
    <div class="readability-card">
      <div class="name">Coleman-Liau</div>
      <div class="score ${cl.class}">${r.colemanLiau}</div>
      <div class="label">${cl.label}</div>
    </div>
  `;

  document.getElementById('readabilityExplanation').innerHTML = `
    <h4>How to Interpret</h4>
    <p><strong>Flesch Reading Ease (0-100):</strong> Higher = easier to read. 90-100 = 5th grade, 60-70 = 8th-9th grade, 0-30 = college graduate.</p>
    <p><strong>Grade Levels:</strong> Indicate US school grade required to understand the text. Multiple formulas provided for cross-validation.</p>
  `;
}

function renderSentiment() {
  const s = state.results.sentiment;
  if (!s) return;

  document.getElementById('sentimentDisplay').innerHTML = `
    <div class="sentiment-main">
      <div class="emoji">${s.emoji}</div>
      <div class="label">${s.overallLabel}</div>
      <div class="score">${s.overallScore > 0 ? '+' : ''}${s.overallScore}</div>
    </div>
    <div class="sentiment-breakdown">
      <div class="sentiment-bar">
        <span class="name">Positive</span>
        <div class="bar"><div class="fill pos" style="width:${(s.pos/s.total)*100}%"></div></div>
        <span class="pct">${s.pos} (${Math.round(s.pos/s.total*100)}%)</span>
      </div>
      <div class="sentiment-bar">
        <span class="name">Neutral</span>
        <div class="bar"><div class="fill neu" style="width:${(s.neu/s.total)*100}%"></div></div>
        <span class="pct">${s.neu} (${Math.round(s.neu/s.total*100)}%)</span>
      </div>
      <div class="sentiment-bar">
        <span class="name">Negative</span>
        <div class="bar"><div class="fill neg" style="width:${(s.neg/s.total)*100}%"></div></div>
        <span class="pct">${s.neg} (${Math.round(s.neg/s.total*100)}%)</span>
      </div>
    </div>
  `;

  drawSentimentChart(s);
}

function drawSentimentChart(sentiment) {
  const canvas = document.getElementById('sentimentChart');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  ctx.scale(dpr, dpr);

  const w = canvas.clientWidth, h = canvas.clientHeight;
  const data = sentiment.sentenceSentiments.slice(0, 50);
  if (!data.length) return;

  const padding = 40;
  const chartW = w - padding * 2;
  const chartH = h - padding * 2;

  ctx.strokeStyle = '#2a2a44';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 4; i++) {
    const y = padding + (i / 4) * chartH;
    ctx.moveTo(padding, y);
    ctx.lineTo(w - padding, y);
  }
  for (let i = 0; i <= 5; i++) {
    const x = padding + (i / 5) * chartW;
    ctx.moveTo(x, padding);
    ctx.lineTo(x, h - padding);
  }
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = '#00d4aa';
  ctx.lineWidth = 2;
  data.forEach((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * chartW;
    const y = padding + chartH / 2 - (d.score * chartH / 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.strokeStyle = '#ff6b6b';
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * chartW;
    const y = padding + chartH / 2;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = '#8b8ba3';
  ctx.font = '10px Fredoka';
  ctx.textAlign = 'center';
  for (let i = 0; i <= 4; i++) {
    const y = padding + (i / 4) * chartH;
    const val = (1 - i / 2).toFixed(1);
    ctx.fillText(val, padding - 10, y + 3);
  }
}

function renderKeywords() {
  const k = state.results.keywords;
  if (!k) return;

  const list = document.getElementById('keywordList');
  list.innerHTML = k.slice(0, 15).map(kw =>
    `<span class="keyword-tag" title="TF-IDF: ${kw.score}, Freq: ${kw.freq}">${kw.word}</span>`
  ).join('');

  drawKeywordChart(k);
}

function drawKeywordChart(keywords) {
  const canvas = document.getElementById('keywordChart');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  ctx.scale(dpr, dpr);

  const w = canvas.clientWidth, h = canvas.clientHeight;
  const top = keywords.slice(0, 10).reverse();
  if (!top.length) return;

  const maxScore = top[0].score;
  const barH = 18;
  const gap = 6;
  const startY = 20;
  const labelW = 80;

  ctx.font = '12px Fredoka';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  top.forEach((kw, i) => {
    const y = startY + i * (barH + gap) + barH / 2;
    const barW = (kw.score / maxScore) * (w - labelW - 20);

    ctx.fillStyle = '#00d4aa44';
    ctx.fillRect(labelW + 10, y - barH / 2, barW, barH);

    const grad = ctx.createLinearGradient(labelW + 10, 0, labelW + 10 + barW, 0);
    grad.addColorStop(0, '#00d4aa');
    grad.addColorStop(1, '#00e8bb');
    ctx.fillStyle = grad;
    ctx.fillRect(labelW + 10, y - barH / 2, barW, barH);

    ctx.fillStyle = '#f0f0f5';
    ctx.fillText(kw.word, labelW, y);

    ctx.fillStyle = '#8b8ba3';
    ctx.font = '11px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.fillText(kw.score.toFixed(2), labelW + 10 + barW + 5, y);
    ctx.font = '12px Fredoka';
    ctx.textAlign = 'right';
  });
}

function renderSummary() {
  const s = state.results.summary;
  if (!s) return;
  document.getElementById('summaryBox').textContent = s;
}

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.hidden = true);
  document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`).hidden = false;
}

function exportReport() {
  if (!state.results) { alert('Analyze text first.'); return; }
  const report = {
    timestamp: new Date().toISOString(),
    textLength: state.text.length,
    language: state.language,
    options: state.options,
    statistics: state.results.stats,
    readability: state.results.readability,
    sentiment: state.results.sentiment,
    keywords: state.results.keywords,
    summary: state.results.summary
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `text-analysis-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}

function copyStats() {
  if (!state.results) { alert('Analyze text first.'); return; }
  const s = state.results.stats;
  const text = `Characters: ${s.chars}\nWords: ${s.wordCount}\nSentences: ${s.sentenceCount}\nParagraphs: ${s.paragraphCount}\nUnique Words: ${s.uniqueWords}\nAvg Words/Sentence: ${s.avgWordsPerSentence.toFixed(1)}\nReading Time: ${s.readingTime} min`;
  navigator.clipboard.writeText(text);
  alert('Statistics copied to clipboard!');
}

function copySummary() {
  if (!state.results?.summary) { alert('Generate summary first.'); return; }
  navigator.clipboard.writeText(state.results.summary);
  alert('Summary copied to clipboard!');
}

document.addEventListener('DOMContentLoaded', init);