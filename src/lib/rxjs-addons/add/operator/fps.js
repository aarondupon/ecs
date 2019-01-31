import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

const performance = window.performance || {};
performance.now = (function performancePolyfill() {
  return performance.now
		|| performance.mozNow
		|| performance.msNow
		|| performance.oNow
		|| performance.webkitNow
		|| Date.now;
  /* none found - fallback to browser default */
}());
var id = 0
class FpsSubscriber extends Subscriber {
  constructor(destination, fps) {
    super(destination);
    this.fps = fps;
    this.lastTime = Date.now();//performance.now();
    this.interval = 1000/fps;
    this.id = id++
  }
  next(value) {
    const now = Date.now();
    const delta = now - this.lastTime;
    this.timeout && clearTimeout(this.timeout)
     if (delta > this.interval) {
      this.lastTime = now - (delta % this.interval);
      this.destination.next(value);
      this.timmeout = setTimeout(()=>this.destination.next(value),this.interval)
    }
  }
}

export class FpsOperator {
  constructor(fps) {
    this.fps = fps;
  }
  call(subscriber, source) {
    return source.subscribe(new FpsSubscriber(subscriber, this.fps));
  }
}

export function fps(fps) {
  return this.lift(new FpsOperator(fps));
}

Observable.prototype.fps = fps;

