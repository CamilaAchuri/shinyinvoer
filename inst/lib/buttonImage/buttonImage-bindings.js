const buttonImageBinding = new Shiny.InputBinding();
// Si siempre hay un boton activo
let buttonClicked;

$.extend(buttonImageBinding, {
  find(scope) {
    return $(scope).find('.buttons-group');
  },
  getValue() {
    if (!buttonClicked) {
      buttonClicked = document.querySelector('.button-style.active-btn');
    }
    const id = buttonClicked.getAttribute('id');
    return id;
  },
  setValue(button) {
    buttonClicked = button;
    $(button).trigger('click');
  },
  subscribe(el, callback) {
    // Enlaza eventos al elemento que se creo
    $(el).on('click.buttonImageBinding', (event) => {
      const { target } = event;
      if (target.matches('button')) {
        buttonClicked.classList.remove('active-btn');
        buttonClicked = target;
        buttonClicked.classList.add('active-btn');
      } else if (target.matches('button img')) {
        buttonClicked.classList.remove('active-btn');
        buttonClicked = target.parentNode;
        buttonClicked.classList.add('active-btn');
      } else if (!target.matches('button') && !target.matches('button img')) {
        return;
      }
      callback();
    });
  },
  receiveMessage(el, data) {
    const currentlyActive = document.querySelector('.active-btn');

    if (data.active === currentlyActive.id) {
      return;
    }
    currentlyActive.classList.remove('active-btn');

    const updatedButton = el.querySelector(`#${data.active}`);
    updatedButton.classList.add('active_btn');
    // update reference
    this.setValue(updatedButton, data.active);
  },
});

Shiny.inputBindings.register(buttonImageBinding, 'shiny.buttonImageInput');
