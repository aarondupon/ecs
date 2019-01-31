import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { animationFrame } from 'rxjs/scheduler/animationFrame';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/debounceTime';
// import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/merge';


// import plot from '../../core/utils/dev/plot';

// let time = 0;
/* Spring stiffness, in kg / s^2 */
const k = 20; // -4;
/* Damping constant, in kg / s */
const b = 7.5; // -1.5;


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

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


function springFromToValue(from, to, speed, currentTime, { next, cancel }) {
  const t = currentTime * speed;
  const current = from;
  const property = 'value';
  const precision = 100;
  // current spring value
  const s = -k * ((from[property] - to[property]));
  // current damping value
  const d = -b * (current.velocity[property]);
  // current acceleration value
  const a = (s + d) / current.mass;
  // update velocity
  current.velocity[property] += a * (t / 1000) * 1;
  // update position
  current[property] += current.velocity[property] * (t / 1000) * 1;
  if (Math.round(current.velocity[property] * precision) !== 0) {
    next(current);
  } else {
    cancel(current);
  }

  return current;
}

let id = 0;
class SpringSubscriber extends Subscriber {
  constructor(destination, dynamicFn, options:{}, scheduler = animationFrame) {
    super(destination, options);
    this.options = options;
    this.dynamicFn = dynamicFn;
    this.scheduler = scheduler;
    this.lastTime = performance.now();
    this.color = getRandomColor();
    this.id = id++;
  }
  next(value) {
    const props = {};
    
    const fromValue = typeof value == 'number' ? undefined : value.from;
    const toValue = typeof value == 'number' ? undefined : value.to
    
    if (typeof (value) === 'number') {
      Object.assign(props, { value });
    } else {
        
        toValue ? Object.assign(props, toValue) : Object.assign(props, value);
    }
    
    
    if (!this.from ) {
      this.from = {
        ...props,
        ...value.from,
        velocity: { value: 1 },
  		  // velocity: props , // reset values to zero
  			mass: this.options.mass || 1,
  		};
      
      
    }
    // this.to = { value };
    this.to = {
      ...props,
      ...value.to,
      velocity: props, // reset values to zero
      mass: this.options.mass || 1,
    };
    
    if (!this.raf) {
      this.lastTime = performance.now()
      this.step();
    }
  }
  step = () => {
    // time += 1;
    const { to, from, options } = this;
    const now = performance.now();
    const t = (now - this.lastTime) || 1;
    this.lastTime = now;

    springFromToValue(
      from, to, 2, t,
      {
        next: (current) => {
          this.from = { ...this.from, ...current };
          const v = Math.floor(current.value * 1000) / 1000;
          this.destination.next(v);
          if( typeof options.enter === 'function' ) options.enter(v)

          this.raf = window.requestAnimationFrame(this.step);
          // plot('value'+this.id,time,v,'#32cd32')
        },
        cancel: () => {
          const v = Math.floor(to.value * 100) / 100;
          if( typeof options.complete === 'function' ) options.complete(v)
          // this.destination.complete()
          this.raf  = cancelAnimationFrame(this.subscription);
        },
      },
    );
  }
}

export class SpringOperator {
  constructor(dynamicFn, options, scheduler) {
    this.options = options;
    this.dynamicFn = dynamicFn;
    this.scheduler = scheduler;
  }
  call(subscriber, source) {
    return source.subscribe(new SpringSubscriber(subscriber, this.dynamicFn, this.options, this.scheduler));
  }
}

export function spring(options = {dynamicFn:"LINEAR"}, scheduler = animationFrame) {
  return this.lift(new SpringOperator(options.dynamicFn, options, scheduler));
}

Observable.prototype.spring = spring;



// module.exports = {
//   spring,
//   SpringOperator,
// };

