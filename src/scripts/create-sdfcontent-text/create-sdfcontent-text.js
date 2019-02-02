
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
import vert from './shaders/basic.vert';
import frag from './shaders/basic.frag';
import GLElement from '../GLElement';
import * as GLNode from '../GLNode';
import createStyle from './create-style';
import createLayout from './create-layout';
import createStyleIndex from './create-style-index';
import * as vertices from './vertices';
import { createContainer, composeContainer } from '../GLContainer';
import { draw, translate, composition } from '../behaviors';
import createElement from '../compose/createElement';
import registerElement from '../compose/registerElement';
import pipe from '../compose/pipe';
import compose from '../compose/compose';

const createRegisterdElement = (...behaviors) => (props) =>{
    const element = createElement(...behaviors)(props)
    return registerElement(element)
}

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


const SDFTextContent = (gl, props = { width: 200 }) => {
    let dirty = 0;
    let indexDirty = 0;
    const createNullObject = (gl) => {
        const shader = createShader(gl, vert, frag);
        const geo = createGeometry(gl);
        const ico = icosphere(2);

        const model = mat4.create();
        const s = 0.05;
        const scale = [s, s, s];

        geo.attr('positions', mesh.positions);
        geo.attr('cells', mesh.cells);

        return createRegisterdElement(
            composition(),
            translate(),
            )({});
    };
    const createSquare = (gl) => {
        const shader = createShader(gl, vert, frag);
        const geo = createGeometry(gl);
        const ico = icosphere(2);

        const model = mat4.create();
        const s = 0.05;
        const scale = [s, s, s];

        geo.attr('positions', mesh.positions);
        geo.attr('cells', mesh.cells);

        return createRegisterdElement(
            composition(),
            translate(),
            draw({
                shader, geo, model, gl,
                })
            )({});
    };
  const createTextMesh = (gl, mesh) => {
    const shader = createShader(gl, vert, frag);
    const geo = createGeometry(gl);
    const ico = icosphere(2);
    geo.attr('positions', mesh.positions);
    // geo.attr('cells', mesh.cells);
    const position = [0, 0, 0];
    const scale = [1, 1];
    const glElement = GLElement.from(geo);
    return { geo, shader, glElement };
  };

  const createBuffers = (style, text, font) => {
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
        // get vec2 texcoords
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
        dirty++;
        indexDirty++;

        return {
        sizes, uvs, colors, positions
        };
    };
    const create = gl => {
        const styles = createStyle(myStyles, { width: 200, breakWords: true });
        const node = createElement(composition())();
        const assets = loadAssets(styles, (font, image) => {
            // const text =  'Hi I am a computer, taking over the world!';
            // const buffers = createBuffers(styles,text,font)
            // const mesh = {
            //     positions:buffers.positions
            // }
            // const textGeo = createTextMesh(gl,mesh);
            const square = createSquare(gl);

            const text = createSquare(gl);
            if (node.add) {
                node.add(square);
                node.add(text);
            }
        });
        // compose return object
        return node;
  };

  return create(gl);
};


export default function create(gl, props = {}) {
    return SDFTextContent(gl, props);
  }
