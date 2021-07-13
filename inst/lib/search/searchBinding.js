const searchBinding = new Shiny.InputBinding();

$.extend(searchBinding, {
  find(scope) {
    return $(scope).find('.input-autosuggest');
  },
  initialize(el) {
    const data = el.dataset.top;
    const { placeholder } = el.dataset;
    // eslint-disable-next-line no-new
    new Autosuggest(el, JSON.parse(data), placeholder);
  },
  getValue(el) {
    const input = el.querySelector('input');
    document.querySelector('.results-list').innerHTML = '';
    return input.value;
  },
  subscribe(el, callback) {
    el.addEventListener('keyup', (event) => {
      if (event.keyCode === 13) {
        callback();
      }
    });

    el.addEventListener('click', (event) => {
      const { target } = event;
      if (!target.matches('.results-item')) {
        return;
      }
      el.querySelector('input').value = target.textContent;
      callback();
    });
  },

});

Shiny.inputBindings.register(searchBinding);
