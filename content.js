(function () {
  let currentPopup = null;

  document.addEventListener('focusin', async (event) => {
    const target = event.target;

    if (!target || target.tagName !== 'INPUT') return;

    let isEnabled = true;
    try {
      const result = await new Promise((resolve) => {
        chrome.storage.sync.get('enabled', (data) => resolve(data));
      });
      isEnabled = result?.enabled ?? true;
    } catch (e) {
      console.warn('Failed to get enabled flag:', e);
    }

    if (!isEnabled) return;

    const validTypes = ['text', 'email', 'tel', 'number', 'url', 'date'];
    if (!validTypes.includes(target.type)) return;

    try {
      let { autofillData } = await new Promise((resolve, reject) => {
        chrome.storage.local.get('autofillData', (result) => {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          else resolve(result);
        });
      });

      if (!autofillData) return;

      autofillData = sortByTypePriority(autofillData, target.type);

      if (currentPopup) currentPopup.remove();

      const popup = document.createElement('div');
      popup.classList.add('popup-container');
      popup.style.top = `${target.getBoundingClientRect().top + window.scrollY + target.offsetHeight}px`;
      popup.style.left = `${target.getBoundingClientRect().left + window.scrollX}px`;
      popup.style.minWidth = `${target.offsetWidth}px`;

      autofillData.forEach(({ value }) => {
        const btn = document.createElement('button');
        btn.classList.add('info-btn');
        btn.textContent = value;
        btn.addEventListener('mousedown', (e) => {
          e.preventDefault();
          target.value = value;
        });
        popup.appendChild(btn);
      });

      document.body.appendChild(popup);
      currentPopup = popup;

      const removePopup = () => {
        if (popup && popup.parentNode) {
          popup.remove();
          currentPopup = null;
        }
      };

      target.addEventListener('blur', () => setTimeout(removePopup, 200), { once: true });

    } catch (error) {
      console.error('Something Went Wrong!', error);
    }
  });

  function sortByTypePriority(arr, priorityType) {
    return arr.slice().sort((a, b) => {
      const aIsPriority = a.type === priorityType;
      const bIsPriority = b.type === priorityType;
      if (aIsPriority && !bIsPriority) return -1;
      if (!aIsPriority && bIsPriority) return 1;
      return 0;
    });
  }
})();
