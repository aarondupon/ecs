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

export function positions(glyphs, sizes, infoFontSize, offset) {
  var positions = new Float32Array(glyphs.length * 4 * 2);
  let i = 0;
  glyphs.forEach((glyph) => {
    const bitmap = glyph.data;
    const size = sizes[i];
    // bottom left position
    const x = (glyph.position[0]) + offset[0];
    const y = glyph.position[1] + offset[1];

  
      // okay
    // quad size
    const w = bitmap.width * size;
    const h = bitmap.height * size;

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

export function sizes(opt, stylesMap) {
  let { text } = opt;
  text = text.replace(/<[^>]*>/g, '');
  var sizes = new Float32Array(text.length * 4 * 1);
  let i = 0;
  for (let n = 0; n < text.length; n += 1) {
    const charStyle = stylesMap.styleAtIdx(n);
    const { fontSize } = charStyle.style;
    const char = text.charAt(n);
    if (!/\u00AD/g.test(char)) {
      // size
      sizes[i++] = fontSize;
      sizes[i++] = fontSize;
      // TL
      sizes[i++] = fontSize;
      sizes[i++] = fontSize;
      // TR
      sizes[i++] = fontSize;
      sizes[i++] = fontSize;
      // BR
      sizes[i++] = fontSize;
      sizes[i++] = fontSize;
    }
  }
  return sizes;
};

export function colors(opt, styles) {
  let { text } = opt;// .replace(/\u00AD/g,'-');
  text = text.replace(/<[^>]*>/g, '');
  let colors = new Float32Array(text.length * 3 * 4);
  let i = 0;
  for (let n = 0; n < text.length; n += 1) {
    const charStyle = styles.styleAtIdx(n);
    const { fill = [0, 0, 0] } = charStyle.style;
    const char = text.charAt(n);
    if (!/\u00AD/g.test(char)) {
      const [R, G, B] = fill;
      
      // TL
      // if (charStyle.name === 'a') console.log('fillfill', fill, charStyle.name, charStyle);


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
    }
  }
  return colors;
};
