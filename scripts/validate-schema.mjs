import { readFile } from 'node:fs/promises';

export async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function typeMatches(value, type) {
  if (type === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
  if (type === 'array') return Array.isArray(value);
  if (type === 'integer') return Number.isInteger(value);
  if (type === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (type === 'null') return value === null;
  return typeof value === type;
}

export function validate(value, schema, path = '$', errors = []) {
  if (schema.const !== undefined && value !== schema.const) errors.push(`${path} must equal ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.some((item) => Object.is(item, value))) errors.push(`${path} must be one of ${schema.enum.join(', ')}`);
  if (schema.type && !typeMatches(value, schema.type)) return errors.push(`${path} must be ${schema.type}`) && errors;
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${path} must contain at least ${schema.minLength} characters`);
    if (schema.pattern && !(new RegExp(schema.pattern).test(value))) errors.push(`${path} has an invalid format`);
  }
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${path} must be at least ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${path} must be at most ${schema.maximum}`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${path} must contain at least ${schema.minItems} items`);
    value.forEach((item, index) => validate(item, schema.items || {}, `${path}[${index}]`, errors));
  }
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    for (const key of schema.required || []) if (!(key in value)) errors.push(`${path}.${key} is required`);
    if (schema.minProperties !== undefined && Object.keys(value).length < schema.minProperties) errors.push(`${path} must contain at least ${schema.minProperties} properties`);
    const allowed = schema.properties ? new Set(Object.keys(schema.properties)) : null;
    if (schema.additionalProperties === false && allowed) {
      for (const key of Object.keys(value)) if (!allowed.has(key)) errors.push(`${path}.${key} is not allowed`);
    }
    for (const [key, child] of Object.entries(schema.properties || {})) {
      if (key in value) validate(value[key], child, `${path}.${key}`, errors);
    }
    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
      for (const [key, childValue] of Object.entries(value)) {
        if (!allowed?.has(key)) validate(childValue, schema.additionalProperties, `${path}.${key}`, errors);
      }
    }
  }
  return errors;
}

export function assertValid(value, schema, label) {
  const errors = validate(value, schema);
  if (errors.length) throw new Error(`${label} failed schema validation:\n- ${errors.join('\n- ')}`);
}
