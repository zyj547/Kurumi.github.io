// ==========================================================================
// 视觉特效工具：缓动/判语纯函数 + 数字滚动。浏览器 classic script + Node 双模。
// ==========================================================================
(function (root, factory) {
    const api = factory();
    if (typeof window !== "undefined") Object.assign(window, api);
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(this, function () {

    function easeOutCubic(t) {
        if (t < 0) t = 0;
        if (t > 1) t = 1;
        return 1 - Math.pow(1 - t, 3);
    }

    // 评分分段判语：返回 { text, color, burst }
    function scoreVerdict(score) {
        if (score >= 9.0) return { text: "神作 · 现象级", color: "var(--accent-neon)", burst: true };
        if (score >= 7.5) return { text: "口碑佳作", color: "var(--accent-neon)", burst: true };
        if (score >= 6.0) return { text: "中规中矩", color: "var(--accent-yellow)", burst: false };
        if (score >= 4.5) return { text: "反响平平", color: "var(--accent-yellow)", burst: false };
        return { text: "票房毒药", color: "var(--accent-pink)", burst: false };
    }

    // 只更新元素的首个文本节点（保留 spawnFloatingText 等追加的子元素，不被 textContent 清空）
    function writeNumber(el, str) {
        let node = null;
        for (let i = 0; i < el.childNodes.length; i++) {
            if (el.childNodes[i].nodeType === 3) { node = el.childNodes[i]; break; }
        }
        if (!node) { node = document.createTextNode(""); el.insertBefore(node, el.firstChild); }
        node.nodeValue = str;
    }

    // 数字缓动滚动：从当前值（或 opts.from）滚到 to，每帧用 format 渲染
    function animateCount(el, to, opts) {
        if (!el) return;
        opts = opts || {};
        const dur = opts.duration || 600;
        const fmt = opts.format || function (v) { return String(Math.round(v)); };
        let from = opts.from;
        if (from == null) {
            const seed = (el.dataset && el.dataset.rollVal) || String(el.textContent).replace(/[^\d.\-]/g, "");
            from = parseFloat(seed) || 0;
        }
        const start = (typeof performance !== "undefined" ? performance.now() : Date.now());
        let settled = false;
        function settle() { if (settled) return; settled = true; writeNumber(el, fmt(to)); if (el.dataset) el.dataset.rollVal = String(to); }
        function frame(now) {
            if (settled) return;
            const p = Math.min(1, (now - start) / dur);
            const v = from + (to - from) * easeOutCubic(p);
            writeNumber(el, fmt(v));
            if (p < 1) requestAnimationFrame(frame);
            else settle();
        }
        requestAnimationFrame(frame);
        // 安全网：rAF 在后台标签页会被暂停，超时后强制落定终值（不影响正常动画的幂等收尾）
        setTimeout(settle, dur + 80);
    }

    // 顶栏统计滚动：首次直接落定并播种，之后才滚动（避免读档时 0→大数 的突兀滚动）
    function rollStat(id, to, format) {
        const el = document.getElementById(id);
        if (!el) return;
        format = format || function (v) { return String(Math.round(v)); };
        if (!el.dataset.rollVal) { writeNumber(el, format(to)); el.dataset.rollVal = String(to); return; }
        if (parseFloat(el.dataset.rollVal) === to) return; // 无变化不滚
        animateCount(el, to, { format: format });
    }

    return { easeOutCubic, scoreVerdict, animateCount, rollStat };
});
