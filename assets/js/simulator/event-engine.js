// ==========================================================================
// 情境化事件引擎（浏览器 classic script + Node 双模）
// 纯函数，不读取模块外全局；真实状态由 ctx.gameState 传入。
// ==========================================================================
(function (root, factory) {
    const api = factory();
    if (typeof window !== "undefined") Object.assign(window, api);
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(this, function () {

    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    function matchCondition(state, cond) {
        if (!cond) return true;
        if (cond.excludeRecent && Array.isArray(state.recentEventIds) && state.recentEventIds.includes(cond.excludeRecent)) return false;
        if (cond.minTeam != null && state.team < cond.minTeam) return false;
        if (cond.maxTeam != null && state.team > cond.maxTeam) return false;
        if (cond.requiresRole != null && !((state.roles[cond.requiresRole] || 0) >= 1)) return false;
        if (cond.hasTrait != null && !(((state.traits || {})[cond.hasTrait] || 0) >= 1)) return false;
        if (cond.hasArchetype != null && !(((state.archetypes || {})[cond.hasArchetype] || 0) >= 1)) return false;
        if (cond.minFunds != null && state.funds < cond.minFunds) return false;
        if (cond.maxFunds != null && state.funds > cond.maxFunds) return false;
        if (cond.minFans != null && state.fans < cond.minFans) return false;
        if (cond.maxFans != null && state.fans > cond.maxFans) return false;
        if (cond.background != null && state.background !== cond.background) return false;
        if (cond.minStage != null && state.stage < cond.minStage) return false;
        if (cond.maxStage != null && state.stage > cond.maxStage) return false;
        if (cond.minSatisfaction != null && state.maxSatisfaction < cond.minSatisfaction) return false;
        if (cond.maxSatisfaction != null && state.minSatisfaction > cond.maxSatisfaction) return false;
        if (cond.minLoyalty != null && state.maxLoyalty < cond.minLoyalty) return false;
        if (cond.maxLoyalty != null && state.minLoyalty > cond.maxLoyalty) return false;
        if (cond.projectState != null && state.projectState !== cond.projectState) return false;
        return true;
    }

    function eligibleEvents(events, state) {
        return events.filter(e => {
            if (!matchCondition(state, e.cond)) return false;
            return !(Array.isArray(state.recentEventIds) && state.recentEventIds.includes(e.id));
        });
    }

    function pickWeighted(list, rng) {
        const rand = typeof rng === "function" ? rng : Math.random;
        const total = list.reduce((s, e) => s + (e.weight || 1), 0);
        if (total <= 0) return list[0] || null;
        let r = rand() * total;
        for (const e of list) {
            r -= (e.weight || 1);
            if (r < 0) return e;
        }
        return list[list.length - 1] || null;
    }

    const ROLE_TOKENS = ["artist", "programmer", "designer"];

    function pickMember(state, role, rng) {
        const rand = typeof rng === "function" ? rng : Math.random;
        const pool = (state.employees || []).filter(emp => emp.role === role);
        if (!pool.length) return null;
        return pool[Math.floor(rand() * pool.length)];
    }

    function pickMemberBy(state, predicate, rng) {
        const rand = typeof rng === "function" ? rng : Math.random;
        const pool = (state.employees || []).filter(predicate);
        if (!pool.length) return null;
        return pool[Math.floor(rand() * pool.length)];
    }

    function employeeValue(emp, key, fallback) {
        const v = Number(emp && emp[key]);
        return Number.isFinite(v) ? v : fallback;
    }

    function matchTargetCondition(emp, event) {
        if (!emp) return true;
        const cond = event.cond || {};
        const satisfaction = employeeValue(emp, "satisfaction", employeeValue(emp, "morale", 70));
        const loyalty = employeeValue(emp, "loyalty", emp.id === "player" ? 100 : 55);
        const fatigue = employeeValue(emp, "fatigue", 0);
        if (cond.minTargetSatisfaction != null && satisfaction < cond.minTargetSatisfaction) return false;
        if (cond.maxTargetSatisfaction != null && satisfaction > cond.maxTargetSatisfaction) return false;
        if (cond.minTargetLoyalty != null && loyalty < cond.minTargetLoyalty) return false;
        if (cond.maxTargetLoyalty != null && loyalty > cond.maxTargetLoyalty) return false;
        if (cond.minTargetFatigue != null && fatigue < cond.minTargetFatigue) return false;
        if (cond.maxTargetFatigue != null && fatigue > cond.maxTargetFatigue) return false;
        if (cond.targetNotFounder && emp.id === "player") return false;
        return true;
    }

    function selectTargets(event, state, rng) {
        const text = JSON.stringify([event.title, event.desc, event.choices]);
        const byRole = {};
        ROLE_TOKENS.forEach(role => {
            if (text.indexOf("{" + role + "}") !== -1) byRole[role] = pickMember(state, role, rng);
        });
        const targetRole = event.target || (event.cond && event.cond.requiresRole) || null;
        let target = null;
        if (event.targetTrait || (event.cond && event.cond.hasTrait)) {
            const trait = event.targetTrait || event.cond.hasTrait;
            target = pickMemberBy(state, emp => emp.trait === trait && matchTargetCondition(emp, event), rng);
        } else if (event.targetArchetype || (event.cond && event.cond.hasArchetype)) {
            const archetype = event.targetArchetype || event.cond.hasArchetype;
            target = pickMemberBy(state, emp => emp.archetype === archetype && matchTargetCondition(emp, event), rng);
        } else if (targetRole) {
            const picked = (byRole[targetRole] !== undefined) ? byRole[targetRole] : pickMember(state, targetRole, rng);
            target = picked && matchTargetCondition(picked, event) ? picked : pickMemberBy(state, emp => emp.role === targetRole && matchTargetCondition(emp, event), rng);
        }
        return { byRole, target };
    }

    function resolveTokens(text, ctx) {
        if (!text) return text;
        return text.replace(/\{(\w+)\}/g, function (m, key) {
            if (key === "target") return (ctx.target && ctx.target.name) || "团队成员";
            if (ctx.byRole && ctx.byRole[key]) return ctx.byRole[key].name;
            return "团队成员";
        });
    }

    function applyEffects(effects, ctx, rng) {
        if (!effects) return;
        const rand = typeof rng === "function" ? rng : Math.random;
        const gs = ctx.gameState;
        if (effects.funds != null) gs.funds += effects.funds;
        if (effects.fans != null) gs.fans = Math.max(0, gs.fans + effects.fans);
        if (effects.rp != null) gs.rp = Math.max(0, gs.rp + effects.rp);
        if (effects.moraleAll != null) (gs.employees || []).forEach(e => { e.morale = clamp((e.morale == null ? 75 : e.morale) + effects.moraleAll, 0, 100); });
        if (effects.fatigueAll != null) (gs.employees || []).forEach(e => { e.fatigue = clamp((e.fatigue || 0) + effects.fatigueAll, 0, 100); });
        if (effects.satisfactionAll != null) (gs.employees || []).forEach(e => { e.satisfaction = clamp((e.satisfaction == null ? 70 : e.satisfaction) + effects.satisfactionAll, 0, 100); });
        if (effects.loyaltyAll != null) (gs.employees || []).forEach(e => { e.loyalty = clamp((e.loyalty == null ? 55 : e.loyalty) + effects.loyaltyAll, 0, 100); });
        if (effects.project && gs.currentProject) {
            Object.keys(effects.project).forEach(k => {
                const current = Number(gs.currentProject[k] || 0);
                gs.currentProject[k] = Math.max(0, current + effects.project[k]);
            });
        }
        if (ctx.target) {
            if (effects.targetMorale != null) ctx.target.morale = clamp((ctx.target.morale == null ? 75 : ctx.target.morale) + effects.targetMorale, 0, 100);
            if (effects.targetFatigue != null) ctx.target.fatigue = clamp((ctx.target.fatigue || 0) + effects.targetFatigue, 0, 100);
            if (effects.targetSatisfaction != null) ctx.target.satisfaction = clamp((ctx.target.satisfaction == null ? 70 : ctx.target.satisfaction) + effects.targetSatisfaction, 0, 100);
            if (effects.targetLoyalty != null) ctx.target.loyalty = clamp((ctx.target.loyalty == null ? 55 : ctx.target.loyalty) + effects.targetLoyalty, 0, 100);
            if (effects.targetSalary != null) ctx.target.salary = Math.max(0, Math.round((ctx.target.salary || 0) + effects.targetSalary));
            if (effects.targetMemory) {
                if (!Array.isArray(ctx.target.memories)) ctx.target.memories = [];
                ctx.target.memories.push({ date: gs.dateText || "", text: effects.targetMemory });
                ctx.target.memories = ctx.target.memories.slice(-12);
            }
            if (effects.targetStat && ctx.target.stats) {
                Object.keys(effects.targetStat).forEach(k => {
                    if (ctx.target.stats[k] != null) ctx.target.stats[k] = Math.max(1, ctx.target.stats[k] + effects.targetStat[k]);
                });
            }
        }
        if (effects.chance) {
            const c = effects.chance;
            if (rand() < c.p) applyEffects(c.then, ctx, rng);
            else applyEffects(c.else, ctx, rng);
        }
    }

    function buildEventState(gameState) {
        const emps = gameState.employees || [];
        const roles = { artist: 0, programmer: 0, designer: 0 };
        const traits = {};
        const archetypes = {};
        let minSatisfaction = 100;
        let maxSatisfaction = 0;
        let minLoyalty = 100;
        let maxLoyalty = 0;
        emps.forEach(e => {
            if (roles[e.role] != null) roles[e.role]++;
            traits[e.trait || "none"] = (traits[e.trait || "none"] || 0) + 1;
            archetypes[e.archetype || "pragmatic"] = (archetypes[e.archetype || "pragmatic"] || 0) + 1;
            const satisfaction = e.satisfaction == null ? 70 : e.satisfaction;
            const loyalty = e.loyalty == null ? 55 : e.loyalty;
            minSatisfaction = Math.min(minSatisfaction, satisfaction);
            maxSatisfaction = Math.max(maxSatisfaction, satisfaction);
            minLoyalty = Math.min(minLoyalty, loyalty);
            maxLoyalty = Math.max(maxLoyalty, loyalty);
        });
        return {
            team: emps.length,
            roles: roles,
            traits: traits,
            archetypes: archetypes,
            minSatisfaction: emps.length ? minSatisfaction : 0,
            maxSatisfaction: emps.length ? maxSatisfaction : 0,
            minLoyalty: emps.length ? minLoyalty : 0,
            maxLoyalty: emps.length ? maxLoyalty : 0,
            funds: gameState.funds,
            fans: gameState.fans,
            background: gameState.founderBackground,
            stage: gameState.companyStage || 0,
            projectState: gameState.currentProject ? gameState.currentProject.state : null,
            recentEventIds: Array.isArray(gameState.recentEventIds) ? gameState.recentEventIds.slice() : [],
            employees: emps
        };
    }

    return { matchCondition, eligibleEvents, pickWeighted, pickMember, selectTargets, resolveTokens, applyEffects, buildEventState, matchTargetCondition };
});
