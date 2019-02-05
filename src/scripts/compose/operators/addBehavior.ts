const addBehavior = (...behaviors:Array<string>):any => (methods) => {
  const comp =  {
    ...methods,
    behaviors: [...(methods.behaviors || []), ...behaviors],
  };
  return comp;
};
export default addBehavior;
