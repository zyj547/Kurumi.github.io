// ==========================================================================
// 发行评分揭晓全屏仪式：消费真实 evaluation，逐项点亮 → 大数字滚动 → 判语 → 粒子。
// 依赖：animateCount/scoreVerdict (fx.js)、playSFX。
// ==========================================================================
function revealColorForTone(tone) {
    if (tone === "risk") return "var(--accent-pink)";
    if (tone === "warn") return "var(--accent-yellow)";
    return "var(--accent-neon)";
}

function revealBurst(color) {
    const box = document.getElementById("reveal-burst");
    if (!box) return;
    for (let i = 0; i < 26; i++) {
        const s = document.createElement("div");
        s.className = "reveal-spark";
        s.style.background = Math.random() > 0.5 ? color : "var(--accent-yellow)";
        s.style.left = "50%";
        s.style.top = "62%";
        s.style.boxShadow = "0 0 8px " + color;
        box.appendChild(s);
        const ang = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * 170;
        const dx = Math.cos(ang) * dist;
        const dy = Math.sin(ang) * dist - 30;
        const start = performance.now();
        (function (sp, dx, dy, start) {
            function fr(now) {
                const p = Math.min(1, (now - start) / 950);
                sp.style.transform = "translate(" + dx * p + "px," + (dy * p + 110 * p * p) + "px)";
                sp.style.opacity = String(1 - p);
                if (p < 1) requestAnimationFrame(fr); else sp.remove();
            }
            requestAnimationFrame(fr);
        })(s, dx, dy, start);
    }
}

function playReleaseReveal(release, evaluation, onDone) {
    const overlay = document.getElementById("reveal-overlay");
    if (!overlay || !evaluation) { if (typeof onDone === "function") onDone(); return; }

    const factorsEl = document.getElementById("reveal-factors");
    const finalEl = document.getElementById("reveal-final");
    const scoreEl = document.getElementById("reveal-score");
    const barEl = document.getElementById("reveal-bar-fill");
    const verdictEl = document.getElementById("reveal-verdict");
    const burstEl = document.getElementById("reveal-burst");
    const contBtn = document.getElementById("reveal-continue");
    const coverEl = document.getElementById("reveal-cover");

    // 重置
    document.getElementById("reveal-title").textContent = `《${release.name}》`;
    if (coverEl && typeof renderProjectCover === "function") {
        coverEl.innerHTML = renderProjectCover(release, { compact: true });
    }
    factorsEl.innerHTML = "";
    finalEl.classList.remove("show");
    verdictEl.classList.remove("show");
    contBtn.classList.remove("show");
    scoreEl.textContent = "0.0";
    scoreEl.removeAttribute("data-roll-val");
    barEl.style.transition = "none";
    barEl.style.width = "0%";
    burstEl.innerHTML = "";
    overlay.classList.add("active");
    if (typeof playSFX === "function") playSFX("click");

    // 逐项点亮（前 4 项，跳过"最终校准"）
    const factors = (evaluation.factors || []).slice(0, 4);
    const rows = factors.map(f => {
        const div = document.createElement("div");
        div.className = "reveal-factor";
        div.innerHTML = `<span>${f.label}</span><span class="rfv" style="color:${revealColorForTone(f.tone)}">${f.value}</span>`;
        factorsEl.appendChild(div);
        return div;
    });
    rows.forEach((r, i) => setTimeout(() => {
        r.classList.add("show");
        if (typeof playSFX === "function") playSFX("click");
    }, 300 + i * 500));

    const finalScore = evaluation.finalScore;
    const afterFactors = 300 + rows.length * 500 + 150;
    setTimeout(() => {
        finalEl.classList.add("show");
        animateCount(scoreEl, finalScore, { from: 0, duration: 1100, format: v => v.toFixed(1) });
        // 强制 reflow 后再设宽度，确保 transition 生效
        void barEl.offsetWidth;
        barEl.style.transition = "width 1.1s cubic-bezier(.2,.8,.2,1)";
        barEl.style.width = Math.max(0, Math.min(100, finalScore * 10)) + "%";
        setTimeout(() => {
            const vd = scoreVerdict(finalScore);
            verdictEl.textContent = vd.text;
            verdictEl.style.color = vd.color;
            verdictEl.classList.add("show");
            scoreEl.style.color = vd.color;
            if (vd.burst) revealBurst(vd.color);
            if (typeof playSFX === "function") playSFX(vd.burst ? "success" : "click");
            contBtn.classList.add("show");
        }, 1200);
    }, afterFactors);

    contBtn.onclick = () => {
        overlay.classList.remove("active");
        if (typeof onDone === "function") onDone();
    };
}
