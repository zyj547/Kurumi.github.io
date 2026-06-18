// ==========================================================================
// 合同续约与挖角系统 (Employee Contracts & Poaching)
// 员工签 1~3 年合同，到期需续约（常伴加薪诉求）；核心员工偶尔被对手挖角。
// ==========================================================================

const CONTRACT = {
    poachChance: 0.04,        // 空窗期每周被挖角的基础概率
    poachMinLevel: 3,         // 可被挖角的最低等级
    renewRaiseMin: 0.18,      // 续约加薪下限
    renewRaiseMax: 0.40,      // 续约加薪上限
    poachRaise: 0.35,         // 挽留挖角需要的加薪幅度
    signingFeeRate: 0.5       // 续约签字费 = 新月薪 × 该系数
};

function hasContract(emp) {
    return emp && emp.id !== "player" && emp.contractWeeksLeft != null;
}

// 通用：用 event-modal 弹出一个二/多选事件
function showChoiceEvent(titleHtml, descHtml, choices) {
    const modal = document.getElementById("event-modal");
    modal.classList.add("active");
    document.getElementById("event-modal-title").innerHTML = titleHtml;
    document.getElementById("event-modal-desc").innerHTML = descHtml;
    const box = document.getElementById("event-modal-choices");
    box.innerHTML = "";
    choices.forEach(ch => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.innerText = ch.text;
        btn.onclick = () => {
            modal.classList.remove("active");
            ch.action();
        };
        box.appendChild(btn);
    });
}

// 每周合同结算：递减剩余周数，到期则弹出续约决策（返回 true 表示需强制暂停）
function processContracts() {
    const emps = gameState.employees || [];
    let expiredEmp = null;
    emps.forEach(emp => {
        if (!hasContract(emp) || emp.pendingRenewal) return;
        emp.contractWeeksLeft = Math.max(0, emp.contractWeeksLeft - 1);
        if (emp.contractWeeksLeft <= 0 && !expiredEmp) expiredEmp = emp;
    });
    if (!expiredEmp) return false;

    expiredEmp.pendingRenewal = true;
    openContractRenewalModal(expiredEmp);
    return true;
}

function openContractRenewalModal(emp) {
    const idx = gameState.employees.indexOf(emp);
    const raise = CONTRACT.renewRaiseMin + Math.random() * (CONTRACT.renewRaiseMax - CONTRACT.renewRaiseMin);
    const newSalary = Math.round(emp.salary * (1 + raise));
    const signingFee = Math.round(newSalary * CONTRACT.signingFeeRate);
    emp._renewSalary = newSalary;
    emp._renewFee = signingFee;

    if (typeof playSFX === "function") playSFX("click");
    showChoiceEvent(
        `<i class="fa-solid fa-file-signature"></i> 合同到期：${escapeHtml(emp.name)}`,
        `<strong>${escapeHtml(emp.name)}</strong> 的 ${emp.contractYears} 年合同已到期。<br>
         对方希望续约，但要求月薪从 <span style="color:var(--accent-yellow);">¥${emp.salary.toLocaleString()}</span>
         上调到 <span style="color:var(--accent-pink);">¥${newSalary.toLocaleString()}</span>
         （+${Math.round(raise * 100)}%），并支付一次性签字费 ¥${signingFee.toLocaleString()}。`,
        [
            { text: `续约（涨薪并支付签字费 ¥${signingFee.toLocaleString()}）`, action: () => renewContract(idx) },
            { text: "好聚好散，不再续约（员工离开）", action: () => declineRenewal(idx) }
        ]
    );
}

function renewContract(idx) {
    const emp = gameState.employees[idx];
    if (!emp) return;
    const fee = emp._renewFee || 0;
    if (gameState.funds < fee) {
        alert("资金不足以支付续约签字费！只能让其离开。");
        declineRenewal(idx);
        return;
    }
    gameState.funds -= fee;
    emp.salary = emp._renewSalary || emp.salary;
    emp.contractYears = 1 + Math.floor(Math.random() * 3);
    emp.contractWeeksLeft = emp.contractYears * 48;
    emp.pendingRenewal = false;
    emp.morale = Math.min(100, (emp.morale == null ? 75 : emp.morale) + 8);
    delete emp._renewSalary; delete emp._renewFee;
    addChronicleEntry(`📝 与【${emp.name}】续签 ${emp.contractYears} 年合同，月薪调整为 ¥${emp.salary.toLocaleString()}。`);
    if (typeof playSFX === "function") playSFX("success");
    saveGame(); updateStatsUI(); loadOfficeDesks();
}

function declineRenewal(idx) {
    const emp = gameState.employees[idx];
    if (!emp) return;
    addChronicleEntry(`👋 【${emp.name}】合同到期未续约，离开了工作室。`);
    gameState.employees.splice(idx, 1);
    if (typeof playSFX === "function") playSFX("click");
    saveGame(); updateStatsUI(); loadOfficeDesks();
}

// 挖角：空窗期偶发，对手高薪挖走核心员工（返回 true 表示需强制暂停）
function maybePoach() {
    if (Math.random() >= CONTRACT.poachChance) return false;
    const candidates = gameState.employees.filter(e => e.id !== "player" && (e.level || 1) >= CONTRACT.poachMinLevel && !e.pendingRenewal);
    if (candidates.length === 0) return false;
    // 优先挖能力最强者
    candidates.sort((a, b) => (b.stats.code + b.stats.art + b.stats.design) - (a.stats.code + a.stats.art + a.stats.design));
    const emp = candidates[0];
    const idx = gameState.employees.indexOf(emp);
    const matchSalary = Math.round(emp.salary * (1 + CONTRACT.poachRaise));

    if (typeof playSFX === "function") playSFX("bug");
    showChoiceEvent(
        `<i class="fa-solid fa-user-secret"></i> 核心员工被挖角！`,
        `竞争对手向 <strong>${escapeHtml(emp.name)}</strong> 抛出橄榄枝，开出了更高的薪水。<br>
         想留住 TA，需要把月薪从 <span style="color:var(--accent-yellow);">¥${emp.salary.toLocaleString()}</span>
         匹配到 <span style="color:var(--accent-pink);">¥${matchSalary.toLocaleString()}</span>（+${Math.round(CONTRACT.poachRaise * 100)}%）。`,
        [
            { text: `匹配薪资挽留（月薪 ¥${matchSalary.toLocaleString()}）`, action: () => {
                emp.salary = matchSalary;
                emp.morale = Math.min(100, (emp.morale == null ? 75 : emp.morale) + 12);
                emp.contractYears = Math.max(emp.contractYears || 1, 2);
                emp.contractWeeksLeft = Math.max(emp.contractWeeksLeft || 0, 96);
                addChronicleEntry(`💪 顶住挖角，加薪挽留了核心成员【${emp.name}】，月薪升至 ¥${matchSalary.toLocaleString()}。`);
                if (typeof playSFX === "function") playSFX("success");
                saveGame(); updateStatsUI(); loadOfficeDesks();
            }},
            { text: "忍痛放人，祝前程似锦", action: () => {
                addChronicleEntry(`💔 核心成员【${emp.name}】被对手挖走，离开了工作室。`);
                gameState.employees.splice(idx, 1);
                saveGame(); updateStatsUI(); loadOfficeDesks();
            }}
        ]
    );
    return true;
}

// 推进至最近一份合同到期
function advanceToContractExpiry() {
    const contracted = gameState.employees.filter(hasContract);
    if (contracted.length === 0) {
        alert("当前没有签约员工（创始人无合同）。");
        return;
    }
    const minWeeks = Math.min(...contracted.map(e => e.contractWeeksLeft));
    startAdvance(Math.max(1, Math.min(144, minWeeks)), "contract");
}

// 合同剩余的展示文案
function contractLabel(emp) {
    if (emp.id === "player") return "创始人 · 永久";
    if (emp.contractWeeksLeft == null) return "无固定合约";
    const w = emp.contractWeeksLeft;
    const months = Math.floor(w / 4);
    if (w <= 8) return `合约剩 ${w} 周 ⚠`;
    return `合约剩 ${months} 个月`;
}

function contractTone(emp) {
    if (emp.id === "player" || emp.contractWeeksLeft == null) return "good";
    if (emp.contractWeeksLeft <= 8) return "risk";
    if (emp.contractWeeksLeft <= 24) return "warn";
    return "good";
}
