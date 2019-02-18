
import { default as createSytstem, createTable, getTable } from './helpers/system';
// import {BEHAVIOR_TABLES} from './helpers/behavior';

import config from './config';
import { first } from 'rxjs/operators';
import { Context } from 'vm';
// import system from './DrawSystem';

let ready = false;
const load = true;
const elements:IElements = new Map();
const queue = [];

const jsUcfirst = (string) => string.charAt(0).toUpperCase() + string.slice(1);

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;

function getParamNames(func) {
  const fnStr = func.toString().replace(STRIP_COMMENTS, '');
  let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if (result === null) {
    result = [];
  }
  return result;
}

function getBehaviorNameFromFunction(func) {
  if (func) {
    const params = func.toString(); /// getParamNames(func);

    return params;
  }
  return undefined;
}

// export const ECSSystems = [];
// export const ECSBehaviors = [];
const ECS_RENDER_SYSTEMS = [];

let BEHAVIOR_NAMES = [];

const getBehaviorName  = (path) => {
  return path.match(/([^\/]+)(?=Behavior\.\w+$)/)[0];
};

const getSystemName = (filename) =>
`ESC${jsUcfirst(filename.replace('./', '').replace('.ts', '')).replace('Behavior', 'System')}`;
// @ts-ignore
const importBehaviors = require.context('../behaviors/ecs', true, /Behavior.ts$/);

function loadBehaviors(ECS_RENDER_SYSTEMS) {
  const { ECSSystems, ECSBehaviors, context } = ECS_RENDER_SYSTEMS;
  // const ECSBehaviors = [];
// require('../stories/index.stories');
  const origKeys = [... importBehaviors.keys()];
  const firstKeys = [];
  const lastKeys = [];
  BEHAVIOR_NAMES = importBehaviors.keys().map(getBehaviorName).join(',');

  config.first.forEach((origName) => {

    const name = origName.replace('Behavior', '');
    const res = origKeys.find(key => {
      const b = getBehaviorName(key);
      const check = b === name;
      return check;

    });
    if (res) {firstKeys.push(res);
      origKeys.splice(origKeys.indexOf(res), 1);
    }else {
      console.warn(`register.js: autoloader behavior spelling error
           [  ${name}   ] behavior is misspelt. file: config.ts:orde,
           please use one of ${origKeys.map(getBehaviorName).join(',')}`);
    }

  });

  config.last.forEach((origName) => {

    const name = origName.replace('Behavior', '');
    const res = origKeys.find(key => {
      const b = getBehaviorName(key);
      const check = b === name;
      return check;

    });
    if (res) {lastKeys.push(res);
      origKeys.splice(origKeys.indexOf(res), 1);
    }else {
      console.warn(`register.js: autoloader spelling error ${name}
           behavior is misspelt. file: config.ts:orde,
           please use one of ${origKeys.map(getBehaviorName).join(',')}`);
    }

  });

  const orderedKeys = [...firstKeys, ...origKeys, ...lastKeys];
  console.log('orderedKeys', orderedKeys);
//   importBehaviors.keys()
  orderedKeys.forEach((filename) => {
    if (filename) {

    // loads behavior
      const behaviorModule = importBehaviors(`${filename}`);
      const behaviorFuntionName = Object.keys(behaviorModule).find(key => {
        return /Behavior$/.test(key);
      });

    // creates behavior rule (checks if element has behavior short name)
    // example name is drawBehavior.js  --> short name is draw
    // iterates over behavior of current element array property
    // if has behavior add to array of behavior ESC sytstemm
      const rule =  (element) => (element.behaviors && element.behaviors.includes(getBehaviorName(filename)));
      const behavior = {
        update:behaviorModule.update,
        rule: behaviorModule.rule || rule,
        mName: behaviorModule.name || getSystemName(filename) ,
        task: behaviorModule.task,
        behaviorFuntionName,
        behaviorName: (behaviorFuntionName || '').replace('Behavior', ''),

      };

      ECSBehaviors.push(behavior);
      const name = getSystemName(filename);
      if (!window[name]) {
        window[name] = name;

        function update(gl, data, camera, element) {
          behavior.update(gl, data, camera, element);
        }

        // function task(gl, data, camera, uid) {
        //   console.log('behavior.task',behavior.mName,behavior.task)
        //   if(behavior.task) {

        //     behavior.task(gl, data, camera, uid);
        //   }
        // }

        // craete sytestem tabel

        const table = behavior.behaviorName !== ''
            ? (getTable(behavior.behaviorName) || createTable(behavior.behaviorName))
            : undefined;

        const tasktable = behavior.behaviorName !== ''
        ? (getTable(behavior.behaviorName + '.task') || createTable(behavior.behaviorName + '.task'))
        : undefined;

        // function taskWithContext (...args){

        //   behavior.task.call(this,...args,context)
        // }
        const ESCSystem = createSytstem(context, update,  behavior.task, name, table, tasktable);

        ESCSystem.setPool(elements);
        console.log('ESCSystem');
        ECSSystems.push(ESCSystem);
      }

      ready = true;

      if (queue && queue.length > 0) {
        let pointer = 0;

        while (queue.length > 0) {
          const element = queue.shift();
          addToSystem(element, pointer, origKeys, ECSSystems, ECSBehaviors);
          pointer ++;

        }

      }

      console.log('behavior loaded', filename, ECSSystems);
    }
  });

  return ECSSystems;
}

// if (load) loadBehaviors();
// load = false;

export const createRenderSystem = (context:Context) => {
  const ECSSystems = [];
  const ECSBehaviors = [];
  const system = { name:'main', context, ECSSystems, ECSBehaviors };
  ECS_RENDER_SYSTEMS.push(system);

  loadBehaviors(system);
  return ECSSystems;

};

interface IElements{
  [index: string]: any;
  [index: number]: any;
}

declare interface IElement{
  uid: string;
  behaviors:string[];
}

function removeFromAllSystem(element:IElement, behaviorNames= [], ECSSystems, ECSBehaviors) {
  element.behaviors.forEach(behaviorName => {
    const system =  ECSSystems.find(x => x.name === getSystemName(behaviorName + 'Behavior'));
    // if (behaviorName !== 'test2') {
      // console.log('removefrom', element.uid, system.name,system.size);
    system.delete(element.uid);
    console.log('removefrom', element.uid, system.name, system.size);
    // }

  });
}

function removeFromSystems(uid:string, behaviorNames= [], ECSSystems, ECSBehaviors) {
  behaviorNames.forEach(behaviorName => {
    const system =  ECSSystems.find(x => x.name === getSystemName(behaviorName + 'Behavior'));
    system.delete(uid);
    console.log('removefrom', uid, system.name, system.size);
  });
}

function removeFromSystem(element:IElement, behaviorName:string, ECSSystems) {
  const system =  ECSSystems.find(x => x.name === getSystemName(behaviorName + 'Behavior'));
  console.log('removefrom', element.uid, system.name, system.size);
  system.delete(element.uid);
}

export function registerOnce(element, target= 'main') {
  element.removeAfterUpdate = true;
  const registration = register(element, target= 'main');
  return registration;
}

const register = (element, target= 'main') => {
    // add to sytem
  const pointer = elements.size;
  const ECS_RENDER_SYSTEM = ECS_RENDER_SYSTEMS.find(x => x.name === target);
  element.target =  target;
  
  elements.set(pointer, element);
  if (ready) {
    if (ECS_RENDER_SYSTEM) {
      const { ECSSystems, ECSBehaviors } = ECS_RENDER_SYSTEM;
      addToSystem(element, pointer, BEHAVIOR_NAMES, ECSSystems, ECSBehaviors);
    }

  }
    // add to queue
  else {
    queue.push(element);
  }

  function unregister(behaviorNames= []) {

    if (ECS_RENDER_SYSTEM) {
      const { ECSSystems, ECSBehaviors } = ECS_RENDER_SYSTEM;
      removeFromAllSystem(element, BEHAVIOR_NAMES, ECSSystems, ECSBehaviors);
    }

  }

  function removeFromSystemByBehaviorName(behaviorName:string) {
    if (ECS_RENDER_SYSTEM) {
      const { ECSSystems, ECSBehaviors } = ECS_RENDER_SYSTEM;
      removeFromSystem(element, behaviorName, ECSSystems);
    }
  }

  element.unregister = unregister;

  return { element, unregister, removeFromSystemByBehaviorName };
};


export function unregister(uid:string,behaviorNames:string[],target:string='main') {
  const ECS_RENDER_SYSTEM = ECS_RENDER_SYSTEMS.find(x => x.name === target);
  if (ECS_RENDER_SYSTEM) {
    const { ECSSystems, ECSBehaviors } = ECS_RENDER_SYSTEM;
    removeFromSystems(uid, behaviorNames, ECSSystems, ECSBehaviors);
  }
}

/**
 *  MAIN FUNTCTION ADD TO SYSTEM INITATION
 * @param element
 * @param pointer
 * @param behaviorNames
 */
function addToSystem(element, pointer, behaviorNames= [], ECSSystems, ECSBehaviors) {
  let behaviorExist = false;
  ECSBehaviors.forEach((behavior, index) => {
    // TODO: remove old way
    if (behavior.rule && behavior.rule(element) && !behavior.behaviorName) {

      ECSSystems[index].add(pointer);
      behaviorExist = true;
    }

    // new way start
    if (behavior.rule && behavior.rule(element) && behavior.behaviorName) {
      ECSSystems[index].start(element);
      behaviorExist = true;
    }

  });

  if (!behaviorExist && element.behaviors) {
    console.error(`register.js: behavior ${name}  does not exist
    please create a ${name}Behavior.js file in .scripts/behaviors/ecs
    or select one of ${behaviorNames}`);
  }
  return behaviorExist;
}

export default register;
