import compose from './compose';
const createElement = (...behaviors) => (props?) => {
  const behaviorDiscription = compose(...behaviors)(props);
  const comp = Object.assign({}, behaviorDiscription);
  return comp;
};

export default createElement;
