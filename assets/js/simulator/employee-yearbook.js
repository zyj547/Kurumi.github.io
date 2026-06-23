// ==========================================================================
// 员工年鉴：生成团队可分享文本，后续可扩展为图片海报
// ==========================================================================
(function (root, factory) {
    const api = factory(root);
    if (typeof window !== "undefined") Object.assign(window, api);
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
    function buildTeamYearbook(gameState) {
        if (!gameState || !Array.isArray(gameState.employees)) return "暂无团队年鉴。";
        if (root.ensureEmployeeEcosystem) root.ensureEmployeeEcosystem(gameState);
        const d = gameState.date || { year: 1, month: 1, week: 1 };
        const team = gameState.employees.filter(emp => emp.id !== "player");
        const header = `《${gameState.companyName || "桔子工作室"}》团队年鉴
时间：第 ${d.year} 年 ${d.month} 月第 ${d.week} 周
规模：${team.length} 名伙伴 / ${gameState.officeSlots || team.length + 1} 个工位
代表作：${(gameState.releases || [])[0]?.name || "尚未诞生"}`;
        if (!team.length) return `${header}\n\n团队还在等待第一位伙伴加入。`;
        const lines = team.map((emp, index) => {
            const bio = root.buildEmployeeBio ? root.buildEmployeeBio(emp, gameState) : `【${emp.name}】`;
            return `\n${index + 1}. ${bio.replace(/\n/g, "\n   ")}`;
        });
        const footer = "\n愿这些名字，成为工作室故事里真正被记住的人。";
        return [header, ...lines, footer].join("\n");
    }

    function copyTeamYearbook() {
        const text = buildTeamYearbook(root.gameState);
        if (root.navigator && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => alert("团队年鉴已复制，可以直接分享。", "员工年鉴"));
        } else {
            alert(`<pre style="white-space:pre-wrap;text-align:left;">${text}</pre>`, "员工年鉴");
        }
    }

    return { buildTeamYearbook, copyTeamYearbook };
});
