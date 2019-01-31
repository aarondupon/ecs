import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import { animationFrame } from 'rxjs/scheduler/animationFrame';

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

const PRECISION = 0.05;
const FPS = 60;

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

function round(value, decimals = 2){
  return +(Math.round(value + "e+" + decimals)  + "e-" + decimals);
}

function springFromToValue(from, to, speed, currentTime, k, b,damp, { next, cancel }) {
  const t = currentTime * speed;
  const current = from;
  const property = 'value';
  // const currentValue = from[property];
  const fromValue = from[property]; 
  to[property] = to[property]*damp;
  const toValue = to[property];
  const mass = current.mass;
  const velocity = current.velocity[property];
  // current spring value
  const s = -k * ((fromValue - toValue));
  // current damping value
  const d = -b * (velocity);
  // current acceleration value
  const a = (s + d) / mass;
  // update velocity
  current.velocity[property] += a * (t / 1000) * 1;
  // update position
  current[property] += current.velocity[property] * (t / 1000) * 1;
  
  if ( round(Math.abs(current.velocity[property])) < PRECISION){//} || current[property] !== 0) {
     
      if(damp === 1){
        cancel(to[property]);
       }else{
        cancel(0);
       } 
       return;
  }
  if(current[property] !== from) next(current);

  return current;
}

let id = 0;
class SpringSubscriber extends Subscriber {
  constructor(destination, options = {}, dynamicFn , scheduler = animationFrame) {
    super(destination, options);
    this.options = options;
    options instanceof BehaviorSubject 
      ? options.subscribe((options)=>this.parseOption(options))
      : this.parseOption(options)
 
    this.dynamicFn = dynamicFn;
    this.scheduler = scheduler;
    this.lastTime = performance.now();
    this.color = getRandomColor();
    this.animate = false;

    this.id = id++;
  }
  parseOption(options){
    this.options = options;  
    this.k = options.stiffness || options.tension || k;
    this.b = options.damping || options.friction || b;
    this.speed = options.speed || 1;
    this.mass = options.mass || 1;
    this.fps = options.fps || FPS ;
    this.interval = 1000/this.fps;
    this.damp = options.damp || 1;
  }
  next(value) {
    const props = {value};
    // if (typeof (value) === 'number') {
    //   Object.assign(props, { value });
    // } else {
    //   Object.assign(props, value);
    // }
    if (!this.from) {
      this.from = {
        ...props,
        velocity: { value: 0 }, //<---- ZERO ZEEEEE RRRRRR ROOOOOO!
  		  // velocity: props , // reset values to zero
  			mass: this.options.mass || 1,
      };
      // return
    }

    this.to = { value };
    this.to = {
      ...props,
      velocity: props, // reset values to zero
      mass: this.options.mass || 1,
    };

    if (!this._rafFPS) {
      this._rafFPS = true;
      //this.lastTime = performance.now()
      this.requestAnimationFrame();//this.step();
    }
  }
  /**
   * fps locked requestAnimationFrame
   * @param  {function} callback function
   * @return {Numer}           requestAnimationFramID
   */
  _lastTime = 0
  // requestAnimationFrame = (callback) =>{
      
      
  //    return animate();
  // }
  requestAnimationFrame = ()=>{
    const now = performance.now();
    const delta = now - this._lastTime;
     if (delta > this.interval) {
       this._lastTime = now - (delta % this.interval);
       this.step();
    
    }
    
   
    if(this._rafFPS) {
      this.raf  = window.requestAnimationFrame(this.requestAnimationFrame);
    }else{
      window.cancelAnimationFrame(this.raf);
    }

  }
  step=()=>{
    // time += 1;
    const { to, from, speed,k, b, damp} = this;
    const now = performance.now();
    const t = (now - this.lastTime) || 1;
    this.lastTime = now;
    
    springFromToValue(
      from, to, speed, t,k, b, damp,
      {
        next: (current) => {
          this.from = { ...this.from, ...current };
          // const v = Math.floor(current.value / PRECISION) * PRECISION;
          this.destination.next(current.value);
         
          // this.raf = this.requestAnimationFrame(this.step);
          // plot('value'+this.id,time,v,'#32cd32')
        },
        cancel: (to) => {
          this._rafFPS = false;
          // const value = Math.floor(to* 1/PRECISION)*PRECISION;
       
          this.destination.next(to);
         
        },
      },
    );
  }
}

export class SpringOperator {
  constructor( options, dynamicFn, scheduler) {
    this.options = options;
    this.dynamicFn = dynamicFn;
    this.scheduler = scheduler;
  }
  call(subscriber, source) {
    return source.subscribe(new SpringSubscriber(subscriber,this.options, this.dynamicFn, this.scheduler));
  }
}

export function spring(options = {}, dynamicFn = 'LINEAR', scheduler = animationFrame) {
  return this.lift(new SpringOperator(options, dynamicFn, scheduler));
}

Observable.prototype.spring = spring;

export default spring;

// module.exports = {
//   spring,
//   SpringOperator,
// };

