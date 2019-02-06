
import { mat4 } from 'gl-matrix';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { elementAt, share } from 'rxjs/operators';
import glShader from 'gl-shader';
import glGeometry from 'gl-geometry';
const glBuffer =  require('gl-buffer');
const glVao = require('gl-vao');


declare interface IDrawObject{
  geo?:any;
  gl?:any;
  model?:any;
  shaders?:any;
  complex?:any;
  drawMode?:any;
  buffers?:any;
}

declare interface IShader{
  uniforms?:any;
  bind:any;
}

const DRAW_LIBRARY = new Map<number, any>();

// export const rule = (element)=>{
//      return element.shaders && element.behaviors.includes('draw') 
// }   

/**
 * updat function draws data to screen
 * @param gl 
 * @param element 
 * @param camera 
 * @param uid 
 */
export const update = (gl, element:IDrawObject = {}, camera:any, uid:number) => {


  if (!DRAW_LIBRARY.get(uid)) {
    const {buffers} = element;
    const {vert,frag} = element.shaders[0]
    const shader = glShader(gl,vert,frag);

    
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

        const vao = glVao(gl, _attributes);
        console.log('_attributes',vao)
        return {
            shader,
            vao,
        }
    });


    
    
    shader.attributes.position.location = 0;
    shader.attributes.color.location = 1;
    const stride = 12 , size = 3;
    const length = ((buffers.position.buffer.length )/ (stride/size));

    
    // 42
    const vao = glVao(gl, [
        // { 
        //     "buffer": glBuffer(gl, [-1, 0, 0, -1, 1, 1]),
        //     "type": gl.FLOAT,
        //     "size": 2,
        // },
        { 
            "buffer": glBuffer(gl, buffers.position.buffer),
            "type": gl.FLOAT,
            "size": 3 ,
        },
        { 
            "buffer": glBuffer(gl,buffers.colors.buffer),
            "type": gl.FLOAT,
            "size": 3 ,
        },
        
        
      ]);

    //   debugger
    DRAW_LIBRARY.set(uid, { geoms,shader,vao });
    console.log('_attributes',vao)
  }


  const { shader, vao,geoms } = DRAW_LIBRARY.get(uid);
  

//   geoms.forEach((geom,index:number) =>{
//     const {shader,vao} = geom;
//     const uniforms =  element.shaders[index].uniforms;
//     Object.assign(shader.uniforms, uniforms);
//     // shader.uniforms.model = element.model;
//     // shader.uniforms.projection = camera.projection;
//     // shader.uniforms.view = camera.view;
//     // shader.uniforms.color = [1, 0, 0];

  
//     shader.bind();
//     vao.bind();
//     vao.draw(gl.POINST);
//     vao.unbind();
// })

  //Bind the shader
  shader.bind()

  //Bind vertex array object and draw it
  vao.bind();
  vao.draw(gl.POINST,3*42);

  //Unbind vertex array when fini
  vao.unbind();
  

};
