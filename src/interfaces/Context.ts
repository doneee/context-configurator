export default interface Context {
  [key: string]: string | number | boolean |  null | Context[] | Context;
}
