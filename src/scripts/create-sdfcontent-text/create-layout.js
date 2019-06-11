import moize from 'moize';
import xtend from 'xtend';
import number from 'as-number';

var X_HEIGHTS = ['x', 'e', 'a', 'o', 'n', 's', 'r', 'c', 'u', 'm', 'v', 'w', 'z']
var M_WIDTHS = ['m', 'w']
var CAP_HEIGHTS = ['H', 'I', 'N', 'E', 'F', 'K', 'L', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']


const hypen = /(\u00AD|\uE000)/
const SPACE = ' '
var TAB_ID = '\t'.charCodeAt(0)
var SPACE_ID = ' '.charCodeAt(0)
var HYPEN_ID = '-'.charCodeAt(0)
var ALIGN_LEFT = 0, 
    ALIGN_CENTER = 1, 
    ALIGN_RIGHT = 2

var newline = /\n/
var whitespace = /\s/

const resolution = 2

export default function createLayout(opt, charStyles) {
  return new TextLayout(opt,charStyles)
}

function isWhitespace(chr) {
  return whitespace.test(chr)
}
function isHypen(chr) {
  return hypen.test(chr)
}

function TextLayout(opt, charStyles) {
  
  const newOptions = {...opt}
  // console.log('newOptions._text = newOptions.text', newOptions.text)
  const noTagsText = newOptions.text.replace(/<[^>]*>/g,'');
  newOptions._text = newOptions.text
  newOptions.text = noTagsText
  
  
  this.glyphs = []
  this.charStyles = charStyles
  this._measureOld = this.computeMetrics.bind(this)
  this.hypens = []

  this._measure = (string,measureSpace,style,message)=>this.computeMetrics(string, 0, string.length, newOptions.width, measureSpace, style,message)
  // this._computeMetrics(string,start,end, newOptions.width, measureSpace, style,message)

  this.update(newOptions)
}
TextLayout.prototype.getCharStyles = function getCharStyles(charIdx){
  const {charStyles} = this;
  return charStyles.styleAtIdx(charIdx);
}
TextLayout.prototype.update = function(opt) {
  opt = xtend({
    measure: this._measure,
    measureOld:this._measureOld,
    breakWord: true,
    // mode:'pre',
  }, opt)

  
  this._opt = opt

  this._opt.tabSize = number(this._opt.tabSize, 4)

  if (!opt.font)
    throw new Error('must provide a valid bitmap font')

  var glyphs = this.glyphs
  var text = opt.text//.replace(/\n/g,'%');////.replace('</ml>','').replace('<ml>','')      || ''//.replace(/<\/?(ml)>/,'').replace(/<?(ml)>/,'') ||'' 

  var font = opt.font
  this._setupSpaceGlyphs(font);
  var lines = this.wordwrap(opt);
  
  var minWidth = opt.width || 0


  //clear glyphs
  glyphs.length = 0

  //get max line width
  var maxLineWidth = lines.reduce(function(prev, line) {
    return Math.max(prev, line.width, minWidth)
  }, 0)

  //the pen position
  var x = 0
  var y = 0
  var lineHeight = number(opt.lineHeight, font.common.lineHeight)


  var baseline = font.common.base
  var descender = lineHeight-baseline
  var letterSpacing = opt.letterSpacing || 0
  var height = lineHeight * lines.length - descender;
  var align = getAlignType(this._opt.align);

  //draw text along baseline
  // y -= lineHeight
  
  //the metrics for this text layout
  this._width = maxLineWidth
  this._height = height
  this._descender = lineHeight - baseline
  this._baseline = baseline
  this._xHeight = getXHeight(font)
  this._capHeight = getCapHeight(font)
  this._lineHeight = lineHeight
  this._ascender = lineHeight - descender - this._xHeight

  //layout each glyph
  var self = this
  var charIdx = 0
  var charIdx2 = 0
  var lastY = 0;
  var maxLineHeightBottom = 0;
  var maxLineHeight = 0;
  // var hypensCountDirtyFIX =  0
  console.log('aaron:lines:::',lines)
  var lastMaxFontSize = 0;
  var lastmaxLineHeightBottom = 0;
  lines.forEach(function(line, lineIndex) {
    
    // console.log('aron:lines:::',line.text.length,line.text.replace(' ','+'))
   // if  hypens enabled text max lenght is not correct
    var start = line.start
    var end =  line.end;//start + line.text.length
    var lineWidth = line.width;
    var lastGlyph
    
   
    var maxFontSize = 0;
   
   
    
    if(lineIndex >= 0){
     
      maxLineHeightBottom = 0;
      maxLineHeight = 0
      
      let n = 0;
      // maxFontSize = 0;
      for (var i=start; i<end; i++) {
        var txt = line.text;
        var id = txt.charCodeAt(n)
        var glyph = self.getGlyph(font, id)
        var char = txt.charAt(n)
        var charStyle = self.getCharStyles(i);
        if(glyph){
          maxFontSize = Math.max(charStyle.style.fontSize,maxFontSize);
          const fontSize = charStyle.style.fontSize;
          const fontScale = maxFontSize/font.info.size;
          // const lineHeight = maxFontSize;//charStyle.style.lineHeight;//maxFontSize + charStyle.style.lineHeight/maxFontSize;//Math.sqrt(fontSize)*Math.PI* 1.618*100 + charStyle.style.lineHeight;////(glyph.yoffset*fontSize) + charStyle.style.lineHeight ;
          // maxLineHeightBottom = (Math.max(lineHeight,maxLineHeightBottom)+charStyle.style.fontSize/maxFontSize) //+ Math.sqrt(fontSize)*Math.PI* 1.618*100;
          const lineHeight = charStyle.style.lineHeight;// + maxFontSize/2;//maxFontSize + charStyle.style.lineHeight/maxFontSize;//Math.sqrt(fontSize)*Math.PI* 1.618*100 + charStyle.style.lineHeight;////(glyph.yoffset*fontSize) + charStyle.style.lineHeight ;
          const lineHeightBottom = charStyle.style.lineHeightBottom || 0;
          
          maxLineHeightBottom = (Math.max(lineHeightBottom,maxLineHeightBottom))
         
          maxLineHeight = (Math.max(lineHeight,maxLineHeight))

          

         
          
        }
       
        n++
        charIdx2 ++
      }

      if(lineIndex === 0) y += maxLineHeightBottom

      if(lineIndex === 0) maxLineHeight = maxLineHeight/2 + maxFontSize
     
    }

    console.log('maxLineHeight',lineIndex,maxLineHeight)

    let nn = 0

    for (var i=start; i<end; i++) {
    
      // if(lineIndex === 3 ) console.log('line: ',lineIndex,line.text,text.charAt(start+nn),line.text.slice(nn,nn+1),charIdx)

      // var id = text.charCodeAt(charIdx)
      // var glyph = self.getGlyph(font, id)
      // var char = text.charAt(charIdx)

      var char = line.text.slice(nn,nn+1)
      var id = char.charCodeAt(0)
      var glyph = self.getGlyph(font, id)
      console.log('line:',lineIndex,i,char)
  
      var charStyle = self.getCharStyles(charIdx);
          
      if(!charStyle){
         charStyle = self.getCharStyles(start) || self.getCharStyles(0); 
      }
     
      const {fontSize} = charStyle.style;
            
      let ty = 0;

      if(/(\uE000|\u00AD)/g.test(char)){

        
        const isLastChar = end-1 === i
        glyph = self.getGlyph(font, HYPEN_ID);
        
          if(!isLastChar){
            console.log('isLastChar::',charIdx === end-1)
            glyph = {...self.getGlyph(font, HYPEN_ID)}
            glyph.xadvance = 0;
            glyph.width = 0;
          }
          // glyph.width =0;
        
        console.log('isLastChar',isLastChar,charIdx,end-1)
        // !isLastChar && (glyph.xadvance = 0);
      }
      const isLastChar = end-1 === i
      if(id === HYPEN_ID && charIdx !== end-1){
        console.log('isLastChar',isLastChar)
          glyph = null
      }
      if(glyph){
         
        if(/(\?|[1-4])/.test(glyph.char)
        
          ) {
          // console.log('aaron:debug:',{lineIndex},charStyle.style.fontSize,text.slice(charIdx,charIdx+1),glyph.char)//,charIdx,text,text.slice(charIdx,charIdx+10),glyph.char,charStyle.style.fontSize)
        }
        // const fontSize = charStyle.style.fontSize;
        // console.log('maxLindeHeight',maxLineHeightBottom,y,baseline,glyph.yoffset,fontSize,charStyle.style.fontSize)
        // ty = y + maxLineHeightBottom + (-baseline + glyph.yoffset) * fontScale ;
        // ty += -baseline*fontSize; // align baseline 


        ty +=  y + (maxLineHeight/2) - charStyle.style.fontSize ;// + (glyph.yoffset*charStyle.style.fontSize) ;
        // ty -= (baseline - glyph.yoffset) * charStyle.style.fontSize/font.info.size ;
        ty -= ( - glyph.yoffset) * charStyle.style.fontSize/font.info.size ;
        
        
        // ty += -baseline*charStyle.style.fontSize; // align baseline 
      //  ty += baseline*; // align baseline 

        if (lastGlyph) {
          x += getKerning(font, lastGlyph.id, glyph.id) 
          // x += glyph.xoffset//*fontSize
         
        }else{
          
        }


        var tx = x
        if (align === ALIGN_CENTER) 
          tx += (maxLineWidth-lineWidth)/2
        else if (align === ALIGN_RIGHT)
          tx += (maxLineWidth-lineWidth)
       
        glyphs.push({
          position: [tx, ty],
          data: glyph,
          index: charIdx,
          lineHeightBottom:maxLineHeightBottom,
          line: lineIndex,
  
        })  
        const fontSize = charStyle.style.fontSize;
        const fontScale = fontSize/font.info.size;
       
        // x += ((glyph.xadvance * fontScale * 2 ) + letterSpacing)
        // x += (glyph.xadvance*fontScale*2 + letterSpacing) ;//font.info.size;
        // x += ((glyph.xadvance * fontScale * 2)  + letterSpacing) ;//font.info.size;
        x += ((glyph.xadvance * fontScale)  + letterSpacing) ;//font.info.size;
        // puls to left if x is zero
        if( i ===  start && id === SPACE_ID){
          x = 0
        }

        //move pen forward
        lastGlyph = glyph
      }
      nn ++
      charIdx +=1
      
    }
    console.log('LINE++++',lineIndex+1,y,`+${lastmaxLineHeightBottom+(lastMaxFontSize*2)}`,lastMaxFontSize,'maxFontSize',maxFontSize,'->',lastMaxFontSize,maxLineHeightBottom,maxFontSize/2,line.text)
    //next line down
  
    lastmaxLineHeightBottom = maxLineHeightBottom;

    y +=  (maxLineHeight/2)+lastmaxLineHeightBottom//+(lastmaxLineHeightBottom/2);//(maxLineHeightBottom/2)+maxFontSize;//+Math.sqrt(maxFontSize)*1.618;//maxLineHeightBottom;//Math.sqrt(maxLineHeightBottom - maxFontSize) * Math.PI*1.618 *2
    lastMaxFontSize = maxFontSize
    console.log('maxLineHeightBottom',lastmaxLineHeightBottom)
    console.log('yyy',maxFontSize,maxLineHeightBottom)
    
   
    
    x = 0
  })
  
  this._linesTotal = lines.length;
}

TextLayout.prototype._setupSpaceGlyphs = function(font) {
  //These are fallbacks, when the font doesn't include
  //' ' or '\t' glyphs
  this._fallbackSpaceGlyph = null
  this._fallbackTabGlyph = null

  if (!font.chars || font.chars.length === 0)
    return

  //try to get space glyph
  //then fall back to the 'm' or 'w' glyphs
  //then fall back to the first glyph available
  var space = getGlyphById(font, SPACE_ID) 
          || getMGlyph(font) 
          || font.chars[0]

  //and create a fallback for tab
  var tabWidth = this._opt.tabSize * space.xadvance
  this._fallbackSpaceGlyph = space
  this._fallbackTabGlyph = xtend(space, {
    x: 0, y: 0, xadvance: tabWidth, id: TAB_ID, 
    xoffset: 0, yoffset: 0, width: 0, height: 0
  })
}

TextLayout.prototype.getGlyph = function(font, id) {
  var glyph = getGlyphById(font, id)
  if(id ===  57344) { //<Private Use, First>	
    return {...getGlyphById(font, HYPEN_ID),char:'-'}
  }

  if (glyph)
    return glyph
  else if (id === TAB_ID) 
    return this._fallbackTabGlyph
  else if (id === SPACE_ID) 
    return this._fallbackSpaceGlyph
  return null
}

TextLayout.prototype.computeMetrics = function(text, start, end, width,measureSpace=false,measureHypen=false,style) {
  var letterSpacing = this._opt.letterSpacing || 0
  var font = this._opt.font
  var curPen = 0
  var curWidth = 0
  var count = 0
  var glyph
  var lastGlyph

  if (!font.chars || font.chars.length === 0) {
    return {
      start: start,
      end: start,
      width: 0
    }
  }
  
  for (var i=start; i < end; i++) {
    // console.log('nextWidth:',start,end,text)
    var id = text.charCodeAt(i)
    var char = text.charAt(i)
    var glyph = this.getGlyph(font, id)
    
   
  
    var charStyle = this.getCharStyles(i);
    
    if(!charStyle){
      
       charStyle = this.getCharStyles(start) || this.getCharStyles(0); 
    }

    const {fontSize} = charStyle.style;
   
    const measureGlyph = (measureHypen ||  !isHypen(char));
    // if (glyph  && measureGlyph) {
    if (glyph  && measureGlyph) {
     
    
      const fontScale = (charStyle.style.fontSize/font.info.size);
      var xoff = glyph.xoffset;
      var kern = lastGlyph ? getKerning(font, lastGlyph.id, glyph.id) : 0;

      var nextPen = curWidth;
      var nextWidth = curWidth;

     
        curPen += (xoff-kern)*fontScale;
        var nextPen = curPen + ((glyph.width + glyph.xadvance + letterSpacing) * fontScale);
        var nextWidth = curPen + (( glyph.width + glyph.xadvance) * fontScale);
      
    

      if(measureSpace && id === SPACE_ID){
        const spaceWidth = glyph.xadvance
        
        nextWidth += (spaceWidth + glyph.xoffset)*fontScale;
      }
      if (nextWidth >= width || nextPen >= width){
      }
      //we've hit our limit; we can't move onto the next glyph
      if (nextWidth >= width || nextPen >= width){
        // break stops if font is large
        // break
      }
     
      //otherwise continue along our line
      curPen = nextPen
      curWidth = nextWidth
      lastGlyph = glyph

      

    }
    // if(char === '8' ){
    //  console.log('check: (1)',glyph,'measureGlyph',measureGlyph,'measureHypen',measureHypen,char,curWidth === 241.4285714285714,curWidth);
    // }else{
    //  console.log('check: (2)',glyph,'measureGlyph',measureGlyph,'measureHypen',measureHypen,char,curWidth === 241.4285714285714,curWidth);
    // }
    // console.log('glyphglyphglyphglyph',glyph,curWidth,'241.4285714285714')

     count++

  }
  
  //make sure rightmost edge lines up with rendered glyphs
  // if (lastGlyph){
  //   const fontSize = charStyle.style.fontSize;
  //   const fontScale = (fontSize/font.info.size);
  //   curWidth += lastGlyph.xoffset*fontScale;// + (lastGlyph.width*fontScale)

  // }
  console.log('countcountcount',start,count)
  return {
    start: start,
    end: start + count,
    width: curWidth
  }
}

/**
 * [wordwrap description]
 * @param  {[type]}  text  [description]
 * @param  {Number}  width [description]
 * @param  {String}  br    [description]
 * @param  {Boolean} cut   [description]
 * @return {[type]}        [description]
 */
TextLayout.prototype.wordwrap = function(opt) {
  const {width = 80, br = '\n',measure,text} = opt;
  const lines = [];
  let curPen = 0;
  let totalPen = 0;
  let currCharIdx = 0;
  let currChunkIdx = 0;

  const allLines =  text.split(/(?=<br>|\n)/).map((line,i) => {
    let words = line.replace('\n','').replace(/<[^>]*>/g,'').split(' ');
    let spaceLeft = width;
    // const letterSpacing =  opt.letterSpacing || 0;
    // const charCode = ' '.charCodeAt(0)
    // const char = ' '.charCodeAt(0)
    const glyph = this.getGlyph(opt.font, SPACE_ID)
    const spaceWidth = glyph.xadvance
    // const charIdx = lines.reduce((res,{total=0})=>res+total,0);
   
    // const charStyle = this.getCharStyles(charIdx);
    // const fontScale = (charStyle.style.fontSize/opt.font.info.size);
    // const space = fontScale*(spaceWidth + glyph.xoffset);
    // console.log('fontScale-fontScale',charIdx,fontScale,charStyle.style.fontSize)
    function createLine(lines, width){
      
      const line  = {
        id:lines.length+1,
        text:'',
        start: lines[lines.length - 1] ? lines[lines.length - 1].end : 0 ,
        // start:  lines[lines.length - 1] ? (lines[lines.length - 1].end || 0) : 0,
        width:width,
        total:0,
        end:0,
        addHypen:false,
        // styles:[],
      };

      // if(line.start == null) debugger
      lines.push(line);
      spaceLeft = width;
    }
     // creaet the first line
    createLine(lines,width)
    
    function add(lines, text,myCharStyle,isChunk = false){
    
   
      const curLine =  lines[lines.length - 1];
     
      curLine.text +=  text//.replace(' ','+');//  : text//.replace('\n);
      curLine.total = curLine.text.length;
      // console.log('texttexttexttext:::',lines.length - 1,curLine.start,text.length)
      curLine.end =  curLine.start + curLine.text.length;
      curLine.addHypen = isChunk;
      // curLine.styles.push({text:text,style:myCharStyle.style.fontSize});
    }
       
    for (const origWord of words) {
      
      let word = origWord;
      
      // word = word.replace(/(\uE000)/g,'\u00AD') // hack fo fix hidden hypens and styling
      const wordLength = word.length;//origWord.replace(/(\u00AD|\uE000)/g,'+').length+1
      curPen = lines.length >  0 ? lines[lines.length - 1].start+lines[lines.length - 1].text.length : 0;
     
      
      console.log('currCharIdx(38)',currCharIdx,word,'===',text.slice(currCharIdx))
     
      const charStyle = this.getCharStyles(currCharIdx);     
      // const wordBox =  measure(word.replace(/(\u00AD)/g),true,charStyle);
      // const wordBox =  measure(word,true,this.getCharStyles(curPen));//measure(word.replace(/(\u00AD)/g,''),true,this.getCharStyles(curPen));
      // console.log('fontScale-fontScale','curPen',curPen,'totalPen',totalPen,this.getCharStyles(curPen).style.fontSize,'   \t\t',word)//,lines[lines.length - 1].start,'curPen', curPen,'::::',this.getCharStyles(curPen).style.fontSize)
      const wordBox = this.computeMetrics(text,totalPen,totalPen+wordLength,width,true,false);
      
      console.log('wordBox::',text,'\n',wordBox,word,spaceLeft,'=',text.slice(totalPen,totalPen+wordLength))

      // totalPen += wordLength; // plus one for space!!
      
      // doesn't fit splt in chucks and try again please!
      if (wordBox.width > spaceLeft) {
        
        let chunkIdx = 0;
        let chunkIdx__ = 0;
        const splitChunks = (chunks,startSpaceLeft,width,lines,deep) =>{
          
          let spaceLeft = startSpaceLeft;

          while(chunks.length > 0){
            
            const chunk = chunks[0];
            const isLastChunk =  chunks.length === 1;
            let origChunk = chunks[0];
            const chunkLength =  chunk.length;
            const charIdx = curPen;
            
   
            const charStyle = this.getCharStyles(totalPen+chunkIdx);
            const fontScale = (charStyle.style.fontSize/opt.font.info.size);
            const space = fontScale*(spaceWidth + glyph.xoffset);
 
           
            chunkIdx__ = chunkLength;
    
            const chunkbox = this.computeMetrics(text,totalPen+chunkIdx,totalPen+chunkIdx+chunkLength,width,false,isLastChunk);
            
            // if(chunk == '­678?xxx') {
              // const box = this.computeMetrics(text,currChunkIdx,currChunkIdx+chunk.length-1,width,true)
              console.log('chunk_____',charStyle.style.fontSize,chunkbox.width,text.slice(totalPen+chunkIdx,totalPen+chunkIdx+chunkLength));//chunkbox.width,box.width,text.slice(currChunkIdx,currChunkIdx+chunk.length),'<-------',currChunkIdx,currChunkIdx+chunk.length,':::',width)
            // }

            // if(chunk !== String.fromCharCode(173)){
            //   // const txt =  'the planet Hi I <b>am a com\uE000pu\uE000ter?</b> 123\uE0004ing over the world!';
            //   // const txt =   'the planet Hi I am a computer 1234ing over the world!'
            //   // console.log('currChunkIdx(38)',charStyle.style.fontSize,chunk.charCodeAt(0),chunk,'  <-->  ',text.slice(currChunkIdx,currChunkIdx+10)+'...')

             
            //   // currChunkIdx += chunk.length
            // }
            currChunkIdx += chunk.replace(/(\uE000)/g,'').length;


         
            // const wordBox =  measure(word.replace(/(\u00AD)/g),true,this.getCharStyles(curPen+1));
            chunkIdx += chunk.length
            // create new line if chunk doesn't fit
            // if (spaceLeft+chunkbox.width > spaceLeft) {  // don't allow overflow on the right side of the text box bounders
            if (chunkbox.width > spaceLeft) {  // allow overflof on the right side of the text box bounders
              // debugger 

              // add(lines,'\uE000',charStyle)
              createLine(lines,width)
              spaceLeft = Math.max(0,width - (chunkbox.width - space))
           
             
              const fontScale = (charStyle.style.fontSize/opt.font.info.size);
              console.log('spaceLeft::::',chunk,chunks,chunks.length)//,chunkbox,spaceLeft,word,chunkbox.width)
  
              
              add(lines,chunk  ,charStyle)
              

              //  if((chunk.length-1 >  chunkbox.end) && opt.breakWords){
              //   // createLine(lines,100)
              //   spaceLeft = 0
              //   add(lines,chunk.substring(0,chunkbox.end+1));
              //   chunk =  chunk.substring(chunkbox.end+1,chunk.length)
              //   createLine(lines,width)
              //   add(lines,chunk.substring(0,chunkbox.end+1));
              //    console.log('spaceLeft::::',chunk,chunkbox,spaceLeft,word,chunkbox.width)
              //  }else{
                 
              //   add(lines,chunk)
              //  }
             
              //  debugger
              
             
              //  debugger
             
            }else{
              console.log('space:::',chunk,isLastChunk,fontScale,spaceLeft)
              if((chunkbox.width + space*fontScale*2 ) > spaceLeft){
                createLine(lines,width)
                spaceLeft = width -  chunkbox.width
                // chunks.shift();
              }
              // const bb = this.computeMetrics(' ',0,1,width,true,isLastChunk);
              // const fontScale = (charStyle.style.fontSize/opt.font.info.size);
              const bb = isLastChunk ? spaceWidth*2*fontScale : 0;
             
              // const fontScale = (charStyle.style.fontSize/opt.font.info.size);
             
              spaceLeft -= (chunkbox.width);
              add(lines, chunk+ (isLastChunk ? ' ' : ''),charStyle,true)
            }
           
           
            // spaceLeft = Math.max(0,width - chunkbox.width)//+space;
            // spaceLeft -= chunkbox.width//+space;
            // lines[lines.length - 1].end = 
            //   lines[lines.length - 1].start+lines[lines.length - 1].text.length;

            chunks.shift();
          }

          
          // return remaining space width

          
          return spaceLeft
        }
           currCharIdx += word.length+1;


        
        
        // if (wordBox.width > spaceLeft) {
        //         createLine(lines,width)
        //   }
        let chunks = (word.split(/(\u00AD|\uE000|\u0001)/g))
        
        // let chunks = (word.split(/(\u00AD|\uE000)/g)).filter(x=>x !=='')
        console.log('chunks:::::',chunks)
        spaceLeft = splitChunks(chunks,spaceLeft, width,lines)
        
        

        // debugger
      // fit's in textbox width
      } else{

        // createLine(lines,100)
       
        // const check = lines[lines.length - 1].text !== '' ? true: false
        // add(lines,check ? ' '+word: '' +word);
        // add(lines,' '+word);
        // add(lines, word+' ');
       

        // const charStyle2 = this.getCharStyles(curPen);
        const charStyle = this.getCharStyles(currChunkIdx);
        add(lines, word+' ',charStyle);
        // const charIdx = lines.reduce((res,{total=0})=>res+total,0);
        // const charStyle = this.getCharStyles(charIdx);
        const fontScale2 = (charStyle.style.fontSize/opt.font.info.size);
        const space = fontScale2*(spaceWidth + glyph.xoffset);
        // console.log('fontScale-fontScale',curPen, this.getCharStyles(curPen))
        spaceLeft -= wordBox.width + space

        currCharIdx += word.length;
        currChunkIdx = currCharIdx;
        // spaceLeft -= (wordBox.width + (check ? space: 0))
      }


      totalPen += wordLength + 1; // plus one for space!!


      
    }
    console.log('JSON - TEXTBOX',JSON.stringify(lines,null,' '))
    
    return lines;
  })//.reduce((arr,lines)=>[...arr,...lines]) // Combinatie van array-elementen door LF
  console.log('aaron:allLinesallLinesallLines',allLines[0]);
  return allLines[0]
}

//getters for the private vars
;['width', 'height', 
  'descender', 'ascender',
  'xHeight', 'baseline',
  'capHeight',
  'lineHeight' ].forEach(addGetter)

function addGetter(name) {
  Object.defineProperty(TextLayout.prototype, name, {
    get: wrapper(name),
    configurable: true
  })
}

function idxOf(text, chr, start, end) {
	var idx = text.indexOf(chr, start)
	if (idx === -1 || idx > end)
		return end
	return idx
}




//create lookups for private vars
function wrapper(name) {
  return (new Function([
    'return function '+name+'() {',
    '  return this._'+name,
    '}'
  ].join('\n')))()
}

function getGlyphById(font, id) {
  if (!font.chars || font.chars.length === 0)
    return null

  var glyphIdx = findChar(font.chars, id)
  if (glyphIdx >= 0)
    return font.chars[glyphIdx]
  return null
}

function getXHeight(font) {
  for (var i=0; i<X_HEIGHTS.length; i++) {
    var id = X_HEIGHTS[i].charCodeAt(0)
    var idx = findChar(font.chars, id)
    if (idx >= 0) 
      return font.chars[idx].height
  }
  return 0
}

function getMGlyph(font) {
  for (var i=0; i<M_WIDTHS.length; i++) {
    var id = M_WIDTHS[i].charCodeAt(0)
    var idx = findChar(font.chars, id)
    if (idx >= 0) 
      return font.chars[idx]
  }
  return 0
}

function getCapHeight(font) {
  for (var i=0; i<CAP_HEIGHTS.length; i++) {
    var id = CAP_HEIGHTS[i].charCodeAt(0)
    var idx = findChar(font.chars, id)
    if (idx >= 0) 
      return font.chars[idx].height
  }
  return 0
}

function getKerning(font, left, right) {
  if (!font.kernings || font.kernings.length === 0)
    return 0

  var table = font.kernings
  for (var i=0; i<table.length; i++) {
    var kern = table[i]
    if (kern.first === left && kern.second === right)
      return kern.amount
  }
  return 0
}

function getAlignType(align) {
  if (align === 'center')
    return ALIGN_CENTER
  else if (align === 'right')
    return ALIGN_RIGHT
  return ALIGN_LEFT
}

function findChar (array, value, start) {
  start = start || 0
  for (var i = start; i < array.length; i++) {
    if (array[i].id === value) {
      return i
    }
  }
  return -1
}