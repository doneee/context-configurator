import Condition from './Condition';
import { Property } from '../types/Property';
import { CompareOperator } from '../enums';


export default interface Rule {
  channel?: string;
  target?: string;
  priority?: number;
  condition?: Condition[];
  operator?: CompareOperator;
  diff: { [key: string]: Property };
}
