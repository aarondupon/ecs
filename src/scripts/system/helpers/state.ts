import POINTERS_TO_ELEMENTS from './POINTERS_TO_ELEMENTS';

const createState = () => {
  const state  = {
    bufferCount: 0,
    POINTERS_TO_ELEMENTS: POINTERS_TO_ELEMENTS(),
    results: [],
    time: Date.now(),
  };
  return state;
};
export default createState;
