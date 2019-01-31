import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { Subject } from 'rxjs/Subject';

import { animationFrame } from 'rxjs/scheduler/animationFrame';
// import { combineLatest } from 'rxjs/operator/combineLatest';

import 'rxjs/add/operator/take';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/debounceTime';
// import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';


class PauseSubscriber extends Subscriber {
  constructor(destination, notifier) {
    super();
    this._destination = destination;
    this.notifier = notifier;
    notifier.subscribe(paused=>{
      this.pause = paused;
      console.log('notifier.subscribe',this.pause)
    })  
  }
  pause = false;
  lastValue = 0
  complete =() =>{
    if( !this.pause) this._destination.complete()
  }
  next = (value) =>{
   if( !this.pause) {
      this._destination.next(value)
      this.lastValue = value
   }else{
     console.log('pause:pause')
      this._destination.next( this.lastValue )
   }
  }
}

export class PauseOperator {
  constructor(notifier) {
    this.notifier = notifier;
  }
  call(subscriber, source) {
    return source.subscribe(new PauseSubscriber(subscriber, this.notifier))
  }
}
  
export function pause(notifier) {
  return this.lift(new PauseOperator(notifier));
}

Observable.prototype.pause = pause;



// module.exports = {
//   spring,
//   SpringOperator,
// };

