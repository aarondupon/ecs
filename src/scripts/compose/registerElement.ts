import  DrawSystem from '../system/DrawSystem';
import  ECSDrawSystem from '../system/ECSDrawSystem';
import  ECSTranslateSystem from '../system/ECSTranslateSystem';

interface IElements{
  [index: string]: any;
  [index: number]: any;
}

const elements:IElements = new Map();
DrawSystem.setPool(elements);
ECSDrawSystem.setPool(elements);
ECSTranslateSystem.setPool(elements);

const registerElement = (element) => {
  // add to sytem
  const pointer = elements.size;
  elements.set(pointer, element);

  if (typeof element.draw === 'function') {
    DrawSystem.add(pointer);
  }
  if (typeof element.draw === 'string' || element.draw instanceof String) {
    ECSDrawSystem.add(pointer);
  }

  if (typeof element.translate === 'string' || element.translate instanceof String) {
    ECSTranslateSystem.add(pointer);
  }
  return element;
};

export default registerElement;
