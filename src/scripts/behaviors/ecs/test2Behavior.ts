import behavior from '../../system/helpers/behavior';
import { getComponent } from '../../system/helpers/system';
import mat4 from 'gl-mat4';

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
  uid:string;
}
declare interface IData{
  uid:string;
}
function test2(data:IData) {
  // debugger
    return data;
}
export const test2Behavior = behavior(test2);

const goemsRef = getComponent('geom')
const fontLoaderRef = getComponent('fontLoader');

export const update = (gl:WebGLRenderingContext, component:IComponent, camera:any, element:IElement) => {
  // const { geoms, shaders } = data;
  // const before = window.performance.now();
  // return

  const { uid } = element;
  const geoms = goemsRef(uid).data;
  const fontLoader = fontLoaderRef(uid).data;

  const model = mat4.clone(element.model);
  const [vpX,vpY,vpWidth,vpHeight] = camera.viewport;
  const aspect = vpWidth/ vpHeight;

  // set coordinate space to X-as = left Html , Y-as = top html
  const center = [-1, 1, 0];
  mat4.translate(model, model, center);
  mat4.scale(model, model, [1, -1 * aspect, 1]);
  
  if (fontLoader && fontLoader.texture) {
    const { texture } = fontLoader;
    geoms.forEach((geom, index:number) => {
      const { shader, vao, length } = geom;
      // const uniforms =  shader.uniforms;
 
  
      // vao.bind();
      shader.bind();
      shader.uniforms.model = model; // element.model;
      shader.uniforms.projection = camera.projection;
      shader.uniforms.view = camera.view;
      !shader.binded && (shader.uniforms.uSampler =  texture.bind(0));
     
      
      vao.bind();
     

        // gl.drawElements(gl.LINES, 16, gl.UNSIGNED_SHORT, index_buffer);
        // 522; <---
        // console.log('drawme',length)

      gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      vao.draw(gl.TRIANGLES, length);
      gl.enable(gl.CULL_FACE);
      vao.unbind();
      shader.binded = true;
    });
  }
  // console.timeEnd("concatenation");

};

export const task = (drawData:any, uid:string, complete, gl) => {
  // enable derivatives for face normals
  const ext = gl.getExtension('OES_standard_derivatives');
  if (!ext) {
    throw new Error('derivatives not supported');
  }
  return complete(drawData);
};
