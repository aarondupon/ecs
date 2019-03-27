import { vec3, mat4, quat } from 'gl-matrix';
import behavior from '../../system/helpers/behavior';
import { getTable } from '../../system/helpers/system';
import { debug } from 'util';

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
  translate3d:{position:vec3, localPositionany:vec3, globalPosition:vec3};
  // position:vec3;
  // localPosition:vec3;
  // globalPosition?:vec3;
  // rotation:vec3;
  // localRotation:vec3;
  // globalRotation?:vec3;
  model:mat4;
}
export const getComponentGroup = () => (['translate3d']); // ,'rotate3d']);

const modelRef =  getTable('model');
export const onUpdateGroup = (gl:any, components:IComponent[], camera:any, elements:IElement[]) => {
 
// console.log('modelSystem',components)
  components.forEach((component, i) => {
    const element = elements[i];
    const { uid } = element;

    const { globalPosition = [0, 0, 0], position = [0, 0, 0] } = component.translate3d;

    const parent = undefined; // element.parent ? LIBRARY.get(element.parent.uid) : undefined
    const parentGlobalPosition = parent ? parent.globalPosition : [0, 0, 0];
    const localPosition = position;

    // const model = mat4.clone(element.model);
    const model =  getTable('model').get(uid);//component.model;//getTable('model').get(uid);//mat4.clone(element.model);
    mat4.identity(model);

    const [vpX, vpY, vpWidth, vpHeight] = camera.viewport;
   
    // console.log(component.globalPosition,component.globalRotation)
    vec3.add(globalPosition, parentGlobalPosition, localPosition);
    // normalize pixel space;
    vec3.divide(globalPosition, globalPosition, [vpWidth, -vpHeight, 1]);
    // console.log('translate',globalPosition);
    mat4.translate(model, model, globalPosition);

    // console.log('translate',i,model);
    modelRef.set(uid,model)
  });
};
// reactive
export const onUpdate1= (gl:any, component:IComponent, camera:any, element:IElement) => {
  // console.log('update')
  const { uid } = element;
  if (component) {

    const { globalPosition, position } = component.translate3d;

    const parent = undefined; // element.parent ? LIBRARY.get(element.parent.uid) : undefined
    const parentGlobalPosition = parent ? parent.globalPosition : [0, 0, 0];
    const localPosition = position;

    const model =  getTable('model').get(uid);//mat4.clone(element.model);
    mat4.identity(model);

    const [vpX, vpY, vpWidth, vpHeight] = camera.viewport;

    vec3.add(globalPosition, parentGlobalPosition, localPosition);
  // normalize pixel space;
    vec3.divide(globalPosition, globalPosition, [vpWidth, -vpHeight, 1]);
    mat4.translate(model, model, globalPosition);
    // console.log('udpate', element.uid, model);
    // element.model = model;


  //  getTable('fontLoader').set(element.uid,{ texture:tex })
    return {model};
  // console.log('model::::',component,component.position,component.localPosition)
  // console.log('update model system')
    // return { translate3d:{ globalPosition, position } };
  // return { globalPosition, position };
  }

};
