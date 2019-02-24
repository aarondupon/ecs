
import { default as createSytstem, createTable, getTable, System, getComponentNames } from './helpers/system';
import { jsUcfirst, getBehaviorName, getSystemName } from './helpers/utils';

import config from './config';
import systemConfig from '../systems/systemConfig';

interface IElements{
  [index: string]: any;
  [index: number]: any;
}



declare interface IElement{
  uid: string;
  behaviors:string[];
  target:string;
}

let ready = false;
const elements:IElements = new Map();
const queue = [];

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;

const ECS_RENDER_SYSTEMS = [];

let BEHAVIOR_NAMES = [];

// @ts-ignore
const importBehaviors = require.context('../behaviors/ecs', true, /Behavior.ts$/);

function loadBehaviors(ECS_RENDER_SYSTEMS) {
  const { ECS_SYSTEMS, ECS_BEHAVIORS, context, camera } = ECS_RENDER_SYSTEMS;
  // const ECS_BEHAVIORS = [];
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
    if (res) {
      firstKeys.push(res);
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
    if (res) {
      lastKeys.push(res);
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
      const rule =  (element) =>
        (element.behaviors && element.behaviors.includes(getBehaviorName(filename)));

      const behavior = {
        behaviorFuntionName,
        onUpdateGroup:behaviorModule.onUpdateGroup,
        update:behaviorModule.update, // renderloop
        onUpdate:behaviorModule.onUpdate, // reactive
        rule: behaviorModule.rule || rule,
        mName: behaviorModule.name || getSystemName(filename) ,
        task: behaviorModule.task,
        behaviorName: (behaviorFuntionName || '').replace('Behavior', ''),

      };

      ECS_BEHAVIORS.push(behavior);
      const name = getSystemName(filename);
      if (!window[name]) {
        window[name] = name;

        // function update(gl, data, camera, element) {
        //   behavior.update(gl, data, camera, element);
        // }

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

        const taskTableName = `${behavior.behaviorName}.task`;
        const tasktable = behavior.behaviorName !== ''
          ? (getTable(taskTableName) || createTable(taskTableName))
          : undefined;

        const ECS_SYSTEM = createSytstem(context, camera, behavior.update,  behavior.task, behavior.onUpdate, behavior.onUpdateGroup, undefined, name, table, tasktable);

        ECS_SYSTEM.setPool(elements);
        console.log('ESCSystem');
        ECS_SYSTEMS.push(ECS_SYSTEM);
      }

      ready = true;

      if (queue && queue.length > 0) {
        let pointer = 0;

        while (queue.length > 0) {
          const element = queue.shift();
          addToSystem(element, pointer, origKeys, ECS_SYSTEMS, ECS_BEHAVIORS);
          pointer ++;

        }

      }

      console.log('behavior loaded', filename, ECS_SYSTEMS);
    }
  });

  return ECS_SYSTEMS;
}

let SYSTEM_NAMES = [];
// @ts-ignore
const importSystems = require.context('../systems/ecs', true, /System.ts$/);

function loadSystems(ECS_RENDER_SYSTEMS) {
  const { ECS_SYSTEMS, context, camera } = ECS_RENDER_SYSTEMS;

  const origKeys = [... importSystems.keys()];
  const firstKeys = [];
  const lastKeys = [];
  SYSTEM_NAMES = importSystems.keys().map(getSystemName).join(',');

  // order sytstem: use cofig file
  systemConfig.first.forEach((origName) => {

    const name = getSystemName(origName);
    
    const res = origKeys.find(key => {
      const b = getSystemName(key);
      const check = b === name;
      return check;

    });
 
    if (res) {
      firstKeys.push(res);
      origKeys.splice(origKeys.indexOf(res), 1);
    }else {
      console.warn(`register.js: autoloader system spelling error
           [  ${name}   ] system is misspelt. file: config.ts:orde,
           please use one of ${origKeys.map(getSystemName).join(',')}`);
    }

  });

  systemConfig.last.forEach((origName) => {

  const name = origName.replace('Behavior', '');
  const res = origKeys.find(key => {
      const b = getBehaviorName(key);
      const check = b === name;
      return check;

    });
  if (res) {
    lastKeys.push(res);
    origKeys.splice(origKeys.indexOf(res), 1);
  }else {
    console.warn(`register.js: autoloader spelling error ${name}
           behavior is misspelt. file: config.ts:orde,
           please use one of ${origKeys.map(getBehaviorName).join(',')}`);
  }

  });

  const orderedKeys = [...firstKeys, ...origKeys, ...lastKeys];

  // add in order
  orderedKeys.forEach((filename) => {
    if (filename) {

    // loads behavior
      const systemModule = importSystems(`${filename}`);

    // creates behavior rule (checks if element has behavior short name)
    // example name is drawBehavior.js  --> short name is draw
    // iterates over behavior of current element array property
    // if has behavior add to array of behavior ESC sytstemm
      const rule =  (element) => {
        return  (element.behaviors && element.behaviors.includes(getBehaviorName(filename)));

      };

      if (!systemModule.getComponentGroup) {
        var e = new Error(`registration error: ${getSystemName(filename)}
        has now getComponentGroup function`);
        throw(e);
        return;
      }

      if (!systemModule.onUpdateGroup) {
        console.error(`registration error: ${getSystemName(filename)}
        has now onUpdateGroup function`);
      
      }

      const system = {
        update:systemModule.update, // renderloop
        onUpdateGroup:systemModule.onUpdateGroup,
        onUpdate:systemModule.onUpdate, // reactive
        componentGroup:systemModule.getComponentGroup(),
        rule: systemModule.rule || rule,
        mName: systemModule.name || getSystemName(filename) ,
        task: systemModule.task,
        name: getSystemName(filename)
                .replace('System', '')
                .replace('ESC', '') // TODO: change to ESC ! misspell !!
                .toLocaleLowerCase(),
      };

      const name = getSystemName(filename);
      if (!window[name]) {
        window[name] = name;

        const table = system.name !== ''
            ? (getTable(system.name) || createTable(system.name))
            : undefined;

        const taskTableName = `${system.name}.task`;
        const tasktable = system.name !== ''
          ? (getTable(taskTableName) || createTable(taskTableName))
          : undefined;

        const ECS_SYSTEM = createSytstem(context, camera, system.update,  system.task, system.onUpdate, system.onUpdateGroup, system.componentGroup, name, table, tasktable);

        ECS_SYSTEM.setPool(elements);
        console.log('ESCSystem');
        ECS_SYSTEMS.push(ECS_SYSTEM);
      }

      ready = true;

      if (queue && queue.length > 0) {
        let pointer = 0;

        while (queue.length > 0) {
          const element = queue.shift();
          // addToSystem(element, pointer, origKeys, ECS_SYSTEMS, ECS_BEHAVIORS);
          pointer ++;

        }

      }

      console.log('behavior loaded', filename, ECS_SYSTEMS);
    }
  });

  return ECS_SYSTEMS;
}

export const createRenderSystem = (context, camera) => {
  const ECS_SYSTEMS = [];
  const ECS_BEHAVIORS = [];
  const system = { context, camera, ECS_SYSTEMS, ECS_BEHAVIORS, name:'main' };
  ECS_RENDER_SYSTEMS.push(system);

  loadBehaviors(system);
  loadSystems(system);

  return ECS_SYSTEMS;

};

function removeFromSystems(uid:string, behaviorNames= [], ECS_SYSTEMS, ECS_BEHAVIORS) {
  behaviorNames.forEach(behaviorName => {
    const system =  ECS_SYSTEMS.find(x => x.name === getSystemName(`${behaviorName}Behavior`));
    system.delete(uid);
    console.log('removefrom', uid, system.name, system.size);
  });
}

const register = (element:IElement, target= 'main') => {
  element.behaviors = getComponentNames(element.uid);
    // add to sytem
  const pointer = elements.size;
  const ECS_RENDER_SYSTEM = ECS_RENDER_SYSTEMS.find(x => x.name === target);
  element.target =  target;

  elements.set(pointer, element);
  if (ready) {
    if (ECS_RENDER_SYSTEM) {
      const { ECS_SYSTEMS, ECS_BEHAVIORS } = ECS_RENDER_SYSTEM;
      addToSystem(element, pointer, BEHAVIOR_NAMES, ECS_SYSTEMS, ECS_BEHAVIORS);
    }

  } else { // add to queue
    queue.push(element);
  }

  function unregisterInternal(behaviorNames= []) {
    // const { ECS_SYSTEMS, ECS_BEHAVIORS } = ECS_RENDER_SYSTEM;
    unregister(element.uid, element.behaviors, element.target);
  }

  function removeFromSystemByBehaviorName(behaviorName:string) {
    if (ECS_RENDER_SYSTEM) {
      const { ECS_SYSTEMS, ECS_BEHAVIORS } = ECS_RENDER_SYSTEM;
      removeFromSystems(element.uid, [behaviorName], ECS_SYSTEMS, ECS_BEHAVIORS);
    }
  }

  return { element, unregister:unregisterInternal, deleteFrom:removeFromSystemByBehaviorName };
};

export function unregister(uid:string, behaviorNames:string[], target:string= 'main') {
  const ECS_RENDER_SYSTEM = ECS_RENDER_SYSTEMS.find(x => x.name === target);
  if (ECS_RENDER_SYSTEM) {
    const { ECS_SYSTEMS, ECS_BEHAVIORS } = ECS_RENDER_SYSTEM;
    removeFromSystems(uid, behaviorNames, ECS_SYSTEMS, ECS_BEHAVIORS);
  }
}

/**
 *  MAIN FUNTCTION ADD TO SYSTEM INITATION
 * @param element
 * @param pointer
 * @param behaviorNames
 */
function addToSystem(element:IElement, pointer, behaviorNames= [], ECS_SYSTEMS, ECS_BEHAVIORS) {
  let behaviorExist = false;

  // TODO Separate (TEMP HACK)
  // TEMP HACK !! not performant
  ECS_SYSTEMS.forEach((system:System, index:string) => {
    if (system.componentGroup && element && element.behaviors) {
      let include = false;
      system.componentGroup.forEach(component => {
        const res =  element.behaviors.includes(component);
        if (res) include = true;
      });

      if (include) {
        ECS_SYSTEMS[index].add(pointer);

        ECS_SYSTEMS[index].start(element);
      }

    }

  });

  ECS_BEHAVIORS.forEach((behavior, index) => {
    // TODO: remove old way
    if (behavior.rule && behavior.rule(element) && !behavior.behaviorName) {

      ECS_SYSTEMS[index].add(pointer);
      behaviorExist = true;
    }

    // new way start
    if (behavior.rule && behavior.rule(element) && behavior.behaviorName) {
      ECS_SYSTEMS[index].start(element);
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
