const selectImageBinding = new Shiny.InputBinding();

function createDropdownSelector(el) {
  const select = document.createElement('div');
  const placeholder = document.createElement('div');
  const chevron = '<svg fill="none" width="16" height="16" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>';

  select.setAttribute('class', 'dropdown-select');
  placeholder.setAttribute('class', 'dropdown-placeholder');

  select.appendChild(placeholder);
  select.innerHTML += chevron;

  el.appendChild(select);
}

function updateAttrs(el, optionsData) {
  const elOptions = JSON.parse(el.dataset.options);
  const optionsDataStringified = JSON.stringify(optionsData);

  // Update data-options if needed
  if (!elOptions.length) {
    el.dataset.options = optionsDataStringified;
  } else if (el.dataset.options !== optionsDataStringified) {
    el.dataset.options = optionsDataStringified;
  }

  // Set data-selected attribute if missing
  if (!el.dataset.selected) {
    el.dataset.selected = optionsData.length ? optionsData[0].id : '';
  }
}

function getDropdownOptions(el, optionsData) {
  updateAttrs(el, optionsData);
  const placeholder = el.querySelector('.dropdown-placeholder');
  const options = optionsData.map((option) => {
    const li = el.querySelector(`#${option.id}`) || document.createElement('li');
    const image = li.querySelector('img') || document.createElement('img');
    const span = li.querySelector('span') || document.createElement('span');

    image.setAttribute('src', option.image);
    span.textContent = option.label;

    li.dataset.option = option.id;
    li.setAttribute('class', 'dropdown-option');
    li.setAttribute('id', option.id);

    if (option.image) li.appendChild(image);
    if (option.label) li.appendChild(span);

    if (el.dataset.selected && el.dataset.selected === option.id) {
      placeholder.innerHTML = li.innerHTML;
    }

    return li;
  });

  return options.filter((option) => option);
}

function createDropdownOptions(el, container) {
  let optionsData;
  try {
    optionsData = JSON.parse(el.dataset.options);
  } catch (error) {
    optionsData = [];
  }
  const optionsListContainer = document.createElement('ul');
  const optionsListItems = getDropdownOptions(el, optionsData);

  optionsListItems.forEach((option) => {
    optionsListContainer.appendChild(option);
  });

  optionsListContainer.setAttribute('class', 'dropdown-options');
  container.appendChild(optionsListContainer);
}

/*
 * Example
 * a = [{ number: 1 }, { number: 2 }, { number: 3 }]
 * b = [{ letter: 'a' }, { letter: 'b' }, { letter: 'c' }]
 * zip(a, b) = [{ number: 1, letter: 'a' }, { number: 2, letter: 'b' }, { number: 3, letter: 'c' }]
 */
function zip(a, b) {
  return a.map((item, index) => ({ ...item, ...b[index] }));
}

$.extend(selectImageBinding, {
  find(scope) {
    return $(scope).find('.dropdown');
  },
  initialize(el) {
    const container = document.createElement('div');
    container.setAttribute('class', 'dropdown-container');
    el.appendChild(container);

    createDropdownSelector(container);
    createDropdownOptions(el, container);
  },
  getValue(el) {
    return el.dataset.selected;
  },
  subscribe(el, callback) {
    const placeholder = el.querySelector('.dropdown-placeholder');

    el.addEventListener('click', function onClick(event) {
      const { target } = event;
      if (target === this) {
        return;
      }
      if (
        target.matches('.dropdown-option')
        || target.parentNode.matches('.dropdown-option')
      ) {
        const node = target.matches('.dropdown-option')
          ? target
          : target.parentNode;
        const html = node.innerHTML;
        placeholder.innerHTML = html;
        el.dataset.selected = node.dataset.option;
      }
      this.classList.toggle('opened');
      callback();
    });
  },
  receiveMessage(el, message) {
    const elData = JSON.parse(el.dataset.options);
    // Default data rendered in DOM
    let options = elData
      .map((item) => ({ id: item.id, label: item.label }))
      .filter((item) => item);
    let images = elData
      .map((item) => ({ image: item.image }))
      .filter((item) => item);

    if (message.selected) {
      const target = el.querySelector(`#${message.selected}`);
      $(target).trigger('click');
      el.classList.remove('opened');
    }
    if ('choices' in message) {
      // choices should be an array or an object
      if (Array.isArray(message.choices)) {
        options = message.choices.map((choice) => ({ id: choice, label: choice }));
      } else {
        // TODO: check if choices is an object
        options = Object.keys(message.choices)
          .map((key) => ({ id: message.choices[key], label: key }));
      }
    }
    // Images must be set, otherwise, what's the point
    if ('images' in message) {
      images = message.images.map((image) => ({ image }));
    }
    // merge options and images if the length of both is the same
    if (options.length) {
      const optionsData = zip(options, images);
      const optionsListItems = getDropdownOptions(el, optionsData);
      const optionsListContainer = el.querySelector('.dropdown-options');
      optionsListItems.forEach((option) => {
        optionsListContainer.appendChild(option);
      });
    }
  },
});

Shiny.inputBindings.register(selectImageBinding, 'shiny.selectImageInput');
