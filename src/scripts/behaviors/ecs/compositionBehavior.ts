import { vec3, mat4 } from 'gl-matrix';

const LIBRARY = new Map<number, any>();
declare interface Itranslate{
  position:vec3;
}

function toDeg(r) {
  return r * 180 / Math.PI;
}

function toRad(d) {
  return d * Math.PI / 180;
}
export const update = (gl, element:any = {}, camera:any, uid:number) => {

  if (!LIBRARY.get(uid)) {
    // const position = element.position || vec3.create();
    // element.model = element.model || mat4.create();
    const children = element.children || [];
    const parent = element.parent || undefined;
    element.model = element.model || mat4.create();
    LIBRARY.set(uid, { children, parent ,
      globalPositon:vec3.create(),
      globalRotation:vec3.create(),
      globalScale:vec3.create()
     });

  }

  // // //update
  const { globalPositon, globalRotation, globalScale } = LIBRARY.get(uid);
  const parent = element.parent ? LIBRARY.get(element.parent.uid) : undefined;
  const parentGlobalPosition = parent ? parent.globalPositon : [0, 0, 0];
  const parentGlobalRotation = parent ? parent.globalRotation : [0, 0, 0];
  const parentGlobalScale = parent ? parent.globalScale : [1, 1, 1];
  const localPosition:vec3 = element.position || vec3.create();
  const localRotation:vec3 = element.rotation || vec3.create();
  const localScale:vec3 = element.scale || vec3.fromValues(1, 1, 1);

  // transform
  const m = mat4.clone(element.model );
  mat4.identity(m);
  vec3.add(globalPositon, parentGlobalPosition, localPosition);
  mat4.translate(m, m, globalPositon);

  // // rotation
  mat4.rotate(m, m, toDeg(localRotation[0]), [1, 0, 0]);
  mat4.rotate(m, m, toDeg(localRotation[1]), [0, 1, 0]);
  mat4.rotate(m, m, toDeg(localRotation[2]), [0, 0, 1]);


  // // scale
  vec3.multiply(globalScale, parentGlobalScale, localScale);
  mat4.scale(m, m, globalScale);

  element.model = m;

  // LIBRARY.set(uid, { globalPositon, globalRotation, globalScale });
};