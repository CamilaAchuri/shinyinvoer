const outputStates = [];

function escapeSelector(s) {
  return s.replace(/([!"#$%&'()*+,-./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
}

function showSpinner(id) {
  const selector = `#${escapeSelector(id)}`;
  $(selector).siblings('.load-container, .shiny-spinner-placeholder').removeClass('shiny-spinner-hidden');
  $(selector).siblings('.load-container').siblings('.shiny-bound-output, .shiny-output-error').css('visibility', 'hidden');
}

function hideSpinner(id) {
  const selector = `#${escapeSelector(id)}`;
  $(selector).siblings('.load-container, .shiny-spinner-placeholder').addClass('shiny-spinner-hidden');
  $(selector).siblings('.load-container').siblings('.shiny-bound-output').css('visibility', 'visible');
}

function updateSpinner(id) {
  if (!(id in outputStates)) {
    showSpinner(id);
  }
  if (outputStates[id] <= 0) {
    showSpinner(id);
  } else {
    hideSpinner(id);
  }
}

$(document).on('shiny:bound', (event) => {
  const { id } = event.target;
  if (id === undefined || id === '') {
    return;
  }

  /* if not bound before, then set the value to 0 */
  if (!(id in outputStates)) {
    outputStates[id] = 0;
  }
  updateSpinner(id);
});

/* When recalculating starts, show the spinner container & hide the output */
$(document).on('shiny:outputinvalidated', (event) => {
  const { id } = event.target;
  if (id === undefined) {
    return;
  }
  outputStates[id] = 0;
  updateSpinner(id);
});

/* When new value or error comes in, hide spinner container (if any) & show the output */
$(document).on('shiny:value shiny:error', (event) => {
  const { id } = event.target;
  if (id === undefined) {
    return;
  }
  outputStates[id] = 1;
  updateSpinner(id);
});
