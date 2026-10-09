/**
 * People Express Web Simulator UI & Application Controller
 */

let engine = new PeopleExpressEngine();
let charts = {};

// 初始化
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    initCharts();
    bindInputs();
    updateUI();
});

// 1. 初始化 4 個 Chart.js 圖表
function initCharts() {
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#94a3b8', font: { size: 10, family: 'Inter' } }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: { size: 11, family: 'JetBrains Mono' },
                bodyFont: { size: 10, family: 'JetBrains Mono' }
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(51, 65, 85, 0.2)' },
                ticks: { color: '#64748b', font: { size: 9, family: 'JetBrains Mono' } }
            },
            y: {
                grid: { color: 'rgba(51, 65, 85, 0.2)' },
                ticks: { color: '#64748b', font: { size: 9, family: 'JetBrains Mono' } }
            }
        }
    };

    // (A) 機隊 vs 員工 (雙Y軸)
    const ctxScale = document.getElementById('chartScale').getContext('2d');
    charts.scale = new Chart(ctxScale, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '飛機架數 (架)',
                    data: [],
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    yAxisID: 'y',
                    borderWidth: 2,
                    tension: 0.2
                },
                {
                    label: '員工總數 (人)',
                    data: [],
                    borderColor: '#a855f7',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    yAxisID: 'y1',
                    borderWidth: 2,
                    borderDash: [4, 4],
                    tension: 0.2
                }
            ]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y1: {
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#a855f7', font: { size: 9, family: 'JetBrains Mono' } }
                }
            }
        }
    });

    // (B) 載客率 vs 損益平衡線
    const ctxLF = document.getElementById('chartLoadFactor').getContext('2d');
    charts.loadFactor = new Chart(ctxLF, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '實際載客率 (%)',
                    data: [],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2.5,
                    tension: 0.2
                },
                {
                    label: '損益平衡線 (%)',
                    data: [],
                    borderColor: '#ef4444',
                    borderDash: [5, 5],
                    borderWidth: 1.5,
                    tension: 0.1
                }
            ]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    min: 20,
                    max: 100
                }
            }
        }
    });

    // (C) 財務收支 (營收、成本、淨利)
    const ctxFin = document.getElementById('chartFinancials').getContext('2d');
    charts.financials = new Chart(ctxFin, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '營業收入 ($M)',
                    data: [],
                    borderColor: '#10b981',
                    borderWidth: 2,
                    tension: 0.2
                },
                {
                    label: '總營運成本 ($M)',
                    data: [],
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    tension: 0.2
                },
                {
                    label: '當季淨利 ($M)',
                    data: [],
                    borderColor: '#6366f1',
                    borderWidth: 2,
                    tension: 0.2
                }
            ]
        },
        options: commonOptions
    });

    // (D) 軟性無形資產 (士氣、聲譽、工時)
    const ctxInt = document.getElementById('chartIntangibles').getContext('2d');
    charts.intangibles = new Chart(ctxInt, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '服務聲譽 (口碑)',
                    data: [],
                    borderColor: '#06b6d4',
                    borderWidth: 2,
                    tension: 0.2
                },
                {
                    label: '員工士氣',
                    data: [],
                    borderColor: '#ec4899',
                    borderWidth: 2,
                    tension: 0.2
                },
                {
                    label: '週工時(小時/40)',
                    data: [],
                    borderColor: '#eab308',
                    borderDash: [3, 3],
                    borderWidth: 1.5,
                    tension: 0.2
                }
            ]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    min: 0,
                    max: 1.8
                }
            }
        }
    });
}

// 2. 綁定滑桿數值變更監聽
function bindInputs() {
    const inputs = [
        { id: 'inputFare', valId: 'valFare', format: (v) => `$${Number(v).toFixed(3)}` },
        { id: 'inputPlanes', valId: 'valPlanes', format: (v) => `${Number(v) >= 0 ? '+' : ''}${v} 架` },
        { id: 'inputHiring', valId: 'valHiring', format: (v) => `${Number(v) >= 0 ? '+' : ''}${v} 人` },
        { id: 'inputMarketing', valId: 'valMarketing', format: (v) => `${(Number(v) * 100).toFixed(1)}%` },
        { id: 'inputScope', valId: 'valScope', format: (v) => Number(v).toFixed(2) }
    ];

    inputs.forEach(({ id, valId, format }) => {
        const el = document.getElementById(id);
        const valEl = document.getElementById(valId);
        el.addEventListener('input', () => {
            valEl.textContent = format(el.value);
        });
    });
}

// 微調按鈕
function adjustValue(type, delta) {
    if (engine.isGameOver) return;
    const map = {
        fare: { id: 'inputFare', valId: 'valFare', format: (v) => `$${Number(v).toFixed(3)}`, min: 0.04, max: 0.25 },
        planes: { id: 'inputPlanes', valId: 'valPlanes', format: (v) => `${Number(v) >= 0 ? '+' : ''}${v} 架`, min: -5, max: 15 },
        hiring: { id: 'inputHiring', valId: 'valHiring', format: (v) => `${Number(v) >= 0 ? '+' : ''}${v} 人`, min: -100, max: 300 },
        marketing: { id: 'inputMarketing', valId: 'valMarketing', format: (v) => `${(Number(v) * 100).toFixed(1)}%`, min: 0.0, max: 0.25 },
        scope: { id: 'inputScope', valId: 'valScope', format: (v) => Number(v).toFixed(2), min: 0.0, max: 1.0 }
    };

    const target = map[type];
    const el = document.getElementById(target.id);
    let newVal = parseFloat(el.value) + delta;
    newVal = Math.max(target.min, Math.min(target.max, newVal));
    el.value = newVal;
    document.getElementById(target.valId).textContent = target.format(newVal);
}

// 策略範本 (Presets)
function applyPreset(name) {
    if (engine.isGameOver) return;
    if (name === 'burr') {
        // Donald Burr 激進模式: 降價搶市、大肆訂購飛機、員工招聘跟不上
        document.getElementById('inputFare').value = 0.080;
        document.getElementById('inputPlanes').value = 4;
        document.getElementById('inputHiring').value = 30; // 招聘不足
        document.getElementById('inputMarketing').value = 0.10;
        document.getElementById('inputScope').value = 0.30;
    } else if (name === 'balanced') {
        // 穩健成長模式: 兼顧員工與服務聲譽 (每架飛機需維持約 28~32 名員工)
        document.getElementById('inputFare').value = 0.100;
        document.getElementById('inputPlanes').value = 1;
        document.getElementById('inputHiring').value = 35;
        document.getElementById('inputMarketing').value = 0.06;
        document.getElementById('inputScope').value = 0.30;
    }

    // 觸發文字更新
    ['inputFare', 'inputPlanes', 'inputHiring', 'inputMarketing', 'inputScope'].forEach(id => {
        document.getElementById(id).dispatchEvent(new Event('input'));
    });
}

// 3. 推進模擬
function runNextQuarter() {
    if (engine.isGameOver) return;

    const decisions = {
        peoplesFare: parseFloat(document.getElementById('inputFare').value),
        aircraftPurchases: parseInt(document.getElementById('inputPlanes').value),
        hiring: parseInt(document.getElementById('inputHiring').value),
        marketingFraction: parseFloat(document.getElementById('inputMarketing').value),
        targetServiceScope: parseFloat(document.getElementById('inputScope').value)
    };

    engine.step(decisions);
    updateUI();
}

function runMultipleQuarters(count) {
    for (let i = 0; i < count; i++) {
        if (engine.isGameOver) break;
        runNextQuarter();
    }
}

// 4. 更新介面各項指標與圖表
function updateUI() {
    const cur = engine.history[engine.history.length - 1];

    // Header KPIs
    document.getElementById('kpiQuarter').textContent = cur.label;
    document.getElementById('kpiQuarterNum').textContent = cur.quarter;
    document.getElementById('kpiCash').textContent = `$${cur.cash.toFixed(1)}M`;
    document.getElementById('kpiCash').className = cur.cash < 0 ? 'font-bold text-red-400 text-sm' : 'font-bold text-emerald-400 text-sm';
    document.getElementById('kpiCumulativeProfit').textContent = `$${cur.cumulativeNetIncome.toFixed(1)}M`;

    // Cards
    document.getElementById('cardPlanes').innerHTML = `${cur.planes} <span class="text-xs text-slate-500 font-normal">架</span>`;
    document.getElementById('cardASM').textContent = `${cur.asm} M ASM`;
    document.getElementById('cardLoadFactor').textContent = `${cur.loadFactor}%`;
    document.getElementById('cardBreakeven').textContent = `${cur.breakevenLoadFactor}%`;
    document.getElementById('cardRevenue').textContent = `$${cur.revenue.toFixed(1)}M`;
    document.getElementById('cardExpenses').textContent = `$${cur.totalExpenses.toFixed(1)}M`;
    document.getElementById('cardNetIncome').textContent = `${cur.netIncome >= 0 ? '+' : ''}$${cur.netIncome.toFixed(2)}M`;
    document.getElementById('cardNetIncome').className = cur.netIncome >= 0 ? 'font-mono font-bold text-xl text-emerald-400 mt-1.5' : 'font-mono font-bold text-xl text-red-400 mt-1.5';
    document.getElementById('cardStock').textContent = `$${cur.stockPrice.toFixed(1)}`;
    document.getElementById('compFareLabel').textContent = `$${engine.competitorFare.toFixed(3)}`;

    // Diagnostics
    document.getElementById('diagWorkHours').textContent = cur.workHours.toFixed(1);
    const workHoursStatus = document.getElementById('diagWorkHoursStatus');
    if (cur.workHours <= 44) {
        workHoursStatus.textContent = '負荷正常 (良好)';
        workHoursStatus.className = 'text-[10px] text-emerald-400 mt-0.5';
    } else if (cur.workHours <= 50) {
        workHoursStatus.textContent = '偏高 (需注意加班)';
        workHoursStatus.className = 'text-[10px] text-amber-400 mt-0.5';
    } else {
        workHoursStatus.textContent = '嚴重過載 (員工面臨過勞!)';
        workHoursStatus.className = 'text-[10px] text-red-400 font-bold mt-0.5';
    }

    document.getElementById('diagMorale').textContent = cur.morale.toFixed(2);
    const moraleStatus = document.getElementById('diagMoraleStatus');
    if (cur.morale >= 0.85) {
        moraleStatus.textContent = '高昂積極';
        moraleStatus.className = 'text-[10px] text-emerald-400 mt-0.5';
    } else if (cur.morale >= 0.55) {
        moraleStatus.textContent = '有所下滑';
        moraleStatus.className = 'text-[10px] text-amber-400 mt-0.5';
    } else {
        moraleStatus.textContent = '瀕臨崩潰 (離職率暴增!)';
        moraleStatus.className = 'text-[10px] text-red-400 font-bold mt-0.5';
    }

    document.getElementById('diagQuality').textContent = cur.serviceQuality.toFixed(2);
    document.getElementById('diagReputation').textContent = cur.serviceReputation.toFixed(2);
    const repStatus = document.getElementById('diagReputationStatus');
    if (cur.serviceReputation >= 0.85) {
        repStatus.textContent = '口碑極佳';
        repStatus.className = 'text-[10px] text-emerald-400 mt-0.5';
    } else if (cur.serviceReputation >= 0.55) {
        repStatus.textContent = '投訴增加';
        repStatus.className = 'text-[10px] text-amber-400 mt-0.5';
    } else {
        repStatus.textContent = '口碑毀滅 (客源流失!)';
        repStatus.className = 'text-[10px] text-red-400 font-bold mt-0.5';
    }

    // Check Game Over
    const alertBanner = document.getElementById('gameAlertBanner');
    const btnRun = document.getElementById('btnRunQuarter');
    if (engine.isGameOver) {
        alertBanner.classList.remove('hidden');
        btnRun.disabled = true;
        btnRun.classList.add('opacity-50', 'cursor-not-allowed');

        if (engine.cash < -20.0) {
            alertBanner.className = 'p-4 rounded-2xl border border-red-500/50 bg-red-950/60 text-red-200 transition-all shadow-xl';
            document.getElementById('alertIcon').innerHTML = '<i data-lucide="alert-octagon" class="w-5 h-5 text-red-400"></i>';
            document.getElementById('alertTitle').textContent = '經營危機：宣告破產！';
        } else {
            alertBanner.className = 'p-4 rounded-2xl border border-emerald-500/50 bg-emerald-950/60 text-emerald-200 transition-all shadow-xl';
            document.getElementById('alertIcon').innerHTML = '<i data-lucide="trophy" class="w-5 h-5 text-emerald-400"></i>';
            document.getElementById('alertTitle').textContent = '經營週期結束：完成 10 年挑戰！';
        }
        document.getElementById('alertMessage').textContent = engine.gameOverReason;
        lucide.createIcons();
    } else {
        alertBanner.classList.add('hidden');
        btnRun.disabled = false;
        btnRun.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    // 更新圖表資料
    updateChartData();

    // 更新報表 Table
    updateTableData();
}

function updateChartData() {
    const labels = engine.history.map(h => h.label);

    // Scale chart
    charts.scale.data.labels = labels;
    charts.scale.data.datasets[0].data = engine.history.map(h => h.planes);
    charts.scale.data.datasets[1].data = engine.history.map(h => h.totalStaff);
    charts.scale.update('none');

    // Load factor chart
    charts.loadFactor.data.labels = labels;
    charts.loadFactor.data.datasets[0].data = engine.history.map(h => h.loadFactor);
    charts.loadFactor.data.datasets[1].data = engine.history.map(h => h.breakevenLoadFactor);
    charts.loadFactor.update('none');

    // Financials chart
    charts.financials.data.labels = labels;
    charts.financials.data.datasets[0].data = engine.history.map(h => h.revenue);
    charts.financials.data.datasets[1].data = engine.history.map(h => h.totalExpenses);
    charts.financials.data.datasets[2].data = engine.history.map(h => h.netIncome);
    charts.financials.update('none');

    // Intangibles chart
    charts.intangibles.data.labels = labels;
    charts.intangibles.data.datasets[0].data = engine.history.map(h => h.serviceReputation);
    charts.intangibles.data.datasets[1].data = engine.history.map(h => h.morale);
    charts.intangibles.data.datasets[2].data = engine.history.map(h => Math.round((h.workHours / 40) * 100) / 100);
    charts.intangibles.update('none');
}

function updateTableData() {
    const tbody = document.getElementById('dataTableBody');
    tbody.innerHTML = '';
    
    // 逆序排列 (最新季度在最上)
    [...engine.history].reverse().forEach(h => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-800/40 transition';
        const netClass = h.netIncome >= 0 ? 'text-emerald-400' : 'text-red-400';
        tr.innerHTML = `
            <td class="p-2 font-bold text-slate-200 border-b border-slate-800/60">${h.label}</td>
            <td class="p-2 text-right border-b border-slate-800/60">${h.planes}</td>
            <td class="p-2 text-right border-b border-slate-800/60">${h.totalStaff}</td>
            <td class="p-2 text-right border-b border-slate-800/60">${h.workHours}h</td>
            <td class="p-2 text-right border-b border-slate-800/60">${h.morale}</td>
            <td class="p-2 text-right border-b border-slate-800/60">${h.serviceReputation}</td>
            <td class="p-2 text-right border-b border-slate-800/60">${h.loadFactor}%</td>
            <td class="p-2 text-right border-b border-slate-800/60 text-slate-500">${h.breakevenLoadFactor}%</td>
            <td class="p-2 text-right border-b border-slate-800/60">$${h.peoplesFare.toFixed(3)}</td>
            <td class="p-2 text-right border-b border-slate-800/60">$${h.revenue.toFixed(1)}M</td>
            <td class="p-2 text-right border-b border-slate-800/60 text-slate-500">$${h.totalExpenses.toFixed(1)}M</td>
            <td class="p-2 text-right border-b border-slate-800/60 font-bold ${netClass}">${h.netIncome >= 0 ? '+' : ''}$${h.netIncome.toFixed(2)}M</td>
            <td class="p-2 text-right border-b border-slate-800/60">$${h.cash.toFixed(1)}M</td>
        `;
        tbody.appendChild(tr);
    });
}

// 5. 檢視切換 (Tabs)
function switchView(viewName) {
    document.getElementById('viewCharts').classList.toggle('hidden', viewName !== 'charts');
    document.getElementById('viewTable').classList.toggle('hidden', viewName !== 'table');
    document.getElementById('viewCausal').classList.toggle('hidden', viewName !== 'causal');

    const btnCharts = document.getElementById('tabBtnCharts');
    const btnTable = document.getElementById('tabBtnTable');
    const btnCausal = document.getElementById('tabBtnCausal');

    [btnCharts, btnTable, btnCausal].forEach(btn => {
        btn.className = 'px-3.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-400 text-xs font-semibold transition';
    });

    if (viewName === 'charts') {
        btnCharts.className = 'px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold transition';
    } else if (viewName === 'table') {
        btnTable.className = 'px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold transition';
    } else if (viewName === 'causal') {
        btnCausal.className = 'px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold transition';
    }
}

// 6. 重置模擬
function resetGame() {
    if (confirm('確定要重新開始模擬嗎？當前歷程將會清空。')) {
        engine = new PeopleExpressEngine();
        document.getElementById('inputFare').value = 0.090;
        document.getElementById('inputPlanes').value = 1;
        document.getElementById('inputHiring').value = 35;
        document.getElementById('inputMarketing').value = 0.08;
        document.getElementById('inputScope').value = 0.30;
        ['inputFare', 'inputPlanes', 'inputHiring', 'inputMarketing', 'inputScope'].forEach(id => {
            document.getElementById(id).dispatchEvent(new Event('input'));
        });
        updateUI();
    }
}

// 7. 匯出 CSV 報表
function exportCSV() {
    let csv = "Quarter,Period,Year,Q,Planes,Staff,WorkHours,Morale,Reputation,ServiceQuality,ASM_M,RPM_M,LoadFactor_pct,BreakevenLF_pct,Fare,Revenue_M,Expenses_M,NetIncome_M,CumulativeNetIncome_M,Cash_M,Debt_M,StockPrice\n";
    engine.history.forEach(h => {
        csv += `${h.quarter},${h.label},${h.year},${h.q},${h.planes},${h.totalStaff},${h.workHours},${h.morale},${h.serviceReputation},${h.serviceQuality},${h.asm},${h.rpm},${h.loadFactor},${h.breakevenLoadFactor},${h.peoplesFare},${h.revenue},${h.totalExpenses},${h.netIncome},${h.cumulativeNetIncome},${h.cash},${h.debt},${h.stockPrice}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `People_Express_Simulation_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
