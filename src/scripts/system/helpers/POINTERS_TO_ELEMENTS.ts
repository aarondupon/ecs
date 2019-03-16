
export default function POINTERS_TO_ELEMENTS(name) {
  const t = new Map();
  const p = [];
  return ({
    pointers: p,
    TABEL: t,
    set table(elements) {
      this.TABEL = elements;
    },
    get table() {
      return this.TABEL;
    },
    get size() {
      return this.pointers.length;
    },
    add(pointer) {
      if(this.pointers.find(x=>x===pointer)) {
        return this.pointers.find(x=>x===pointer);
      }

      return this.pointers.push(pointer);
    },
    get(index) {
      const ptr = this.pointers[index];
      return this.TABEL.get(ptr);
    },
    getElement(ptr) {
      return this.TABEL.get(ptr);
    },
    reset() {
      this.pointers = [];
    },
    remove(pointer) {
      const index = this.pointers.indexOf(pointer);
      if (index > -1) {
        this.pointers.splice(index, 1);
      }
    },
  });
}
