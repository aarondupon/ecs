import POINTERS_TO_ELEMENTS from '../POINTERS_TO_ELEMENTS';
import FpsController from '../FpsController';

const state  = {
    bufferCount: 0,
    pointers: POINTERS_TO_ELEMENTS(),
    results: [],
    fpsController: new FpsController(),
    time: Date.now(),
  };

const createState = () => Object.create(state);
export default createState;