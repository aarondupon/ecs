import { default as createSytstem } from './helpers/system';
import createState from './helpers/state';
export const ECSSystems = [];

// const importBehaviors = require.context('../behaviors/ecs', true, /Behavior.ts$/);
// function loadBehaviors() {
// // require('../stories/index.stories');
// importBehaviors.keys().forEach((filename) => {
//     if (filename) {
//         const b = importBehaviors(`${filename}`);
//         const ESCSystem = createSytstem(b.update, filename.replace('./', '').replace('.ts', ''), createState());
//         console.log('ESCSystem', b.update);
//         ECSSystems.push(ESCSystem);
//         console.log('behavior loaded', filename, ECSSystems);
//     }
// });
// }
// loadBehaviors();


// automatically import all files ending in *.stories.js
const importSystems = require.context('.', true, /System.ts$/);

function loadSystems() {
// require('../stories/index.stories');
importSystems.keys().forEach((filename, i) => {
    const m = importSystems(`${filename}`);
;
    ECSSystems.push(m.default);
    console.log('filename', filename);
});
}
loadSystems();
