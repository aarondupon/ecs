import createGeometry from 'gl-geometry';
import createShader from 'gl-shader';
import mat4 from 'gl-mat4';
import icosphere from 'icosphere';

// import glslify from 'glslify';
import vert from './shaders/basic.vert';
import frag from './shaders/basic.frag';

export default function create(size = 1) {
  // set up a sphere geometry
  const complex = icosphere(4);
  
  // the model-space transform for our sphere
  const model = mat4.create();
  const s = 1;//0.05;

  const sphere = {
    complex,
    position: [0, 0, 0],
    color: [1, 0, 0],
    scale: [s, s, s],
    shaders: [
      {
        vert,
        frag,
        uniforms: {
          projection: new Float32Array(16),
          view: new Float32Array(16),
          model, // our model-space transformations
          color: [1, 0, 0],
          drawMode: ['POINTS'],
       }
     }
     ]
  };

  return sphere;
}
