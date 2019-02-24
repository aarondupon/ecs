import { vec3, mat4,quat } from 'gl-matrix';
import behavior from '../../system/helpers/behavior';
import { getComponent } from '../../system/helpers/system';


declare interface IDrawData{

}


declare interface IElement{
  uid: string;
  model:mat4;
  projection:mat4;
  view:mat4;
  behaviors:string[];
}

declare interface ItranslateComponent{
  uid?:string;
  position:vec3;
  globalPosition?:vec3;
}


function translate3d(data:ItranslateComponent):ItranslateComponent {
  const defaults = { 
    globalPosition: vec3.create(), 
    position: vec3.create(),
  };
  return Object.assign(defaults, data);
}
export const translate3dBehavior:
(behaviorData: ItranslateComponent) => (element:IElement) => any = behavior(translate3d);


// render loop
// export const update = (gl:any, component:ItranslateComponent, camera:any,element:IElement) => {

//   const {uid} = element;
//   const {globalPosition,position} = component;

//   const parent = undefined;//element.parent ? LIBRARY.get(element.parent.uid) : undefined
//   const parentGlobalPosition = parent ? parent.globalPosition : [0, 0, 0];
//   const localPosition = position;

//   const model = mat4.clone(element.model);
//   //if(!element.scale && !element.rotation) 
//   mat4.identity(model);

//   const [vpX,vpY,vpWidth,vpHeight] = camera.viewport;


//   vec3.add(globalPosition, parentGlobalPosition, localPosition);
//   // normalize pixel space;
//   vec3.divide(globalPosition,globalPosition,[vpWidth,-vpHeight,1])
//   mat4.translate(model, model,globalPosition );

//   element.model = model;
  

//   // const geoms = goemsRef(uid).data;
  
// };

// reactive
export const onUpdate2 = (gl:any, component:ItranslateComponent, camera:any,element:IElement) => {
  const {uid} = element;
  const {globalPosition,position} = component;

  const parent = undefined; // element.parent ? LIBRARY.get(element.parent.uid) : undefined
  const parentGlobalPosition = parent ? parent.globalPosition : [0, 0, 0];
  const localPosition = position;

  const model = mat4.clone(element.model);
  mat4.identity(model);
 
  

  const [vpX,vpY,vpWidth,vpHeight] = camera.viewport;


  vec3.add(globalPosition, parentGlobalPosition, localPosition);
  // normalize pixel space;
  vec3.divide(globalPosition,globalPosition,[vpWidth,-vpHeight,1])
  mat4.translate(model, model,globalPosition );

  element.model = model;

  return {globalPosition, position }
  
};

// export const task = (data:any, uid:string, complete, gl) => {
//   return complete(data)
// };
