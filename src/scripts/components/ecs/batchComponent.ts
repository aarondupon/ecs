import component from '../../system/helpers/component';
import * as mat4 from 'gl-mat4';

export declare interface IModel {
  batchGroupId:number;
}


function check(comp: IModel): comp is IModel {
  return ('batchGroupId' in comp);
}

export function batch(batch:IModel) {
  if (batch && !check(batch)) {
    console.error(`model component: data ${batch} is is not valid`, batch);
  }else{
    return {
      batchGroupId:-1,
    };
  }
  
  return batch;
}

export default component(batch);
