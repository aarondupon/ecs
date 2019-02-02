import {Observable} from 'rxjs/Observable'
import createStyles, {createCharStyles} from '../../style-bmfont-text';
import TextStyle from './text-style';

import * as shaderCode from './sdf.frag';
let Mesh = PIXI.mesh.Mesh;
let loadFont = require('load-bmfont');
let createLayout = require('../../layout-bmfont-text/old');

let createIndices = require('quad-indices');
let vertices = require('./lib/vertices');

const getValue = (value) => typeof value === 'number' 
    ? {group:`${value}px`,value,unit:'px'} 
    : [(/([+-]?\d*\.?\d+)\s?(px|em|ex|%|in|cn|mm|pt|pc+)/gim).exec(value)]
      .map(x=>( x ? {group:x[0],value:x[1],unit:x[2]} : { } ))[0];

const camelCased = (myString) => myString.replace(/-([a-z])/g, (g) => { return g[1].toUpperCase(); });

export default class Text extends PIXI.mesh.Mesh {
  constructor(text, style = {}) {
    super(style.texture);

    let cs = window.getComputedStyle(document.body, null);
    this.documentStyle = [
      'font-size',
      'font-weight',
      'line-height',
      'letter-spacing'
    ].reduce((style, property) => {
      let result = getValue(cs.getPropertyValue(property));
      if (result) {
        style[camelCased(property)] = result.value;
      }
      return style;
    }, {});

    this.style = style;
    this._text = text;
    this.pluginName = 'sdf';
    this.loadAssets();
  }

  loadAssets() {
    // default font
    loadFont(this.style.default.fontURL, (err, font) => {
      this._font = font;
      PIXI.loader.add(this.style.default.imageURL, this.style.default.imageURL).load((loader, resources) => {
        this._texture = resources[this.style.default.imageURL].texture;
        this.updateText();
      });
    });
  }

  updateTexture() {
    const height = this.layout._lineHeight * this.layout._linesTotal;
  }

  updateStyle() {
    if (this._font) {
      this.updateText();
    }
  }

  updateText() {
    const flatCopyStyle = {};
    Object.keys(this._style).forEach(key => {
      flatCopyStyle[key] = this._style[key].getFlatCopy();
    });

    const opt = {
      text: this._text.replace(/(\u00AD)/g, '\uE000'),
      font: this._font,
      styles: flatCopyStyle,
      width: flatCopyStyle.default.width,
    };

    if (opt.wordWrapWidth) {
      opt.width = opt.wordWrapWidth;
    }

    if (!opt.font) {
      throw new TypeError('must specify a { font } in options');
    }
    console.log('stylesstylesstyles', opt.styles);

    // get visible glyphs
    this.styles = createStyles(opt);
    // LAYOUT ---> REPLACE!
    this.layout = createLayout(opt, this.styles);
    // get vec2 texcoords
    const flipY = opt.flipY !== false;

    // the desired BMFont data
    const font = opt.font;
    this.font = font;

    // determine texture size from font file
    const texWidth = font.common.scaleW;
    const texHeight = font.common.scaleH;

    this.glyphs = this.layout.glyphs;

    const sizes = vertices.sizes(opt, this.styles);

    // provide visible glyphs for convenience
    this.visibleGlyphs = this.glyphs;

    // get common vertex data
    const positions = vertices.positions(this.glyphs, sizes, font.info.size);
    const uvs = vertices.uvs(this.glyphs, texWidth, texHeight, false);

    const colors = vertices.colors(opt, this.styles);

    this.indices = createIndices({
      clockwise: true,
      type: 'uint16',
      count: this.glyphs.length
    });

    this.colors = new Float32Array(colors);
    this.vertices = new Float32Array(positions);
    this.uvs = new Float32Array(uvs);
    // aarondupon.be
    this.sizes = new Float32Array(sizes);
    // console.log(uvs)
    this.styleID = this.style.styleID;
    this.dirty++;
    this.indexDirty++;

    // this.width = width;
    // this.height = height;
    this.updateTexture();
  }

  get text() {
    return this._text;
  }

  set text(value) {
    this._text = value;
    this.updateText();
  }

  set style(style) {
    const newStyle = {};
    Object.keys(style).forEach(key => {
      newStyle[key] = new TextStyle(style[key], this.documentStyle);
    });
    console.log('newStyle', newStyle);
    this._style = newStyle;// new TextStyle(style.default, this.documentStyle);
    this.updateStyle();
  }

  get style() {
    return this._style;
  }

  set step(step) {
    // if(step instanceof Observable){
    //     step.subscribe((value)=>{

    //         const {glyphs,sizes,font,charStyles} = this;
    //         // console.log('before:step',this.vertices)

    //         const originalVertices = this.vertices.slice(0);
    //         var i = 0
    //         charStyles.forEach(function (charStyle,n) {
    //             const fontSize = charStyle.style.fontSize + (100*value[0])
    //             // size
    //             sizes[i++] = fontSize
    //             sizes[i++] = fontSize
    //             // TL
    //             sizes[i++] = fontSize
    //             sizes[i++] = fontSize
    //             // TR
    //             sizes[i++] = fontSize
    //             sizes[i++] = fontSize
    //             // BR
    //             sizes[i++] = fontSize
    //             sizes[i++] = fontSize

    //         })

    //         let positions = vertices.positions(glyphs,sizes, font.info.size);
    //         this.vertices = new Float32Array(positions);
    //     })
    // }
    return;
    if (step instanceof Observable) {
      step.subscribe((value) => {
        const { glyphs, sizes, font } = this;
        const originalVertices = this.vertices.slice(0);
        let i = 0;
        if (glyphs && font) {
          glyphs.forEach((glyph, n) => {
            glyph.position[0] += 10 * Math.random();
            let bitmap = glyph.data;
            const size = sizes[n];
            const defaultSize = font.info.size;
            // bottom left position
            let x = (glyph.position[0] + bitmap.xoffset); //*  (defaultSize) ;
            let y = ((glyph.lineHeight * defaultSize) * (glyph.line)) + (-defaultSize + bitmap.yoffset) * size; // +  (50-bitmap.height*size);
            glyph.position[1] += Math.random() * 10 * 100;
          });
          vertices.updatePosition(glyphs, sizes, font.info.size, this.vertices);
        }


        // console.log(this.vertices)
        // this.vertices = new Float32Array(this.vertices);
      });
    }
  }

  get step() {
    return this._step || 0;
  }
}
