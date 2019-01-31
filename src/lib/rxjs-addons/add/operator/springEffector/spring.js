import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
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

import createSolver from './gpuSolver';

let time = 0;
/* Spring stiffness, in kg / s^2 */
const k = 4; // -4;
/* Damping constant, in kg / s */
const b = 3.5; // -1.5;
const PRECISION = 0.001;
const FPS = 60;

let id = 0;


const sum  = (arr) => arr.reduce((a,b)=>a+b)

class EffectorSubscriber extends Subscriber {
  constructor(destination, options = {}, scheduler = animationFrame) {
    super(destination, options);
    this.options = options;
    this.step = this.step.bind(this);
    options instanceof BehaviorSubject
      ? options.subscribe((options) => this.parseOption(options))
      : this.parseOption(options);

    this.scheduler = scheduler;
    this.lastTime = performance.now();
    this.animate = false;
    this.id = id++;
    this.effectorSolver = createSolver(options);
    this.effectorSolver.tick(this.step);
  }

  parseOption(options) {
    this.options = options;
    this.k = options.stiffness || options.tension || k;
    this.b = options.damping || options.friction || b;
    this.speed = options.speed || 1;
    this.mass = options.mass || 1;
    this.fps = options.fps || FPS;
    this.interval = 1000 / this.fps;
    this.damp = options.damp || 1;
    this.dynamicFn = options.dynamicFn || 'spring';

  }

  next(value) {

    if(!this.createSpringUnit){
      this.ptr = this.effectorSolver.addSpring(value);
      this.createSpringUnit = true;
    }     
    this.effectorSolver.update(this.ptr, value);
    // this.destination.next(value);
    // console.log("value",value[2])
  }

  step(values) {
    // console.log('step',values)
    const stride = 4;
    const count = values.byteLength/stride
    
    if(values.byteLength > 0){
    //   const total = (sum(values)/count );
    //   const allowNext = Math.abs(total - (values[count-stride])) > PRECISION; // now index offset in solver
    //   const allowNext2 = Math.abs(this.prevValues - total) > PRECISION; // use index offset in solver
    //   if(allowNext || allowNext2 ){
        this.destination.next(values);
      // } 
      // this.prevValues = total;
    }
   
  }
}


export class EffectorOperator {
  constructor(options, dynamicFn, scheduler) {
    this.options = options;
    this.scheduler = scheduler;
  }
  call(subscriber, source) {
    return source.subscribe(new EffectorSubscriber(subscriber, this.options, this.scheduler));
  }
}
export function effector(options = {}, scheduler = animationFrame) {
  return this.lift(new EffectorOperator(options, scheduler));
}

export const springEffector = (options = {},scheduler = animationFrame) => (source) =>
  new Observable((observer) => {
    const innerSubsciber = new EffectorSubscriber(observer, options, scheduler);
    return source.subscribe(innerSubsciber)
  });


export default effector;