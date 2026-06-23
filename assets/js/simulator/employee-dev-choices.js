// ==========================================================================
// 员工研发插话：根据卡牌 ID 和员工状态临时追加研发选项
// ==========================================================================
(function (root, factory) {
    const api = factory(root);
    if (typeof window !== "undefined") Object.assign(window, api);
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
    function clamp(v, min = 0, max = 100) {
        return root.employeeClamp(v, min, max);
    }

    function findEmployee(gameState, predicate) {
        return (gameState.employees || []).find(emp => emp.id !== "player" && predicate(root.ensureEmployeeVitals(emp)));
    }

    function remember(emp, text, gameState) {
        if (root.addEmployeeMemory) root.addEmployeeMemory(emp, text, gameState);
    }

    function getEmployeeDevCardChoices(card, project, gameState) {
        if (!card || !project || !gameState) return [];
        const out = [];

        if (card.id === "g_morale") {
            const fresh = findEmployee(gameState, emp => emp.archetype === "fresh" && emp.satisfaction >= 76);
            if (fresh) out.push({
                text: `${fresh.name} 提议周末搞一次 48 小时小型 Jam`,
                result: `${fresh.name} 累得眼睛发亮，但那个脑洞功能真的跑起来了。`,
                effect: (p) => {
                    p.design += 14; p.bugs += 2;
                    fresh.fatigue = clamp((fresh.fatigue || 0) + 16);
                    fresh.satisfaction = clamp(fresh.satisfaction + 8);
                    fresh.loyalty = clamp(fresh.loyalty + 6);
                    remember(fresh, "你陪他疯了一次 48 小时小型 Jam，他第一次感觉自己不是新人，而是共创者。", gameState);
                }
            });
        }

        if (card.id === "g_risk_register") {
            const veteran = findEmployee(gameState, emp => emp.archetype === "veteran");
            if (veteran) {
                out.push({
                    text: `${veteran.name} 说这坑他见过，建议直接绕开`,
                    result: "老经验确实省下了讨论时间，但有些风险只是被推迟了。",
                    effect: (p) => {
                        p.code += 8; p.bugs += 3;
                        veteran.satisfaction = clamp(veteran.satisfaction + 4);
                        remember(veteran, "风险复盘时你采纳了他的老经验，跳过了一段冗长流程。", gameState);
                    }
                });
                out.push({
                    text: `坚持按流程复盘，让 ${veteran.name} 也写清楚依据`,
                    result: "流程慢一点，但风险边界被真正摊开了。",
                    effect: (p) => {
                        p.design += 9; p.bugs = Math.max(0, p.bugs - 2);
                        veteran.satisfaction = clamp(veteran.satisfaction - 3);
                        veteran.loyalty = clamp(veteran.loyalty + 2);
                        remember(veteran, "你没有盲目相信他的经验，而是要求把风险依据写清楚。", gameState);
                    }
                });
            }
        }

        if (card.id === "g_save_system") {
            const lazy = findEmployee(gameState, emp => emp.trait === "lazy");
            if (lazy) out.push({
                text: `${lazy.name} 掏出一个“现成自动存档脚本”`,
                result: "脚本居然能用，只是来源让人有点不安。",
                effect: (p) => {
                    p.code += 9;
                    if (Math.random() < 0.35) p.bugs += 3;
                    lazy.satisfaction = clamp(lazy.satisfaction + 8);
                    remember(lazy, "他从自己的小工具里翻出自动存档脚本，帮项目省了一截工期。", gameState);
                }
            });
        }

        if (card.id === "g_artref") {
            const artist = findEmployee(gameState, emp => emp.role === "artist" && emp.satisfaction >= 62);
            if (artist) out.push({
                text: `${artist.name} 想把参考拆成一套自己的视觉规则`,
                result: "参考没有被照搬，而是变成了项目自己的风格语言。",
                effect: (p) => {
                    p.art += 14; p.design += 3;
                    artist.satisfaction = clamp(artist.satisfaction + 7);
                    artist.loyalty = clamp(artist.loyalty + 3);
                    remember(artist, "你支持他把神级参考拆成自己的视觉规则，而不是简单照抄。", gameState);
                }
            });
        }

        if (card.id === "g_coupling") {
            const debug = findEmployee(gameState, emp => emp.trait === "debug" || emp.role === "programmer");
            if (debug) out.push({
                text: `${debug.name} 主动认领“拆线团”任务`,
                result: "耦合被拆开了一部分，虽然人累得不轻，但后续改动舒服多了。",
                effect: (p) => {
                    p.code += 16; p.bugs = Math.max(0, p.bugs - 2);
                    debug.fatigue = clamp((debug.fatigue || 0) + 10);
                    debug.loyalty = clamp(debug.loyalty + 3);
                    remember(debug, "代码耦合告急时，他主动接下拆线团任务，帮团队把后续风险降了下来。", gameState);
                }
            });
        }

        if (card.id === "g_crash") {
            const loyal = findEmployee(gameState, emp => emp.trait === "debug" && emp.loyalty >= 60);
            if (loyal) out.push({
                text: `${loyal.name} 说：这个闪退我来守夜`,
                result: "他把崩溃栈追到了底，第二天在工位上睡着了。",
                effect: (p) => {
                    p.bugs = Math.max(0, p.bugs - 8); p.code += 8;
                    loyal.fatigue = clamp((loyal.fatigue || 0) + 18);
                    loyal.loyalty = clamp(loyal.loyalty + 5);
                    remember(loyal, "致命闪退前夜，他主动守夜追栈，第二天在工位上睡着了。", gameState);
                }
            });
        }

        if (card.id === "g_store_page") {
            const marketer = findEmployee(gameState, emp => emp.archetype === "slash" || emp.trait === "idea");
            if (marketer) out.push({
                text: `${marketer.name} 提议把商店页标题写得更有梗`,
                result: "商店页多了点人味，虽然不那么稳重，但更容易被记住。",
                effect: (p) => {
                    p.design += 7;
                    gameState.fans = Math.max(0, (gameState.fans || 0) + 90);
                    marketer.satisfaction = clamp(marketer.satisfaction + 6);
                    remember(marketer, "商店页截稿时，他给标题加了一点梗，让项目更容易被玩家记住。", gameState);
                }
            });
        }

        if (card.id === "g_feedback_triage") {
            const planner = findEmployee(gameState, emp => emp.archetype === "pragmatic" || emp.specialty === "systems");
            if (planner) out.push({
                text: `${planner.name} 建议按“影响人数 × 修复成本”排优先级`,
                result: "反馈不再像雪崩一样砸下来，团队终于知道先救哪里。",
                effect: (p) => {
                    p.design += 8; p.bugs = Math.max(0, p.bugs - 3);
                    planner.loyalty = clamp(planner.loyalty + 3);
                    remember(planner, "反馈堆满时，他用一张优先级表帮团队稳住了节奏。", gameState);
                }
            });
        }

        return out;
    }

    return { getEmployeeDevCardChoices };
});
