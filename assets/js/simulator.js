
        // ==========================================================================
        // 重写 window.alert 弹窗系统 (接管为自定义高科技 Modal 弹窗)
        // ==========================================================================
        let alertQueue = [];
        let isAlertActive = false;

        window.alert = function(message, title = "系统提示") {
            return new Promise((resolve) => {
                alertQueue.push({ message, title, resolve });
                processAlertQueue();
            });
        };

        function processAlertQueue() {
            if (isAlertActive || alertQueue.length === 0) return;
            isAlertActive = true;

            const { message, title, resolve } = alertQueue.shift();

            const modal = document.getElementById("custom-alert-modal");
            const titleEl = document.getElementById("custom-alert-title");
            const msgEl = document.getElementById("custom-alert-message");
            const btn = document.getElementById("custom-alert-confirm-btn");
            const iconEl = modal.querySelector(".custom-alert-icon");

            titleEl.innerText = title;
            msgEl.innerHTML = message; // 允许嵌入一些HTML比如加粗或图标

            // 根据弹窗内容自动分配图标和颜色
            if (message.includes("⚠️") || message.includes("不足") || message.includes("警告")) {
                iconEl.className = "fa-solid fa-triangle-exclamation custom-alert-icon warning";
            } else if (message.includes("恭喜") || message.includes("成功") || message.includes("入职") || message.includes("解除") || message.includes("增加") || message.includes("重组") || message.includes("提升")) {
                iconEl.className = "fa-solid fa-circle-check custom-alert-icon success";
            } else {
                iconEl.className = "fa-solid fa-bell custom-alert-icon info";
            }

            modal.classList.add("active");

            // 播放提示音效 (如果音频引擎已就绪且可用)
            if (typeof playSFX === "function") {
                if (message.includes("不足") || message.includes("⚠️")) {
                    playSFX("bug");
                } else if (message.includes("成功") || message.includes("重组") || message.includes("恭喜") || message.includes("提升")) {
                    playSFX("success");
                } else {
                    playSFX("click");
                }
            }

            const handleClose = () => {
                modal.classList.remove("active");
                btn.removeEventListener("click", handleClose);
                document.removeEventListener("keydown", handleKeydown);
                setTimeout(() => {
                    isAlertActive = false;
                    resolve();
                    processAlertQueue();
                }, 300); // 300ms 渐隐动画结束后执行下一个或 resolve
            };

            const handleKeydown = (e) => {
                if (e.key === "Enter" || e.key === "Escape") {
                    e.preventDefault();
                    handleClose();
                }
            };

            btn.addEventListener("click", handleClose);
            document.addEventListener("keydown", handleKeydown);
            
            // 给按钮焦点，方便键盘操作
            setTimeout(() => {
                btn.focus();
            }, 50);
        }

        // ==========================================================================
        // 重写 window.confirm 确认弹窗系统 (接管为自定义高科技 Confirm Modal 弹窗)
        // ==========================================================================
        let confirmQueue = [];
        let isConfirmActive = false;

        window.confirm = function(message, title = "系统确认") {
            return new Promise((resolve) => {
                confirmQueue.push({ message, title, resolve });
                processConfirmQueue();
            });
        };

        function processConfirmQueue() {
            if (isConfirmActive || confirmQueue.length === 0) return;
            isConfirmActive = true;

            const { message, title, resolve } = confirmQueue.shift();

            const modal = document.getElementById("custom-confirm-modal");
            const titleEl = document.getElementById("custom-confirm-title");
            const msgEl = document.getElementById("custom-confirm-message");
            const okBtn = document.getElementById("custom-confirm-ok-btn");
            const cancelBtn = document.getElementById("custom-confirm-cancel-btn");
            const iconEl = modal.querySelector(".custom-alert-icon");

            titleEl.innerText = title;
            msgEl.innerHTML = message.replace(/\n/g, "<br>"); // 支持换行转换

            // 根据弹窗内容自动分配图标
            if (message.includes("警告") || message.includes("彻底删除") || message.includes("清除") || message.includes("💀")) {
                iconEl.className = "fa-solid fa-triangle-exclamation custom-alert-icon warning";
            } else {
                iconEl.className = "fa-solid fa-circle-question custom-alert-icon info";
            }

            modal.classList.add("active");

            // 播放音效
            if (typeof playSFX === "function") {
                playSFX("click");
            }

            const cleanUp = () => {
                modal.classList.remove("active");
                okBtn.removeEventListener("click", handleOk);
                cancelBtn.removeEventListener("click", handleCancel);
                document.removeEventListener("keydown", handleKeydown);
            };

            const handleOk = () => {
                cleanUp();
                setTimeout(() => {
                    isConfirmActive = false;
                    resolve(true);
                    processConfirmQueue();
                }, 300);
            };

            const handleCancel = () => {
                cleanUp();
                setTimeout(() => {
                    isConfirmActive = false;
                    resolve(false);
                    processConfirmQueue();
                }, 300);
            };

            const handleKeydown = (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    handleOk();
                } else if (e.key === "Escape") {
                    e.preventDefault();
                    handleCancel();
                }
            };

            okBtn.addEventListener("click", handleOk);
            cancelBtn.addEventListener("click", handleCancel);
            document.addEventListener("keydown", handleKeydown);
            
            // 默认聚焦在确定按钮上
            setTimeout(() => {
                okBtn.focus();
            }, 50);
        }

        // 默认初始化存档状态
        // ==========================================================================
        // 安全工具：转义用户/外部存档可控文本，防止通过 innerHTML 注入脚本 (XSS)
        // ==========================================================================
        function escapeHtml(str) {
            return String(str == null ? "" : str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        // 通用列表渲染：清空容器后按 items 生成子元素，一次性插入（单次重排）。
        // itemFn(item, idx) 返回 { className?, html } 或直接返回 html 字符串。
        // items 为空且提供 emptyHtml 时，渲染占位内容。
        function renderList(container, items, itemFn, emptyHtml) {
            container.innerHTML = "";
            if (items.length === 0 && emptyHtml != null) {
                container.innerHTML = emptyHtml;
                return;
            }
            const frag = document.createDocumentFragment();
            items.forEach((item, idx) => {
                const res = itemFn(item, idx);
                const el = document.createElement("div");
                if (typeof res === "string") {
                    el.innerHTML = res;
                } else {
                    if (res.className) el.className = res.className;
                    el.innerHTML = res.html;
                }
                frag.appendChild(el);
            });
            container.appendChild(frag);
        }

        // UTF-8 字符串 ↔ Base64（替代已废弃的 escape/unescape；与旧存档码字节完全一致，向后兼容）
        function utf8ToBase64(str) {
            const bytes = new TextEncoder().encode(str);
            let bin = "";
            bytes.forEach(b => { bin += String.fromCharCode(b); });
            return btoa(bin);
        }
        function base64ToUtf8(base64) {
            const bin = atob(base64);
            const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
            return new TextDecoder().decode(bytes);
        }

        // 存档结构版本号（结构变更时递增，供未来迁移判断）
        const SAVE_VERSION = 1;

        // 全新一局的默认状态（单一数据源，供初始化、存档迁移、重组复用）
        function createDefaultGameState() {
            return {
                companyName: "桔子网络工作室",
                funds: 50000,
                fans: 100,
                rp: 10,
                date: { year: 1, month: 1, week: 1 },
                employees: [
                    { id: "player", name: "创始人(您)", role: "designer", stats: { code: 15, art: 10, design: 20 }, salary: 0, level: 1, xp: 0, trait: "multi" }
                ],
                unlockedGenres: ["Casual"],
                unlockedTopics: ["Laborer"],
                unlockedPlatforms: ["Mobile"],
                releases: [],
                currentProject: null,
                lastIncome: 0,
                lastSales: 0,
                activeTrend: { genre: "Casual", topic: "Laborer" },
                // 多周目数据
                medalsGained: 0,
                activePerks: { fundsBoost: false, roguelikeUnlocked: false, fansGrowthBoost: false },
                chronology: [],
                saveVersion: SAVE_VERSION
            };
        }

        // 递归用默认值补全存档缺失字段（仅填补缺失，不覆盖已有进度）
        function fillDefaults(target, defaults) {
            if (defaults === null || typeof defaults !== "object" || Array.isArray(defaults)) {
                return target;
            }
            for (const key in defaults) {
                if (target[key] === undefined) {
                    target[key] = JSON.parse(JSON.stringify(defaults[key]));
                } else if (defaults[key] && typeof defaults[key] === "object" && !Array.isArray(defaults[key])) {
                    fillDefaults(target[key], defaults[key]);
                }
            }
            return target;
        }

        // 存档迁移：把任意版本的旧存档补全到当前结构，避免缺字段导致运行时崩溃
        function migrateSave(parsed) {
            return fillDefaults(parsed, createDefaultGameState());
        }

        let gameState = createDefaultGameState();

        // 跨周目勋章与特权持久化变量
        let orangeMedalsCount = parseInt(localStorage.getItem("orange_medals") || "0");
        let shopSelectedPerks = { fundsBoost: false, roguelikeUnlocked: false, fansGrowthBoost: false };

        // 临时招聘池
        let hiringPool = [];
        let activeResearchTab = "genre";
        let loopInterval = null;

        // ==========================================================================
        // 经济与节奏平衡参数（集中管理，便于数值调参）
        // ==========================================================================
        const BALANCE = {
            tickMs: 3500,             // 主时钟每周时长（毫秒）
            weeklyRent: 500,          // 每周固定租金
            salesWindowWeeks: 16,     // 单款游戏在售周数
            revenueDecay: 0.75,       // 每周营收衰减系数
            revenuePerRating: 1500,   // 单位口碑分基础营收
            fansRevenueFactor: 0.002, // 粉丝对营收的加成系数
            publisherShare: { tiktok: 0.5, steam: 0.7, self: 1.0 }, // 发行分成（保留比例）
            fansBoostPerWeek: 5,      // 大厂光环每周粉丝回流
            idleRpChance: 0.25,       // 闲置员工每周积累 RP 概率
            ideaTraitMultiplier: 1.5, // “灵感爆棚”特质 RP 加成
            trendUpdateChance: 0.1,   // 每周刷新趋势概率
            randomEventChance: 0.08,  // 每周随机事件概率
            bankruptcyThreshold: -30000 // 破产资金线
        };

        // 启动/重启游戏主时钟：先清除旧 interval，避免重复 setInterval 导致双倍速、双倍扣款
        function startGameClock() {
            clearInterval(loopInterval);
            loopInterval = setInterval(gameTick, BALANCE.tickMs);
        }

        // 初始化游戏页面
        window.onload = function() {
            loadGame();
            generateHiringPool();
            updateStatsUI();
            switchScreen('office');

            // 开启游戏主时钟 (每周 3.5 秒)
            startGameClock();
            
            // 如果是在开发中，直接拉回开发遮罩
            if (gameState.currentProject) {
                showDevelopmentOverlay();
            }

            // 标签页切到后台时暂停常驻 CSS 动画，省电控温
            document.addEventListener("visibilitychange", () => {
                document.body.classList.toggle("anim-paused", document.hidden);
            });
        };

        function isGamePaused() {
            const modals = ["custom-alert-modal", "custom-confirm-modal", "share-modal", "review-modal", "event-modal", "publisher-modal", "bankruptcy-modal", "medal-shop-modal"];
            return modals.some(id => {
                const el = document.getElementById(id);
                return el && el.classList.contains("active");
            });
        }

        // ==========================================================================
        // 核心时钟 (Game Tick Loop)
        // ==========================================================================
        function gameTick() {
            // 如果有任何模态弹窗激活，暂停时钟推进
            if (isGamePaused()) return;

            // 递增周数
            gameState.date.week++;
            if (gameState.date.week > 4) {
                gameState.date.week = 1;
                gameState.date.month++;
                if (gameState.date.month > 12) {
                    gameState.date.month = 1;
                    gameState.date.year++;
                }
            }

            // 处理每周支出 (租金与员工工资)
            const weeklyWages = gameState.employees.reduce((sum, emp) => sum + emp.salary, 0);
            const totalOut = weeklyWages + BALANCE.weeklyRent;

            gameState.funds -= totalOut;

            // 处理每日销量带来的持续收益
            let weeklySales = 0;
            gameState.releases.forEach(game => {
                if (game.weeksSinceRelease < BALANCE.salesWindowWeeks) {
                    // 收益计算衰减
                    const decay = Math.pow(BALANCE.revenueDecay, game.weeksSinceRelease);
                    let baseRevenue = game.rating * BALANCE.revenuePerRating * (1 + gameState.fans * BALANCE.fansRevenueFactor) * PLATFORMS_DATA[game.platform].scale;

                    // 应用发行商的分成政策（保留比例，未知发行商默认全额自营）
                    const shareMultiplier = BALANCE.publisherShare[game.publisher] ?? 1.0;

                    let thisWeekRev = Math.round(baseRevenue * decay * shareMultiplier);
                    weeklySales += thisWeekRev;
                    game.revenueGenerated += thisWeekRev;
                    game.weeksSinceRelease++;
                }
            });

            gameState.funds += weeklySales;
            gameState.lastSales = weeklySales;
            gameState.lastIncome = weeklySales - totalOut;

            // 大厂光环：名气回流特权（多周目特权）
            if (gameState.activePerks && gameState.activePerks.fansGrowthBoost) {
                gameState.fans += BALANCE.fansBoostPerWeek;
            }

            // 闲置状态下员工积累研发点 (RP)
            if (!gameState.currentProject) {
                gameState.employees.forEach(emp => {
                    // 每个人闲置时有几率积累 RP
                    if (Math.random() < BALANCE.idleRpChance) {
                        let rpGained = emp.level * (Math.random() > 0.5 ? 1 : 2);
                        if (emp.trait === "idea") {
                            rpGained = Math.round(rpGained * BALANCE.ideaTraitMultiplier); // 灵感爆棚特质
                        }
                        gameState.rp += rpGained;
                    }
                });
            } else {
                // 如果在开发中，处理开发进度
                developProgressTick();
            }

            // 偶尔更新热门趋势
            if (Math.random() < BALANCE.trendUpdateChance) {
                updateTrends();
            }

            // 偶尔触发随机事件
            if (Math.random() < BALANCE.randomEventChance) {
                triggerRandomEvent();
            }

            // 数据检测，若资金赤字严重提示游戏结束 (破产)
            if (gameState.funds < BALANCE.bankruptcyThreshold) {
                triggerBankruptcy();
            }

            // 保存进度并更新界面
            saveGame();
            updateStatsUI();
            
            // 重刷当前视图
            refreshActiveScreen();
        }

        // ==========================================================================
        // 开发模块 (Game R&D Engine)
        // ==========================================================================
        let selectedPlatform = "Mobile";
        let selectedGenre = "Casual";
        let selectedTopic = "Laborer";

        function setupDevelopForm() {
            // 加载平台
            const platContainer = document.getElementById("dev-platforms");
            platContainer.innerHTML = "";
            gameState.unlockedPlatforms.forEach(platKey => {
                const plat = PLATFORMS_DATA[platKey];
                const btn = document.createElement("button");
                btn.className = `select-btn ${selectedPlatform === platKey ? 'selected' : ''}`;
                btn.onclick = () => { selectedPlatform = platKey; setupDevelopForm(); };
                btn.innerHTML = `<span><i class="${plat.icon}"></i> ${plat.name}</span><span class="btn-cost">配额金 ¥${plat.cost}</span>`;
                platContainer.appendChild(btn);
            });

            // 加载类型
            const genreContainer = document.getElementById("dev-genres");
            genreContainer.innerHTML = "";
            gameState.unlockedGenres.forEach(genreKey => {
                const genre = GENRES_DATA[genreKey];
                const btn = document.createElement("button");
                btn.className = `select-btn ${selectedGenre === genreKey ? 'selected' : ''}`;
                btn.onclick = () => { selectedGenre = genreKey; setupDevelopForm(); };
                btn.innerHTML = `<span><i class="${genre.icon}"></i> ${genre.name}</span><span class="btn-cost">配额金 ¥${genre.cost}</span>`;
                genreContainer.appendChild(btn);
            });

            // 加载题材
            const topicContainer = document.getElementById("dev-topics");
            topicContainer.innerHTML = "";
            gameState.unlockedTopics.forEach(topicKey => {
                const topic = TOPICS_DATA[topicKey];
                const btn = document.createElement("button");
                btn.className = `select-btn ${selectedTopic === topicKey ? 'selected' : ''}`;
                btn.onclick = () => { selectedTopic = topicKey; setupDevelopForm(); };
                btn.innerHTML = `<span><i class="${topic.icon}"></i> ${topic.name}</span><span class="btn-cost">可选题材</span>`;
                topicContainer.appendChild(btn);
            });
        }

        function startDevelopment() {
            const nameInput = document.getElementById("dev-name").value.trim();
            const gameName = nameInput || `桔子秘境 ${Math.floor(Math.random()*100)}`;
            
            // 系统策划专精 (systems): 立项时平台费用成本减少 15% (可叠加，上限 30%)
            let systemsDiscount = 0;
            gameState.employees.forEach(emp => {
                if (emp.specialty === "systems") {
                    systemsDiscount += 0.15;
                }
            });
            if (systemsDiscount > 0.30) systemsDiscount = 0.30;

            const platCost = Math.round(PLATFORMS_DATA[selectedPlatform].cost * (1 - systemsDiscount));
            const genreCost = GENRES_DATA[selectedGenre].cost;
            const topicCost = TOPICS_DATA[selectedTopic].cost;
            const totalCost = platCost + genreCost + topicCost + 1000; // +1000 基础材料成本

            if (gameState.funds < totalCost) {
                alert("资金不足以启动该规模的项目开发！");
                return;
            }

            gameState.funds -= totalCost;
            
            // 初始化当前项目
            gameState.currentProject = {
                name: gameName,
                platform: selectedPlatform,
                genre: selectedGenre,
                topic: selectedTopic,
                progress: 0,
                code: 0,
                art: 0,
                design: 0,
                bugs: 0,
                state: "coding" // coding, debugging, finished
            };

            addChronicleEntry(`🚀 新项目《${gameName}》正式立项启动！选用【${PLATFORMS_DATA[selectedPlatform].name}】平台研发，类型为【${GENRES_DATA[selectedGenre].name}】，成本预算 ¥${totalCost.toLocaleString()}`);

            saveGame();
            updateStatsUI();
            showDevelopmentOverlay();
        }

        function showDevelopmentOverlay() {
            const overlay = document.getElementById("development-overlay");
            overlay.classList.add("active");
            
            const proj = gameState.currentProject;
            document.getElementById("overlay-game-name").innerText = proj.name;
            document.getElementById("overlay-game-meta").innerHTML = `
                <i class="${GENRES_DATA[proj.genre].icon}"></i> ${GENRES_DATA[proj.genre].name} | 
                <i class="${PLATFORMS_DATA[proj.platform].icon}"></i> ${PLATFORMS_DATA[proj.platform].name}
            `;
            
            updateDevStatsUI();
        }

        function updateDevStatsUI() {
            const proj = gameState.currentProject;
            if (!proj) return;

            document.getElementById("overlay-progress").innerText = `${Math.floor(proj.progress)}%`;
            document.getElementById("overlay-progress-bar").style.width = `${proj.progress}%`;
            
            document.getElementById("overlay-code").innerText = Math.floor(proj.code);
            document.getElementById("overlay-art").innerText = Math.floor(proj.art);
            document.getElementById("overlay-design").innerText = Math.floor(proj.design);
            document.getElementById("overlay-bugs").innerText = Math.floor(proj.bugs);

            const btn = document.getElementById("dev-action-btn");
            if (proj.state === "coding") {
                btn.className = "btn-dev-action disabled";
                btn.innerText = "开发中，员工正在输出技术力...";
                btn.disabled = true;
            } else if (proj.state === "debugging") {
                btn.className = "btn-dev-action bug-fixing";
                btn.innerText = "开发完成！点击开始测试修复Bug";
                btn.disabled = false;
            } else if (proj.state === "finished") {
                btn.className = "btn-dev-action release";
                btn.innerText = "测试完成！宣布正式发布上线";
                btn.disabled = false;
            }
        }

        function developProgressTick() {
            const proj = gameState.currentProject;
            if (!proj || proj.state !== "coding") return;

            let anyPointGenerated = false;

            // 每周根据雇员能力递增点数
            gameState.employees.forEach((emp, index) => {
                // 根据工种产生相对应的点数
                let codeGen = 0, artGen = 0, desGen = 0;
                
                if (emp.role === "programmer") {
                    codeGen = (emp.stats.code * 0.4) + Math.random() * 5;
                    desGen = (emp.stats.design * 0.1);
                    
                    // 专精：引擎架构师 (engine): 自身代码产出提高 40%
                    if (emp.specialty === "engine") {
                        codeGen *= 1.40;
                    }
                    // 专精：全栈工程师 (fullstack): 自身代码实力输出 +30%，且额外输出其产生的代码的 30% 作为设计策划点数
                    if (emp.specialty === "fullstack") {
                        codeGen *= 1.30;
                        desGen += codeGen * 0.30;
                    }
                } else if (emp.role === "artist") {
                    artGen = (emp.stats.art * 0.45) + Math.random() * 5;
                    
                    // 专精：原画主美 (concept): 自身美术表现点数产出提高 50%
                    if (emp.specialty === "concept") {
                        artGen *= 1.50;
                    }
                } else if (emp.role === "designer") {
                    desGen = (emp.stats.design * 0.45) + Math.random() * 5;
                    codeGen = (emp.stats.code * 0.1);
                    
                    // 专精：创意主笔 (writer): 策划产出增幅 40%
                    if (emp.specialty === "writer") {
                        desGen *= 1.40;
                    }
                }

                // 产生 Bug 的概率 (Debug 狂魔减半)
                let bugChance = emp.trait === "debug" ? 0.07 : 0.15;
                if (Math.random() < bugChance) {
                    proj.bugs += Math.floor(Math.random() * 3) + 1;
                    spawnFloatingText("BUG+", "overlay-bugs", "bug");
                    playSFX("bug");
                }

                // 累加属性
                proj.code += codeGen;
                proj.art += artGen;
                proj.design += desGen;

                // 飘字与音效效果
                if (codeGen > 2.5) { spawnFloatingText(`+${Math.round(codeGen)}`, "overlay-code", "code"); anyPointGenerated = true; }
                if (artGen > 2.5) { spawnFloatingText(`+${Math.round(artGen)}`, "overlay-art", "art"); anyPointGenerated = true; }
                if (desGen > 2.5) { spawnFloatingText(`+${Math.round(desGen)}`, "overlay-design", "design"); anyPointGenerated = true; }
            });

            if (anyPointGenerated) {
                playSFX("point");
            }

            // 增加开发进度 (进度速度由所有员工总效率决定)
            const teamPower = gameState.employees.reduce((sum, emp) => sum + (emp.stats.code + emp.stats.art + emp.stats.design), 0);
            
            // 专精：引擎架构师 (engine): 开发进度推进效率额外提高 25%
            let engineSpeedBonus = 1.0;
            gameState.employees.forEach(emp => {
                if (emp.specialty === "engine") {
                    engineSpeedBonus += 0.25;
                }
            });

            const baseProgressStep = ((teamPower * 0.08) + 10) * engineSpeedBonus;
            proj.progress += baseProgressStep;

            if (proj.progress >= 100) {
                proj.progress = 100;
                proj.state = "debugging";
                playSFX("success");
                
                // 开始随机生成可点击的 QA Bug
                startBugSpawning();
            }

            updateDevStatsUI();
        }

        function triggerDevAction() {
            const proj = gameState.currentProject;
            if (!proj) return;

            if (proj.state === "debugging") {
                // 点击修复 Bug (计算 Debug 狂魔加成)
                let qaPower = gameState.employees.reduce((sum, emp) => {
                    let power = emp.stats.code;
                    if (emp.trait === "debug") {
                        power = Math.round(power * 1.5); // Debug狂魔加成+50%
                    }
                    return sum + power;
                }, 0) + 10;
                
                let fixCount = Math.round(qaPower * 0.4 + 2);
                proj.bugs -= fixCount;
                playSFX("click");
                
                if (proj.bugs <= 0) {
                    proj.bugs = 0;
                    proj.state = "finished";
                    playSFX("success");
                }
                updateDevStatsUI();
            } else if (proj.state === "finished") {
                // 点击发布游戏，改为先弹出发行商选择对话框，而不再直接 releaseGame
                playSFX("click");
                showPublisherModal();
            }
        }

        function releaseGame(publisherType) {
            const proj = gameState.currentProject;
            if (!proj) return;

            // 应用发行商的前期收支与粉丝曝光乘数
            let fansMultiplier = 1.0;
            if (publisherType === "tiktok") {
                gameState.funds += 5000;
                fansMultiplier = 1.5;
            } else if (publisherType === "steam") {
                gameState.funds -= 5000;
                fansMultiplier = 2.5;
            }

            // 评估分数算法
            const totalPoints = proj.code + proj.art + proj.design;
            const platformTarget = PLATFORMS_DATA[proj.platform].scale * 150; // 主机要求最高
            
            // 契合度与热门趋势检查
            let bonus = 1.0;
            const topic = TOPICS_DATA[proj.topic];
            if (topic.bestGenres.includes(proj.genre)) {
                bonus += 0.2; // 完美匹配 1.2
            }
            if (gameState.activeTrend.genre === proj.genre) bonus += 0.15;
            if (gameState.activeTrend.topic === proj.topic) bonus += 0.15;

            // 最终品质打分
            let baseScore = (totalPoints / platformTarget) * 6 * bonus;
            
            // 特效主美专精 (animator): 研发并发行【休闲类】或【地牢冒险类】游戏时，评分提升 5%
            const hasAnimator = gameState.employees.some(emp => emp.specialty === "animator");
            if (hasAnimator && (proj.genre === "Casual" || proj.genre === "Roguelike")) {
                baseScore *= 1.05;
            }

            if (baseScore > 9.9) baseScore = 9.9;
            if (baseScore < 3.0) baseScore = 3.0 + Math.random()*2;
            const finalScore = parseFloat(baseScore.toFixed(1));

            // 生成评论列表
            const reviews = generateReviewComments(proj, finalScore);
            
            // 创意主笔专精 (writer): 每一个创意主笔增幅新游发售获得的粉丝基数 20%
            let writerBonusMultiplier = 1.0;
            gameState.employees.forEach(emp => {
                if (emp.specialty === "writer") {
                    writerBonusMultiplier += 0.20;
                }
            });

            // 生成游戏结果
            const release = {
                name: proj.name,
                platform: proj.platform,
                genre: proj.genre,
                topic: proj.topic,
                rating: finalScore,
                weeksSinceRelease: 0,
                revenueGenerated: 0,
                publisher: publisherType,
                fansGained: Math.round(finalScore * finalScore * 25 * bonus * fansMultiplier * writerBonusMultiplier)
            };

            gameState.releases.unshift(release);
            gameState.fans += release.fansGained;
            gameState.currentProject = null; // 清空项目

            // 写入编年史大事记
            const pubNames = { self: "自主发行", tiktok: "抖音独占推广", steam: "Steam签约发行" };
            addChronicleEntry(`🎮 成功发布了由【${pubNames[publisherType]}】承销的《${release.name}》（类型：${GENRES_DATA[release.genre].name}，题材：${TOPICS_DATA[release.topic].name}），斩获综合评分 ${release.rating}，吸引了 ${release.fansGained.toLocaleString()} 名新拥趸！`);

            // 隐藏开发遮罩与发行商选择弹窗，弹出评测模态框
            document.getElementById("development-overlay").classList.remove("active");
            document.getElementById("publisher-modal").classList.remove("active");
            showReviewModal(release, reviews);
        }

        // ==========================================================================
        // 评测报告
        // ==========================================================================
        function generateReviewComments(proj, score) {
            let list = [];
            const isGood = score >= 7.5;
            const isBad = score < 5.5;

            // 1. 策划评论
            let plannerComment = "";
            if (isGood) {
                plannerComment = `题材《${TOPICS_DATA[proj.topic].name}》的创意很有诚意，核心关卡很有粘性！`;
            } else if (isBad) {
                plannerComment = `玩法比较匮乏，感觉根本没有抓住玩家的情感痛点。`;
            } else {
                plannerComment = `核心机制还行，不过缺乏让人眼前一亮的惊喜点，中规中矩。`;
            }
            list.push({ reviewer: "抖音小游戏前哨站", text: plannerComment, score: Math.round(score + (Math.random() - 0.5)) });

            // 2. 美术评论
            let artComment = "";
            if (proj.art > proj.code * 1.5) {
                artComment = `美术表现极其惊艳！色彩搭配极具艺术冲击力。`;
            } else if (isBad) {
                artComment = `画面素材有些简陋，感觉像是临时凑来的素材。`;
            } else {
                artComment = `视觉效果还可以，能够保障游戏的基本沉浸感。`;
            }
            list.push({ reviewer: "桔子游民画报", text: artComment, score: Math.round(score + (Math.random() - 0.5)) });

            // 3. 极客技术评论
            let techComment = "";
            if (score > 8.0) {
                techComment = `流畅度拉满，抖音小游戏的加载优化做到了行业顶尖水平，无卡顿。`;
            } else if (isBad) {
                techComment = `代码优化极差，不仅卡顿，而且有几处导致崩溃的严重隐患。`;
            } else {
                techComment = `整体运行平稳，技术表现符合同品类平均水平。`;
            }
            list.push({ reviewer: "Geek极客评测", text: techComment, score: Math.round(score + (Math.random() - 0.5)) });

            return list;
        }

        function showReviewModal(release, reviews) {
            document.getElementById("review-modal").classList.add("active");
            document.getElementById("modal-rating").innerText = release.rating;
            
            // 星星渲染
            const starContainer = document.getElementById("modal-stars");
            starContainer.innerHTML = "";
            const starCount = Math.round(release.rating / 2);
            for (let i = 0; i < 5; i++) {
                const star = document.createElement("i");
                star.className = i < starCount ? "fa-solid fa-star" : "fa-regular fa-star";
                starContainer.appendChild(star);
            }

            // 绘制霓虹销量图
            setTimeout(() => {
                drawTrendChart("modal-chart-box", release.rating);
            }, 100);

            // 评论渲染
            renderList(document.getElementById("modal-reviews"), reviews, (rev) => ({
                className: "review-item",
                html: `
                    <div class="reviewer-meta">
                        <span class="reviewer-name">${rev.reviewer}</span>
                        <span class="reviewer-score">${rev.score}分</span>
                    </div>
                    <p class="review-text">“${rev.text}”</p>
                `
            }));
        }

        function closeReviewModal() {
            document.getElementById("review-modal").classList.remove("active");
            switchScreen('office');
        }

        // ==========================================================================
        // 招募雇员模块
        // ==========================================================================
        function generateHiringPool() {
            hiringPool = [];
            const roles = ["designer", "programmer", "artist"];
            
            for (let i = 0; i < 3; i++) {
                const role = roles[i];
                const rName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)] + (Math.random() > 0.5 ? "姐" : "哥");
                
                // 属性浮动
                const seed = Math.random();
                const code = Math.round(role === "programmer" ? 25 + seed * 30 : 5 + seed * 15);
                const art = Math.round(role === "artist" ? 28 + seed * 28 : 5 + seed * 15);
                const design = Math.round(role === "designer" ? 26 + seed * 30 : 8 + seed * 12);
                
                let salary = Math.round((code + art + design) * 22 + 500);
                const cost = Math.round(salary * 2); // 招聘费

                // 随机产生员工特质
                const traitKeys = Object.keys(EMPLOYEE_TRAITS);
                const randomTrait = Math.random() > 0.35 ? traitKeys[Math.floor(Math.random() * (traitKeys.length - 1)) + 1] : "none";
                
                if (randomTrait === "salary") {
                    salary = salary * 2; // 薪水杀手双倍周薪
                }

                hiringPool.push({
                    name: rName,
                    role: role,
                    stats: { code, art, design },
                    salary: salary,
                    cost: cost,
                    level: 1,
                    trait: randomTrait
                });
            }
        }

        function loadStaffRecruits() {
            renderList(document.getElementById("hiring-list"), hiringPool, (cand, idx) => {
                let iconClass = "fa-laptop-code";
                let roleColor = "var(--accent-neon)";
                let roleName = "程序员";
                if (cand.role === "artist") { roleColor = "var(--accent-pink)"; roleName = "美术设计师"; iconClass = "fa-palette"; }
                if (cand.role === "designer") { roleColor = "var(--accent-yellow)"; roleName = "核心策划"; iconClass = "fa-lightbulb"; }

                const traitObj = EMPLOYEE_TRAITS[cand.trait || "none"];
                const traitHTML = cand.trait && cand.trait !== "none" ? `<span class="trait-badge ${traitObj.badgeClass}" title="${traitObj.desc}">${traitObj.name}</span>` : "";

                return { className: "candidate-card", html: `
                    <div class="candidate-header">
                        <div class="candidate-info">
                            <div class="staff-avatar ${cand.role}">
                                <i class="fa-solid ${iconClass}"></i>
                            </div>
                            <div class="staff-profile">
                                <span class="staff-name">${cand.name} ${traitHTML}</span>
                                <span class="staff-level" style="color: ${roleColor}">${roleName}</span>
                            </div>
                        </div>
                    </div>
                    <div class="candidate-skills">
                        <div class="candidate-skill">
                            <span class="candidate-skill-val" style="color: var(--accent-neon);">${cand.stats.code}</span>
                            <span class="candidate-skill-lbl">代码</span>
                        </div>
                        <div class="candidate-skill">
                            <span class="candidate-skill-val" style="color: var(--accent-pink);">${cand.stats.art}</span>
                            <span class="candidate-skill-lbl">美术</span>
                        </div>
                        <div class="candidate-skill">
                            <span class="candidate-skill-val" style="color: var(--accent-yellow);">${cand.stats.design}</span>
                            <span class="candidate-skill-lbl">策划</span>
                        </div>
                    </div>
                    <div class="candidate-salary-box">
                        <span class="list-lbl">期望周薪</span>
                        <span class="candidate-salary">¥${cand.salary}</span>
                    </div>
                    <button class="btn-hire" onclick="hireCandidate(${idx})">
                        签订雇佣合同 (手续费 ¥${cand.cost})
                    </button>
                ` };
            });
        }

        function hireCandidate(idx) {
            const cand = hiringPool[idx];
            if (gameState.employees.length >= 5) {
                alert("当前办公室卡座已满！无法招募新员工（最大 5 人）。");
                return;
            }
            if (gameState.funds < cand.cost) {
                alert("资金不足以支付入职雇佣手续费！");
                return;
            }

            gameState.funds -= cand.cost;
            gameState.employees.push({
                name: cand.name,
                role: cand.role,
                stats: cand.stats,
                salary: cand.salary,
                level: 1,
                xp: 0,
                trait: cand.trait || "none"
            });

            // 移除招募池中的该候选人并重新加载招募列表
            hiringPool.splice(idx, 1);
            generateHiringPool(); // 再次补充
            saveGame();
            
            let roleName = "程序员";
            if (cand.role === "artist") roleName = "美术师";
            if (cand.role === "designer") roleName = "策划师";
            addChronicleEntry(`🤝 成功招募候选人【${cand.name}】担任【${roleName}】！`);

            updateStatsUI();
            loadStaffRecruits();
            playSFX("click");
            alert(`恭喜！${cand.name} 已成功入职！`);
        }

        function trainEmployee(idx) {
            const emp = gameState.employees[idx];
            let cost = emp.level * 4000;
            // 摸鱼达人培训成本减半
            if (emp.trait === "lazy") {
                cost = Math.round(cost / 2);
            }
            
            if (gameState.funds < cost) {
                alert("资金不足以支付员工培训费！");
                return;
            }

            // 备份旧状态用于对比展示
            const oldLevel = emp.level;
            const oldStats = { ...emp.stats };

            gameState.funds -= cost;
            emp.level++;
            
            // 属性成长加成计算
            let factor = 1.0;
            if (emp.trait === "multi") {
                factor = 1.2; // 全能选手1.2倍
            }
            if (emp.trait === "lazy") {
                factor = Math.random() > 0.5 ? 1.6 : 0.4; // 摸鱼达人非常随机
            }

            // 提升属性
            if (emp.role === "programmer") {
                emp.stats.code += Math.round((Math.floor(Math.random() * 8) + 5) * factor);
                emp.stats.design += Math.round((Math.floor(Math.random() * 3) + 1) * factor);
            } else if (emp.role === "artist") {
                emp.stats.art += Math.round((Math.floor(Math.random() * 8) + 5) * factor);
            } else if (emp.role === "designer") {
                emp.stats.design += Math.round((Math.floor(Math.random() * 8) + 5) * factor);
                emp.stats.code += Math.round((Math.floor(Math.random() * 3) + 1) * factor);
            }

            // 加薪
            emp.salary = Math.round(emp.salary * 1.25);

            addChronicleEntry(`🎓 团队成员【${emp.name}】完成了高强度的专业技能培训，成功晋升至等级 Lv.${emp.level}！`);

            saveGame();
            updateStatsUI();
            loadOfficeDesks();
            playSFX("upgrade");

            // 构建精美的晋升数值对比报告
            const diffs = [];
            if (emp.stats.code > oldStats.code) {
                diffs.push(`<span>代码能力:</span> <span>${oldStats.code} ➔ <b style="color: var(--accent-neon);">${emp.stats.code}</b> (+${emp.stats.code - oldStats.code})</span>`);
            }
            if (emp.stats.art > oldStats.art) {
                diffs.push(`<span>美术表现:</span> <span>${oldStats.art} ➔ <b style="color: var(--accent-pink);">${emp.stats.art}</b> (+${emp.stats.art - oldStats.art})</span>`);
            }
            if (emp.stats.design > oldStats.design) {
                diffs.push(`<span>策划创意:</span> <span>${oldStats.design} ➔ <b style="color: var(--accent-yellow);">${emp.stats.design}</b> (+${emp.stats.design - oldStats.design})</span>`);
            }

            const msg = `
                <div style="text-align: left; display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.2rem;">
                    <div style="font-size: 1.05rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.4rem; font-weight: 700; color: #fff;">
                        🍊 ${escapeHtml(emp.name)} 培训晋升成功！
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>级别晋升:</span>
                        <span>Lv.${oldLevel} ➔ <b style="color: var(--accent-yellow);">Lv.${emp.level}</b></span>
                    </div>
                    ${diffs.map(d => `<div style="display: flex; justify-content: space-between; font-size: 0.88rem; opacity: 0.95;">${d}</div>`).join('')}
                </div>
            `;
            alert(msg, "工作室人才升级简报");
        }

        // ==========================================================================
        // 科技研究模块
        // ==========================================================================
        const RESEARCH_DATABASE = {
            genre: {
                "RPG": { name: "角色扮演 (RPG)", desc: "解锁后可以研发重度硬核角色扮演游戏，盈利上限更高。", cost: 15 },
                "Roguelike": { name: "地牢冒险 (Roguelike)", desc: "解锁后可以研发随机地牢动作类游戏，极其受核心玩家欢迎。", cost: 25 },
                "Tycoon": { name: "模拟经营 (Tycoon)", desc: "研发具有深度的策略模拟经营游戏，粉丝增长效率极佳。", cost: 40 }
            },
            topic: {
                "Space": { name: "科幻深空", desc: "太空歌剧与硬科幻背景，是科幻爱好者的首选主题。", cost: 10 },
                "Cyberpunk": { name: "赛博都市", desc: "霓虹美学与高科技低生活题材，拥有极强的视觉可塑性。", cost: 20 },
                "Retro": { name: "像素复古", desc: "老派怀旧风，用最纯粹的游戏玩法打动玩家。", cost: 30 }
            },
            platform: {
                "TikTok": { name: "抖音小游戏生态", desc: "解锁接入抖音推荐算法，大幅提升轻度游戏的销量上限。", cost: 12 },
                "PC": { name: "Steam商店发行", desc: "发行至全球最大的个人电脑游戏平台，高定价高销量上限。", cost: 28 },
                "Console": { name: "索尼/任天堂主机端", desc: "进军最重度的家庭娱乐主机阵营，品质要求极苛刻但口碑爆炸。", cost: 50 }
            }
        };

        function switchResearchTab(tab, btn) {
            activeResearchTab = tab;
            
            // 切换按钮高亮
            const links = document.querySelectorAll(".research-tabs .tab-link");
            links.forEach(l => l.classList.remove("active"));
            btn.classList.add("active");

            loadResearchTree();
        }

        function loadResearchTree() {
            const container = document.getElementById("research-list");
            container.innerHTML = "";

            const db = RESEARCH_DATABASE[activeResearchTab];
            Object.keys(db).forEach(key => {
                const item = db[key];
                
                // 判断是否已解锁
                let isUnlocked = false;
                if (activeResearchTab === "genre") isUnlocked = gameState.unlockedGenres.includes(key);
                if (activeResearchTab === "topic") isUnlocked = gameState.unlockedTopics.includes(key);
                if (activeResearchTab === "platform") isUnlocked = gameState.unlockedPlatforms.includes(key);

                const card = document.createElement("div");
                card.className = "research-card";
                card.innerHTML = `
                    <div class="research-info">
                        <span class="research-name">${item.name}</span>
                        <p class="research-desc">${item.desc}</p>
                    </div>
                    <div class="research-action">
                        <span class="research-cost"><i class="fa-solid fa-lightbulb"></i> ${item.cost} RP</span>
                        <button class="btn-research" ${isUnlocked || gameState.rp < item.cost ? 'disabled' : ''} onclick="researchTech('${key}')">
                            ${isUnlocked ? '已成功研发' : '启动科技攻关'}
                        </button>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function researchTech(key) {
            const db = RESEARCH_DATABASE[activeResearchTab];
            const item = db[key];

            if (gameState.rp < item.cost) {
                alert("您的研发点数 (RP) 不足！");
                return;
            }

            gameState.rp -= item.cost;
            if (activeResearchTab === "genre") gameState.unlockedGenres.push(key);
            if (activeResearchTab === "topic") gameState.unlockedTopics.push(key);
            if (activeResearchTab === "platform") gameState.unlockedPlatforms.push(key);

            saveGame();
            updateStatsUI();
            loadResearchTree();
            alert(`恭喜！已成功解锁《${item.name}》科技，立项时可用！`);
        }

        // ==========================================================================
        // 突发事件引擎
        // ==========================================================================
        const EVENTS_POOL = [
            {
                title: "粉丝的疯狂来信",
                desc: "有一位您的核心粉丝给工作室寄来一封信，表达了他对你们消除类游戏的热爱，并附赠了一张 ¥2,000 的赞助卡。但也有一群玩家抱怨你们没有出新题材，你打算怎么回应？",
                choices: [
                    { text: "收下资金，给玩家发送一封感谢信", action: () => { gameState.funds += 2000; updateStatsUI(); alert("资金增加 ¥2,000"); } },
                    { text: "用 ¥3,000 举办线上粉丝见面会，回馈社区", action: () => { if (gameState.funds < 3000) return alert("资金不足！"); gameState.funds -= 3000; gameState.fans += 500; updateStatsUI(); alert("粉丝增加 500 人"); } }
                ]
            },
            {
                title: "发行商独占诱惑",
                desc: "抖音知名发行大厂找到你们，承诺如果你们下一款游戏选择由他们代理发行，将立即一次性打款 ¥20,000 支持，但是这会抽走下款游戏 40% 的总分成。",
                choices: [
                    { text: "同意代理协议，先拿钱再说！", action: () => { gameState.funds += 20000; updateStatsUI(); alert("启动资金增加 ¥20,000"); } },
                    { text: "拒绝大厂代理，坚持自主运营独立自强", action: () => { gameState.fans += 200; updateStatsUI(); alert("独立精神感动了社区，粉丝增长 200 人"); } }
                ]
            },
            {
                title: "核心代码大崩溃",
                desc: "深夜开发时，一处服务器接口突然崩盘。程序员表示如果花 ¥4,000 购买云备份组件可以瞬间修复；否则必须全员加班，全工作室点数暂时下跌。",
                choices: [
                    { text: "紧急出钱购买云备份组件修复", action: () => { if (gameState.funds < 4000) return alert("资金不足！"); gameState.funds -= 4000; updateStatsUI(); alert("危机解除"); } },
                    { text: "拒绝花冤枉钱，全体留下来加班维护", action: () => { gameState.employees.forEach(e => { e.stats.code = Math.max(1, e.stats.code - 2); }); alert("程序员过度劳累，代码开发能力下降"); } }
                ]
            }
        ];

        function triggerRandomEvent() {
            const ev = EVENTS_POOL[Math.floor(Math.random() * EVENTS_POOL.length)];
            
            document.getElementById("event-modal").classList.add("active");
            document.getElementById("event-modal-title").innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${ev.title}`;
            document.getElementById("event-modal-desc").innerText = ev.desc;
            
            const btnContainer = document.getElementById("event-modal-choices");
            btnContainer.innerHTML = "";
            ev.choices.forEach(ch => {
                const btn = document.createElement("button");
                btn.className = "choice-btn";
                btn.innerText = ch.text;
                btn.onclick = () => {
                    ch.action();
                    document.getElementById("event-modal").classList.remove("active");
                };
                btnContainer.appendChild(btn);
            });
        }

        // ==========================================================================
        // 辅助渲染与主逻辑
        // ==========================================================================
        
        // 切换视图面板
        function switchScreen(screenId) {
            // 切换导航条
            const navItems = document.querySelectorAll(".nav-menu .nav-item");
            navItems.forEach(item => item.classList.remove("active"));
            
            const activeNav = document.getElementById(`nav-${screenId}`);
            if (activeNav) activeNav.classList.add("active");

            // 切换大屏
            const screens = document.querySelectorAll(".screen-panel");
            screens.forEach(screen => screen.classList.remove("active"));
            
            const activeScreen = document.getElementById(`panel-${screenId}`);
            if (activeScreen) activeScreen.classList.add("active");

            // 特殊页面数据刷新
            if (screenId === "office") loadOfficeDesks();
            if (screenId === "develop") setupDevelopForm();
            if (screenId === "staff") loadStaffRecruits();
            if (screenId === "research") loadResearchTree();
            if (screenId === "history") loadHistoryReleases();
        }

        function refreshActiveScreen() {
            const activeNav = document.querySelector(".nav-menu .nav-item.active");
            if (!activeNav) return;
            const screenId = activeNav.id.replace("nav-", "");
            // 办公室卡座内容只在玩家操作后变化（招募/培训/专精时已各自重绘），
            // 无需每周全量重建——避免重置 3D 悬停态、滚动位置和不必要的重排。
            // 历史发布榜仅当仍有在售游戏（营收逐周增长）时才需要刷新。
            if (screenId === "history" && gameState.releases.some(g => g.weeksSinceRelease < 16)) {
                loadHistoryReleases();
            }
        }

        // 渲染办公室列表
        function loadOfficeDesks() {
            const container = document.getElementById("office-desks");
            container.innerHTML = "";

            const specialtyNames = {
                engine: "引擎架构师",
                fullstack: "全栈工程师",
                concept: "原画主美",
                animator: "特效主美",
                systems: "系统策划",
                writer: "创意主笔"
            };

            // 循环遍历渲染 5 个卡座
            for (let i = 0; i < 5; i++) {
                const emp = gameState.employees[i];
                const card = document.createElement("div");
                card.className = "desk-card";

                if (emp) {
                    let iconClass = "fa-laptop-code";
                    let roleName = "程序员";
                    if (emp.role === "artist") { roleName = "美术设计师"; iconClass = "fa-palette"; }
                    if (emp.role === "designer") { roleName = "核心策划"; iconClass = "fa-lightbulb"; }

                    // 专精状态展示标签
                    let specialtyTagHtml = "";
                    if (emp.specialty) {
                        let tagColor = "var(--accent-neon)";
                        if (emp.role === "artist") tagColor = "var(--accent-pink)";
                        if (emp.role === "designer") tagColor = "var(--accent-yellow)";
                        specialtyTagHtml = `<span style="font-size: 0.72rem; display: inline-block; padding: 0.1rem 0.35rem; border-radius: 4px; border: 1px solid ${tagColor}; color: ${tagColor}; text-shadow: 0 0 5px ${tagColor}; font-weight: bold; margin-left: 0.3rem;">${specialtyNames[emp.specialty]}</span>`;
                    }

                    // 是否可以专精
                    let actionButtonHtml = `
                        <button class="btn-research" style="border-color: var(--accent-yellow); color: var(--accent-yellow);" onclick="trainEmployee(${i})">
                            精英培训 (¥${emp.level * 4000})
                        </button>
                    `;
                    if (emp.level >= 5 && !emp.specialty) {
                        actionButtonHtml = `
                            <div style="display: flex; gap: 0.4rem; width: 100%;">
                                <button class="btn-research" style="flex: 1; border-color: var(--accent-yellow); color: var(--accent-yellow);" onclick="trainEmployee(${i})">
                                    培训 (¥${emp.level * 4000})
                                </button>
                                <button class="btn-research" style="flex: 1.3; border-color: var(--accent-neon); color: var(--accent-neon); box-shadow: 0 0 8px rgba(0, 240, 255, 0.2);" onclick="openSpecialtyModal(${i})">
                                    ✨ 职业专精
                                </button>
                            </div>
                        `;
                    }

                    card.innerHTML = `
                        <div class="staff-avatar-box">
                            <div class="staff-avatar ${emp.role}">
                                <i class="fa-solid ${iconClass}"></i>
                                <span class="staff-role-badge">Lv</span>
                            </div>
                            <div class="staff-profile">
                                <div style="display: flex; align-items: center; flex-wrap: wrap;">
                                    <span class="staff-name">${escapeHtml(emp.name)}</span>
                                    ${specialtyTagHtml}
                                </div>
                                <span class="staff-level">${roleName} | 等级 Lv.${emp.level}</span>
                            </div>
                        </div>
                        <div class="staff-skills">
                            <div class="skill-stat">
                                <span class="skill-val code">${emp.stats.code}</span>
                                <span class="skill-lbl">代码</span>
                            </div>
                            <div class="skill-stat">
                                <span class="skill-val art">${emp.stats.art}</span>
                                <span class="skill-lbl">美术</span>
                            </div>
                            <div class="skill-stat">
                                <span class="skill-val design">${emp.stats.design}</span>
                                <span class="skill-lbl">设计</span>
                            </div>
                        </div>
                        <div>
                            ${actionButtonHtml}
                        </div>
                    `;
                } else {
                    // 空卡座
                    card.innerHTML = `
                        <div class="staff-avatar-box" style="opacity: 0.4;">
                            <div class="staff-avatar" style="border-color: rgba(255,255,255,0.1); color: var(--text-secondary);">
                                <i class="fa-solid fa-chair"></i>
                            </div>
                            <div class="staff-profile">
                                <span class="staff-name" style="color: var(--text-secondary);">空置开发卡座</span>
                                <span class="staff-level">前往人才招募中心扩大团队</span>
                            </div>
                        </div>
                        <button class="btn-research" onclick="switchScreen('staff')">
                            快速招募员工
                        </button>
                    `;
                }
                container.appendChild(card);
            }
        }

        // 渲染作品陈列室
        function loadHistoryReleases() {
            const emptyHtml = `<p style="text-align: center; color: var(--text-secondary); margin-top: 3rem;">尚未发布任何一款游戏，请前往左侧启动研发！</p>`;
            renderList(document.getElementById("history-releases"), gameState.releases, (game) => ({
                className: "history-item",
                html: `
                    <div class="game-title-box">
                        <span class="game-title">${escapeHtml(game.name)}</span>
                        <span class="game-metadata">${TOPICS_DATA[game.topic].name} | ${GENRES_DATA[game.genre].name}</span>
                    </div>
                    <div class="game-rating-box">
                        <i class="fa-solid fa-star"></i>口碑分 ${game.rating}
                    </div>
                    <div class="history-stat-box">
                        <span class="history-stat-lbl">目标渠道</span>
                        <span class="history-stat-val" style="color: var(--accent-neon);">${PLATFORMS_DATA[game.platform].name}</span>
                    </div>
                    <div class="history-stat-box">
                        <span class="history-stat-lbl">积累粉丝</span>
                        <span class="history-stat-val" style="color: var(--accent-pink);">+${game.fansGained} 人</span>
                    </div>
                    <div class="history-stat-box">
                        <span class="history-stat-lbl">创造毛利</span>
                        <span class="history-stat-val" style="color: var(--accent-yellow);">¥${game.revenueGenerated}</span>
                    </div>
                `
            }), emptyHtml);
        }

        // 顶部核心数据 UI 缓存与数值变化闪烁动效
        let lastUIStats = { funds: 0, fans: 0, rp: 0 };
        let isUIInitialized = false;

        function triggerValueFlash(elementId, type) {
            const el = document.getElementById(elementId);
            if (!el) return;
            
            // 先移除之前的动画类以触发重新播放
            el.classList.remove("flash-up", "flash-down");
            void el.offsetWidth; // 强制 Reflow
            el.classList.add(type === "up" ? "flash-up" : "flash-down");
        }

        // 渲染顶部数据
        function updateStatsUI() {
            // 在更新数值前，进行高亮闪烁判定及飘字特效触发
            if (isUIInitialized) {
                if (lastUIStats.funds !== undefined) {
                    if (gameState.funds > lastUIStats.funds) {
                        triggerValueFlash("stat-funds", "up");
                        spawnFloatingText(`+¥${Math.round(gameState.funds - lastUIStats.funds).toLocaleString()}`, "stat-funds", "up");
                    }
                    if (gameState.funds < lastUIStats.funds) {
                        triggerValueFlash("stat-funds", "down");
                        spawnFloatingText(`-¥${Math.round(lastUIStats.funds - gameState.funds).toLocaleString()}`, "stat-funds", "down");
                    }
                }
                if (lastUIStats.fans !== undefined) {
                    if (gameState.fans > lastUIStats.fans) {
                        triggerValueFlash("stat-fans", "up");
                        spawnFloatingText(`+${Math.round(gameState.fans - lastUIStats.fans).toLocaleString()} 粉丝`, "stat-fans", "up");
                    }
                    if (gameState.fans < lastUIStats.fans) {
                        triggerValueFlash("stat-fans", "down");
                        spawnFloatingText(`-${Math.round(lastUIStats.fans - gameState.fans).toLocaleString()} 粉丝`, "stat-fans", "down");
                    }
                }
                if (lastUIStats.rp !== undefined) {
                    if (gameState.rp > lastUIStats.rp) {
                        triggerValueFlash("stat-rp", "up");
                        spawnFloatingText(`+${gameState.rp - lastUIStats.rp} RP`, "stat-rp", "up");
                    }
                    if (gameState.rp < lastUIStats.rp) {
                        triggerValueFlash("stat-rp", "down");
                        spawnFloatingText(`-${lastUIStats.rp - gameState.rp} RP`, "stat-rp", "down");
                    }
                }
            }

            // 更新缓存，以防下次判定偏离
            lastUIStats = {
                funds: gameState.funds,
                fans: gameState.fans,
                rp: gameState.rp
            };
            isUIInitialized = true;

            document.getElementById("stat-funds").innerText = `¥${gameState.funds.toLocaleString()}`;
            document.getElementById("stat-fans").innerText = gameState.fans.toLocaleString();
            document.getElementById("stat-rp").innerText = gameState.rp;
            document.getElementById("stat-date").innerText = `第 ${gameState.date.year} 年 ${gameState.date.month} 月 ${gameState.date.week} 周`;

            // 侧栏简报更新
            document.getElementById("aside-released-count").innerText = `${gameState.releases.length} 款`;
            const inc = document.getElementById("aside-last-income");
            inc.innerText = `${gameState.lastIncome >= 0 ? '+' : ''}¥${gameState.lastIncome.toLocaleString()}`;
            inc.style.color = gameState.lastIncome >= 0 ? "var(--accent-neon)" : "var(--accent-pink)";

            const weeklyWages = gameState.employees.reduce((sum, emp) => sum + emp.salary, 0);
            document.getElementById("aside-weekly-wages").innerText = `¥${weeklyWages}`;
            document.getElementById("aside-weekly-rent").innerText = `¥500`;

            // 财务折叠面板内容更新
            const lastSalesVal = gameState.lastSales || 0;
            document.getElementById("bill-game-sales").innerText = `+¥${lastSalesVal.toLocaleString()}`;
            document.getElementById("bill-employee-wages").innerText = `-¥${weeklyWages.toLocaleString()}`;

            // 趋势更新
            document.getElementById("aside-trend-genre").innerText = GENRES_DATA[gameState.activeTrend.genre].name;
            document.getElementById("aside-trend-topic").innerText = TOPICS_DATA[gameState.activeTrend.topic].name;
        }

        // 更新大趋势
        function updateTrends() {
            const genres = Object.keys(GENRES_DATA);
            const topics = Object.keys(TOPICS_DATA);
            gameState.activeTrend.genre = genres[Math.floor(Math.random() * genres.length)];
            gameState.activeTrend.topic = topics[Math.floor(Math.random() * topics.length)];
            
            // 弹出轻微通知提示
            spawnFloatingText("市场趋势发生偏转！", "stat-date", "design");
        }

        // 飘字特效生成器 (优化性能：避免 getBoundingClientRect 触发强制 Reflow)
        function spawnFloatingText(text, targetId, className) {
            const targetEl = document.getElementById(targetId);
            if (!targetEl) return;

            // 动态确保目标父容器具有 relative 定位
            if (window.getComputedStyle(targetEl).position === "static") {
                targetEl.style.position = "relative";
            }

            const fl = document.createElement("div");
            fl.className = `floating-point ${className}`;
            fl.innerText = text;
            
            // 采用局部相对定位
            fl.style.position = "absolute";
            fl.style.left = `calc(50% + ${Math.random() * 30 - 15}px)`;
            fl.style.top = "-15px";
            fl.style.transform = "translateX(-50%)";

            targetEl.appendChild(fl);
            
            // 动画播放完直接摧毁
            setTimeout(() => {
                fl.remove();
            }, 1200);
        }

        // ==========================================================================
        // 1. 销量趋势 SVG 折线图绘制引擎 (SVG Trend Chart Drawer)
        // ==========================================================================
        function drawTrendChart(containerId, rating) {
            const container = document.getElementById(containerId);
            if (!container) return;
            container.innerHTML = "";

            const baseValue = Math.round(rating * rating * 90 + 250);
            let data = [];
            for (let i = 0; i < 8; i++) {
                const factor = Math.pow(0.65 + (rating * 0.02), i);
                data.push(Math.round(baseValue * factor + Math.random() * (baseValue * 0.05)));
            }

            const width = container.clientWidth || 400;
            const height = 120;
            const paddingX = 35;
            const paddingY = 18;

            const maxVal = Math.max(...data) * 1.15 || 100;
            const minVal = 0;

            const getX = (idx) => paddingX + (idx * (width - paddingX * 2) / (data.length - 1));
            const getY = (val) => height - paddingY - ((val - minVal) * (height - paddingY * 2) / (maxVal - minVal));

            let svgContent = `
                <svg class="chart-svg" viewBox="0 0 ${width} ${height}">
                    <defs>
                        <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="var(--accent-neon)" stop-opacity="0.4"/>
                            <stop offset="100%" stop-color="var(--accent-neon)" stop-opacity="0"/>
                        </linearGradient>
                    </defs>
                    <line x1="${paddingX}" y1="${getY(maxVal*0.75)}" x2="${width - paddingX}" y2="${getY(maxVal*0.75)}" class="chart-grid-line" />
                    <line x1="${paddingX}" y1="${getY(maxVal*0.5)}" x2="${width - paddingX}" y2="${getY(maxVal*0.5)}" class="chart-grid-line" />
                    <line x1="${paddingX}" y1="${getY(maxVal*0.25)}" x2="${width - paddingX}" y2="${getY(maxVal*0.25)}" class="chart-grid-line" />
                    
                    <line x1="${paddingX}" y1="${height - paddingY}" x2="${width - paddingX}" y2="${height - paddingY}" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
            `;

            let polylinePoints = [];
            let areaPoints = [`${getX(0)},${height - paddingY}`];

            data.forEach((val, idx) => {
                const px = getX(idx);
                const py = getY(val);
                polylinePoints.push(`${px},${py}`);
                areaPoints.push(`${px},${py}`);
                
                svgContent += `<circle cx="${px}" cy="${py}" class="chart-dot"><title>第${idx+1}周销量: ${val}份</title></circle>`;
                svgContent += `<text x="${px}" y="${height - 4}" class="chart-label" text-anchor="middle">W${idx+1}</text>`;
            });
            areaPoints.push(`${getX(data.length - 1)},${height - paddingY}`);

            svgContent = `
                <path d="M ${areaPoints.join(' L ')} Z" class="chart-area" />
                <path d="M ${polylinePoints.join(' L ')}" class="chart-path" />
            ` + svgContent;

            svgContent += `
                <text x="${paddingX - 5}" y="${getY(data[0]) + 4}" class="chart-label" text-anchor="end">${data[0]}</text>
                <text x="${paddingX - 5}" y="${height - paddingY + 4}" class="chart-label" text-anchor="end">0</text>
                </svg>
            `;

            container.innerHTML = svgContent;
        }

        // ==========================================================================
        // 2. 发行商选择控制与交互 (Publisher Management)
        // ==========================================================================
        let tempPublisherType = "self";

        function showPublisherModal() {
            document.getElementById("publisher-modal").classList.add("active");
            selectPublisherOption("self");
        }

        function selectPublisherOption(pubType) {
            tempPublisherType = pubType;
            
            // 样式更新
            const cards = ["self", "tiktok", "steam"];
            cards.forEach(type => {
                const cardEl = document.getElementById(`pub-card-${type}`);
                if (type === pubType) {
                    cardEl.classList.add("selected");
                } else {
                    cardEl.classList.remove("selected");
                }
            });
        }

        function confirmPublisherSelection() {
            if (tempPublisherType === "steam" && gameState.funds < 5000) {
                alert("当前资金不足 ¥5,000，无法支付 Steam 发行申请金！请选择其他渠道。");
                return;
            }
            // 真正进行游戏发布
            releaseGame(tempPublisherType);
        }

        // ==========================================================================
        // 3. 破产保护与勋章特权商店 (Bankruptcy & Medal Perks Shop)
        // ==========================================================================
        async function confirmRestartGame() {
            playSFX("click");
            const ok = await confirm("⚠️ 确定要立刻申请【破产清盘】吗？\n\n这会立刻终结当前的创业周目，当前积累的所有成果与粉丝将按照公式折算为【桔子勋章】！\n您可以携带勋章在多周目特权商店兑换初始资金加倍、动作地牢等继承特权，开启全新的橙色创业帝国之旅！");
            if (ok) {
                triggerBankruptcy();
            }
        }

        async function resetAllGameData() {
            playSFX("click");
            const ok = await confirm("⚠️ 警告：这会彻底删除您当前的游戏进度、所有多周目特权、已积累的【桔子勋章】！\n\n此操作不可逆，确定要清除所有存档并完全重置游戏吗？");
            if (ok) {
                localStorage.removeItem("hoshikuzu_tycoon_save");
                localStorage.removeItem("orange_medals");
                await alert("已成功清除本地所有数据！页面即将刷新重新开始。");
                window.location.reload();
            }
        }

        // ==========================================================================
        // 数据分享与存档导入/导出逻辑
        // ==========================================================================
        function openShareModal() {
            if (typeof playSFX === "function") {
                playSFX("click");
            }
            
            // 编译成就分享卡片文本
            const achievementText = `🏆 【${gameState.companyName}】独立创业战绩卡 🏆
──────────────────────────────
🍊 游戏：《桔子创业模拟器》
📅 创业年份：第 ${gameState.date.year} 年 ${gameState.date.month} 月第 ${gameState.date.week} 周
💰 当前资金：¥${Math.round(gameState.funds).toLocaleString()}
👥 拥有粉丝：${gameState.fans.toLocaleString()} 人
💡 研发实力 (RP)：${gameState.rp}
🎮 独立游戏发行总量：${gameState.releases.length} 款
🏅 累积获得【桔子勋章】：${orangeMedalsCount} 枚
──────────────────────────────
快来与我一决高下，开启您的橙色独立游戏帝国之旅吧！`;
            
            document.getElementById("share-achievement-text").innerText = achievementText;
            
            // 生成存档 Base64 编码数据
            try {
                const saveData = {
                    save: gameState,
                    medals: orangeMedalsCount
                };
                const jsonStr = JSON.stringify(saveData);
                const base64 = utf8ToBase64(jsonStr);
                document.getElementById("share-export-code").value = base64;
            } catch (err) {
                console.error("存档码生成失败", err);
                document.getElementById("share-export-code").value = "存档码生成失败，请重试";
            }
            
            // 清空导入输入框
            document.getElementById("share-import-code").value = "";
            
            // 默认切回成就分享标签
            switchShareTab("achievement");
            
            // 打开模态框
            document.getElementById("share-modal").classList.add("active");
        }

        function closeShareModal() {
            if (typeof playSFX === "function") {
                playSFX("click");
            }
            document.getElementById("share-modal").classList.remove("active");
        }

        function switchShareTab(tab) {
            if (typeof playSFX === "function") {
                playSFX("click");
            }
            
            const tabAchievementBtn = document.getElementById("tab-share-achievement");
            const tabSaveBtn = document.getElementById("tab-share-save");
            const panelAchievement = document.getElementById("share-panel-achievement");
            const panelSave = document.getElementById("share-panel-save");
            
            if (tab === "achievement") {
                tabAchievementBtn.classList.add("active");
                tabSaveBtn.classList.remove("active");
                panelAchievement.style.display = "block";
                panelSave.style.display = "none";
            } else {
                tabAchievementBtn.classList.remove("active");
                tabSaveBtn.classList.add("active");
                panelAchievement.style.display = "none";
                panelSave.style.display = "block";
            }
        }

        function copyAchievementCard() {
            const text = document.getElementById("share-achievement-text").innerText;
            navigator.clipboard.writeText(text).then(() => {
                if (typeof playSFX === "function") playSFX("success");
                spawnFloatingText("成就已复制！", "tab-share-achievement", "up");
            }).catch(err => {
                // 回退方案
                const textarea = document.createElement("textarea");
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
                if (typeof playSFX === "function") playSFX("success");
                spawnFloatingText("成就已复制！", "tab-share-achievement", "up");
            });
        }

        function copyExportSaveCode() {
            const text = document.getElementById("share-export-code").value;
            navigator.clipboard.writeText(text).then(() => {
                if (typeof playSFX === "function") playSFX("success");
                spawnFloatingText("存档码已复制！", "tab-share-save", "up");
            }).catch(err => {
                // 回退方案
                const textarea = document.createElement("textarea");
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
                if (typeof playSFX === "function") playSFX("success");
                spawnFloatingText("存档码已复制！", "tab-share-save", "up");
            });
        }

        async function importSaveCode() {
            const base64 = document.getElementById("share-import-code").value.trim();
            if (!base64) {
                alert("请先粘贴存档码！", "系统提示");
                return;
            }
            
            try {
                // 解码 Base64 并反序列化
                const jsonStr = base64ToUtf8(base64);
                const parsed = JSON.parse(jsonStr);
                
                // 数据完整性验证
                if (!parsed || typeof parsed !== "object" || !parsed.save || parsed.medals === undefined) {
                    throw new Error("格式不完整");
                }
                
                const save = parsed.save;
                if (!save.companyName || save.funds === undefined || !Array.isArray(save.employees) || save.date === undefined) {
                    throw new Error("字段缺失");
                }
                
                // 二次确认覆盖
                const confirmOk = await confirm("⚠️ 警告：导入此存档码会彻底覆盖您当前的单局进度及积累的全部勋章！\n\n您确定要覆盖数据并载入此存档吗？");
                if (confirmOk) {
                    localStorage.setItem("hoshikuzu_tycoon_save", JSON.stringify(save));
                    localStorage.setItem("orange_medals", parsed.medals.toString());
                    closeShareModal();
                    await alert("🎉 存档导入成功！页面即将重载载入新进度。");
                    window.location.reload();
                }
            } catch (err) {
                if (typeof playSFX === "function") playSFX("bug");
                alert("⚠️ 导入失败：存档码无效、已损坏或数据字段不兼容！", "系统提示");
                console.error("导入存档失败", err);
            }
        }

        // ==========================================================================
        // 编年史 (工作室大事件发展志)
        // ==========================================================================
        function addChronicleEntry(text) {
            if (!gameState.chronology) {
                gameState.chronology = [];
            }
            const dateStr = `第 ${gameState.date.year} 年 ${gameState.date.month} 月第 ${gameState.date.week} 周`;
            gameState.chronology.push({
                date: dateStr,
                text: text
            });
            if (gameState.chronology.length > 100) {
                gameState.chronology.shift();
            }
            saveGame();
        }

        function switchHistoryTab(tab) {
            playSFX("click");
            const btnGames = document.getElementById("tab-history-games");
            const btnChronicle = document.getElementById("tab-history-chronicle");
            const panelGames = document.getElementById("history-releases");
            const panelChronicle = document.getElementById("history-chronicle");

            if (tab === "games") {
                btnGames.classList.add("active");
                btnChronicle.classList.remove("active");
                panelGames.style.display = "flex";
                panelChronicle.style.display = "none";
                loadHistoryReleases();
            } else {
                btnGames.classList.remove("active");
                btnChronicle.classList.add("active");
                panelGames.style.display = "none";
                panelChronicle.style.display = "flex";
                loadChronicleTimeline();
            }
        }

        function loadChronicleTimeline() {
            const container = document.getElementById("history-chronicle");
            container.innerHTML = "";

            if (!gameState.chronology || gameState.chronology.length === 0) {
                container.innerHTML = `<p style="text-align: center; color: var(--text-secondary); margin-top: 3rem;">尚未产生大事件记录，去发行第一款游戏或招募员工吧！</p>`;
                return;
            }

            const list = [...gameState.chronology].reverse();
            list.forEach(entry => {
                const node = document.createElement("div");
                node.className = "chronicle-node";
                node.style.position = "relative";
                node.style.paddingLeft = "1.5rem";
                node.style.marginBottom = "1.2rem";
                node.style.textAlign = "left";
                
                const dot = document.createElement("div");
                dot.style.position = "absolute";
                dot.style.left = "-5px";
                dot.style.top = "6px";
                dot.style.width = "10px";
                dot.style.height = "10px";
                dot.style.borderRadius = "50%";
                dot.style.background = "var(--accent-yellow)";
                dot.style.boxShadow = "0 0 8px var(--accent-yellow)";
                node.appendChild(dot);

                const time = document.createElement("span");
                time.style.fontSize = "0.78rem";
                time.style.color = "var(--accent-neon)";
                time.style.fontWeight = "bold";
                time.style.display = "block";
                time.innerText = entry.date;

                const text = document.createElement("p");
                text.style.fontSize = "0.85rem";
                text.style.color = "var(--text-primary)";
                text.style.margin = "0.2rem 0 0 0";
                text.style.lineHeight = "1.4";
                text.textContent = entry.text;

                node.appendChild(time);
                node.appendChild(text);
                container.appendChild(node);
            });
        }

        // ==========================================================================
        // 财务明细手风琴折叠
        // ==========================================================================
        function toggleWeeklyBill() {
            playSFX("click");
            const panel = document.getElementById("weekly-bill-details");
            const arrow = document.getElementById("bill-arrow");
            if (panel.style.display === "none") {
                panel.style.display = "flex";
                arrow.style.transform = "rotate(180deg)";
            } else {
                panel.style.display = "none";
                arrow.style.transform = "rotate(0deg)";
            }
        }

        // ==========================================================================
        // 互动式 Debug 灭虫小游戏逻辑
        // ==========================================================================
        let bugSpawnInterval = null;

        function startBugSpawning() {
            if (bugSpawnInterval) return;
            const zone = document.getElementById("bug-spawn-zone");
            if (!zone) return;
            zone.innerHTML = "";
            
            bugSpawnInterval = setInterval(() => {
                const proj = gameState.currentProject;
                if (!proj || proj.state !== "debugging" || proj.bugs <= 0) {
                    stopBugSpawning();
                    return;
                }
                
                if (zone.children.length >= 6) return; // 限制同屏上限
                
                const bug = document.createElement("div");
                bug.className = "spawned-bug";
                bug.innerHTML = `<i class="fa-solid fa-bug"></i>`;
                bug.style.position = "absolute";
                
                const x = Math.random() * 80 + 10;
                const y = Math.random() * 50 + 25;
                bug.style.left = `${x}%`;
                bug.style.top = `${y}%`;
                bug.style.pointerEvents = "auto";
                bug.style.cursor = "pointer";
                bug.style.fontSize = `${1.2 + Math.random() * 0.5}rem`;
                bug.style.color = "var(--accent-pink)";
                bug.style.filter = "drop-shadow(0 0 5px var(--accent-pink))";
                bug.style.transition = "transform 0.18s ease, opacity 0.18s";
                bug.style.animation = `bug-wiggle ${0.4 + Math.random() * 0.4}s infinite alternate ease-in-out`;
                
                bug.onclick = (e) => {
                    e.stopPropagation();
                    proj.bugs = Math.max(0, proj.bugs - 1);
                    playSFX("zap");
                    
                    const rect = zone.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const clickY = e.clientY - rect.top;
                    
                    const fl = document.createElement("div");
                    fl.className = "floating-point down";
                    fl.innerText = "-1 BUG";
                    fl.style.position = "absolute";
                    fl.style.left = `${clickX}px`;
                    fl.style.top = `${clickY}px`;
                    fl.style.transform = "translate(-50%, -50%)";
                    fl.style.pointerEvents = "none";
                    fl.style.zIndex = "100";
                    zone.appendChild(fl);
                    setTimeout(() => fl.remove(), 1200);
                    
                    bug.style.transform = "scale(0) rotate(180deg)";
                    bug.style.opacity = "0";
                    setTimeout(() => bug.remove(), 200);
                    
                    if (proj.bugs <= 0) {
                        proj.bugs = 0;
                        proj.state = "finished";
                        playSFX("success");
                        stopBugSpawning();
                    }
                    updateDevStatsUI();
                };
                zone.appendChild(bug);
            }, 1200);
        }

        function stopBugSpawning() {
            if (bugSpawnInterval) {
                clearInterval(bugSpawnInterval);
                bugSpawnInterval = null;
            }
            const zone = document.getElementById("bug-spawn-zone");
            if (zone) zone.innerHTML = "";
        }

        // ==========================================================================
        // 员工专精分支逻辑
        // ==========================================================================
        let tempSpecializingIndex = null;

        function openSpecialtyModal(empIdx) {
            tempSpecializingIndex = empIdx;
            const emp = gameState.employees[empIdx];
            if (!emp) return;

            playSFX("click");
            
            const descEl = document.getElementById("specialty-modal-desc");
            descEl.innerHTML = `请选择 <strong>${escapeHtml(emp.name)}</strong> 的终身发展方向（等级限制：Lv.5以上，单次可选）：`;

            const container = document.getElementById("specialty-choices-container");
            container.innerHTML = "";

            let options = [];
            if (emp.role === "programmer") {
                options = [
                    {
                        key: "engine",
                        name: "引擎架构师 (Engine Architect)",
                        desc: "提升核心算法，游戏开发进度推进速度额外提升 25%，自身代码产出提高 40%。",
                        icon: "fa-laptop-code",
                        color: "var(--accent-neon)"
                    },
                    {
                        key: "fullstack",
                        name: "全栈工程师 (Full-Stack Developer)",
                        desc: "融会贯通，自身获得额外的 30% 代码实力输出与 30% 策划设计点数输出。",
                        icon: "fa-network-wired",
                        color: "var(--accent-neon)"
                    }
                ];
            } else if (emp.role === "artist") {
                options = [
                    {
                        key: "concept",
                        name: "原画主美 (Concept Lead)",
                        desc: "精修原画与UI设定，自身美术表现点数产出提高 50%。",
                        icon: "fa-palette",
                        color: "var(--accent-pink)"
                    },
                    {
                        key: "animator",
                        name: "特效主美 (UI Animator)",
                        desc: "专攻视觉特效，研发并发行【休闲类】或【地牢冒险类】游戏时，评分提升 5%。",
                        icon: "fa-wand-magic-sparkles",
                        color: "var(--accent-pink)"
                    }
                ];
            } else if (emp.role === "designer") {
                options = [
                    {
                        key: "systems",
                        name: "系统策划 (Systems Designer)",
                        desc: "打通平台商业通道，项目立项平台配额金成本减少 15% (可叠加，上限 30%)。",
                        icon: "fa-gears",
                        color: "var(--accent-yellow)"
                    },
                    {
                        key: "writer",
                        name: "创意主笔 (Creative Writer)",
                        desc: "专攻剧本架构，策划产出增幅 40%，且新游发售获得的粉丝基数增幅 20%。",
                        icon: "fa-pen-fancy",
                        color: "var(--accent-yellow)"
                    }
                ];
            }

            options.forEach(opt => {
                const card = document.createElement("div");
                card.className = "choice-btn";
                card.style.display = "flex";
                card.style.flexDirection = "column";
                card.style.alignItems = "flex-start";
                card.style.gap = "0.4rem";
                card.style.padding = "1rem";
                card.style.textAlign = "left";
                card.style.cursor = "pointer";
                
                card.innerHTML = `
                    <div style="display:flex; align-items:center; gap:0.5rem; font-weight:bold; color:${opt.color};">
                        <i class="fa-solid ${opt.icon}"></i> ${opt.name}
                    </div>
                    <p style="font-size:0.8rem; color:var(--text-secondary); line-height:1.4; margin:0;">${opt.desc}</p>
                `;
                card.onclick = () => chooseSpecialty(opt.key);
                container.appendChild(card);
            });

            document.getElementById("specialty-modal").classList.add("active");
        }

        function closeSpecialtyModal() {
            playSFX("click");
            document.getElementById("specialty-modal").classList.remove("active");
        }

        async function chooseSpecialty(key) {
            if (tempSpecializingIndex === null) return;
            const emp = gameState.employees[tempSpecializingIndex];
            if (!emp) return;

            const specialtyNames = {
                engine: "引擎架构师",
                fullstack: "全栈工程师",
                concept: "原画主美",
                animator: "特效主美",
                systems: "系统策划",
                writer: "创意主笔"
            };

            playSFX("success");
            emp.specialty = key;
            
            // 写入大事记
            addChronicleEntry(`🌟 团队核心【${emp.name}】精修学业，成功晋升专精角色【${specialtyNames[key]}】！`);

            saveGame();
            closeSpecialtyModal();
            loadOfficeDesks();
            await alert(`恭喜！员工 ${escapeHtml(emp.name)} 已成功晋升为：${specialtyNames[key]}！专属特权已永久激活。`, "工作室人才专精简报");
        }

        function triggerBankruptcy() {
            playSFX("bankruptcy");
            clearInterval(loopInterval); // 暂停主时钟

            // 计算本局成绩
            const gamesCount = gameState.releases.length;
            const maxFans = gameState.fans;
            const finalMedals = Math.max(1, Math.floor(maxFans / 800) + Math.floor(gamesCount / 4));

            // 更新多周目勋章数据
            orangeMedalsCount += finalMedals;
            localStorage.setItem("orange_medals", orangeMedalsCount);

            // 渲染数据
            document.getElementById("settle-games-count").innerText = `${gamesCount} 款`;
            document.getElementById("settle-max-fans").innerText = `${maxFans} 名`;
            document.getElementById("settle-final-funds").innerText = `¥${Math.round(gameState.funds).toLocaleString()}`;
            document.getElementById("settle-medals-gained").innerText = `+${finalMedals} 枚`;

            // 弹出结算浮层
            document.getElementById("bankruptcy-modal").classList.add("active");
        }

        function goToMedalShop() {
            document.getElementById("bankruptcy-modal").classList.remove("active");
            
            // 重置特权商店选中状态
            shopSelectedPerks = { fundsBoost: false, roguelikeUnlocked: false, fansGrowthBoost: false };
            
            updateMedalShopUI();
            document.getElementById("medal-shop-modal").classList.add("active");
        }

        // 计算所选特权的勋章总花费（fundsBoost=1 / roguelike=2 / fansGrowth=3）
        function perkCost(perks) {
            return (perks.fundsBoost ? 1 : 0)
                + (perks.roguelikeUnlocked ? 2 : 0)
                + (perks.fansGrowthBoost ? 3 : 0);
        }

        function updateMedalShopUI() {
            document.getElementById("shop-owned-medals").innerText = `${orangeMedalsCount} 枚`;
            
            const totalCost = perkCost(shopSelectedPerks);

            document.getElementById("shop-total-cost").innerText = totalCost;
            document.getElementById("shop-remaining-medals").innerText = orangeMedalsCount - totalCost;

            // 按钮高亮与状态
            const perks = [
                { key: "fundsBoost", rowId: "perk-row-funds", badgeId: "perk-badge-funds" },
                { key: "roguelikeUnlocked", rowId: "perk-row-rogue", badgeId: "perk-badge-rogue" },
                { key: "fansGrowthBoost", rowId: "perk-row-fans", badgeId: "perk-badge-fans" }
            ];

            perks.forEach(p => {
                const row = document.getElementById(p.rowId);
                const badge = document.getElementById(p.badgeId);
                if (shopSelectedPerks[p.key]) {
                    row.classList.add("perk-selected");
                    badge.innerText = "已选中";
                    badge.style.borderColor = "var(--accent-yellow)";
                    badge.style.color = "var(--accent-yellow)";
                } else {
                    row.classList.remove("perk-selected");
                    badge.innerText = "未选中";
                    badge.style.borderColor = "rgba(255,255,255,0.2)";
                    badge.style.color = "var(--text-secondary)";
                }
            });
        }

        function togglePerkSelection(perkKey, cost) {
            playSFX("click");
            let tempCost = cost;
            if (shopSelectedPerks[perkKey]) {
                shopSelectedPerks[perkKey] = false;
            } else {
                // 计算当前已扣除
                const currentCost = perkCost(shopSelectedPerks);

                if (currentCost + cost > orangeMedalsCount) {
                    alert("⚠️ 您的桔子勋章余额不足，无法选购此特权！可通过多周目创业破产获取更多勋章。");
                    return;
                }
                shopSelectedPerks[perkKey] = true;
            }
            updateMedalShopUI();
        }

        function applyMedalShopPerksAndStart() {
            playSFX("success");
            const totalCost = perkCost(shopSelectedPerks);

            orangeMedalsCount -= totalCost;
            localStorage.setItem("orange_medals", orangeMedalsCount);

            // 全局重置 gameState（基于默认结构，叠加勋章商店购买的继承特权）
            gameState = createDefaultGameState();
            gameState.funds = shopSelectedPerks.fundsBoost ? 80000 : 50000;
            gameState.unlockedGenres = shopSelectedPerks.roguelikeUnlocked ? ["Casual", "Roguelike"] : ["Casual"];
            gameState.activePerks = { ...shopSelectedPerks };

            saveGame();
            addChronicleEntry("🍊 桔子网络工作室正式重组成立！承载着勋章特权，开启全新的征程。");
            document.getElementById("medal-shop-modal").classList.remove("active");
            
            // 重新开启定时时钟
            startGameClock();
            
            // 重新初始化页面
            loadOfficeDesks();
            generateHiringPool();
            isUIInitialized = false; // 重置标识，避免闪烁上个周目的结算变动数值
            updateStatsUI();
            switchScreen('office');
            
            alert("🍊 工作室重组成功！携带您的继承特权，正式开启全新的桔子创业帝国之旅！");
        }

        // ==========================================================================
        // 4. Web Audio API 8-bit 背景音乐与复古音效合成器 (BGM/SFX Engine)
        // ==========================================================================
        let bgmEnabled = false;
        let sfxEnabled = true;
        let synthAudioCtx = null;
        let bgmInterval = null;
        let bgmBeatIndex = 0;

        function initSynthAudio() {
            if (!synthAudioCtx) {
                synthAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (synthAudioCtx.state === "suspended") {
                synthAudioCtx.resume();
            }
        }

        // Web Audio 复古音效播放
        function playSFX(type) {
            if (!sfxEnabled) return;
            initSynthAudio();
            const now = synthAudioCtx.currentTime;

            if (type === "click") {
                const osc = synthAudioCtx.createOscillator();
                const gain = synthAudioCtx.createGain();
                osc.type = "triangle";
                osc.frequency.setValueAtTime(1000, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
                osc.connect(gain); gain.connect(synthAudioCtx.destination);
                osc.start(); osc.stop(now + 0.08);
            } 
            else if (type === "point") {
                const osc = synthAudioCtx.createOscillator();
                const gain = synthAudioCtx.createGain();
                osc.type = "sine";
                // 产生欢快的短音
                osc.frequency.setValueAtTime(1200 + Math.random()*200, now);
                gain.gain.setValueAtTime(0.015, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
                osc.connect(gain); gain.connect(synthAudioCtx.destination);
                osc.start(); osc.stop(now + 0.05);
            } 
            else if (type === "bug") {
                const osc = synthAudioCtx.createOscillator();
                const gain = synthAudioCtx.createGain();
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(320, now);
                osc.frequency.setValueAtTime(180, now + 0.08);
                gain.gain.setValueAtTime(0.02, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
                osc.connect(gain); gain.connect(synthAudioCtx.destination);
                osc.start(); osc.stop(now + 0.15);
            } 
            else if (type === "success") {
                // 复古琶音 C5-E5-G5-C6
                const freqs = [523.25, 659.25, 783.99, 1046.50];
                freqs.forEach((freq, idx) => {
                    const osc = synthAudioCtx.createOscillator();
                    const gain = synthAudioCtx.createGain();
                    osc.type = "triangle";
                    osc.frequency.setValueAtTime(freq, now + idx * 0.06);
                    gain.gain.setValueAtTime(0.03, now + idx * 0.06);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.15);
                    osc.connect(gain); gain.connect(synthAudioCtx.destination);
                    osc.start(now + idx * 0.06); osc.stop(now + idx * 0.06 + 0.15);
                });
            } 
            else if (type === "upgrade") {
                // 连贯向上滑音
                const osc = synthAudioCtx.createOscillator();
                const gain = synthAudioCtx.createGain();
                osc.type = "triangle";
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(1600, now + 0.25);
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
                osc.connect(gain); gain.connect(synthAudioCtx.destination);
                osc.start(); osc.stop(now + 0.25);
            } 
            else if (type === "bankruptcy") {
                // 悲凉降音
                const osc = synthAudioCtx.createOscillator();
                const gain = synthAudioCtx.createGain();
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.linearRampToValueAtTime(80, now + 0.8);
                gain.gain.setValueAtTime(0.06, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
                osc.connect(gain); gain.connect(synthAudioCtx.destination);
                osc.start(); osc.stop(now + 0.8);
            }
            else if (type === "zap") {
                // 灭虫打击音：短促方波高频下扫，给点击 bug 反馈打击感
                const osc = synthAudioCtx.createOscillator();
                const gain = synthAudioCtx.createGain();
                osc.type = "square";
                osc.frequency.setValueAtTime(880, now);
                osc.frequency.exponentialRampToValueAtTime(120, now + 0.07);
                gain.gain.setValueAtTime(0.03, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
                osc.connect(gain); gain.connect(synthAudioCtx.destination);
                osc.start(); osc.stop(now + 0.07);
            }
        }

        // Web Audio 8-bit 背景音乐合成调度
        // 弹奏简单的经典 8-bit 和弦旋律（C - G - Am - F）
        function playBGMBeat() {
            if (!bgmEnabled) return;
            const now = synthAudioCtx.currentTime;

            // 和弦对应根音音阶 (C3, G3, A3, F3)
            const chords = [130.81, 97.99, 110.00, 87.31];
            // 简单主调旋律
            const melody = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];

            const currentChord = chords[Math.floor(bgmBeatIndex / 8) % chords.length];
            
            // 1. 低音节奏器 (Oscillator 1)
            const bassOsc = synthAudioCtx.createOscillator();
            const bassGain = synthAudioCtx.createGain();
            bassOsc.type = "triangle";
            
            // 拍点低音 (8分音符节奏)
            const isOffBeat = bgmBeatIndex % 2 === 1;
            bassOsc.frequency.setValueAtTime(isOffBeat ? currentChord * 1.5 : currentChord, now);
            
            bassGain.gain.setValueAtTime(0.008, now); // 音量控制在极其微弱以防杂音
            bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
            bassOsc.connect(bassGain); bassGain.connect(synthAudioCtx.destination);
            bassOsc.start(); bassOsc.stop(now + 0.25);

            // 2. 琶音器/主调音符 (Oscillator 2)
            if (bgmBeatIndex % 4 === 0 || bgmBeatIndex % 4 === 2) {
                const leadOsc = synthAudioCtx.createOscillator();
                const leadGain = synthAudioCtx.createGain();
                leadOsc.type = "sine";

                // 随机选择主调音阶中的符合和弦的音符
                const note = melody[Math.floor(Math.random() * melody.length)];
                leadOsc.frequency.setValueAtTime(note, now);
                
                leadGain.gain.setValueAtTime(0.005, now);
                leadGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
                leadOsc.connect(leadGain); leadGain.connect(synthAudioCtx.destination);
                leadOsc.start(); leadOsc.stop(now + 0.35);
            }

            bgmBeatIndex = (bgmBeatIndex + 1) % 32;
        }

        function toggleBGM(e) {
            if (e) e.stopPropagation();
            bgmEnabled = !bgmEnabled;
            initSynthAudio();
            
            const btn = document.getElementById("btn-bgm");
            if (bgmEnabled) {
                btn.classList.add("active");
                btn.innerHTML = `<i class="fa-solid fa-music"></i> 音乐: 开`;
                // 每拍 300 毫秒
                bgmBeatIndex = 0;
                bgmInterval = setInterval(playBGMBeat, 300);
                playSFX("click");
            } else {
                btn.classList.remove("active");
                btn.innerHTML = `<i class="fa-solid fa-music"></i> 音乐: 关`;
                if (bgmInterval) {
                    clearInterval(bgmInterval);
                    bgmInterval = null;
                }
            }
        }

        function toggleSFX(e) {
            if (e) e.stopPropagation();
            sfxEnabled = !sfxEnabled;
            
            const btn = document.getElementById("btn-sfx");
            if (sfxEnabled) {
                btn.classList.add("active");
                btn.innerHTML = `<i class="fa-solid fa-volume-high"></i> 音效: 开`;
                playSFX("click");
            } else {
                btn.classList.remove("active");
                btn.innerHTML = `<i class="fa-solid fa-volume-xmark"></i> 音效: 关`;
            }
        }

        // ==========================================================================
        // 5. 存档与读档 logic (localStorage)
        // ==========================================================================
        const SAVE_KEY = "hoshikuzu_tycoon_save";
        const SAVE_BACKUP_KEY = "hoshikuzu_tycoon_save_bak";

        function saveGame() {
            try {
                const next = JSON.stringify(gameState);
                const prev = localStorage.getItem(SAVE_KEY);
                // 写入新存档前，把上一份正常存档留作备份，损坏时可回滚
                if (prev && prev !== next) {
                    localStorage.setItem(SAVE_BACKUP_KEY, prev);
                }
                localStorage.setItem(SAVE_KEY, next);
            } catch (e) {
                // 隐私模式 / 存储配额超限：跳过本次自动存档，避免每个 tick 抛错卡死游戏
                console.warn("自动存档失败（存储不可用），本次跳过", e);
            }
        }

        function loadGame() {
            // 解析一份存档原文，校验关键字段；无效返回 null
            const parseSave = (raw) => {
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                return (parsed && parsed.companyName) ? parsed : null;
            };

            try {
                const parsed = parseSave(localStorage.getItem(SAVE_KEY));
                if (parsed) {
                    // 用默认结构补全任意旧版本存档的缺失字段，统一兜底兼容
                    gameState = migrateSave(parsed);
                }
            } catch (e) {
                console.error("主存档损坏，尝试回滚到备份", e);
                try {
                    const backup = parseSave(localStorage.getItem(SAVE_BACKUP_KEY));
                    if (backup) {
                        gameState = migrateSave(backup);
                        console.warn("已从备份存档恢复");
                    }
                } catch (e2) {
                    console.error("备份同样损坏，已初始化新公司进度", e2);
                }
            }

            // 针对第一次点击激活 AudioContext
            document.addEventListener("click", () => {
                if (synthAudioCtx && synthAudioCtx.state === "suspended") {
                    synthAudioCtx.resume();
                }
            }, { once: true });
        }
    