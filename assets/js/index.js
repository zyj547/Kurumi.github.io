
        document.addEventListener('DOMContentLoaded', () => {

            // 标签页切到后台时暂停常驻 CSS 动画（流星/极光/光晕），省电控温
            document.addEventListener('visibilitychange', () => {
                document.body.classList.toggle('anim-paused', document.hidden);
            });

            /* ==========================================================================
               1. Canvas 星尘粒子网络背景 (自旋转 + 闪烁 + 鼠标连线)
               ========================================================================== */
            class ParticleSystem {
                constructor(canvas) {
                    this.canvas = canvas;
                    this.ctx = canvas.getContext('2d');
                    this.particles = [];
                    this.connectionDistance = 110;
                    this.rotationAngle = 0;
                    this.resize();
                    this.init();
                    window.addEventListener('resize', () => this.resize());
                }

                resize() {
                    this.canvas.width = this.canvas.clientWidth;
                    this.canvas.height = this.canvas.clientHeight;
                    // 移动端低功耗模式：降低粒子量并跳过最昂贵的两两连线与引力计算，省电控温
                    const isMobile = window.innerWidth <= 768;
                    this.lowPower = isMobile;
                    const cap = isMobile ? 40 : 100;
                    const density = isMobile ? 26000 : 16000;
                    // 自适应粒子数量
                    this.particleCount = Math.min(cap, Math.floor((this.canvas.width * this.canvas.height) / density));
                    this.init();
                }

                init() {
                    this.particles = [];
                    for (let i = 0; i < this.particleCount; i++) {
                        this.particles.push({
                            x: Math.random() * this.canvas.width,
                            y: Math.random() * this.canvas.height,
                            vx: (Math.random() - 0.5) * 0.4,
                            vy: (Math.random() - 0.5) * 0.4,
                            r: Math.random() * 2 + 0.8,
                            alpha: Math.random(),
                            da: (Math.random() * 0.02) + 0.005
                        });
                    }
                }

                draw(mouseXPos, mouseYPos) {
                    const ctx = this.ctx;
                    const w = this.canvas.width;
                    const h = this.canvas.height;
                    const particles = this.particles;
                    const interactive = !this.lowPower && mouseXPos && mouseYPos;
                    ctx.clearRect(0, 0, w, h);

                    // 1. 物理更新 (一次遍历完成引力/移动/反弹/闪烁；坐标数学与 ctx 变换无关)
                    for (let i = 0; i < particles.length; i++) {
                        const p = particles[i];

                        // 鼠标引力场吸附 (Gravity field pull)，低功耗模式跳过
                        if (interactive) {
                            const dx = mouseXPos - p.x;
                            const dy = mouseYPos - p.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < 200 && dist > 0) {
                                const force = (200 - dist) / 200 * 0.08;
                                p.vx += (dx / dist) * force;
                                p.vy += (dy / dist) * force;

                                // 速度阈值限制，防止粒子飞逸
                                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                                if (speed > 0.8) {
                                    p.vx = (p.vx / speed) * 0.8;
                                    p.vy = (p.vy / speed) * 0.8;
                                }
                            }
                        }

                        p.x += p.vx;
                        p.y += p.vy;

                        // 触壁反弹
                        if (p.x < 0 || p.x > w) p.vx *= -1;
                        if (p.y < 0 || p.y > h) p.vy *= -1;

                        // 闪烁
                        p.alpha += p.da;
                        if (p.alpha > 1 || p.alpha < 0.2) p.da *= -1;
                    }

                    // 2. 旋转坐标系下绘制 (模拟星尘微旋)
                    ctx.save();
                    ctx.translate(w / 2, h / 2);
                    this.rotationAngle += 0.00015;
                    ctx.rotate(this.rotationAngle);
                    ctx.translate(-w / 2, -h / 2);

                    // 用空间网格把 O(n²) 全量两两连线降到近邻查询：边长取连线距离，
                    // 每个粒子只需检查相邻 9 个网格单元内的粒子。
                    const cell = this.connectionDistance;
                    let grid = null;
                    if (!this.lowPower) {
                        grid = new Map();
                        for (let i = 0; i < particles.length; i++) {
                            const p = particles[i];
                            const key = Math.floor(p.x / cell) + "," + Math.floor(p.y / cell);
                            let bucket = grid.get(key);
                            if (!bucket) { bucket = []; grid.set(key, bucket); }
                            bucket.push(i);
                        }
                    }

                    for (let i = 0; i < particles.length; i++) {
                        const p = particles[i];
                        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.75})`;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                        ctx.fill();

                        if (this.lowPower) continue;

                        // 粒子间连线 (星空网络)：仅连相邻网格中序号更大的粒子，避免重复绘制
                        const cx = Math.floor(p.x / cell);
                        const cy = Math.floor(p.y / cell);
                        for (let gx = cx - 1; gx <= cx + 1; gx++) {
                            for (let gy = cy - 1; gy <= cy + 1; gy++) {
                                const bucket = grid.get(gx + "," + gy);
                                if (!bucket) continue;
                                for (let b = 0; b < bucket.length; b++) {
                                    const j = bucket[b];
                                    if (j <= i) continue;
                                    const p2 = particles[j];
                                    const dx = p.x - p2.x;
                                    const dy = p.y - p2.y;
                                    const dist = Math.sqrt(dx * dx + dy * dy);
                                    if (dist < cell) {
                                        const alpha = (1 - dist / cell) * 0.08;
                                        ctx.strokeStyle = `rgba(79, 70, 229, ${alpha})`;
                                        ctx.lineWidth = 0.5;
                                        ctx.beginPath();
                                        ctx.moveTo(p.x, p.y);
                                        ctx.lineTo(p2.x, p2.y);
                                        ctx.stroke();
                                    }
                                }
                            }
                        }
                    }
                    ctx.restore();

                    // 3. 鼠标连线 (非旋转坐标系中连接)，低功耗模式跳过
                    if (interactive) {
                        for (let i = 0; i < particles.length; i++) {
                            const p = particles[i];
                            const dx = p.x - mouseXPos;
                            const dy = p.y - mouseYPos;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            if (dist < 150) {
                                const alpha = (1 - dist / 150) * 0.22;
                                ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
                                ctx.lineWidth = 0.8;
                                ctx.beginPath();
                                ctx.moveTo(p.x, p.y);
                                ctx.lineTo(mouseXPos, mouseYPos);
                                ctx.stroke();
                            }
                        }
                    }
                }
            }

            const canvas = document.getElementById('particle-canvas');
            const system = new ParticleSystem(canvas);

            /* ==========================================================================
               2. 鼠标跟随暖橘色光晕与前景视差 (Lerp Follow & Parallax)
               ========================================================================== */
            const glow = document.getElementById('mouse-glow');
            let mouseX = window.innerWidth / 2;
            let mouseY = window.innerHeight / 2;
            let glowX = mouseX;
            let glowY = mouseY;

            let parallaxX = 0;
            let parallaxY = 0;
            let targetParallaxX = 0;
            let targetParallaxY = 0;

            window.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;

                // 转换坐标用于视差 (-0.5 到 0.5)
                targetParallaxX = (e.clientX / window.innerWidth) - 0.5;
                targetParallaxY = (e.clientY / window.innerHeight) - 0.5;
            }, { passive: true });

            function updateLoop() {
                const lerpFactor = 0.08;
                // 光晕跟随
                glowX += (mouseX - glowX) * lerpFactor;
                glowY += (mouseY - glowY) * lerpFactor;
                glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;

                // 视差偏转
                parallaxX += (targetParallaxX - parallaxX) * lerpFactor;
                parallaxY += (targetParallaxY - parallaxY) * lerpFactor;
                
                canvas.style.transform = `translate3d(${parallaxX * 20}px, ${parallaxY * 20}px, 0)`;

                const heroes = document.querySelectorAll('.parallax-hero');
                heroes.forEach(el => {
                    el.style.transform = `translate3d(${parallaxX * -15}px, ${parallaxY * -15}px, 0)`;
                });

                // Canvas 粒子渲染
                system.draw(mouseX, mouseY);

                requestAnimationFrame(updateLoop);
            }
            updateLoop();


            /* ==========================================================================
               3. 滚动触发进场动画与数字增长 (Stagger & Counters)
               ========================================================================== */
            
            // 3.1 累加数字增长
            const counters = document.querySelectorAll('.counter-val');
            const counterObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = entry.target;
                        const targetVal = parseInt(target.getAttribute('data-target'), 10);
                        let currentVal = 0;
                        const duration = 2000;
                        const startTime = performance.now();

                        function count(now) {
                            const elapsed = now - startTime;
                            const progress = Math.min(elapsed / duration, 1);
                            const easeOutQuad = progress * (2 - progress);
                            currentVal = Math.floor(easeOutQuad * targetVal);
                            target.innerText = currentVal;

                            if (progress < 1) {
                                requestAnimationFrame(count);
                            } else {
                                target.innerText = targetVal;
                            }
                        }
                        
                        requestAnimationFrame(count);
                        counterObserver.unobserve(target);
                    }
                });
            }, { threshold: 0.5 });

            counters.forEach(c => counterObserver.observe(c));

            // 3.2 滚动入场效果触发 (包含每个卡片 0.1s Stagger 错落延迟)
            const scrollElements = document.querySelectorAll('.animate-on-scroll');
            const elementObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        elementObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });

            scrollElements.forEach(el => elementObserver.observe(el));

            /* 流水线连接线：进入视口时触发流光 */
            const pipelineContainer = document.getElementById('pipeline-container');
            if (pipelineContainer) {
                const connectorObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        const connectors = pipelineContainer.querySelectorAll('.pipeline-connector');
                        connectors.forEach((c, i) => {
                            if (entry.isIntersecting) {
                                setTimeout(() => c.classList.add('flowing'), i * 150);
                            } else {
                                c.classList.remove('flowing');
                            }
                        });
                    });
                }, { threshold: 0.3 });
                connectorObserver.observe(pipelineContainer);
            }

            /* 汉堡菜单开关 */
            const hamburger = document.getElementById('nav-hamburger');
            const drawer = document.getElementById('nav-drawer');
            const drawerClose = document.getElementById('nav-drawer-close');

            hamburger.addEventListener('click', () => drawer.classList.add('open'));
            drawerClose.addEventListener('click', () => drawer.classList.remove('open'));
            drawer.querySelectorAll('.drawer-link').forEach(link => {
                link.addEventListener('click', () => drawer.classList.remove('open'));
            });

            /* ==========================================================================
               4. 3D 卡片悬停陀螺仪倾斜 (3D Card Tilt)
               ========================================================================== */
            const cards = document.querySelectorAll('.glass-card');
            cards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    // 仅在非移动端时触发 3D 倾斜，保障移动端触摸滚动体验
                    if (window.innerWidth <= 768) {
                        card.style.transform = '';
                        return;
                    }
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    const rotY = (x / (rect.width / 2)) * 8;
                    const rotX = -(y / (rect.height / 2)) * 8;
                    card.style.transition = 'transform 0.08s ease, border-color 0.3s, box-shadow 0.3s';
                    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
                });
                card.addEventListener('mouseleave', () => {
                    card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s, box-shadow 0.3s';
                    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
                });
            });

            /* ==========================================================================
               5. 视差滚动与音效引擎 (Parallax & Audio Engine)
               ========================================================================== */
            
            // 5.1 视差滚动
            const orbContainer = document.getElementById('bg-orb-container');
            const bokehContainer = document.querySelector('.space-bokeh-container');

            document.addEventListener('mousemove', (e) => {
                if (window.innerWidth <= 768) return;
                const moveX = (e.clientX - window.innerWidth / 2) * 0.015;
                const moveY = (e.clientY - window.innerHeight / 2) * 0.015;
                
                if (orbContainer) {
                    orbContainer.style.transform = `translate(${moveX * 0.5}px, ${moveY * 0.5}px)`;
                }
                if (bokehContainer) {
                    bokehContainer.style.transform = `translate(${moveX * -0.4}px, ${moveY * -0.4}px)`;
                }
            });

            // 5.2 Web Audio API 音效合成引擎
            let audioCtx = null;
            let soundEnabled = false;

            function initAudio() {
                if (!audioCtx) {
                    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }
            }

            window.playHoverSound = function(pitchIndex = 0) {
                if (!soundEnabled) return;
                initAudio();
                const osc = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                // 经典五声音阶 (Pentatonic Scale): C4, D4, E4, G4, A4, C5, D5
                const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];
                const freq = scale[pitchIndex % scale.length];
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                // 带有滑音特效
                osc.frequency.exponentialRampToValueAtTime(freq * 1.3, audioCtx.currentTime + 0.08);
                
                gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
                
                osc.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                osc.start();
                osc.stop(audioCtx.currentTime + 0.08);
            };

            window.playClickSound = function() {
                if (!soundEnabled) return;
                initAudio();
                const osc = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(1500, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.12);
                
                gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
                
                osc.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                osc.start();
                osc.stop(audioCtx.currentTime + 0.12);
            };

            window.toggleGlobalSound = function(e) {
                if (e) e.stopPropagation();
                soundEnabled = !soundEnabled;
                initAudio();
                const btn = document.getElementById('sound-toggle-btn');
                if (soundEnabled) {
                    btn.classList.add('active');
                    btn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
                    playClickSound();
                } else {
                    btn.classList.remove('active');
                    btn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
                }
            };

            // 监听并分组绑定音阶音效
            const interactiveGroups = [
                document.querySelectorAll('.nav-links a'),
                document.querySelectorAll('.nav-drawer a'),
                document.querySelectorAll('.tab-btn'),
                document.querySelectorAll('.pipeline-card'),
                document.querySelectorAll('.btn-game-cta')
            ];
            
            interactiveGroups.forEach(group => {
                group.forEach((el, index) => {
                    el.addEventListener('mouseenter', () => {
                        playHoverSound(index);
                    });
                    el.addEventListener('click', () => {
                        playClickSound();
                    });
                });
            });

            const singleInteractive = document.querySelectorAll('.nav-logo, .nav-hamburger, #live-save-card a');
            singleInteractive.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    playHoverSound(0);
                });
                el.addEventListener('click', () => {
                    playClickSound();
                });
            });

            // 针对第一次点击激活 AudioContext
            document.addEventListener('click', () => {
                if (audioCtx && audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }
            }, { once: true });

            // 检查本地是否有小游戏存档数据以拉起“重返办公室”动态卡片
            const saveStr = localStorage.getItem("hoshikuzu_tycoon_save");
            if (saveStr) {
                try {
                    const parsed = JSON.parse(saveStr);
                    if (parsed && parsed.companyName) {
                        document.getElementById("save-card-name").innerText = parsed.companyName;
                        document.getElementById("save-card-date").innerText = `第 ${parsed.date.year} 年 ${parsed.date.month} 月`;
                        document.getElementById("save-card-fans").innerText = `${parsed.fans.toLocaleString()} 人`;
                        document.getElementById("save-card-funds").innerText = `¥${Math.round(parsed.funds).toLocaleString()}`;
                        document.getElementById("live-save-card").style.display = "block";
                    }
                } catch (e) {
                    console.error("加载存档数据简报失败", e);
                }
            }

        });
    