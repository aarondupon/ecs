
import { mat4 } from 'gl-matrix';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { elementAt, share } from 'rxjs/operators';
import glShader from 'gl-shader';
import glGeometry from 'gl-geometry';
const glBuffer =  require('gl-buffer');
const glVao = require('gl-vao');



declare interface IDrawObject{

  gl?:any;
  model?:any;
  shaders?:any;
  drawMode?:any;
  buffers?:any;

}

declare interface IShader{
  uniforms?:any;
  bind:any;
}

const DRAW_LIBRARY = new Map<number, any>();


/**
 * updat function draws data to screen
 * @param gl
 * @param element
 * @param camera
 * @param uid
 */
export const update = (gl, element:IDrawObject = {}, camera:any, uid:number) => {

  if (!DRAW_LIBRARY.get(uid)) {
    const { buffers } = element;
     // enable derivatives for face normals
    const ext = gl.getExtension('OES_standard_derivatives');
    if (!ext) { throw new Error('derivatives not supported'); }

    
    // create all shaders from vertex en fragemnt
    const geoms = element.shaders.map(({ vert, frag }) => {
      const shader = glShader(gl, vert, frag);
      const {attributes} = shader;
      const _attributes = [];
      
      
      // per shader
      Object.keys(attributes).forEach((key, i) => {
        // set location (pointer) of attribute
        attributes[key].location = i;
        // read data from vao (array of vertex aray objects)
        if(!buffers[key]){
          console.error(`BUFFER ERROR ${uid}: ${key}, is not in buffers. Element will not be drawn by draw2d behavior.`,buffers)
        }else{
          const { buffer, offset, stride, type } = buffers[key];
          
          // add vertex array Object to vertexArrayObject
          _attributes.push({
            buffer: glBuffer(gl, buffer),
            type: gl.FLOAT,//gl[type],
            size: stride / 4,
          });
        }
      });

      // gl.drawElements(type, size || this.indexBuffer.data.length, gl.UNSIGNED_SHORT, (start || 0) * 2 );
      // const _elements =  buffers.index ?  glBuffer(gl,buffers.index.buffer) : undefined
      // debugger
      // new Uint16Array([0, 1, 2, 0, 2, 3])
      const _elements = glBuffer(gl, 
        buffers.index.buffer,//new Uint16Array([0, 1, 2, 0, 2, 3]), 
        gl.ELEMENT_ARRAY_BUFFER,
        gl.STATIC_DRAW)
        // debugger
        
        const vao = glVao(gl, _attributes);//,_elements);
      
      // const stride = 12 , size = 3;
      // const length = buffers.index 
      //   ? buffers.index.buffer.lengt
      //   : buffers.position.buffer.length / (buffers.position.stride/buffers.position.size);

        const length = buffers.position.buffer.length / (buffers.position.stride/buffers.position.size);
      console.log('lengthlengthlength',length,3*42,buffers.index.buffer.length)
      if(length !== 552 ){
        console.error(`vao.draw:error: ${length} !== 552,   ${buffers.index.buffer.length}`)
      }
      return {
        length,
        shader,
        vao,
      }
    });

    

    DRAW_LIBRARY.set(uid, {  geoms });

  }


  
  

  const { geoms } = DRAW_LIBRARY.get(uid);

  geoms.forEach((geom,index:number) =>{
      const {shader, vao, length} = geom;
      const uniforms =  element.shaders[index].uniforms;
      Object.assign(shader.uniforms, uniforms);
      // shader.uniforms.model = element.model;
      // shader.uniforms.projection = camera.projection;
      // shader.uniforms.view = camera.view;
      // shader.uniforms.color = [1, 0, 0];

    
      shader.bind();
      vao.bind();

      // gl.drawElements(gl.LINES, 16, gl.UNSIGNED_SHORT, index_buffer);
      // 522; <---
    
      vao.draw(gl.TRIANGLES,length);
      vao.unbind();
  })

};
