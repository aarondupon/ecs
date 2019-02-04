// import  DrawSystem from '../system/DrawSystem';
// import  ECSDrawSystem from '../system/ECSDrawSystem';
// import  ECSTranslateSystem from '../system/ECSTranslateSystem';
// import  ECSCompositionSystem from '../system/ECSCompositionSystem';
// import register from '../system/register'
// interface IElements{
//   [index: string]: any;
//   [index: number]: any;
// }

// const elements:IElements = new Map();
// DrawSystem.setPool(elements);
// ECSDrawSystem.setPool(elements);
// ECSTranslateSystem.setPool(elements);
// ECSCompositionSystem.setPool(elements);

// const registerElement = (element) => {
//   // add to sytem
//   const pointer = elements.size;
//   elements.set(pointer, element);

//   if (typeof element.draw === 'function') {
//     DrawSystem.add(pointer);
//   }
//   if ((typeof element.draw === 'string' || element.draw instanceof String) && element.shaders) {
//     ECSDrawSystem.add(pointer);
//   }

//   if ((typeof element.translate === 'string' || element.translate instanceof String)
//       && element.shaders
//     ) {
//     ECSTranslateSystem.add(pointer);
//   }

//   if (typeof element.children || element.parent) {
//     ECSCompositionSystem.add(pointer);
//   }
//   return element;
// };

// export default registerElement;



import register from '../system/register';
const registerElement = (element) => {
  
  return register(element)
};
export default registerElement;
