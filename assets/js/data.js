// ==========================================================================
// 游戏静态数据表 (Game Static Data Tables)
// 纯配置数据，无副作用；必须在 simulator.js 之前加载。
// ==========================================================================
        // 游戏数据定义
        const PLATFORMS_DATA = {
            "Mobile": { name: "手机端", cost: 0, scale: 1.0, icon: "fa-solid fa-mobile-screen-button" },
            "TikTok": { name: "抖音小游戏", cost: 5000, scale: 1.3, icon: "fa-brands fa-tiktok" },
            "PC": { name: "Steam商店", cost: 15000, scale: 2.0, icon: "fa-brands fa-steam" },
            "Console": { name: "次时代主机", cost: 40000, scale: 3.5, icon: "fa-solid fa-gamepad" }
        };

        const GENRES_DATA = {
            "Casual": { name: "消除休闲", cost: 0, ratio: { code: 0.3, art: 0.4, design: 0.3 }, icon: "fa-solid fa-shapes" },
            "RPG": { name: "角色扮演", cost: 8000, ratio: { code: 0.4, art: 0.3, design: 0.3 }, icon: "fa-solid fa-dragon" },
            "Roguelike": { name: "动作地牢", cost: 15000, ratio: { code: 0.4, art: 0.2, design: 0.4 }, icon: "fa-solid fa-skull" },
            "Tycoon": { name: "模拟经营", cost: 25000, ratio: { code: 0.3, art: 0.2, design: 0.5 }, icon: "fa-solid fa-chess" }
        };

        const TOPICS_DATA = {
            "Laborer": { name: "打工逆袭", cost: 0, bestGenres: ["Casual", "Tycoon"], icon: "fa-solid fa-user-gear" },
            "Space": { name: "科幻深空", cost: 6000, bestGenres: ["RPG", "Roguelike"], icon: "fa-solid fa-user-astronaut" },
            "Cyberpunk": { name: "赛博都市", cost: 12000, bestGenres: ["RPG", "Roguelike"], icon: "fa-solid fa-mask" },
            "Retro": { name: "像素复古", cost: 18000, bestGenres: ["Casual", "Roguelike"], icon: "fa-solid fa-cubes" }
        };

        // 员工特质定义
        const EMPLOYEE_TRAITS = {
            "none": { name: "无", desc: "没有什么突出的特质", badgeClass: "" },
            "debug": { name: "Debug狂魔", desc: "清除Bug速率+50%", badgeClass: "debug" },
            "idea": { name: "灵感爆棚", desc: "闲置时RP产出效率+50%", badgeClass: "idea" },
            "multi": { name: "全能选手", desc: "精英培训时属性增长加成 1.2 倍", badgeClass: "multi" },
            "salary": { name: "薪水杀手", desc: "能力极强，但每周薪金翻倍", badgeClass: "salary" },
            "lazy": { name: "摸鱼达人", desc: "培训成本减半，但属性增长极随机", badgeClass: "lazy" }
        };

        // ==========================================================================
        // 性格原型：驱动面试剧情与谈薪脾气，独立于能力 trait
        // ==========================================================================
        const EMPLOYEE_ARCHETYPES = {
            fresh: {
                name: "应届热血", desc: "没经验但有冲劲，问东问西。",
                expectMult: 0.85, floorRatio: 0.82, concession: 0.55, walkChance: 0.12, noShowChance: 0, moraleSeed: 85,
                lines: {
                    intro: ["「学长好！我看了你们的游戏，超喜欢的，我一定能行！」", "「虽然我没正式上过班，但我做过三个 game jam！」"],
                    scenarios: [
                        { q: "项目要赶发行，需要连续加几周班，你怎么看？", choices: [
                            { text: "没问题！正想多学点东西", impression: 2, expectAdj: -200, moraleAdj: 5 },
                            { text: "可以，但希望之后能调休", impression: 1, expectAdj: 0, moraleAdj: 0 },
                            { text: "我不太能接受长期加班", impression: -1, expectAdj: 300, moraleAdj: -3 }
                        ]},
                        { q: "如果你的方案被全盘否定，你会？", choices: [
                            { text: "虚心请教问题在哪，立刻改", impression: 2, expectAdj: -150, moraleAdj: 4 },
                            { text: "据理力争，先讲完我的思路", impression: 0, expectAdj: 0, moraleAdj: 0 }
                        ]}
                    ],
                    haggleFirst: ["「这个数……我其实没什么概念，您觉得合适就行！」"],
                    haggleCounter: ["「能再稍微高一点点吗？我想证明自己值这个价。」"],
                    haggleAccept: ["「成交！我明天就能来！谢谢老板！」"],
                    haggleReject: ["「啊……那可能我还没准备好，谢谢您给的机会。」"],
                    onboard: ["新人带着一摞笔记本入职了，眼里全是光。"]
                }
            },
            veteran: {
                name: "大厂老油条", desc: "简历光鲜、爱端着、反过来考你。",
                expectMult: 1.35, floorRatio: 0.88, concession: 0.25, walkChance: 0.30, noShowChance: 0, moraleSeed: 70,
                lines: {
                    intro: ["「我在 X 厂带过 20 人的项目，小工作室……也行吧。」", "「先说好，我不做没意义的 996。」"],
                    scenarios: [
                        { q: "你怎么看我们这种小团队的前景？", choices: [
                            { text: "坦诚讲清楚现状和规划", impression: 2, expectAdj: -400, moraleAdj: 3 },
                            { text: "画个大饼稳住他", impression: -2, expectAdj: 500, moraleAdj: -5 },
                            { text: "反问他能带来什么", impression: 1, expectAdj: 0, moraleAdj: 0 }
                        ]},
                        { q: "他要求一个明显超出预算的工具授权，你？", choices: [
                            { text: "解释预算，提供替代方案", impression: 1, expectAdj: -200, moraleAdj: 0 },
                            { text: "直接答应避免谈崩", impression: -1, expectAdj: 0, moraleAdj: -2 }
                        ]}
                    ],
                    haggleFirst: ["「我的市场价你应该清楚，少了这个数没法谈。」"],
                    haggleCounter: ["「行吧，我让一步，但不能再低了。」"],
                    haggleAccept: ["「成交。希望别让我失望。」"],
                    haggleReject: ["「那没什么好聊的了，告辞。」"],
                    onboard: ["老兵叼着咖啡入职，先把工位 setup 折腾了一上午。"]
                }
            },
            idealist: {
                name: "为爱发电理想党", desc: "只问项目愿景与题材，不太在乎钱。",
                expectMult: 0.80, floorRatio: 0.85, concession: 0.45, walkChance: 0.20, noShowChance: 0, moraleSeed: 88,
                lines: {
                    intro: ["「我不太在意工资，我只想做真正打动人的游戏。」", "「你们下一款，到底想跟玩家说什么？」"],
                    scenarios: [
                        { q: "他问公司最看重商业还是表达，你？", choices: [
                            { text: "诚实地说我们想两者兼顾", impression: 2, expectAdj: -100, moraleAdj: 5 },
                            { text: "迎合他全讲情怀", impression: 0, expectAdj: -300, moraleAdj: 2 },
                            { text: "强调先活下去再谈理想", impression: -2, expectAdj: 200, moraleAdj: -6 }
                        ]},
                        { q: "项目方向可能临时转向纯商业向，他能接受吗？", choices: [
                            { text: "承诺保留一块创作自留地", impression: 2, expectAdj: -150, moraleAdj: 4 },
                            { text: "含糊带过", impression: -1, expectAdj: 100, moraleAdj: -3 }
                        ]}
                    ],
                    haggleFirst: ["「钱够生活就行，但项目方向我得认同。」"],
                    haggleCounter: ["「再低我也不是不行，只要我们做的是对的东西。」"],
                    haggleAccept: ["「好，我加入。让我们做点了不起的吧。」"],
                    haggleReject: ["「抱歉，这不是我想要的地方。」"],
                    onboard: ["理想党入职第一天就贴了一墙概念图。"]
                }
            },
            pragmatic: {
                name: "务实养家型", desc: "稳重，关心稳定性和发薪是否准时。",
                expectMult: 1.0, floorRatio: 0.80, concession: 0.60, walkChance: 0.18, noShowChance: 0, moraleSeed: 75,
                lines: {
                    intro: ["「我家里两个娃，最看重稳定和按时发工资。」", "「活我能干，就想问公司账上稳不稳。」"],
                    scenarios: [
                        { q: "他直接问会不会拖欠工资，你？", choices: [
                            { text: "如实说明现金流并承诺准时", impression: 2, expectAdj: -300, moraleAdj: 4 },
                            { text: "拍胸脯保证绝不可能", impression: 0, expectAdj: 0, moraleAdj: 0 },
                            { text: "含糊其辞", impression: -2, expectAdj: 200, moraleAdj: -5 }
                        ]},
                        { q: "需要他偶尔兼顾不擅长的杂活，他？", choices: [
                            { text: "讲清楚边界与回报", impression: 1, expectAdj: -150, moraleAdj: 2 },
                            { text: "默认他全包", impression: -1, expectAdj: 0, moraleAdj: -2 }
                        ]}
                    ],
                    haggleFirst: ["「这个价我能接受，但请务必按时发。」"],
                    haggleCounter: ["「再压一点也行，稳定比多几百块重要。」"],
                    haggleAccept: ["「那就这么定了，我会踏实干。」"],
                    haggleReject: ["「这价格养不了家，抱歉了。」"],
                    onboard: ["务实型默默搬来一个保温杯，开始稳稳地干活。"]
                }
            },
            slash: {
                name: "斜杠不稳定型", desc: "身兼数职、跳脱，可能放鸽子。",
                expectMult: 1.10, floorRatio: 0.83, concession: 0.40, walkChance: 0.28, noShowChance: 0.18, moraleSeed: 68,
                lines: {
                    intro: ["「我平时还接私活、做播客、玩乐队，时间得灵活点。」", "「哦对，我下午还有个拍摄，咱快点？」"],
                    scenarios: [
                        { q: "你能接受他保留一部分外部项目吗？", choices: [
                            { text: "可以，约定好不影响主线", impression: 2, expectAdj: -200, moraleAdj: 4 },
                            { text: "要求全职专注", impression: -2, expectAdj: 300, moraleAdj: -4 },
                            { text: "睁一只眼闭一只眼", impression: 0, expectAdj: 0, moraleAdj: -1 }
                        ]},
                        { q: "他临时改了面试时间还迟到，你？", choices: [
                            { text: "理解但明确底线", impression: 1, expectAdj: -100, moraleAdj: 0 },
                            { text: "表示无所谓", impression: -1, expectAdj: 100, moraleAdj: -2 }
                        ]}
                    ],
                    haggleFirst: ["「数字嘛……看心情，给个让我有动力的价？」"],
                    haggleCounter: ["「再加点我就不接那个外活了，怎么样？」"],
                    haggleAccept: ["「成交成交，我先闪了啊！」"],
                    haggleReject: ["「算了算了，缘分没到，拜拜～」"],
                    onboard: ["斜杠青年入职，工位上很快堆满了不相干的设备。"]
                }
            },
            lazy: {
                name: "躺平摆烂型", desc: "兴趣缺缺、面试敷衍。",
                expectMult: 0.78, floorRatio: 0.90, concession: 0.50, walkChance: 0.10, noShowChance: 0, moraleSeed: 55,
                lines: {
                    intro: ["「面试问这么多干嘛……能干活就行了吧。」", "「钱不用太多，别太累就好。」"],
                    scenarios: [
                        { q: "问他职业规划，他？", choices: [
                            { text: "你引导他找到一点兴趣点", impression: 2, expectAdj: -100, moraleAdj: 8 },
                            { text: "随便聊聊就过", impression: 0, expectAdj: 0, moraleAdj: 0 },
                            { text: "当场点破他在摸鱼", impression: -2, expectAdj: 200, moraleAdj: -6 }
                        ]},
                        { q: "他问能不能不加班，你？", choices: [
                            { text: "承诺合理工时换稳定产出", impression: 1, expectAdj: -50, moraleAdj: 6 },
                            { text: "强调本公司常加班", impression: -1, expectAdj: 150, moraleAdj: -8 }
                        ]}
                    ],
                    haggleFirst: ["「随便给点就行，别指望我拼命。」"],
                    haggleCounter: ["「嗯……再少点我也无所谓，反正都那样。」"],
                    haggleAccept: ["「行吧，那我来上班咯。」"],
                    haggleReject: ["「太麻烦了，不来了。」"],
                    onboard: ["摆烂型入职，第一件事是研究椅子能不能躺平。"]
                }
            }
        };

        const RANDOM_NAMES = ["张三", "李四", "王五", "小智", "阿伟", "老陈", "阿强", "小美", "大壮", "阿龙", "小华", "杰森"];

        // ==========================================================================
        // 创始人背景（开局选择，决定整个周目的玩法风格）
        // reincarnationOnly: 仅在破产转生后可选
        // ==========================================================================
        const FOUNDER_BACKGROUNDS = {
            "coder": {
                name: "代码天才",
                icon: "fa-solid fa-laptop-code",
                color: "var(--accent-neon)",
                role: "programmer",
                stats: { code: 22, art: 6, design: 12 },
                desc: "亲自参与研发，自身代码产出 +30%。修复 Bug 时常获得灵感，额外补充少量代码点数。",
                reincarnationOnly: false
            },
            "artist": {
                name: "艺术大师",
                icon: "fa-solid fa-palette",
                color: "var(--accent-pink)",
                role: "artist",
                stats: { code: 6, art: 22, design: 12 },
                desc: "亲自参与研发，自身美术产出 +30%，所有项目基础评分 +5%。",
                reincarnationOnly: false
            },
            "influencer": {
                name: "网红制作人",
                icon: "fa-solid fa-tower-broadcast",
                color: "var(--accent-yellow)",
                role: "designer",
                stats: { code: 8, art: 10, design: 18 },
                desc: "不直接参与研发，但初始粉丝 +500，游戏发行时粉丝增长 +20%。",
                reincarnationOnly: false
            },
            "veteran": {
                name: "破产老兵",
                icon: "fa-solid fa-user-shield",
                color: "var(--accent-purple)",
                role: "designer",
                stats: { code: 12, art: 12, design: 16 },
                desc: "仅限转生可选。所有资金消耗 -10%，更易发现市场趋势红利。",
                reincarnationOnly: true
            }
        };

        // ==========================================================================
        // 创始人专长树 (Founder Talent Tree)
        // 创始人通过主导（发行主项目）获得经验升级，每级 1 专长点，可投入四条分支。
        // ==========================================================================
        const FOUNDER_TALENT_MAX = 3; // 每条分支最高等级
        const FOUNDER_TALENTS = {
            "management": {
                name: "项目管理", icon: "fa-solid fa-diagram-project", color: "var(--accent-neon)",
                type: "被动",
                desc: "精通研发节奏，团队研发产出更高；满级额外解锁 1 个并行辅助项目槽位。",
                levelDesc: lv => `研发产出 +${lv * 8}%` + (lv >= FOUNDER_TALENT_MAX ? "，并行槽位 +1" : "")
            },
            "leadership": {
                name: "领袖魅力", icon: "fa-solid fa-handshake-angle", color: "var(--accent-yellow)",
                type: "被动",
                desc: "个人魅力降低招聘与刷新成本，并提升高端人才（SSR）出现概率。",
                levelDesc: lv => `招聘成本 -${lv * 10}%，SSR 概率 +${lv * 3}%`
            },
            "creative": {
                name: "创意激发", icon: "fa-solid fa-wand-magic-sparkles", color: "var(--accent-pink)",
                type: "主动",
                desc: "主动技能：激活后下一款发行作品获得评分加成（冷却随等级缩短）。",
                levelDesc: lv => `下作评分 +${5 + lv * 3}%，冷却 ${Math.max(4, 16 - lv * 3)} 周`
            },
            "business": {
                name: "商业嗅觉", icon: "fa-solid fa-chart-line", color: "var(--accent-purple)",
                type: "被动",
                desc: "提前预知下季市场趋势，并在发行分成谈判中占据优势（保留更多营收）。",
                levelDesc: lv => `趋势预测解锁，发行分成 +${lv * 5}%`
            }
        };

        // ==========================================================================
        // 平台信誉与淘汰 (Platform Reputation)
        // 在某平台连续发布低分作品会拉低该平台信誉：降低营收、甚至被高端平台拒绝合作。
        // premium 平台信誉过低会被锁定立项，需靠时间回暖或在其它平台积累口碑后恢复。
        // ==========================================================================
        const PLATFORM_REP_CONFIG = {
            "Mobile":  { start: 60, premium: false, lockThreshold: 0 },
            "TikTok":  { start: 55, premium: false, lockThreshold: 0 },
            "PC":      { start: 50, premium: true,  lockThreshold: 28 },
            "Console": { start: 45, premium: true,  lockThreshold: 34 }
        };

        // ==========================================================================
        // 公司发展阶段 (Company Stages)
        // 按累计发布数 / 粉丝 / 资金里程碑自动晋级，每阶段提升工位上限、基础士气与效率。
        // require: 晋级到「下一阶段」需要满足的门槛（达到本阶段后用 next 的 require 判定）。
        // ==========================================================================
        const COMPANY_STAGES = [
            {
                key: "garage", name: "独立作坊", icon: "fa-solid fa-house-chimney-window", color: "var(--text-secondary)",
                desc: "创始人亲力亲为，活下来并发布第一款游戏。",
                slotCap: 3, moraleBonus: 0, efficiencyBonus: 0,
                require: { releases: 0, fans: 0, funds: 0 }
            },
            {
                key: "studio", name: "新生工作室", icon: "fa-solid fa-people-group", color: "var(--accent-neon)",
                desc: "小团队分工协作，开始打磨现金流与人员配置。",
                slotCap: 5, moraleBonus: 4, efficiencyBonus: 0.04,
                require: { releases: 1, fans: 2000, funds: 0 }
            },
            {
                key: "company", name: "正规化企业", icon: "fa-solid fa-building", color: "var(--accent-yellow)",
                desc: "品牌效应显现，团队规模与口碑商业并重。",
                slotCap: 7, moraleBonus: 7, efficiencyBonus: 0.07,
                require: { releases: 4, fans: 15000, funds: 0 }
            },
            {
                key: "titan", name: "行业巨头", icon: "fa-solid fa-crown", color: "var(--accent-pink)",
                desc: "拥有市场话语权，一举一动都能影响行业风向。",
                slotCap: 8, moraleBonus: 10, efficiencyBonus: 0.10,
                require: { releases: 10, fans: 60000, funds: 200000 }
            }
        ];

        // ==========================================================================
        // 开发卡牌池 (Development Cards)
        // 研发期每阶段抽 3 张选 1，每张是一段开发手记 + 2~3 个会塑造游戏命运的抉择。
        // genre: "any" 通用，或限定某类型；phase: early/mid/late/any；weeks: 推进周数。
        // effect(proj) 直接改写项目属性（code/art/design/bugs）与团队状态。
        // ==========================================================================
        const DEV_CARDS = [
            // ── 通用 · 早期 ──
            {
                id: "g_dawn", title: "凌晨三点的神秘力量", genre: "any", phase: "early", weeks: 2,
                story: "主程发现一个诡异 Bug：它会让所有角色头发变成胡萝卜，但顺带让性能提升了 40%。要不要留着它？",
                choices: [
                    { text: "做成隐藏彩蛋，玩家会爱死", result: "“胡萝卜头”后来成了社区表情包，意外出圈。", effect: (p) => { p.art += 18; p.design += 14; p.bugs += 2; } },
                    { text: "老实修掉，专业第一", result: "团队保住了体面，性能优化也吃到了。", effect: (p) => { p.code += 24; } }
                ]
            },
            {
                id: "g_streamer", title: "那个知名主播", genre: "any", phase: "early", weeks: 1,
                story: "一位毒舌大主播想提前试玩你们半成品。热度诱人，但翻车风险也不小。",
                choices: [
                    { text: "欢迎试玩，好的坏的都是热度", result: "直播间炸了——一半人骂一半人催更，粉丝涨了。", effect: (p) => { gameState.fans += 300; p.design += 6; } },
                    { text: "婉拒，我们还要打磨", result: "团队松了口气，安静地把核心做扎实。", effect: (p) => { p.code += 10; p.design += 10; } }
                ]
            },
            {
                id: "g_artref", title: "美术找到神级参考", genre: "any", phase: "early", weeks: 2,
                story: "主美在 ArtStation 刷到一组惊艳参考，临摹升级能让视觉拉满，但要占用排期。",
                choices: [
                    { text: "全力临摹升级，视觉拉满", result: "第一眼吸引力直接翻倍。", effect: (p) => { p.art += 26; } },
                    { text: "保持风格统一，稳步推进", result: "稳，但不惊艳。", effect: (p) => { p.art += 10; p.design += 8; } }
                ]
            },
            {
                id: "g_core_loop", title: "核心循环定稿", genre: "any", phase: "early", weeks: 1,
                story: "项目刚开工，团队需要先回答一个朴素问题：玩家每 30 秒到底在重复什么乐趣？",
                choices: [
                    { text: "先做一个可玩的最小原型", result: "方向变清楚了，后面的取舍都有了依据。", effect: (p) => { p.design += 14; p.code += 8; } },
                    { text: "先把完整设计文档写透", result: "设想更完整，但落到手感上还要继续验证。", effect: (p) => { p.design += 18; } }
                ]
            },
            {
                id: "g_input_feel", title: "第一版手感试做", genre: "any", phase: "early", weeks: 1,
                story: "程序把角色移动、点击反馈或镜头跟随拼出了第一版。它能跑，但还谈不上顺手。",
                choices: [
                    { text: "先调到顺手，再扩内容", result: "基础手感稳了，后续内容不容易返工。", effect: (p) => { p.code += 10; p.design += 10; } },
                    { text: "先铺内容框架，手感后面统一调", result: "框架搭得更快，但后续可能要集中返修。", effect: (p) => { p.code += 14; p.bugs += 1; } }
                ]
            },
            {
                id: "g_placeholder_assets", title: "临时素材方案", genre: "any", phase: "early", weeks: 1,
                story: "现在还没有正式美术资源。是用方块和占位图快速验证玩法，还是先定一版视觉基调？",
                choices: [
                    { text: "占位素材先跑通玩法", result: "验证速度很快，但画面暂时很毛坯。", effect: (p) => { p.code += 8; p.design += 12; } },
                    { text: "先做一张品质标杆图", result: "团队知道最终要长什么样了。", effect: (p) => { p.art += 16; } }
                ]
            },
            {
                id: "g_risk_register", title: "风险清单第一次复盘", genre: "any", phase: "early", weeks: 1,
                story: "项目刚起步，几个不确定点已经冒头：技术可行性、内容量、上线窗口。你要先把风险写清楚吗？",
                choices: [
                    { text: "列风险清单，逐项拆解", result: "团队知道哪些地方不能赌运气。", effect: (p) => { p.design += 10; p.code += 6; p.bugs = Math.max(0, p.bugs - 1); } },
                    { text: "边做边看，先别开会", result: "推进更快，但隐患还藏在角落。", effect: (p) => { p.code += 10; p.art += 6; p.bugs += 1; } }
                ]
            },
            {
                id: "g_vertical_slice", title: "垂直切片取舍", genre: "any", phase: "early", weeks: 2,
                story: "要做一个能代表最终品质的小关卡，还是先铺完整框架？两种路线都会影响后续节奏。",
                choices: [
                    { text: "先做高品质垂直切片", result: "项目目标变得非常具体。", effect: (p) => { p.art += 12; p.design += 14; } },
                    { text: "先打通完整流程", result: "整体链路跑通了，后续填内容更安心。", effect: (p) => { p.code += 14; p.design += 8; } }
                ]
            },
            // ── 通用 · 中期 ──
            {
                id: "g_coupling", title: "代码耦合度告急", genre: "any", phase: "mid", weeks: 2,
                story: "代码审查发现模块耦合到了危险程度，再不处理后期维护就是噩梦。",
                choices: [
                    { text: "立即重构，长痛不如短痛", result: "技术底座稳了。", effect: (p) => { p.code += 22; p.bugs = Math.max(0, p.bugs - 1); } },
                    { text: "写个 TODO 先跑起来", result: "技术债悄悄堆积……", effect: (p) => { p.bugs += 5; p.design += 6; } }
                ]
            },
            {
                id: "g_sdk", title: "第三方SDK突然停服", genre: "any", phase: "mid", weeks: 2,
                story: "依赖的一个 SDK 宣布停止维护。自研替代彻底但慢，找替代品快但有坑。",
                choices: [
                    { text: "自研替代方案，彻底解决", result: "技术自主可控。", effect: (p) => { p.code += 25; } },
                    { text: "找替代品应急，先顶上", result: "顶是顶住了，埋了几个雷。", effect: (p) => { p.bugs += 3; p.design += 4; } }
                ]
            },
            {
                id: "g_morale", title: "团队士气高涨", genre: "any", phase: "mid", weeks: 1,
                story: "团队状态正好，是趁热打铁冲刺，还是借机团建恢复精力？",
                choices: [
                    { text: "趁热打铁，全力冲刺", result: "产出爆表，但人也累了。", effect: (p) => { p.code += 10; p.art += 10; p.design += 10; gameState.employees.forEach(e => e.fatigue = Math.min(100, (e.fatigue || 0) + 10)); } },
                    { text: "放假团建，恢复精力", result: "回来后人人满血。", effect: (p) => { gameState.employees.forEach(e => { e.fatigue = Math.max(0, (e.fatigue || 0) - 20); e.morale = Math.min(100, (e.morale == null ? 75 : e.morale) + 15); }); } }
                ]
            },
            {
                id: "g_save_system", title: "存档方案争论", genre: "any", phase: "mid", weeks: 1,
                story: "自动存档、云同步、检查点回滚，听起来都是基础功能，但做不好就会毁掉玩家信任。",
                choices: [
                    { text: "补完整存档保护", result: "基础体验稳了许多。", effect: (p) => { p.code += 16; p.bugs = Math.max(0, p.bugs - 2); } },
                    { text: "先做本地存档够用", result: "节省了时间，但边界情况还要小心。", effect: (p) => { p.code += 8; p.design += 6; p.bugs += 1; } }
                ]
            },
            {
                id: "g_tutorial_pass", title: "新手引导补课", genre: "any", phase: "mid", weeks: 1,
                story: "内部试玩时，大家第二分钟就开始问同一个问题：我现在该干什么？",
                choices: [
                    { text: "重做前三分钟引导", result: "玩家更快进入状态。", effect: (p) => { p.design += 16; p.art += 4; } },
                    { text: "加提示文本快速解决", result: "能看懂了，但有点生硬。", effect: (p) => { p.design += 8; p.code += 6; } }
                ]
            },
            // ── 通用 · 后期 ──
            {
                id: "g_perf", title: "底层性能瓶颈暴露", genre: "any", phase: "late", weeks: 2,
                story: "程序发现当前实现会在低端机卡顿。现在重构变慢，但发布后口碑更稳。",
                choices: [
                    { text: "马上重构，别让口碑死在卡顿上", result: "口碑保住了。", effect: (p) => { p.code += 22; p.bugs = Math.max(0, p.bugs - 3); } },
                    { text: "先上线，性能问题以后热更", result: "赌一把……", effect: (p) => { p.bugs += 3; p.design += 6; } }
                ]
            },
            {
                id: "g_crash", title: "发现致命闪退Bug", genre: "any", phase: "late", weeks: 1,
                story: "QA 在最终测试发现一个会导致闪退的致命 Bug！",
                choices: [
                    { text: "全员加班修复，绝不带病上线", result: "通宵换来干净的版本。", effect: (p) => { p.bugs = Math.max(0, p.bugs - 8); gameState.employees.forEach(e => e.fatigue = Math.min(100, (e.fatigue || 0) + 18)); } },
                    { text: "先标记，上线后热修", result: "带着隐患冲线，评分将受罚。", effect: (p) => { p.rushPenalty = true; } }
                ]
            },
            {
                id: "g_scope_lock", title: "功能范围冻结会", genre: "any", phase: "mid", weeks: 1,
                story: "看板上堆满了“顺手加一下”的小需求。制作人提醒：再不冻结范围，后期测试会被拖垮。",
                choices: [
                    { text: "砍掉低优先级功能，保住主循环", result: "版本边界清楚了，团队推进明显顺畅。", effect: (p) => { p.design += 12; p.code += 8; p.bugs = Math.max(0, p.bugs - 1); } },
                    { text: "保留创意清单，做出差异化", result: "亮点多了，但接口和配置也更复杂。", effect: (p) => { p.design += 20; p.bugs += 3; } }
                ]
            },
            {
                id: "g_playtest_notes", title: "小范围可玩性测试", genre: "any", phase: "mid", weeks: 1,
                story: "十几名真实玩家试玩了 30 分钟，反馈集中在“新手引导不清”和“前五分钟不够爽”。",
                choices: [
                    { text: "按反馈重排前期体验", result: "玩家更快理解了乐趣在哪里。", effect: (p) => { p.design += 18; p.art += 4; } },
                    { text: "只修最明显的问题，保持进度", result: "核心没乱，但一些细节暂时留下了。", effect: (p) => { p.code += 8; p.design += 6; p.bugs = Math.max(0, p.bugs - 1); } }
                ]
            },
            {
                id: "g_build_pipeline", title: "自动打包脚本罢工", genre: "any", phase: "mid", weeks: 1,
                story: "每次出测试包都要人工点十几个步骤，今天还把旧资源打进了新包。继续手动会越来越危险。",
                choices: [
                    { text: "花一天整理流水线", result: "后续测试包稳定多了。", effect: (p) => { p.code += 14; p.bugs = Math.max(0, p.bugs - 2); } },
                    { text: "先人工盯住，别耽误内容开发", result: "内容继续往前走，但发布流程还是悬着。", effect: (p) => { p.design += 8; p.art += 6; p.bugs += 2; } }
                ]
            },
            {
                id: "g_store_page", title: "商店页素材截稿", genre: "any", phase: "late", weeks: 1,
                story: "上线前要交商店页截图、短视频和一句话卖点。素材能不能讲清游戏，直接影响首批玩家点不点进来。",
                choices: [
                    { text: "重剪演示，突出真实玩法", result: "卖点更清楚，愿望单和关注都涨了。", effect: (p) => { p.art += 10; p.design += 8; gameState.fans += 120; } },
                    { text: "用现有素材快速过审", result: "赶上档期，但第一印象比较普通。", effect: (p) => { p.code += 6; p.art += 4; } }
                ]
            },
            {
                id: "g_compat_matrix", title: "兼容性清单拉响警报", genre: "any", phase: "late", weeks: 1,
                story: "低配设备、宽屏比例和旧显卡驱动各冒出一批问题。它们不酷，但会决定玩家能不能顺利玩上。",
                choices: [
                    { text: "集中修兼容性，减少首日翻车", result: "看不见的质量提升，最能保住口碑。", effect: (p) => { p.code += 16; p.bugs = Math.max(0, p.bugs - 3); } },
                    { text: "优先照顾主流设备", result: "大多数玩家没问题，少数边缘环境只能后续补。", effect: (p) => { p.art += 8; p.design += 6; p.bugs += 1; } }
                ]
            },
            {
                id: "g_release_checklist", title: "上线清单逐项打勾", genre: "any", phase: "late", weeks: 1,
                story: "商店描述、年龄分级、隐私协议、崩溃日志、客服邮箱，全都不性感，但缺一项就可能卡上线。",
                choices: [
                    { text: "按清单逐项验收", result: "发布流程稳稳落地。", effect: (p) => { p.code += 8; p.design += 8; p.bugs = Math.max(0, p.bugs - 2); } },
                    { text: "先处理平台硬性要求", result: "能过审，但发布后运营压力会大一些。", effect: (p) => { p.design += 8; p.bugs += 1; } }
                ]
            },
            {
                id: "g_feedback_triage", title: "反馈优先级分诊", genre: "any", phase: "late", weeks: 1,
                story: "测试反馈堆成了墙：有人要新内容，有人要修手感，有人要改 UI。全都做一定会炸。",
                choices: [
                    { text: "只修高频痛点", result: "版本收敛得更干净。", effect: (p) => { p.design += 10; p.bugs = Math.max(0, p.bugs - 2); } },
                    { text: "挑几个高呼声需求加进去", result: "玩家会惊喜，但版本风险上升。", effect: (p) => { p.design += 14; gameState.fans += 60; p.bugs += 2; } }
                ]
            },
            // ── 消除休闲（轻松幽默）──
            {
                id: "c_cat", title: "猫猫元素的胜利", genre: "Casual", phase: "any", weeks: 1,
                story: "玩家测试里没人关心你的玩法，所有人都在问：能不能多放点猫？",
                choices: [
                    { text: "顺应民意，全屏都是猫", result: "可爱即正义，留存暴涨。", effect: (p) => { p.art += 16; gameState.fans += 200; } },
                    { text: "坚持玩法深度，猫只是点缀", result: "硬核玩家点头，路人略失望。", effect: (p) => { p.design += 18; } }
                ]
            },
            {
                id: "c_juice", title: "多巴胺特效之争", genre: "Casual", phase: "mid", weeks: 1,
                story: "策划想给每次消除都加上夸张的爆炸、闪光和音效，主程担心太吵。",
                choices: [
                    { text: "爽就完事了，特效拉满", result: "“一消除就上头”成了卖点。", effect: (p) => { p.art += 14; p.design += 10; p.bugs += 1; } },
                    { text: "克制设计，保持清爽", result: "长线玩家更舒服。", effect: (p) => { p.design += 14; } }
                ]
            },
            {
                id: "c_retention_curve", title: "次日留存曲线下滑", genre: "Casual", phase: "late", weeks: 1,
                story: "数据看板显示，不少玩家在第 7 关前流失。关卡太平，奖励节奏也不够明确。",
                choices: [
                    { text: "重排前十关节奏", result: "新手期更顺，玩家愿意多玩几局。", effect: (p) => { p.design += 18; gameState.fans += 80; } },
                    { text: "加每日奖励先稳住", result: "短期数据好看了一些，但系统复杂度上来了。", effect: (p) => { p.design += 10; p.bugs += 1; } }
                ]
            },
            {
                id: "c_level_batch", title: "关卡批量生产", genre: "Casual", phase: "mid", weeks: 1,
                story: "核心玩法跑通后，内容量成了问题。是用模板批量出关，还是慢慢雕每一关？",
                choices: [
                    { text: "做关卡模板批量扩充", result: "内容量迅速补上来了。", effect: (p) => { p.design += 12; p.code += 8; } },
                    { text: "手工打磨关键关卡", result: "少而精，前期体验更扎实。", effect: (p) => { p.design += 16; p.art += 4; } }
                ]
            },
            {
                id: "c_ad_placement", title: "广告点位边界", genre: "Casual", phase: "late", weeks: 1,
                story: "休闲游戏需要商业化，但广告插得太狠会毁掉节奏。团队要定下底线。",
                choices: [
                    { text: "控制广告频率，保留体验", result: "口碑更稳，长期留存更健康。", effect: (p) => { p.design += 14; gameState.fans += 80; } },
                    { text: "多给激励广告入口", result: "商业化空间更大，但界面更拥挤。", effect: (p) => { p.design += 8; p.bugs += 1; } }
                ]
            },
            // ── 角色扮演RPG（宏大叙事）──
            {
                id: "r_npc", title: "剧情杀了我的NPC", genre: "RPG", phase: "mid", weeks: 2,
                story: "编剧写到一个关键 NPC 必须死，但内测玩家集体请愿保下他。你要尊重剧本，还是尊重玩家？",
                choices: [
                    { text: "尊重叙事，该死的角色就得死", result: "争议巨大，但故事的重量留下了。", effect: (p) => { p.design += 24; gameState.fans += 100; } },
                    { text: "加一条支线，让玩家拯救他", result: "皆大欢喜，但工期吃紧。", effect: (p) => { p.design += 14; p.bugs += 2; } }
                ]
            },
            {
                id: "r_world", title: "世界观膨胀危机", genre: "RPG", phase: "early", weeks: 2,
                story: "世界观设定文档已经写到 200 页，编剧还在停不下来。是收束还是放飞？",
                choices: [
                    { text: "收束聚焦，做深一条主线", result: "故事密度极高。", effect: (p) => { p.design += 22; } },
                    { text: "放飞自我，构建史诗宇宙", result: "宏大但有点散。", effect: (p) => { p.design += 12; p.art += 10; p.bugs += 2; } }
                ]
            },
            {
                id: "r_quest_flags", title: "任务旗标互相打架", genre: "RPG", phase: "late", weeks: 1,
                story: "QA 发现玩家如果先救村长再偷档案，会把主线 NPC 卡成两种状态。分支越多，组合爆炸越真实。",
                choices: [
                    { text: "补状态机和回归测试", result: "复杂剧情终于稳住了。", effect: (p) => { p.code += 14; p.design += 8; p.bugs = Math.max(0, p.bugs - 3); } },
                    { text: "锁掉少见路径，保证主线可通", result: "主线稳了，但自由度缩水。", effect: (p) => { p.code += 8; p.bugs = Math.max(0, p.bugs - 1); } }
                ]
            },
            {
                id: "r_dialogue_pass", title: "对白口吻统一", genre: "RPG", phase: "mid", weeks: 1,
                story: "同一个角色前后像两个人写的：一会儿冷酷，一会儿吐槽。玩家很容易出戏。",
                choices: [
                    { text: "统一角色语气表", result: "角色更可信，剧情读起来顺了。", effect: (p) => { p.design += 16; } },
                    { text: "只改主线关键对白", result: "主线观感保住了，支线先放一放。", effect: (p) => { p.design += 10; p.code += 4; } }
                ]
            },
            {
                id: "r_combat_pacing", title: "战斗节奏拖沓", genre: "RPG", phase: "late", weeks: 1,
                story: "测试玩家反馈普通战斗太长，剧情还没推进就先被小怪耗累了。",
                choices: [
                    { text: "缩短杂兵战，强化精英战", result: "节奏紧凑了，战斗重点更清晰。", effect: (p) => { p.design += 18; } },
                    { text: "增加自动战斗选项", result: "便利性提升，但系统复杂了一点。", effect: (p) => { p.code += 10; p.design += 8; p.bugs += 1; } }
                ]
            },
            // ── 动作地牢Roguelike（随机性 / 数据崩坏）──
            {
                id: "k_weapon", title: "这把武器强到不合理", genre: "Roguelike", phase: "mid", weeks: 1,
                story: "一把低级武器因为算法错误，伤害直接爆炸，内测玩家管它叫“神之锈剑”。",
                choices: [
                    { text: "保留它，做成都市传说", result: "“锈剑信仰”成了社区图腾。", effect: (p) => { p.design += 18; gameState.fans += 250; } },
                    { text: "修正数值，维护平衡", result: "平衡党满意了。", effect: (p) => { p.code += 18; p.bugs = Math.max(0, p.bugs - 1); } }
                ]
            },
            {
                id: "k_seed", title: "种子崩坏事件", genre: "Roguelike", phase: "late", weeks: 2,
                story: "随机地牢生成器偶尔会吐出无法通关的死局。是彻底重写生成算法，还是加个保底？",
                choices: [
                    { text: "重写生成器，根除死局", result: "随机性终于可靠了。", effect: (p) => { p.code += 24; p.bugs = Math.max(0, p.bugs - 3); } },
                    { text: "加个保底救济，先上线", result: "治标，但能跑。", effect: (p) => { p.bugs += 2; p.design += 6; } }
                ]
            },
            {
                id: "k_meta_progress", title: "局外成长被质疑太肝", genre: "Roguelike", phase: "late", weeks: 1,
                story: "核心玩家喜欢挑战，但普通玩家抱怨解锁太慢。成长曲线如果调不好，会让失败显得像浪费时间。",
                choices: [
                    { text: "压缩前期解锁，保留后期深度", result: "失败仍有收获，节奏轻快很多。", effect: (p) => { p.design += 18; } },
                    { text: "坚持硬核门槛", result: "核心味更足，但劝退风险也更高。", effect: (p) => { p.design += 10; gameState.fans += 60; } }
                ]
            },
            {
                id: "k_room_readability", title: "房间可读性不足", genre: "Roguelike", phase: "mid", weeks: 1,
                story: "怪物、陷阱、掉落和特效挤在一起，玩家经常看不清自己是怎么死的。",
                choices: [
                    { text: "重做视觉优先级", result: "战斗信息清楚多了。", effect: (p) => { p.art += 10; p.design += 12; } },
                    { text: "降低特效密度", result: "画面安静了，但爽感也少了一点。", effect: (p) => { p.code += 8; p.design += 8; } }
                ]
            },
            {
                id: "k_boss_pattern", title: "首领招式太随机", genre: "Roguelike", phase: "late", weeks: 1,
                story: "Boss 难是难，但玩家觉得输得不明不白。随机性需要边界。",
                choices: [
                    { text: "给招式加节奏提示", result: "失败更像学习，而不是被坑。", effect: (p) => { p.design += 16; p.art += 6; } },
                    { text: "保留混乱压迫感", result: "高压感更强，但争议也会更大。", effect: (p) => { p.design += 12; gameState.fans += 50; p.bugs += 1; } }
                ]
            },
            // ── 模拟经营Tycoon（系统钩稽 / 经济循环）──
            {
                id: "t_exploit", title: "无限刷钱漏洞", genre: "Tycoon", phase: "mid", weeks: 2,
                story: "玩家发现一套操作能让鱼价变成负数，从而无限刷钱。经济系统正在崩塌。",
                choices: [
                    { text: "连夜堵漏，重做定价模型", result: "经济系统稳住了。", effect: (p) => { p.code += 16; p.design += 12; } },
                    { text: "将错就错，做成隐藏玩法", result: "“负价鱼塘”竟成了名梗。", effect: (p) => { p.design += 16; gameState.fans += 200; p.bugs += 2; } }
                ]
            },
            {
                id: "t_balance", title: "数值膨胀失控", genre: "Tycoon", phase: "late", weeks: 2,
                story: "后期产值指数级膨胀，玩家两小时就能买下整张地图，毫无挑战。",
                choices: [
                    { text: "引入通胀与税收曲线", result: "长线深度立刻拉满。", effect: (p) => { p.design += 22; } },
                    { text: "简单封顶了事", result: "能用，但略糙。", effect: (p) => { p.design += 8; p.bugs += 1; } }
                ]
            },
            {
                id: "t_telemetry_gap", title: "运营数据埋点缺口", genre: "Tycoon", phase: "mid", weeks: 1,
                story: "模拟经营的系统很多，但你们还看不清玩家卡在哪一步。没有埋点，后续调参只能靠感觉。",
                choices: [
                    { text: "补关键埋点和调参面板", result: "团队终于能用数据看见经济循环。", effect: (p) => { p.code += 10; p.design += 14; } },
                    { text: "先靠测试反馈调", result: "节省了开发时间，但问题定位仍然模糊。", effect: (p) => { p.design += 10; p.bugs += 1; } }
                ]
            },
            {
                id: "t_ui_density", title: "信息密度过载", genre: "Tycoon", phase: "mid", weeks: 1,
                story: "面板越来越多，玩家打开菜单像在看财务报表。系统深度需要更好的呈现方式。",
                choices: [
                    { text: "重排仪表盘层级", result: "复杂系统终于变得可读。", effect: (p) => { p.design += 16; p.art += 6; } },
                    { text: "保留专业感，减少弹窗", result: "硬核玩家喜欢，但新手压力仍在。", effect: (p) => { p.design += 10; p.code += 6; } }
                ]
            },
            {
                id: "t_endgame_goal", title: "后期目标缺口", genre: "Tycoon", phase: "late", weeks: 1,
                story: "玩家已经赚钱了，但不知道接下来该追什么。经营游戏最怕后期只剩数字变大。",
                choices: [
                    { text: "加入长期里程碑目标", result: "后期有了明确追求。", effect: (p) => { p.design += 18; } },
                    { text: "开放沙盒自定义规则", result: "自由度提升，但调试成本也上来了。", effect: (p) => { p.code += 10; p.design += 10; p.bugs += 1; } }
                ]
            }
        ];
