const numberInputBinding = new Shiny.InputBinding();

$.extend(numberInputBinding, {
  find(scope) {
    return $(scope).find('.number-input');
  },
  initialize(el) {
    const input = el.querySelector('input');

    const stepDown = el.querySelector('#step-down');
    const stepUp = el.querySelector('#step-up');
    const step = Number(input.step);

    const min = input.min ? Number(input.min) : -Infinity;
    const max = input.max ? Number(input.max) : Infinity;

    const getValue = function setValue(_step) {
      const inputValue = Number(input.value);
      const value = inputValue + _step;
      if (value < min || value > max) {
        return inputValue;
      }
      return value;
    };

    stepDown.addEventListener('click', () => {
      const value = getValue(step * -1);
      input.value = value;
    });

    stepUp.addEventListener('click', () => {
      const value = getValue(step);
      input.value = value;
    });
  },
  getValue(el) {
    const input = el.querySelector('input');
    return parseFloat(input.value);
  },
  subscribe(el, callback) {
    const controls = el.querySelector('.number-input-controls');
    controls.addEventListener('click', () => {
      callback();
    });
    controls.addEventListener('change', () => {
      callback();
    });
    controls.addEventListener('input', () => {
      callback();
    });
  },
  receiveMessage(el, message) {
    const input = el.querySelector('input');
    const controls = el.querySelector('.number-input-controls');
    input.value = message.value;
    $(controls).trigger('click');
  },
});

Shiny.inputBindings.register(numberInputBinding);
