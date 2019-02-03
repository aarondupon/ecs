import { vec3, mat4 } from 'gl-matrix';

const LIBRARY = new Map<number, any>();
declare interface Itranslate{
  position:vec3;
}
export const update = (gl, element:any = {}, camera:any, uid:number) => {

  if (!LIBRARY.get(uid)) {
    const position = element.position || vec3.create();
    element.model = element.model || mat4.create();
    LIBRARY.set(uid, position);
  }

  const model = element.model;
  mat4.identity(model);
  mat4.translate(model, model, element.position);

  //update model
  element.shaders.forEach(shader => {
    shader.uniforms.model = model;
  });

 

};

export function setTranslate(element:Itranslate, position: vec3): vec3 {
  element.position = position;
}

export function   getTranslate(element:Itranslate): vec3 {
// Defensive clone
  return vec3.clone(element.position);
}

/**
 * composable behavior for craeteElement pipeline
 * @param specs optioal specifications on initialize behavior
 */
const translateBehavior = (specs:any = {}) => (metods:any) => {
  const comp =  {
    position:vec3.create(),
    ...metods,
    translate: 'translateBehavior',
  };
  return comp;
};

export default translateBehavior;
