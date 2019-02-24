import { vec3, mat4 } from 'gl-matrix';
import glTexture2d from 'gl-texture2d';
import { Observable, concat , from } from 'rxjs';
import { concatMap, mergeMap, bufferCount, share, scan, first, tap } from 'rxjs/operators';
import behavior from '../../system/helpers/behavior';
import { getComponent, getTable } from '../../system/helpers/system';
import { Context } from 'vm';
// import * as loadFont from 'load-bmfont';
import * as img from 'img';
import { debug } from 'util';
import glShader from 'gl-shader';
import glGeometry from 'gl-geometry';
const glBuffer =  require('gl-buffer');
const glVao = require('gl-vao');

// export const LIBRARY = new Map<string, IFont>();

declare interface IElement{
  uid: string;
  behaviors:string[];
}

declare interface IGeom{

}

declare interface IGeomData{

}
function geom(geom) {
  
  return geom;
}
export const geomBehavior = behavior(geom);

// export const update = (gl:any, data:IGeom = {}, camera:any, element:IElement) => {

// };

export const task = (geomData:IGeomData, element:IElement, complete, gl) => {
  const {uid} = element;
  function createGeom(data) {

    const { buffers, shaders } = data;
     // enable derivatives for face normals
    const ext = gl.getExtension('OES_standard_derivatives');
    if (!ext) { throw new Error('derivatives not supported'); }

    // create all shaders from vertex en fragemnt
    
    const geoms = shaders.map(({ vert, frag }) => {
      const shader = glShader(gl, vert, frag);
      const { attributes } = shader;
      const _attributes = [];

      // per shader
      Object.keys(attributes).forEach((key, i) => {
        // set location (pointer) of attribute
        attributes[key].location = i;
        // read data from vao (array of vertex aray objects)
        if (!buffers[key]) {
          console.error(`BUFFER ERROR ${uid}: ${key}, is not in buffers. Element will not be drawn by draw2d behavior.`, buffers);
        }else {
          const { buffer, offset, stride, type } = buffers[key];

          // add vertex array Object to vertexArrayObject
          _attributes.push({
            buffer: glBuffer(gl, buffer),
            type: gl.FLOAT, // gl[type],
            size: stride / 4,
          });
        }
      });

      const _elements = glBuffer(gl,
                                 buffers.index.buffer, // new Uint16Array([0, 1, 2, 0, 2, 3]),
                                 gl.ELEMENT_ARRAY_BUFFER,
                                 gl.STATIC_DRAW);
        // debugger

      const vao = glVao(gl, _attributes, _elements); // ,_elements);

      // const stride = 12 , size = 3;
      // const length = buffers.index
      //   ? buffers.index.buffer.lengt
      //   : buffers.position.buffer.length / (buffers.position.stride/buffers.position.size);

      const length = buffers.position.buffer.length / (buffers.position.stride / buffers.position.size);
      console.log(
        'lengthlengthlength',
        (buffers.index.buffer.length / 3), length, 3 * 42, buffers.index.buffer.length);
      // if (length !== 552) {
      //   console.error(`vao.draw:error: ${length} !== 552,   ${buffers.index.buffer.length}`);
      // }
      return {
        length:buffers.index.buffer.length,
        shader,
        vao,
      };
    });

    
    return geoms;
  }
  
    const geom = createGeom(geomData);
    const geomsRef = getTable('geom');
    geomsRef.set(uid,geom)
    complete(geom);

    // const fontLoader = getComponent('fontLoader')(uid);
    // fontLoader.onTask(component=>{
    //   complete({texture:component.texture,geom});
    // })
  
 

};
