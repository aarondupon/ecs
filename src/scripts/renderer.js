import context from 'webgl-context';
import loop from 'canvas-loop';
import createCamera from 'perspective-camera';
import { timer } from 'rxjs';
import { animationFrame } from 'rxjs/scheduler/animationFrame';
import { scan } from 'rxjs/operators';
import createScene from './scene';

// START SYSTEM
import { createRenderSystem } from './system/register';

function raf(step = 1000) {
  return timer(0, 1000 / step, animationFrame).pipe(
      scan((total /* , value, index */) => total + 1, 0)
      );
}

export default function renderer(images) {
  const gl = context();
  const { canvas } = gl;

  const ECSSystems = createRenderSystem(gl);


  const app = loop(canvas, {
    scale: window.devicePixelRatio
  }); // .on('tick', render);


  raf(60).subscribe((dt) => {
    render(dt);
  });

  // create a simple perspective camera
  // contains our projection & view matrices
  const camera = createCamera({
    fov: Math.PI / 4,
    near: 0.1,
    far: 100
  });

  const [cameraWidth, cameraHeight] = app.shape;

  const x = 0;
  const z = Math.PI;
  camera.identity();
  // camera.direction = [-0, 0, 1];
  // camera.up = [0, 1, 0];
  // camera.up([0,0,1]);
  camera.translate([x, 0, z]);
  camera.lookAt([0, 0, 0]);
  camera.viewport = [0, 0, cameraWidth, cameraHeight];
  camera.update();
// debugger
  // create our custom scene
  const updateScene = createScene(gl, images);

  let time = 0;
  app.stop();

  app.canvas = canvas;
  app.gl = gl;

  window.app = app;

  return app;


  function render(dt) {
    // our screen-space viewport
    const [width, height] = app.shape;

    time += dt / 1000;

    camera.viewport = [0, 0, width, height];
    // camera.update();

    // set WebGL viewport to device size
    gl.viewport(0, 0, width * 2, height * 2);
    // gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.1, 0.1, 0.1, 1);
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // eslint-disable-line no-bitwise

    // enable ECSSystems
    // DrawSystem.render(gl, time, camera);

    ECSSystems.forEach((system) => {
      system.render(gl, time, camera);
    });

    // ECSTranslateSystem.render(gl, time, camera);
    // ECSCompositionSystem.render(gl, time, camera);
    // ECSDrawSystem.render(gl, time, camera);

    // draw our scene
    updateScene(time, camera);
  }
}
