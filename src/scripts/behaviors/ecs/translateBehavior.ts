import { vec3, mat4 } from 'gl-matrix';

const LIBRARY = new Map<number, any>();
declare interface Itranslate{
  position:vec3;
}
export const update = (gl, element:any = {}, camera:any, uid:number) => {

  if (!LIBRARY.get(uid)) {
    const position = element.position || vec3.create();
    element.model = element.model || mat4.create();
    // element.position = vec3.create()
    LIBRARY.set(uid, position);
  }
//   const position = LIBRARY.get(uid);
  const model = element.model;
  mat4.identity(model);
  mat4.translate(model, model, element.position);

  //update model
  element.shaders && element.shaders.forEach(shader => {
    shader.uniforms.model = model;
  });
  console.log('translate',element.position)
//   LIBRARY.set(uid,position);
 

};

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

export const rule = (element)=>(typeof element.translate === 'string' || element.translate instanceof String) 

export default translateBehavior;
