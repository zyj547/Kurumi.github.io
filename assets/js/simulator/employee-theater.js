// ==========================================================================
// 员工办公室小剧场：仅负责首页侧栏的日常可视化
// ==========================================================================
(function (root, factory) {
    const api = factory(root);
    if (typeof window !== "undefined") Object.assign(window, api);
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
    function ensure(emp) {
        return root.ensureEmployeeVitals ? root.ensureEmployeeVitals(emp) : emp;
    }

    function avatarSceneIcon(emp) {
        ensure(emp);
        if (emp.trait === "debug") return "fa-solid fa-bug";
        if (emp.trait === "lazy") return "fa-solid fa-mug-hot";
        if (emp.trait === "idea") return "fa-solid fa-lightbulb";
        if (emp.trait === "multi") return "fa-solid fa-wand-magic-sparkles";
        if (emp.trait === "salary") return "fa-solid fa-file-invoice-dollar";
        if (emp.role === "artist") return "fa-solid fa-palette";
        if (emp.role === "designer") return "fa-solid fa-diagram-project";
        return "fa-solid fa-code";
    }

    function officeBubbleText(emp) {
        ensure(emp);
        const name = emp.name || "员工";
        if (emp.fatigue >= 80) return `${name} 正靠着椅背硬撑，杯子旁又多了一张便签。`;
        if (emp.satisfaction <= 35) return `${name} 今天话很少，像是在和屏幕冷战。`;
        if (emp.trait === "debug") return `${name} 盯着日志念念有词，像在审问一段可疑代码。`;
        if (emp.trait === "lazy") return `${name} 桌上零食很多，但任务清单居然也在一点点变短。`;
        if (emp.trait === "idea") return `${name} 在白板角落画了个箭头，旁边写着“也许能行”。`;
        if (emp.trait === "multi") return `${name} 在两个工位之间来回穿梭，顺手补了几个小洞。`;
        if (emp.archetype === "veteran") return `${name} 端着杯子看窗外，像在回忆某个踩过的坑。`;
        if (emp.archetype === "fresh") return `${name} 坐得很直，鼠标旁摊着一页密密麻麻的笔记。`;
        if (emp.satisfaction >= 82) return `${name} 今天状态很好，连敲键盘都带着节奏。`;
        return `${name} 正在安静推进手头任务。`;
    }

    function renderOfficeTheater(gameState) {
        const box = typeof document !== "undefined" ? document.getElementById("office-theater-list") : null;
        if (!box || !gameState || !Array.isArray(gameState.employees) || !root.ensureEmployeeEcosystem) return;
        const safe = typeof escapeHtml === "function" ? escapeHtml : (s) => String(s == null ? "" : s);
        root.ensureEmployeeEcosystem(gameState);
        const members = gameState.employees.filter(emp => emp.id !== "player").slice(0, 4);
        if (!members.length) {
            box.innerHTML = `<div class="office-theater-empty">团队还很安静。招到第一位伙伴后，这里会出现办公室日常。</div>`;
            return;
        }
        box.innerHTML = members.map(emp => `
            <div class="office-theater-row ${emp.statusTone || "neutral"}" onclick="openEmployeeMemory(${gameState.employees.indexOf(emp)})">
                <div class="office-theater-icon"><i class="${avatarSceneIcon(emp)}"></i></div>
                <div class="office-theater-copy">
                    <div class="office-theater-name">${safe(emp.name)}<span>${safe(emp.statusText || "整理任务")}</span></div>
                    <p>${safe(officeBubbleText(emp))}</p>
                </div>
            </div>
        `).join("");
    }

    return { avatarSceneIcon, officeBubbleText, renderOfficeTheater };
});
