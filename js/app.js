/**
 * 牛马TI (NMTI) - 应用逻辑
 */
const App = {
    idx: 0,
    scores: { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 },
    history: [], // 记录每题选择，支持返回

    init() {
        document.getElementById('btn-start').onclick = () => this.start();
        document.getElementById('opt-a').onclick = () => this.pick('a');
        document.getElementById('opt-b').onclick = () => this.pick('b');
        document.getElementById('btn-back').onclick = () => this.goBack();
        document.getElementById('btn-share').onclick = () => this.share();
        document.getElementById('btn-retry').onclick = () => { this.reset(); this.show('home'); };
    },

    show(id) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-' + id).classList.add('active');
        window.scrollTo(0, 0);
    },

    reset() {
        this.idx = 0;
        this.scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        this.history = [];
    },

    start() {
        this.reset();
        this.show('test');
        this.render();
    },

    render() {
        const q = QUESTIONS[this.idx];
        const total = QUESTIONS.length;
        document.getElementById('test-count').textContent = `${this.idx + 1}/${total}`;
        document.getElementById('progress-fill').style.width = `${((this.idx + 1) / total) * 100}%`;
        document.getElementById('test-q').textContent = q.q;
        document.getElementById('opt-a').textContent = q.a;
        document.getElementById('opt-b').textContent = q.b;
        document.getElementById('dim-hint').textContent = DIM_HINTS[q.dim] || '';

        // 返回按钮状态
        const backBtn = document.getElementById('btn-back');
        backBtn.disabled = this.idx === 0;

        const body = document.getElementById('test-body');
        body.classList.remove('slide-in');
        void body.offsetWidth;
        body.classList.add('slide-in');
    },

    pick(choice) {
        const q = QUESTIONS[this.idx];
        const dim = q.dim;
        if (choice === 'a') this.scores[dim[0]]++;
        else this.scores[dim[1]]++;

        // 记录历史
        this.history.push({ idx: this.idx, choice, dim });

        const btn = document.getElementById('opt-' + choice);
        btn.classList.add('picked');

        setTimeout(() => {
            btn.classList.remove('picked');
            this.idx++;
            if (this.idx < QUESTIONS.length) {
                const body = document.getElementById('test-body');
                body.classList.add('slide-out');
                setTimeout(() => {
                    body.classList.remove('slide-out');
                    this.render();
                }, 200);
            } else {
                this.analyze();
            }
        }, 250);
    },

    goBack() {
        if (this.history.length === 0) return;

        // 撤销上一次选择
        const last = this.history.pop();
        const dim = last.dim;
        if (last.choice === 'a') this.scores[dim[0]]--;
        else this.scores[dim[1]]--;

        this.idx = last.idx;

        // 反向滑动动画
        const body = document.getElementById('test-body');
        body.style.animation = 'none';
        void body.offsetWidth;
        body.style.animation = '';
        this.render();
    },

    analyze() {
        this.show('loading');
        const texts = [
            '正在扫描你的牛马基因...',
            '检测打工倦怠指数...',
            '分析摸鱼技巧等级...',
            '计算被PUA概率...',
            '匹配你的牲口品种...',
        ];
        let i = 0;
        const el = document.getElementById('loading-text');
        const bar = document.getElementById('loading-bar-fill');
        bar.style.width = '0%';

        const iv = setInterval(() => {
            i++;
            bar.style.width = `${(i / texts.length) * 100}%`;
            if (i < texts.length) el.textContent = texts[i];
            if (i >= texts.length) {
                clearInterval(iv);
                setTimeout(() => this.showResult(), 300);
            }
        }, 600);
    },

    getType() {
        const s = this.scores;
        return (
            (s.E >= s.I ? 'E' : 'I') +
            (s.S >= s.N ? 'S' : 'N') +
            (s.T >= s.F ? 'T' : 'F') +
            (s.J >= s.P ? 'J' : 'P')
        );
    },

    getDimPercents() {
        const s = this.scores;
        const pct = (a, b) => {
            const total = s[a] + s[b];
            return total === 0 ? 50 : Math.round((s[a] / total) * 100);
        };
        return {
            EI: pct('E', 'I'),
            SN: pct('S', 'N'),
            TF: pct('T', 'F'),
            JP: pct('J', 'P'),
        };
    },

    showResult() {
        const code = this.getType();
        const t = TYPES[code];
        if (!t) { this.show('home'); return; }

        document.getElementById('result-code').textContent = code;
        // 图标占位 — 等aeka出图后替换
        document.getElementById('result-icon').textContent = code.charAt(0);
        document.getElementById('result-name').textContent = t.name;
        document.getElementById('result-subtitle').textContent = t.subtitle;
        document.getElementById('result-desc').textContent = t.desc;

        // 属性条
        const barsEl = document.getElementById('result-bars');
        barsEl.innerHTML = '';
        const colors = ['#7c5cff', '#00d4aa', '#ff6b9d', '#ffd93d'];
        Object.entries(t.bars).forEach(([name, val], i) => {
            const d = document.createElement('div');
            d.className = 'bar-item';
            d.innerHTML = `<div class="bar-top"><span class="bar-name">${name}</span><span class="bar-val" style="color:${colors[i % 4]}">${val}</span></div><div class="bar-track"><div class="bar-fill" style="width:0%;background:${colors[i % 4]}"></div></div>`;
            barsEl.appendChild(d);
            setTimeout(() => d.querySelector('.bar-fill').style.width = val + '%', 150);
        });

        // 四维倾向
        const dimEl = document.getElementById('dim-scales');
        dimEl.innerHTML = '';
        const pcts = this.getDimPercents();
        const dims = [
            { key: 'EI', left: 'E 外向', right: 'I 内向' },
            { key: 'SN', left: 'S 务实', right: 'N 直觉' },
            { key: 'TF', left: 'T 理性', right: 'F 感性' },
            { key: 'JP', left: 'J 计划', right: 'P 随缘' },
        ];
        dims.forEach(dim => {
            const pct = pcts[dim.key];
            const row = document.createElement('div');
            row.className = 'dim-scale';
            row.innerHTML = `
                <span class="dim-left">${dim.left}</span>
                <div class="dim-track"><div class="dim-dot" style="left:50%"></div></div>
                <span class="dim-right">${dim.right}</span>
                <span class="dim-pct">${pct}%</span>
            `;
            dimEl.appendChild(row);
            setTimeout(() => row.querySelector('.dim-dot').style.left = pct + '%', 200);
        });

        // 搭子 — 显示 MBTI+名字
        const pEl = document.getElementById('partners');
        pEl.innerHTML = '';
        t.partners.forEach((p, i) => {
            const pt = TYPES[p];
            if (!pt) return;
            pEl.innerHTML += `<div class="mate-card"><div class="mate-top"><span class="mate-code">${p}</span><span class="mate-name">${pt.name.replace(p + ' ', '')}</span></div><div class="mate-why">${t.partnerWhy[i] || ''}</div></div>`;
        });

        // 远离
        const aEl = document.getElementById('avoids');
        aEl.innerHTML = '';
        t.avoids.forEach((a, i) => {
            const at = TYPES[a];
            if (!at) return;
            aEl.innerHTML += `<div class="mate-card"><div class="mate-top"><span class="mate-code">${a}</span><span class="mate-name">${at.name.replace(a + ' ', '')}</span></div><div class="mate-why">${t.avoidWhy[i] || ''}</div></div>`;
        });

        // 生存指南
        const tEl = document.getElementById('tips');
        tEl.innerHTML = '';
        t.tips.forEach(tip => { tEl.innerHTML += `<li>${tip}</li>`; });

        // 标签
        const lEl = document.getElementById('labels');
        lEl.innerHTML = '';
        const lc = ['a', 'b', 'c'];
        t.labels.forEach((l, i) => { lEl.innerHTML += `<span class="label-tag ${lc[i % 3]}">${l}</span>`; });

        this.show('result');
    },

    share() {
        const code = this.getType();
        const t = TYPES[code];
        if (!t) return;
        const pcts = this.getDimPercents();
        const shortName = t.name.replace(code + ' ', '');
        const text = [
            `我的牛马TI鉴定结果：`,
            ``,
            `【${t.name}】`,
            `"${t.subtitle}"`,
            ``,
            `E${pcts.EI}% | S${pcts.SN}% | T${pcts.TF}% | J${pcts.JP}%`,
            ``,
            `最佳搭子：${t.partners.map(p => TYPES[p]?.name.replace(p + ' ', '')).join('、')}`,
            `远离警告：${t.avoids.map(a => TYPES[a]?.name.replace(a + ' ', '')).join('、')}`,
            `标签：${t.labels.join(' | ')}`,
            ``,
            `你是哪种打工牲口？来测 👉 qishisuren123.github.io/niuma-ti`,
            `#牛马TI #NMTI #evomap`
        ].join('\n');

        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => this.toast('已复制，发给工友们！'))
                .catch(() => this.fallbackCopy(text));
        } else {
            this.fallbackCopy(text);
        }
    },

    fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); this.toast('已复制，发给工友们！'); }
        catch { this.toast('复制失败，请手动复制'); }
        document.body.removeChild(ta);
    },

    toast(msg) {
        const t = document.getElementById('toast');
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2500);
    },
};

document.addEventListener('DOMContentLoaded', () => App.init());
