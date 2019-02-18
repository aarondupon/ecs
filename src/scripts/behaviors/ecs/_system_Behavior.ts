import { vec3, mat4 } from 'gl-matrix';
import behavior from '../../system/helpers/behavior';
import {unregister} from '../../system/register';

declare interface IElement{
  uid: string;
  model:mat4;
  projection:mat4;
  view:mat4;
  behaviors:string[];
}

declare interface ISystemComponent{
  unregisterAfterUpdate?:boolean;
}
function _system_(data:ISystemComponent):ISystemComponent {
  const initialData = {
    unregisterAfterUpdate:true,
    ...data,
  };
  return initialData;
}
export const _system_Behavior:
  (behaviorData: ISystemComponent) => (element:IElement) => any = behavior(_system_);


export const update = (gl:any, component:ISystemComponent, camera:any, element:IElement) => {

    const { uid } = element;
    const { unregisterAfterUpdate } = component;
    if(unregisterAfterUpdate){

      unregister(element.uid, element.behaviors)
    }
}

export const task = (data:any, element:IElement, complete, gl) => {
     setTimeout(()=>complete(data),100)
  };
  