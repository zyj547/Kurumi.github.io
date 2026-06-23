// ==========================================================================
// 员工关系与个人故事线：化学反应、支线触发、发行共同记忆
// ==========================================================================
(function (root, factory) {
    const api = factory(root);
    if (typeof window !== "undefined") Object.assign(window, api);
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
    function clamp(v, min = 0, max = 100) {
        return root.employeeClamp(v, min, max);
    }

    function ensureGame(gameState) {
        if (root.ensureEmployeeEcosystem) root.ensureEmployeeEcosystem(gameState);
    }

    function findEmployee(gameState, predicate) {
        return (gameState.employees || []).find(emp => emp.id !== "player" && predicate(root.ensureEmployeeVitals(emp)));
    }

    function remember(emp, text, gameState) {
        if (root.addEmployeeMemory) root.addEmployeeMemory(emp, text, gameState);
    }

    function pairKey(a, b) {
        return [a, b].sort().join("+");
    }

    const CHEMISTRY_BEATS = [
        {
            key: pairKey("fresh", "veteran"),
            chance: 0.08,
            match: (a, b) => [a.archetype, b.archetype].includes("fresh") && [a.archetype, b.archetype].includes("veteran"),
            text: (fresh, veteran) => `${veteran.name} 被 ${fresh.name} 拉着问了一下午，嘴上嫌烦，最后还是把关键坑都讲明白了。`,
            apply: (fresh, veteran, gameState) => {
                fresh.xp = (fresh.xp || 0) + 8;
                fresh.satisfaction = clamp(fresh.satisfaction + 5);
                veteran.satisfaction = clamp(veteran.satisfaction + 2);
                remember(fresh, `${veteran.name} 给他讲了一下午经验，他像偷到秘籍一样记了满满一页。`, gameState);
                remember(veteran, `${fresh.name} 追着问问题，他一边嫌麻烦，一边还是把坑讲透了。`, gameState);
            }
        },
        {
            key: pairKey("idealist", "pragmatic"),
            chance: 0.07,
            match: (a, b) => [a.archetype, b.archetype].includes("idealist") && [a.archetype, b.archetype].includes("pragmatic"),
            text: (ideal, pragmatic) => `${ideal.name} 又提出一个烧钱创意，${pragmatic.name} 叹了口气，默默打开预算表。`,
            apply: (ideal, pragmatic, gameState) => {
                ideal.satisfaction = clamp(ideal.satisfaction + 2);
                pragmatic.loyalty = clamp(pragmatic.loyalty + 1);
                gameState.rp = Math.max(0, (gameState.rp || 0) + 1);
            }
        },
        {
            key: pairKey("lazy", "lazy"),
            chance: 0.06,
            match: (a, b) => a.archetype === "lazy" && b.archetype === "lazy",
            text: (a, b) => `${a.name} 和 ${b.name} 坐得太近，工位区出现了过于均匀的呼吸声。`,
            apply: (a, b) => {
                [a, b].forEach(emp => {
                    emp.fatigue = clamp((emp.fatigue || 0) - 10);
                    emp.satisfaction = clamp(emp.satisfaction + 4);
                });
            }
        }
    ];

    function maybeTriggerEmployeeChemistry(gameState, rng) {
        if (!gameState || !Array.isArray(gameState.employees) || gameState.employees.length < 3) return false;
        const rand = typeof rng === "function" ? rng : Math.random;
        ensureGame(gameState);
        const emps = gameState.employees.filter(emp => emp.id !== "player");
        for (let i = 0; i < emps.length; i++) {
            for (let j = i + 1; j < emps.length; j++) {
                const a = emps[i];
                const b = emps[j];
                const beat = CHEMISTRY_BEATS.find(item => item.match(a, b));
                if (!beat || rand() >= beat.chance) continue;
                const ordered = a.archetype === "fresh" || a.archetype === "idealist" ? [a, b] : [b, a];
                beat.apply(ordered[0], ordered[1], gameState);
                if (typeof addChronicleEntry === "function") addChronicleEntry(`👥 ${beat.text(ordered[0], ordered[1])}`);
                return true;
            }
        }
        return false;
    }

    function markStory(emp, key) {
        root.ensureEmployeeVitals(emp);
        emp.storyFlags[key] = true;
    }

    function maybeTriggerEmployeeStoryline(gameState) {
        if (!gameState || !Array.isArray(gameState.employees) || typeof showChoiceEvent !== "function") return false;
        ensureGame(gameState);
        const releases = (gameState.releases || []).length;

        const fresh = findEmployee(gameState, emp => emp.archetype === "fresh" && emp.loyalty >= 68 && releases >= 1 && !emp.storyFlags.fresh_growth);
        if (fresh) {
            showChoiceEvent(`<i class="fa-solid fa-seedling"></i> ${fresh.name} 的成长提案`, `${fresh.name} 拿着一份不太成熟、但明显认真打磨过的内部小项目提案来找你。这个新人开始想独当一面了。`, [
                { text: "给他一小段时间做内部原型", action: () => {
                    markStory(fresh, "fresh_growth");
                    fresh.level = Math.max(fresh.level || 1, 2);
                    fresh.stats.design = (fresh.stats.design || 0) + 5;
                    fresh.loyalty = clamp(fresh.loyalty + 10);
                    gameState.rp = Math.max(0, (gameState.rp || 0) + 4);
                    remember(fresh, "你认真看完了他的内部项目提案，并给了他第一次独立试手的机会。", gameState);
                    addChronicleEntry(`🌱 ${fresh.name} 提出第一个内部原型，开始从新人向骨干成长。`);
                    saveGame(); updateStatsUI(); loadOfficeDesks();
                }},
                { text: "现在团队太忙，先让他继续跟项目", action: () => {
                    markStory(fresh, "fresh_growth");
                    fresh.satisfaction = clamp(fresh.satisfaction - 6);
                    fresh.loyalty = clamp(fresh.loyalty + 2);
                    remember(fresh, "他的内部项目提案被暂缓，但你承诺以后再看。", gameState);
                    saveGame(); updateStatsUI(); loadOfficeDesks();
                }}
            ]);
            return true;
        }

        const veteran = findEmployee(gameState, emp => emp.archetype === "veteran" && emp.loyalty >= 82 && releases >= 2 && !emp.storyFlags.veteran_secret);
        if (veteran) {
            showChoiceEvent(`<i class="fa-solid fa-folder-open"></i> ${veteran.name} 的压箱底设计稿`, `${veteran.name} 关上会议室门，拿出一份旧设计稿。他说这东西在大厂永远过不了会，但他一直想做。`, [
                { text: "把它列入未来重点企划", action: () => {
                    markStory(veteran, "veteran_secret");
                    veteran.loyalty = clamp(veteran.loyalty + 8);
                    veteran.satisfaction = clamp(veteran.satisfaction + 10);
                    gameState.rp = Math.max(0, (gameState.rp || 0) + 8);
                    remember(veteran, "他把压箱底的独立游戏设计稿交给你，你决定认真对待。", gameState);
                    addChronicleEntry(`📁 ${veteran.name} 交出压箱底设计稿，工作室获得一份珍贵的未来企划。`);
                    saveGame(); updateStatsUI(); loadOfficeDesks();
                }},
                { text: "先保密收藏，等现金流更稳", action: () => {
                    markStory(veteran, "veteran_secret");
                    veteran.satisfaction = clamp(veteran.satisfaction + 2);
                    remember(veteran, "你把他的压箱底设计稿收好，承诺等工作室更稳时再启动。", gameState);
                    saveGame(); updateStatsUI(); loadOfficeDesks();
                }}
            ]);
            return true;
        }

        const lazy = findEmployee(gameState, emp => emp.trait === "lazy" && emp.loyalty >= 62 && gameState.funds < 9000 && !emp.storyFlags.lazy_rescue);
        if (lazy) {
            showChoiceEvent(`<i class="fa-solid fa-toolbox"></i> ${lazy.name} 偷偷做的工具`, `现金流快绷不住时，${lazy.name} 递来一个自己“摸鱼时顺手写的”自动化工具。它也许能救急。`, [
                { text: "立刻部署，先救现金流", action: () => {
                    markStory(lazy, "lazy_rescue");
                    gameState.funds += 7000;
                    gameState.rp = Math.max(0, (gameState.rp || 0) + 3);
                    lazy.loyalty = clamp(lazy.loyalty + 10);
                    lazy.satisfaction = clamp(lazy.satisfaction + 12);
                    remember(lazy, "工作室现金流吃紧时，他交出摸鱼时间偷偷写的工具，帮大家缓过一口气。", gameState);
                    addChronicleEntry(`🛠️ ${lazy.name} 在危急时交出自动化工具，为工作室争取到一口现金流。`);
                    saveGame(); updateStatsUI(); loadOfficeDesks();
                }}
            ]);
            return true;
        }
        return false;
    }

    function recordReleaseMemories(gameState, release) {
        if (!gameState || !release || !Array.isArray(gameState.employees)) return;
        ensureGame(gameState);
        const good = Number(release.rating || 0) >= 7.5;
        gameState.employees.forEach(emp => {
            if (emp.id === "player") return;
            remember(emp, `共同完成并发布了《${release.name}》，口碑分 ${release.rating}。${good ? "这次成功让团队更相信彼此。" : "虽然结果普通，但大家都记住了这次经验。"}`, gameState);
            emp.loyalty = clamp(emp.loyalty + (good ? 3 : 1));
        });
    }

    return { maybeTriggerEmployeeChemistry, maybeTriggerEmployeeStoryline, recordReleaseMemories };
});
