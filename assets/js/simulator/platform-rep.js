// ==========================================================================
// 平台信誉与淘汰系统 (Platform Reputation & Relegation)
// 在某平台发布作品会按评分增减该平台信誉：影响营收乘数，过低则被高端平台拒绝合作。
// 信誉每周向 50 缓慢回归（mean-reversion），给被锁平台留恢复窗口。
// ==========================================================================

const PLATFORM_REP = {
    weeklyDrift: 0.025,   // 每周向 50 回归的比例
    revLow: 0.7,          // 信誉 0 时营收乘数
    revHigh: 1.3          // 信誉 100 时营收乘数
};

function getPlatformRep(key) {
    if (!gameState.platformRep) return 50;
    const v = gameState.platformRep[key];
    return v == null ? (PLATFORM_REP_CONFIG[key] ? PLATFORM_REP_CONFIG[key].start : 50) : v;
}

function setPlatformRep(key, value) {
    if (!gameState.platformRep) gameState.platformRep = {};
    gameState.platformRep[key] = Math.max(0, Math.min(100, Math.round(value)));
}

// 发布后按评分调整该平台信誉：评分高于 6 加分，低于 6 扣分（高端平台扣得更狠）
function updatePlatformRepOnRelease(platformKey, rating) {
    const cfg = PLATFORM_REP_CONFIG[platformKey];
    if (!cfg) return;
    let delta = (rating - 6) * 4.5;
    if (cfg.premium && delta < 0) delta *= 1.4; // 高端平台对扑街更敏感
    setPlatformRep(platformKey, getPlatformRep(platformKey) + delta);
}

// 每周信誉向 50 缓慢回归
function driftPlatformRep() {
    Object.keys(PLATFORM_REP_CONFIG).forEach(key => {
        const rep = getPlatformRep(key);
        setPlatformRep(key, rep + (50 - rep) * PLATFORM_REP.weeklyDrift);
    });
}

// 营收乘数：信誉越高平台推流越给力
function platformRevenueMultiplier(key) {
    const rep = getPlatformRep(key);
    return PLATFORM_REP.revLow + (rep / 100) * (PLATFORM_REP.revHigh - PLATFORM_REP.revLow);
}

// 平台是否因信誉过低被锁定（仅 premium 平台会拒绝合作）
function isPlatformLocked(key) {
    const cfg = PLATFORM_REP_CONFIG[key];
    if (!cfg || !cfg.premium) return false;
    return getPlatformRep(key) < cfg.lockThreshold;
}

function platformRepTone(key) {
    const rep = getPlatformRep(key);
    if (isPlatformLocked(key)) return "risk";
    if (rep >= 60) return "good";
    if (rep >= 40) return "warn";
    return "risk";
}

function platformRepLabel(key) {
    const rep = Math.round(getPlatformRep(key));
    if (isPlatformLocked(key)) return `信誉 ${rep} · 拒绝合作`;
    return `信誉 ${rep}`;
}

// 渲染办公室侧栏的平台信誉面板
function renderPlatformRep() {
    const box = document.getElementById("platform-rep-box");
    const list = document.getElementById("platform-rep-list");
    if (!box || !list) return;
    const unlocked = gameState.unlockedPlatforms || ["Mobile"];
    box.style.display = "";
    list.innerHTML = unlocked.map(key => {
        const rep = Math.round(getPlatformRep(key));
        const tone = platformRepTone(key);
        const locked = isPlatformLocked(key);
        const barColor = tone === "good" ? "var(--accent-neon)" : tone === "warn" ? "var(--accent-yellow)" : "var(--accent-pink)";
        return `
            <div class="prep-item">
                <div class="prep-head">
                    <span class="prep-name"><i class="${PLATFORMS_DATA[key].icon}"></i> ${PLATFORMS_DATA[key].name}</span>
                    <span class="prep-val" style="color:${barColor};">${locked ? '⛔ ' + rep : rep}</span>
                </div>
                <div class="prep-track"><div class="prep-bar" style="width:${rep}%; background:${barColor};"></div></div>
            </div>`;
    }).join("");
}
