export function render({ template, props, context, helpers }) {
  const all = context.products || [];
  const products = (props.featuredOnly ? all.filter((product) => product.featured) : all).slice(0, props.limit || all.length);
  const cards = products.map((product) => helpers.renderComponent(props.cardComponent, product)).join('');
  return helpers.renderTemplate(template, [context, { ...props, cards }]);
}
