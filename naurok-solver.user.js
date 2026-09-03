// ==UserScript==
// @name         har42 by aega1 (discord)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  added mobile support 
// @author       aega1
// @match        https://naurok.com.ua/*
// @run-at       document-start
// @connect      generativelanguage.googleapis.com
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // === БЛОК ОБХОДУ БЕЗПЕКИ ТА АНТИЧИТУ ===
    function disableSecurityChecks() {
        const eventsToBlock = ['blur', 'focusout', 'visibilitychange', 'webkitvisibilitychange', 'mouseleave'];
        eventsToBlock.forEach(eventName => {
            window.addEventListener(eventName, (e) => {
                e.stopImmediatePropagation();
                e.stopPropagation();
            }, true);
        });

        try {
            Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
            Object.defineProperty(document, 'webkitHidden', { get: () => false, configurable: true });
            Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
            Object.defineProperty(document, 'hasFocus', { value: () => true, configurable: true });
        } catch (e) {}

        const allowEvents = ['copy', 'cut', 'paste', 'selectstart', 'contextmenu'];
        allowEvents.forEach(eventName => {
            document.addEventListener(eventName, (e) => {
                e.stopPropagation();
            }, true);
        });
    }

    disableSecurityChecks();
    document.addEventListener('DOMContentLoaded', disableSecurityChecks);

    // === ОСНОВНИЙ СКРИПТ (ІНТЕРФЕЙС ТА AI) ===
    window.addEventListener('load', () => {
        // 1. Стилі Neumorphism Dark UI з підтримкою мобільних екранів
        const style = document.createElement('style');
        style.innerHTML = `
            #naurok-ui-panel {
                position: fixed;
                top: 20px;
                right: 15px;
                z-index: 999999;
                width: 290px;
                max-width: calc(100vw - 30px);
                background: #24272c;
                border-radius: 24px;
                box-shadow: 12px 12px 24px #1a1c20, -8px -8px 20px #2e3238;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                overflow: hidden;
                user-select: none;
                -webkit-user-select: none;
                touch-action: none;
                color: #a6adbb;
                border: 1px solid rgba(255, 255, 255, 0.03);
            }
            #naurok-ui-header {
                padding: 16px 18px 8px 18px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: move;
                touch-action: none;
            }
            .header-title {
                font-size: 13px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 0.3px;
            }
            .header-controls span {
                cursor: pointer;
                width: 28px;
                height: 28px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: #24272c;
                box-shadow: 3px 3px 6px #1a1c20, -3px -3px 6px #2e3238;
                color: #888;
                font-size: 12px;
                margin-left: 6px;
                transition: all 0.2s ease;
            }
            .header-controls span:active {
                color: #ff4500;
                box-shadow: inset 2px 2px 5px #1a1c20, inset -2px -2px 5px #2e3238;
            }
            #naurok-ui-body {
                padding: 12px 18px 18px 18px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                touch-action: auto;
            }
            .key-title {
                font-size: 11px;
                color: #6c727f;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.8px;
                margin-bottom: -4px;
            }
            .naurok-input {
                width: 100%;
                padding: 12px 14px;
                background: #24272c;
                border: none;
                outline: none;
                border-radius: 14px;
                font-size: 12px;
                color: #ffffff;
                box-shadow: inset 4px 4px 8px #1a1c20, inset -4px -4px 8px #2e3238;
                box-sizing: border-box;
            }
            .naurok-input::placeholder { color: #555b66; }
            .naurok-btn-secondary {
                width: 100%;
                padding: 10px;
                background: #24272c;
                border: none;
                border-radius: 14px;
                color: #8a92a3;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 4px 4px 8px #1a1c20, -4px -4px 8px #2e3238;
            }
            .naurok-btn-secondary:active {
                box-shadow: inset 3px 3px 6px #1a1c20, inset -3px -3px 6px #2e3238;
                color: #ffffff;
            }
            .naurok-btn-primary {
                width: 100%;
                padding: 14px;
                background: linear-gradient(135deg, #ff5e36, #ff2a00);
                border: none;
                border-radius: 20px;
                color: #ffffff;
                font-size: 13px;
                font-weight: 700;
                letter-spacing: 1px;
                text-transform: uppercase;
                cursor: pointer;
                box-shadow: 0 8px 16px rgba(255, 42, 0, 0.35), inset 1px 1px 2px rgba(255, 255, 255, 0.4);
                margin-top: 4px;
            }
            .naurok-btn-primary:active {
                transform: scale(0.98);
                box-shadow: 0 4px 8px rgba(255, 42, 0, 0.2);
            }
            #naurok-answer-box {
                background: #24272c;
                padding: 12px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 600;
                color: #e1e4ea;
                text-align: center;
                min-height: 20px;
                word-break: break-word;
                box-shadow: inset 3px 3px 6px #1a1c20, inset -3px -3px 6px #2e3238;
            }
            .naurok-ai-correct-red {
                background-color: #ff2a00 !important;
                color: #ffffff !important;
                border: 2px solid #ff5e36 !important;
                border-radius: 16px !important;
                box-shadow: 0 0 20px rgba(255, 42, 0, 0.8) !important;
                transition: all 0.3s ease !important;
            }
            .naurok-ai-correct-red * { color: #ffffff !important; }
        `;
        document.head.appendChild(style);

        // 2. Зчитування ключа
        const savedKey = GM_getValue('GEMINI_SINGLE_KEY', '');

        // 3. Створення інтерфейсу
        const panel = document.createElement('div');
        panel.id = 'naurok-ui-panel';
        panel.innerHTML = `
            <div id="naurok-ui-header">
                <span class="header-title">har42 by aega1 (discord)</span>
                <div class="header-controls">
                    <span id="btn-toggle-ui" title="Згорнути">−</span>
                    <span id="btn-close-ui" title="Закрити">✕</span>
                </div>
            </div>
            <div id="naurok-ui-body">
                <div class="key-title">Gemini API Key</div>
                <input type="password" id="key-single" class="naurok-input" placeholder="Введіть ключ Gemini..." value="${savedKey}">
                <button id="btn-save-key" class="naurok-btn-secondary">Зберегти ключ</button>
                <button id="btn-solve" class="naurok-btn-primary">Вирішити</button>
                <div id="naurok-answer-box">Готово до роботи</div>
            </div>
        `;
        document.body.appendChild(panel);

        const header = panel.querySelector('#naurok-ui-header');
        const body = panel.querySelector('#naurok-ui-body');
        const toggleBtn = panel.querySelector('#btn-toggle-ui');
        const closeBtn = panel.querySelector('#btn-close-ui');
        const answerBox = panel.querySelector('#naurok-answer-box');
        const solveBtn = panel.querySelector('#btn-solve');

        // 4. УНІВЕРСАЛЬНЕ ПЕРЕТЯГУВАННЯ (MICE & TOUCH FOR PHONES)
        let isDragging = false, startX = 0, startY = 0, initialLeft = 0, initialTop = 0;

        function onDragStart(e) {
            if (e.target.tagName === 'SPAN' && e.target.parentElement.classList.contains('header-controls')) return;
            
            isDragging = true;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            startX = clientX;
            startY = clientY;

            const rect = panel.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
        }

        function onDragMove(e) {
            if (!isDragging) return;
            if (e.cancelable) e.preventDefault();

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            const deltaX = clientX - startX;
            const deltaY = clientY - startY;

            let newLeft = initialLeft + deltaX;
            let newTop = initialTop + deltaY;

            // Обмеження, щоб панель не вилітала за межі екрана смартфона
            const maxLeft = window.innerWidth - panel.offsetWidth;
            const maxTop = window.innerHeight - panel.offsetHeight;

            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));

            panel.style.left = `${newLeft}px`;
            panel.style.top = `${newTop}px`;
        }

        function onDragEnd() {
            isDragging = false;
        }

        // Події миші
        header.addEventListener('mousedown', onDragStart);
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);

        // Сенсорні події для смартфонів (iOS / Android)
        header.addEventListener('touchstart', onDragStart, { passive: false });
        document.addEventListener('touchmove', onDragMove, { passive: false });
        document.addEventListener('touchend', onDragEnd);

        // Кнопки управління UI
        toggleBtn.addEventListener('click', () => {
            body.style.display = (body.style.display === 'none') ? 'flex' : 'none';
            toggleBtn.textContent = (body.style.display === 'none') ? '+' : '−';
        });
        closeBtn.addEventListener('click', () => panel.remove());

        panel.querySelector('#btn-save-key').addEventListener('click', () => {
            GM_setValue('GEMINI_SINGLE_KEY', panel.querySelector('#key-single').value.trim());
            answerBox.textContent = 'Ключ збережено!';
        });

        function clearHighlights() {
            document.querySelectorAll('.naurok-ai-correct-red').forEach(el => el.classList.remove('naurok-ai-correct-red'));
        }

        function highlightAnswersOnPage(aiAnswerText) {
            clearHighlights();
            if (!aiAnswerText) return false;

            const answerList = aiAnswerText.split(/\||\n/).map(a => a.trim()).filter(a => a.length > 0);
            const optionSelectors = ['.test-option', '.option-item', '[class*="option"]', '[class*="answer"]', 'label'];

            let highlightedCount = 0;

            answerList.forEach(singleAnswer => {
                const cleanAi = singleAnswer.toLowerCase().replace(/\s+/g, '').replace(/[^a-zа-яєіїґ0-9\+\-\*\/\^]/gi, '');
                if (!cleanAi) return;

                let foundForThisAnswer = false;
                for (const selector of optionSelectors) {
                    const elements = document.querySelectorAll(selector);
                    for (const el of elements) {
                        if (el.closest('#naurok-ui-panel')) continue;
                        
                        const text = el.innerText || el.textContent || '';
                        const cleanText = text.toLowerCase().replace(/\s+/g, '').replace(/[^a-zа-яєіїґ0-9\+\-\*\/\^]/gi, '');

                        if (cleanText.length > 0 && (cleanText === cleanAi || cleanText.includes(cleanAi) || cleanAi.includes(cleanText))) {
                            el.classList.add('naurok-ai-correct-red');
                            if (highlightedCount === 0) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                            highlightedCount++;
                            foundForThisAnswer = true;
                            break;
                        }
                    }
                    if (foundForThisAnswer) break;
                }
            });

            return highlightedCount > 0;
        }

        function getBase64Image(imgElement) {
            return new Promise((resolve) => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = imgElement.naturalWidth || imgElement.width;
                    canvas.height = imgElement.naturalHeight || imgElement.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(imgElement, 0, 0);
                    const dataURL = canvas.toDataURL('image/jpeg');
                    resolve(dataURL.split(',')[1]);
                } catch (e) {
                    resolve(null);
                }
            });
        }

        // 5. Старт рішення
        solveBtn.addEventListener('click', async () => {
            clearHighlights();

            const apiKey = GM_getValue('GEMINI_SINGLE_KEY', '').trim();
            if (!apiKey) {
                answerBox.textContent = 'Вкажіть API Key!';
                return;
            }

            answerBox.textContent = '🔍 Сканування сторінки...';

            const clone = document.body.cloneNode(true);
            const uiOnClone = clone.querySelector('#naurok-ui-panel');
            if (uiOnClone) uiOnClone.remove();

            const images = Array.from(document.querySelectorAll('.test-question img, .question-container img, [class*="question"] img, .test-option img'))
                                .filter(img => !img.closest('#naurok-ui-panel') && img.src);

            const parts = [];

            if (images.length > 0) {
                answerBox.textContent = `🖼️ Обробка картинок (${images.length})...`;
                for (const img of images) {
                    const base64Data = await getBase64Image(img);
                    if (base64Data) {
                        parts.push({
                            inline_data: {
                                mime_type: 'image/jpeg',
                                data: base64Data
                            }
                        });
                    }
                }
            }

            const promptText = `Ти помічник з вирішення тестових завдань. 
Ось текст сторінки тесту:
${clone.innerText}

ІНСТРУКЦІЯ:
1. Проаналізуй наданий текст та зображення (якщо є).
2. Визнач, чи питання має ОДНУ правильну відповідь, чи КІЛЬКА.
3. Якщо відповідь ОДНА — напиши СТРОГО ТІЛЬКИ її текст.
4. Якщо відповідей КІЛЬКА — напиши текст КОЖНОЇ правильної відповіді, розділяючи їх символом "|" (наприклад: Перша відповідь | Друга відповідь).
5. ЗАБОРОНЕНО писати будь-які пояснення, вводні слова або крапку наприкінці. Напиши ТІЛЬКИ варіант(и).`;

            parts.push({ text: promptText });

            answerBox.textContent = '⏳ Gemini аналізує...';

            GM_xmlhttpRequest({
                method: 'POST',
                url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify({ contents: [{ parts: parts }] }),
                onload: function(response) {
                    if (response.status === 429) {
                        answerBox.textContent = 'Ліміт ключа перевищено (429)';
                        return;
                    }
                    if (response.status !== 200) {
                        answerBox.textContent = `Помилка API (${response.status})`;
                        return;
                    }

                    try {
                        const res = JSON.parse(response.responseText);
                        const aiResult = res.candidates[0].content.parts[0].text.trim();

                        answerBox.innerHTML = `Відповідь: <b style="color:#ff5e36">${aiResult}</b>`;
                        navigator.clipboard.writeText(aiResult).catch(err => console.error(err));

                        const isHighlighted = highlightAnswersOnPage(aiResult);
                        if (!isHighlighted) {
                            answerBox.innerHTML += `<br><span style="color:#6c727f; font-size:10px;">(Елементи не знайдено)</span>`;
                        }
                    } catch (e) {
                        answerBox.textContent = 'Помилка обробки';
                    }
                },
                onerror: function() {
                    answerBox.textContent = 'Помилка мережі';
                }
            });
        });
    });
})();
