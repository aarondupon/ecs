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
  const precision = 100000;
  // loop over each propserty in to state
  Object.keys(to).forEach((property) => {
    if (Object.prototype.hasOwnProperty.call(from, property) &&
        property !== 'mass' && property !== 'velocity'
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

      if (Math.round(current.velocity[property] * precision) !== 0) {
        next(current, property);
      } else {
        cancel(current, property);
      }
      return omit(current, ['mass', 'velocity']);
    }
    return omit(current, ['mass', 'velocity']);
  });
  return omit(current, ['mass', 'velocity']);
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
    id += 1;
    this.id = id;
  }
  next(value) {
    const props = {};
    
    // check if value has from & to propety
    // use from as fromState & to as toState
    const fromState = typeof value == 'number' ? undefined : value.from;
    const toState = typeof value == 'number' ? undefined : value.to
    
    // apply values to props
    if (typeof (value) === 'number') {
      // if number apply as prop.value  = Number(value)
      Object.assign(props, { value });
    } else {
      // if object apply as prop[key]  = Number(value)
      Object.keys(value).forEach((key) => {
        if (Array.isArray(value[key])) {
          [props[key]] = value[key];
        } else {
          props[key] = value[key];
        }
      });
    }
  
    // create  from values of spring
    
    // if from object always start from  fromState
    if (fromState) {
      this.from = {
        ...fromState,
  		  velocity: props, // reset values to zero
  			mass: this.options.mass || 1,
  		};
      this.destination.next(fromState);
    }
    // if no from state set initital state and return
    else if (!this.from) {  
      this.from = {
        ...props,
  		  velocity: props, // reset values to zero
  			mass: this.options.mass || 1,
  		};
      this.destination.next(props);
      return;
    }
    
    
    // create to values of spring
    // if to object set toState
    this.to = {
      ...props,
      ...toState,
      velocity: props , // reset values to zero
      mass: this.options.mass || 1 ,
    };
    
    
  

    // if (!this.raf) {
        // console.log('fromValue,toValue',value,this.from,'-->',this.to)
      this.lastTime = performance.now();
      this.step();
    // }
  }
  step = () => {
    time += 1;
    const { to, from } = this;
    const now = performance.now();
    const t = (now - this.lastTime) || 1;
    this.lastTime = now;

    springFromToValue(
      from, to, 2, t,
      {
        next: (currentState) => {
          this.from = { ...this.from, ...currentState };
          const nextState = currentState;//Object.keys(currentState).map(key => (Math.floor(currentState[key] * 1000) / 1000));
          this.destination.next(nextState);
          this.raf = window.requestAnimationFrame(this.step);
          // console.log('next',nextState)
          // plot('value'+this.id,time,v,'#32cd32')
        },
        cancel: () => {
          
          this.raf = cancelAnimationFrame(this.subscription);
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

export function spring(dynamicFn = 'LINEAR', options = {}, scheduler = animationFrame) {
  return this.lift(new SpringOperator(dynamicFn, options, scheduler));
}

Observable.prototype.springState = spring;

