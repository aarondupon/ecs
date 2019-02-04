import context from 'webgl-context';
import loop from 'canvas-loop';
import createCamera from 'perspective-camera';
import createScene from './scene';
import {ECSSystems}  from './system/register';
// import {ECSSystems}  from './system/autoload';
// import DrawSystem from './system/DrawSystem';
// import ECSDrawSystem from './system/ECSDrawSystem';
// import ECSTranslateSystem from './system/ECSTranslateSystem';
// import ECSCompositionSystem from './system/ECSCompositionSystem';

// const ECSSystems = []

// import('./system/config').then(({configure})=>{
//   // automatically import all files ending in *.stories.js
//   const importSystems = require.context('./system', true, /System.ts$/)

//   function loadSystems() {
//     // require('../stories/index.stories');
//     importSystems.keys().forEach((filename,i) => {

//       const m = importSystems(`${filename}`);

//       ECSSystems.push(m.default);    
//       console.log('filename',filename)
//     });
//   }
//   loadSystems()
//   })

// const modules = []
// async function f(){
// const importSystems = require.context('./system', true, /System.ts$/, 'lazy');

// importSystems.keys(); // sync, return an array of gathered paths
// importSystems.keys().forEach((filename,i) => {
//   const m = importSystems(`${filename}`);
//   modules.push(m)
// })
// /* es-lint error: off */
// await  modules// async, resolves to the module

// }

// const func = modules.map(m=>m)
// console.log('func:',func)
  
export default function renderer(images) {
  const gl = context();
  const { canvas } = gl;
  const app = loop(canvas, {
    scale: window.devicePixelRatio
  }).on('tick', render);

  // create a simple perspective camera
  // contains our projection & view matrices
  const camera = createCamera({
    fov: Math.PI / 4,
    near: 0.01,
    far: 100
  });

  const [cameraWidth, cameraHeight] = app.shape;

  const x = 0;
  const z = Math.PI;
  camera.identity();
  camera.translate([x, 0, z]);
  camera.lookAt([0, 0, 0]);
  camera.viewport = [0, 0, cameraWidth, cameraHeight];
  camera.update();

  // create our custom scene
  const updateScene = createScene(gl, images);

  let time = 0;
  app.start();

  app.canvas = canvas;
  app.gl = gl;


  return app;


  function render(dt) {
    // our screen-space viewport
    const [width, height] = app.shape;

    time += dt / 1000;

    camera.viewport = [0, 0, width, height];
    camera.update();

    // set WebGL viewport to device size
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.04, 0.04, 0.04, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // eslint-disable-line no-bitwise

    // enable ECSSystems
    // DrawSystem.render(gl, time, camera);
 
    
    ECSSystems.forEach((system)=>{
      
      system.render(gl, time, camera);
    })
    // ECSTranslateSystem.render(gl, time, camera);
    // ECSCompositionSystem.render(gl, time, camera);
    // ECSDrawSystem.render(gl, time, camera);

    // draw our scene
    updateScene(time, camera);
  }
}
