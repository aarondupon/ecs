import compose from './compose';
const createElement = (...behaviors) => (props = {}) => {
  const behaviorDiscription = compose(...behaviors)(props);
  const comp = Object.assign({uid:Date.now(),behaviors:['_system_']}, behaviorDiscription);
  return comp;
};

export default createElement;
