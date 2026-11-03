export function createRouteComposition(routes, renderComponent) {
  return {
    routes,
    render(route, context = {}) {
      const page = routes[route] || routes['/'];
      if (!page) throw new Error('No route composition found for ' + route);
      return (page.components || []).map((component) => renderComponent(component.id || component.component, component.props || {}, context)).join('');
    },
  };
}
