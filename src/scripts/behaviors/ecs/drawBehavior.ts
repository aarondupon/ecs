
import { mat4 } from 'gl-matrix';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { elementAt, share } from 'rxjs/operators';
import glShader from 'gl-shader';
import glGeometry from 'gl-geometry';

declare interface IDrawObject{
  geo?:any;
  gl?:any;
  model?:any;
  shaders?:any;
  complex?:any;
}

declare interface IShader{
  uniforms?:any;
  bind:any;
}

const DRAW_LIBRARY = new Map<number, any>();

/**
 * updat function draws data to screen
 * @param gl 
 * @param element 
 * @param camera 
 * @param uid 
 */
export const update = (gl, element:IDrawObject = {}, camera:any, uid:number) => {
  const {
    complex,
    model,
  } = element;
  const position = [0, 0, 0];

  if (!DRAW_LIBRARY.get(uid)) {
     // enable derivatives for face normals
    const ext = gl.getExtension('OES_standard_derivatives');
    if (!ext) { throw new Error('derivatives not supported'); }

    // create all shaders from vertex en fragemnt
    const shaders = element.shaders.map(({ vert, frag }) => glShader(gl, vert, frag));

    // create a geometry with some vertex attributes
    const geom = glGeometry(gl)
    .attr('position', complex.positions)
    .attr('normal', complex.normals)
    .attr('uv', complex.uvs, { size: 2 })
    .faces(complex.cells);
    DRAW_LIBRARY.set(uid, { geom, shaders });

  }
  const { shaders, geom } = DRAW_LIBRARY.get(uid);

  shaders.forEach((shader:IShader, shaderIdx:number) => {

    const uniforms =  element.shaders[shaderIdx].uniforms;
    // mat4.identity(model);
    // mat4.translate(model, model, position);
    // const s = 0.5;
    // const scale = [s, s, s];
    // mat4.scale(model, model, scale);
    shader.bind();

    Object.assign(shader.uniforms, uniforms);
    shader.uniforms.model = model;
    shader.uniforms.projection = camera.projection;
    shader.uniforms.view = camera.view;
    shader.uniforms.color = [1, 0, 0];
          // draw the mesh
    geom.bind(shader);
    geom.draw(gl.TRIANGLES);
    geom.unbind();
  });

};

/**
 * composable behavior for craeteElement pipeline
 * @param specs optioal specifications on initialize behavior
 */
const drawBehavior = (specs:any = {}) => (metods:any) => {
  const comp =  {
    ...metods,
    draw: 'drawBehavior',
  };
  return comp;
};

export default drawBehavior;
