
import { default as createSytstem } from './helpers/system';

let ready = false;
let load = true;
const elements:IElements = new Map();
const queue = [];

const jsUcfirst = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export const ECSSystems = [];
export const ECSBehaviors = [];

const getSystemName = (filename) =>
`ESC${jsUcfirst(filename.replace('./', '').replace('.ts', '')).replace('Behavior', 'System')}`;
// @ts-ignore
const importBehaviors = require.context('../behaviors/ecs', true, /Behavior.ts$/);
function loadBehaviors() {
// require('../stories/index.stories');
  importBehaviors.keys().forEach((filename) => {
    if (filename) {
      const behavior = importBehaviors(`${filename}`);
      ECSBehaviors.push(behavior);
      const name = getSystemName(filename);
      if( !window[name]) {
        window[name] = name;
        const ESCSystem  = createSytstem(function(gl, data, camera,uid){
            // console.log('name',uid,behavior.default.name)
            behavior.update(gl, data, camera,uid)
            
        }, name);
        // console.log('behavior.default.name',behavior.default.name,behavior.update)
        // const ESCSystem = createSytstem(behavior.update)
        ESCSystem.setPool(elements)
        // ESCSystem.update2 = behavior.update.bind(ESCSystem)
        console.log('ESCSystem');
        ECSSystems.push(ESCSystem);
      }

      
    
      ready = true;
      
      if (queue && queue.length > 0) {
        let pointer = 0
        while (queue.length > 0) {
          const element = queue.shift();
         
          ECSBehaviors.forEach((behavior, index) => {
              console.log(behavior.default.name,behavior.rule,ECSSystems[index].name,index,element)
            if (behavior.rule && behavior.rule(element)) ECSSystems[index].add(pointer);
          });
          pointer ++;

        }

      }

      console.log('behavior loaded', filename, ECSSystems);
    }
  });
}
if(load) loadBehaviors();
load = false;
interface IElements{
  [index: string]: any;
  [index: number]: any;
}



const register = (element) => {
    // add to sytem
  const pointer = elements.size;
 
  elements.set(pointer, element)
  if (ready) {

    ECSBehaviors.forEach((behavior, index) => {
        if (behavior.rule && behavior.rule(element)) ECSSystems[index].add(pointer);
    });

  }
    // add to queue
  else {
    queue.push(element);
  }
  console.log();
  return element;
};

export default register;
