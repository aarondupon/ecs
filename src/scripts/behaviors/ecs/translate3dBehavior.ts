import { vec3, mat4 } from 'gl-matrix';
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

declare interface IComponent{
  uid?:string;
  position:vec3;
  globalPositon?:vec3;
}


function translate3d(data:IComponent):IComponent {
  const defaults = { 
    globalPositon: vec3.create(), 
    position: vec3.create(),
  };
  return Object.assign(defaults, data);
}
export const translate3dBehavior: 
(behaviorData: IComponent) => (element:IElement) => any = behavior(translate3d);


export const update = (gl:any, component:IComponent, camera:any,element:IElement) => {

  const {uid} = element;
  const {globalPositon,position} = component;

  const parent = undefined;//element.parent ? LIBRARY.get(element.parent.uid) : undefined
  const parentGlobalPosition = parent ? parent.globalPositon : [0, 0, 0];
  const localPosition = position;

  const model = mat4.clone(element.model);
  //if(!element.scale && !element.rotation) 
  mat4.identity(model);

  const [vpX,vpY,vpWidth,vpHeight] = camera.viewport;


  vec3.add(globalPositon, parentGlobalPosition, localPosition);
  // normalize pixel space;
  vec3.divide(globalPositon,globalPositon,[vpWidth,-vpHeight,1])
  mat4.translate(model, model,globalPositon );

  element.model = model;
  

  // const geoms = goemsRef(uid).data;
  
};

// export const task = (data:any, uid:string, complete, gl) => {
//   return complete(data)
// };
