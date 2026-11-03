import { capabilityRegistry } from '../capabilities/registry.js';
import { componentCatalog } from './component-registry.js';

export const engineRegistry = {
  capabilities: capabilityRegistry,
  components: componentCatalog().filter((component) => component.type !== 'object'),
  objects: componentCatalog().filter((component) => component.type === 'object'),
  routes: 'site.json#routes',
};

export { capabilityRegistry, componentCatalog };
