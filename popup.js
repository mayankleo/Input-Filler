document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('autofillForm');
    const fieldsContainer = document.getElementById('fieldsContainer');
    const status = document.getElementById('status');
    const addFieldBtn = document.getElementById('addFieldBtn');

    const toggle = document.getElementById('toggle-extension');

    chrome.storage.sync.get('enabled', (data) => {
        toggle.checked = data.enabled ?? true;
    });

    toggle.addEventListener('change', () => {
        chrome.storage.sync.set({ enabled: toggle.checked });
    });


    // Add a field block
    function addField(name = '', value = '', type = 'text') {
        const fieldDiv = document.createElement('div');
        fieldDiv.classList.add('dynamic-field');


        const inputCount = document.createElement('span');
        inputCount.textContent = fieldsContainer.children.length + 1
        inputCount.classList.add('input-count');



        const inputType = document.createElement('select');
        inputType.setAttribute("data-role", "type");
        inputType.innerHTML = `
        <option value="text">Text</option>
        <option value="email">Email</option>
        <option value="tel">Phone</option>
        <option value="number">Number</option>
        <option value="url">URL</option>
        <option value="date">Date</option>
      `;
        inputType.value = type;

        const inputName = document.createElement('input');
        inputName.setAttribute("data-role", "name");
        inputName.type = 'text';
        inputName.placeholder = 'Field Name';
        inputName.value = name;

        const inputValue = document.createElement('input');
        inputValue.setAttribute("data-role", "value");
        inputValue.type = type;
        inputValue.placeholder = 'Value';
        inputValue.value = value;


        const deleteFieldIcon = document.createElement('img');
        deleteFieldIcon.classList.add('delete-icon')
        deleteFieldIcon.src = 'delete.png';
        deleteFieldIcon.alt = 'Delete';
        deleteFieldIcon.addEventListener('click', () => {
            fieldsContainer.removeChild(fieldDiv);
        });

        inputType.addEventListener('change', () => {
            inputValue.type = inputType.value;
        });


        fieldDiv.appendChild(inputCount);
        fieldDiv.appendChild(inputType);
        fieldDiv.appendChild(inputName);
        fieldDiv.appendChild(inputValue);
        fieldDiv.appendChild(deleteFieldIcon);
        fieldsContainer.appendChild(fieldDiv);
    }

    // Load stored data on popup open
    chrome.storage.local.get('autofillData', ({ autofillData }) => {
        if (Array.isArray(autofillData)) {
            autofillData.forEach(({ type, name, value }) => {
                addField(name, value, type);
            });
        }
    });

    // Add new field on button click
    addFieldBtn.addEventListener('click', () => {
        addField();
    });

    // Save to chrome.storage on submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = [];
        const fieldDivs = document.querySelectorAll('.dynamic-field');
        fieldDivs.forEach(field => {
            const type = field.querySelector('[data-role="type"]').value.trim();
            const name = field.querySelector('[data-role="name"]').value.trim();
            const value = field.querySelector('[data-role="value"]').value.trim();
            if (type && name && value) {
                data.push({ type, name, value });
            }
        });
        chrome.storage.local.set({ autofillData: data }, () => {
            status.textContent = '✅ Saved!';
            setTimeout(() => status.textContent = '', 2000);
        });
    });
});