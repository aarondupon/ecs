import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { animationFrame } from 'rxjs/scheduler/animationFrame';
import reboundjs from 'rebound';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/merge';
// import plot from '../core/utils/dev/plot';
// import { getRandomColor } from '../core/utils/ColorUtil';

// const time = 0;
// let id = 0;

function rebound(dynamicFn = 'LINEAR', options = {}) {
  return this.lift(new ReboundOperator(dynamicFn, options));
}

class ReboundOperator {
  constructor(dynamicFn, options) {
    this.options = options;
    this.dynamicFn = dynamicFn;
  }
  call(subscriber, source) {
    return source.subscribe(new ReboundSubscriber(subscriber, this.dynamicFn, this.options));
  }
}


class ReboundSubscriber extends Subscriber {
  constructor(destination, dynamicFn, options:{}) {
    super(destination, options);
    this.options = options;
    this.dynamicFn = dynamicFn;
    this.springSystem = new reboundjs.SpringSystem();
    this.animationSpring = this.springSystem.createSpring(39, 1);

    // this.color = getRandomColor();
    this.id += 1;
  }
  next(value) {
    if (!this.listener) {
      
      this.listener = this.animationSpring.addListener({
        el: null,
        onSpringUpdate: (res) => {
          const val = res.getCurrentValue();
          this.destination.next(Math.floor(val));
        },
        onSpringAtRest:()=>{
          this.listener = false
          this.animationSpring.removeAllListeners()
        }
      });
    }
    this.animationSpring.setCurrentValue(Math.floor(this.value || value));
    this.animationSpring.setEndValue(Math.floor(value));
    this.value = value;
  }
  error(err) { this.destination.error(err); }
  complete() { this.destination.complete(); }
}




Observable.prototype.rebound = rebound;
