
import FpsController from './FpsController';
import POINTERS_TO_ELEMENTS from './POINTERS_TO_ELEMENTS';
import {update} from '../behaviors/ecs/translateBehavior';

function ECSTransformSystem() {

  let bufferCount = 0;
  const pointers = POINTERS_TO_ELEMENTS();
  const results = [];
  // const fpsController = new FpsController();
  let time = Date.now();

  function initialize(options) {

  }

  function setPool(elements) {
    pointers.table = elements;
  }

  function add(index) {
    bufferCount += 1;
    pointers.add(index);
  }
  function remove(ptr) {
    bufferCount -= 1;
    pointers.remove(ptr);
  }
  function read(ptr) {
    return results.slice(ptr, ptr + 1);
  }
  function render(gl, updateTime, camera) {
    time = updateTime;
    // if (fpsController.checkfps(1, 1)) {
    for (let i = 0; i < bufferCount; i += 1) {
      const data =  pointers.get(i);
      
      update(gl, data, camera, data.uid);
    }
    // }

  }

  return Object.create({
    add,
    remove,
    read,
    render,
    setPool,
    time,
  });
}

const transformwSystem = ECSTransformSystem();
export default transformwSystem;
