const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function runGameData() {
  const code = read("assets/js/data.js") + `
globalThis.__gameData = {
  PLATFORMS_DATA, GENRES_DATA, TOPICS_DATA, EMPLOYEE_TRAITS,
  EMPLOYEE_ARCHETYPES, FOUNDER_BACKGROUNDS, FOUNDER_TALENTS,
  PLATFORM_REP_CONFIG, COMPANY_STAGES, DEV_CARDS
};`;
  const context = { console };
  vm.createContext(context);
  vm.runInContext(code, context, { filename: "data.js" });
  return context.__gameData;
}

function runDefaultState() {
  const code = read("assets/js/data.js") + "\n" + read("assets/js/simulator/state.js") + `
globalThis.__defaultState = createDefaultGameState();`;
  const context = {
    console,
    TextEncoder,
    TextDecoder,
    localStorage: {
      getItem() { return null; },
      setItem() {},
      removeItem() {}
    }
  };
  vm.createContext(context);
  vm.runInContext(code, context, { filename: "state.js" });
  return context.__defaultState;
}

function loadEvents() {
  return require(path.join(root, "assets/js/data-events.js")).STUDIO_EVENTS;
}

function cell(value) {
  if (value == null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}

function money(value) {
  return `￥${Number(value || 0).toLocaleString("zh-CN")}`;
}

function pct(value) {
  return `${Math.round(Number(value || 0) * 100)}%`;
}

function table(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`),
    ""
  ].join("\n");
}

function joinNames(keys, source) {
  return (keys || []).map((key) => source[key]?.name || key).join("、");
}

function effectsText(effects) {
  if (!effects) return "";
  return Object.entries(effects).map(([key, value]) => `${key}: ${cell(value)}`).join("；");
}

const data = runGameData();
const defaultState = runDefaultState();
const events = loadEvents();

const researchPerks = {
  workflow: { name: "敏捷工作流", route: "管理路线", desc: "建立迭代节奏。研发项目每周进度更稳，员工疲劳增长压力降低。", cost: 18 },
  community: { name: "社区运营矩阵", route: "商业路线", desc: "建立粉丝社群。每周自然增长少量粉丝，降低空窗期焦虑。", cost: 22 },
  analytics: { name: "数据分析后台", route: "工具路线", desc: "搭建数据看板。闲置员工产出 RP 的概率和稳定性提升。", cost: 26 }
};

const out = [];

out.push("# 《桔子工作室》游戏内容整合文档");
out.push("");
out.push("生成日期：2026-06-23");
out.push("");
out.push("本文档从当前项目的数据表与核心模拟器逻辑中整理，覆盖现有玩法、静态内容、研发事件、经营事件、员工、科技、公司阶段、发行与历史系统。");
out.push("");

out.push("## 1. 游戏定位");
out.push("");
out.push("《桔子工作室》是一款独立游戏工作室经营模拟游戏。玩家从单人创始人起步，通过招聘、研发、科技解锁、平台扩张、项目发行和公司晋级，逐步积累资金、粉丝、研发点数与作品声誉。核心体验围绕“选方向 -> 组团队 -> 卡片化研发 -> 上线发行 -> 复盘成长”的循环展开。");
out.push("");

out.push("## 2. 默认开局与核心资源");
out.push("");
out.push(table(["项目", "默认值/说明"], [
  ["公司名", defaultState.companyName],
  ["资金", money(defaultState.funds)],
  ["粉丝", defaultState.fans],
  ["研发点数 RP", defaultState.rp],
  ["时间", `第 ${defaultState.date.year} 年 ${defaultState.date.month} 月第 ${defaultState.date.week} 周`],
  ["初始工位", defaultState.officeSlots],
  ["初始阶段", data.COMPANY_STAGES[defaultState.companyStage]?.name],
  ["初始员工", defaultState.employees.map((e) => `${e.name}（${e.role}，代码${e.stats.code}/美术${e.stats.art}/策划${e.stats.design}）`).join("；")],
  ["默认趋势", `${data.GENRES_DATA[defaultState.activeTrend.genre].name} / ${data.TOPICS_DATA[defaultState.activeTrend.topic].name}`]
]));

out.push("## 3. 立项内容库");
out.push("");
out.push("### 3.1 发行平台");
out.push(table(["Key", "名称", "解锁/立项成本", "市场规模系数", "图标"], Object.entries(data.PLATFORMS_DATA).map(([key, item]) => [
  key, item.name, money(item.cost), item.scale, item.icon
])));
out.push("### 3.2 游戏类型");
out.push(table(["Key", "名称", "解锁/立项成本", "能力需求比例", "图标"], Object.entries(data.GENRES_DATA).map(([key, item]) => [
  key, item.name, money(item.cost), `代码 ${pct(item.ratio.code)} / 美术 ${pct(item.ratio.art)} / 策划 ${pct(item.ratio.design)}`, item.icon
])));
out.push("### 3.3 题材");
out.push(table(["Key", "名称", "解锁/立项成本", "适配类型", "图标"], Object.entries(data.TOPICS_DATA).map(([key, item]) => [
  key, item.name, money(item.cost), joinNames(item.bestGenres, data.GENRES_DATA), item.icon
])));

out.push("## 4. 员工系统内容");
out.push("");
out.push("### 4.1 员工特质");
out.push(table(["Key", "名称", "效果/描述"], Object.entries(data.EMPLOYEE_TRAITS).map(([key, item]) => [key, item.name, item.desc])));
out.push("### 4.2 性格原型");
out.push(table(["Key", "名称", "描述", "期望薪资系数", "底线比例", "让步", "离场概率", "爽约概率", "初始士气"], Object.entries(data.EMPLOYEE_ARCHETYPES).map(([key, item]) => [
  key, item.name, item.desc, item.expectMult, item.floorRatio, item.concession, item.walkChance, item.noShowChance, item.moraleSeed
])));
out.push("### 4.3 招聘稀有度");
out.push(table(["稀有度", "定位", "薪资系数", "最低等级", "属性系数", "面试费系数"], [
  ["R", "潜力新人", 1, 1, 1, 1],
  ["SR", "资深骨干", 1.45, 3, 1.45, 1.7],
  ["SSR", "行业王牌", 2.15, 5, 2.2, 3.2]
]));

out.push("## 5. 创始人内容");
out.push("");
out.push("### 5.1 创始人背景");
out.push(table(["Key", "名称", "职位", "初始属性", "效果", "图标"], Object.entries(data.FOUNDER_BACKGROUNDS).map(([key, item]) => [
  key, item.name, item.role, `代码${item.stats.code}/美术${item.stats.art}/策划${item.stats.design}`, item.desc, item.icon
])));
out.push("### 5.2 创始人天赋");
out.push(table(["Key", "名称", "说明"], Object.entries(data.FOUNDER_TALENTS).map(([key, item]) => [key, item.name, item.desc])));

out.push("## 6. 公司阶段");
out.push("");
out.push(table(["阶段", "名称", "晋级要求", "效果", "工位", "效率", "士气"], data.COMPANY_STAGES.map((stage, index) => [
  index, stage.name, stage.requirement, stage.desc, stage.slots, `+${pct(stage.efficiencyBonus || 0)}`, `+${stage.moraleBonus || 0}`
])));

out.push("## 7. 科技研究");
out.push("");
out.push("科技研究分为类型、题材、平台和经营能力四类。前三类直接复用立项内容库的成本字段；经营能力为独立 RP 消耗。");
out.push(table(["分类", "名称", "成本", "说明"], [
  ...Object.values(data.GENRES_DATA).map((item) => ["游戏类型", item.name, `${item.cost} RP`, "解锁新的立项类型"]),
  ...Object.values(data.TOPICS_DATA).map((item) => ["题材", item.name, `${item.cost} RP`, "解锁新的题材方向"]),
  ...Object.values(data.PLATFORMS_DATA).map((item) => ["平台", item.name, `${item.cost} RP`, "解锁新的发行平台"]),
  ...Object.values(researchPerks).map((item) => ["经营能力", item.name, `${item.cost} RP`, `${item.route}：${item.desc}`])
]));

out.push("## 8. 研发系统");
out.push("");
out.push("研发采用卡片推进制。立项后项目进入阶段流程，系统会按项目阶段、团队岗位、当前属性、题材类型、平台和历史选择过滤研发卡，避免完全随机导致不真实或重复。每张卡包含适用阶段、持续周数、叙事、优先技能、标签、效果和条件。");
out.push("");
out.push("### 8.1 研发卡牌总览");
out.push(table(["ID", "标题", "阶段", "周期", "主技能", "标签", "条件摘要", "描述", "选项"], data.DEV_CARDS.map((card) => [
  card.id,
  card.title,
  card.phase,
  `${card.weeks || 1} 周`,
  card.skill || "any",
  (card.tags || []).join("、"),
  cell(card.cond || card.condition || ""),
  card.desc,
  (card.choices || []).map((choice) => `${choice.text}（${effectsText(choice.effects)}）`).join("<br>")
])));

out.push("## 9. 工作室随机事件");
out.push("");
out.push("工作室事件来自独立事件库，按团队规模、资金、粉丝、公司阶段、岗位和创始人背景等条件筛选。事件通常提供两种选择，分别改变资金、粉丝、RP、士气、疲劳或员工能力。");
out.push("");
out.push("### 9.1 随机事件总览");
out.push(table(["ID", "分类", "权重", "条件", "标题", "描述", "选项与效果"], events.map((event) => [
  event.id,
  event.category,
  event.weight,
  cell(event.cond || ""),
  event.title,
  event.desc,
  event.choices.map((choice) => `${choice.text}（${effectsText(choice.effects)}；反馈：${choice.feedback || ""}）`).join("<br>")
])));

out.push("## 10. 发行与口碑");
out.push("");
out.push("项目完成后进入上线选择。评分受团队能力、类型需求匹配、题材适配、平台规模、趋势命中、Bug、研发卡结果、市场疲劳和创始人/科技加成影响。发行后作品会进入历史作品列表，产生粉丝增长、收入和口碑分。");
out.push(table(["平台", "路线定位", "起始信誉", "说明", "信誉用途"], Object.entries(data.PLATFORM_REP_CONFIG).map(([key, item]) => [
  data.PLATFORMS_DATA[key]?.name || key,
  item.label || key,
  item.start,
  item.desc || "",
  "影响平台表现、发行反馈与长期成长空间"
])));

out.push("## 11. 时间与经营循环");
out.push("");
out.push("时间以周推进。玩家可以手动推进 1 周、推进至发薪日、推进至关键节点或推进至合同到期。每周会处理工资、租金、员工疲劳/士气、闲置员工 RP、研发项目进度、辅助项目、平台信誉、自然粉丝增长、事件触发和破产检测。");
out.push("");

out.push("## 12. 历史、编年史与多周目");
out.push("");
out.push("历史界面分为“已发行游戏”和“工作室编年史”。已发行游戏展示作品卡、口碑、渠道、粉丝和毛利；编年史记录工作室事件、立项、研发阶段和关键成长节点。破产或重组后可保留多周目荣誉/奖牌类成长内容。");
out.push("");

out.push("## 13. UI 与视觉内容");
out.push("");
out.push("当前界面采用深色霓虹风格，主要视觉模块包括：顶部资源栏、左侧导航、开发卡座、研发项目看板、事件卡、人才招聘卡与详情弹窗、科技研究列表、运营简报、平台信誉、热门趋势、发行完成面板、历史作品卡和工作室编年史。项目封面由题材、类型、平台和项目名生成，用于研发、发行和历史界面保持作品识别。");
out.push("");

out.push("## 14. 已知内容规模");
out.push("");
out.push(table(["内容类型", "数量"], [
  ["发行平台", Object.keys(data.PLATFORMS_DATA).length],
  ["游戏类型", Object.keys(data.GENRES_DATA).length],
  ["题材", Object.keys(data.TOPICS_DATA).length],
  ["员工特质", Object.keys(data.EMPLOYEE_TRAITS).length],
  ["员工性格原型", Object.keys(data.EMPLOYEE_ARCHETYPES).length],
  ["创始人背景", Object.keys(data.FOUNDER_BACKGROUNDS).length],
  ["创始人天赋", Object.keys(data.FOUNDER_TALENTS).length],
  ["公司阶段", data.COMPANY_STAGES.length],
  ["研发卡牌", data.DEV_CARDS.length],
  ["工作室随机事件", events.length],
  ["经营研究能力", Object.keys(researchPerks).length]
]));

out.push("## 15. 内容维护建议");
out.push("");
out.push("1. 新增研发卡时优先补齐 id、phase、weeks、skill、tags、cond 和 choices，避免卡牌池重复或不符合团队状态。");
out.push("2. 新增事件时优先写明确条件，例如团队规模、岗位、资金、粉丝、阶段和创始人背景，让事件更像真实经营处境。");
out.push("3. 发行内容和编年史内容应分层展示：发行作品放入已发行游戏，过程节点放入工作室编年史。");
out.push("4. 当平台、题材和类型数量继续增加时，需要同步补充项目封面规则、热门趋势权重和研发卡条件。");
out.push("");

const target = path.join(root, "docs", "game-content-compendium.md");
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, out.join("\n"), "utf8");
console.log(target);
