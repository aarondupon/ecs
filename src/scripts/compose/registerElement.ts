import register from '../system/register';

// TODO:
// REGISTRATION should by dynamic.
// add or removes eement from array if neeed (value change)
const registerElement = (element) => {
  element.registered = true;
  return register(element);
};
export default registerElement;
