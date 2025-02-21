// ==UserScript==
// @name         91live
// @namespace    http://tampermonkey.net/
// @version      2025-02-21
// @description  try to take over the world!
// @author       You
// @match        https://91zb3.live/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=91zb3.live
// @grant        none
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';





    let isExpanded = false; // 控制播放器是否展开
    let floatingPlayer = null; // 播放器容器
    let minimizeButton = null; // 缩小按钮


    // 创建缩放按钮
    const createMinimizeButton = () => {
        const button = document.createElement('button');
        button.textContent = isExpanded ? '缩小' : '播放器';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 5px 10px;
            border: none;
            border-radius: 3px;
            background: #3498db;
            color: #fff;
            cursor: pointer;
            z-index: 99999;
            user-select: none;
        `;

        // 拖动逻辑
        let isDragging = false;
        let offsetX, offsetY;

        button.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // 只处理左键点击
                isDragging = true;
                offsetX = e.clientX - button.getBoundingClientRect().left;
                offsetY = e.clientY - button.getBoundingClientRect().top;
                document.addEventListener('mousemove', onDrag);
                document.addEventListener('mouseup', onStopDrag);
            }
        });

        const onDrag = (e) => {
            if (!isDragging) return;
            button.style.left = `${e.clientX - offsetX}px`;
            button.style.top = `${e.clientY - offsetY}px`;
        };

        const onStopDrag = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', onStopDrag);
        };

        // 切换播放器状态
        button.addEventListener('click', () => {
            if (!isExpanded) {
                floatingPlayer.style.opacity = 1;
                floatingPlayer.style.transform = 'scale(1)';
                floatingPlayer.style.display = 'block';
                button.textContent = '缩小';
            } else {
                floatingPlayer.style.opacity = 0;
                setTimeout(() => {
                    floatingPlayer.style.display = 'none';
                    button.textContent = '播放器';
                }, 300); // 延迟隐藏，确保动画完成
            }
            isExpanded = !isExpanded;
        });

        return button;
    };

    // 创建悬浮播放器容器
    const createFloatingPlayer = () => {
        const container = document.createElement('div');
        container.id = 'floating-player';
        container.style.cssText = `
            position: fixed;
            bottom: 60px; /* 避开缩小按钮 */
            right: 20px;
            width: 400px;
            height: 300px;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 5px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
            z-index: 99999;
            transition: opacity 0.3s, transform 0.3s;
            display: none; /* 初始隐藏 */
        `;

        // 创建播放器区域
        const playerArea = document.createElement('div');
        playerArea.id = 'player-area';
        playerArea.style.cssText = `
            width: 100%;
            height: 80%;
            background: #000;
        `;

        // 创建控制面板
        const controlPanel = document.createElement('div');
        controlPanel.id = 'control-panel';
        controlPanel.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            height: 20%;
            padding: 0 10px;
            box-sizing: border-box;
            background: rgba(0, 0, 0, 0.6);
            color: #fff;
        `;

        // 输入框
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '输入视频流地址';
        input.style.cssText = `
            flex: 1;
            margin-right: 10px;
            padding: 5px;
            border: none;
            border-radius: 3px;
            background: #fff;
        `;

        // 播放按钮
        const playButton = document.createElement('button');
        playButton.textContent = '播放';
        playButton.style.cssText = `
            padding: 5px 10px;
            border: none;
            border-radius: 3px;
            background: #4CAF50;
            color: #fff;
            cursor: pointer;
        `;
        playButton.addEventListener('click', () => {
            const url = input.value.trim();
            if (url) {
                myjessibuca.play(url);
            }
        });

        // 停止按钮
        const stopButton = document.createElement('button');
        stopButton.textContent = '停止';
        stopButton.style.cssText = `
            padding: 5px 10px;
            border: none;
            border-radius: 3px;
            background: #f44336;
            color: #fff;
            cursor: pointer;
        `;
        stopButton.addEventListener('click', () => {
            myjessibuca.pause();
        });

        // 关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.style.cssText = `
            padding: 5px 10px;
            border: none;
            border-radius: 3px;
            background: #333;
            color: #fff;
            cursor: pointer;
        `;
        closeButton.addEventListener('click', () => {
            document.body.removeChild(container);
            document.body.removeChild(minimizeButton);
        });

        // 组装控制面板
        controlPanel.appendChild(input);
        controlPanel.appendChild(playButton);
        controlPanel.appendChild(stopButton);
        controlPanel.appendChild(closeButton);

        // 组装容器
        container.appendChild(playerArea);
        container.appendChild(controlPanel);

        return container;
    };

    // 初始化 Jessibuca 播放器
    const initPlayer = (playerArea) => {
        const jessibuca = new Jessibuca({
            container: playerArea,
            videoBuffer: 0.2,
            isResize: true,
            showBandwidth: true,
            operateBtns: {
                fullscreen: true,
                screenshot: true,
                play: true,
                audio: true,
                record: true
            },
            debug: false
        });

        return jessibuca;
    };

    // 主逻辑
    minimizeButton = createMinimizeButton();
    document.body.appendChild(minimizeButton);

    floatingPlayer = createFloatingPlayer();
    document.body.appendChild(floatingPlayer);

    const playerArea = document.getElementById('player-area');
    const myjessibuca = initPlayer(playerArea);




    // 创建悬浮按钮
    const floatingButton = $('<div>')
        .addClass('floating-button')
        .text('点击我')
        .css({
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: '#4CAF50',
            color: '#ffffff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'move',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
            zIndex: '10000',
            transform: 'scale(1)', // 初始缩放
            transition: 'transform 0.3s ease' // 缩放过渡效果
        });

    // 创建隐藏的悬浮列表
    const hiddenList = $('<div>')
        .addClass('hidden-list')
        .css({
            position: 'fixed',
            top: '60px', // 默认位置
            right: '10px',
            background: '#ffffff',
            border: '1px solid #cccccc',
            padding: '10px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            zIndex: '9999',
            width: '200px',
            maxHeight: '300px',
            overflowY: 'auto',
            display: 'none' // 默认隐藏
        });

   var index = 1;
    function additem(url){
        const listItem = $('<div>')
            .text(url)
            .addClass('list-item')
            .css({
                padding: '5px',
                margin: '5px 0',
                background: '#f0f0f0',
                cursor: 'pointer',
                borderRadius: '3px'
            })
            .on('click',  function(e) {
        // 获取被点击的元素
        const clickedElement = $(e.target);

        // 获取元素的文本内容
        const text = clickedElement.text();

        // 用 alert 显示文本内容
        alert('你点击了元素，文本内容是：' + text);

        myjessibuca.play(text);
    }); // 绑定点击事件

        hiddenList.append(listItem);
    }

    // 按钮拖动功能
    let isDragging = false;
    let xOffset = 0;
    let yOffset = 0;

    floatingButton.on('mousedown', (e) => {
        isDragging = true;
        xOffset = e.clientX - parseFloat(floatingButton.css('left'));
        yOffset = e.clientY - parseFloat(floatingButton.css('top'));

        $(document).on('mousemove', handleMouseMove);
    });

    $(document).on('mouseup', () => {
        isDragging = false;
        $(document).off('mousemove', handleMouseMove);
    });

    function handleMouseMove(e) {
        if (!isDragging) return;

        const newLeft = e.clientX - xOffset;
        const newTop = e.clientY - yOffset;

        floatingButton.css({
            left: newLeft + 'px',
            top: newTop + 'px'
        });

        // 同步隐藏列表的位置
        hiddenList.css({
            right: 'auto',
            left: newLeft + 'px',
            top: (newTop + floatingButton.outerHeight()) + 'px'
        });
    }

    // 按钮点击事件：显示或隐藏隐藏列表
    floatingButton.on('click', () => {
        hiddenList.toggle();
    });

    // 缩放功能（通过鼠标滚轮）
    floatingButton.on('wheel', (e) => {
        e.preventDefault();

        const scale = parseInt(floatingButton.css('transform').match(/scale\((.+)\)/)[1], 10);
        const delta = e.originalEvent.deltaY < 0 ? 0.1 : -0.1;
        const newScale = Math.max(0.5, Math.min(2.5, scale + delta));

        floatingButton.css('transform', `scale(${newScale})`);

        // 同步隐藏列表的大小（可选）
        hiddenList.css('transform', `scale(${newScale})`);
    });

    // 将按钮和隐藏列表添加到页面
    $('body').append(floatingButton, hiddenList);

        // 定义一个 hook 函数，用于拦截特定对象的方法
    function hook(target, methodName, fn) {
        if (!target || !target[methodName] || typeof target[methodName] !== 'function') {
            console.error('无效的目标对象或方法');
            return;
        }

        // 保存原始方法
        const originalMethod = target[methodName];

        // 替换方法为新的函数
        target[methodName] = function (...args) {
            // 调用自定义函数
            const result = fn.apply(this, [this, args, originalMethod]);

            // 返回原始方法的结果
            return result;
        };
    }



    // 定义 hook 回调函数
    function onPlayHook(context, args, originalPlay) {
        console.log('play 方法被调用！');

        // 获取视频 URL
        const url = args[0];
        console.log('播放的视频 URL:', url);
        myjessibuca.play(url);
        additem(url);

        // 调用原始的 play 方法
        const result = originalPlay.apply(context, args);

        return result;
    }

    // 轮询检查 player 是否可用
    let isHooked = false;
    const checkInterval = setInterval(() => {
        if (player && player.play && typeof player.play === 'function') {
            if (!isHooked) {
                hook(player, 'play', onPlayHook);
                console.log('play 方法已 hook');
                isHooked = true;
                clearInterval(checkInterval); // 停止轮询
            }
        }
    }, 1000);

})();