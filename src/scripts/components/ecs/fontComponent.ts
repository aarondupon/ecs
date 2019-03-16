import component from '../../system/helpers/component';
import * as mat4 from 'gl-mat4';

export declare interface IModel extends mat4 {}


function check(comp: IModel): comp is IModel {
  return ('identity' in comp && 'clone' in comp);
}

export function font(modelMatrix:IModel) {
  if (modelMatrix && !check(modelMatrix)) {
    console.error(`model component: data ${modelMatrix} is is not valid`, modelMatrix);
  }else{
    return mat4.create();
  }
  
  return modelMatrix;
}

export default component(font);
