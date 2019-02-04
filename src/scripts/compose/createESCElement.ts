import compose from './compose';
const createElement = (...behaviors) => (props?) => {
  const behaviorDiscription = compose(...behaviors)(props);
  const comp = Object.assign({uid:Date.now()}, behaviorDiscription);
  return comp;
};

export default createElement;
