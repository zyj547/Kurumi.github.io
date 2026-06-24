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

    function call(name, ...args) {
        const fn = root[name];
        if (typeof fn === "function") return fn(...args);
        return undefined;
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

    function hasStory(emp, key) {
        root.ensureEmployeeVitals(emp);
        return Boolean(emp.storyFlags[key]);
    }

    function finishStoryChoice(gameState) {
        call("saveGame");
        call("updateStatsUI");
        call("loadOfficeDesks");
    }

    function makeChoice(text, action) {
        return { text, action };
    }

    function showStory(titleHtml, descHtml, choices) {
        if (typeof root.showChoiceEvent !== "function") return false;
        root.showChoiceEvent(titleHtml, descHtml, choices);
        return true;
    }

    const STORY_ARCS = {
        fresh_growth: {
            title: "新人的成长",
            match: emp => emp.archetype === "fresh",
            steps: [
                {
                    key: "fresh_growth_1",
                    can: (emp, gameState) => emp.loyalty >= 68 && (gameState.releases || []).length >= 1,
                    title: emp => `<i class="fa-solid fa-seedling"></i> ${emp.name} 的成长提案`,
                    desc: emp => `${emp.name} 拿着一份不太成熟、但明显认真打磨过的内部小项目提案来找你。这个新人开始想独当一面了。`,
                    choices: (emp, gameState) => [
                        makeChoice("给他一小段时间做内部原型", () => {
                            markStory(emp, "fresh_growth_1");
                            markStory(emp, "fresh_growth_proto");
                            emp.level = Math.max(emp.level || 1, 2);
                            emp.stats.design = (emp.stats.design || 0) + 5;
                            emp.loyalty = clamp(emp.loyalty + 10);
                            emp.satisfaction = clamp(emp.satisfaction + 8);
                            gameState.rp = Math.max(0, (gameState.rp || 0) + 4);
                            remember(emp, "你认真看完了他的内部项目提案，并给了他第一次独立试手的机会。", gameState);
                            call("addChronicleEntry", `🌱 ${emp.name} 提出第一个内部原型，开始从新人向骨干成长。`);
                            finishStoryChoice(gameState);
                        }),
                        makeChoice("现在团队太忙，先让他继续跟项目", () => {
                            markStory(emp, "fresh_growth_1");
                            emp.satisfaction = clamp(emp.satisfaction - 6);
                            emp.loyalty = clamp(emp.loyalty + 2);
                            remember(emp, "他的内部项目提案被暂缓，但你承诺以后再看。", gameState);
                            finishStoryChoice(gameState);
                        })
                    ]
                },
                {
                    key: "fresh_growth_2",
                    can: (emp, gameState) => hasStory(emp, "fresh_growth_1") && emp.loyalty >= 72 && ((gameState.releases || []).length >= 2 || (emp.level || 1) >= 3),
                    title: emp => `<i class="fa-solid fa-diagram-project"></i> ${emp.name} 想负责完整模块`,
                    desc: emp => `经历过几次项目后，${emp.name} 不再只问“我该做什么”，而是带着拆分表来问：“这块能不能交给我负责到底？”`,
                    choices: (emp, gameState) => [
                        makeChoice("让他牵头一个小模块，并安排中途评审", () => {
                            markStory(emp, "fresh_growth_2");
                            emp.level = Math.max(emp.level || 1, 3);
                            emp.stats.design = (emp.stats.design || 0) + 6;
                            emp.stats.code = (emp.stats.code || 0) + 2;
                            emp.loyalty = clamp(emp.loyalty + 8);
                            emp.satisfaction = clamp(emp.satisfaction + 8);
                            gameState.rp = Math.max(0, (gameState.rp || 0) + 3);
                            remember(emp, "你把一个完整模块交给他负责，并认真做了中途评审。他第一次像负责人一样复盘结果。", gameState);
                            call("addChronicleEntry", `🧩 ${emp.name} 第一次负责完整模块，团队多了一个可以托付的人。`);
                            finishStoryChoice(gameState);
                        }),
                        makeChoice("让他继续协助核心成员，稳一点", () => {
                            markStory(emp, "fresh_growth_2");
                            emp.satisfaction = clamp(emp.satisfaction - 4);
                            emp.loyalty = clamp(emp.loyalty + 3);
                            remember(emp, "你没有立刻交出完整模块，而是让他继续跟着核心成员打磨基本功。", gameState);
                            finishStoryChoice(gameState);
                        })
                    ]
                },
                {
                    key: "fresh_growth_3",
                    can: (emp, gameState) => hasStory(emp, "fresh_growth_2") && emp.loyalty >= 80 && (gameState.companyStage || 0) >= 1,
                    title: emp => `<i class="fa-solid fa-flag"></i> ${emp.name} 的第一次独立提案`,
                    desc: emp => `${emp.name} 带来了一份比当年成熟得多的提案。这一次，他不是想证明自己，而是真的想为工作室开一条新路。`,
                    choices: (emp, gameState) => [
                        makeChoice("把它纳入未来企划池", () => {
                            markStory(emp, "fresh_growth_3");
                            emp.level = Math.max(emp.level || 1, 4);
                            emp.stats.design = (emp.stats.design || 0) + 8;
                            emp.loyalty = clamp(emp.loyalty + 10);
                            emp.satisfaction = clamp(emp.satisfaction + 10);
                            gameState.rp = Math.max(0, (gameState.rp || 0) + 8);
                            remember(emp, "从第一次青涩提案到成熟企划，你把他的独立想法纳入了工作室未来计划。", gameState);
                            call("addChronicleEntry", `🚩 ${emp.name} 的个人提案进入工作室未来企划池，新人真正成长为骨干。`);
                            finishStoryChoice(gameState);
                        })
                    ]
                }
            ]
        },
        veteran_secret: {
            title: "老李的秘密",
            match: emp => emp.archetype === "veteran",
            steps: [
                {
                    key: "veteran_secret_1",
                    can: (emp, gameState) => emp.loyalty >= 82 && (gameState.releases || []).length >= 2,
                    title: emp => `<i class="fa-solid fa-folder-open"></i> ${emp.name} 的压箱底设计稿`,
                    desc: emp => `${emp.name} 关上会议室门，拿出一份旧设计稿。他说这东西在大厂永远过不了会，但他一直想做。`,
                    choices: (emp, gameState) => [
                        makeChoice("把它列入未来重点企划", () => {
                            markStory(emp, "veteran_secret_1");
                            emp.loyalty = clamp(emp.loyalty + 8);
                            emp.satisfaction = clamp(emp.satisfaction + 10);
                            gameState.rp = Math.max(0, (gameState.rp || 0) + 8);
                            remember(emp, "他把压箱底的独立游戏设计稿交给你，你决定认真对待。", gameState);
                            call("addChronicleEntry", `📁 ${emp.name} 交出压箱底设计稿，工作室获得一份珍贵的未来企划。`);
                            finishStoryChoice(gameState);
                        }),
                        makeChoice("先保密收藏，等现金流更稳", () => {
                            markStory(emp, "veteran_secret_1");
                            emp.satisfaction = clamp(emp.satisfaction + 2);
                            emp.loyalty = clamp(emp.loyalty + 2);
                            remember(emp, "你把他的压箱底设计稿收好，承诺等工作室更稳时再启动。", gameState);
                            finishStoryChoice(gameState);
                        })
                    ]
                },
                {
                    key: "veteran_secret_2",
                    can: (emp, gameState) => hasStory(emp, "veteran_secret_1") && emp.loyalty >= 84 && gameState.funds >= 12000,
                    title: emp => `<i class="fa-solid fa-hammer"></i> ${emp.name} 想做一次垂直切片`,
                    desc: emp => `${emp.name} 说设计稿不能永远锁在抽屉里。他不需要完整项目，只想用一小段垂直切片证明它真的能成立。`,
                    choices: (emp, gameState) => [
                        makeChoice("拨小预算做切片", () => {
                            markStory(emp, "veteran_secret_2");
                            gameState.funds -= 2500;
                            gameState.rp = Math.max(0, (gameState.rp || 0) + 10);
                            emp.stats.design = (emp.stats.design || 0) + 5;
                            emp.loyalty = clamp(emp.loyalty + 8);
                            emp.satisfaction = clamp(emp.satisfaction + 12);
                            remember(emp, "你拨出一笔小预算，让他终于为压箱底设计稿做了垂直切片。", gameState);
                            call("addChronicleEntry", `🛠️ ${emp.name} 的压箱底设计稿完成第一版垂直切片。`);
                            finishStoryChoice(gameState);
                        }),
                        makeChoice("现在不能烧钱，先只做纸面验证", () => {
                            markStory(emp, "veteran_secret_2");
                            gameState.rp = Math.max(0, (gameState.rp || 0) + 4);
                            emp.satisfaction = clamp(emp.satisfaction - 3);
                            emp.loyalty = clamp(emp.loyalty + 2);
                            remember(emp, "你没有批准切片预算，但陪他把设计稿做了一次纸面验证。", gameState);
                            finishStoryChoice(gameState);
                        })
                    ]
                },
                {
                    key: "veteran_secret_3",
                    can: (emp, gameState) => hasStory(emp, "veteran_secret_2") && emp.loyalty >= 88 && (gameState.companyStage || 0) >= 2,
                    title: emp => `<i class="fa-solid fa-box-archive"></i> ${emp.name} 终于放下了旧项目`,
                    desc: emp => `公司走到更大的阶段后，${emp.name} 把那份旧设计稿重新装订好。他说，重要的不是它有没有立项，而是终于有人认真看完了。`,
                    choices: (emp, gameState) => [
                        makeChoice("把它作为工作室长期 IP 储备", () => {
                            markStory(emp, "veteran_secret_3");
                            gameState.rp = Math.max(0, (gameState.rp || 0) + 12);
                            emp.loyalty = clamp(emp.loyalty + 8);
                            emp.satisfaction = clamp(emp.satisfaction + 8);
                            remember(emp, "他的旧设计稿被正式归档为工作室长期 IP 储备，他终于和过去和解了一点。", gameState);
                            call("addChronicleEntry", `📦 ${emp.name} 的旧设计稿成为工作室长期 IP 储备。`);
                            finishStoryChoice(gameState);
                        })
                    ]
                }
            ]
        },
        lazy_rescue: {
            title: "摸鱼之神的救赎",
            match: emp => emp.trait === "lazy",
            steps: [
                {
                    key: "lazy_rescue_1",
                    can: (emp, gameState) => emp.loyalty >= 62 && gameState.funds < 9000,
                    title: emp => `<i class="fa-solid fa-toolbox"></i> ${emp.name} 偷偷做的工具`,
                    desc: emp => `现金流快绷不住时，${emp.name} 递来一个自己“摸鱼时顺手写的”自动化工具。它也许能救急。`,
                    choices: (emp, gameState) => [
                        makeChoice("立刻部署，先救现金流", () => {
                            markStory(emp, "lazy_rescue_1");
                            gameState.funds += 7000;
                            gameState.rp = Math.max(0, (gameState.rp || 0) + 3);
                            emp.loyalty = clamp(emp.loyalty + 10);
                            emp.satisfaction = clamp(emp.satisfaction + 12);
                            remember(emp, "工作室现金流吃紧时，他交出摸鱼时间偷偷写的工具，帮大家缓过一口气。", gameState);
                            call("addChronicleEntry", `🛠️ ${emp.name} 在危急时交出自动化工具，为工作室争取到一口现金流。`);
                            finishStoryChoice(gameState);
                        })
                    ]
                },
                {
                    key: "lazy_rescue_2",
                    can: (emp, gameState) => hasStory(emp, "lazy_rescue_1") && emp.loyalty >= 70 && (gameState.releases || []).length >= 1,
                    title: emp => `<i class="fa-solid fa-gears"></i> ${emp.name} 想把小工具正规化`,
                    desc: emp => `${emp.name} 说，那个救急工具如果稍微整理一下，可以变成团队内部流水线，不必一直靠人肉重复劳动。`,
                    choices: (emp, gameState) => [
                        makeChoice("给他时间把工具做成流程", () => {
                            markStory(emp, "lazy_rescue_2");
                            gameState.rp = Math.max(0, (gameState.rp || 0) + 6);
                            emp.stats.code = (emp.stats.code || 0) + 4;
                            emp.loyalty = clamp(emp.loyalty + 6);
                            emp.satisfaction = clamp(emp.satisfaction + 10);
                            remember(emp, "你让他把救急工具整理成团队流程，他第一次把摸鱼产物做成了正式资产。", gameState);
                            call("addChronicleEntry", `⚙️ ${emp.name} 把摸鱼工具整理成内部流程，团队少了很多重复劳动。`);
                            finishStoryChoice(gameState);
                        }),
                        makeChoice("先维持现状，别再分散精力", () => {
                            markStory(emp, "lazy_rescue_2");
                            emp.satisfaction = clamp(emp.satisfaction - 4);
                            remember(emp, "他的工具正规化计划被暂缓，你们决定先维持现状。", gameState);
                            finishStoryChoice(gameState);
                        })
                    ]
                },
                {
                    key: "lazy_rescue_3",
                    can: (emp, gameState) => hasStory(emp, "lazy_rescue_2") && emp.loyalty >= 78 && gameState.funds < 15000,
                    title: emp => `<i class="fa-solid fa-bolt"></i> ${emp.name} 留了一个后手`,
                    desc: emp => `又一次现金流吃紧时，${emp.name} 没有慌。他说上次工具正规化后，自己顺手留了一个“压缩成本模式”。`,
                    choices: (emp, gameState) => [
                        makeChoice("启用压缩成本模式", () => {
                            markStory(emp, "lazy_rescue_3");
                            gameState.funds += 9000;
                            gameState.rp = Math.max(0, (gameState.rp || 0) + 4);
                            emp.loyalty = clamp(emp.loyalty + 8);
                            emp.satisfaction = clamp(emp.satisfaction + 8);
                            remember(emp, "他启用了内部工具的压缩成本模式，再一次帮工作室缓过现金流。", gameState);
                            call("addChronicleEntry", `⚡ ${emp.name} 启用压缩成本模式，第二次把工作室从现金流边缘拉回来。`);
                            finishStoryChoice(gameState);
                        })
                    ]
                }
            ]
        }
    };

    function getEmployeeStoryProgress(emp) {
        root.ensureEmployeeVitals(emp);
        const arcs = Object.values(STORY_ARCS).filter(arc => arc.match(emp));
        return arcs.map(arc => {
            const total = arc.steps.length;
            const done = arc.steps.filter(step => hasStory(emp, step.key)).length;
            const next = arc.steps.find(step => !hasStory(emp, step.key));
            return {
                title: arc.title,
                done,
                total,
                complete: done >= total,
                nextKey: next ? next.key : null
            };
        });
    }

    function employeeStoryProgressHtml(emp) {
        const progress = getEmployeeStoryProgress(emp);
        if (!progress.length) return "";
        return `
            <div class="employee-story-progress">
                <strong><i class="fa-solid fa-book-open"></i> 个人故事线</strong>
                ${progress.map(item => `
                    <div class="employee-story-row ${item.complete ? "complete" : ""}">
                        <span>${item.title}</span>
                        <b>${item.done}/${item.total}</b>
                    </div>
                `).join("")}
            </div>
        `;
    }

    function maybeTriggerEmployeeStoryline(gameState) {
        if (!gameState || !Array.isArray(gameState.employees) || typeof showChoiceEvent !== "function") return false;
        ensureGame(gameState);
        const emps = gameState.employees.filter(emp => emp.id !== "player");
        for (const emp of emps) {
            root.ensureEmployeeVitals(emp);
            for (const arc of Object.values(STORY_ARCS)) {
                if (!arc.match(emp)) continue;
                const step = arc.steps.find(item => !hasStory(emp, item.key) && item.can(emp, gameState));
                if (!step) continue;
                return showStory(step.title(emp, gameState), step.desc(emp, gameState), step.choices(emp, gameState));
            }
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

    return {
        maybeTriggerEmployeeChemistry,
        maybeTriggerEmployeeStoryline,
        recordReleaseMemories,
        getEmployeeStoryProgress,
        employeeStoryProgressHtml
    };
});
