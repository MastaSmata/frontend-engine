export function render({ template, props, context, helpers }) {
  const product = context.selectedProduct || {};
  const category = props.category || product.category || 'Collection';
  return helpers.renderTemplate(template, [context, {
    collectionHref: props.collectionHref || 'collection.html',
    collectionLabel: props.collectionLabel || 'Shop all',
    category,
    categoryHref: props.categoryHref || 'collection.html',
    title: props.title || product.title || product.name || 'Product',
    ariaLabel: props.ariaLabel || 'Breadcrumb',
  }]);
}
