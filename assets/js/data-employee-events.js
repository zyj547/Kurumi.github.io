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
        cond: { hasTrait: "salary", minLoyalty: 78, minTargetLoyalty: 78, targetNotFounder: true },
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
    },
    {
        id: "trait_debug_burnout_warning",
        category: "trait_debug",
        weight: 7,
        cond: { hasTrait: "debug", minTargetFatigue: 72, targetNotFounder: true },
        targetTrait: "debug",
        title: "{target} 的提交记录亮了一整夜",
        desc: "{target} 又在凌晨提交了修复。代码质量不错，但你看见他早上端着杯子时，手明显有点抖。",
        choices: [
            {
                text: "强制他今天只做代码审查",
                effects: { targetFatigue: -14, targetSatisfaction: 4, project: { bugs: -1 }, targetMemory: "你发现他连续熬夜后，主动把他的任务调整成轻量审查。" },
                feedback: "进度慢了一点，但团队没有失去一个关键修 Bug 的人。"
            },
            {
                text: "趁手感还在，冲掉最后几个 Bug",
                effects: { project: { bugs: -6, code: 4 }, targetFatigue: 16, targetSatisfaction: -5, targetLoyalty: -2, targetMemory: "你让他继续趁手感修 Bug，他完成了任务，却也记住了这次透支。" },
                feedback: "Bug 数字降得很漂亮，只是人不该一直这样漂亮地燃烧。"
            }
        ]
    },
    {
        id: "trait_debug_pair_review",
        category: "trait_debug",
        weight: 6,
        cond: { hasTrait: "debug", requiresRole: "programmer", projectState: "developing", maxTargetFatigue: 65 },
        targetTrait: "debug",
        title: "{target} 想拉人做一次结对排雷",
        desc: "{target} 说这次问题不是单点 Bug，而是几段代码互相误会。与其继续猜，不如找人一起过一遍。",
        choices: [
            {
                text: "批准结对排雷，顺便沉淀规范",
                effects: { project: { bugs: -4, code: 3 }, rp: 2, targetFatigue: 6, targetLoyalty: 3, targetMemory: "你支持他组织结对排雷，团队第一次认真讨论了代码边界。" },
                feedback: "几个隐藏风险被提前拆出来，之后的修改轻松了很多。"
            },
            {
                text: "先别开会，直接按清单修",
                effects: { project: { bugs: -2, code: 2 }, targetSatisfaction: -3 },
                feedback: "效率还行，但那张边界图最终没有画完。"
            }
        ]
    },
    {
        id: "trait_lazy_after_sprint",
        category: "trait_lazy",
        weight: 7,
        cond: { hasTrait: "lazy", minTargetFatigue: 55, targetNotFounder: true },
        targetTrait: "lazy",
        title: "{target} 申请一次合法摸鱼",
        desc: "{target} 说自己不是不干活，只是电量真的见底了。他甚至递来一张写着“恢复后补工时”的纸条。",
        choices: [
            {
                text: "批准半天回血，但把交付点写清楚",
                effects: { targetFatigue: -24, targetSatisfaction: 12, targetLoyalty: 4, targetMemory: "你批准了他的半天恢复时间，同时把交付点说清楚。他后来确实补上了任务。" },
                feedback: "这次摸鱼有边界，所以没有变成失控。"
            },
            {
                text: "现在不能松，先把版本顶过去",
                effects: { project: { design: 3, art: 2, code: 2 }, targetFatigue: 10, targetSatisfaction: -8, targetLoyalty: -3 },
                feedback: "版本被顶过去了，但他开始把耳机戴得更严实。"
            }
        ]
    },
    {
        id: "trait_lazy_hidden_tool",
        category: "trait_lazy",
        weight: 5,
        cond: { hasTrait: "lazy", projectState: "developing", minTargetSatisfaction: 62 },
        targetTrait: "lazy",
        title: "{target} 掏出一个奇怪的小工具",
        desc: "{target} 说这东西是他“休息时顺手写的”，能自动整理一批重复素材和命名。",
        choices: [
            {
                text: "让他接入流程，先小范围试用",
                effects: { project: { code: 4, art: 5, design: 2 }, targetSatisfaction: 7, targetMemory: "他把摸鱼时写的小工具接进流程，替团队省掉一堆重复劳动。" },
                feedback: "工具界面很随意，但效率是真的有。"
            },
            {
                text: "先别碰主流程，导出给大家手动用",
                effects: { project: { art: 3 }, rp: 1, targetSatisfaction: 2 },
                feedback: "风险更小，惊喜也小了一点。"
            }
        ]
    },
    {
        id: "trait_idea_feature_hat",
        category: "trait_idea",
        weight: 6,
        cond: { hasTrait: "idea", projectState: "developing", minTargetSatisfaction: 68 },
        targetTrait: "idea",
        title: "{target} 坚持帽子应该会说话",
        desc: "{target} 认真解释了五分钟：如果主角的帽子能吐槽玩家，整个游戏就会有灵魂。会议室陷入微妙沉默。",
        choices: [
            {
                text: "给这个怪点子一个小入口",
                effects: { project: { design: 8, art: 3, bugs: 1 }, fans: 45, targetSatisfaction: 10, targetLoyalty: 3, targetMemory: "你允许他把“会说话的帽子”做成隐藏彩蛋，他开心得像赢了一场辩论。" },
                feedback: "功能不大，却让项目多了一个容易被玩家记住的点。"
            },
            {
                text: "砍掉，别让范围继续膨胀",
                effects: { project: { design: 2 }, targetSatisfaction: -7, targetMemory: "他的帽子吐槽彩蛋被砍掉了，他把设计稿夹进了自己的笔记本。" },
                feedback: "范围控制住了，但会议室少了一点荒唐的快乐。"
            }
        ]
    },
    {
        id: "trait_idea_scope_guard",
        category: "trait_idea",
        weight: 5,
        cond: { hasTrait: "idea", projectState: "polishing" },
        targetTrait: "idea",
        title: "{target} 在打磨期又想加系统",
        desc: "项目都进入打磨了，{target} 还在白板角落写下“如果再加一个循环，会不会更完整”。",
        choices: [
            {
                text: "只保留最小版本，满足他的表达",
                effects: { project: { design: 4, bugs: 1 }, targetSatisfaction: 5, targetLoyalty: 2 },
                feedback: "创意被压缩成了一个不伤节奏的小亮点。"
            },
            {
                text: "坚决冻结范围，专心修体验",
                effects: { project: { bugs: -3 }, targetSatisfaction: -5 },
                feedback: "版本更稳了，他则在白板旁边画了一个小小的叹号。"
            }
        ]
    },
    {
        id: "trait_multi_mentor_hour",
        category: "trait_multi",
        weight: 6,
        cond: { hasTrait: "multi", minTeam: 3, minTargetSatisfaction: 55 },
        targetTrait: "multi",
        title: "{target} 被大家轮流请教",
        desc: "程序、美术、策划都来问 {target} 一个“小问题”。等他反应过来，半天已经过去了。",
        choices: [
            {
                text: "把这半天正式变成团队答疑时间",
                effects: { rp: 3, moraleAll: 3, targetFatigue: 8, targetLoyalty: 4, targetMemory: "你把大家围着他的半天变成正式答疑，他第一次像团队导师一样被需要。" },
                feedback: "个人产出少了，团队理解却对齐了很多。"
            },
            {
                text: "替他挡掉杂事，让他回自己的任务",
                effects: { targetSatisfaction: 5, targetFatigue: -5, project: { code: 2, art: 2, design: 2 } },
                feedback: "他松了口气，几个核心任务也继续往前走。"
            }
        ]
    },
    {
        id: "trait_multi_challenge_request",
        category: "trait_multi",
        weight: 5,
        cond: { hasTrait: "multi", minTargetLoyalty: 60, targetNotFounder: true },
        targetTrait: "multi",
        title: "{target} 说自己有点生锈",
        desc: "{target} 半开玩笑地说，好久没有遇到真正难啃的活了，技能快被日常任务磨平。",
        choices: [
            {
                text: "把一个难模块交给他牵头",
                effects: { project: { code: 5, art: 3, design: 5 }, targetFatigue: 8, targetSatisfaction: 9, targetLoyalty: 4, targetMemory: "你把一个难模块交给他牵头，他重新找回了挑战感。" },
                feedback: "难题推进了，他的眼神也亮了一点。"
            },
            {
                text: "赞助他参加线上大师课",
                effects: { funds: -1200, targetStat: { code: 2, art: 2, design: 2 }, targetSatisfaction: 8, targetLoyalty: 5 },
                feedback: "钱花出去了，但全能选手的上限又被往上推了一点。"
            }
        ]
    },
    {
        id: "trait_salary_counter_offer",
        category: "trait_salary",
        weight: 6,
        cond: { hasTrait: "salary", maxTargetLoyalty: 45, targetNotFounder: true },
        targetTrait: "salary",
        title: "{target} 开始认真比较外部机会",
        desc: "{target} 没有威胁你，只是很平静地说，最近确实收到了几个值得考虑的机会。",
        choices: [
            {
                text: "给出阶段性涨薪和清晰职位承诺",
                effects: { targetSalary: 900, targetLoyalty: 16, targetSatisfaction: 12, targetMemory: "你在他认真比较外部机会时，给出了明确的长期位置和阶段性涨薪。" },
                feedback: "成本上去了，但他愿意再和工作室走一段。"
            },
            {
                text: "坦白现金流压力，请他等到下款作品",
                effects: { targetLoyalty: 5, targetSatisfaction: -3, targetMemory: "你坦白现金流压力，请他等到下款作品后再谈薪资。他没有立刻答应，也没有立刻离开。" },
                feedback: "真诚暂时稳住了局面，但这不是长久答案。"
            }
        ]
    },
    {
        id: "arch_fresh_first_responsibility",
        category: "archetype_fresh",
        weight: 6,
        cond: { hasArchetype: "fresh", minTargetSatisfaction: 70, targetNotFounder: true },
        targetArchetype: "fresh",
        title: "{target} 想负责一个完整小模块",
        desc: "{target} 小心翼翼地问，能不能把一个小模块从设计到验收都交给自己。他已经把拆分表写好了。",
        choices: [
            {
                text: "交给他，但安排一次中途评审",
                effects: { project: { design: 5, code: 2 }, targetStat: { design: 2 }, targetSatisfaction: 9, targetLoyalty: 6, targetMemory: "你把一个完整小模块交给他负责，并认真做了中途评审。" },
                feedback: "新人第一次真正背起了一块责任。"
            },
            {
                text: "先从协助开始，别一下压太重",
                effects: { project: { design: 3 }, targetSatisfaction: -3, targetLoyalty: 2 },
                feedback: "更稳，但他明显有点不甘心。"
            }
        ]
    },
    {
        id: "arch_veteran_old_wound",
        category: "archetype_veteran",
        weight: 5,
        cond: { hasArchetype: "veteran", projectState: "developing", maxTargetSatisfaction: 72 },
        targetArchetype: "veteran",
        title: "{target} 对某个流程异常敏感",
        desc: "{target} 看到一个熟悉的排期写法后沉默了很久。他说以前有个项目就是从这里开始崩的。",
        choices: [
            {
                text: "听他复盘，把风险写进计划",
                effects: { project: { design: 5, bugs: -2 }, targetSatisfaction: 7, targetLoyalty: 4, targetMemory: "你认真听完了他关于旧项目失败的复盘，并把风险写进当前计划。" },
                feedback: "老伤疤没有白疼，团队避开了一个坑。"
            },
            {
                text: "这次情况不同，按原计划推进",
                effects: { project: { code: 4, bugs: 2 }, targetSatisfaction: -6 },
                feedback: "进度更快了，但他看起来没有被说服。"
            }
        ]
    },
    {
        id: "arch_idealist_budget_argument",
        category: "archetype_idealist",
        weight: 5,
        cond: { hasArchetype: "idealist", minFunds: 3000, targetNotFounder: true },
        targetArchetype: "idealist",
        title: "{target} 想为一个细节追加预算",
        desc: "{target} 认为这个细节玩家一定会感受到，哪怕它不容易写进宣传文案。",
        choices: [
            {
                text: "追加小预算，把热爱留在作品里",
                effects: { funds: -900, project: { art: 4, design: 4 }, targetSatisfaction: 10, targetLoyalty: 4, targetMemory: "你为他坚持的细节追加了小预算，他觉得这家公司没有只看表格。" },
                feedback: "现金少了一点，作品多了一点温度。"
            },
            {
                text: "这次先砍，发布后再补",
                effects: { targetSatisfaction: -7, project: { bugs: -1 } },
                feedback: "版本更稳，但他把那张细节草图收了起来。"
            }
        ]
    },
    {
        id: "arch_pragmatic_cost_sheet",
        category: "archetype_pragmatic",
        weight: 5,
        cond: { hasArchetype: "pragmatic", maxFunds: 12000, targetNotFounder: true },
        targetArchetype: "pragmatic",
        title: "{target} 主动整理了成本表",
        desc: "{target} 没有说教，只是把未来八周的支出风险整理成一张表，颜色标得很刺眼。",
        choices: [
            {
                text: "按他的表调整节奏",
                effects: { funds: 500, rp: 1, targetLoyalty: 4, targetSatisfaction: 5, targetMemory: "你按他的成本表调整了节奏，他觉得自己的现实感终于派上用场。" },
                feedback: "没有奇迹，但现金流变得更可控。"
            },
            {
                text: "现在更需要冲刺，不要被表格吓住",
                effects: { project: { code: 3, art: 3, design: 3 }, targetSatisfaction: -4 },
                feedback: "项目推进了，他则默默把表格另存了一份。"
            }
        ]
    },
    {
        id: "team_low_morale_roundtable",
        category: "team_morale",
        weight: 7,
        cond: { maxSatisfaction: 42, minTeam: 2 },
        title: "工位区安静得有点不正常",
        desc: "最近大家都很少闲聊，键盘声变得机械。不是没人工作，而是没人真的在状态里。",
        choices: [
            {
                text: "开一次短会，只聊卡点不追责",
                effects: { satisfactionAll: 8, loyaltyAll: 2, fatigueAll: -4 },
                feedback: "会议很短，却让几个憋着的问题浮了上来。"
            },
            {
                text: "别打断节奏，等版本过去再说",
                effects: { project: { code: 3, art: 3, design: 3 }, satisfactionAll: -3, fatigueAll: 3 },
                feedback: "进度继续往前，但沉默没有消失。"
            }
        ]
    },
    {
        id: "team_high_loyalty_afterglow",
        category: "team_loyalty",
        weight: 4,
        cond: { minLoyalty: 82, minTeam: 2 },
        title: "大家开始自发补位",
        desc: "没有人安排，几个同事却主动把彼此的边角任务接了起来。你意识到，这支队伍已经有了默契。",
        choices: [
            {
                text: "把这次默契记进团队复盘",
                effects: { rp: 4, moraleAll: 3, satisfactionAll: 4 },
                feedback: "这不是一次大胜利，但很像一家工作室真正成型的声音。"
            }
        ]
    }
];

if (typeof module !== "undefined" && module.exports) module.exports = { EMPLOYEE_ECOSYSTEM_EVENTS };
