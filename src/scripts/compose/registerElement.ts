import  DrawSystem from '../system/DrawSystem';


interface IElements{
  [index: string]: any;
  [index: number]: any;
}


const elements:IElements = new Map();
DrawSystem.setPool(elements);

const registerElement = (element) => {
  // add to sytem
  const pointer = elements.size;
  elements.set(pointer, element);

  if (element.draw) {

    DrawSystem.add(pointer);
  }
  return element;
};

export default registerElement;
