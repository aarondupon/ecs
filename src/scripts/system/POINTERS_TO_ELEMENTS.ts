
export default function POINTERS_TO_ELEMENTS() {

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
        return pointers.push(pointer);
      },
      get: (index) => {
        const ptr = pointers[index];
        return TABEL.get(ptr);
      },
      getElement: (ptr) => {
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