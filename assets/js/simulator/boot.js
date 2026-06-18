// ==========================================================================
// 启动引导 (Boot)
// v2.0：时间默认静止，不再有自动时钟。开局先选创始人背景。
// ==========================================================================

// 兼容旧调用：不再有持续时钟，留空避免报错
function startGameClock() { /* v2: 时间由玩家「推进」驱动，无常驻时钟 */ }

window.onload = function () {
    loadGame();
    generateHiringPool();
    updateStatsUI();
    updateAdvanceUI();
    if (typeof applyStageBodyClass === "function") applyStageBodyClass();
    switchScreen('office');

    // 尚未选择创始人背景 => 弹出开局选择
    if (!gameState.founderBackground) {
        openFounderModal();
    } else if (gameState.currentProject) {
        // 研发中：拉回研发看板
        currentHandCards = [];
        showDevBoard();
    }

    document.addEventListener("visibilitychange", () => {
        document.body.classList.toggle("anim-paused", document.hidden);
        // 离开页面时暂停推进，回来不会“偷跑”
        if (document.hidden && typeof stopAdvance === "function") stopAdvance();
    });
};

// ==========================================================================
// 创始人背景选择
// ==========================================================================
function openFounderModal(allowReincarnation = false) {
    const modal = document.getElementById("founder-modal");
    const container = document.getElementById("founder-choices");
    container.innerHTML = "";

    Object.keys(FOUNDER_BACKGROUNDS).forEach(key => {
        const bg = FOUNDER_BACKGROUNDS[key];
        if (bg.reincarnationOnly && !allowReincarnation) return;
        const card = document.createElement("div");
        card.className = "founder-card";
        card.innerHTML = `
            <div class="founder-card-head" style="color:${bg.color};">
                <i class="${bg.icon}"></i> ${bg.name}
            </div>
            <div class="founder-card-stats">
                <span style="color:var(--accent-neon);">代码 ${bg.stats.code}</span>
                <span style="color:var(--accent-pink);">美术 ${bg.stats.art}</span>
                <span style="color:var(--accent-yellow);">策划 ${bg.stats.design}</span>
            </div>
            <p class="founder-card-desc">${bg.desc}</p>
            <button class="founder-card-btn" style="border-color:${bg.color}; color:${bg.color};">选择此背景</button>
        `;
        card.querySelector(".founder-card-btn").onclick = () => chooseFounder(key);
        container.appendChild(card);
    });

    modal.classList.add("active");
}

function chooseFounder(key) {
    const bg = FOUNDER_BACKGROUNDS[key];
    gameState.founderBackground = key;

    // 把创始人（player）改造为对应背景的角色与初始属性
    const player = gameState.employees.find(e => e.id === "player");
    if (player) {
        player.role = bg.role;
        player.stats = { ...bg.stats };
        player.name = `创始人·${bg.name}`;
    }
    // 网红制作人：初始粉丝 +500
    if (key === "influencer") gameState.fans += 500;

    addChronicleEntry(`🍊 工作室成立！创始人以【${bg.name}】身份开启创业之路。`);
    playSFX("success");
    document.getElementById("founder-modal").classList.remove("active");
    saveGame();
    loadOfficeDesks();
    updateStatsUI();
}
