
// import './pixi-sdf-text/src';


import * as loadFont from 'load-bmfont';
import createIndices from 'quad-indices';
// import vert from './shaders/sdf.vert';
import vert from './shaders/sdfText.vert';
import frag from './shaders/sdf.frag';

import createStyle from './create-style';
import createLayout from './create-layout';
import createStyleIndex from './create-style-index';
import * as vertices from './vertices';
// eslint-disable-next-line import/no-unresolved
import createESCElement from '../compose/createESCElement';
// eslint-disable-next-line import/no-unresolved
import registerElement from '../compose/registerElement';
import geometryComponent from '../components/ecs/geometryComponent';
import modelComponent from '../components/ecs/modelComponent';
import translate3dComponent from '../components/ecs/translate3dComponent';


// function convertBufferXY2YXYZ(position) {
//     var a = [];
//     const b = position;
//     let i = 0;
//     while (i < b.length) {
//         a.push(...(b.slice(i, i + 2)), 0);
//             i += 2;
//     }
//     const test = position.find(isNaN);
    
//     if (String(test) === 'NaN') {
//         console.error('VERTEX ARRAY POSITION: has NaN', position)
//     }
//     console.log('bbbbbb',b)
//     return b.map(x => x/(window.innerWidth / 2)) /// (window.innerWidth * window.devicePixelRatio));// ab.map(x => x / (window.innerWidth * 100) * 8);// a
// }
function multiplyView(position) {
    var a = [];
    const b = position;
   
    const test = position.find(isNaN);
    
    if (String(test) === 'NaN') {
        console.error('VERTEX ARRAY POSITION: has NaN', position)
    }
    
    for (let i = 0; i < position.length; i+=2){
        b[i] = b[i]/window.innerWidth * window.devicePixelRatio *2
        b[i+1] = b[i+1]/window.innerHeight * window.devicePixelRatio * 2
        
        
    }
   
    return b;
}


const myStyles = {
    default: {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: 'rgba(0,255,255,1)',
        wordWrap: 'break-word',
        width: 100,
        lineHeight:'40px',
        lineHeightBottom: '0px',
        // lineHeight:'5em',
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
        fontSize: '30px',
        color: '#efefef'
    },
    p: {
        fontStyle: 'italic',
        color: '#efefef'
    },
    a: {
        color: 'rgba(255,255,0,1)',
       
        // fontSize: 60,

    },
    b: {
        color: 'rgba(255,255,0,1)',
        fontSize:'30px',
        lineHeight: '80px',
        lineHeightBottom: '0px',
        // fontSize: 60,

    },
};

const cache = {};
const queue = [];

function loadAssets(style, cb) {
    if (cache[style.default.fontURL]) {
        if (cache[style.default.fontURL] === 'loading' || !cache[style.default.fontURL]) {
            return queue.push(cb);
        }
            return cb(cache[style.default.fontURL]);
    }
    cache[style.default.fontURL] = 'loading';
    return loadFont(style.default.fontURL, (err, font) => {
        if (err) {
            console.error(err);
        }
        console.log('loading... font');
        queue.forEach(cb => cb(font));
        queue.splice(0, queue.length);
      });
}

let i = 0;
const createTextObject = (buffers, baseObj, width) => {
    i++;


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

    const comp = createESCElement(
        modelComponent(),
        geometryComponent({
            buffers,
            shaders: [
                {
                vert,
                frag,
                uniforms: {
                    // uSampler:'texture',// = renderer.bindTexture(texture);
                    uSampler: { texture: '/public/fonts/din/DIN-Regular.png' },
                    uAlpha: 1,
                    uColor: 0xff00ff,
                    // uFontSize: 1, // sdfText.style.fontSize;
                    // uFontInfoSize: 42, // font.info.size)// * PIXI.RESOLUTION;
                    // u_weight:sdfText.style.weight;
                    }
                }]
        }),

        translate3dComponent({
            position: [window.innerWidth / 2, window.innerHeight / 2, 0],
        })
    )(
        baseObj
    );
    // console.log('baseObj->comp (2)',comp)
    return comp;
  };

  const createVertexArrayObject = (style, text, font, index = 1, vao) => {
        const flatCopyStyle = {};
        Object.keys(style).forEach(key => {
            flatCopyStyle[key] = style[key].getFlatCopy();
        });
        let test = text.match(/\uE000/g);


        // AUOT SPLITE WORDS :
        // text.split('').join('\uE000') 
        let segmentSize = 2
        let reg = `.{1,${segmentSize}}`;
        // text = text.match(new RegExp(reg,"g")).join('\uE000');//join('-')//join('\uE000') 


        const opt = {
            text,//: text+ (test ? test.join(' ') : '') , // dirty FIX for HYPEN: 
            // text: text.replace(/(\uE000)/g, '\uE000'),
            // text: text.replace(/(\uE000)/g, '-'),
            font,
            styles: flatCopyStyle,
            breakWords:true,
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
        if ((String(stylesIndexs.styles[0].style.lineHeight).indexOf('em') > -1)) {
            console.error(`lineHeight: IS NOT A NUMBER:
                stylesIndexs.styles[0].style =`, stylesIndexs.styles[0].style.lineHeight);
        }
        // const flipY = opt.flipY !== false;
        // the desired BMFont data
        // determine texture size from font file
        const texWidth = font.common.scaleW;
        const texHeight = font.common.scaleH;
        const { glyphs } = layout;
        
        // get common vertex data
        // opt.text  +='  ';
        
        // const sizes = vertices.sizes(opt, stylesIndexs);
        const sizes = vertices.sizes(glyphs,opt, stylesIndexs);
        // console.log('window.innerWidth',window.innerWidth * window.devicePixelRatio)
        const x = ( (index % window.innerWidth));// * 10 * font.info.size) 

        const y = 0 ;//+ Math.ceil(index/window.innerHeight)*window.innerHeight;//10*font.info.size;//((index) * 10 * font.info.size));
        const offset = [0,0];
        const positions = multiplyView(vertices.positions(glyphs, sizes, font.info.size, offset));
       
        const uvs = vertices.uvs(glyphs, texWidth, texHeight, false);
        const colors = vertices.colors(glyphs,opt, stylesIndexs);
        console.log('fontSize:',font.info.size,stylesIndexs,sizes,uvs)

        vao.size.buffer.push(...sizes);
        vao.coord.buffer.push(...uvs);
        vao.position.buffer.push(...positions);
        vao.color.buffer.push(...colors);

        const count =( (vao.position.buffer.length / (4 * 2)) ) - 1;
        const indices = createIndices({
            clockwise: true,
            type: 'uint16',
            count,
            start: 0,
        });

        console.log('indices.length',count,text.replace(/\uE000/g,'').replace(/<[^>]*>/g,'').length)

        vao.index.buffer = indices;

        return vao;
 
    };

let renderCount = 0;
let loadCount = 0;



function batchRender(fn){
    return (props)=>{
        const batchGroupId = 0;
        fn({
            ...props,
            uid:batchGroupId,
            instanceId: `text-component-${props.uid}`
        });
    }

}
// export default batchRender(createSDFContentText)



    
function createSDFContentText2(props) {
    const { /* width = 200, */ uid = null, batchGroupId = 0 } = props;

    

    if (!uid) {
        console.log(`createSDFContentText for batchgroup ${batchGroupId} with uid text-component${renderCount}`);
    }


    const styles = createStyle(myStyles);// , { width: 200, breakWords: true });
    // const txt =  'A new trailer for The Wandering Earth <a>shows</a> off a desperate plan to save the planet';//'Hi I <a>am a computer</a>, taking over the world!';
    const txt = `${renderCount}A` +  (renderCount%2 ? `A` : '') //:${Date.now()}`;// 'A new trailer for The Wandering Earth <a>shows</a> off a desperate plan to save the planet';//'Hi I <a>am a computer</a>, taking over the world!';

    const baseObj = createESCElement(
    )({
        uid: 'text-component-'+uid || 'text-component-'+renderCount,
        // instanceId: uid || `text-component${renderCount}`,
    });
   

    loadAssets(styles, (font) => {
        loadCount++;
        
        const buffer = {
            index: { buffer: [] },
            // update! keep it simple
            size: {
                buffer: [], type: 'FLOAT', size: 1, stride: 1 * 4, offset: 0
                },
            coord: {
                buffer: [], type: 'FLOAT', size: 2, stride: 2 * 4, offset: 0
                },
            position: {
                buffer: [], type: 'FLOAT', size: 2, stride: 2 * 4, offset: 0
                },
            color: {
                buffer: [], type: 'FLOAT', size: 3, stride: 3 * 4, offset: 0
                },
            };
        // const vao = createVertexArrayObject(styles,txt,font)
        // const text = createTextObject(vao,baseObj,props.width);

        const vao = createVertexArrayObject(styles, txt, font, loadCount, buffer);
        const text = createTextObject(vao, baseObj, props.width);
        // console.log('text.registered',text)
        if (text.registered) {
            
            registerElement(text);
        }
    });
    // console.log('baseObj',baseObj)
    renderCount++;
    return baseObj;
}

const buffer = {
    index: { buffer: [] },
    // update! keep it simple
    size: {
        buffer: [], type: 'FLOAT', size: 1, stride: 1 * 4, offset: 0
        },
    coord: {
        buffer: [], type: 'FLOAT', size: 2, stride: 2 * 4, offset: 0
        },
    position: {
        buffer: [], type: 'FLOAT', size: 2, stride: 2 * 4, offset: 0
        },
    color: {
        buffer: [], type: 'FLOAT', size: 3, stride: 3 * 4, offset: 0
        },
    };
    
 function createSDFContentText(props) {
    const { /* width = 200, */ uid = null, batchGroupId = 0 } = props;

    if (!uid) {
        console.log(`createSDFContentText for batchgroup ${batchGroupId} with uid text-component${renderCount}`);
    }


    const styles = createStyle(myStyles , { width: (window.innerWidth/2), breakWords: true });
    // const txt =  'A new trai\uE000ler for The Wan\uE000der\uE000ing Earth <a>shows</a>\n off a des\uE000per\uE000ate plan to save the planet Hi I <a>am a com\uE000pu\uE000ter</a>, tak\uE000ing over the world!';
    // const txt = 'A new trailer for The Wandering Earth';//`${renderCount}A` +  (renderCount%2 ? `A` : '') //:${Date.now()}`;// 'A new trailer for The Wandering Earth <a>shows</a> off a desperate plan to save the planet';//'Hi I <a>am a computer</a>, taking over the world!';
    // const txt =  'A new trai\uE000ler sho\uE000ws for The Wan\uE000der\uE000ing Earth Lorem Ipsum is slechts een proeftekst uit het druk\uE000ke\uE000rij- en zet\uE000terij\uE000wezen. Lorem Ipsum is de standaard proeftekst in deze bedrijfstak sinds de 16e eeuw, ';
    const txt =  'A new trai\uE000ler sho\uE000ws for The Wan\uE000der\uE000ing Earth Lo\uE000rem Ip\uE000sum is slechts een proef\uE000tekst uit het druk\uE000ke\uE000rij- en zet xx ter ij - we\uE000zen. Lo\uE000rem Ip\uE000sum is de stan\uE000daard proef\uE000tekst in deze be\uE000drijfs\uE000tak sinds de 16e eeuw, ';
    // const txt =  'A new traixxxxxxxxxx\u00ADler sho\u00ADws for The Wan\u00ADder\u00ADing Earth Lo\u00ADrem Ip\u00ADsum is slechts een proef\u00ADtekst uit het druk\u00ADke\u00ADrij- en zet xx ter ij - we\u00ADzen. Lo\u00ADrem Ip\u00ADsum is de stan\u00ADdaard proef\u00ADtekst in deze be\u00ADdrijfs\u00ADtak sinds de 16e eeuw, ';

    // const txt =  'A new trai\uE000ler <a>shows</a> for The Wan\uE000der\uE000ing Earth';
    // const txt =  'A new trailer <a>shows</a> for The Wandering Earth';
    // const txt =  '<a>shows</a> off a des';
    // const txt =  '<b>c\uE000om\uE000pu\uE000ter?</b>123\uE0004ing over the world!';
    // const txt =  '<b>12\uE000345\uE000678?</b><br>\uE000xxx\uE0004ing over the world!';
    // const txt =  '<b>12\uE000345</b>\uE000678 \uE000? over the world!';
    // const txt =  '<b>1234 5678</b> ? over the world!';
    // const txt =  '<b>1234\uE0005678</b> ? over the world!';
    // const txt =  '<b>12345678</b> ? over the world!';
    // const txt =  '<b>com\uE000pu\uE000ter?</b> Hi I am a com\uE000pu\uE000ter?\uE000123\uE0004ing over the world!';

    // const txt =  '<b>com\uE000pu\uE000ter?</b> Hi I am a com\uE000pu\uE000ter?\uE000123\uE0004ing over the world!';
    // const txt =  '<b>com\uE000pu\uE000ter?</b>';
    // const txt =  'computer?';


    // const txt = "In tegenstelling \uE000tot wat algemeen aangenomen wordt is Lorem Ipsum niet zomaar willekeurige tekst. het heeft zijn wortels in een stuk klassieke latijnse literatuur uit 45 v.Chr. en is dus meer dan 2000 jaar oud. Richard McClintock!"
    // const txt =  'coOOO\uE000OOOOO\uE000om\uE000pu\uE000ter?';
    // const txt =  'Anewtrai\u00ADler sho\u00ADws';
    // const txt =  'A new trai\u00ADler sho\u00ADws for The Wan\u00ADder\u00ADing Earth Lo\u00ADrem Ip\u00ADsum is slechts een proef\u00ADtekst uit het druk\u00ADke\u00ADrij- en zet xx ter ij - we\u00ADzen. Lo\u00ADrem Ip\u00ADsum is de stan\u00ADdaard proef\u00ADtekst in deze be\u00ADdrijfs\u00ADtak sinds de 16e eeuw, ';

    // const txt =  'Hi I am a compu\uE000ter?\uE000123\uE0004ing over the world!'
    // const txt =  'am a computer?1234ing over the world!'

    // const txt =  'the% planet% Hi I <b>am a com\uE000pu\uE000ter?</b>123\uE0004ing over the world!';

    const baseObj = createESCElement(
    )({
        uid: batchGroupId,
        instanceId: uid || `text-component${renderCount}`,
    });

    loadAssets(styles, (font) => {
        loadCount++;
        // const vao = createVertexArrayObject(styles,txt,font)
        // const text = createTextObject(vao,baseObj,props.width);

        const vao = createVertexArrayObject(styles, txt, font, loadCount, buffer);
        const text = createTextObject(vao, baseObj, props.width);

        // if (text.registered) {
        //     registerElement(text);
        // }
    });
    renderCount++;
    return baseObj;
}
export default createSDFContentText;
