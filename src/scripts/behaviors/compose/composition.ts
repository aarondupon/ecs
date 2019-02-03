let CONTAINTER_UID = 0;

declare interface IGLContainer{
  type:string;
  name?: string;
  getId: any;
  add:any;
  remove: any;
  getParent: any;
  setParent: any;
  getChild: any;
  uid: any;
}

declare interface IState{
  children:Map<number, IGLContainer>;
  uid:number;
  parent?:IGLContainer;

}

class Children extends Map<number, IGLContainer>{}

function getuid() {
  return ++ CONTAINTER_UID;
}

function createChildren() {
  return new Children();
}

const composition = (config?:object) => (metods?:object) => {

  const state:IState = {
    children:createChildren(),
    uid:getuid(),
  };
  function getId(): number {
    return state.uid;
  }

  function  add(child: IGLContainer): number {

    const id = state.children.size;
    console.log('state.children.size;', state.children.size);
    state.children.set(id, child);
    return id;
  }

  function remove(child: IGLContainer): IGLContainer {
    this.children &&  state.children.delete(child.getId());
    return this;
  }

  function setParent(parent: IGLContainer) {
    state.parent = parent;
  }

// Returns null if node is an orphan
  function getParent(): IGLContainer | null {
    return state.parent;
  }

// Returns null if the id isn't present
  function getChild(id: number): IGLContainer | null {
    return state.children.get(id) || null;
  }
  const comp  = {
    ...metods,
    children: { value: state.children, writable: false },
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
