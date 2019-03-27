
import { default as createState } from './state';
import FpsController from './FpsController';
import { info } from './message';
import { merge, Observable, Subscription, ReplaySubject, combineLatest, Subject } from 'rxjs';
import { tap,take, scan, filter, map, debounceTime, throttleTime, bufferTime, takeWhile, bufferCount, distinct, distinctUntilKeyChanged } from 'rxjs/operators';

interface ObservableMap<K, V> {
  clear(): void;
  delete(key: K): boolean;
  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
  get(key: K): V | undefined;
  has(key: K): boolean;
  set(key: K, value: V): Map<any, any>;
  update(key: K, value: V): Map<any, any>;
  readonly size: number;
  subscribe: (observer?, error?, complete?) => Subscription;
  unsubscribe:  () => void;
  subject:ReplaySubject<any>;
}

export interface System{
  componentGroup:string[];
  add(index:number):void;
  delete(key:string): void;
  id:string;
  name:string;
  remove(ptr:string):void;
  render(gl:any, updateTime:number, camera:any):void;
  setPool(elements:any):void;
  start(element:object):object;
  time:number;
}

const SYSTEM_TABLES = new Map<string, ObservableMap<string, any>>();

// tslint:disable-next-line:max-line-length
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

  task(behaviorData, element, complete, context);
}

let UID = 0;

// function getComponentGroup(uid:string,groups:string[]){
//   return groups.reduce((group,componentName,idx)=>{
//       return {...group,...getTable(componentName).get(uid)}
//   },{})
// }

function getComponentGroupTables(groups:string[]):(uid:string) => {} {
  if (!groups) return;
  const tables =  groups.reduce((tables, componentName, idx) => {
    return [...tables, getTable(componentName)];
  },                            []);

  return (uid:string):any =>
     tables.reduce((values, table) => ({ ...values, ...table.get(uid) }), {});
}

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
    // TODO set and update should be the same function
    set:(key, value) => {
      const res =  table.set(key, value);
      // console.log('set:key',key)
      table$.next({ key, value });
      return  res;
    },
    update:(key, state) => {
      if(ArrayBuffer.isView(state) || Array.isArray(state)){
        const oldState = table.get(key);
        const value = state;
        const res =  table.set(key, value);
        table$.next({ key, value });
        return  res;
      }
      const oldState = table.get(key);
      const value = { ...oldState, ...state };
      const res =  table.set(key, value);
      table$.next({ key, value });
      return  res;
    },
    get size() {
      return table.size;
    },
    get subject():ReplaySubject<any> {
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

declare interface IGroup{
  data:Object;
  value:Object;
  subscribe: (observer?, error?, complete?) => Subscription;
  onTask: (observer?, error?, complete?) => Subscription;
}
declare interface IComponent{
  uid:string;
  value?:any;
}

function convertMapToComponentData(data) {
  const { key, value } = data;
  return {
    uid:key,
    ...value,
  };
}

export function getComponent(behaviorName:string):any {
  const table = getTable(behaviorName) || createTable(behaviorName);
  const tasksTable = getTaskTable(behaviorName) || createTable(`${behaviorName}.task`);

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
      data:newData, // { ...oldData, ...newData },
      value:{ ...oldData, ...newData },
      subscribe:(observer, error, complete) => mergeData.subscribe(observer, error, complete),
      onTask:(observer, error, complete) =>
        tasksTable.subject
        .pipe(map(convertMapToComponentData))
        .subscribe(observer, error, complete),
    };
  };
}

export function getComponentList(uid:string) {
  const list:object[] = [];
  if (SYSTEM_TABLES) {

    SYSTEM_TABLES.forEach((systemTable, key) => {
      const component = systemTable.get(uid);
      if (component) {
        list.push({ key, component });
      }
    });

  }
  return list;
}

export function getComponentNames(uid:string) {
  const list:string[] = [];
  if (SYSTEM_TABLES) {

    SYSTEM_TABLES.forEach((systemTable, key) => {
      const component = systemTable.get(uid);
      if (component) {
        list.push(key);
      }
    });
  }
  return list;
}

const GLOBAL_ELEMENTS_TABLE =
    getTable('GLOBAL_ELEMENTS_TABLE') || createTable('GLOBAL_ELEMENTS_TABLE');
export function getBehaviorNames(uid:string) {
  let behaviors = []
  if (GLOBAL_ELEMENTS_TABLE) {
      const element = GLOBAL_ELEMENTS_TABLE.get(uid);
      if (element) {
        behaviors = element.behaviors
      }
  }
  return behaviors
}
export function getComponentValue(name:string, prop:string):() => {} {
  return () => SYSTEM_TABLES.get(name)[prop];
}

export function getTable(name:string):ObservableMap<string, any> {
  return SYSTEM_TABLES.get(name);
}
export function getTaskTable(name:string):ObservableMap<string, any> {
  return SYSTEM_TABLES.get(`${name}.task`);
}


    
function createSytstem(
    context,
    camera,
    update?,
    task?,
    onUpdate?,
    onUpdateGroup?,
    componentGroup?,
    name?,
    table?:ObservableMap<string, any>,
    tasksTable?:ObservableMap<string, any>):System {

  const state  = createState();

  const getComponentGroup = getComponentGroupTables(componentGroup);

  const fpsController = new FpsController();
  // const GLOBAL_ELEMENTS_TABLE =
  //   getTable('GLOBAL_ELEMENTS_TABLE') || createTable('GLOBAL_ELEMENTS_TABLE');

 // reactive
  if (onUpdateGroup) {
    if (componentGroup) {
      info(`${name}: el. ${componentGroup.toString()} reactive stream onUpdateGroup will start`, 'blue');
    // table.subject

      const getComponentTable$ = (groups:string[]) => {
        return groups.reduce((tables, componentName, idx) => {
          
          const table = getTable(componentName);
          if(!table){
            throw `table error: ${componentName} component does not exist.
            componentGroup for ${name} can't be created`;
            return;
          }
          return [
            ...tables,
            table.subject.pipe(
            // filter(component => component.key === element.uid),
          ),
          ];
        },                   []);
      };
      const elements = [];
      const bufferFlush = new Subject()
      combineLatest(
      ...getComponentTable$(componentGroup),
      // TODO: chack why a.key is not correct
      (...components:any[]):any => (
        // uid:components[0].key,
        // element:GLOBAL_ELEMENTS_TABLE.get(components[0].key),
        components.reduce((obj,component,i)=>
        ({
          value:{
          ...obj.value,
          [componentGroup[i]]:component.value,
          },
          element: GLOBAL_ELEMENTS_TABLE.get(component.key),
          uid: component.key,
        }),{})
      ))
      .pipe(
        filter(groupEl => groupEl.element),
        // buffer based on count
        // tap(v=>console.log('before distinct:',v)),
        // distinctUntilKeyChanged('uid'),
        distinct(groupEl => { return groupEl.uid},bufferFlush),
        // tap(v=>console.log('after distinct:',v)),
        // bufferCount(10),
        // tap(v=> bufferFlush.next()),
        // tap(v=>console.log('after distinct:',v)),
        // buffer based on render tick
        bufferTime((1000 / 60)),
        tap(()=>bufferFlush.next()),
        // filter(val => val.length > 0),
       
        scan((buffers:any[], values:any[], index:number):any => {
         
          buffers[0] = values.map(group => group.value);
          buffers[1] = values.map(group => group.element);
          return buffers;
        },   []),
      )

      .subscribe(([values, elements]) => {
        
        
        // console.log('onUpdateGroup',values,elements)
        values.length > 0 && onUpdateGroup(context, values, camera, elements);
      });
    }
  }

  function handleTaskComplete(element, data, oldData) {
    const { uid } = element;
    tasksTable.set(uid, data);
    // table.delete(uid);
  }

  function handleTaskError(element, error) {
    const { uid } = element;
    console.error(`TASK: elemnt ${uid} could not complete task`, error);
  }
  function setPool(elements) {
    
    state.POINTERS_TO_ELEMENTS.table = elements;
  }
  function start(element) { // register

    // add element to global element table;
    GLOBAL_ELEMENTS_TABLE.set(element.uid, element);

    const behaviorData = table.get(element.uid);

    const complete = (element) => (data) => handleTaskComplete(element, data, behaviorData);

    const error = (element) => (error) => handleTaskError(element, error);

    // render loop
    if (update) info(`${name}: el. ${element.uid} registered, update started`);
    if (!task) {
      table.set(element.uid, behaviorData);
    }
    // run task once
    if (task) {
      runTask(behaviorData, element, task, complete(element), context);
      info(`${name}: el. ${element.uid} will start a taks`);
      return element;
    }

    // reactive
    if (onUpdate) {
      if (componentGroup) {
        info(`${name}: el. ${element.uid} reactive stream onUpdate will start`, 'yellow');
        // table.subject

        const getComponentTable$ = (groups:string[]) => {
          return groups.reduce((tables, componentName, idx) => {
            return [
              ...tables,
              getTable(componentName).subject.pipe(
                filter(component => component.key === element.uid),
              )];
          },                   []);
        };

        combineLatest(
          ...getComponentTable$(componentGroup),
          // TODO: chack why a.key is not correct
          (...components:any[]):any => 
            components.reduce((obj,component,i)=>
            ({...obj,[componentGroup[i]]:component.value}),{}),
        )
        .subscribe(value => {
            const component = onUpdate(context, value, camera, element);
            
            // TODO: USE RETURN value to update tables from selected groupedComponents
            // bug if update current input / if REACTIVE 
            Object.keys(component).forEach((componentName)=>{
              // debugger
              // console.log(componentName,'component:update',element.uid, component[componentName])
              getTable(componentName).update(element.uid, component[componentName])
            });
            // console.log('component:',componentGroup,component)
        });

       
    


        

        // combineLatest(
        //   ...getComponentTable$(componentGroup),
        //   (a:any, b:any):any => ({ ...b.value, ...a.value }))
        // .subscribe(value => {
        //   onUpdate(context, value, camera, element);
        // });
        return element;
      }

      info(`${name}: el. ${element.uid} reactive stream onUpdate will start`, 'blue');
      table.subject
      .pipe(filter(component => component.key === element.uid))
      .subscribe(({ value, key }) => {
        onUpdate(context, value, camera, element);
      });
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

    if (task && update) {

      tasksTable.forEach((data, uid) => {
        const element =  GLOBAL_ELEMENTS_TABLE.get(uid);
        update(gl, data, camera, element);
        // deleteByUid(element.uid)
      });

      return tasksTable.size;
    }

    if (table && !task && update) {

      // console.log('systemsystemsystem', table.size,componentGroup,name)
      table.forEach((data, uid) => {

        const element =  GLOBAL_ELEMENTS_TABLE.get(uid);

        if (element) {
          if (componentGroup) {
            return  update(gl, getComponentGroup(uid), camera, element);
          }
          return update(gl, data, camera, element);
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
    componentGroup,
    remove,
    setPool,
    render,
    start,
    delete:deleteByUid,
    time:state.time,
    name:`${name}`,
    id:`${name}`,
    // id:`sytestem_${name}__${UID}`,
  });

}

export default createSytstem;
