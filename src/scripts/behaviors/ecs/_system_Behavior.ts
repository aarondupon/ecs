import { vec3, mat4 } from 'gl-matrix';

export const update = (gl, element:any = {}, camera:any, uid:number) => {
    if(element.model){
        element.model = mat4.identity(element.model);
    }
    
}