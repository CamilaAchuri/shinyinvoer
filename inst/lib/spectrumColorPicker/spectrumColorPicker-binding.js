const spectrumColorPickerBinding = new Shiny.InputBinding();
const SPECTRUM_DEFAULT_COLOR = '#ffffff';

const typedArray = new Uint32Array(1);
const createRandomIndex = () => crypto.getRandomValues(typedArray)[0];

const createInputColor = (color) => {
  const container = document.createElement('div');
  const input = document.createElement('input');
  const remove = document.createElement('button');

  container.classList.add('input-spectrum-container');
  input.classList.add('input-spectrum-color');
  remove.classList.add('input-spectrum-remove');

  input.setAttribute('type', 'text');
  input.setAttribute('value', color || SPECTRUM_DEFAULT_COLOR);
  input.setAttribute('id', `scp-${createRandomIndex()}`);

  container.appendChild(input);

  return { container, input, remove };
};

const getState = (attribute) => (el) => JSON.parse(el.dataset[attribute]);
const setState = (attribute) => (el, value) => {
  el.dataset[attribute] = JSON.stringify(value);
};

const getColorsState = getState('colors');
const getIdsState = getState('ids');
const getPaletteState = getState('palette');

const setIdsState = setState('ids');
const setPaletteState = setState('palette');

const removeInputColor = (el, container, input) => {
  const ids = getIdsState(el);
  const index = ids.findIndex((id) => id === input.id);
  ids.splice(index, 1);
  setIdsState(el, ids);
  container.remove();
  $(el).trigger('click'); // force update
};

const initAndUpdate = (el, color) => {
  const palette = getPaletteState(el);
  const ids = getIdsState(el);
  const { container, input, remove } = createInputColor(color || palette[0]);
  el.appendChild(container);
  ids.push(input.id);
  setIdsState(el, ids);
  // Init Spectrum lib
  const containerClassName = input.id;
  const showAlpha = el.getAttribute('alpha') === 'TRUE';
  const baseConfig = { showAlpha, containerClassName, preferredFormat: 'hex' };
  const config = palette && palette.length
    ? {
      ...baseConfig,
      showPalette: true,
      showPaletteOnly: true,
      hideAfterPaletteSelect: true,
      palette: [palette],
    }
    : { ...baseConfig, showInput: true, showInitial: true };
  $(input).spectrum(config);
  const spectrumContainer = document.querySelector(`.${containerClassName}`);
  const chooseButton = spectrumContainer.querySelector('button.sp-choose');
  const paletteRow = spectrumContainer.querySelector('.sp-palette-row');

  if (chooseButton) {
    chooseButton.parentElement.appendChild(remove);
  }
  if (paletteRow) {
    remove.classList.add('palette-only');
    spectrumContainer.appendChild(remove);
  }

  remove.addEventListener('click', () => {
    removeInputColor(el, container, input);
  });
};

const watchAddColorState = (el) => {
  let max = el.getAttribute('max-colors');
  if (Number.isNaN(max)) return;
  max = parseInt(max, 10);
  const children = el.children.length - 1;
  const button = el.querySelector('.input-spectrum-add-color');

  if (children >= max) button.setAttribute('disabled', 'true');
  else button.removeAttribute('disabled');
};

$.extend(spectrumColorPickerBinding, {
  find(scope) {
    return $(scope).find('.input-spectrum-color-picker');
  },
  initialize(el) {
    // Initialize ids state
    setIdsState(el, []);
    // Create and initialize color inputs
    const colors = getColorsState(el);
    colors.forEach((color) => initAndUpdate(el, color));
    // Create color input
    $(el)
      .find('.input-spectrum-add-color')
      .on('click', () => {
        initAndUpdate(el);
        $(el).trigger('click'); // force update
      });
    watchAddColorState(el);
    Sortable.create(el, {
      animation: 150,
      onEnd() {
        $(el).trigger('click');
      },
    });
  },
  getValue(el) {
    const inputs = el.querySelectorAll('.input-spectrum-color');
    return Array.prototype.map.call(inputs, (input) => input.value);
  },
  subscribe(el, callback) {
    $(el).on('click', () => {
      watchAddColorState(el);
      callback();
    });
    $(el).on('change', () => {
      watchAddColorState(el);
      callback();
    });
  },
  receiveMessage(el, message) {
    const existentInputs = Array.from(
      el.querySelectorAll('.input-spectrum-container'),
    );
    // Delete all existing inputs
    existentInputs.forEach((element) => element.remove());
    // Update state
    setIdsState(el, []);
    // Update palette
    setPaletteState(el, message.palette);
    // Add new colors
    message.colors.forEach((color) => initAndUpdate(el, color));
    $(el).trigger('click'); // force update
  },
});

Shiny.inputBindings.register(spectrumColorPickerBinding);
