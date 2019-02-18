
import { connect } from './utils';
import { default as createState } from './state';
import FpsController from './FpsController';
import { info } from './message';
import { merge, Observable, Subject, Subscription, PartialObserver, AsyncSubject, ReplaySubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { task } from '../../behaviors/ecs/geomBehavior';




declare interface BehaviorName  extends String{

}

interface ObservableMap<K, V> {
  clear(): void;
  delete(key: K): boolean;
  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
  get(key: K): V | undefined;
  has(key: K): boolean;
  set(key: K, value: V): Map<any, any>;
  readonly size: number;
  subscribe: (observer?, error?, complete?) => Subscription;
  unsubscribe:  () => void;
  subject:ReplaySubject<any>;
}

const SYSTEM_TABLES = new Map<string, ObservableMap<string, any>>();

const STRIP_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
  const fnStr = func.toString().replace(STRIP_COMMENTS, '');
  let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if (result === null) {
    result = [];
  }
  return result;
}

function runTask(behaviorData, element, task, complete, context) {

  task(behaviorData, element,complete, context);
}

let UID = 0;

// export function createTable(name:string):Map<string, any> {
//   if (SYSTEM_TABLES.get(name)) {
//     console.error(`table ${name} already exists, check behavior`);
//   }
//   const table = new Map();
//   SYSTEM_TABLES.set(name, table);
//   return table;
// }

export function createTable(name:string):ObservableMap<string, any> {
  if (SYSTEM_TABLES.get(name)) {
    console.error(`table ${name} already exists, check behavior`);
  }

  const table = new Map();
  const table$ = new ReplaySubject(0);
  table$[name] = name;
  const observableMap:ObservableMap<string, any> = {
    clear: () => table.clear(),
    delete: (key) => table.delete(key),
    forEach:(callbackfn) => table.forEach(callbackfn),
    get:(key) => table.get(key),
    has:(key) => table.has(key),
    set:(key, value) => {
      const res =  table.set(key, value);
      table$.next({ key, value });
      return  res;
    },
    get size() {
      return table.size;
    },
    get subject():any {
      return table$;
    },
    subscribe:(observer, error, complete):Subscription => {

      return table$.subscribe(observer, error, complete);
    },
    unsubscribe:() => table$.unsubscribe(),
  };
  SYSTEM_TABLES.set(name, observableMap);
  return observableMap;
}

// export function getComponent(uid, ...names:string[]):Object {
//   return names.reduce((group, name, index) => {
//     const table = SYSTEM_TABLES.get(name);
//     const data = table.get(uid);
//     Object.assign(group, { [name]:data });
//     return group;
//   },                  {});
// }

declare interface IGroup{
  data:Object;
  subscribe: (observer?, error?, complete?) => Subscription;
  onTask: (observer?, error?, complete?) => Subscription;
}
declare interface IComponent{
  uid:string;
}

function convertMapToComponentData(data) {
  const { key, value } = data;
  return {
    uid:key,
    ...value,
  };
}


// export function getComponent(behaviorName:string, uid:string):IGroup {
//   const table = getTable(behaviorName);
//   const tasksTable = getTaskTable(behaviorName);
//   const oldData = table.get(uid);
//   const newData = tasksTable.get(uid);
//   const mergeData:Observable<{}> =
//     merge<ObservableMap<string, any>, IComponent>(table.subject, tasksTable.subject)
//     .pipe(
//       map(convertMapToComponentData),
//       filter((component:IComponent) => component.uid === uid),
//       );

//   return {
//     data:{ ...oldData, ...newData },
//     subscribe:(observer, error, complete) => mergeData.subscribe(observer, error, complete),
//     onTask:(observer, error, complete) => 
//       tasksTable.subject.pipe(map(convertMapToComponentData)).subscribe(observer, error, complete),
//   };
// }


export function getComponent(behaviorName:string):any {
  const table = getTable(behaviorName) || createTable(behaviorName);
  const tasksTable = getTaskTable(behaviorName) || createTable(`${behaviorName}.task`);;

  return (uid?:string):IGroup  => {
    const oldData = table.get(uid);
    const newData = tasksTable.get(uid);
    const mergeData:Observable<{}> =
      merge<ObservableMap<string, any>, IComponent>(table.subject, tasksTable.subject)
      .pipe(
        map(convertMapToComponentData),
        filter((component:IComponent) => component.uid === uid),
        );
  
    return {
      data:newData,//{ ...oldData, ...newData },
      subscribe:(observer, error, complete) => mergeData.subscribe(observer, error, complete),
      onTask:(observer, error, complete) =>
        tasksTable.subject
        .pipe(map(convertMapToComponentData))
        .subscribe(observer, error, complete),
    };
  }
}

export function getTable(name:string):ObservableMap<string, any> {
  return SYSTEM_TABLES.get(name);
}
export function getTaskTable(name:string):ObservableMap<string, any> {
  return SYSTEM_TABLES.get(`${name}.task`);
}

function createSytstem(
    context, 
    update,
    task?, 
    name?,
    table?:ObservableMap<string, any>,
    tasksTable?:ObservableMap<string, any>) {

  const state  = createState();
  const fpsController = new FpsController();
  const GLOBAL_ELEMENTS_TABLE =
    getTable('GLOBAL_ELEMENTS_TABLE') || createTable('GLOBAL_ELEMENTS_TABLE');

  function handleTaskComplete(element, data, oldData) {
    const {uid} = element;
    tasksTable.set(uid, data);
    // table.delete(uid);

  }
  function handleTaskError(element, error) {
    const {uid} = element;
    console.error(`TASK: elemnt ${uid} could not complete task`, error);
  }
  function setPool(elements) {
    state.POINTERS_TO_ELEMENTS.table = elements;
  }
  function start(element) { // register
   
    // add element to global element table;
    GLOBAL_ELEMENTS_TABLE.set(element.uid,element);

    const behaviorData = table.get(element.uid);

    const complete = (element) => (data) => handleTaskComplete(element, data, behaviorData);

    const error = (element) => (error) => handleTaskError(element, error);

    info(`${name}: el. ${element.uid} registered, update started`);

    if (task) {
      runTask(behaviorData, element, task, complete(element), context);
      info(`${name}: el. ${element.uid} will start a taks`);
      return element;
    }

    // debugger
    // tasksTable.set(uid,behaviorData);
    // table.delete(uid);
    return element;
  }

  function deleteByUid(uid:string) {
    tasksTable.delete(uid);
    table.delete(uid);    
  }
  function add(index) {

    // runTask(index,data,task)
    // ESCFontLoaderSystem

    console.log('add:', name, state.bufferCount);

    state.bufferCount += 1;
    state.POINTERS_TO_ELEMENTS.add(index);

    const data =  state.POINTERS_TO_ELEMENTS.get(index);

  }
  function remove(ptr) {
    state.bufferCount -= 1;
    state.POINTERS_TO_ELEMENTS.remove(ptr);
  }

  function render(gl, updateTime, camera) {

    if (task) {

      tasksTable.forEach((data, uid) => {
        const element =  GLOBAL_ELEMENTS_TABLE.get(uid);
        update(gl, data, camera,element);
        // deleteByUid(element.uid)
      });

      return tasksTable.size;
    }

    if (table && !task) {
      table.forEach((data, uid) => {
        const element =  GLOBAL_ELEMENTS_TABLE.get(uid);
        if(element){
          update(gl, data, camera,element);
          // deleteByUid(element.uid);
         
        }
      });
    }

    // TODO REMOVE OLD CODE !
    for (let i = 0; i < state.bufferCount; i += 1) {

      const data =  state.POINTERS_TO_ELEMENTS.get(i);
      // update(gl, data, camera, data.uid);
      return i;
    }

  }
  UID += 1;
  
  return ({
    add,
    start,
    delete:deleteByUid,
    remove,
    setPool,
    render,
    time:state.time,
    name:`${name}`,
    id:`${name}`,
    // id:`sytestem_${name}__${UID}`,
  });

}

export default createSytstem;