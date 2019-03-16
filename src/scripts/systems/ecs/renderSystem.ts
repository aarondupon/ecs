import behavior from '../../system/helpers/behavior';
import { getComponent, getTable } from '../../system/helpers/system';
import * as mat4 from 'gl-mat4';

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
  // geometry:any[];
  geom:any[];
  // fontLoader:any;
  model:mat4;
}
declare interface IData{
  uid:string;
}


const geomsRef = getTable('geom');
// const fontLoaderRef = getTable('fontLoader');

// export const getComponentGroup = () => (['translate3d', 'geom', 'fontLoader']);

// export const getComponentGroup = () => ([]);
// export const getComponentGroup = () => (['geom','fontLoader','model']);
export const getComponentGroup = () => (['model']);

const width  = window.innerWidth;
const height = window.innerHeight;

export const onUpdateGroup = (gl:WebGLRenderingContext, components:IComponent[], camera:any, elements:IElement[]) => {
  
  camera.viewport = [0, 0, width, height];
    // camera.update();
    // set WebGL viewport to device size
  gl.viewport(0, 0, width * 2, height * 2);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.clearColor(0, 0.1, 0.1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // eslint-disable-line no-bitwise
  // return;
  // console.log('components',components)




  components.forEach((component, i) => {
    const element = elements[i];
    // const { model, geom, fontLoader } = component;

    const { uid } = element;
    const { model } = component;
    const geom = geomsRef.get(uid)
    // const fontLoader = fontLoaderRef.get(uid);
    // console.log('geom',geom)
    // if(!geom || !fontLoader) return;
    if(!geom) return;
    // console.log('renderSystem',component.model)

    // const model = mat4.clone(element.model);
    const [vpX, vpY, vpWidth, vpHeight] = camera.viewport;
    const aspect = vpWidth / vpHeight;

    // set coordinate space to X-as = left Html , Y-as = top html
    const center = [-1, 1, 0];
    mat4.translate(model, model, center);
    mat4.scale(model, model, [1, -1 * aspect, 1]);
    // console.log('model',model)
    
    // if (fontLoader && fontLoader.texture && model && geom && geom.length > 0) {
       
    //   const { texture } = fontLoader;
    if ( model && geom && geom.length > 0) {

      geom.forEach((geom, index:number) => {
      
        const { shader, vao, length } = geom;

      
        shader.uniforms.projection = camera.projection;
        shader.uniforms.view = camera.view;
        shader.uniforms.model = model;
          
      
        vao.bind();

          // gl.drawElements(gl.LINES, 16, gl.UNSIGNED_SHORT, index_buffer);
          // 522; <---
          // console.log('drawme',length)

        gl.disable(gl.CULL_FACE);
        gl.enable(gl.BLEND);
        // gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        vao.draw(gl.TRIANGLES, length);
        gl.enable(gl.CULL_FACE);
        vao.unbind();
        
      });
    }
  // console.timeEnd("concatenation");
  });

};

export const task = (drawData:any, uid:string, complete, gl) => {
  // enable derivatives for face normals
  const ext = gl.getExtension('OES_standard_derivatives');
  if (!ext) {
    throw new Error('derivatives not supported');
  }
  return complete(drawData);
};
