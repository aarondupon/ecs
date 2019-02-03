import {default as hex } from 'hex2rgb';
/*
  Creates a new 3D torus with its own shader and vertex buffers.
 */

import createGeometry from 'gl-geometry';
import createTorus from 'torus-mesh';
import mat4 from 'gl-mat4';
// our phong shader for the brick torus
// import glslify from 'glslify';
import vert from './shaders/phong.vert';
import frag from './shaders/phong.frag';

var hex2rgb = (str) => {
  return hex(str).rgb.map(x => x/255)
}


export default function create(gl) {
  const complex = createTorus({
    majorSegments: 64,
    minorSegments: 64
  });

  // the model-space transform for our sphere
  const model = mat4.create();
  const s = 0.05;
  const scale = [s, s, s];

  const blueLight = {
    falloff: 0.15,
    radius: 2,
    position: [0, 0, 0],
    color: hex2rgb('#00FFFF'),
    ambient: hex2rgb('#0a040b'),
  };
  const mesh = {
      uid: Date.now(),
      complex,
      model,
      shaders: [
         { 
           vert,
           frag,
           uniforms: {
            projection: new Float32Array(16),
            model, // our model-space transformations
            flatShading: 0,
            view: new Float32Array(16),
            light: blueLight,
            texDiffuse: 1,
            textNormal: 1,
            textSpectacular: 2,
          }
        }
        ]
    };

  return mesh;
}
