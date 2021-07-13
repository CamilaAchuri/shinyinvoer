const toggleSwitchBinding = new Shiny.InputBinding();

$.extend(toggleSwitchBinding, {
  find(scope) {
    return $(scope).find('.switch-container');
  },
  getValue(el) {
    const input = el.querySelector('input');
    return input.value;
  },
  subscribe(el, callback) {
    el.addEventListener('change', () => {
      callback();
    });
  },
});

Shiny.inputBindings.register(toggleSwitchBinding);
