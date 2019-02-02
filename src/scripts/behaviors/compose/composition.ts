let CONTAINTER_UID = 0;
// const chidrenHook = new Map<number,Map<number,any>>();

declare interface IGLContainer{
  type:string;
  name?: string;
  getId: any;
  add:any;
  parent:any;
  remove: any;
  getParent: any;
  setParent: any;
  getChild: any;
  uid: any;
}

function getuid() {
  return ++ CONTAINTER_UID;
}

export function getId(): number {
  return this.uid;
}

class Children extends Map<number, IGLContainer>{}
export function createChildren() {
  return new Children();
}

// Expects the child to also be a GLNode
export function  add(child: IGLContainer): number {
  const id = this.children.size;
  console.log('this.children.size;', this.children.size);
  this.children.set(id, child);
  return id;
}

export function remove(child: IGLContainer): IGLContainer {
  this.children && this.children.delete(child.getId());
  return this;
}

export function setParent(parent: IGLContainer) {
  this.parent = parent;
}

  // Returns null if node is an orphan
export function getParent(): IGLContainer | null {
  return this.parent;
}

  // Returns null if the id isn't present
export function getChild(id: number): IGLContainer | null {
  return this.children.get(id) || null;
}

const composition = config => (metods?:object) => {
  const comp  = {
    ...metods,
    children: { value: createChildren(), writable: false },
    parent: { value: undefined, writable: true },
    type: { value: 'glContainer', writable: false },
    name: { value: name, writable: true },
    getId: { value: getId },
    add: { value: add },
    remove: { value: remove },
    getParent: { value: getParent },
    setParent: { value: setParent },
    getChild: { value: getChild },
    uid:  { value: `${getuid()}`, writable: false },
  };
  return comp;
};

export default composition;
