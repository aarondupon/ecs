module.exports.pages = function pages (glyphs) {
  var pages = new Float32Array(glyphs.length * 4 * 1)
  var i = 0
  glyphs.forEach(function (glyph) {
    var id = glyph.data.page || 0
    pages[i++] = id
    pages[i++] = id
    pages[i++] = id
    pages[i++] = id
  })
  return pages
}

// VERTEX SIZE width x height 
module.exports.uvs = function uvs (glyphs, texWidth, texHeight, flipY) {
  var uvs = new Float32Array(glyphs.length * 4 * 2)
  var i = 0
  glyphs.forEach(function (glyph) {
    var bitmap = glyph.data
    var bw = (bitmap.x + bitmap.width)
    var bh = (bitmap.y + bitmap.height)
    // top left position
    var u0 = bitmap.x / texWidth
    var v1 = bitmap.y / texHeight
    var u1 = bw / texWidth
    var v0 = bh / texHeight

    if (flipY) {
      v1 = (texHeight - bitmap.y) / texHeight
      v0 = (texHeight - bh) / texHeight
    }
  


    // BL
    uvs[i++] = u0
    uvs[i++] = v1
    // TL
    uvs[i++] = u0
    uvs[i++] = v0
    // TR
    uvs[i++] = u1
    uvs[i++] = v0
    // BR
    uvs[i++] = u1
    uvs[i++] = v1
  })
  return uvs
}

module.exports.updatePosition = function positions (glyphs,sizes,infoFontSize,positions) {
  var i = 0;  
  glyphs.forEach(function (glyph) {
    var bitmap = glyph.data
    const size  = sizes[i]
    // console.log('sizesizesize',glyph.lineHeight,infoFontSize,glyph.position[1],glyph.line)
    const defaultSize = infoFontSize;
    // bottom left position
    var x = (glyph.position[0] + bitmap.xoffset) ;
    // var y = (glyph.lineHeight*defaultSize*glyph.line)+((glyph.position[1] + (bitmap.yoffset )) * size) ;//+  (50-bitmap.height*size);
    var y = glyph.position[1];//((glyph.lineHeight*defaultSize)*(glyph.line)) + (-defaultSize + bitmap.yoffset)*size ; //+  (50-bitmap.height*size);
    // quad size
    var w = bitmap.width * size;
    var h = bitmap.height * size
   // BL
   positions[i++] = x 
   positions[i++] = y
   // TL
   positions[i++] = x;
   positions[i++] = y + h
   // TR
   positions[i++] = x + w
   positions[i++] = y + h
   // BR
   positions[i++] = x + w
   positions[i++] = y

  })
  return positions
}
module.exports.positions = function positions (glyphs,sizes,infoFontSize) {
 
  var positions = new Float32Array(glyphs.length * 4 * 2)
  var i = 0
  glyphs.forEach(function (glyph,n) {
    console.log('aarondpuon:position',n,String.fromCharCode(glyph.data.id))
    var bitmap = glyph.data
    const size  = sizes[i]
    // console.log('sizesizesize',glyph.lineHeight,infoFontSize,glyph.position[1],glyph.line)
    const defaultSize = infoFontSize;
    // bottom left position
    var x = (glyph.position[0]) //*  (defaultSize) ;
    // var y = (glyph.lineHeight*defaultSize*glyph.line)+((glyph.position[1] + (bitmap.yoffset )) * size) ;//+  (50-bitmap.height*size);
  //  console.log('glyph.lineHeight',glyph.lineHeight)
    var y = glyph.position[1];//((glyph.lineHeight*defaultSize)*(glyph.line)) + (-defaultSize + bitmap.yoffset)*size ; //+  (50-bitmap.height*size);
    // okay
    // var y = ((glyph.lineHeight*defaultSize)*(glyph.line)) + (-defaultSize + bitmap.yoffset)*size ; //+  (50-bitmap.height*size);


    // console.log('bitmap.yoffset:',glyph.position[1] ,lineHeight,lineHeight*glyph.line)//,glyph,size, bitmap.yoffset,i/8,y, glyph.position[1])

    // quad size
    var w = bitmap.width * size;
    var h = bitmap.height * size
  
   // BL
   positions[i++] = x 
   positions[i++] = y
   // TL
   positions[i++] = x
   positions[i++] = y + h
   // TR
   positions[i++] = x + w
   positions[i++] = y + h
   // BR
   positions[i++] = x + w
   positions[i++] = y

    // // BL
    // positions[i++] = x 
    // positions[i++] = y
    // // TL
    // positions[i++] = x
    // positions[i++] = y + h
    // // TR
    // positions[i++] = x + w
    // positions[i++] = y + h
    // // BR
    // positions[i++] = x + w
    // positions[i++] = y
  })
  return positions
}

module.exports.sizes = function sizes (opt,styles,charStyles) {
  let text = opt.text;
  text = text.replace(/<[^>]*>/g,'');
  var sizes = new Float32Array(text.length * 4*2);
  let i = 0
  for (var n=0; n < text.length; n += 1) {
  
    const charStyle = styles.styleAtIdx(n);
    const {fontSize} = charStyle.style;
    const char = text.charAt(n);
    if(!/\u00AD/g.test(char)){
    // size
    sizes[i++] = fontSize
    sizes[i++] = fontSize
    // TL
    sizes[i++] = fontSize
    sizes[i++] = fontSize
    // TR
    sizes[i++] = fontSize
    sizes[i++] = fontSize
    // BR
    sizes[i++] = fontSize
    sizes[i++] = fontSize
    }
  }
  return sizes;
}

module.exports.colors = function colors (opt,styles) {
  let text = opt.text//.replace(/\u00AD/g,'-');
  text = text.replace(/<[^>]*>/g,'');
  var colors = new Float32Array(text.length * 12);
  let i = 0
  for (var n=0; n < text.length; n += 1) {
  
    const charStyle = styles.styleAtIdx(n);
    const {fontSize,fill=[0,0,0]} = charStyle.style;
    const char = text.charAt(n)
    if(!/\u00AD/g.test(char)){
      const [R,G,B] = fill;
     
        // TL
      if (charStyle.name === 'a')  console.log('fillfill',fill,charStyle.name,charStyle)
        

      colors[i++] = R
      colors[i++] = G
      colors[i++] = B

        // TR
      colors[i++] = R
      colors[i++] = G
      colors[i++] = B

        // BR
      colors[i++] = R
      colors[i++] = G
      colors[i++] = B

        // BL
      colors[i++] = R
      colors[i++] = G
      colors[i++] = B
    }
  }
  return colors;
}
module.exports.colors1 = function colors (charStyles) {

  // console.log('charStyles',charStyles)
  var colors = new Float32Array(charStyles.length *  4)
  var i = 0
  charStyles.forEach(function (charStyle) {
    // console.log('nnnnn',charStyle.char,charStyle.style)
    // const {color} = charStyle.style
   
    console.log('color',color)
    // const fontSize = 100;
    // size
    colors[i++] =1
    colors[i++] = 1
    // TL
    colors[i++] = 0
    colors[i++] = 0.


    


  })


  return colors
}
