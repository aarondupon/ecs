import { vec3, mat4 } from 'gl-matrix';
import behavior from '../../system/helpers/behavior';
import { getComponent } from '../../system/helpers/system';

function toDeg(r) {
  return r * 180 / Math.PI;
}

function toRad(d) {
  return d * Math.PI / 180;
}


declare interface IElement{
  uid: string;
  model:mat4;
  projection:mat4;
  view:mat4;
  behaviors:string[];
}


declare interface IRotationComponent{
  uid?:string;
  rotation:vec3;
  globalRotation?:vec3;
}


function rotate3d(data:IRotationComponent):IRotationComponent {
  const defaults = { 
    globalRotation: vec3.create(), 
    rotation: vec3.create(),
  };
  return Object.assign(defaults, data);
}
export const rotate3dBehavior: 
(behaviorData: IRotationComponent) => (element:IElement) => any = behavior(rotate3d);


export const update = (gl:any, component:IRotationComponent, camera:any,element:IElement) => {

  const {uid} = element;
  const {globalRotation,rotation} = component;

  const parent = undefined;//element.parent ? LIBRARY.get(element.parent.uid) : undefined
  const parentGlobalRotation = parent ? parent.globalRotation : [0, 0, 0];
  const localRotation = rotation;

  const model = mat4.clone(element.model);
  
  if(!element.behaviors.includes('translate3d')) mat4.identity(model);


  const m = mat4.create();
  mat4.rotate( m, m, toRad(localRotation[0]), [1,0,0] );
  mat4.rotate( m, m, toRad(localRotation[1]), [0,1,0] );
  mat4.rotate( m, m, toRad(localRotation[2]), [0,0,1] );
  // mat4.rotate( m, m, toDeg(localRotation[0]), [1,0,0] );
  // mat4.rotate( m, m, toDeg(localRotation[1]), [0,1,0] );
  // mat4.rotate( m, m, toDeg(localRotation[2]), [0,0,1] );
  mat4.multiply( model, model, m );

  element.model = model;  
};
