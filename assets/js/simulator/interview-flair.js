// ==========================================================================
// Interview flair: candidate stories, psychological probes and readable feedback.
// ==========================================================================
(function (root, factory) {
    const api = factory(root);
    if (typeof window !== "undefined") Object.assign(window, api);
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
    function pick(arr, rng) {
        const rand = typeof rng === "function" ? rng : Math.random;
        if (!Array.isArray(arr) || !arr.length) return "";
        return arr[Math.floor(rand() * arr.length)];
    }

    function safe(text) {
        const escape = typeof root.escapeHtml === "function"
            ? root.escapeHtml
            : (s) => String(s == null ? "" : s)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
        return escape(text);
    }

    const STORY_ORIGINS = {
        fresh: [
            { item: "一本贴满便利贴的 game jam 笔记", hook: "他曾经在宿舍熬夜做完一个没人玩的小游戏，却把每条评论都抄了下来。", wound: "害怕自己只是热血，不是真的有用。", want: "想在第一个正式团队里证明自己能负责到底。" },
            { item: "一张皱巴巴的学生作品截图", hook: "毕业答辩时他的作品差点崩掉，是同学帮忙救回来的。", wound: "他一直记得那种无力感。", want: "想学会在关键时刻不只靠别人救场。" },
            { item: "一份写得过于认真的学习计划", hook: "他把你们工作室近三款作品拆成了表格，连差评都做了分类。", wound: "太想被认可，所以有时会用力过猛。", want: "想找一个愿意教他、也敢让他犯错的地方。" }
        ],
        veteran: [
            { item: "一个旧工牌套", hook: "他把上一家公司的工牌套拿在手里转了两圈，又默默收了回去。", wound: "以前带过的项目被层层改到面目全非。", want: "想知道小团队是不是真的能让作品保留一点初衷。" },
            { item: "一份没有署名的设计稿", hook: "他说这稿子在大厂会议里被否了七次，但他一直没有删。", wound: "他不太相信承诺，更相信流程和预算。", want: "想最后试一次把真正喜欢的东西做出来。" },
            { item: "一只看起来很贵的保温杯", hook: "他讲经历时很克制，只有提到失败项目时停顿了一下。", wound: "见过太多项目死在漂亮口号里。", want: "想确认你不是只会画饼的老板。" }
        ],
        idealist: [
            { item: "一叠手绘概念草图", hook: "他拿出的不是简历，而是一叠关于玩家情绪曲线的草图。", wound: "上一份工作里，他最喜欢的细节总是第一个被砍。", want: "想加入一个愿意为表达留一点空间的团队。" },
            { item: "一封玩家写给他的小长信", hook: "他说有个玩家曾经因为他的独立作品熬过一个很糟糕的晚上。", wound: "他怕自己以后只会做转化率好看的东西。", want: "想做会被玩家记住，而不是只被报表记住的游戏。" },
            { item: "一枚旧展会胸牌", hook: "他参加过很多独立游戏展，却很少真正把作品做完。", wound: "理想太多，落地太少。", want: "想找一个能保护热爱、也能逼他收尾的地方。" }
        ],
        pragmatic: [
            { item: "一张家庭支出表", hook: "他没有避讳现实，直接把自己需要稳定收入的原因讲清楚了。", wound: "经历过拖薪后，他对现金流特别敏感。", want: "想找一个不浪漫化苦日子的团队。" },
            { item: "一个孩子画的小贴纸", hook: "他的电脑背面贴着一张歪歪扭扭的画，他说那是孩子画的“上班英雄”。", wound: "他不能为了梦想随便赌上生活。", want: "想在稳定和作品之间找到一个能长期坚持的平衡。" },
            { item: "一份列好风险等级的入职问题清单", hook: "他问问题很直接，从发薪日问到项目延期预案。", wound: "他见过太多团队只谈热爱不谈责任。", want: "想确认这里值得把时间交出去。" }
        ],
        slash: [
            { item: "一个塞满贴纸的设备包", hook: "他刚坐下就接了两个消息，一个来自乐队，一个来自外包客户。", wound: "他不喜欢被单一身份困住。", want: "想找一个允许灵活，但边界清楚的团队。" },
            { item: "一张排得很满的日程截图", hook: "他的日程像俄罗斯方块，空隙少得可怜。", wound: "自由带来机会，也带来失控。", want: "想知道你能不能接受一个不那么传统的员工。" },
            { item: "一支录音笔", hook: "他说自己有时会把开发经历做成播客素材，当然会匿名。", wound: "他怕稳定工作吞掉自己的其他可能性。", want: "想确认加入工作室不会意味着放弃全部外部身份。" }
        ],
        lazy: [
            { item: "一副明显很舒服的降噪耳机", hook: "他说自己不是讨厌工作，只是讨厌没边界的工作。", wound: "以前被无限加急磨掉了主动性。", want: "想找一个能用清楚目标换稳定产出的地方。" },
            { item: "一个写着自动化脚本的 U 盘", hook: "他承认自己会偷懒，但也因此写了不少省事工具。", wound: "别人总把他的低能量误解成没能力。", want: "想证明聪明地少做重复劳动，也是一种价值。" },
            { item: "一杯已经没气的汽水", hook: "他回答问题慢半拍，但偶尔会冒出很准的观察。", wound: "太久没被认真期待过。", want: "想知道这里会不会只把他当成便宜劳动力。" }
        ]
    };

    const STORY_PROBES = [
        {
            title: "故事流 · 旧物破冰",
            q: story => `你注意到他带来的「${story.item}」。这不像普通简历材料，更像某段经历留下来的锚点。${story.hook}你决定怎么打开这段话题？`,
            choices: [
                { text: "不急着问能力，先问这件旧物为什么还留着", impression: 2, expectAdj: -120, moraleAdj: 5, vibe: story => `他愣了一下，像是没想到面试会聊到这里。话匣子打开后，你听见的是：${story.want}` },
                { text: "轻轻点到为止，把主动权交给他", impression: 1, expectAdj: -40, moraleAdj: 2, vibe: "他没有立刻深聊，但你能感觉到防备松了一点。" },
                { text: "把话题拉回简历：过去不重要，结果才重要", impression: -2, expectAdj: 220, moraleAdj: -5, vibe: "他笑得很礼貌，身体却往后靠了一点。旧物被他收回包里。" }
            ]
        },
        {
            title: "故事流 · 心结开导",
            q: story => `聊到一半，他终于绕回那个真正卡住他的地方：${story.wound} 这不是能力题，而是他在判断你会不会又把他推回旧坑。`,
            choices: [
                { text: "承认这个心结合理，再讲工作室能如何避免重演", impression: 3, expectAdj: -180, moraleAdj: 6, vibe: "他沉默了几秒，随后第一次认真看着你回答。你没有解决他的过去，但给了一个可信的未来。" },
                { text: "反问他：如果再次遇到这种情况，他希望你怎么做", impression: 2, expectAdj: -90, moraleAdj: 4, vibe: "这个问题把他从防御里拉了出来。他开始说具体边界，而不是泛泛地说不想再受伤。" },
                { text: "用愿景压过去：加入后自然会好起来", impression: -2, expectAdj: 240, moraleAdj: -5, vibe: "他点点头，但眼神像是在听一段曾经听过很多遍的话。" }
            ]
        },
        {
            title: "故事流 · 边界试探",
            q: story => `${story.want} 这句话没有写在简历上，但已经摊在桌面上了。现在真正的博弈是：你要给承诺，还是给边界？`,
            choices: [
                { text: "给一个小而完整的试用目标，结束后双向复盘", impression: 2, expectAdj: -130, moraleAdj: 5, vibe: "他明显放松了。比起漂亮承诺，一个可验证的小目标更让人安心。" },
                { text: "直接说清：你能给机会，但不会无限迁就", impression: 1, expectAdj: -20, moraleAdj: 2, vibe: "他接受这个边界，甚至因为你没有过度讨好而更认真了一点。" },
                { text: "试用期先上强度，扛住才说明合适", impression: -2, expectAdj: 260, moraleAdj: -6, vibe: "他开始谨慎起来，像是在确认自己是不是又走进了熟悉的坑。" }
            ]
        },
        {
            title: "故事流 · 最后确认",
            q: story => `面试快结束时，他没有急着问工资，而是问了一句：“如果我真的来，你希望我先改变什么？”这像是在试探你到底看见了他，还是只看见了岗位。`,
            choices: [
                { text: "说出你看见的矛盾：他的价值和他的防备", impression: 3, expectAdj: -160, moraleAdj: 6, vibe: "这句话击中了他。他没有立刻接话，只是把坐姿慢慢放松下来。" },
                { text: "只谈岗位目标：先把手头职责做好", impression: 0, expectAdj: 60, moraleAdj: 0, vibe: "这是一个安全答案。他接受，但这场面试也停留在安全范围内。" },
                { text: "说希望他先证明自己配得上期待", impression: -2, expectAdj: 220, moraleAdj: -5, vibe: "他的表情冷了一点。你把面试重新变回了考核，而不是合作。" }
            ]
        }
    ];

    function ensureCandidateStory(cand, arch, rng) {
        if (cand.interviewStory) return cand.interviewStory;
        const originPool = STORY_ORIGINS[cand.archetype] || STORY_ORIGINS.pragmatic;
        const origin = pick(originPool, rng);
        const probe = pick(STORY_PROBES, rng);
        cand.interviewStory = {
            archetype: cand.archetype,
            item: origin.item,
            hook: origin.hook,
            wound: origin.wound,
            want: origin.want,
            probeTitle: probe.title,
            probeIndex: STORY_PROBES.indexOf(probe),
            summary: `${origin.hook}${origin.wound}${origin.want}`,
            archName: arch && arch.name ? arch.name : ""
        };
        return cand.interviewStory;
    }

    function buildStoryProbe(cand, arch, rng) {
        const story = ensureCandidateStory(cand, arch, rng);
        const probe = STORY_PROBES[Math.max(0, story.probeIndex || 0)] || STORY_PROBES[0];
        return {
            title: probe.title,
            q: probe.q(story),
            choices: probe.choices.map(choice => ({
                text: choice.text,
                impression: choice.impression,
                expectAdj: choice.expectAdj,
                moraleAdj: choice.moraleAdj,
                vibe: typeof choice.vibe === "function" ? choice.vibe(story) : choice.vibe
            }))
        };
    }

    function buildStoryFlow(cand, arch, rng) {
        ensureCandidateStory(cand, arch, rng);
        return STORY_PROBES.map(probe => {
            const story = ensureCandidateStory(cand, arch, rng);
            return {
                title: probe.title,
                q: probe.q(story),
                choices: probe.choices.map(choice => ({
                    text: choice.text,
                    impression: choice.impression,
                    expectAdj: choice.expectAdj,
                    moraleAdj: choice.moraleAdj,
                    vibe: typeof choice.vibe === "function" ? choice.vibe(story) : choice.vibe
                }))
            };
        });
    }

    function candidateStoryHtml(cand, arch, rng) {
        const story = ensureCandidateStory(cand, arch, rng);
        return `
            <div class="interview-story-card">
                <div class="interview-story-item"><i class="fa-solid fa-thumbtack"></i> ${safe(story.item)}</div>
                <p>${safe(story.hook)}</p>
                <p>${safe(story.wound)}</p>
                <strong>${safe(story.want)}</strong>
            </div>
        `;
    }

    function getInterviewOpening(cand, arch, rng) {
        const roleText = cand.role === "artist" ? "作品集" : cand.role === "designer" ? "设计文档" : "代码片段";
        const traitTable = typeof EMPLOYEE_TRAITS !== "undefined" ? EMPLOYEE_TRAITS : root.EMPLOYEE_TRAITS;
        const traitName = traitTable && traitTable[cand.trait || "none"]
            ? traitTable[cand.trait || "none"].name
            : cand.trait || "无特质";
        const lines = [
            `${cand.name} 坐下前先扫了一眼办公室，目光在你的白板和账本之间停了一秒。`,
            `${cand.name} 带来了自己的${roleText}，但没有急着展示，像是在等你先出题。`,
            `${cand.name} 的简历很短，细节却不少；${arch.name} 的味道几乎写在说话节奏里。`
        ];
        return `
            <div class="interview-brief">
                <div class="interview-brief-line">${safe(pick(lines, rng))}</div>
                <div class="interview-tags">
                    <span>${safe(arch.name)}</span>
                    <span>${safe(traitName)}</span>
                    <span>期望 ¥${Math.round(cand.expectedSalary || cand.salary || 0).toLocaleString()}</span>
                </div>
            </div>
            ${candidateStoryHtml(cand, arch, rng)}
        `;
    }

    function buildInterviewScenarioDeck(cand, arch) {
        return buildStoryFlow(cand, arch, Math.random);
    }

    function describeInterviewChoice(choice) {
        const parts = [];
        if (choice.impression > 0) parts.push(`印象 +${choice.impression}`);
        if (choice.impression < 0) parts.push(`印象 ${choice.impression}`);
        if (choice.expectAdj > 0) parts.push(`期望 +¥${choice.expectAdj.toLocaleString()}`);
        if (choice.expectAdj < 0) parts.push(`期望 -¥${Math.abs(choice.expectAdj).toLocaleString()}`);
        if (choice.moraleAdj > 0) parts.push(`入职心气 +${choice.moraleAdj}`);
        if (choice.moraleAdj < 0) parts.push(`入职心气 ${choice.moraleAdj}`);
        return parts.join(" · ") || "关系保持不变";
    }

    function interviewFeedbackHtml(choice, ai) {
        const tone = choice.impression > 0 ? "good" : choice.impression < 0 ? "risk" : "neutral";
        return `
            <div class="interview-feedback ${tone}">
                <strong>${safe(choice.vibe || "候选人认真记下了你的回答。")}</strong>
                <span>${safe(describeInterviewChoice(choice))}</span>
                <em>当前印象 ${ai.impression} · 期望 ¥${Math.round(ai.expectedSalary).toLocaleString()}</em>
            </div>
        `;
    }

    function interviewSummaryHtml(ai) {
        const tone = ai.impression >= 4 ? "good" : ai.impression <= -2 ? "risk" : "neutral";
        const label = ai.impression >= 4 ? "聊得投机" : ai.impression <= -2 ? "气氛微妙" : "可以继续谈";
        return `
            <div class="interview-summary ${tone}">
                <div><b>${label}</b><span>印象 ${ai.impression}</span></div>
                <div><b>薪资锚点</b><span>¥${Math.round(ai.expectedSalary).toLocaleString()}</span></div>
                <div><b>入职心气</b><span>${ai.moraleAdj >= 0 ? "+" : ""}${ai.moraleAdj}</span></div>
            </div>
        `;
    }

    return {
        buildInterviewScenarioDeck,
        getInterviewOpening,
        ensureCandidateStory,
        candidateStoryHtml,
        buildStoryFlow,
        describeInterviewChoice,
        interviewFeedbackHtml,
        interviewSummaryHtml
    };
});
