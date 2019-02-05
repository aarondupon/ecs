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
    const position = element.position || vec3.create();
    element.model = element.model || mat4.identity( mat4.create());

    // element.position = vec3.create()
    const data = {
      globalPositon:vec3.create(),
    }
    LIBRARY.set(uid, data );

  }
  
  const { globalPositon } = LIBRARY.get(uid);
  const parent = element.parent ? LIBRARY.get(element.parent.uid) : undefined
  const parentGlobalPosition = parent ? parent.globalPositon : [0, 0, 0];
  const localPosition = element.position || vec3.create();

  let model = mat4.clone(element.model);
  //if(!element.scale && !element.rotation) 
  mat4.identity(model);
//   console.log('model', model);
  vec3.add(globalPositon, parentGlobalPosition, localPosition);
  mat4.translate(model, model, globalPositon);


//   mat4.rotate( model, model, toDeg(90), [1,0,0] );
//   mat4.rotate( model, model, toDeg(localRotation[1]), [0,1,0] );
//   mat4.rotate( model, model, (element.rotation/1 || 1)*  180/Math.PI, [0,0,1] );

  element.model = model;
  // update model
  element.shaders && element.shaders.forEach(shader => {
    // shader.uniforms.model = model;
  });
//   console.log('translate',element.position)
  LIBRARY.set(uid, { globalPositon });
};
