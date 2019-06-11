import isundefined from 'lodash.isundefined';
import omitBy from 'lodash.omitby';
import moize from 'moize';

import { parse, parseDefaults } from 'himalaya'





class Style{
    constructor(styles){
        this.styles = styles;
    }
    styleAtIdx(charIdx){
        // console.log('styleAtIdx',charIdx,this.styles)
        const res  = this.styles.filter(x => x.styleIdx <= charIdx )
        
        return res[res.length-1];
    }
}
function getStyleBytagName(tagName,isClosingTag,styles){
    const style = omitBy(styles[tagName],isundefined)
    const defaultStyle = styles.default;
    if(isClosingTag){
        return {style:defaultStyle, name:'default',isClosingTag};
    }
    return {style: {...defaultStyle, ...style},name:tagName,isClosingTag}
}

function createStyleIndex(opt){


      // var parsedDOM = parse(opt.text);
    //   var parsedDOM = parse(opt.text, { ...parseDefaults, includePositions: true })
    //   .filter(x=>x.type === 'element');
    // opt.text.
    // console.log('parsedDOM',parsedDOM)

    
    
    const {text} = opt
    // const res = (/<[^>]*>/g).match(text);
    var myRe = /<[^>]*>/g;
    var str = text//.replace(/\s/g,'+')//.replace(/\n/g,'%')
    
    // str = str.replace(/(\uE000)/g,'\u00AD');
    // str = str.replace(/(\uE000)/g,'');
    // console.log('str',str)
    var myArray;
    let styles = []
    const styleInfo =  {
        styleIdx:0,
        ...getStyleBytagName('default',false,opt.styles)
    }
    styles.push(styleInfo);

    const indexdStyles = []
    
    const findClosingTag = (str, start, name) =>{
        var myRe = new RegExp(`(<${name}>|</${name}>)`)
            myRe.exec(str);
            var tag;
            var children = [];
            var index = start;
          
            while ((tag = myRe.exec(str)) !== null) {

                if(tag === `<${name}>`){
                    children.push(tag);
                }
                if(tag === `</${name}>`){
                    chidren.pop();
                }
                if(children.length === 0){
                    index = tag.index;
                    console.log('tag',tag)
                    break;
                    
                }
               
            }
            
            const slice = str.slice(str,index)
            const tagCharLeftLenghtToRemove =    slice.length - slice.replace(/<[^>]*>/g,'').length  
            const endIdx = start  + tagCharLeftLenghtToRemove;
            return endIdx
    }

    let openTags = []
    
    while ((myArray = myRe.exec(str)) !== null) {
        const isClosing = /\//.test( myArray[0])
        const tagName = myArray[0].replace(/<|>|\//g,'');
        const slice = str.slice(0,myRe.lastIndex);
        const tagCharLeftLenghtToRemove =    slice.length - slice.replace(/<[^>]*>/g,'').length 
        const idx2 = myArray.index + ( isClosing ? 3 : 2)
        const idx = myRe.lastIndex - tagCharLeftLenghtToRemove;
        const currentStyle  =  getStyleBytagName(tagName,isClosing,opt.styles);
        const endIdx = findClosingTag(str.slice(idx2+1,str.length),idx2,tagName);

        const toComputedStyle = (tags)=>
                tags.reduce((style,tagName)=>
                        ({  
                            ...style,
                            ...getStyleBytagName(tagName,false,opt.styles)
                        }), {});
                        
        if(!isClosing){
            openTags.push(tagName);
        }else{
            if(openTags[openTags.length-1] === tagName) openTags.pop()
        }
        const styleInfo =  {
            styleIdx:idx,
            endIdx:endIdx,
            tags:openTags,
            ...currentStyle,
            ...toComputedStyle(openTags),
            styleAtIdxWithtags:idx2,

            

            
           
        }

        styles.push(styleInfo);
    }
    return new Style(styles);  
}

export default moize.deep(createStyleIndex)