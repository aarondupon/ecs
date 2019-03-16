import component from '../../system/helpers/component';
import { vec3, mat4 } from 'gl-matrix';

export declare interface ItranslateComponent {
    position:vec3,
    globalPosition?:vec3;
}


function check(comp: ItranslateComponent): comp is ItranslateComponent {
  return ('position' in comp );
}

export function translate3d(state:ItranslateComponent) {
  if (state && !check(state)) {
    console.error(`model component: data ${state} is is not valid`, state);
  }else{
    const defaults = { 
      globalPosition: vec3.create(),
      position: vec3.create(),
      ...state,
    };
    return defaults;
  }
  return state;
}

export default component(translate3d);
