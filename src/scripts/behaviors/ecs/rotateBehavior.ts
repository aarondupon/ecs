import { vec3, mat4, quat } from 'gl-matrix';
import { BehaviorSubject } from 'rxjs';
import compose from 'css-mat4';


function toDeg(r) {
  return r * 180 / Math.PI;
}

function toRad(d) {
  return d * Math.PI / 180;
}

const LIBRARY = new Map<number, any>();
declare interface Itranslate{
  Rotation:vec3;
}

function rotateVectorAboutAxis(v, axis, angle) {
  const sinHalfAngle = Math.sin(angle / 2.0);
  const cosHalfAngle = Math.cos(angle / 2.0);

  const rX = axis[0] * sinHalfAngle;
  const rY = axis[1] * sinHalfAngle;
  const rZ = axis[2] * sinHalfAngle;
  const rW = cosHalfAngle;

  const q = quat.fromValues(rX, rY, rZ, rW);

  // find the conjugate of q.
  const q_conj = quat.create();
  quat.copy(q_conj, q);
  quat.conjugate(q_conj, q_conj);

  const p = quat.fromValues(v[0], v[1], v[2], 0);

  const result = quat.create();

  /*
   Compute the product (q * p * q_conj)
   For more details, please see page 75 in "Real-time rendering - Third edition"
   */
  quat.multiply(result, q, p);
  quat.multiply(result, result, q_conj);

  return vec3.fromValues(result[0], result[1], result[2]);

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
    const rotation = element.rotation || vec3.create();
    element.model = element.model || mat4.identity(mat4.create());

    // element.Rotation = vec3.create()
    const data = {
      localRotation:vec3.create(),
    };
    LIBRARY.set(uid, data);

  }

  const { globalRotation } = LIBRARY.get(uid);
  const parent = element.parent ? LIBRARY.get(element.parent.uid) : undefined;
  const parentGlobalRotation = parent ? parent.globalRotation : [0, 0, 0];
  const localRotation:vec3 = element.rotation || vec3.create();

  const model = mat4.clone(element.model);

  if(!element.position) mat4.identity(model);
 
  // mat4.rotateX(model, model, toDeg(localRotation[0]));
  // mat4.rotateY(model, model, toDeg(localRotation[1]));
  // mat4.rotateZ(model, model, toDeg(localRotation[2]));
  // mat4.translate(model, model, [0,0,0]);
  
//   var matrix = compose(model, {
//     rotate: [toDeg(localRotation[0]),toDeg(localRotation[1]),toDeg(localRotation[2])],
//     // scale: [0.25, 0.4, 1.0],
//     // skewX: Math.PI/2,
//     // skewY: Math.PI/2
// })
// mat4.translate(model,model, [0,0,0]);
// mat4.rotateX(model,model, localRotation[0]);
// mat4.rotateY(model,model, localRotation[1]);
// mat4.rotateZ(model,model, localRotation[2]);
// mat4.scale(model,model,[ 1,1,1]);

  // mat4.multiply( modelviewProjection, projection, modelview );

 
  //  const rx = toRad(-90);
  //  const ry = toRad(0);
  //  const rz = toRad(0);
    const m = mat4.create();
   mat4.rotate( m, m, toDeg(localRotation[0]), [1,0,0] );
   mat4.rotate( m, m, toDeg(localRotation[1]), [0,1,0] );
   mat4.rotate( m, m, toDeg(localRotation[2]), [0,0,1] );
   mat4.multiply( model, model, m );
  

  // mat4.multiply(model, localRotation, model);
  // onsole.log('model', model);
  // vec3.add(localRotation, parentGlobalRotation, localRotation);
  // mat4.multiply(model, model, localRotation);

  // mat4.rotate( model, model, (190)*180 / Math.PI, [0,0,1] );
  // mat4.translate(model, model,localPosition);

  // mat4.rotate( model, model, (localRotation[2])*180 / Math.PI, [0,0,1] );
  // // element.position = [0,localPosition[1],0]
  // mat4.scale(model, model, [.5,.3,.5])



  element.model = model;
  // update model
  element.shaders && element.shaders.forEach(shader => {
    // shader.uniforms.model = model;
  });
//   console.log('translate',element.Rotation)
  LIBRARY.set(uid, { localRotation });
};
