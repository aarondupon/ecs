/*
  Creates a new 3D torus with its own shader and vertex buffers.
 */

import createGeometry from 'gl-geometry';
import createShader from 'gl-shader';
import createTorus from 'torus-mesh';
import mat4 from 'gl-mat4';
// our phong shader for the brick torus
// import glslify from 'glslify';
import vert from './shaders/phong.vert';
import frag from './shaders/phong.frag';


export default function create(gl) {
  const complex = createTorus({
    majorSegments: 64,
    minorSegments: 64
  });

  // enable derivatives for face normals
  const ext = gl.getExtension('OES_standard_derivatives');
  if (!ext) { throw new Error('derivatives not supported'); }

  // create our shader
  const shader = createShader(gl, vert, frag);

  // create a geometry with some vertex attributes
  const geom = createGeometry(gl)
    .attr('position', complex.positions)
    .attr('normal', complex.normals)
    .attr('uv', complex.uvs, { size: 2 })
    .faces(complex.cells);

  // our model-space transformations
  const model = mat4.create();

  const mesh = {
    draw,
    light: null,
    flatShading: false,
  };

  return mesh;

  function draw(camera) {
    // set our uniforms for the shader
    shader.bind();
    shader.uniforms.projection = camera.projection;
    shader.uniforms.view = camera.view;
    shader.uniforms.model = model;
    shader.uniforms.flatShading = mesh.flatShading ? 1 : 0;
    shader.uniforms.light = mesh.light;
    shader.uniforms.texDiffuse = 0;
    shader.uniforms.texNormal = 1;
    shader.uniforms.texSpecular = 2;
    
    // draw the mesh
    geom.bind(shader);
    geom.draw(gl.POINTS);
    geom.unbind();
  }
};
