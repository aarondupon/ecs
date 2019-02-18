
// import './pixi-sdf-text/src';
// /<reference path="./create-sdfcontent-text/create-sdfcontent-text.d.t" />

import createGeometry from 'gl-geometry';
import createShader from 'gl-shader';
import mat4 from 'gl-mat4';
import icosphere from 'icosphere';
import * as loadFont from 'load-bmfont';
import * as loadImage from 'img';
import createIndices from 'quad-indices';
import { Subject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import vert from './shaders/sdf.vert';
import frag from './shaders/sdf.frag';
import createStyle from './create-style';
import createLayout from './create-layout';
import createStyleIndex from './create-style-index';
import * as vertices from './vertices';
import addBehavior from '../compose/operators/addBehavior';
import createESCElement from '../compose/createESCElement';
import registerElement from '../compose/registerElement';
import { buffer } from 'rxjs-compat/operator/buffer';
import {fontLoaderBehavior,test2Behavior,geomBehavior,translate3dBehavior,rotate3dBehavior,scale3dBehavior}  from '../behaviors';
const stringify = require("json-stringify-pretty-compact");
var createTexture = require("gl-texture2d");
// var baboon        = require("baboon-image")

// ECS -> MVC
const mesh = {
  positions: [
    [0.0, 0.0, 0.0],
    [1.5, 0.0, 0.0],
    [1.5, 1.5, 0.0],
    [0.0, 1.5, 0.0]
  ],
  cells: [
    [0, 1, 2],
    [1, 2, 3],
    [1, 2, 3],
    [1, 2, 3]
  ]
};
const mesh2 = {
    positions: [
      [0.0, 0.0, 0.0],
      [1.5, 0.0, 0.0],
      [1, 2, 0.0],
      [0.0, 1.5, 0.0]
    ],
    cells: [
      [0, 1, 2],
      [1, 2, 3],
      [1, 2, 3],
      [1, 2, 3]
    ]
  };

const myStyles = {
    default: {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: 'rgba(0,255,255,1)',
        wordWrap: 'break-word',
        width: 100
        // align: "right"
    },
    ml: {
        fontStyle: 'italic',
        color: '#ff8888',
        // fontSize:60,
    },
    ms: {
        fontStyle: 'italic',
        color: '#4488ff',
    },
    pixi: {
        fontSize: '304px',
        color: '#efefef'
    },
    p: {
        fontStyle: 'italic',
        color: '#efefef'
    },
    a: {
        color: 'rgba(255,255,0,1)',
        fontSize: 60,

    },
};


function loadAssets(style, cb) {
    loadFont(style.default.fontURL, (err, font) => {
        loadImage(style.default.imageURL, {}, (error, image) => {
            if (error) {
                console.error(error);
            }
            
            cb(font, image);
        });
      });
}

const createNullObject = (gl) => {
    const shader = createShader(gl, vert, frag);

    const geo = createGeometry(gl);
    const ico = icosphere(2);

    const model = mat4.create();
    const s = 0.05;
    const scale = [s, s, s];

    geo.attr('positions', mesh.positions);
    geo.attr('cells', mesh.cells);

    const comp = createESCElement(
        addBehavior('draw','composition'),
        )({});
    return registerElement(comp)
};

const fakeCamera = window.camera;

const createSquare = (rect= [1.,1.]) => {
    // const shader = createShader(gl, vert, frag);
    // const geo = createGeometry(gl);
    const model = mat4.create();
    const s = 0.5;
    // const scale = [s, s, s];
    // const {width:viewWidth,height:viewHeight} = gl.canvas


    const x2 = rect[0]* 1 ;// * planeHeightAtDistance ;
    const y2 = rect[1] * 1;// * planeWidthAtDistance ;
    
    const complex = {
            cells:[
                [0, 1, 2],
                [1, 2, 3],
                [1, 2, 3],
                [1, 2, 3]
              ],
            positions:  [
                [0.0,       0.0,    0.0],
                [x2,         0.0,    0.0],
                [x2,         y2,    0.0],
                [0.0,        y2,    0.0]
            ]
        }

    const sphere = {
    complex,
    position: [0, 0, 0],
    scale: [1,1,1],
    drawMode: ['POINTS'],
    shaders: [
        {
            vert,
            frag,
            uniforms: {
                projection: new Float32Array(16),
                view: new Float32Array(16),
                model, // our model-space transformations
                
            },
           
        }]
    };
    // geo.attr('positions', mesh.positions);
    // geo.attr('cells', mesh.cells);
    // geo.attr('scale', scale);

    const comp = createESCElement(
        addBehavior('draw','composition'),
        )(sphere);
    
    return comp
};


const createTextObject =(buffers,width) => {
  
    const model = mat4.create();
    const position = [100,100, 0];
    const scale = [1, 1];
    
    const baseObj = {
        uid:'text-component',
        projection: new Float32Array(16),
        view: new Float32Array(16),
        model, // our model-space transformations  
    }
    
    /*
    <ESCElement>
        <fontLoader/>
        <geomBehavior />
        <translate3dBehavior rotation={[100,100,0]} />
        <rotate3dBehavior position={[1,1,0]} />
        <scale3dBehavior rotation={[1,1,1]} />
        <test2Behavior />
    </ESCElement>
    */

    /*
    <Identety autoRender={true} >
        <fontLoaderComponent/>
        <geomComponent />
        <translate3dComponent rotation={[100,100,0]} />
        <rotate3dComponent position={[1,1,0]} />
        <scale3dComponent rotation={[1,1,1]} />
        <test2Component />
    </Identety>
    */
    
    const comp =  createESCElement(
        fontLoaderBehavior({
            font: '/public/fonts/din/DIN-Regular.fnt',
            image: '/public/fonts/din/DIN-Regular.png',
            }),
        geomBehavior({
            buffers,
            shaders:[
                {
                vert,
                frag,
                uniforms: {
                    uSampler:'texture',// = renderer.bindTexture(texture);
                    uAlpha:1,
                    uColor:0xff00ff,
                    uFontSize:1,//sdfText.style.fontSize;
                    uFontInfoSize:42,//font.info.size)// * PIXI.RESOLUTION;
                    // u_weight:sdfText.style.weight;
                    }
                }]}),
        translate3dBehavior({
            position:[100,100,0],
        }),
        rotate3dBehavior({
            rotation:[0,0,0],
        }),
        scale3dBehavior({
            scale:[1,1,1]
        }),
        test2Behavior({ // drawing
        }),
        // addBehavior('composition'),//,'test'),
    )(
        baseObj  
    );

    return comp;
    
  };

  const createVertexArrayObject = (style, text, font) => {
        const flatCopyStyle = {};
        Object.keys(style).forEach(key => {
            flatCopyStyle[key] = style[key].getFlatCopy();
        });
       
        const opt = {
            text: text.replace(/(\u00AD)/g, '\uE000'),
            font,
            styles: flatCopyStyle,
            width: flatCopyStyle.default.width,
        };

        if (opt.wordWrapWidth) {
            opt.width = opt.wordWrapWidth;
        }

        if (!opt.font) {
            throw new TypeError('must specify a { font } in options');
        }
        
        // get visible glyphs
        const stylesIndexs = createStyleIndex(opt);
        
        // LAYOUT ---> REPLACE!
        const layout = createLayout(opt, stylesIndexs);
        if((String(stylesIndexs.styles[0].style.lineHeight).indexOf('em') > -1)) {
            console.error(`lineHeight: IS NOT A NUMBER:
                stylesIndexs.styles[0].style =`,stylesIndexs.styles[0].style.lineHeight)
        }
        
        // get vec2 texcoordsz
        const flipY = opt.flipY !== false;
        // the desired BMFont data
        // determine texture size from font file
        const texWidth = font.common.scaleW;
        const texHeight = font.common.scaleH;
        const glyphs = layout.glyphs;


       
        const sizes = vertices.sizes(opt, stylesIndexs);

        // get common vertex data
        const positions = vertices.positions(glyphs, sizes, font.info.size);

       
        const uvs = vertices.uvs(glyphs, texWidth, texHeight, false);

        const colors = vertices.colors(opt, stylesIndexs);

        
        var a  = []
        const b = [...positions];
        let i = 0;
        while(i < b.length){
            a.push(...(b.slice(i,i+2)),0);
                i += 2;
        }

        // const positionsXYZ = a.map(x=>x/(window.innerWidth*100)*8)//a
        const positionsXYZ = b.map(x=>x/(window.innerWidth*100)*8)//a
        
        /*
        .addIndex(glData.indexBuffer)
        // aarondupon.be
        .addAttribute(glData.sizeBuffer,glData.shader.attributes.aVertexSize, gl.FLOAT, false, 2*4, 0) // stride needs 2*4 becaus of indexed vertex
        .addAttribute(glData.colorBuffer,glData.shader.attributes.aVertexColor, gl.FLOAT, false, 3 * 4, 0) // stride needs 2*4 becaus of indexed vertex
        .addAttribute(glData.vertexBuffer, glData.shader.attributes.aVertexPosition, gl.FLOAT, false, 2 * 4, 0) // stride needs 2*4 becaus of indexed vertex   (number of coords * 4->beceause it's stored as float)
        .addAttribute(glData.uvBuffer, glData.shader.attributes.aTextureCoord, gl.FLOAT, false, 2 * 4, 0);
        */
       
     



        const indices = createIndices({
            clockwise: true,
            type: 'uint16',
            count: glyphs.length
        });
     
        
       
        const styleID = style.styleID;
        
        // const colors = new Float32Array(colors);
        // const vertices = new Float32Array(positions);

        // const uvs = new Float32Array(uvs);
        // aarondupon.be
        // const sizes = new Float32Array(sizes);
        // console.log(uvs)

        //vertexArrayObject with buffers
       const buffers = {
            "index":{buffer:indices},
            // "position2D":{buffer:positions,type:'FLOAT',size:2,stride:2*4,offset:0},
            // update! keep it simple
            "size":{buffer:sizes,type:'FLOAT',size:1,stride:1*4,offset:0},
            "coord":{buffer:uvs,type:'FLOAT',size:2,stride:2*4,offset:0},
            "position":{buffer:positionsXYZ,type:'FLOAT',size:2,stride:2*4,offset:0},
            "color":{buffer:colors,type:'FLOAT',size:3,stride: 3*4,offset:0},
        } 
        return buffers
    };

const SDFTextContent = (gl, props = { width: 200 }) => {
    let dirty = 0;
    let indexDirty = 0;


    const create = gl => {
        const styles = createStyle(myStyles)//, { width: 200, breakWords: true });
      
        const nullObj = {
            position: [0, 0, 0],
            };

        const node = createESCElement(addBehavior('translate'))(nullObj);
        
        // registerElement(node)
        const assets = loadAssets(styles, (font, image) => {
           
            const txt =  'A new trailer for The Wandering Earth <a>shows</a> off a desperate plan to save the planet';//'Hi I <a>am a computer</a>, taking over the world!';
            const vao = createVertexArrayObject(styles,txt,font)     

            const text = createTextObject(vao,props.width);

            // console.log(stringify(text,{maxLength: 1, indent: 1}))
            const registration =  registerElement(text);
            
            // registration.unregister()
            // setTimeout(()=>registration.unregister(),1000);

     
            const square = createSquare();
            // console.log('text:square',stringify(square))
            // registerElement(square)
        });
        // compose return object
        return node;
  };

  return create(gl);
};


export default function create(gl, props = {}) {
    return SDFTextContent(gl, props);
  }
