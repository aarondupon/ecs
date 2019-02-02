
import FpsController from './FpsController';

function POINTERS_TO_ELEMENTS() {

  let pointers = [];
  let TABEL = new Map();
  return {
    set table(elements) {
      TABEL = elements;
    },
    get table() {
      return TABEL;
    },
    get size() {
      return pointers.length;
    },
    add:(pointer) => {
      pointers.push(pointer);
    },
    get: (index) => {
      const ptr = pointers[index];
      return TABEL.get(ptr);
    },
    reset:() => {
      pointers = [];
    },
    remove:(pointer) => {
      const index = pointers.indexOf(pointer);
      if (index > -1) {
        pointers.splice(index, 1);
      }
    },
  };
}

function DrawSystem() {
  const queue = [];
  let bufferCount = 0;
  const drawTrasks = [];
  const pointers = POINTERS_TO_ELEMENTS();
  const results = [];
  const fpsController = new FpsController();
  const unitSize = 0;
  const _pool = [];

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
  function update(time, camera) {

    if (fpsController.checkfps(60, 1)) {
      for (let i = 0; i < bufferCount; i += 1) {
        const drawElements =  pointers.get(i);
        drawElements.draw(camera);
      }
    }

  }

  return Object.create({
    add,
    remove,
    read,
    update,
    setPool,
  });
}

const drawSystem = DrawSystem();
export default drawSystem;
