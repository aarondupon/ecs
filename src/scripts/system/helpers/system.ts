
import { connect } from './utils';
import { default as createState } from './state';
// import FpsController from './FpsController';
// fpsController: new FpsController(),

let UID = 0;
function createSytstem(update) {
  const state  = createState();

  function setPool(elements) {
    state.POINTERS_TO_ELEMENTS.table = elements;
  }

  function add(index) {
    state.bufferCount += 1;
    state.POINTERS_TO_ELEMENTS.add(index);
  }
  function remove(ptr) {
    state.bufferCount -= 1;
    state.POINTERS_TO_ELEMENTS.remove(ptr);
  }

  function render(gl, updateTime, camera) {
      // console.log('this',state)
    // if (fpsController.checkfps(1, 1)) {
    // console.log(UID, state.POINTERS_TO_ELEMENTS.pointers);
    for (let i = 0; i < state.bufferCount; i += 1) {
      const data =  state.POINTERS_TO_ELEMENTS.get(i);
      update(gl, data, camera, data.uid);
    }
    // }

  }

  return Object.freeze({
    add,
    remove,
    setPool,
    render,
    time:state.time,
    id:++UID,
  });

}

export default createSytstem;
