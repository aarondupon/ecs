import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { animationFrame } from 'rxjs/scheduler/animationFrame';
import omit from 'lodash.omit';
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



let time = 0;
/* Spring stiffness, in kg / s^2 */
const k = 4; // -4;
/* Damping constant, in kg / s */
const b = 3.5; // -1.5;


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
  for (let i = 0; i < 6; i += 1) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function springFromToValue(from, to, speed, currentTime, { next, cancel }) {
  const t = currentTime * speed;
  const current = from;
  // loop over each propserty in to state
  Object.keys(to).forEach((property) => {
    if (Object.prototype.hasOwnProperty.call(from, property) &&
        property !== 'mass' && property !== 'velocity' && property !== 'animate'
    ) {
      if (!current.velocity[property]) {
        Object.assign(current.velocity, { [property]: 0 });
      }

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
      // round propety value
      // current[property] = Math.floor(current[property] * 1000) / 1000;

      if (Math.round(current.velocity[property] * 1000) !== 0) {
        
      } else {
        // cancel(current, property);
        // current[property] = 0
        current[property] = to[property];
      }
    }
  });
  
  const fromState = omit(current, ['mass', 'velocity','animate']);
  const toState = omit(to, ['mass', 'velocity','animate']);
  if(to.animate !==  undefined &&  to.animate === false) {
    next(toState)//cancel(toState,toState)
    return toState;
  }
  if(JSON.stringify(fromState) === JSON.stringify(toState)){
    cancel(fromState);
    return fromState;
  }
  next(fromState)
  return fromState;
}

let id = 0;
class SpringObjectSubscriber extends Subscriber {
  constructor(destination, dynamicFn, options:{}, scheduler = animationFrame) {
    super(destination, options);
    this.options = options;
    this.dynamicFn = dynamicFn;
    this.scheduler = scheduler;
    this.lastTime = performance.now();
    this.color = getRandomColor();
    id += 1;
    this.id = id;
  }
  next(value) {
    
    const props = {};

    if (typeof (value) === 'number') {
      Object.assign(props, { value });
    } else {
      Object.keys(value).forEach((prop) => {
        if (Array.isArray(value[prop])) {
          [props[prop]] = value[prop];
        } else {
          props[prop] = value[prop];
        }
      });
    }
    
    if (!this.from) {
      this.from = {
        ...props,
  		  velocity: props, // reset values to zero
  			mass: this.options.mass || 1,
  		};
      this.destination.next(props);
      return;
    }
    this.to = { value };
    this.to = {
      ...props,
      velocity: props , // reset values to zero
      mass: this.options.mass || 1 ,
    };
  
    
    
    if (!this.raf) {
      this.lastTime = performance.now();
      this.raf  = window.requestAnimationFrame(this.step);
    }
  }
  step = () => {
    time += 1;
    const { to, from, options } = this;
    const now = performance.now();
    const t = (now - this.lastTime) || 1;
    this.lastTime = now;
    
    springFromToValue(
      from, to, 6, t,
      {
        next: (currentState) => {
          this.from = { ...this.from, ...currentState };
          const nextState = currentState;//Object.keys(currentState).map(key => (Math.floor(currentState[key] * 1000) / 1000));
          this.destination.next(nextState);
          if( typeof options.enter === 'function' ) options.enter(nextState)
          this.raf = window.requestAnimationFrame(this.step);
          
          // plot('value'+this.id,time,v,'#32cd32')
        },
        cancel: (currentState) => {
          if( typeof options.complete === 'function' ) options.complete(currentState)
          this.raf = cancelAnimationFrame(this.subscription);
        },
      },
    );
  }
}

export class SpringObjectOperator {
  constructor(dynamicFn, options, scheduler) {
    this.options = options;
    this.dynamicFn = dynamicFn;
    this.scheduler = scheduler;
  }
  call(subscriber, source) {
    return source.subscribe(new SpringObjectSubscriber(subscriber, this.dynamicFn, this.options, this.scheduler));
  }
}

export function springObject(options = {}, scheduler = animationFrame) {
  const defaults ={dynamicFn:'LINEAR',...options}
  return this.lift(new SpringObjectOperator(defaults.dynamicFn, options, scheduler));
}

Observable.prototype.springObject = springObject;

