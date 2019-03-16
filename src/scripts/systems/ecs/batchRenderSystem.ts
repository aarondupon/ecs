import * as mat4 from 'gl-mat4';
import * as createIndices from 'quad-indices';
import { IGeomComponent, IVertexArrayObject, IShader, IBuffer } from '../../components/ecs/geometryComponent';
import glShader from 'gl-shader';
import { isMainThread } from 'worker_threads';
const glBuffer =  require('gl-buffer');
const glVao = require('gl-vao');

declare interface IDrawData{

}

declare interface IElement{
  uid: string;
  model:mat4;
  projection:mat4;
  view:mat4;
}

declare interface IComponent{
  uid:string;
  geometryBatch:IGeomComponent;
  fontLoader:any;
  model:mat4;
}
declare interface IData{
  uid:string;
}

const cach:any = {}

// export const getComponentGroup = () => ([]);
export const getComponentGroup = () => (['geometryBatch','fontLoader','translate3d','model']);

const width  = window.innerWidth;
const height = window.innerHeight;



export const onUpdateGroup = (gl:WebGLRenderingContext, components:IComponent[], camera:any, elements:IElement[]) => {
    // console.log('batchrender:onUpdateGroup',components)


    camera.viewport = [0, 0, width, height];
    // camera.update();
    // set WebGL viewport to device size
  gl.viewport(0, 0, width * 2, height * 2);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.clearColor(0, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // eslint-disable-line no-bitwise
  // console.log('components',components)


    const buffersMerged:IVertexArrayObject = cach.buffersMerged || {
        index:{buffer:[] },
        // "position2D":{buffer:positions,type:'FLOAT',size:2,stride:2*4,offset:0},
        // update! keep it simple
        size:{ buffer:[],type:'FLOAT',size:1, stride:1*4, offset:0 },
      coord:{buffer:[],type:'FLOAT',size:2,stride:2 * 4,offset:0},
      position:{buffer:[],type:'FLOAT',size:2,stride:2 * 4,offset:0},
      color:{buffer:[],type:'FLOAT',size:3, stride: 3 * 4, offset:0 },
      instanceId:{ buffer:[], type:'FLOAT', size:1, stride: 1 * 4, offset:0 },
    }

   

  const uids = []

  const start = 0;
  if(!cach.buffersMerged){
  components.forEach((component, i) => {
    const element = elements[i];
    uids.push(element.uid)
    const { geometryBatch:geometry, fontLoader } = component;
    const { buffers, shaders }  = geometry;

        // console.log('buffersMerged.index.buffer.length',buffers.index.buffer.length/3,i,start)
    buffersMerged.index.buffer.push(...buffers.index.buffer);
    buffersMerged.size.buffer.push(...buffers.size.buffer);
    buffersMerged.coord.buffer.push(...buffers.coord.buffer);
    buffersMerged.position.buffer.push(...buffers.position.buffer);
    buffersMerged.color.buffer.push(...buffers.color.buffer);
    const count  = (buffersMerged.index.buffer.length / 3 * 2);
    buffersMerged.instanceId.buffer.push(...buffers.size.buffer.map(() => i))

    

  });


  

  const indices = createIndices({
    clockwise: true,
    type: 'uint16',
    count: buffersMerged.index.buffer.length / (3*2),
    start:0,
  });
  

  buffersMerged.index.buffer = indices;


  cach.buffersMerged = buffersMerged;

  }
 

    // console.log('buffersMergedbuffersMerged,',buffersMerged.instanceId)
  function createGeom(data) {

    const { buffers, shaders } = data;
         // enable derivatives for face normals
    const ext = gl.getExtension('OES_standard_derivatives');
    if (!ext) { throw new Error('derivatives not supported'); }

        // create all shaders from vertex en fragemnt

    const geoms:{shader:any, vao:any, length:number}[] = shaders.map(({ vert, frag }) => {
      const shader = glShader(gl, vert, frag);
      const { attributes } = shader;
      const _attributes = [];

          // per shader
      Object.keys(attributes).forEach((key, i) => {
            // set location (pointer) of attribute
        attributes[key].location = i;
            // read data from vao (array of vertex aray objects)
        if (!buffers[key]) {
          console.error(`BUFFER ERROR ${uids}: ${key}, is not in buffers. Element will not be drawn by draw2d behavior.`, buffers);
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

    return geoms[0];

  }

  const geom = cach.createGeomData || (cach.createGeomData = createGeom({ shaders:components[0].geometryBatch.shaders, buffers:buffersMerged }));
    // console.log('geomgeomgeom:',geom)

  const model = mat4.clone(elements[elements.length - 1].model);
    // console.log(elements)

  const { shader, vao, length } = geom;
  const fontLoader = components[0].fontLoader;

  const models = [];
  components.forEach((element, idx) => {
    const model = mat4.clone(element.model);
    const [vpX, vpY, vpWidth, vpHeight] = camera.viewport;
    const aspect = vpWidth / vpHeight;

    // set coordinate space to X-as = left Html , Y-as = top html
    const center = [-1, 1, 0];
    // const center = [-1+Math.random(), 1*idx/10, 0];

    mat4.translate(model, model, center);
    mat4.scale(model, model, [1, -1 * aspect, 1]);
    models.push(model);

  });

  if (fontLoader && fontLoader.texture && shader && length && models.length > 1) {

      // console.log('models::',models.length)

    shader.uniforms.model = models[0];
    shader.uniforms.models = models;

    shader.uniforms.projection = camera.projection;
    shader.uniforms.view = camera.view;
    if (!shader.binded) {
      shader.uniforms.uSampler =  fontLoader.texture.bind(0);
      shader.bind();
      shader.binded = true;
    }

    vao.bind();

          // gl.drawElements(gl.LINES, 16, gl.UNSIGNED_SHORT, index_buffer);
          // 522; <---
        //   console.log('drawme',length,fontLoader.texture)

    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    vao.draw(gl.TRIANGLES, length);
    gl.enable(gl.CULL_FACE);
    vao.unbind();

  }
//   console.timeEnd("concatenation");

};

export const task = (drawData:any, uid:string, complete, gl) => {
  // enable derivatives for face normals
  const ext = gl.getExtension('OES_standard_derivatives');
  if (!ext) {
    throw new Error('derivatives not supported');
  }
  return complete(drawData);
};
