
import { connect } from '../utils';
import createState from './state';

function setPool(state, elements) {
  state.pointers.table = elements;
}

function add(state, index) {
  state.bufferCount += 1;
  state.pointers.add(index);
}
function remove(state, ptr) {
  state.bufferCount -= 1;
  state.pointers.remove(ptr);
}
function read(state, ptr) {
  return state.results.slice(ptr, ptr + 1);
}
function render(update, state, gl, updateTime, camera) {
  // if (fpsController.checkfps(1, 1)) {
  for (let i = 0; i < state.bufferCount; i += 1) {
    const data =  state.pointers.get(i);
    update(gl, data, camera, data.uid);
  }
  // }

}

function createSytstem(update) {
  const state  = createState();

  const methods = connect(state, {
    add,
    remove,
    read,
    // @ts-ignore
    render:(...args) => render(update, ...args),
    setPool,
  });
  methods.time = state.time;
  return Object.freeze(methods);
}

export default createSytstem;
