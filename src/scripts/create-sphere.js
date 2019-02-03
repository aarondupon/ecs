import createGeometry from 'gl-geometry';
import createShader from 'gl-shader';
import mat4 from 'gl-mat4';
import icosphere from 'icosphere';

// import glslify from 'glslify';
import vert from './shaders/basic.vert';
import frag from './shaders/basic.frag';

export default function create(gl) {
  // create our shader
  const shader = createShader(gl, vert, frag);

  // set up a sphere geometry
  const mesh = icosphere(2);
  const geom = createGeometry(gl)
    .attr('position', mesh.positions)
    .faces(mesh.cells);

  // the model-space transform for our sphere
  const model = mat4.create();
  const s = 0.05;
  const scale = [s, s, s];

  const sphere = {
    position: [0, 0, 0],
    color: [1, 0, 0],
    draw
  };

  return sphere;

  function draw(camera) {
    // set up our model matrix
    mat4.identity(model);
    mat4.translate(model, model, sphere.position);
    mat4.scale(model, model, scale);

    // set our uniforms for the shader
    shader.bind();
    shader.uniforms.projection = camera.projection;
    shader.uniforms.view = camera.view;
    shader.uniforms.model = model;
    shader.uniforms.color = [1,0,0];
    // shader.uniforms.color = sphere.color;


    // draw the mesh
    geom.bind(shader);
    geom.draw(gl.POINTS);
    geom.unbind();
  }
};