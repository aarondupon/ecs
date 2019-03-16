import glTexture2d from 'gl-texture2d';
import behavior from '../../system/helpers/behavior';
import {  getTable } from '../../system/helpers/system';
import { default as loadImages } from '../../../lib/loader';

declare interface IFont{
  font: string;
  image: string;
}

declare interface IElement{
  uid: string;
  behaviors:string[];
}
function fontLoader(font) {
  return font;
}
export const fontLoaderBehavior = behavior(fontLoader);

// export const update = (gl:any, font:IFontData, camera:any, element:IElement) => {
// // console.log('update font')
// };

export const task = (font:IFont, element:IElement, complete, gl) => {
  const dataUrls = Object.keys(font).map(key => font[key]);
  return loadImages([font.image]).subscribe((images) => {
    const tex = glTexture2d(gl, images[0]);
    // var v = gl.getParameter(gl.ACTIVE_TEXTURE);
    // setup smooth scaling
    tex.bind();
    tex.generateMipmap();
    tex.minFilter = gl.LINEAR_MIPMAP_LINEAR;
    tex.magFilter = gl.LINEAR;
    // and repeat wrapping
    tex.wrap = gl.REPEAT;
    // minimize distortion on hard angles
    const ext = gl.getExtension('EXT_texture_filter_anisotropic');
    if (ext) {
      const maxAnistrophy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      tex.bind();
      gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(16, maxAnistrophy));
    }

    getTable('fontLoader').set(element.uid, { texture:tex });
    complete({ texture:tex });

  });
};
