import POINTERS_TO_ELEMENTS from './POINTERS_TO_ELEMENTS';

const createState = (name?) => {
  const state  = ({
    bufferCount: 0,
    POINTERS_TO_ELEMENTS: POINTERS_TO_ELEMENTS(name),
    results: [],
    time: Date.now(),
  });
  
  return state;
};
export default createState;
