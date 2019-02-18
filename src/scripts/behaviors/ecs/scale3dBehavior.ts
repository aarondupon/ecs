import { vec3, mat4 } from 'gl-matrix';
import behavior from '../../system/helpers/behavior';
import { getComponent } from '../../system/helpers/system';
import { debug } from 'util';

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

declare interface IScaleComponent{
  scale:vec3;
  globalScale?:vec3;
}

function scale3d(data:IScaleComponent):IScaleComponent {
  const initialData = {
    globalScale: vec3.fromValues(1, 1, 1),
    scale: vec3.fromValues(1, 1, 1),
    ...data,
  };
  return initialData;
}
export const scale3dBehavior:
(behaviorData: IScaleComponent) => (element:IElement) => any = behavior(scale3d);

export const update = (gl:any, component:IScaleComponent, camera:any, element:IElement) => {

  const { uid } = element;
  const { globalScale, scale } = component;

  const parent = undefined; // element.parent ? LIBRARY.get(element.parent.uid) : undefined
  const parentGlobalScale = parent ? parent.globalScale : [1, 1, 1];
  const localScale = scale;

  const model = mat4.clone(element.model);

  if (!element.behaviors.includes('translate3d')
     && !element.behaviors.includes('rotation3d')) {
    mat4.identity(model);
  }

  vec3.multiply(globalScale, parentGlobalScale, localScale);

  mat4.scale(model, model, globalScale);

  element.model = model;
};
