export function pages(glyphs) {
  const pages = new Float32Array(glyphs.length * 4 * 1);
  let i = 0;
  glyphs.forEach((glyph) => {
      var id = glyph.data.page || 0
      pages[i++] = id;
      pages[i++] = id;
      pages[i++] = id;
      pages[i++] = id;
    });
  return pages;
};

// VERTEX SIZE width x height
export function uvs(glyphs, texWidth, texHeight, flipY) {
  const uvs = new Float32Array(glyphs.length * 4 * 2);
  let i = 0;
  glyphs.forEach((glyph) => {
      var bitmap = glyph.data;
      var bw = (bitmap.x + bitmap.width);
      var bh = (bitmap.y + bitmap.height);
      // top left position
      var u0 = bitmap.x / texWidth;
      var v1 = bitmap.y / texHeight;
      var u1 = bw / texWidth;
      var v0 = bh / texHeight;
  
      if (flipY) {
        v1 = (texHeight - bitmap.y) / texHeight;
        v0 = (texHeight - bh) / texHeight;
      }

      // BL
      uvs[i++] = u0;
      uvs[i++] = v1;
      // TL
      uvs[i++] = u0;
      uvs[i++] = v0;
      // TR
      uvs[i++] = u1;
      uvs[i++] = v0;
      // BR
      uvs[i++] = u1;
      uvs[i++] = v1;
    });
  return uvs;
};

export function updatePositions(glyphs, sizes, infoFontSize, prevPositions) {
  let i = 0;
  let positions = prevPositions;
  glyphs.forEach((glyph) => {
      var bitmap = glyph.data;
      const size  = sizes[i]
      // console.log('sizesizesize',glyph.lineHeight,infoFontSize,glyph.position[1],glyph.line)
      const defaultSize = infoFontSize;
      // bottom left position
      var x = (glyph.position[0] + bitmap.xoffset);
      // var y = (glyph.lineHeight*defaultSize*glyph.line)+((glyph.position[1] + (bitmap.yoffset )) * size) ;//+  (50-bitmap.height*size);
      var y = glyph.position[1];//((glyph.lineHeight*defaultSize)*(glyph.line)) + (-defaultSize + bitmap.yoffset)*size ; //+  (50-bitmap.height*size);
      // quad size
      var w = bitmap.width * size;
      var h = bitmap.height * size;
     // BL
     positions[i++] = x;
     positions[i++] = y;
     // TL
     positions[i++] = x;
     positions[i++] = y + h;
     // TR
     positions[i++] = x + w;
     positions[i++] = y + h;
     // BR
     positions[i++] = x + w;
     positions[i++] = y;

    });
  return positions;
};

export function positions(glyphs, size, infoFontSize, offset) {
  var positionsBuffer = new Float32Array(glyphs.length * 4 * 2);
  var res = 1
  
  let i = 0;
  glyphs.forEach((glyph) => {
    const bitmap = glyph.data;
    // bottom left position
    const x = (glyph.position[0] * res ) + offset[0];
    const y = (glyph.position[1] * res ) + offset[1];

    // quad size
    const w = bitmap.width * size[i] / infoFontSize * res;
    const h = bitmap.height * size[i] / infoFontSize * res ;

    // const w = size[i] 
    // const h = size[i]
    // console.log('hhhh',glyph.position[1]);//y,h, (y+h),'<--->',bitmap.width,bitmap.height)

     // BL
     positionsBuffer[i++] = x;
     positionsBuffer[i++] = y;
     // TL
     positionsBuffer[i++] = x;
     positionsBuffer[i++] = y + h;
     // TR
     positionsBuffer[i++] = x + w;
     positionsBuffer[i++] = y + h;
     // BR
     positionsBuffer[i++] = x + w;
     positionsBuffer[i++] = y;
    });
    // debugger
  return positionsBuffer;
}


export function sizes(glyphs, opt, styles) {
  return glyphs.reduce((sizes, glyph, n) => {
    const charStyle = styles.styleAtIdx(n);
    const { fontSize } = charStyle.style;
    const {char} = glyphs;
    const size = fontSize ;
    sizes.set([
      size, size, // BL
      size, size, // TL
      size, size, // TR
      size, size, // BR
    ],n * (2 * 4 ))
    return sizes;
  }, new Float32Array(glyphs.length * 2 * 4));
};


export function colors(glyphs,opt, styles) {
    return glyphs.reduce((colors,glyph,n) => {
      const charStyle = styles.styleAtIdx(n);
      const { fill = [0, 0, 0] } = charStyle.style;
      let i = n * (3 * 4 );
      const {char} = glyph;
        const [R, G, B] = fill;
        colors[i++] = R;
        colors[i++] = G;
        colors[i++] = B;

        // TR
        colors[i++] = R;
        colors[i++] = G;
        colors[i++] = B;

        // BR
        colors[i++] = R;
        colors[i++] = G;
        colors[i++] = B;

        // BL
        colors[i++] = R;
        colors[i++] = G;
        colors[i++] = B;
        return colors;
    },new Float32Array(glyphs.length * 3 * 4));
};
