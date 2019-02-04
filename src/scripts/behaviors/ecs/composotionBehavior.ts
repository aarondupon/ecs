import { vec3, mat4 } from 'gl-matrix';

const LIBRARY = new Map<number, any>();
declare interface Itranslate{
  position:vec3;
}
export const update = (gl, element:any = {}, camera:any, uid:number) => {

  if (!LIBRARY.get(uid)) {
    // const position = element.position || vec3.create();
    // element.model = element.model || mat4.create();
    const children = element.children || [];
    const parent = element.parent || undefined;
    element.model = element.model || mat4.create();
    LIBRARY.set(uid, {children,parent,worldPosition:vec3.create()});

    

  }
  

  // //update 
    const {children,parent,worldPosition} = LIBRARY.get(uid);
    
    if(element.parent){
      const model = element.model;
      const parentPosition = element.parent.position;
      vec3.add(worldPosition,parentPosition, element.position)
      mat4.identity(model);
      mat4.translate(model, model, worldPosition);
      //update model
      element.shaders.forEach(shader => {
        shader.uniforms.model = model;
      });
    }
   
    

    // LIBRARY.set(uid, {children,parent,transforms:worldTransform});


    // children.forEach(child => {
    //   if(child.worldTranslate){
    //      vec3.add(worldTranslate,worldTranslate,child.position);
    //     LIBRARY.set(child.uid, {worldTranslate:worldTranslate}) 
    //   }
    // });
    
    // console.log('newtransfroms',newtransfroms)
};

export function setTranslate(element:Itranslate, position: vec3): vec3 {
  element.position = position;
}

export function   getTranslate(element:Itranslate): vec3 {
// Defensive clone
  return vec3.clone(element.position);
}

/**
 * composable behavior for craeteElement pipeline
 * @param specs optioal specifications on initialize behavior
 */
const compositionBehavior = (specs:any = {}) => (metods:any) => {
  const comp =  {
    children:[],
    parent:undefined,
    ...metods,
    translate: 'compositionBehavior',
  };
  return comp;
};

export const rule = (element) => (typeof element.children || element.parent)

export default compositionBehavior;
