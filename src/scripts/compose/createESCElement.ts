import compose from './compose';
import { vec3, mat4 } from 'gl-matrix';
import { _system_Behavior } from '../behaviors/ecs/_system_Behavior';

declare interface IElement{
  uid: string;
  model:mat4;
  projection:mat4;
  registered:boolean;
  view:mat4;
  behaviors:string[];
  parent?:any;
}

const createElement = (...behaviors:{ (props:any): IElement; }[]) => (props = {}) => {
  // const element:IElement = compose(...behaviors,_system_Behavior({}))(props);
  const element:IElement = compose(...behaviors)(props);
  const comp = Object.assign({ uid:Date.now() }, element);
  return comp;
};

export default createElement;
