import { vec3, mat4 } from 'gl-matrix';
import { BehaviorSubject } from 'rxjs';

const LIBRARY = new Map<number, any>();
declare interface Itranslate{
  position:vec3;
}

/**
 *
 *
 * @param {*} gl
 * @param {*} [element={}]
 * @param {*} camera
 * @param {number} uid
 */


export const update = (gl, element:any = {}, camera:any, uid:number) => {
  
  if (!LIBRARY.get(uid)) {
    element.model = element.model || mat4.identity( mat4.create());
    
    // element.position = vec3.create()
    const data = {
        globalScale:vec3.fromValues(1,1,1),
    }
    LIBRARY.set(uid, data );
    
  }
  
  const { globalScale } = LIBRARY.get(uid);
  const parent = element.parent ? LIBRARY.get(element.parent.uid) : undefined
  const parentGlobalScale = parent ? parent.globalScale : vec3.fromValues(1,1,1); 
  const localScale = element.scale || vec3.fromValues(1,1,1);
  

  const model = mat4.clone(element.model);
  if(!element.rotation && !element.translate) mat4.identity(model);
  vec3.multiply(globalScale, parentGlobalScale, localScale);
  // mat4.scale(model, model, globalScale);
  mat4.scale(model, model, globalScale)

  element.model = model;
  // update model
  element.shaders && element.shaders.forEach(shader => {
    // shader.uniforms.model = model;
  });
  // console.log('globalScale',globalScale)
  LIBRARY.set(uid,{globalScale});
};
