// ==========================================================================
// 员工生态事件内容库
// 仅放数据：新增员工特质事件时追加对象即可，条件/效果由 event-engine 解释。
// ==========================================================================
const EMPLOYEE_ECOSYSTEM_EVENTS = [
    {
        id: "trait_debug_night_fix",
        category: "trait_debug",
        weight: 9,
        cond: { hasTrait: "debug", projectState: "developing" },
        targetTrait: "debug",
        title: "{target} 深夜盯上了顽固闪退",
        desc: "{target} 坚称这个 Bug 不修掉今晚睡不着。屏幕上的日志刷得像瀑布，整个工位区只剩键盘声。",
        choices: [
            {
                text: "给他点咖啡预算，让他把坑填了",
                effects: { funds: -600, project: { bugs: -5, code: 6 }, targetFatigue: 12, targetLoyalty: 4, targetSatisfaction: 6, targetMemory: "你支持他深夜追查顽固闪退，他修完后把日志截图珍藏了起来。" },
                feedback: "闪退被按住了，代码库也干净了一截。"
            },
            {
                text: "先叫停，状态比 Bug 更重要",
                effects: { targetFatigue: -18, targetSatisfaction: -3, targetMemory: "你把他从深夜 Debug 中拎回去休息，他嘴上不服，第二天精神好了很多。" },
                feedback: "Bug 还在，但人没有被熬坏。"
            }
        ]
    },
    {
        id: "trait_debug_blog",
        category: "trait_debug",
        weight: 5,
        cond: { hasTrait: "debug", minSatisfaction: 72 },
        targetTrait: "debug",
        title: "{target} 发了篇技术复盘",
        desc: "{target} 把最近踩过的坑写成了文章，没想到在开发者圈子里被转发了。",
        choices: [
            {
                text: "转发到工作室账号，顺便招揽同好",
                effects: { rp: 4, fans: 80, targetSatisfaction: 8, targetLoyalty: 2, targetMemory: "他的技术复盘被工作室公开转发，第一次感到自己的专业被认真看见。" },
                feedback: "懂行的人开始注意到这间小工作室。"
            },
            {
                text: "低调收藏，内部沉淀成规范",
                effects: { rp: 6, targetSatisfaction: 3, targetMemory: "他的复盘被整理进团队规范，成了新人必读材料。" },
                feedback: "没有赚到热度，但团队少踩了很多坑。"
            }
        ]
    },
    {
        id: "trait_lazy_side_game",
        category: "trait_lazy",
        weight: 8,
        cond: { hasTrait: "lazy", maxSatisfaction: 58 },
        targetTrait: "lazy",
        title: "{target} 的窗口切得有点快",
        desc: "你路过时，{target} 的屏幕从一个小游戏界面瞬间切回了工作文档。气氛沉默了两秒。",
        choices: [
            {
                text: "睁只眼闭只眼，让他缓口气",
                effects: { targetFatigue: -18, targetSatisfaction: 14, targetLoyalty: 2, targetMemory: "你默许了他短暂摸鱼，他之后反而主动补回了几个小任务。" },
                feedback: "他像是被放过一马，状态肉眼可见地松弛下来。"
            },
            {
                text: "轻轻敲打，别把节奏带歪",
                effects: { targetSatisfaction: -8, targetLoyalty: -2, moraleAll: -1, targetMemory: "你提醒他收起摸鱼窗口，他表面点头，之后安静了不少。" },
                feedback: "纪律回来了，但空气也冷了一点。"
            }
        ]
    },
    {
        id: "trait_lazy_marketing_flash",
        category: "trait_lazy",
        weight: 5,
        cond: { hasTrait: "lazy" },
        targetTrait: "lazy",
        title: "{target} 摸出了一个宣传点子",
        desc: "{target} 神秘兮兮地说，刚才放空时想到一个很好传播的小梗，成本不高，可以试试。",
        choices: [
            {
                text: "给他一笔小预算验证",
                effects: { funds: -500, fans: 110, satisfactionAll: 2, targetSatisfaction: 8, targetMemory: "他在一次放空里想出的宣传梗真的涨了粉，从此摸鱼更理直气壮。" },
                feedback: "点子有点歪，但传播效果意外不错。"
            },
            {
                text: "先记进素材库，别打断正事",
                effects: { rp: 2, targetSatisfaction: -2 },
                feedback: "想法被收下了，只是没立刻点燃。"
            }
        ]
    },
    {
        id: "trait_idea_whiteboard",
        category: "trait_idea",
        weight: 8,
        cond: { hasTrait: "idea", projectState: "developing" },
        targetTrait: "idea",
        title: "{target} 把白板画满了",
        desc: "{target} 冲进例会，画出一套谁都没完全看懂、但似乎很有趣的循环结构。",
        choices: [
            {
                text: "拨一点时间做可玩原型",
                effects: { project: { design: 9, bugs: 2 }, targetFatigue: 8, targetSatisfaction: 10, targetLoyalty: 4, targetMemory: "你给他的奇怪循环留了验证时间，那个原型后来成了团队常聊的梗。" },
                feedback: "原型有点粗糙，但确实冒出了新东西。"
            },
            {
                text: "先收住，当前版本别再膨胀",
                effects: { targetSatisfaction: -8, project: { design: 2 }, targetMemory: "他的奇思妙想被暂时搁置，他把白板拍照存了下来。" },
                feedback: "进度稳住了，但灵感火花也暗了一点。"
            }
        ]
    },
    {
        id: "trait_multi_cross_help",
        category: "trait_multi",
        weight: 8,
        cond: { hasTrait: "multi", projectState: "developing" },
        targetTrait: "multi",
        title: "{target} 顺手解了一个跨岗小卡点",
        desc: "别人卡了半天的细节，{target} 路过看了两眼，顺手调通了。大家突然意识到，全能选手不是写在简历上的客套话。",
        choices: [
            {
                text: "让他继续串联几个小问题",
                effects: { project: { code: 3, art: 3, design: 3 }, moraleAll: 3, targetFatigue: 5, targetLoyalty: 3, targetMemory: "他作为跨岗救火队员解决了一串小卡点，团队对他的信任更深了。" },
                feedback: "几个小堵点被打通，项目手感顺了不少。"
            },
            {
                text: "别让他被杂事淹没，回主线",
                effects: { targetSatisfaction: 4, targetFatigue: -4 },
                feedback: "他保住了精力，主线任务推进得更稳。"
            }
        ]
    },
    {
        id: "trait_salary_market_report",
        category: "trait_salary",
        weight: 8,
        cond: { hasTrait: "salary", maxLoyalty: 62 },
        targetTrait: "salary",
        title: "{target} 留下一份薪资报告",
        desc: "{target} 把一份详细的市场薪资报告放在你桌上，什么都没说，但意思已经很清楚了。",
        choices: [
            {
                text: "主动小幅调薪，留住核心战力",
                effects: { targetSalary: 600, targetSatisfaction: 16, targetLoyalty: 12, targetMemory: "你主动根据市场行情为他调薪，他第一次觉得这家公司愿意认真留人。" },
                feedback: "月薪压力变大了，但人心稳了不少。"
            },
            {
                text: "先装作没看见，现金流要紧",
                effects: { targetSatisfaction: -10, targetLoyalty: -12, targetMemory: "那份薪资报告被你压在桌角，他之后很少再主动谈未来。" },
                feedback: "账面暂时轻松，关系却多了一道细缝。"
            }
        ]
    },
    {
        id: "trait_salary_loyal_headhunter",
        category: "trait_salary",
        weight: 5,
        cond: { hasTrait: "salary", minLoyalty: 78 },
        targetTrait: "salary",
        title: "{target} 把猎头电话转给了你",
        desc: "猎头又来了，报价很夸张。{target} 没有私下聊，直接把号码转给你，还附了一个微笑表情。",
        choices: [
            {
                text: "认真道谢，并聊聊他的长期位置",
                effects: { targetLoyalty: 8, targetSatisfaction: 6, moraleAll: 2, targetMemory: "面对猎头高价挖角，他把电话转给了你。那天你们聊了很久未来。" },
                feedback: "什么都没花，但你们之间的信任更重了。"
            }
        ]
    }
];

if (typeof module !== "undefined" && module.exports) module.exports = { EMPLOYEE_ECOSYSTEM_EVENTS };
