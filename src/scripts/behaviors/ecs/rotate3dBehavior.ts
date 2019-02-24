import { vec3, vec4, mat4, quat } from 'gl-matrix';
import behavior from '../../system/helpers/behavior';
import { getComponent,getTable ,getComponentValue} from '../../system/helpers/system';
import compose from 'css-mat4';
import createElement from '../../compose/createElement';

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
  quaternion:vec4;
}

//    position:getComponentValue('translate3d','position')


function rotate3d(data:IRotationComponent):IRotationComponent {
  const defaults = { 
    globalRotation: vec3.create(), 
    rotation: vec3.create(),
    quaternion:vec4.fromValues(0,0,0,1),
  };
  return Object.assign(defaults, data);
}
export const rotate3dBehavior: 
(behaviorData: IRotationComponent) => (element:IElement) => any = behavior(rotate3d);



const translate3d = getTable('translate3d')

// render loop
export const onUpdate2 = (gl:any, component:IRotationComponent, camera:any,element:IElement) => {

  const {uid} = element;
  const {globalRotation,rotation,quaternion} = component;

   const {globalPosition:position} = translate3d.get(element.uid);


  const parent = undefined;//element.parent ? LIBRARY.get(element.parent.uid) : undefined
  const parentGlobalRotation = parent ? parent.globalRotation : [0, 0, 0];
  const localRotation = rotation;


  const model = mat4.clone(element.model);
  
  // if(!element.behaviors.includes('translate3d'))  mat4.identity(model);
  mat4.identity(model);


  let m = mat4.create();
  

  quat.fromEuler(quaternion,localRotation[0],localRotation[1],localRotation[2]);


  const pivot = vec3.fromValues(-.5,.5,-.5);
  mat4.add(pivot, pivot,position);
  
  mat4.fromRotationTranslation(m, quaternion, pivot);
  // mat4.translate(m,m,m2)
  mat4.translate(m, m, vec3.multiply(pivot,pivot,[-1,-1,-1]) );
  
  mat4.translate(m, m,position);
 

  element.model = m;  


};


// obseverbable reactive (triggers render)
export const subscribe = (gl:any, component:IRotationComponent, camera:any,element:IElement) => {
  console.log('subsribe')
}

