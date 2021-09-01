import { Property } from './types/Property';

enum MergeMethod {
  MERGE = '+',
  DROP = '-',
  REPLACE = '=',
};

const allArrays = (...input: Property): Boolean => input.every(Array.isArray);

const allObjects = (...input: Property): Boolean =>
  input.every((item: Property) => typeof item === 'object');

/**
 * Manipulates plain objects and arrays using key prefixes
 */
export default function mergeReducer(
  prev: Property,
  next: Property,
  method: MergeMethod = MergeMethod.REPLACE,
) {
  const isArray = allArrays(prev, next);
  const isObject = allObjects(prev, next) && !isArray;

  if (!isArray && !isObject) return next;

  if (isArray) return arrayReducer(prev, next, method);

  const output = { ...prev };
  Object.keys(next).forEach((key) => {
    const [modifier = MergeMethod.MERGE, property] =
      (/^([+-]?)(.+)/g.exec(key).slice(1)) as [MergeMethod, string];

    switch (modifier) {
      case MergeMethod.MERGE: {
        output[property] = mergeReducer(prev[property], next[key], modifier);
        break;
      }

      case MergeMethod.DROP: {
        if (allArrays(prev[property], next[key])) {
          output[property] = mergeReducer(prev[property], next[key], modifier);
        } else {
          delete output[property];
        }
        break;
      }

      default: {
        output[property] = next[key];
      }
    }
  });
  return output;

}

function arrayReducer (
  prev: Property,
  next: Property,
  method: MergeMethod,
) {

  switch (method) {
    case MergeMethod.MERGE: {
      return [ ...prev as Property[], ...next as Property[] ];
    }

    case MergeMethod.DROP: {
      return (prev as Property[]).filter(item => !(next as Property[]).includes(item));
    }

    default: {
      return [ ...next ];
    }
  }
}

