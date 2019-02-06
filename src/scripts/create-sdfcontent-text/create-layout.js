// var wrap = require('word-wrapper-improved');
// var wordWrap = require('word-wrapper')
var xtend = require('xtend')
var number = require('as-number')

var X_HEIGHTS = ['x', 'e', 'a', 'o', 'n', 's', 'r', 'c', 'u', 'm', 'v', 'w', 'z']
var M_WIDTHS = ['m', 'w']
var CAP_HEIGHTS = ['H', 'I', 'N', 'E', 'F', 'K', 'L', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']


const hypen = /\u00AD/
const SPACE = ' '
var TAB_ID = '\t'.charCodeAt(0)
var SPACE_ID = ' '.charCodeAt(0)
var HYPEN_ID = '-'.charCodeAt(0)
var ALIGN_LEFT = 0, 
    ALIGN_CENTER = 1, 
    ALIGN_RIGHT = 2

var newline = /\n/
var whitespace = /\s/

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
  const noTagsText = newOptions.text.replace(/<[^>]*>/g,'');
  newOptions.text = noTagsText
  this.glyphs = []
  this.charStyles = charStyles
  this._measureOld = this.computeMetrics.bind(this)
  this.hypens = []

  this._measure = (string,measureSpace,style)=>this.computeMetrics(string, 0, string.length, newOptions.width+string.length, measureSpace, style)
  this.update(newOptions)
}
TextLayout.prototype.getCharStyles = function getCharStyles(charIdx){
  const {charStyles} = this;
  return charStyles.styleAtIdx(charIdx);
}
TextLayout.prototype.update = function(opt) {
  // console.log('TextLayout.prototype.update')
  opt = xtend({
    measure: this._measure,
    measureOld:this._measureOld,
    breakWord: false,
    // mode:'pre',
  }, opt)
  this._opt = opt

  this._opt.tabSize = number(this._opt.tabSize, 4)

  if (!opt.font)
    throw new Error('must provide a valid bitmap font')

  var glyphs = this.glyphs
  var text = opt.text;////.replace('</ml>','').replace('<ml>','')      || ''//.replace(/<\/?(ml)>/,'').replace(/<?(ml)>/,'') ||'' 

  var font = opt.font
  this._setupSpaceGlyphs(font);
  var lines = this.wordwrap(text,opt);
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
  var height = lineHeight * lines.length - descender
  var align = getAlignType(this._opt.align)

  //draw text along baseline
  y -= height
  
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
  // var hypensCountDirtyFIX =  0
  
  lines.forEach(function(line, lineIndex) {
   // if  hypens enabled text max lenght is not correct
    var start = line.start
    var end = line.end 
    var lineWidth = line.width
    var lastGlyph

    var maxLineHeight = 0;
    var maxFontSize = 0;
    if(lineIndex > 0){
      for (var i=start; i<end; i++) {
        var id = text.charCodeAt(charIdx2)
        var glyph = self.getGlyph(font, id)
        var char = text.charAt(charIdx2)
        var charStyle = self.getCharStyles(i);
        if(glyph){
          maxFontSize = Math.max(charStyle.style.fontSize,maxFontSize);
          const fontSize = charStyle.style.fontSize;
          const fontScale = font.info.size/fontSize;
          const lineHeight = Math.sqrt(fontSize)*Math.PI* 1.618*100 + charStyle.style.lineHeight;////(glyph.yoffset*fontSize) + charStyle.style.lineHeight ;
          maxLineHeight = Math.max(lineHeight,maxLineHeight);
        }
        charIdx2 ++
      }
    }
  
    for (var i=start; i<end; i++) {
      
      var id = text.charCodeAt(charIdx)
      var glyph = self.getGlyph(font, id)
      var char = text.charAt(charIdx)
      var charStyle = self.getCharStyles(i);
          
      if(!charStyle){
         charStyle = self.getCharStyles(start) || self.getCharStyles(0); 
      }
     
      const {fontSize} = charStyle.style;
            
      let ty = 0;
      
      /* if(isWhitespace(char)){      
      } */
     
      if(/\uE000/g.test(char)){
        const isLastChar = end-1 === i
        glyph = self.getGlyph(font, HYPEN_ID);
        !isLastChar && (glyph.xadvance = 0);
      }
      if(glyph){
        ty = y + maxLineHeight+   + (glyph.yoffset*fontSize) ;
        ty += -baseline*fontSize; // align baseline 

        if (lastGlyph) {
          x += getKerning(font, lastGlyph.id, glyph.id) 
          x += glyph.xoffset//*fontSize
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
          lineHeight:maxLineHeight,
          line: lineIndex
        })  

        x += (glyph.xadvance*fontSize + letterSpacing)
        // puls to left if x is zero
        if( i ===  start && id === SPACE_ID){
          x = 0
        }

        //move pen forward
        lastGlyph = glyph
      }
      charIdx +=1
    }
    //next line down
    y += maxLineHeight
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
  if (glyph)
    return glyph
  else if (id === TAB_ID) 
    return this._fallbackTabGlyph
  else if (id === SPACE_ID) 
    return this._fallbackSpaceGlyph
  return null
}

TextLayout.prototype.computeMetrics = function(text, start, end, width,measureSpace=false,style) {
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

  end = Math.min(text.length, end)
  for (var i=start; i < end; i++) {
    var id = text.charCodeAt(i)
    var glyph = this.getGlyph(font, id)
    var charStyle = style || this.getCharStyles(i);

    if(!charStyle){
       charStyle = this.getCharStyles(start) || this.getCharStyles(0); 
    }

    const {fontSize} = charStyle.style;
    
    if (glyph) {
      //move pen forward
      const fontScale = (fontSize/font.info.size);

      var xoff = glyph.xoffset;
      var kern = lastGlyph ? getKerning(font, lastGlyph.id, glyph.id) : 0
      curPen += kern * fontScale;

      var nextPen = curPen + ((glyph.xadvance + letterSpacing) * fontScale);
      var nextWidth = curPen + (( glyph.width) * fontScale);

      if(measureSpace && id === SPACE_ID){
        const spaceWidth = glyph.xadvance
        nextWidth += (spaceWidth + glyph.xoffset)*fontScale;
      }
      if (nextWidth >= width || nextPen >= width){
      }
      //we've hit our limit; we can't move onto the next glyph
      if (nextWidth >= width || nextPen >= width){
        break
      }
      //otherwise continue along our line
      curPen = nextPen
      curWidth = nextWidth
      lastGlyph = glyph
    }
    count++
  }
  //make sure rightmost edge lines up with rendered glyphs
  if (lastGlyph)
    curWidth += lastGlyph.xoffset

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
TextLayout.prototype.wordwrap = function(text,opt) {
  const {width = 80, br = '\n',measure} = opt;
  const lines = [];
  let curPen = 0;

  // const noTagsText = text.replace(/<[^>]*>/g,'');
  return text.split('\n').map((line,i) => {
    const words = line.split(/(\s*\s)+?/).filter(x=>(x !=='' && x !==' '));;
    const lineIdx = 0;
    let spaceLeft = width;
    const letterSpacing =  opt.letterSpacing || 0;
    const charCode = ' '.charCodeAt(0)
    const char = ' '.charCodeAt(0)
    const glyph = this.getGlyph(opt.font, SPACE_ID)
    const spaceWidth = glyph.xadvance
    const charIdx = lines.reduce((res,{total=0})=>res+total,0);
    const charStyle = this.getCharStyles(charIdx);
    const fontScale = (charStyle.style.fontSize/opt.font.info.size);
    const space = fontScale*(spaceWidth + glyph.xoffset);

    function createLine(lines, width){
      const line  = {
        id:lines.length+1,
        text:'',
        start:  lines[lines.length - 1] ? lines[lines.length - 1].end : 0,
        width:width,
        total:0,
      };
      lines.push(line);
      spaceLeft = width;
    }
     // creaet the first line
    createLine(lines,width)
    
    function add(lines, text){
      const curLine =  lines[lines.length - 1];
      curLine.text +=  text;
      curLine.total = curLine.text.length;
      curLine.end =  curLine.start + curLine.text.length;
    }
       
    for (const origWord of words) {
      
      let word = origWord;
      
      word = word.replace(/(\uE000)/g,'\u00AD') // hack fo fix hidden hypens and styling
      curPen = lines[lines.length - 1].start+lines[lines.length - 1].text.length;
      const charStyle = this.getCharStyles(curPen);     
      const wordBox =  measure(word.replace(/(\u00AD)/g),true,charStyle);
      // doesn't fit splt in chucks and try again please!
      if (wordBox.width > spaceLeft) { 
        const splitChunks = (chunks,startSpaceLeft,width,lines,deep) =>{
          let spaceLeft = startSpaceLeft;
          chunks[0] = ' '+chunks[0];
          // lines[lines.length - 1].end += 1
          while(chunks.length > 0){
            const chunk = chunks[0];
            // curPen += chunk.length
            const charStyle = this.getCharStyles(curPen);
            const chunkbox = measure(chunk+'-',true,charStyle);
            // create new line if chunk doesn't fit
            if (chunkbox.width > spaceLeft) {
               createLine(lines,width)
               spaceLeft = width
            }
            add(lines,chunk)
            spaceLeft -= chunkbox.width//+space;
            // lines[lines.length - 1].end = 
            //   lines[lines.length - 1].start+lines[lines.length - 1].text.length;

            chunks.shift();
          }
          // return remaining space width
          return spaceLeft
        }
        let chunks = (word.split(/(\u00AD)/g))
        spaceLeft = splitChunks(chunks,spaceLeft, width,lines)
      // fit's in textbox width
      } else{
        const check = lines[lines.length - 1].text !== '' ? true: false
        add(lines,check ? ' '+word: word)
        spaceLeft -= (wordBox.width + (check ? space: 0))
      }
    }
    console.log('JSON - TEXTBOX',JSON.stringify(lines,null,' '))
    return lines;
  }).reduce((arr,lines)=>[arr,...lines]) // Combinatie van array-elementen door LF
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