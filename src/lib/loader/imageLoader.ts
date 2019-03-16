import { Observable, concat , from } from 'rxjs';
import { concatMap, mergeMap, bufferCount, share, scan, first, tap } from 'rxjs/operators';
import * as img from 'img';

export default function loadImages(images:string[], type:string = 'parralel') {
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

