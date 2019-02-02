
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

function draw(camera) {
    const {
      geo, shader, gl, model
    } = this;


    this.chidren && this.children.forEach((child) => {
        console.log('child', child);
        child.draw(camera);
    });

    const position = this.getPosition();
    mat4.identity(model);
    mat4.translate(model, model, position);
    const s = 0.5;
    const scale = [s, s, s];
    mat4.scale(model, model, scale);

    shader.bind();
    shader.uniforms.projection = camera.projection;
    shader.uniforms.view = camera.view;
    shader.uniforms.model = model;
    shader.uniforms.color = [1, 0, 0];
    // // draw the mesh
    geo.bind(shader);
    geo.draw(gl.POINTS);
    geo.unbind();
}

function draw2(camera) {
    const {
      geo, shader, gl, model
    } = this;
    debugger;
    const postion = this.getPosition();
    mat4.identity(model);
    mat4.translate(model, model, position);
    const s = 0.5;
    const scale = [s, s, s];
    mat4.scale(model, model, scale);

    shader.bind();
    shader.uniforms.projection = camera.projection;
    shader.uniforms.view = camera.view;
    shader.uniforms.model = model;
    shader.uniforms.color = [1, 0, 0];

    // // draw the mesh
    geo.bind(shader);
    geo.draw(gl.POINTS);
    geo.unbind();
}


const SDFTextContent = (gl, props = { width: 200 }) => {
    let dirty = 0;
    let indexDirty = 0;


 const createGeo = (gl) => {
    const shader = createShader(gl, vert, frag);
    const geo = createGeometry(gl);
    const ico = icosphere(2);

    const model = mat4.create();
    const s = 0.05;
    const scale = [s, s, s];

    geo.attr('positions', mesh.positions);
    geo.attr('cells', mesh.cells);

    let containerId = 0;
    const Container = function Container({ name }) {
        return Object.create(Container.prototype, {
            children: { value: GLNode.createChildren(), writable: false },
            type: { value: 'glContainer', writable: false },
            name: { value: name, writable: true },
            getId: { value: GLNode.getId },
            add: { value: GLNode.add },
            remove: { value: GLNode.remove },
            getParent: { value: GLNode.getParent },
            setParent: { value: GLNode.setParent },
            getChild: { value: GLNode.getChild },
            uid:  { value: `${containerId ++}`, writable: false },
        });
    };

    const createContainer = ({ child, name }) => {
        const container = Container({ name });
        child && container.add(child);
        return container;
    };
    let nodeId = 0;
    const createNode = (name) => {
        const Node = function Node() {
            return Object.create(Node.prototype, {
                name: { value: name, writable: true },
                type: { value: 'glNode', writable: false },
                uid:  { value: `${nodeId ++}`, writable: false },
            });
        };
        return Node(name);
    };

    // HOC
    const HOCTransforms = config => (InnerComponent) => {
        const Wrapped = (props) => {
            const inner = InnerComponent(props); // other
            const methodFuck = function () {
                return 'fuck';
            };
            const comp = Object.create(inner, {
                getPosition: { value: GLNode.getPosition },
                setPosition: { value: GLNode.setPosition },
            });
            return comp;
        };
        return Wrapped;
    };

    // pipeable
    const transforms = config => (inner) => {
            const methodFuck = function () {
                return 'fuck';
            };
            const comp = Object.create(inner, {
                getPosition: { value: GLNode.getPosition },
                setPosition: { value: GLNode.setPosition },
            });
            return comp;
    };

    // HOC function currying
    const createContainerWithTransforms = HOCTransforms({})(createContainer);
    const demo2 = createContainerWithTransforms({ child: createNode('aaron'), name: 'demo2' });
    const demo3 = HOCTransforms({})(createContainer)({ child: createNode('david'), name: 'main' });
    // compose right to left
    // compose sync
    const compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);
    var a = compose(
        transforms({}),
        createContainer,
    )({});

    /*
    <compose>
        <transforms />
        <colors />
    </compose>
    */


    // pipe left to right
    // pipe sync
    const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);
    var b = pipe(
        createContainer,
        transforms({}),
    )({});

    /*
    <pipe>
        <colors />
        <transforms />
    </pipe>
    */


    // async pipe
    const subject = new Subject();
    const observale = subject.pipe(
        map(createContainer),
        map(transforms({})));
    observale.subscribe(x => {
        console.log('xxxxxx', x);
        x.getPosition()
        // alert(x.name)
    });
    subject.next({child:createNode('david'),name:'main4'})
    /*
    <pipeAsync>
        <colors />
        <transforms />
    </pipeAsync>
    */




    const name2 = demo2.name;
    const type2 = demo2.type;
    const name3 = demo3.name;
    const type3 = demo3.type;
    const position2 = demo2.getPosition();
    const position3 = demo3.getPosition();


    // node -> has a: container -> has a: -> element --> has a: transform

    // const node = compose(createContainer,createNode,createTransform)


    const Node = function () {};

    const obj = Object.create(Node.prototype,
        {
            children: { value: GLNode.children, writable: false },
            name: { value: 'glNode', writable: false },
            getId: { value: GLNode.getId },
            add: { value: GLNode.add },
            remove: { value: GLNode.remove },
            getParent: { value: GLNode.getParent },
            setParent: { value: GLNode.setParent },
            getChild: { value: GLNode.getChild },
            getPosition: { value: GLNode.getPosition },
            setPosition: { value: GLNode.setPosition },
            geo: { value: geo },
            shader: { value: shader },
            gl: { value: gl },
            model: { value: model },
            draw: { value: draw }
        });

    return obj;
  };

  const createGeo2 = (gl) => {
    const shader = createShader(gl, vert, frag);
    const geo = createGeometry(gl);
    const ico = icosphere(2);

    const model = mat4.create();
    const s = 0.05;
    const scale = [s, s, s];

    geo.attr('positions', mesh2.positions);
    geo.attr('cells', mesh2.cells);

    const Node = function () {};
    return Object.create(Node.prototype,
        {
            name: { value: 'aaron', writable: false },
            getId: { value: GLNode.getId },
            add: { value: GLNode.add },
            remove: { value: GLNode.remove },
            getParent: { value: GLNode.getParent },
            setParent: { value: GLNode.setParent },
            getChild: { value: GLNode.getChild },
            getPosition: { value: GLNode.getPosition },
            setPosition: { value: GLNode.setPosition },
            geo: { value: geo },
            shader: { value: shader },
            gl: { value: gl },
            model: { value: model },
            draw: { value: draw2 }
        });
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
        const node = createGeo(gl, styles);


        const assets = loadAssets(styles, (font, image) => {
            // const text =  'Hi I am a computer, taking over the world!';
            // const buffers = createBuffers(styles,text,font)
            // const mesh = {
            //     positions:buffers.positions
            // }
            // const textGeo = createTextMesh(gl,mesh);
            const square = createGeo2(gl);
            node.add(square);

            console.log(node);
            // glElement.source(SDFTextContent(gl, props));
        });


        // compose return object
        return node;
  };

  return create(gl);
};


export default function create(gl, props = {}) {
    return SDFTextContent(gl, props);
  }
