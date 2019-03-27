import isundefined from 'lodash.isundefined';
import omitBy from 'lodash.omitby';
import moize from 'moize';




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
    
    while ((myArray = myRe.exec(str)) !== null) {
        const isClosing = /\//.test( myArray[0])
        const tagName = myArray[0].replace(/<|>|\//g,'');
        const slice = str.slice(0,myRe.lastIndex);
        const tagCharLeftLenghtToRemove =    slice.length - slice.replace(/<[^>]*>/g,'').length 
        const idx2 = myArray.index + ( isClosing ? 3 : 2)
        const idx = myRe.lastIndex - tagCharLeftLenghtToRemove;
        const styleInfo =  {
            styleIdx:idx,
            styleAtIdxWithtags:idx2,
            ...getStyleBytagName(tagName,isClosing,opt.styles)
        }

        console.log('aaron:',str,isClosing,idx,str.slice(idx2),getStyleBytagName(tagName,isClosing,opt.styles).style.fontSize)
        styles.push(styleInfo);
    }
    return new Style(styles);  
}

export default moize.deep(createStyleIndex)