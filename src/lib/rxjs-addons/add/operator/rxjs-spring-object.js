import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { Subject } from 'rxjs/Subject';
import {BehaviorSubject} from 'rxjs/BehaviorSubject'
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
import 'rxjs/add/operator/switchMap';

import omit from 'lodash.omit';
import isequal from 'lodash.isequal';


// import plot from '../../../plot';


// Set the name of the hidden property and the change event for visibility
var hidden, visibilityChange; 
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
  hidden = "hidden";
  visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

let tweenPaused = false
// function handleVisibilityChange() {
//   if (document[hidden]) {
//     tweenPaused = true
//     document.title = 'Paused';
//   } else {
//     tweenPaused = false;

//   }
// }
// document.addEventListener('click',()=>{
//   tweenPaused = !tweenPaused;
// })

// // Warn if the browser doesn't support addEventListener or the Page Visibility API
// if (typeof document.addEventListener === "undefined" || hidden === undefined) {
//   console.log("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
// } else {
//   // Handle page visibility change   
//   document.addEventListener(visibilityChange, handleVisibilityChange, false);

// }


let time = 0;
/* Spring stiffness, in kg / s^2 */
const k = 16//4; // -4;
/* Damping constant, in kg / s */
const b = 3.5//3.5; // -1.5;


const PRECISION = 0.01;
const FPS = 60;

// const performance = window.performance || {};
// performance.now( = (function performancePolyfill() {
//   return Date.now(
// 		|| performance.mozNow
// 		|| performance.msNow
// 		|| performance.oNow
// 		|| performance.webkitNow
// 		|| Date.now;
//   /* none found - fallback to browser default */
// }());
function round(value, decimals = 2){
  return value
  // return +(Math.floor(value + "e+" + decimals)  + "e-" + decimals);
}
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i += 1) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
function getDampingValue(damp,prop){
  if(typeof (damp) === 'number'){
        return damp;            
  };
  if(typeof (damp) === 'object'){
      return damp[prop] || 1;
  };
  return 1;
}

function springFromToValue(from, to, speed, currentTime, k, b, damp, { next, cancel }) {
  let t = currentTime * speed;
  let current = from;
  console.log('springFromToValue')
  // loop over each propserty in to state

  Object.keys(to).forEach((property) => {
    if (Object.prototype.hasOwnProperty.call(from, property) &&
        property !== 'onComplete' && property !== 'mass' && property !== 'velocity' && property !== 'animate'
    ) {
      if (!current.velocity[property]) {
        Object.assign(current.velocity, { [property]: 0 });
      }
      

      // if(from[property] === 0 && to[property] === 0) {
      //   cancel(to)
      //   return to;
      // }
     // from[property] = Math.floor(from[property]/ PRECISION) * PRECISION;

     // prevents wild overshoot on initalize, because from and to values are te same
     // should go direct to new position, therfore t(time) is set to zero 
     let time = t;
     if(from[property] === to[property]){
        // time = 0;
      }
      
      to[property] = to[property]*getDampingValue(damp,property);
      // console.log(`getDampingValue(${damp},${property})`,getDampingValue(damp,property))
      // current spring value
      const s = -k * ((from[property] - to[property]));
      // current damping value
      const d = -b * (current.velocity[property]);
      // current acceleration value
      const a = (s + d) / current.mass;
      // update velocity  (semi-implicit euler!)
      current.velocity[property] += a * (time / 1000) * 1;
      // update position
      current[property] += current.velocity[property] * (time / 1000) * 1;
      // console.log('v',current.velocity[property])
      // current[property] = to[property];

      // Conditions for stopping the spring animation
       var isOvershooting = false;
       const _overshootClamping = true
       if ( _overshootClamping && k !== 0) {
        if (!current.isOvershooting[property]) {
          Object.assign(current.isOvershooting, { [property]: 0 });
        }

         if (current[property] < to[property]) {
           
           isOvershooting = current[property] > to[property];
          //  if(isOvershooting)console.log('isOvershooting  <',isOvershooting)
         } else {
         // console.log('isOvershooting',isOvershooting,current[property],to[property],k,_overshootClamping)
           isOvershooting = current[property] > to[property];
          // if(isOvershooting) console.log('isOvershooting >',isOvershooting)
         }
         current.isOvershooting[property] = current[property] - to[property];
       }
       if(isOvershooting){
        
        // console.log('isOvershooting',isOvershooting)
         
         
       }
      /* 
      // update position  (implicit euler! IS BAD https://gafferongames.com/post/integration_basics/)
      current[property] += current.velocity[property] * (t / 1000) * 1;
      // update velocity  
      current.velocity[property] += a * (t / 1000) * 1;
       */
      
      // round propety value
      // current[property] = Math.floor(current[property] * 1000) / 1000;
      // console.log('(to[property] - current[property])',(to[property] - current[property]),current.velocity[property])
      //if ( (current[property]),current.velocity[property] < 2 && Math.round(to[property] - current[property]) < 0  || Math.round(current.velocity[property] * 1000/1000) !== 0) {
      if (Math.abs(current.velocity[property]) < PRECISION){ 
      //  console.log('addTransition-2',Math.abs(current.velocity[property]),property,current[property],to)
        current[property] = to[property];
        
        // const toState = omit(to, ['onComplete','mass', 'velocity','animate']);
        // current[property] = to[property];
      }
    }
  });
  
  const fromState = omit(current, ['isOvershooting','onComplete','mass', 'velocity','animate']);
  const toState = omit(to, ['isOvershooting','onComplete','mass', 'velocity','animate']);
  // if(to.animate !==  undefined &&  to.animate === false) {
  //   cancel(to);//next(toState)//cancel(toState,toState)
  //   return toState;
  // }
//  if(isequal(fromState,toState)){
  const maxVelocity = Math.max(...Object.values(current.velocity).map(Math.abs))
  if (round(maxVelocity) < PRECISION || round(maxVelocity) === 0){ 

    cancel({...toState,isOvershooting:current.isOvershooting});
    return
  }
  if(JSON.stringify(fromState) !== JSON.stringify(toState)){ //<-- BAD very bad :(
      
      next({...fromState,isOvershooting:current.isOvershooting})
  }else{
    cancel({...toState,isOvershooting:current.isOvershooting});
    return
  }
  // next(fromState)
  return fromState;
}

let id = 0;



const withDefault = (value, defaultValue) =>
  value === undefined || value === null ? defaultValue : value
const tensionFromOrigamiValue = oValue => (oValue - 30) * 3.62 + 194
const frictionFromOrigamiValue = oValue => (oValue - 8) * 3 + 25
const fromOrigamiTensionAndFriction = (tension, friction) => ({
  tension: tensionFromOrigamiValue(tension),
  friction: frictionFromOrigamiValue(friction),
})


var springConfig = fromOrigamiTensionAndFriction(
      withDefault(170, 40),
      withDefault(26, 7)
)


class SpringObjectSubscriber extends Subscriber {
  constructor(destination, dynamicFn, options, scheduler = animationFrame) {
    super(destination, options);
    
    options instanceof BehaviorSubject 
      ? options.subscribe((options)=>this.parseOption(options))
      : this.parseOption(options)
 
    this.dynamicFn = dynamicFn;
    this.scheduler = scheduler;
    this.lastTime = Date.now();
    this.color = getRandomColor();
    this.animate = false;
    // id += 1;
    
    this.id = SpringObjectSubscriber.___id =  SpringObjectSubscriber.___id + 1 || 0 ;
    this.count = 0;
  }
  parseOption(options){
    this.options = options;  
    this.k = options.stiffness || options.tension || k;
    this.b = options.damping || options.friction || b;
    this.speed = options.speed || 1;
    this.mass = options.mass || 1;
    this.fps = options.fps || FPS ;
    this.interval = 1000/this.fps;

    // create damp object
    this.damp = options.damp;
   
   
  }
  error(err) {
    const { destination } = this;
    if (destination && destination.error) {
      this.destination.error(err);
    }
  }

  
  next(value) {
    // console.log(value)
    var props = {};
    this.type = this.type || typeof (value);

    if(this.type === 'number') {
      Object.assign(props, { value });
    } else {
     // props = value;//{...value}
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
        isOvershooting:{},
  		  velocity: props, // reset values to zero
  			mass: this.options.mass || 1,
  		};
      
    }
    this.to = { value };
    this.to = {
      ...props,
      velocity: props , // reset values to zero
      mass: this.options.mass || 1 ,
    };

  
    
    const fromState = omit(this.from, ['onComplete','mass', 'velocity','animate']);
   const toState = omit(this.to, ['onComplete','mass', 'velocity','animate']);
  //  if(JSON.stringify(fromState) === JSON.stringify(toState) ){
  //     // this.destination.next(toState);
  //     // this.step()
  //     this.destination.next(toState);
  //     this.raf = cancelAnimationFrame(this.raf);
  //     this.render = false;
  //     return;
  //   }

    if (!this.raf){//} && fromState !== toState) {
      this.render = true;
      this.lastTime = Date.now();
      this.raf  = this.requestAnimationFrame(this.step);
    }
    
  }
  /**
   * fps locked requestAnimationFrame
   * @param  {function} callback function
   * @return {Numer}           requestAnimationFramID
   */
  _lastTime = 0
  requestAnimationFrame = (callback) =>{
      const animate = () =>{
        const now = Date.now();
        const delta = now - this._lastTime;
         if (delta > this.interval) {
           this._lastTime = now - (delta % this.interval);
        //  if(this.to === undefined) debugger 
          if(this.to === null || this.to === undefined) console.error(`spring value is invalid for`,this)
          if(this.to !== undefined) {
            callback()
          }
          


        }
        if(this.render) {
          this.raf =  window.requestAnimationFrame(animate);
        }else{
          this.raf = window.cancelAnimationFrame(animate);
        }

      }
     return animate();
  }
  step = () => {
    time += 1;
    const { to, from, options, speed, k, b, damp } = this;
    const now = Date.now();
    let t = tweenPaused ? 0 : (now - this.lastTime) || 1;
    
   // hack prevents overshooting on initializing, because from and to ar set te same  
   /*
   const fromState = omit(from, ['isOvershooting','onComplete','mass', 'velocity','animate']);
   const toState = omit(to, ['isOvershooting','onComplete','mass', 'velocity','animate']);
   if(JSON.stringify(fromState) === JSON.stringify(toState) ){
      t = 0;

    }
    */

    this.lastTime = now;
    this.count ++
   
    springFromToValue(
      from, to, speed, t, k, b, damp,
      {
        next: (currentState) => {

          this.from = { ...this.from, ...currentState };
          const nextState = currentState;//Object.keys(currentState).map(key => (Math.floor(currentState[key] * 1000) / 1000));
        //  console.log('nextState',nextState)
          this.destination.next(nextState);
         
          if( typeof options.enter === 'function' ) options.enter(nextState)
          //this.render = true;
         // this.raf = this.requestAnimationFrame(this.step);
          //console.log('currentState',currentState)
          //plot('value'+this.id,time,10,'#32cd32')
        },
        cancel: (currentState) => {
          
          if( typeof options.complete === 'function' ) options.complete(currentState)
         // console.log(`Spring complete! {this.id}:  ${this.id} executed  in ${this.lastTime}`)
          this.render = false
          // console.log('currentState',currentState)
          this.destination.next(currentState);
          if(typeof currentState.onComplete === 'function'){
            currentState.onComplete()
          }
          
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

