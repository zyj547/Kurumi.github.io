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

        const RANDOM_NAMES = ["张三", "李四", "王五", "小智", "阿伟", "老陈", "阿强", "小美", "大壮", "阿龙", "小华", "杰森"];
