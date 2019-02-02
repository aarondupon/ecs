import compose from './compose';
// import register from './register';
const createElement = (...behaviors) => (props) => {
  const behaviorDiscription = compose(...behaviors)(props);
  return  Object.create({}, behaviorDiscription);
};

export default createElement;
