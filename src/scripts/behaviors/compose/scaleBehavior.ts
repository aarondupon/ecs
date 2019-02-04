import { vec3, mat4 } from 'gl-matrix';

const LIBRARY = new Map<number, any>();
declare interface IElement{
  scale:vec3;
}
export const update = (gl, element:any = {}, camera:any, uid:number) => {

  // if (!LIBRARY.get(uid)) {
  //   const scale = element.scale || vec3.create();
  //   element.model = element.model || mat4.create();
  //   LIBRARY.set(uid, scale);
  // }

  // const model = element.model;
  // mat4.identity(model);
  // mat4.translate(model, model, element.scale);

  // //update model
  // element.shaders.forEach(shader => {
  //   shader.uniforms.model = model;
  // });
};

/**
 * composable behavior for craeteElement pipeline
 * @param specs optioal specifications on initialize behavior
 */
const scaleBehavior = (specs:any = {}) => (metods:any) => {
  const comp =  {
    scale:vec3.create(),
    ...metods,
    translate: 'scaleBehavior',
  };
  return comp;
};

export default scaleBehavior;
