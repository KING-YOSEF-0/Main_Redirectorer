const FinanceTools = (() => {
  // State
  let activeTool = 'compound';
  let currencyRates = {};
  let currencyHistory = [];
  let netWorthAssets = [{ name: 'Cash', value: 10000, type: 'liquid' }];
  let netWorthLiabilities = [{ name: 'Credit Card', value: 2000, type: 'revolving' }];
  let netWorthHistory = [];

  // Currency list (major currencies)
  const CURRENCIES = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
    { code: 'PLN', name: 'Polish Złoty', symbol: 'zł' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
    { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
  ];

  // Embedded exchange rates (approximate, as of 2024)
  const EMBEDDED_RATES = {
    USD: 1, EUR: 0.92, GBP: 0.79, JPY: 151, CHF: 0.90,
    CAD: 1.36, AUD: 1.53, CNY: 7.24, INR: 83.1, PKR: 278,
    BRL: 5.08, RUB: 92.5, KRW: 1340, SGD: 1.35, HKD: 7.81,
    NZD: 1.64, MXN: 17.0, ZAR: 18.8, SEK: 10.7, NOK: 10.9,
    DKK: 6.87, PLN: 3.98, THB: 36.2, MYR: 4.71, PHP: 56.4,
    IDR: 15800, AED: 3.67, SAR: 3.75, TRY: 32.2, ILS: 3.71
  };

  const ASSET_TYPES = [
    { value: 'liquid', label: 'Cash / Savings', icon: '💵' },
    { value: 'investment', label: 'Investments', icon: '📈' },
    { value: 'retirement', label: 'Retirement', icon: '🏦' },
    { value: 'real_estate', label: 'Real Estate', icon: '🏠' },
    { value: 'vehicle', label: 'Vehicles', icon: '🚗' },
    { value: 'other', label: 'Other Assets', icon: '📦' }
  ];

  const LIABILITY_TYPES = [
    { value: 'mortgage', label: 'Mortgage', icon: '🏠' },
    { value: 'student_loan', label: 'Student Loan', icon: '🎓' },
    { value: 'auto_loan', label: 'Auto Loan', icon: '🚗' },
    { value: 'credit_card', label: 'Credit Card', icon: '💳' },
    { value: 'personal_loan', label: 'Personal Loan', icon: '📝' },
    { value: 'other', label: 'Other Debt', icon: '⚠️' }
  ];

  const elements = {};

  function init() {
    cacheElements();
    bindEvents();
    startBubbles();
    populateCurrencies();
    renderNetWorthTracks();
    showTool('compound');
    loadSavedData();
    updateAllResults();
  }

  function cacheElements() {
    // Tool tabs
    elements.toolTabs = document.querySelectorAll('.tool-tab');
    elements.toolPanels = document.querySelectorAll('.tool-panel');
    elements.resultPanels = document.querySelectorAll('.result-panel');

    // Compound Interest
    elements.ciPrincipal = document.getElementById('ci-principal');
    elements.ciRate = document.getElementById('ci-rate');
    elements.ciFrequency = document.getElementById('ci-frequency');
    elements.ciYears = document.getElementById('ci-years');
    elements.ciContribution = document.getElementById('ci-contribution');
    elements.ciContribFreq = document.getElementById('ci-contrib-frequency');
    elements.ciCalculate = document.getElementById('ci-calculate');
    elements.ciReset = document.getElementById('ci-reset');
    elements.ciSummary = document.getElementById('ci-summary');
    elements.ciChart = document.getElementById('ci-chart');
    elements.ciTable = document.getElementById('ci-table');

    // Loan
    elements.loanAmount = document.getElementById('loan-amount');
    elements.loanRate = document.getElementById('loan-rate');
    elements.loanTerm = document.getElementById('loan-term');
    elements.loanTermUnit = document.getElementById('loan-term-unit');
    elements.loanExtra = document.getElementById('loan-extra');
    elements.loanStart = document.getElementById('loan-start');
    elements.loanCalculate = document.getElementById('loan-calculate');
    elements.loanReset = document.getElementById('loan-reset');
    elements.loanSummary = document.getElementById('loan-summary');
    elements.loanTable = document.getElementById('loan-table');
    elements.loanExportCsv = document.getElementById('loan-export-csv');
    elements.loanExportJson = document.getElementById('loan-export-json');

    // FIRE
    elements.fireExpenses = document.getElementById('fire-expenses');
    elements.fireSwr = document.getElementById('fire-swr');
    elements.fireSavings = document.getElementById('fire-savings');
    elements.fireAnnualSave = document.getElementById('fire-annual-save');
    elements.fireReturn = document.getElementById('fire-return');
    elements.fireInflation = document.getElementById('fire-inflation');
    elements.fireCalculate = document.getElementById('fire-calculate');
    elements.fireReset = document.getElementById('fire-reset');
    elements.fireSummary = document.getElementById('fire-summary');
    elements.fireProgressFill = document.getElementById('fire-progress-fill');
    elements.fireProgressPct = document.getElementById('fire-progress-pct');
    elements.fireChart = document.getElementById('fire-chart');
    elements.fireTable = document.getElementById('fire-table');

    // Budget
    elements.budgetIncome = document.getElementById('budget-income');
    elements.budgetMethodRadios = document.querySelectorAll('input[name="budget-method"]');
    elements.budgetCustomBuckets = document.getElementById('budget-custom-buckets');
    elements.budgetBuckets = document.getElementById('budget-buckets');
    elements.budgetCalculate = document.getElementById('budget-calculate');
    elements.budgetReset = document.getElementById('budget-reset');
    elements.budgetSummary = document.getElementById('budget-summary');
    elements.budgetChart = document.getElementById('budget-chart');
    elements.budgetTable = document.getElementById('budget-table');

    // Currency
    elements.curAmount = document.getElementById('cur-amount');
    elements.curFrom = document.getElementById('cur-from');
    elements.curTo = document.getElementById('cur-to');
    elements.curSourceRadios = document.querySelectorAll('input[name="cur-source"]');
    elements.curDateField = document.getElementById('cur-date-field');
    elements.curDate = document.getElementById('cur-date');
    elements.curConvert = document.getElementById('cur-convert');
    elements.curSwap = document.getElementById('cur-swap');
    elements.curReset = document.getElementById('cur-reset');
    elements.curSummary = document.getElementById('cur-summary');
    elements.curHistory = document.getElementById('cur-history');

    // Net Worth
    elements.nwAssets = document.getElementById('nw-assets');
    elements.nwLiabilities = document.getElementById('nw-liabilities');
    elements.nwAddAsset = document.getElementById('nw-add-asset');
    elements.nwAddLiability = document.getElementById('nw-add-liability');
    elements.nwCalculate = document.getElementById('nw-calculate');
    elements.nwExport = document.getElementById('nw-export');
    elements.nwReset = document.getElementById('nw-reset');
    elements.nwSummary = document.getElementById('nw-summary');
    elements.nwChart = document.getElementById('nw-chart');
    elements.nwTable = document.getElementById('nw-table');

    // Global
    elements.btnExportAll = document.getElementById('btn-export-all');
    elements.btnImportData = document.getElementById('btn-import-data');
    elements.btnCopyResults = document.getElementById('btn-copy-results');
    elements.btnPrint = document.getElementById('btn-print');
  }

  function bindEvents() {
    // Tool tabs
    elements.toolTabs.forEach(tab => {
      tab.addEventListener('click', () => showTool(tab.dataset.tool));
    });

    // Budget method toggle
    elements.budgetMethodRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        elements.budgetCustomBuckets.hidden = radio.value !== 'custom';
      });
    });

    // Currency source toggle
    elements.curSourceRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        elements.curDateField.hidden = radio.value !== 'api';
      });
    });

    // Calculate buttons
    elements.ciCalculate.addEventListener('click', () => { calculateCompound(); updateAllResults(); });
    elements.ciReset.addEventListener('click', () => resetTool('compound'));

    elements.loanCalculate.addEventListener('click', () => { calculateLoan(); updateAllResults(); });
    elements.loanReset.addEventListener('click', () => resetTool('loan'));

    elements.fireCalculate.addEventListener('click', () => { calculateFire(); updateAllResults(); });
    elements.fireReset.addEventListener('click', () => resetTool('fire'));

    elements.budgetCalculate.addEventListener('click', () => { calculateBudget(); updateAllResults(); });
    elements.budgetReset.addEventListener('click', () => resetTool('budget'));

    elements.curConvert.addEventListener('click', () => { convertCurrency(); updateAllResults(); });
    elements.curSwap.addEventListener('click', swapCurrencies);
    elements.curReset.addEventListener('click', () => resetTool('currency'));

    elements.nwCalculate.addEventListener('click', () => { calculateNetWorth(); updateAllResults(); });
    elements.nwExport.addEventListener('click', exportNetWorthData);
    elements.nwReset.addEventListener('click', () => resetTool('networth'));

    elements.nwAddAsset.addEventListener('click', () => addNetWorthItem('asset'));
    elements.nwAddLiability.addEventListener('click', () => addNetWorthItem('liability'));

    // Global actions
    elements.btnExportAll.addEventListener('click', exportAllData);
    elements.btnImportData.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => importData(e.target.files[0]);
      input.click();
    });
    elements.btnCopyResults.addEventListener('click', copyCurrentResults);
    elements.btnPrint.addEventListener('click', () => window.print());

    // Auto-calculate on input change
    const allInputs = document.querySelectorAll('.tool-panel:not([hidden]) input, .tool-panel:not([hidden]) select');
    allInputs.forEach(input => {
      input.addEventListener('change', () => updateAllResults());
      input.addEventListener('input', () => updateAllResults());
    });

    // Net worth track inputs
    document.addEventListener('input', (e) => {
      if (e.target.closest('.track-item input')) updateAllResults();
    });
  }

  function startBubbles() {
    const container = document.getElementById('bubbles');
    const colors = ['var(--accent)', 'var(--accent-2)', 'var(--accent-3)', 'var(--accent-4)', 'var(--accent-5)'];

    function spawn() {
      const bubble = document.createElement('div');
      bubble.className = 'float';
      const size = Math.random() * 60 + 20;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const duration = Math.random() * 20 + 15;
      const dx = (Math.random() - 0.5) * 200;

      bubble.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        --c: ${color};
        --duration: ${duration}s;
        --dx: ${dx}px;
      `;
      container.appendChild(bubble);
      setTimeout(() => bubble.remove(), duration * 1000);
    }

    setInterval(spawn, 800);
    for (let i = 0; i < 8; i++) setTimeout(spawn, i * 200);
  }

  function populateCurrencies() {
    CURRENCIES.forEach(c => {
      const opt1 = document.createElement('option');
      opt1.value = c.code;
      opt1.textContent = `${c.code} - ${c.name} (${c.symbol})`;
      elements.curFrom.appendChild(opt1);

      const opt2 = opt1.cloneNode(true);
      elements.curTo.appendChild(opt2);
    });

    elements.curFrom.value = 'USD';
    elements.curTo.value = 'EUR';
    elements.curDate.valueAsDate = new Date();
  }

  function showTool(tool) {
    activeTool = tool;

    elements.toolTabs.forEach(tab => {
      const isActive = tab.dataset.tool === tool;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive);
    });

    elements.toolPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `tool-${tool}`);
    });

    elements.resultPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `result-${tool}`);
    });

    updateAllResults();
  }

  function updateAllResults() {
    switch (activeTool) {
      case 'compound': calculateCompound(); break;
      case 'loan': calculateLoan(); break;
      case 'fire': calculateFire(); break;
      case 'budget': calculateBudget(); break;
      case 'currency': convertCurrency(); break;
      case 'networth': calculateNetWorth(); break;
    }
  }

  // ============ COMPOUND INTEREST ============
  function calculateCompound() {
    const P = parseFloat(elements.ciPrincipal.value) || 0;
    const r = (parseFloat(elements.ciRate.value) || 0) / 100;
    const n = elements.ciFrequency.value === 'continuous' ? Infinity : parseInt(elements.ciFrequency.value);
    const t = parseFloat(elements.ciYears.value) || 0;
    const PMT = parseFloat(elements.ciContribution.value) || 0;
    const contribFreq = parseInt(elements.ciContribFreq.value);

    let finalAmount, totalContributions, totalInterest;

    if (n === Infinity) {
      // Continuous compounding
      finalAmount = P * Math.exp(r * t);
      if (PMT > 0) {
        // Continuous contributions approximation
        finalAmount += PMT * contribFreq * (Math.exp(r * t) - 1) / r;
      }
    } else {
      finalAmount = P * Math.pow(1 + r / n, n * t);
      if (PMT > 0) {
        const ratePerPeriod = r / n;
        const periods = n * t;
        const contribPeriods = contribFreq * t;
        const ratio = n / contribFreq;
        // Future value of annuity with different compounding
        finalAmount += PMT * ((Math.pow(1 + ratePerPeriod, periods) - 1) / ratePerPeriod) * (contribFreq / n);
      }
    }

    totalContributions = P + PMT * contribFreq * t;
    totalInterest = finalAmount - totalContributions;

    // Yearly breakdown
    const yearlyData = [];
    let balance = P;
    for (let year = 1; year <= t; year++) {
      const startBalance = balance;
      if (n === Infinity) {
        balance = balance * Math.exp(r);
        if (PMT > 0) balance += PMT * contribFreq;
      } else {
        balance = balance * Math.pow(1 + r / n, n);
        if (PMT > 0) {
          balance += PMT * contribFreq * Math.pow(1 + r / n, n / 2); // Approximation
        }
      }
      const yearlyInterest = balance - startBalance - PMT * contribFreq;
      yearlyData.push({ year, startBalance, endBalance: balance, interest: yearlyInterest, contribution: PMT * contribFreq });
    }

    renderCompoundSummary(P, finalAmount, totalContributions, totalInterest, t);
    renderCompoundChart(yearlyData);
    renderCompoundTable(yearlyData);
  }

  function renderCompoundSummary(P, final, contrib, interest, years) {
    elements.ciSummary.innerHTML = `
      <div class="summary-card">
        <div class="label">Final Balance</div>
        <div class="value">${formatCurrency(final)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Total Contributed</div>
        <div class="value">${formatCurrency(contrib)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Total Interest</div>
        <div class="value positive">${formatCurrency(interest)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Return Multiple</div>
        <div class="value">${(final / P).toFixed(2)}x</div>
      </div>
      <div class="summary-card">
        <div class="label">Annualized Return</div>
        <div class="value">${(((final / P) ** (1 / years) - 1) * 100).toFixed(2)}%</div>
      </div>
    `;
  }

  function renderCompoundChart(data) {
    const ctx = elements.ciChart.getContext('2d');
    const width = elements.ciChart.width = elements.ciChart.parentElement.clientWidth;
    const height = elements.ciChart.height = 200;
    const dpr = window.devicePixelRatio || 1;
    elements.ciChart.width = width * dpr;
    elements.ciChart.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) return;

    const maxVal = Math.max(...data.map(d => d.endBalance));
    const minVal = Math.min(...data.map(d => d.startBalance));
    const range = maxVal - minVal || 1;

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Axes
    ctx.strokeStyle = 'var(--border)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    for (let i = 1; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Balance line
    ctx.strokeStyle = 'var(--accent-3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = padding + (chartWidth / (data.length - 1 || 1)) * i;
      const y = height - padding - ((d.endBalance - minVal) / range) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Contributions area
    ctx.fillStyle = 'rgba(255, 79, 163, 0.1)';
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    data.forEach((d, i) => {
      const x = padding + (chartWidth / (data.length - 1 || 1)) * i;
      const y = height - padding - ((d.endBalance - minVal) / range) * chartHeight;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(padding + chartWidth, height - padding);
    ctx.closePath();
    ctx.fill();

    // Y-axis labels
    ctx.fillStyle = 'var(--muted)';
    ctx.font = '10px var(--font-mono)';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = maxVal - (range / 4) * i;
      const y = padding + (chartHeight / 4) * i + 3;
      ctx.fillText(formatCurrencyShort(val), padding - 5, y);
    }

    // X-axis labels
    ctx.textAlign = 'center';
    data.forEach((d, i) => {
      if (i % Math.ceil(data.length / 6) === 0 || i === data.length - 1) {
        const x = padding + (chartWidth / (data.length - 1 || 1)) * i;
        ctx.fillText(`Y${d.year}`, x, height - padding + 18);
      }
    });
  }

  function renderCompoundTable(data) {
    let html = '<table><thead><tr><th>Year</th><th>Start Balance</th><th>Contributions</th><th>Interest</th><th>End Balance</th></tr></thead><tbody>';
    data.forEach(d => {
      html += `<tr>
        <td>${d.year}</td>
        <td>${formatCurrency(d.startBalance)}</td>
        <td>${formatCurrency(d.contribution)}</td>
        <td class="positive">${formatCurrency(d.interest)}</td>
        <td>${formatCurrency(d.endBalance)}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    elements.ciTable.innerHTML = html;
  }

  // ============ LOAN AMORTIZATION ============
  function calculateLoan() {
    const principal = parseFloat(elements.loanAmount.value) || 0;
    const annualRate = (parseFloat(elements.loanRate.value) || 0) / 100;
    const termValue = parseFloat(elements.loanTerm.value) || 0;
    const termUnit = elements.loanTermUnit.value;
    const extraPayment = parseFloat(elements.loanExtra.value) || 0;
    const startDate = elements.loanStart.value ? new Date(elements.loanStart.value) : new Date();

    const months = termUnit === 'years' ? termValue * 12 : termValue;
    const monthlyRate = annualRate / 12;

    let monthlyPayment;
    if (monthlyRate === 0) {
      monthlyPayment = principal / months;
    } else {
      monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    }

    let balance = principal;
    let totalInterest = 0;
    let totalPaid = 0;
    const schedule = [];
    let currentDate = new Date(startDate);

    for (let month = 1; month <= months && balance > 0.01; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = Math.min(monthlyPayment - interestPayment + extraPayment, balance);
      const totalPayment = principalPayment + interestPayment;

      balance -= principalPayment;
      totalInterest += interestPayment;
      totalPaid += totalPayment;

      schedule.push({
        month,
        date: currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        payment: totalPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance),
        extraPayment
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    const originalMonthlyPayment = monthlyRate === 0 ? principal / months :
      principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const originalTotal = originalMonthlyPayment * months;
    const originalInterest = originalTotal - principal;
    const timeSaved = months - schedule.length;
    const interestSaved = originalInterest - totalInterest;

    renderLoanSummary(principal, monthlyPayment, originalMonthlyPayment, totalInterest, totalPaid, schedule.length, timeSaved, interestSaved, extraPayment);
    renderLoanTable(schedule);
  }

  function renderLoanSummary(principal, monthlyPayment, originalPayment, totalInterest, totalPaid, actualMonths, timeSaved, interestSaved, extraPayment) {
    elements.loanSummary.innerHTML = `
      <div class="summary-card">
        <div class="label">Monthly Payment</div>
        <div class="value">${formatCurrency(monthlyPayment)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Original Payment</div>
        <div class="value">${formatCurrency(originalPayment)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Total Interest</div>
        <div class="value negative">${formatCurrency(totalInterest)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Total Paid</div>
        <div class="value">${formatCurrency(totalPaid)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Loan Term</div>
        <div class="value">${actualMonths} months</div>
      </div>
      <div class="summary-card">
        <div class="label">Time Saved</div>
        <div class="value positive">${timeSaved} months</div>
      </div>
      <div class="summary-card">
        <div class="label">Interest Saved</div>
        <div class="value positive">${formatCurrency(interestSaved)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Extra Payment</div>
        <div class="value">${formatCurrency(extraPayment)}/mo</div>
      </div>
    `;
  }

  function renderLoanTable(schedule) {
    let html = '<table><thead><tr><th>Month</th><th>Date</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Extra</th><th>Balance</th></tr></thead><tbody>';
    schedule.forEach(row => {
      html += `<tr>
        <td>${row.month}</td>
        <td>${row.date}</td>
        <td>${formatCurrency(row.payment)}</td>
        <td>${formatCurrency(row.principal)}</td>
        <td class="negative">${formatCurrency(row.interest)}</td>
        <td>${formatCurrency(row.extraPayment)}</td>
        <td>${formatCurrency(row.balance)}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    elements.loanTable.innerHTML = html;
  }

  // ============ FIRE CALCULATOR ============
  function calculateFire() {
    const expenses = parseFloat(elements.fireExpenses.value) || 0;
    const swr = (parseFloat(elements.fireSwr.value) || 4) / 100;
    const savings = parseFloat(elements.fireSavings.value) || 0;
    const annualSave = parseFloat(elements.fireAnnualSave.value) || 0;
    const annualReturn = (parseFloat(elements.fireReturn.value) || 7) / 100;
    const inflation = (parseFloat(elements.fireInflation.value) || 3) / 100;
    const realReturn = (1 + annualReturn) / (1 + inflation) - 1;

    const fireNumber = expenses / swr;
    const progress = Math.min(100, (savings / fireNumber) * 100);

    // Years to FIRE
    let yearsToFire = 0;
    let balance = savings;
    const projections = [];

    if (realReturn > 0 && annualSave > 0) {
      // Using future value of annuity formula
      // FV = P * (1+r)^n + PMT * ((1+r)^n - 1) / r
      // Solve for n when FV = fireNumber
      const n = Math.log(1 + (fireNumber - savings) * realReturn / annualSave) / Math.log(1 + realReturn);
      yearsToFire = Math.max(0, n);
    } else if (annualSave > 0) {
      yearsToFire = (fireNumber - savings) / annualSave;
    } else {
      yearsToFire = Infinity;
    }

    // Yearly projections
    balance = savings;
    for (let year = 1; year <= Math.min(50, Math.ceil(yearsToFire) + 5); year++) {
      const startBalance = balance;
      balance = balance * (1 + realReturn) + annualSave;
      const passiveIncome = balance * swr;
      projections.push({
        year,
        balance,
        passiveIncome,
        expenses,
        coverage: (passiveIncome / expenses) * 100
      });
      if (passiveIncome >= expenses && year > yearsToFire) break;
    }

    const coastFI = savings * Math.pow(1 + realReturn, yearsToFire);
    const coastFIYears = Math.log(fireNumber / savings) / Math.log(1 + realReturn);

    renderFireSummary(fireNumber, savings, progress, yearsToFire, coastFI, coastFIYears, realReturn);
    renderFireProgress(progress);
    renderFireChart(projections);
    renderFireTable(projections);
  }

  function renderFireSummary(fireNum, savings, progress, years, coastFI, coastYears, realReturn) {
    elements.fireSummary.innerHTML = `
      <div class="summary-card">
        <div class="label">FIRE Number</div>
        <div class="value">${formatCurrency(fireNum)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Current Savings</div>
        <div class="value">${formatCurrency(savings)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Progress</div>
        <div class="value">${progress.toFixed(1)}%</div>
      </div>
      <div class="summary-card">
        <div class="label">Years to FIRE</div>
        <div class="value ${years === Infinity ? 'warning' : ''}">${years === Infinity ? 'Never' : years.toFixed(1)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Coast FI Number</div>
        <div class="value">${formatCurrency(coastFI)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Years to Coast FI</div>
        <div class="value">${coastYears.toFixed(1)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Real Return</div>
        <div class="value">${(realReturn * 100).toFixed(2)}%</div>
      </div>
      <div class="summary-card">
        <div class="label">Annual Passive Income</div>
        <div class="value positive">${formatCurrency(savings * (parseFloat(elements.fireSwr.value) || 4) / 100)}</div>
      </div>
    `;
  }

  function renderFireProgress(pct) {
    elements.fireProgressFill.style.width = `${pct}%`;
    elements.fireProgressFill.textContent = `${pct.toFixed(1)}%`;
    elements.fireProgressPct.textContent = `${pct.toFixed(1)}%`;
  }

  function renderFireChart(data) {
    const ctx = elements.fireChart.getContext('2d');
    const width = elements.fireChart.width = elements.fireChart.parentElement.clientWidth;
    const height = elements.fireChart.height = 200;
    const dpr = window.devicePixelRatio || 1;
    elements.fireChart.width = width * dpr;
    elements.fireChart.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) return;

    const fireNum = parseFloat(elements.fireExpenses.value) / ((parseFloat(elements.fireSwr.value) || 4) / 100);
    const maxVal = Math.max(fireNum, ...data.map(d => d.balance));
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Target line
    ctx.strokeStyle = 'var(--accent)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    const targetY = height - padding - (fireNum / maxVal) * chartHeight;
    ctx.beginPath();
    ctx.moveTo(padding, targetY);
    ctx.lineTo(width - padding, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'var(--accent)';
    ctx.font = '10px var(--font-ui)';
    ctx.fillText('FIRE Target', width - padding - 60, targetY - 5);

    // Balance line
    ctx.strokeStyle = 'var(--accent-3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = padding + (chartWidth / (data.length - 1 || 1)) * i;
      const y = height - padding - (d.balance / maxVal) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Area fill
    ctx.fillStyle = 'rgba(46, 230, 166, 0.1)';
    ctx.lineTo(padding + chartWidth, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fill();

    // Y-axis labels
    ctx.fillStyle = 'var(--muted)';
    ctx.font = '10px var(--font-mono)';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = maxVal * (1 - i / 4);
      const y = padding + (chartHeight / 4) * i + 3;
      ctx.fillText(formatCurrencyShort(val), padding - 5, y);
    }

    // X-axis labels
    ctx.textAlign = 'center';
    data.forEach((d, i) => {
      if (i % Math.ceil(data.length / 6) === 0 || i === data.length - 1) {
        const x = padding + (chartWidth / (data.length - 1 || 1)) * i;
        ctx.fillText(`Y${d.year}`, x, height - padding + 18);
      }
    });
  }

  function renderFireTable(data) {
    let html = '<table><thead><tr><th>Year</th><th>Portfolio Value</th><th>Passive Income</th><th>Expenses</th><th>Coverage</th></tr></thead><tbody>';
    data.forEach(d => {
      const coverageClass = d.coverage >= 100 ? 'positive' : '';
      html += `<tr>
        <td>${d.year}</td>
        <td>${formatCurrency(d.balance)}</td>
        <td>${formatCurrency(d.passiveIncome)}</td>
        <td>${formatCurrency(d.expenses)}</td>
        <td class="${coverageClass}">${d.coverage.toFixed(1)}%</td>
      </tr>`;
    });
    html += '</tbody></table>';
    elements.fireTable.innerHTML = html;
  }

  // ============ BUDGET ALLOCATOR ============
  function calculateBudget() {
    const income = parseFloat(elements.budgetIncome.value) || 0;
    const method = document.querySelector('input[name="budget-method"]:checked').value;

    let buckets = [];
    if (method === '50-30-20') {
      buckets = [
        { name: 'Needs (50%)', percent: 50, color: 'var(--accent-4)', icon: '🏠' },
        { name: 'Wants (30%)', percent: 30, color: 'var(--accent-2)', icon: '🎮' },
        { name: 'Savings (20%)', percent: 20, color: 'var(--accent-3)', icon: '💰' }
      ];
    } else {
      const text = elements.budgetBuckets.value.trim();
      const lines = text.split('\n').filter(l => l.trim());
      let totalPct = 0;
      buckets = lines.map((line, i) => {
        const [name, pct] = line.split(':').map(s => s.trim());
        const percent = parseFloat(pct) || 0;
        totalPct += percent;
        return { name, percent, color: getBucketColor(i), icon: '📦' };
      });
      // Normalize if not 100%
      if (totalPct !== 100 && totalPct > 0) {
        buckets = buckets.map(b => ({ ...b, percent: (b.percent / totalPct) * 100 }));
      }
    }

    const allocated = buckets.map(b => ({
      ...b,
      amount: income * b.percent / 100
    }));

    renderBudgetSummary(income, allocated);
    renderBudgetChart(allocated);
    renderBudgetTable(allocated);
  }

  function getBucketColor(i) {
    const colors = ['var(--accent)', 'var(--accent-2)', 'var(--accent-3)', 'var(--accent-4)', 'var(--accent-5)', 'var(--muted)'];
    return colors[i % colors.length];
  }

  function renderBudgetSummary(income, buckets) {
    const totalAllocated = buckets.reduce((sum, b) => sum + b.amount, 0);
    const remaining = income - totalAllocated;

    let html = `
      <div class="summary-card">
        <div class="label">Monthly Income</div>
        <div class="value">${formatCurrency(income)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Allocated</div>
        <div class="value">${formatCurrency(totalAllocated)}</div>
      </div>
      <div class="summary-card">
        <div class="label">${remaining >= 0 ? 'Remaining' : 'Over Budget'}</div>
        <div class="value ${remaining >= 0 ? 'positive' : 'negative'}">${formatCurrency(Math.abs(remaining))}</div>
      </div>
    `;
    buckets.forEach(b => {
      html += `
        <div class="summary-card" style="border-left: 4px solid ${b.color};">
          <div class="label">${b.icon} ${b.name}</div>
          <div class="value">${formatCurrency(b.amount)}</div>
        </div>
      `;
    });
    elements.budgetSummary.innerHTML = html;
  }

  function renderBudgetChart(buckets) {
    const ctx = elements.budgetChart.getContext('2d');
    const width = elements.budgetChart.width = elements.budgetChart.parentElement.clientWidth;
    const height = elements.budgetChart.height = 250;
    const dpr = window.devicePixelRatio || 1;
    elements.budgetChart.width = width * dpr;
    elements.budgetChart.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    // Donut chart
    let startAngle = -Math.PI / 2;
    buckets.forEach(b => {
      const sliceAngle = (b.percent / 100) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.lineWidth = 50;
      ctx.strokeStyle = b.color;
      ctx.stroke();
      startAngle += sliceAngle;
    });

    // Center text
    ctx.fillStyle = 'var(--fg)';
    ctx.font = 'bold 24px var(--font-ui)';
    ctx.textAlign = 'center';
    ctx.fillText(`${buckets.reduce((s, b) => s + b.percent, 0).toFixed(0)}%`, centerX, centerY + 8);

    ctx.font = '12px var(--font-mono)';
    ctx.fillStyle = 'var(--muted)';
    ctx.fillText('Allocated', centerX, centerY + 28);

    // Legend
    let legendY = height - buckets.length * 22;
    buckets.forEach((b, i) => {
      const y = legendY + i * 22;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(20, y + 8, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'var(--fg)';
      ctx.font = '11px var(--font-ui)';
      ctx.textAlign = 'left';
      ctx.fillText(`${b.icon} ${b.name}: ${b.percent.toFixed(1)}%`, 35, y + 13);
    });
  }

  function renderBudgetTable(buckets) {
    let html = '<table><thead><tr><th>Category</th><th>%</th><th>Amount</th></tr></thead><tbody>';
    buckets.forEach(b => {
      html += `<tr>
        <td>${b.icon} ${b.name}</td>
        <td>${b.percent.toFixed(1)}%</td>
        <td>${formatCurrency(b.amount)}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    elements.budgetTable.innerHTML = html;
  }

  // ============ CURRENCY CONVERTER ============
  function convertCurrency() {
    const amount = parseFloat(elements.curAmount.value) || 0;
    const from = elements.curFrom.value;
    const to = elements.curTo.value;
    const source = document.querySelector('input[name="cur-source"]:checked').value;

    let rate;
    if (source === 'api') {
      // In a real app, fetch from API. For now, use embedded.
      rate = EMBEDDED_RATES[to] / EMBEDDED_RATES[from];
      showToast('Using embedded rates (API not implemented in demo)');
    } else {
      rate = EMBEDDED_RATES[to] / EMBEDDED_RATES[from];
    }

    const result = amount * rate;

    // Add to history
    currencyHistory.unshift({
      date: new Date().toISOString(),
      from, to, amount, rate, result
    });
    if (currencyHistory.length > 20) currencyHistory.pop();

    renderCurrencyResult(amount, from, to, rate, result);
    renderCurrencyHistory();
  }

  function swapCurrencies() {
    const from = elements.curFrom.value;
    elements.curFrom.value = elements.curTo.value;
    elements.curTo.value = from;
    convertCurrency();
  }

  function renderCurrencyResult(amount, from, to, rate, result) {
    const fromCur = CURRENCIES.find(c => c.code === from);
    const toCur = CURRENCIES.find(c => c.code === to);

    elements.curSummary.innerHTML = `
      <div class="currency-result">
        <div style="font-size: 0.9rem; color: var(--muted); margin-bottom: 0.5rem;">
          ${fromCur.symbol}${formatNumber(amount)} ${from} =
        </div>
        <div class="amount">${toCur.symbol}${formatNumber(result)} ${to}</div>
        <div class="rate">Rate: 1 ${from} = ${rate.toFixed(6)} ${to}</div>
      </div>
    `;
  }

  function renderCurrencyHistory() {
    if (currencyHistory.length === 0) {
      elements.curHistory.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 1rem;">No conversions yet</p>';
      return;
    }

    let html = '<table><thead><tr><th>Time</th><th>From</th><th>To</th><th>Amount</th><th>Rate</th><th>Result</th></tr></thead><tbody>';
    currencyHistory.slice(0, 10).forEach(h => {
      const time = new Date(h.date).toLocaleTimeString();
      const fromCur = CURRENCIES.find(c => c.code === h.from);
      const toCur = CURRENCIES.find(c => c.code === h.to);
      html += `<tr>
        <td>${time}</td>
        <td>${fromCur.symbol} ${h.from}</td>
        <td>${toCur.symbol} ${h.to}</td>
        <td>${fromCur.symbol}${formatNumber(h.amount)}</td>
        <td>1 = ${h.rate.toFixed(4)} ${h.to}</td>
        <td>${toCur.symbol}${formatNumber(h.result)}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    elements.curHistory.innerHTML = html;
  }

  // ============ NET WORTH TRACKER ============
  function renderNetWorthTracks() {
    // Assets
    elements.nwAssets.innerHTML = '';
    netWorthAssets.forEach((asset, i) => {
      const div = document.createElement('div');
      div.className = 'track-item';
      const typeOpt = ASSET_TYPES.find(t => t.value === asset.type) || ASSET_TYPES[0];
      div.innerHTML = `
        <input type="text" value="${escapeHtml(asset.name)}" placeholder="Name" data-index="${i}" data-field="name" data-type="asset" style="flex: 1;">
        <input type="number" value="${asset.value}" min="0" step="100" placeholder="Value" data-index="${i}" data-field="value" data-type="asset" style="width: 100px;">
        <select data-index="${i}" data-field="type" data-type="asset" style="min-width: 130px;">
          ${ASSET_TYPES.map(t => `<option value="${t.value}" ${asset.type === t.value ? 'selected' : ''}>${t.icon} ${t.label}</option>`).join('')}
        </select>
        <button class="btn-sm" data-index="${i}" data-type="remove-asset">×</button>
      `;
      elements.nwAssets.appendChild(div);
    });

    // Liabilities
    elements.nwLiabilities.innerHTML = '';
    netWorthLiabilities.forEach((liab, i) => {
      const div = document.createElement('div');
      div.className = 'track-item';
      const typeOpt = LIABILITY_TYPES.find(t => t.value === liab.type) || LIABILITY_TYPES[0];
      div.innerHTML = `
        <input type="text" value="${escapeHtml(liab.name)}" placeholder="Name" data-index="${i}" data-field="name" data-type="liability" style="flex: 1;">
        <input type="number" value="${liab.value}" min="0" step="100" placeholder="Value" data-index="${i}" data-field="value" data-type="liability" style="width: 100px;">
        <select data-index="${i}" data-field="type" data-type="liability" style="min-width: 130px;">
          ${LIABILITY_TYPES.map(t => `<option value="${t.value}" ${liab.type === t.value ? 'selected' : ''}>${t.icon} ${t.label}</option>`).join('')}
        </select>
        <button class="btn-sm" data-index="${i}" data-type="remove-liability">×</button>
      `;
      elements.nwLiabilities.appendChild(div);
    });

    // Bind events
    document.querySelectorAll('#nw-assets input, #nw-assets select').forEach(el => {
      el.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const field = e.target.dataset.field;
        const type = e.target.dataset.type;
        if (type === 'asset') netWorthAssets[idx][field] = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
        updateAllResults();
      });
    });

    document.querySelectorAll('#nw-liabilities input, #nw-liabilities select').forEach(el => {
      el.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const field = e.target.dataset.field;
        const type = e.target.dataset.type;
        if (type === 'liability') netWorthLiabilities[idx][field] = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
        updateAllResults();
      });
    });

    document.querySelectorAll('[data-type="remove-asset"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        if (netWorthAssets.length > 1) {
          netWorthAssets.splice(idx, 1);
          renderNetWorthTracks();
          updateAllResults();
        }
      });
    });

    document.querySelectorAll('[data-type="remove-liability"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        if (netWorthLiabilities.length > 1) {
          netWorthLiabilities.splice(idx, 1);
          renderNetWorthTracks();
          updateAllResults();
        }
      });
    });
  }

  function addNetWorthItem(type) {
    if (type === 'asset') {
      netWorthAssets.push({ name: 'New Asset', value: 0, type: 'liquid' });
    } else {
      netWorthLiabilities.push({ name: 'New Liability', value: 0, type: 'credit_card' });
    }
    renderNetWorthTracks();
    updateAllResults();
  }

  function calculateNetWorth() {
    const totalAssets = netWorthAssets.reduce((sum, a) => sum + a.value, 0);
    const totalLiabilities = netWorthLiabilities.reduce((sum, l) => sum + l.value, 0);
    const netWorth = totalAssets - totalLiabilities;

    // Save to history
    netWorthHistory.unshift({
      date: new Date().toISOString().split('T')[0],
      assets: totalAssets,
      liabilities: totalLiabilities,
      netWorth
    });
    if (netWorthHistory.length > 24) netWorthHistory.pop();

    renderNetWorthSummary(totalAssets, totalLiabilities, netWorth);
    renderNetWorthChart();
    renderNetWorthTable();
  }

  function renderNetWorthSummary(assets, liabilities, netWorth) {
    elements.nwSummary.innerHTML = `
      <div class="summary-card">
        <div class="label">Total Assets</div>
        <div class="value positive">${formatCurrency(assets)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Total Liabilities</div>
        <div class="value negative">${formatCurrency(liabilities)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Net Worth</div>
        <div class="value ${netWorth >= 0 ? 'positive' : 'negative'}">${formatCurrency(netWorth)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Debt-to-Asset</div>
        <div class="value">${assets > 0 ? ((liabilities / assets) * 100).toFixed(1) : 0}%</div>
      </div>
    `;
  }

  function renderNetWorthChart() {
    const ctx = elements.nwChart.getContext('2d');
    const width = elements.nwChart.width = elements.nwChart.parentElement.clientWidth;
    const height = elements.nwChart.height = 200;
    const dpr = window.devicePixelRatio || 1;
    elements.nwChart.width = width * dpr;
    elements.nwChart.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const history = [...netWorthHistory].reverse();
    if (history.length === 0) return;

    const maxVal = Math.max(...history.map(h => Math.max(h.assets, Math.abs(h.netWorth))));
    const minVal = Math.min(0, ...history.map(h => h.netWorth));
    const range = maxVal - minVal || 1;

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Zero line
    const zeroY = height - padding - ((0 - minVal) / range) * chartHeight;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, zeroY);
    ctx.lineTo(width - padding, zeroY);
    ctx.stroke();

    // Assets area
    ctx.fillStyle = 'rgba(46, 230, 166, 0.15)';
    ctx.beginPath();
    ctx.moveTo(padding, zeroY);
    history.forEach((h, i) => {
      const x = padding + (chartWidth / (history.length - 1 || 1)) * i;
      const y = height - padding - ((h.assets - minVal) / range) * chartHeight;
      if (i === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(padding + chartWidth, zeroY);
    ctx.closePath();
    ctx.fill();

    // Net worth line
    ctx.strokeStyle = 'var(--accent-4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    history.forEach((h, i) => {
      const x = padding + (chartWidth / (history.length - 1 || 1)) * i;
      const y = height - padding - ((h.netWorth - minVal) / range) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Liabilities area
    ctx.fillStyle = 'rgba(255, 79, 163, 0.1)';
    ctx.beginPath();
    ctx.moveTo(padding, zeroY);
    history.forEach((h, i) => {
      const x = padding + (chartWidth / (history.length - 1 || 1)) * i;
      const y = height - padding - ((-h.liabilities - minVal) / range) * chartHeight;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(padding + chartWidth, zeroY);
    ctx.closePath();
    ctx.fill();

    // Y-axis labels
    ctx.fillStyle = 'var(--muted)';
    ctx.font = '10px var(--font-mono)';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = maxVal - (range / 4) * i;
      const y = padding + (chartHeight / 4) * i + 3;
      ctx.fillText(formatCurrencyShort(val), padding - 5, y);
    }

    // X-axis labels
    ctx.textAlign = 'center';
    history.forEach((h, i) => {
      if (i % Math.ceil(history.length / 6) === 0 || i === history.length - 1) {
        const x = padding + (chartWidth / (history.length - 1 || 1)) * i;
        ctx.fillText(h.date.split('-').slice(1).join('-'), x, height - padding + 18);
      }
    });
  }

  function renderNetWorthTable() {
    // Asset breakdown by type
    const assetByType = {};
    netWorthAssets.forEach(a => {
      assetByType[a.type] = (assetByType[a.type] || 0) + a.value;
    });

    const liabByType = {};
    netWorthLiabilities.forEach(l => {
      liabByType[l.type] = (liabByType[l.type] || 0) + l.value;
    });

    let html = '<table><thead><tr><th>Category</th><th>Type</th><th>Amount</th></tr></thead><tbody>';

    Object.entries(assetByType).forEach(([type, value]) => {
      const typeInfo = ASSET_TYPES.find(t => t.value === type) || { icon: '📦', label: type };
      html += `<tr>
        <td>${typeInfo.icon} Assets</td>
        <td>${typeInfo.label}</td>
        <td class="positive">${formatCurrency(value)}</td>
      </tr>`;
    });

    html += '<tr style="border-top: 2px solid var(--border);"><td colspan="3"></td></tr>';

    Object.entries(liabByType).forEach(([type, value]) => {
      const typeInfo = LIABILITY_TYPES.find(t => t.value === type) || { icon: '⚠️', label: type };
      html += `<tr>
        <td>${typeInfo.icon} Liabilities</td>
        <td>${typeInfo.label}</td>
        <td class="negative">${formatCurrency(value)}</td>
      </tr>`;
    });

    html += '</tbody></table>';
    elements.nwTable.innerHTML = html;
  }

  // ============ UTILITIES ============
  function formatCurrency(val) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
  }

  function formatCurrencyShort(val) {
    if (val >= 1e9) return '$' + (val / 1e9).toFixed(1) + 'B';
    if (val >= 1e6) return '$' + (val / 1e6).toFixed(1) + 'M';
    if (val >= 1e3) return '$' + (val / 1e3).toFixed(1) + 'K';
    return '$' + val.toFixed(0);
  }

  function formatNumber(val) {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  }

  function escapeHtml(text) {
    return text.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
  }

  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function resetTool(tool) {
    switch (tool) {
      case 'compound':
        elements.ciPrincipal.value = 10000;
        elements.ciRate.value = 7;
        elements.ciFrequency.value = 4;
        elements.ciYears.value = 20;
        elements.ciContribution.value = 200;
        elements.ciContribFreq.value = 12;
        break;
      case 'loan':
        elements.loanAmount.value = 250000;
        elements.loanRate.value = 6.5;
        elements.loanTerm.value = 30;
        elements.loanTermUnit.value = 'years';
        elements.loanExtra.value = 0;
        elements.loanStart.value = new Date().toISOString().split('T')[0];
        break;
      case 'fire':
        elements.fireExpenses.value = 40000;
        elements.fireSwr.value = 4;
        elements.fireSavings.value = 50000;
        elements.fireAnnualSave.value = 20000;
        elements.fireReturn.value = 7;
        elements.fireInflation.value = 3;
        break;
      case 'budget':
        elements.budgetIncome.value = 5000;
        document.querySelector('input[name="budget-method"][value="50-30-20"]').checked = true;
        elements.budgetCustomBuckets.hidden = true;
        elements.budgetBuckets.value = 'Rent: 30\nFood: 15\nTransport: 10\nEntertainment: 10\nSavings: 20\nInvesting: 15';
        break;
      case 'currency':
        elements.curAmount.value = 100;
        elements.curFrom.value = 'USD';
        elements.curTo.value = 'EUR';
        document.querySelector('input[name="cur-source"][value="embedded"]').checked = true;
        elements.curDateField.hidden = true;
        currencyHistory = [];
        break;
      case 'networth':
        netWorthAssets = [{ name: 'Cash', value: 10000, type: 'liquid' }];
        netWorthLiabilities = [{ name: 'Credit Card', value: 2000, type: 'revolving' }];
        netWorthHistory = [];
        renderNetWorthTracks();
        break;
    }
    updateAllResults();
    showToast('Reset to defaults');
  }

  function exportAllData() {
    const data = {
      compound: getCompoundInputs(),
      loan: getLoanInputs(),
      fire: getFireInputs(),
      budget: getBudgetInputs(),
      currency: { history: currencyHistory },
      networth: { assets: netWorthAssets, liabilities: netWorthLiabilities, history: netWorthHistory },
      exportDate: new Date().toISOString()
    };
    downloadJSON(data, 'finance-tools-export.json');
    showToast('All data exported!');
  }

  function getCompoundInputs() {
    return {
      principal: elements.ciPrincipal.value,
      rate: elements.ciRate.value,
      frequency: elements.ciFrequency.value,
      years: elements.ciYears.value,
      contribution: elements.ciContribution.value,
      contribFrequency: elements.ciContribFreq.value
    };
  }

  function getLoanInputs() {
    return {
      amount: elements.loanAmount.value,
      rate: elements.loanRate.value,
      term: elements.loanTerm.value,
      termUnit: elements.loanTermUnit.value,
      extra: elements.loanExtra.value,
      start: elements.loanStart.value
    };
  }

  function getFireInputs() {
    return {
      expenses: elements.fireExpenses.value,
      swr: elements.fireSwr.value,
      savings: elements.fireSavings.value,
      annualSave: elements.fireAnnualSave.value,
      return: elements.fireReturn.value,
      inflation: elements.fireInflation.value
    };
  }

  function getBudgetInputs() {
    return {
      income: elements.budgetIncome.value,
      method: document.querySelector('input[name="budget-method"]:checked').value,
      buckets: elements.budgetBuckets.value
    };
  }

  function exportNetWorthData() {
    const data = {
      assets: netWorthAssets,
      liabilities: netWorthLiabilities,
      history: netWorthHistory,
      exportDate: new Date().toISOString()
    };
    downloadJSON(data, 'networth-export.json');
    showToast('Net worth data exported!');
  }

  function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.compound) loadCompoundInputs(data.compound);
        if (data.loan) loadLoanInputs(data.loan);
        if (data.fire) loadFireInputs(data.fire);
        if (data.budget) loadBudgetInputs(data.budget);
        if (data.currency?.history) currencyHistory = data.currency.history;
        if (data.networth) {
          if (data.networth.assets) netWorthAssets = data.networth.assets;
          if (data.networth.liabilities) netWorthLiabilities = data.networth.liabilities;
          if (data.networth.history) netWorthHistory = data.networth.history;
          renderNetWorthTracks();
        }
        updateAllResults();
        showToast('Data imported successfully!');
      } catch (err) {
        showToast('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  }

  function loadCompoundInputs(d) {
    elements.ciPrincipal.value = d.principal || 10000;
    elements.ciRate.value = d.rate || 7;
    elements.ciFrequency.value = d.frequency || 4;
    elements.ciYears.value = d.years || 20;
    elements.ciContribution.value = d.contribution || 200;
    elements.ciContribFreq.value = d.contribFrequency || 12;
  }

  function loadLoanInputs(d) {
    elements.loanAmount.value = d.amount || 250000;
    elements.loanRate.value = d.rate || 6.5;
    elements.loanTerm.value = d.term || 30;
    elements.loanTermUnit.value = d.termUnit || 'years';
    elements.loanExtra.value = d.extra || 0;
    elements.loanStart.value = d.start || new Date().toISOString().split('T')[0];
  }

  function loadFireInputs(d) {
    elements.fireExpenses.value = d.expenses || 40000;
    elements.fireSwr.value = d.swr || 4;
    elements.fireSavings.value = d.savings || 50000;
    elements.fireAnnualSave.value = d.annualSave || 20000;
    elements.fireReturn.value = d.return || 7;
    elements.fireInflation.value = d.inflation || 3;
  }

  function loadBudgetInputs(d) {
    elements.budgetIncome.value = d.income || 5000;
    const radio = document.querySelector(`input[name="budget-method"][value="${d.method || '50-30-20'}"]`);
    if (radio) radio.checked = true;
    elements.budgetCustomBuckets.hidden = d.method !== 'custom';
    elements.budgetBuckets.value = d.buckets || 'Rent: 30\nFood: 15\nTransport: 10\nEntertainment: 10\nSavings: 20\nInvesting: 15';
  }

  function copyCurrentResults() {
    let text = '';
    switch (activeTool) {
      case 'compound':
        text = elements.ciSummary.innerText;
        break;
      case 'loan':
        text = elements.loanSummary.innerText;
        break;
      case 'fire':
        text = elements.fireSummary.innerText;
        break;
      case 'budget':
        text = elements.budgetSummary.innerText;
        break;
      case 'currency':
        text = elements.curSummary.innerText;
        break;
      case 'networth':
        text = elements.nwSummary.innerText;
        break;
    }
    navigator.clipboard.writeText(text).then(() => showToast('Results copied!'));
  }

  function loadSavedData() {
    try {
      const saved = localStorage.getItem('finance-tools-data');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.compound) loadCompoundInputs(data.compound);
        if (data.loan) loadLoanInputs(data.loan);
        if (data.fire) loadFireInputs(data.fire);
        if (data.budget) loadBudgetInputs(data.budget);
        if (data.currency?.history) currencyHistory = data.currency.history;
        if (data.networth) {
          if (data.networth.assets) netWorthAssets = data.networth.assets;
          if (data.networth.liabilities) netWorthLiabilities = data.networth.liabilities;
          if (data.networth.history) netWorthHistory = data.networth.history;
        }
      }
    } catch (e) {
      console.warn('Failed to load saved data');
    }
  }

  function saveData() {
    const data = {
      compound: getCompoundInputs(),
      loan: getLoanInputs(),
      fire: getFireInputs(),
      budget: getBudgetInputs(),
      currency: { history: currencyHistory },
      networth: { assets: netWorthAssets, liabilities: netWorthLiabilities, history: netWorthHistory }
    };
    localStorage.setItem('finance-tools-data', JSON.stringify(data));
  }

  // Auto-save on input
  setInterval(saveData, 5000);
  window.addEventListener('beforeunload', saveData);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();