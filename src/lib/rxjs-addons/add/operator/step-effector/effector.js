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

import * as createSolver from './gpuSolver';

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
  constructor(destination, options = {}, dynamicFn, scheduler = animationFrame) {
    super(destination, options);
    this.options = options;
    options instanceof BehaviorSubject
      ? options.subscribe((options) => this.parseOption(options))
      : this.parseOption(options);

    this.dynamicFn = dynamicFn;
    this.scheduler = scheduler;
    this.lastTime = performance.now();
    this.animate = false;

    this.id = id++;
    this.effectorSolver = createSolver();
    this.step = this.step.bind(this);
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
  }

  next(value) {
    if (!this.createSpringUnit) {
      this.effectorSolver.addSpring(value);
      this.createSpringUnit = true;
    }

    this.effectorSolver.update((this.id), value);
  }

  step(values) {
    // const stride = 4;
    // const count = values.byteLength / stride
    if (values.byteLength > 0) {
      // const allowNext =  Math.abs((sum(values)/count )- (values[count-stride]));
      // if(allowNext  > PRECISION){
      this.destination.next(values);
    }
    // }
  }
}

export class EffectorOperator {
  constructor(options, dynamicFn, scheduler) {
    this.options = options;
    this.dynamicFn = dynamicFn;
    this.scheduler = scheduler;
  }

  call(subscriber, source) {
    return source.subscribe(new EffectorSubscriber(subscriber, this.options, this.dynamicFn, this.scheduler));
  }
}

export function effector(options = {}, dynamicFn = 'LINEAR', scheduler = animationFrame) {
  return this.lift(new EffectorOperator(options, dynamicFn, scheduler));
}


export const stepEffector = (options = {}, dynamicFn = 'LINEAR', scheduler = animationFrame) => (source) =>
  new Observable((observer) => {
    const v = new EffectorSubscriber(observer, options, dynamicFn, scheduler);
    
    return source.subscribe(v)
  });


export default effector;


