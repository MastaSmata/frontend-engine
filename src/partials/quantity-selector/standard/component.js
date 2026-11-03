export function render({ template, props, context, helpers }) {
  return helpers.renderTemplate(template, [context, {
    label: props.label || 'Quantity',
    decreaseLabel: props.decreaseLabel || 'Decrease quantity',
    increaseLabel: props.increaseLabel || 'Increase quantity',
    initialValue: props.initialValue || 1,
    max: props.max,
  }]);
}

export function mount(root) {
  const input = root.querySelector('[data-product-quantity]');
  if (!input) return;
  root.querySelectorAll('[data-quantity-step]').forEach((button) => button.addEventListener('click', () => {
    const min = Number(input.min) || 1;
    const max = Number(input.max) || Infinity;
    const next = Math.max(min, Math.min(max, (Number(input.value) || min) + Number(button.dataset.quantityStep)));
    input.value = String(next);
    input.dispatchEvent(new Event('change', { bubbles:true }));
  }));
  input.addEventListener('change', () => {
    const min = Number(input.min) || 1;
    const max = Number(input.max) || Infinity;
    input.value = String(Math.max(min, Math.min(max, Math.floor(Number(input.value) || min))));
  });
}
