// ==========================================================================
// Project visual identity helpers
// ==========================================================================
(function (root, factory) {
    const api = factory();
    if (typeof window !== "undefined") Object.assign(window, api);
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(this, function () {
    const GENRE_SKINS = {
        Casual: { from: "#00f0ff", to: "#35f6c8", bg: "#071b28", label: "CASUAL" },
        RPG: { from: "#7c3aed", to: "#d946ef", bg: "#160c2e", label: "RPG" },
        Roguelike: { from: "#ef4444", to: "#fbbf24", bg: "#24100d", label: "ROGUE" },
        Tycoon: { from: "#fbbf24", to: "#10b981", bg: "#182211", label: "TYCOON" }
    };

    function safeData(table, key, fallback) {
        if (typeof table !== "undefined" && table[key]) return table[key];
        return fallback;
    }

    function projectVisualMeta(project) {
        project = project || {};
        const genre = project.genre || "Casual";
        const topic = project.topic || "Laborer";
        const platform = project.platform || "Mobile";
        const genreData = safeData(typeof GENRES_DATA !== "undefined" ? GENRES_DATA : {}, genre, { name: genre, icon: "fa-solid fa-gamepad" });
        const topicData = safeData(typeof TOPICS_DATA !== "undefined" ? TOPICS_DATA : {}, topic, { name: topic, icon: "fa-solid fa-star" });
        const platformData = safeData(typeof PLATFORMS_DATA !== "undefined" ? PLATFORMS_DATA : {}, platform, { name: platform, icon: "fa-solid fa-display" });
        const skin = GENRE_SKINS[genre] || GENRE_SKINS.Casual;
        return { genre, topic, platform, genreData, topicData, platformData, skin };
    }

    function escapeProjectText(value) {
        if (typeof escapeHtml === "function") return escapeHtml(value);
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function renderProjectCover(project, opts) {
        opts = opts || {};
        const meta = projectVisualMeta(project);
        const name = escapeProjectText(project && project.name ? project.name : "未命名项目");
        const compact = opts.compact ? " compact" : "";
        const rating = project && project.rating != null
            ? `<span class="project-cover-rating"><i class="fa-solid fa-star"></i>${project.rating}</span>`
            : "";
        return `
            <div class="project-cover${compact}" style="--cover-a:${meta.skin.from}; --cover-b:${meta.skin.to}; --cover-bg:${meta.skin.bg};">
                <div class="project-cover-grid"></div>
                <div class="project-cover-top">
                    <span><i class="${meta.platformData.icon}"></i> ${meta.platformData.name}</span>
                    ${rating}
                </div>
                <div class="project-cover-mark">
                    <i class="${meta.topicData.icon}"></i>
                </div>
                <div class="project-cover-bottom">
                    <span class="project-cover-genre">${meta.skin.label}</span>
                    <strong>${name}</strong>
                    <span>${meta.topicData.name} / ${meta.genreData.name}</span>
                </div>
            </div>
        `;
    }

    return { projectVisualMeta, renderProjectCover };
});
