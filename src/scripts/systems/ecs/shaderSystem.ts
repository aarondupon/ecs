import behavior from '../../system/helpers/behavior';
import { getComponent, getTable } from '../../system/helpers/system';
import * as mat4 from 'gl-mat4';
import { IGeomComponent } from '../../components/ecs/geometryComponent';
import glShader from 'gl-shader';
import loadImages from '../../../lib/loader';
const glBuffer =  require('gl-buffer');
const glVao = require('gl-vao');
import glTexture2d from 'gl-texture2d';
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
  geometry:IGeomComponent;
  fontLoader:any;
}

// export const getComponentGroup = () => (['geometry', 'fontLoader']);
export const getComponentGroup = () => (['geometry']);

// export const getComponentGroup = () => ([]);


export const onUpdateGroup = (
  gl:WebGLRenderingContext, components:IComponent[],
  camera:any, elements:IElement[]) => {


  components.forEach((component, i) => {
    const element = elements[i];
    // console.log('elements:',elements.length)
    const { geometry, fontLoader } = component;
    const geom = createGeometry(geometry, element.uid, gl);
    const geomsRef = getTable('geom');
    geomsRef.set(element.uid,geom)
  //  debugger
    
  });

};



const createGeometry = (geomData:IGeomComponent, uid:string, gl:WebGLRenderingContext) => {

  function createGeom(data) {

    const { buffers, shaders } = data;
     // enable derivatives for face normals
    const ext = gl.getExtension('OES_standard_derivatives');
    if (!ext) { throw new Error('derivatives not supported'); }

    // create all shaders from vertex en fragemnt
    
    const geoms = shaders.map(({ vert, frag , uniforms}) => {
      
      
      const compiledShader = glShader(gl, vert, frag);
      const { attributes, types } = compiledShader;

      Object.keys(types.uniforms).forEach(key => {
        if(types.uniforms[key] === "sampler2D"){
          
         loadImages([uniforms[key].texture]).subscribe((images) => {
            const tex = glTexture2d(gl, images[0]);
            // var v = gl.getParameter(gl.ACTIVE_TEXTURE);
            // setup smooth scaling
            tex.bind();
            tex.generateMipmap();
            tex.minFilter = gl.LINEAR_MIPMAP_LINEAR;
            tex.magFilter = gl.LINEAR;
            // and repeat wrapping
            tex.wrap = gl.REPEAT;
            // minimize distortion on hard angles
            const ext = gl.getExtension('EXT_texture_filter_anisotropic');
            if (ext) {
              const maxAnistrophy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
              tex.bind();
              gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(16, maxAnistrophy));
            }

            compiledShader.uniforms[key] = tex.bind(0);
            compiledShader.bind();
            
            // shader.uniforms.uSampler =  texture.bind(0);
            // getTable('fontLoader').set(element.uid, { texture:tex });
            // complete({ texture:tex });
          });
          
        }
        
      });

      
      const _attributes = [];

      
      // per shader
      Object.keys(attributes).forEach((key, i) => {
        // set location (pointer) of attribute
        attributes[key].location = i;
        // if(key === 'instanceId'){
        //   const n = buffers.position.buffer.length/buffers.position.size;
        //   buffers[key] = Array(n).fill(0);
        // }
        // read data from vao (array of vertex aray objects)
        if (!buffers[key]) {
          console.error(`BUFFER ERROR ${uid}, key:${key}, is not in buffers object. Element will not be drawn by draw2d behavior.`, buffers);
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
        shader:compiledShader,
        vao,
      };
    });

    
    return geoms;
  }
  
  const geom = createGeom(geomData);
  return geom;
    // const geomsRef = getTable('geom');
    // geomsRef.set(uid,geom)
    // complete(geom);
};


export const task = (drawData:any, uid:string, complete, gl) => {
  // enable derivatives for face normals
  const ext = gl.getExtension('OES_standard_derivatives');
  if (!ext) {
    throw new Error('derivatives not supported');
  }
  return complete(drawData);
};
