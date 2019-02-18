import { vec3, mat4 } from 'gl-matrix';
import glTexture2d from 'gl-texture2d';
import { Observable, concat , from } from 'rxjs';
import { concatMap, mergeMap, bufferCount, share, scan, first, tap } from 'rxjs/operators';
import behavior from '../../system/helpers/behavior';
import { getComponent } from '../../system/helpers/system';
import { Context } from 'vm';
// import * as loadFont from 'load-bmfont';
import * as img from 'img';

export const LIBRARY = new Map<string, IFont>();

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

declare interface Texture2D{
  width:number;
  height:number;
  type:number;
}
declare interface IFontData {
  texture:Texture2D;
}
export const update = (gl:any, font:IFontData, camera:any, element:IElement) => {

};

export const task = (font:IFont, element:IElement, complete, gl) => {

  // cont gl  = getContext()
  console.log('fontfontfontfont', font);
  const loadImages = (images:string[], type:string = 'parralel') => {
  // https://stackblitz.com/edit/rxjs-image-downloader?file=src%2Fapp%2Fimage-loader.service.ts

    const sequence = (images: string[]): Observable<HTMLImageElement> => {
      return from(images).pipe(
      concatMap(src => this.loadImage(src)),
    );
    };

    const loadParallel = (images: string[]): Observable<HTMLImageElement> => {
      return from(images).pipe(
      mergeMap(src => loadImage(src)),
    );
    };

    const loadBatch = (images: string[]): Observable<HTMLImageElement> => {
      return from(images).pipe(
      bufferCount(3),
      concatMap(paths => this.loadInParallel(paths)),
    );
    };

    const loadImage = (src:string):Observable<HTMLImageElement> => {
      return Observable.create(observable => {
        return img(src, {}, (error, image) => {
          if (error) {
            console.error(error);
          }
          observable.next(image);
          observable.complete();
        });
      });
    };

  // const sequence = sequence(this.imagesSequence);
  // const parallel= parallel(this.imagesParallel);
  // const batch = batch(this.imagesBatch);
    const parallel = loadParallel(images);
    const all = concat(parallel).pipe(share());
  // const all = concat(sequence, parallel, batch ).pipe(share());

    const aggregate = all.pipe(
    scan((acc: HTMLImageElement[], img: HTMLImageElement) => acc.concat([img]), []),
    share(),
  );
  // const firstImage$ = sequence.pipe(first(), tap(img => console.log('first')));

    return aggregate;

  };

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

    complete({ texture:tex });

  });
};
