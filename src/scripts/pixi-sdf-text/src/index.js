import Text from './text';

let vertShader = require('./sdf.vert');
let fragShader = require('./sdf.frag');


export class SDFRenderer  {

    constructor(renderer) {
        
        this.shader = null;
    }

    onContextChange() {
        var gl = this.renderer.gl;
        // gl.enable(gl.GL_POINT_SMOOTH);
        // gl.enable(gl.DEPTH_TEST);
        // this.shader = new PIXI.Shader(gl, vertShader, fragShader);
    }
    updateTexture(){
        
    }
    render(sdfText) {
        
        const renderer = this.renderer;
        const gl = renderer.gl;
        const texture = sdfText._texture;
        const font = sdfText._font;

        if (!texture || !texture.valid || !font) {
            return;
        }

        if (sdfText.styleID !== sdfText.style.styleID) {
            sdfText.updateText();
        }
        // sdfText.updateText();
        
        let glData = sdfText._glDatas[renderer.CONTEXT_UID];

        if (!glData) {
            renderer.bindVao(null);

            glData = {
                shader: this.shader,
                vertexBuffer: glCore.GLBuffer.createVertexBuffer(gl, sdfText.vertices, gl.STREAM_DRAW),
                uvBuffer: glCore.GLBuffer.createVertexBuffer(gl, sdfText.uvs, gl.STREAM_DRAW),
                indexBuffer: glCore.GLBuffer.createIndexBuffer(gl, sdfText.indices, gl.STATIC_DRAW),
                //aarondupon.be
                sizeBuffer: glCore.GLBuffer.create(gl,gl.ARRAY_BUFFER, sdfText.sizes, gl.STATIC_DRAW),
                // colorBuffer: glCore.GLBuffer.createVertexBuffer(gl, sdfText.colors, gl.STREAM_DRAW),
                colorBuffer: glCore.GLBuffer.create(gl,gl.ARRAY_BUFFER, sdfText.colors, gl.STATIC_DRAW),
                // build the vao object that will render..
                vao: null,
                dirty: sdfText.dirty,
                indexDirty: sdfText.indexDirty,
                positionDirty: sdfText.positionDirty,
            };
            // build the vao object that will render..
            glData.vao = new glCore.VertexArrayObject(gl)
                .addIndex(glData.indexBuffer)
                // aarondupon.be
                .addAttribute(glData.sizeBuffer,glData.shader.attributes.aVertexSize, gl.FLOAT, false, 2*4, 0) // stride needs 2*4 becaus of indexed vertex
                .addAttribute(glData.colorBuffer,glData.shader.attributes.aVertexColor, gl.FLOAT, false, 3 * 4, 0) // stride needs 2*4 becaus of indexed vertex
                .addAttribute(glData.vertexBuffer, glData.shader.attributes.aVertexPosition, gl.FLOAT, false, 2 * 4, 0)
                .addAttribute(glData.uvBuffer, glData.shader.attributes.aTextureCoord, gl.FLOAT, false, 2 * 4, 0);

            sdfText._glDatas[renderer.CONTEXT_UID] = glData;
        }

       

        if (sdfText.dirty !== glData.dirty) {
            glData.dirty = sdfText.dirty;
            glData.uvBuffer.upload(sdfText.uvs);
        }

        if (sdfText.indexDirty !== glData.indexDirty) {
            glData.indexDirty = sdfText.indexDirty;
            glData.indexBuffer.upload(sdfText.indices);
        }
        // console.log('dirty',sdfText.positionDirty,sdfText.dirty,sdfText.indexDirty)

        // if (sdfText.positionDirty !== glData.positionDirty) {
            glData.vertexBuffer.upload(sdfText.vertices);
            glData.positionDirty !== sdfText.positionDirty
        // }
        
        //aarondupon.be
        glData.sizeBuffer.upload(sdfText.sizes);
        glData.colorBuffer.upload(sdfText.colors);
        // end aaronddupon.be
        
        // console.log('eee')
        
        renderer.bindVao(glData.vao);
        renderer.bindShader(glData.shader);

        // if(!this.binded){
            glData.shader.uniforms.uSampler = renderer.bindTexture(texture);
        // }
        // if( texture.valid && this.__texture !== texture) {
        //     // renderer.bindTexture(texture,0,true)
        //     console.log('render bind fuck')
        //     glData.shader.uniforms.uSampler = renderer.bindTexture(texture);
        //       this.__texture = texture           
        // }
        // this.binded = true;
        

        
        renderer.state.setBlendMode(sdfText.blendMode);

        glData.shader.uniforms.translationMatrix = sdfText.worldTransform.toArray(true);
        glData.shader.uniforms.u_alpha = sdfText.worldAlpha;
        glData.shader.uniforms.u_color = 0xff00ff;//sdfText.style.fill;
        
        /** aarondupon.be remove this */
        glData.shader.uniforms.u_fontSize = 1;//sdfText.style.fontSize;
        glData.shader.uniforms.u_fontInfoSize = (font.info.size)// * PIXI.RESOLUTION;
        // console.log('glData.shader.uniforms.u_fontInfoSize',glData.shader.uniforms.u_fontInfoSize)
        // end aarondupon.be
        // glData.shader.uniforms.u_fontSize = sdfText.style.fontSize;
        // glData.shader.uniforms.u_fontInfoSize = sdfText.style.fontSize / font.info.size;
    
        glData.shader.uniforms.u_weight = sdfText.style.weight;

        //glData.shader.uniforms.tint = sdfText.tintRgb;

        const drawMode = sdfText.drawMode = gl.TRIANGLES;//gl.TRIANGLES;
        glData.vao.draw(drawMode, sdfText.indices.length, 0);
        
    }
}

PIXI.WebGLRenderer.registerPlugin('sdf', SDFRenderer);

PIXI.sdf = {};
PIXI.sdf.Text = Text;

