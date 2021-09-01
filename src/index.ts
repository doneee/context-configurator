import testConditions from './testConditions';
import mergeReducer from './mergeReducer';
import evaluateFn from './evaluateFn';

import Rule from './interfaces/Rule';
import Context from './interfaces/Context';

import {Property} from './types/Property';
import {ContextProvider} from './types/ContextProvider';

/**
 * Validates rules by checking that they actually have actions, sets a default priority of 5, and
 * sorts the rules based on their priority
 */
export function sortRules(rules:Rule[] = []) {
  return rules
    .map(rule => (rule.priority ? rule : { ...rule, priority: 5 }))
    .sort((a, b) => a.priority - b.priority);
}

/**
 * A general configuration manager for handling version independent rules and settings
 */
class Configurator {
  _rules: Rule[];

  _contextProvider: ContextProvider;

  _defaultProps: object;

  constructor(
    rules: Rule[] = [],
    contextProvider: ContextProvider,
    defaultProps: Context = {},
  ) {
    if (this instanceof Configurator !== true) throw new Error('Configurator must be instantiated');
    this.updateRules = this.updateRules.bind(this);
    this.updateContextProvider = this.updateContextProvider.bind(this);
    this.getConfiguration = this.getConfiguration.bind(this);
    // this.getConfigurationAsync = this.getConfigurationAsync.bind(this);

    this._rules = sortRules(rules);
    this._contextProvider = contextProvider;
    this._defaultProps = defaultProps;
  }

  /**
   * Replaces the existing configuration with a new one
   */
  updateRules(configuration: Rule[]) {
    this._rules = sortRules(configuration);
  }

  /**
    *Update the meta values used to generate a configuration
   */
  updateContextProvider(contextProvider: ContextProvider) {
    this._contextProvider = contextProvider;
  }

  get context() {
    return this._contextProvider();
  }

  /**
   * Updates the configuration in the Configurator instance
   */
  getConfiguration(
    { target = null, defaults = {}, contextOverride = {} }:
      { target?: string | null, defaults?: Context, contextOverride?: Context } = {}):
      {[key: string]: Property}
    {
    let merge: Property = { ...this._defaultProps, ...defaults };

    const combinedContext = {
      ...evaluateFn(this.context),
      ...evaluateFn(contextOverride),
    };

    const matchingRules = this._rules
      .filter((rule) => {
        if (rule.target && rule.target !== target) return false;
        if (!rule.condition) return true;

        return testConditions(
          (!Array.isArray(rule.condition) ? [rule.condition] : rule.condition),
          combinedContext,
          rule.operator,
        );
      });

    matchingRules.forEach((rule) => {
      merge = mergeReducer(merge, rule.diff);
    });

    return merge;
  }

  // TODO: Make async version
  /*
  getConfigurationAsync(...props) {
    return Promise.resolve(this.getConfiguration(...props));
  }
  */
}

export default Configurator;
