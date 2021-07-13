const colorPaletteInputBinding = new Shiny.InputBinding();

const typedArray = new Uint32Array(1);
const createRandomIndex = () => crypto.getRandomValues(typedArray)[0];

const getColorsState = (el) => JSON.parse(el.dataset.colors);

const setColorsState = (el, state) => {
  el.dataset.colors = JSON.stringify(state);
};

const handleInputColorChange = (event, el) => {
  const input = event.target;
  const index = parseInt(input.dataset.index, 10);
  // Get state
  const colors = getColorsState(el);
  const inputIndex = colors.findIndex((item) => item.id === Number(index));
  // Update state
  colors.splice(
    inputIndex,
    1,
    Object.assign(colors[inputIndex], { color: input.value }),
  );
  // Set state
  setColorsState(el, colors);
};

const removeColor = (event, el) => {
  const parent = event.target.parentNode;
  const input = parent.querySelector('input');
  const index = parseInt(input.dataset.index, 10);
  // Get state
  let colors = getColorsState(el);
  // Update/remove from state
  colors = colors.filter((color) => color.id !== index);
  // Set state
  setColorsState(el, colors);
  // Remove from DOM
  const div = event.target.parentNode;
  div.remove();
};

$.extend(colorPaletteInputBinding, {
  find(scope) {
    return $(scope).find('.input-color-palette');
  },
  initialize(el) {
    setColorsState(el, []);
    const self = this;
    $(el)
      .find('input')
      .each((index, input) => {
        const idx = createRandomIndex();
        // Save reference to idx in the element
        input.dataset.index = idx;
        // Get state
        const colors = getColorsState(el);
        // Update state
        colors.push({
          id: idx,
          color: input.value,
        });
        // Set state
        setColorsState(el, colors);
        // Bind event to input element
        $(input).on('change', (e) => handleInputColorChange.call(self, e, el));
      });

    // Bind event to add color button
    $(el)
      .find('#add-color')
      .click(function onClick() {
        const index = createRandomIndex();
        const div = document.createElement('div');
        div.setAttribute('class', 'input-color-container');

        // Create color picker
        const input = document.createElement('input');
        input.setAttribute('type', 'color');
        input.value = '#FFFFFF';
        input.dataset.index = index;

        // Bind event to new input
        $(input).on('change', (e) => handleInputColorChange.call(self, e, el));

        // create remove color button
        const button = document.createElement('button');
        button.textContent = 'x';
        button.addEventListener('click', (e) => removeColor.call(self, e, el));

        div.appendChild(input);
        div.appendChild(button);
        el.insertBefore(div, this);

        // Get state
        const colors = getColorsState(el);
        // Update state
        colors.push({
          id: index,
          color: input.value,
        });
        // Set state
        setColorsState(el, colors);
      });

    // Bind removeColor event to buttons inside .input-color-container divs
    $(el)
      .find('.input-color-container button')
      .each((index, button) => {
        button.addEventListener('click', (e) => removeColor.call(self, e, el));
      });
  },
  getValue(el) {
    return getColorsState(el).map((item) => item.color);
  },
  subscribe(el, callback) {
    // Bind events to parent container
    $(el).on('click', () => {
      callback();
    });
    $(el).on('change', () => {
      callback();
    });
  },
});

Shiny.inputBindings.register(colorPaletteInputBinding, 'shiny.colorPaletteInputBinding');
