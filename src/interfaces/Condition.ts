import { CompareOperator } from '../enums';

export default interface Condition {
  key?: string;
  test: string | number | boolean | null | string[] | Condition[];
  operator?: CompareOperator;
};
