const 座位配置 = [
    { row: 0, seats: "ab ab ab ab ab ab ab 31 29 27 25 23 21 ab 19 17 15 13 11 9 7 5 3 1 2 4 6 8 10 12 14 16 18 20 ab 22 24 26 28 30 32 ab ab ab ab ab ab ab" },
    { row: 1, seats: "ab ab ab ab ab 35 33 31 29 27 25 23 21 ab 19 17 15 13 11 9 7 5 3 1 2 4 6 8 10 12 14 16 18 20 ab 22 24 26 28 30 32 34 36 ab ab ab ab ab" },
    { row: 2, seats: "ab ab ab ab 37 35 33 31 29 27 25 23 21 ab 19 17 15 13 11 9 7 5 3 1 2 4 6 8 10 12 14 16 18 20 ab 22 24 26 28 30 32 34 36 38 ab ab ab ab" },
    { row: 3, seats: "ab ab ab 39 37 35 33 31 29 27 25 23 21 ab 19 17 15 13 11 9 7 5 3 1 2 4 6 8 10 12 14 16 18 20 ab 22 24 26 28 30 32 34 36 38 40 ab ab ab" },
    { row: 4, seats: "ab ab 41 39 37 35 33 31 29 27 25 23 21 ab 19 17 15 13 11 9 7 5 3 1 2 4 6 8 10 12 14 16 18 20 ab 22 24 26 28 30 32 34 36 38 40 42 ab ab" },
    { row: 5, seats: "ab 43 41 39 37 35 33 31 29 27 25 23 21 ab 19 17 15 13 11 9 7 5 3 1 2 4 6 8 10 12 14 16 18 20 ab 22 24 26 28 30 32 34 36 38 40 42 44 ab" },
    { row: 6, seats: "45 43 41 39 37 35 33 31 29 27 25 23 21 ab 19 17 15 13 11 9 7 5 3 1 2 4 6 8 10 12 14 16 18 20 ab 22 24 26 28 30 32 34 36 38 40 42 44 46" },
    { row: 7, seats: "45 43 41 39 37 35 33 31 29 27 25 23 21 ab 19 17 15 13 11 9 7 5 3 1 2 4 6 8 10 12 14 16 18 20 ab 22 24 26 28 30 32 34 36 38 40 42 44 46" },
    { row: 8, seats: "45 43 41 39 37 35 33 31 29 27 25 23 21 ab 19 17 15 13 11 9 7 5 3 1 2 4 6 8 10 12 14 16 18 20 ab 22 24 26 28 30 32 34 36 38 40 42 44 46" },
    { row: " ", seats: " " },
    ...Array.from({ length: 12 }, (_, i) => ({ row: i + 9, seats: "45 43 41 39 37 35 33 31 29 27 25 23 21 ab 19 17 15 13 11 9 7 5 3 1 2 4 6 8 10 12 14 16 18 20 ab 22 24 26 28 30 32 34 36 38 40 42 44 46" })),
];
const 座位容器 = document.getElementById('座位容器');
const 开始按钮 = document.getElementById('开始按钮');
const 舞台显示 = document.getElementById('舞台区域');
const 抽奖人数输入 = document.getElementById('抽奖人数'); 
const 音效开关 = document.getElementById('音效开关'); 
const 排数范围选项 = document.querySelectorAll('input[name="排数范围"]');
const targetTime = new Date("2025-05-24T16:30:00").getTime();

const sounds = [
    { name: "Nahida", path: "https://static.codemao.cn/pickduck/SJQt97AWxg.mp3" },
    { name: "Hutao", path: "https://static.codemao.cn/pickduck/B127r70bgg.mp3" },
    { name: "Furina", path: "https://static.codemao.cn/pickduck/BJl0u70Wgg.mp3" },
    { name: "Klee", path: "https://static.codemao.cn/pickduck/S1yZ_mR-eg.mp3" },
    { name: "Ciallo～(∠・ω< )⌒★", path: "https://static.codemao.cn/pickduck/HJaHo7RZle.mp3" },/*
    { name: "Mambo", path: "https://static.codemao.cn/pickduck/ryuAR9Fqlx.mp3" },*/
];
const 音乐 = new Audio();

let 正在运行 = false;
let 当前高亮列表 = [];
let 座位元素集合 = {};
let 当前排数范围 = "全部";
function 加载设置() {
    const 音效已开启 = localStorage.getItem('soundEnabled');
    if (音效已开启 !== null) {
        音效开关.checked = 音效已开启 === 'true';
    }
    const 保存的排数范围 = localStorage.getItem('seatRange');
    if (保存的排数范围 !== null) {
        当前排数范围 = 保存的排数范围;
        document.querySelector(`input[name="排数范围"][value="${当前排数范围}"]`).checked = true;
    }
}

function 保存设置() {
    localStorage.setItem('soundEnabled', 音效开关.checked);
    localStorage.setItem('seatRange', 当前排数范围);
}

function 获取可用座位键() {
    let 所有座位键 = Object.keys(座位元素集合);

    switch(当前排数范围) {
        case "不含第0排":
            所有座位键 = 所有座位键.filter(key => !key.startsWith('0-'));
            break;
        case "不含中间0排":
            所有座位键 = 所有座位键.filter(key => {
                const [排号, 座位号] = key.split('-');
                if (排号 === '0') {
                    const seatNum = parseInt(座位号, 10);
                    if (seatNum >= 1 && seatNum <= 20) {
                        return false; 
                    }
                }
                return true;
            });
            break;
        case "全部":
        default:
            break;
    }

    return 所有座位键;
}
function generateSeats() {
    座位配置.forEach(行信息 => {
        if (行信息.row === " ") {
            const 分隔行 = document.createElement('div');
            分隔行.className = '特殊行';
            分隔行.textContent = " ";
            座位容器.appendChild(分隔行);
            return;
        }

        const 行元素 = document.createElement('div');
        行元素.className = '行';

        const 左侧标签 = document.createElement('div');
        左侧标签.className = '行标签';
        左侧标签.textContent = `${行信息.row}排`;
        行元素.appendChild(左侧标签);

        const 区域 = 行信息.seats.split('ab');
        区域.forEach((区域内容, 索引) => {
            if (索引 > 0) {
                const 过道元素 = document.createElement('div');
                过道元素.className = '过道';
                行元素.appendChild(过道元素);
            }

            const 座位号 = 区域内容.trim().split(' ');
            座位号.forEach(座位 => {
                if (座位 === '') return;

                const 座位元素 = document.createElement('div');
                座位元素.className = '座位';
                座位元素.textContent = 座位;

                if (座位 === '1' || 座位 === '2') {
                    const 特殊座位元素 = document.createElement('div');
                    特殊座位元素.className = '座位';
                    特殊座位元素.textContent = 座位;
                    特殊座位元素.style.margin = 座位 === '1' ? '0 4px' : '0 2px';
                    行元素.appendChild(特殊座位元素);
                    座位元素集合[`${行信息.row}-${座位}`] = 特殊座位元素;
                } else {
                    行元素.appendChild(座位元素);
                    座位元素集合[`${行信息.row}-${座位}`] = 座位元素;
                }
            });
        });

        const 右侧标签 = document.createElement('div');
        右侧标签.className = '行标签';
        右侧标签.textContent = `${行信息.row}排`;
        行元素.appendChild(右侧标签);

        座位容器.appendChild(行元素);
    });
}

function 重置高亮() {
    当前高亮列表.forEach(元素 => 元素.classList.remove('高亮'));
    当前高亮列表 = [];
}

function 获取抽奖人数() {
    return 当前轮次 < 2 ? 3 : 2;
}

function 更新舞台显示(座位列表) {
    const 显示文本 = 座位列表.map(key => {
        const [排号, 座位号] = key.split('-');
        return `${排号}排${座位号}号`;
    }).join('  ');

    舞台显示.innerHTML = `<div class="高亮列表">${显示文本}</div>`;
}

function 限制人数输入() {
    let value = parseInt(抽奖人数输入.value);
    if (isNaN(value) || value < 1) {
        抽奖人数输入.value = 1;
    } else if (value > 6) { 
        抽奖人数输入.value = 6;
    }
}

function 执行抽奖(总步骤数, 当前步骤) {
    if (当前步骤 >= 总步骤数) {
        const 抽中列表 = [];
        const 需要人数 = parseInt(抽奖人数输入.value) || 1;
        let 可用座位 = 获取可用座位键(); 

        const 实际抽取数 = Math.min(需要人数, 可用座位.length);
        
        while (抽中列表.length < 实际抽取数 && 可用座位.length > 0) {
            const 随机索引 = Math.floor(Math.random() * 可用座位.length);
            const 随机座位键 = 可用座位.splice(随机索引, 1)[0];
            抽中列表.push(随机座位键);
        }

        重置高亮();
        抽中列表.forEach(key => {
            const 元素 = 座位元素集合[key];
            元素.classList.add('高亮');
            当前高亮列表.push(元素);
        });
        更新舞台显示(抽中列表);

        
        let now = new Date().getTime();
        let delay = targetTime - now;
        if (delay <= 0 && 音效开关.checked) {
            const 随机语音索引 = Math.floor(Math.random() * sounds.length);
            音乐.src = sounds[随机语音索引].path;
            音乐.play();
        }
        

        正在运行 = false;
        开始按钮.disabled = false;
        开始按钮.textContent = "开始抽奖";
        return;
    }

    
    重置高亮();
    const 临时人数 = parseInt(抽奖人数输入.value) || 1; 
    let 可用座位 = 获取可用座位键();
    const 临时列表 = [];

    for (let i = 0; i < 临时人数 && 可用座位.length > 0; i++) {
        const 随机索引 = Math.floor(Math.random() * 可用座位.length);
        const 随机座位键 = 可用座位[随机索引];
        const 元素 = 座位元素集合[随机座位键];
        元素.classList.add('高亮');
        临时列表.push(随机座位键);
        当前高亮列表.push(元素);
    }

    更新舞台显示(临时列表);

    setTimeout(() => {
        执行抽奖(总步骤数, 当前步骤 + 1);
    }, 110 + (当前步骤 * 10));
}

window.addEventListener('load', function () {
    generateSeats();
    加载设置();

    音效开关.addEventListener('change', 保存设置);
    排数范围选项.forEach(option => {
        option.addEventListener('change', (event) => {
            当前排数范围 = event.target.value;
            保存设置();
        });
    });
    
    抽奖人数输入.addEventListener('input', 限制人数输入);
    抽奖人数输入.addEventListener('change', 限制人数输入);

    开始按钮.addEventListener('click', () => {
        if (!正在运行) {
            console.log('按钮被点击了')
            正在运行 = true;
            开始按钮.disabled = true;
            开始按钮.textContent = "抽奖中...";

            const 总步骤数 = 40 + Math.floor(Math.random() * 5);
            执行抽奖(总步骤数, 0);
        }
    });
});
(function() {
    // 设计稿的基准宽度和高度
    const DESIGN_WIDTH = 1080;
    const DESIGN_HEIGHT = 720;

    function calcRate() {
        const appRef = document.getElementById('scaling-wrapper');
        if (!appRef) return;

        // 获取当前窗口的实际可视尺寸[1](@ref)
        const clientWidth = window.innerWidth;
        const clientHeight = window.innerHeight;

        // 计算宽度和高度的缩放比例
        const scaleX = clientWidth / DESIGN_WIDTH;
        const scaleY = clientHeight / DESIGN_HEIGHT;

        // **核心算法：选择较小的缩放比例，确保内容完全显示在屏幕内[1](@ref)**
        const scale = Math.min(scaleX, scaleY);

        // 应用缩放变换
        appRef.style.transform = `scale(${scale})`;

        /* 
            * 居中计算：
            * 1. 缩放后容器的实际宽高
            * 2. 计算需要偏移的距离，使其居中
            * 3. 通过负的translate移动回来，实现完美居中[2](@ref)
            */
        const scaledWidth = DESIGN_WIDTH * scale;
        const scaledHeight = DESIGN_HEIGHT * scale;

        const offsetX = (clientWidth - scaledWidth) / 2;
        const offsetY = (clientHeight - scaledHeight) / 2;

        // 调整容器的位置，确保居中
        appRef.style.left = `50%`;
        appRef.style.top = `50%`;
        // 在scale变换的基础上，再平移，完成居中
        appRef.style.transform = `scale(${scale}) translate(-50%, -50%)`;
        // 改变transform-origin以确保平移基准正确
        appRef.style.transformOrigin = '0 0';
    }

    // 防抖函数，防止resize事件触发过于频繁
    let resizeTimer = null;
    function resize() {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            calcRate();
        }, 200); // 200毫秒内只执行一次计算
    }

    // 页面加载完成和窗口大小变化时，重新计算缩放
    window.addEventListener('load', calcRate);
    window.addEventListener('resize', resize);
    
    // 初始化执行一次
    calcRate();
})();
