/**
 * Checks to see if the input is a function, and executes and returns the results, if so. If input
 * is not a function, it will simply return the input
 */
export default (fn: Function | object, ...args: []) => {
  if (typeof fn !== 'function') {
    return fn;
  }

  return fn.apply(null, args);
}
