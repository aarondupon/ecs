
import { connect } from './utils';
import { default as createState } from './state';
import FpsController from './FpsController';


let UID = 0;
function createSytstem(update, name = 'no-name') {
  const state  = createState();
  const fpsController = new FpsController();


  let update2 = ()=>{};

  function setPool(elements) {
    state.POINTERS_TO_ELEMENTS.table = elements;
  }

  function add(index) {
    console.log('add:',name,state.bufferCount)
    
    
    state.bufferCount += 1;
    state.POINTERS_TO_ELEMENTS.add(index);
  }
  function remove(ptr) {
    state.bufferCount -= 1;
    state.POINTERS_TO_ELEMENTS.remove(ptr);
  }

  function render(gl, updateTime, camera) {
   

    for (let i = 0; i < state.bufferCount; i += 1) {
      const data =  state.POINTERS_TO_ELEMENTS.get(i);
       update(gl, data, camera, data.uid);
    }

  }
  UID +=1;
  console.log('reacte',name)
  return ({
    add,
    remove,
    setPool,
    render,
    update2,
    time:state.time,
    id:`sytestem_${name}__${UID}`,
  });
  
  

}

export default createSytstem;
