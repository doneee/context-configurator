import objectPath from 'object-path';
// import arrayIncludes from 'array-includes';

import Context from './interfaces/Context';
import Condition from './interfaces/Condition';

import { CompareOperator } from './enums';

export function testCondition(condition: Condition, values: Context) {
  const { operator = CompareOperator.EQUALS, key, test } = condition;
  const value = objectPath.get(values, key);

  switch (operator.toLowerCase()) {
    case CompareOperator.LESSTHAN: {
      return (typeof test === 'number') && (typeof value === 'number') && (value < test);
    }

    case CompareOperator.GREATERTHAN: {
      return (typeof test === 'number') && (typeof value === 'number') && (value > test);
    }

    case CompareOperator.NOTEQUALS: {
      return test !== value;
    }

    case CompareOperator.IN: {
      if (Array.isArray(test)) {
        return test.indexOf(value) >= 0;
        // return arrayIncludes(test, value);
      }
      return String(value).indexOf(String(test)) >= 0;
    }

    case CompareOperator.NOTIN: {
      if (Array.isArray(test)) {
        //return !arrayIncludes(test, value);
        return test.indexOf(value) < 0
      }
      return String(value).indexOf(String(test)) < 0;
    }

    case CompareOperator.REGEX: {
      const regexOptions = Array.isArray(test) ? test : [test, 'gi'];
      const [ exp, modifiers ] = regexOptions;
      return !!String(value).match(new RegExp(String(exp), String(modifiers)));
    }

    case CompareOperator.STARTSWITH: {
      return String(value).slice(0, String(test).length) === String(test);
    }

    case CompareOperator.ENDSWITH: {
      return String(value).slice(0 - String(test).length) === String(test);
    }

    case CompareOperator.UNDEFINED: {
      return value === undefined;
    }

    case CompareOperator.NOTUNDEFINED: {
      return value !== undefined;
    }

    case CompareOperator.AND:
    case CompareOperator.OR:
    case CompareOperator.XOR: {
      return testConditions(test as Condition[], values, condition.operator as CompareOperator);
    }
    case CompareOperator.EQUALS:
    default: {
      return test === value;
    }
  }
}

export default function testConditions(
  conditions: Condition[],
  values: Context,
  operator = CompareOperator.AND,
) {
  if (!Array.isArray(conditions)) return testCondition(conditions, values);
  if (conditions.length === 0) return true;

  switch (operator) {
    case CompareOperator.AND:
      return conditions.every(condition => testCondition(condition, values));

    case CompareOperator.OR:
      return conditions.some(condition => testCondition(condition, values));

    case CompareOperator.XOR: {
      const res = conditions.map(condition => testCondition(condition, values));
      if (res.length !== 2) return false;
      return res[0] !== res[1];
    }

    default:
      return false;
  }
}
