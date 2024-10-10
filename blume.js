// ==UserScript==
// @name         Blume
// @version      1.5
// @namespace    Violentmonkey Scripts
// @author       cryptoprostor
// @match        https://telegram.blum.codes/*
// @grant        none
// @icon         https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65ba99c1616e21b24009b86c_blum-256.png
// @downloadURL  https://github.com/cryptoprostor/BLUM/raw/main/blume.js
// @updateURL    https://github.com/cryptoprostor/BLUM/raw/main/blume.js
// @homepage     https://github.com/cryptoprostor/BLUM
// ==/UserScript==

let GAME_SETTINGS = {
  minBombHits: Math.floor(Math.random() * 2),
  minIceHits: Math.floor(Math.random() * 2) + 2,
  flowerSkipPercentage: Math.floor(Math.random() * 11) + 15,
};

let isGamePaused = false;

try {
  let gameStats = {
      score: 0,
      bombHits: 0,
      iceHits: 0,
      flowersSkipped: 0,
      isGameOver: false,
  };

  const originalPush = Array.prototype.push;
  Array.prototype.push = function (...items) {
      if (!isGamePaused) {
          items.forEach(item => handleGameElement(item));
      }
      return originalPush.apply(this, items);
  };

  function handleGameElement(element) {
      if (!element || !element.item) return;

      const { type } = element.item;
      switch (type) {
          case "CLOVER":
              processFlower(element);
              break;
          case "BOMB":
              processBomb(element);
              break;
          case "FREEZE":
              processIce(element);
              break;
      }
  }

  function processFlower(element) {
      const shouldSkip = Math.random() < (GAME_SETTINGS.flowerSkipPercentage / 100);
      if (shouldSkip) {
          gameStats.flowersSkipped++;
      } else {
          gameStats.score++;
          clickElement(element);
      }
  }

  function processBomb(element) {
      if (gameStats.bombHits < GAME_SETTINGS.minBombHits) {
          gameStats.score = 0;
          clickElement(element);
          gameStats.bombHits++;
      }
  }

  function processIce(element) {
      if (gameStats.iceHits < GAME_SETTINGS.minIceHits) {
          clickElement(element);
          gameStats.iceHits++;
      }
  }

  function clickElement(element) {
      element.onClick(element);
      element.isExplosion = true;
      element.addedAt = performance.now();
  }

  function checkGameCompletion() {
      const rewardElement = document.querySelector('#app > div > div > div.content > div.reward');
      if (rewardElement && !gameStats.isGameOver) {
          gameStats.isGameOver = true;
          resetGameStats();
      }
  }

  function resetGameStats() {
      gameStats = {
          score: 0,
          bombHits: 0,
          iceHits: 0,
          flowersSkipped: 0,
          isGameOver: false,
      };
  }

  ///function getNewGameDelay() {
      ///return Math.floor(Math.random() * (GAME_SETTINGS.maxDelayMs - GAME_SETTINGS.minDelayMs + 1) + GAME_SETTINGS.minDelayMs);
  ///}

  function continuousPlayButtonCheck() {
      setTimeout(continuousPlayButtonCheck, 1000);
  }

  const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
          if (mutation.type === 'childList') {
              checkGameCompletion();
          }
      }
  });

  const appElement = document.querySelector('#app');
  if (appElement) {
      observer.observe(appElement, { childList: true, subtree: true });
  }

  continuousPlayButtonCheck();

  const settingsMenu = document.createElement('div');
  settingsMenu.className = 'settings-menu';
  settingsMenu.style.display = 'none';

  const menuTitle = document.createElement('h3');
  menuTitle.className = 'settings-title';
  menuTitle.textContent = 'Blum Click';

  const closeButton = document.createElement('button');
  closeButton.className = 'settings-close-button';
  closeButton.textContent = '×';
  closeButton.onclick = () => {
      settingsMenu.style.display = 'none';
  };

  menuTitle.appendChild(closeButton);
  settingsMenu.appendChild(menuTitle);

  function updateSettingsMenu() {
      document.getElementById('flowerSkipPercentage').value = GAME_SETTINGS.flowerSkipPercentage;
      document.getElementById('minIceHits').value = GAME_SETTINGS.minIceHits;
      document.getElementById('minBombHits').value = GAME_SETTINGS.minBombHits;
  }

  settingsMenu.appendChild(createSettingElement('Skip Stars(%)', 'flowerSkipPercentage', 'number', 0, 100, 1,
      'Вероятность пропуска звезд в процентах.'));
  settingsMenu.appendChild(createSettingElement('Freeze count', 'minIceHits', 'number', 0, 10, 1,
      'Кол-во кликов на заморозку.'));
  settingsMenu.appendChild(createSettingElement('Bomb count', 'minBombHits', 'number', 0, 10, 1,
      'Кол-во кликов на бомбу.'));

  const pauseResumeButton = document.createElement('button');
  pauseResumeButton.textContent = 'Pause';
  pauseResumeButton.className = 'pause-resume-btn';
  pauseResumeButton.onclick = toggleGamePause;
  settingsMenu.appendChild(pauseResumeButton);

  document.body.appendChild(settingsMenu);

  const style = document.createElement('style');
  style.textContent = `
    .settings-menu {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 4px;
      color: #333;
      font-family: 'Arial', sans-serif;
      z-index: 10000;
      padding: 15px;
      width: 280px;
      box-shadow: none;
    }
    .settings-title {
      color: #333;
      font-size: 16px;
      font-weight: normal;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .settings-close-button {
      background: none;
      border: none;
      color: #888;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
    }
    .setting-item {
      margin-bottom: 10px;
    }
    .setting-label {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
    }
    .setting-label-text {
      color: #555;
      margin-right: 5px;
      font-size: 14px;
    }
    .help-icon {
      cursor: help;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #888;
      color: #fff;
      font-size: 9px;
      font-weight: bold;
    }
    .setting-input {
      display: flex;
      align-items: center;
    }
    .setting-slider {
      flex-grow: 1;
      margin-right: 8px;
    }
    .setting-value {
      min-width: 30px;
      text-align: right;
      font-size: 12px;
      color: #333;
    }
    .tooltip {
      position: relative;
    }
    .tooltip .tooltiptext {
      visibility: hidden;
      width: 180px;
      background-color: #333;
      color: #fff;
      text-align: center;
      border-radius: 3px;
      padding: 5px;
      position: absolute;
      z-index: 1;
      bottom: 100%;
      left: 50%;
      margin-left: -90px;
      opacity: 0;
      transition: opacity 0.3s;
      font-size: 10px;
    }
    .tooltip:hover .tooltiptext {
      visibility: visible;
      opacity: 1;
    }
    .pause-resume-btn {
      display: block;
      width: 100%;
      padding: 10px;
      margin-top: 15px;
      background-color: #007bff;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: normal;
      font-size: 14px;
      transition: background-color 0.3s;
    }
    .pause-resume-btn:hover {
      background-color: #0056b3;
    }
    .settings-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #007bff;
      color: #fff;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 20px;
      cursor: pointer;
      z-index: 9999;
      box-shadow: none;
    }
  `;

  const settingsButton = document.createElement('button');
    settingsButton.className = 'settings-button';
    settingsButton.textContent = '📋';
    settingsButton.onclick = () => {
        settingsMenu.style.display = settingsMenu.style.display === 'block' ? 'none' : 'block';
    };
    document.body.appendChild(settingsButton);

    document.head.appendChild(style);

    function createSettingElement(label, id, type, min, max, step, tooltipText) {
        const container = document.createElement('div');
        container.className = 'setting-item';

        const labelContainer = document.createElement('div');
        labelContainer.className = 'setting-label';

        const labelElement = document.createElement('span');
        labelElement.className = 'setting-label-text';
        labelElement.textContent = label;

        const helpIcon = document.createElement('span');
        helpIcon.textContent = '?';
        helpIcon.className = 'help-icon tooltip';

        const tooltipSpan = document.createElement('span');
        tooltipSpan.className = 'tooltiptext';
        tooltipSpan.innerHTML = tooltipText;
        helpIcon.appendChild(tooltipSpan);

        labelContainer.appendChild(labelElement);
        labelContainer.appendChild(helpIcon);

        const inputContainer = document.createElement('div');
        inputContainer.className = 'setting-input';

        let input;
        if (type === 'checkbox') {
            input = document.createElement('input');
            input.type = 'checkbox';
            input.id = id;
            input.checked = GAME_SETTINGS[id];
            input.addEventListener('change', (e) => {
                GAME_SETTINGS[id] = e.target.checked;
                saveSettings();
            });
            inputContainer.appendChild(input);
        } else {
            input = document.createElement('input');
            input.type = type;
            input.id = id;
            input.min = min;
            input.max = max;
            input.step = step;
            input.value = GAME_SETTINGS[id];
            input.className = 'setting-input-box';

            input.addEventListener('input', (e) => {
                GAME_SETTINGS[id] = parseFloat(e.target.value);
                saveSettings();
            });

            inputContainer.appendChild(input);
        }

        container.appendChild(labelContainer);
        container.appendChild(inputContainer);
        return container;
    }

    function saveSettings() {
        localStorage.setItem('BlumAutoclickerSettings', JSON.stringify(GAME_SETTINGS));
    }

    function loadSettings() {
        const savedSettings = localStorage.getItem('BlumAutoclickerSettings');
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            GAME_SETTINGS = {
                ...GAME_SETTINGS,
                ...parsedSettings
            };
        }
    }

    loadSettings();
    updateSettingsMenu();

    function toggleGamePause() {
        isGamePaused = !isGamePaused;
        pauseResumeButton.textContent = isGamePaused ? 'Resume' : 'Pause';
        pauseResumeButton.style.backgroundColor = isGamePaused ? '#e5c07b' : '#98c379';
    }
} catch (e) {
    console.error("Blum Autoclicker error:", e);
}
