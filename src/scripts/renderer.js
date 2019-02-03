import context from 'webgl-context';
import loop from 'canvas-loop';
import createCamera from 'perspective-camera';
import createScene from './scene';
import DrawSystem from './system/DrawSystem';
import ECSDrawSystem from './system/ECSDrawSystem';
import ECSTranslateSystem from './system/ECSTranslateSystem';

export default function renderer(images) {
    
  const gl = context();
  const { canvas } = gl;
  const app = loop(canvas, {
    scale: window.devicePixelRatio
  }).on('tick', render);
// alert(window.devicePixelRatio)
  // create a simple perspective camera
  // contains our projection & view matrices
  const camera = createCamera({
    fov: Math.PI / 4,
    near: 0.01,
    far: 100
  });
 
     


  // create our custom scene
  const updateScene = createScene(gl, images);

  var time = 0;
  app.start();

  app.canvas = canvas;
  app.gl = gl;


  return app;

  function render(dt) {
    // our screen-space viewport
    const [width, height] = app.shape;

    time += dt / 1000;

    // set WebGL viewport to device size
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    // rotate the camera around origin
    const rotation = 90 * Math.PI / 180;// Math.PI / 4 + time * 0.2;
    const radius = 4;
    const x = 0;//Math.cos(rotation) * radius;
    const z = Math.PI;//Math.sin(rotation) * radius;
    camera.identity();
    camera.translate([x, 0, z]);
    camera.lookAt([0, 0, 0]);
    camera.viewport = [0, 0, width, height];
    camera.update();
    // draw our scene
    updateScene(time, camera);


    DrawSystem.render(gl, time, camera);
    ECSTranslateSystem.render(gl, time, camera);
    ECSDrawSystem.render(gl, time, camera);

  }
 
//   return Object.assign(app, { canvas, gl });
}
