// ==========================================================================
// Employee insights: risk diagnosis, status reasons and suggested actions.
// ==========================================================================
(function (root, factory) {
    const api = factory(root);
    if (typeof window !== "undefined") Object.assign(window, api);
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
    function clamp(v, min = 0, max = 100) {
        const fn = root.employeeClamp || ((n, lo, hi) => Math.max(lo, Math.min(hi, n)));
        return fn(v, min, max);
    }

    function safe(text) {
        const escape = typeof root.escapeHtml === "function"
            ? root.escapeHtml
            : (s) => String(s == null ? "" : s)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
        return escape(text);
    }

    function ensure(emp) {
        return root.ensureEmployeeVitals ? root.ensureEmployeeVitals(emp) : emp;
    }

    function normalizedEmployee(emp) {
        ensure(emp);
        const morale = emp.morale == null ? 75 : clamp(emp.morale);
        const satisfaction = emp.satisfaction == null ? morale : clamp(emp.satisfaction);
        const loyalty = emp.loyalty == null ? (emp.id === "player" ? 100 : 55) : clamp(emp.loyalty);
        const fatigue = clamp(emp.fatigue || 0);
        const efficiency = typeof root.employeeEfficiency === "function"
            ? Math.round(root.employeeEfficiency(emp) * 100)
            : Math.round((typeof root.employeeEfficiencyMoodMultiplier === "function"
                ? root.employeeEfficiencyMoodMultiplier(emp)
                : 1) * 100);
        return { morale, satisfaction, loyalty, fatigue, efficiency };
    }

    function activeProjectCount(gameState) {
        if (!gameState) return 0;
        const main = gameState.currentProject &&
            (gameState.currentProject.state === "developing" || gameState.currentProject.state === "polishing") ? 1 : 0;
        const aux = (gameState.auxProjects || []).filter(project => project.state === "developing").length;
        return main + aux;
    }

    function scoreEmployeeRisk(emp, gameState) {
        if (!emp) return { score: 0, tone: "good", label: "稳定", title: "状态稳定", reasons: [], suggestions: [] };
        const v = normalizedEmployee(emp);
        const reasons = [];
        const suggestions = [];
        let score = 0;

        if (emp.id === "player") {
            return {
                score: 0,
                tone: "founder",
                label: "创始人",
                title: "创始人状态",
                reasons: ["创始人不会离职，但疲劳和情绪仍会影响研发效率。"],
                suggestions: v.fatigue >= 70 ? ["安排一次休整，避免团队节奏被核心角色拖慢。"] : ["维持当前节奏，把关键选择交给创始人拍板。"],
                metrics: v
            };
        }

        if (v.fatigue >= 85) {
            score += 34;
            reasons.push("疲劳已经接近透支，继续研发会明显拉低效率。");
            suggestions.push("优先安排带薪休整，或暂缓高压研发事件。");
        } else if (v.fatigue >= 70) {
            score += 22;
            reasons.push("疲劳偏高，短期还能撑，但容易积累负面记忆。");
            suggestions.push("下一次发薪日前后安排休整更划算。");
        }

        if (v.satisfaction <= 28) {
            score += 28;
            reasons.push("短期情绪很低，可能出现抱怨或效率下滑。");
            suggestions.push("避免连续压榨，给一次休整或认可型选择。");
        } else if (v.satisfaction <= 42) {
            score += 14;
            reasons.push("情绪偏低，产出稳定性开始下降。");
            suggestions.push("选择员工插话时优先支持他的判断。");
        }

        if (v.loyalty <= 30) {
            score += 30;
            reasons.push("忠诚较低，续约涨薪和被挖角风险都会上升。");
            suggestions.push("尽快通过加薪、成功项目或关键选择修复信任。");
        } else if (v.loyalty <= 45) {
            score += 16;
            reasons.push("忠诚一般，长期关系还不稳。");
            suggestions.push("让他参与一次高光研发选择，积累共同记忆。");
        }

        if (v.efficiency < 92) {
            score += 10;
            reasons.push(`当前效率约 ${v.efficiency}%，已经低于正常状态。`);
        }

        if (emp.pendingRenewal) {
            score += 14;
            reasons.push("合同即将到期，需要先处理续约。");
            suggestions.push("优先完成续约，避免关键成员突然离开。");
        }

        if (emp.trait === "salary" && v.loyalty < 65) {
            score += 10;
            reasons.push("薪水敏感型员工在忠诚不足时更容易被市场报价影响。");
            suggestions.push("薪酬谈判时少压价，多用明确承诺换稳定。");
        }

        if (emp.trait === "lazy" && activeProjectCount(gameState) === 0 && v.fatigue <= 35) {
            score = Math.max(0, score - 8);
            reasons.push("当前处于空窗期，摸鱼反而有助于恢复状态。");
        }

        if (!reasons.length) reasons.push("情绪、忠诚和疲劳都处在健康区间。");
        if (!suggestions.length) {
            if ((emp.level || 1) >= 5 && !emp.specialty) suggestions.push("可以考虑安排职业专精，形成更清晰的团队定位。");
            else suggestions.push("维持当前安排，等待更合适的高光事件。");
        }

        const finalScore = Math.round(clamp(score, 0, 100));
        const tone = finalScore >= 70 ? "risk" : finalScore >= 42 ? "warn" : finalScore >= 18 ? "watch" : "good";
        const label = tone === "risk" ? "高风险" : tone === "warn" ? "需关注" : tone === "watch" ? "观察" : "稳定";
        const title = tone === "risk" ? "需要立即处理" : tone === "warn" ? "状态开始吃紧" : tone === "watch" ? "有轻微波动" : "状态稳定";

        return {
            score: finalScore,
            tone,
            label,
            title,
            reasons: reasons.slice(0, 4),
            suggestions: suggestions.slice(0, 3),
            metrics: v
        };
    }

    function employeeInsightChipHtml(emp, gameState) {
        const insight = scoreEmployeeRisk(emp, gameState);
        return `<div class="condition-pill employee-risk-pill ${insight.tone}" title="${safe(insight.title)}">${safe(insight.label)} ${insight.score}</div>`;
    }

    function employeeInsightHtml(emp, gameState) {
        const insight = scoreEmployeeRisk(emp, gameState);
        return `
            <div class="employee-insight-card ${insight.tone}">
                <div class="employee-insight-head">
                    <span><i class="fa-solid fa-heart-pulse"></i> ${safe(insight.title)}</span>
                    <b>${safe(insight.label)} · ${insight.score}</b>
                </div>
                <div class="employee-insight-grid">
                    <div><span>情绪</span><b>${Math.round(insight.metrics.satisfaction)}</b></div>
                    <div><span>忠诚</span><b>${Math.round(insight.metrics.loyalty)}</b></div>
                    <div><span>疲劳</span><b>${Math.round(insight.metrics.fatigue)}</b></div>
                    <div><span>效率</span><b>${Math.round(insight.metrics.efficiency)}%</b></div>
                </div>
                <div class="employee-insight-columns">
                    <div>
                        <strong>状态原因</strong>
                        ${insight.reasons.map(item => `<p>${safe(item)}</p>`).join("")}
                    </div>
                    <div>
                        <strong>建议处理</strong>
                        ${insight.suggestions.map(item => `<p>${safe(item)}</p>`).join("")}
                    </div>
                </div>
            </div>
        `;
    }

    return {
        scoreEmployeeRisk,
        employeeInsightChipHtml,
        employeeInsightHtml
    };
});
