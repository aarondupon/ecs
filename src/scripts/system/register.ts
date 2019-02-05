
import { default as createSytstem } from './helpers/system';
import config from './config';
import { first } from 'rxjs/operators';

let ready = false;
let load = true;
const elements:IElements = new Map();
const queue = [];

const jsUcfirst = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export const ECSSystems = [];
export const ECSBehaviors = [];

const getBehaviorName  = (path) => {
  return path.match(/([^\/]+)(?=Behavior\.\w+$)/)[0];
};

const getSystemName = (filename) =>
`ESC${jsUcfirst(filename.replace('./', '').replace('.ts', '')).replace('Behavior', 'System')}`;
// @ts-ignore
const importBehaviors = require.context('../behaviors/ecs', true, /Behavior.ts$/);

function loadBehaviors() {
// require('../stories/index.stories');
  const origKeys = [... importBehaviors.keys()];
  const firstKeys = [];
  const lastKeys = [];

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
    // creates behavior rule (checks if element has behavior short name)
    // example name is drawBehavior.js  --> short name is draw
    // iterates over behavior of current element array property
    // if has behavior add to array of behavior ESC sytstemm
      const rule =  (element) => (element.behaviors && element.behaviors.includes(getBehaviorName(filename)));
      const behavior = {
        update:behaviorModule.update,
        rule,
      };

      ECSBehaviors.push(behavior);
      const name = getSystemName(filename);
      if (!window[name]) {
        window[name] = name;
        const ESCSystem  = createSytstem(function (gl, data, camera, uid) {
          behavior.update(gl, data, camera, uid);
        },                               name);

        ESCSystem.setPool(elements);
        console.log('ESCSystem');
        ECSSystems.push(ESCSystem);
      }

      ready = true;

      if (queue && queue.length > 0) {
        let pointer = 0;

        while (queue.length > 0) {
          const element = queue.shift();
          let behaviorExist = false;
          ECSBehaviors.forEach((behavior, index) => {
            console.log(behavior.default.name, behavior.rule, ECSSystems[index].name, index, element);
            if (behavior.rule && behavior.rule(element)) {
              ECSSystems[index].add(pointer);
              behaviorExist = true;
            }
          });
          pointer ++;

          if (!behaviorExist && element.behaviors) {
            console.error(`register.js: behavior ${name}  does not exist
            please create a ${name}Behavior.js file in .scripts/behaviors/ecs
            or select one of ${origKeys.map(getBehaviorName).join(',')}`);
          }

        }

      }

      console.log('behavior loaded', filename, ECSSystems);
    }
  });
}
if (load) loadBehaviors();
load = false;
interface IElements{
  [index: string]: any;
  [index: number]: any;
}

const register = (element) => {
    // add to sytem
  const pointer = elements.size;

  elements.set(pointer, element);
  if (ready) {
    let behaviorExist = false;


    // USE MAP NO FOREACH
    ECSBehaviors.forEach((behavior, index) => {
      if (behavior.rule && behavior.rule(element)) {
        ECSSystems[index].add(pointer);
        behaviorExist = false;
      }
    });
    if (!behaviorExist &&  element.behaviors) {
      console.error(`register.js:`,element,`behavior ${element.behaviors}  does not exist
        please create a *Behavior.js file in .scripts/behaviors/ecs`);
    }

  }
    // add to queue
  else {
    queue.push(element);
  }
  console.log();
  return element;
};

export default register;
