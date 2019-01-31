import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';
import {Subject} from 'rxjs/Subject';
import {BehaviorSubject} from 'rxjs/BehaviorSubject'
import {animationFrame} from 'rxjs/scheduler/animationFrame';
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

import plot from '../../../plot';

let time = 0;
/* damp stiffness, in kg / s^2 */
const k = 16 //4;  -4;
/* Damping constant, in kg / s */
const b = 6 //3.5;  -1.5;
const PRECISION = 0.05;
const FPS = 30;
// const performance = window.performance || {}; performance.now( = (function
// performancePolyfill() {   return Date.now( 		|| performance.mozNow 		||
// performance.msNow 		|| performance.oNow 		|| performance.webkitNow 		||
// Date.now;   /* none found - fallback to browser default */ }());

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i += 1) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
// function strip(number) {
//   return (parseFloat(number).toPrecision(12));
// }
function round(value, decimals = 2){
    // const  n = +(Math.floor(value + "e+" + decimals)  + "e-" + decimals);
    return parseFloat(parseFloat(value.toPrecision(decimals)).toFixed(decimals));
  }
function calcDamp(from, to, speed, currentTime, k, b, mass, damp, {next, cancel}) {
    const t = currentTime * speed;
    const current = from;
    // loop over each propserty in to state
    Object
        .keys(to)
        .forEach((property) => {
            if (Object.prototype.hasOwnProperty.call(from, property) && property !== 'onComplete' && property !== 'mass' && property !== 'velocity' && property !== 'animate') {
                if (!current.velocity) {
                    current.velocity = {
                        [property]: 0
                    }
                }

                // console.log('check',Math.abs(from[property] - to[property]))
                if(Math.abs(from[property] - to[property]) < 0.001){
                  from[property] = to[property] = 0
                }
                if (from[property] === 0 && to[property] === 0) {
                    cancel(to)
                    return to;
                }

                // if (Math.abs(from[property]  - to[property] ) < 0.01) {
                //   console.log('cancel',Math.abs(from[property] - to[property]))

                //   cancel(to)
                //   return to;
                // }

                //tween to
                to[property] *= damp;
                const s = -k * ((from[property] - to[property])); // current damp value
                const d = -b * (current.velocity[property]); // current damping value
                const a = (s + d) / (current.mass || mass); // current acceleration value
                current.velocity[property] += a * (t / 1000) * 1; // update velocity (semi-implicit euler!)
                current[property] = (current[property] + current.velocity[property] * (t / 1000) * 1); // update position
                
                if (Math.abs(current.velocity[property]) < PRECISION){ 
                      current[property] = to[property];
                }
                current[property] =  round(current[property]);
         
            }
        });
    const currentState = omit(
        current,
        ['onComplete', 'mass', 'velocity', 'animate']
    );
    const toState = omit(to, ['onComplete', 'mass', 'velocity', 'animate']);
    if (to.animate !== undefined && to.animate === false) {
        cancel(to);
        return toState;
    }
    const maxVelocity = Math.max(...Object.values(current.velocity).map(Math.abs))
    if (round(maxVelocity) < PRECISION || round(maxVelocity) === 0){ 
      cancel(toState);
      return
    }
    if (isequal(currentState, toState)) {
        cancel(to);
        return toState;
    }
    next(currentState)
    return currentState;
}

let id = 0;

const withDefault = (value, defaultValue) => value === undefined || value === null
    ? defaultValue
    : value
const tensionFromOrigamiValue = oValue => (oValue - 30) * 3.62 + 194
const frictionFromOrigamiValue = oValue => (oValue - 8) * 3 + 25
const fromOrigamiTensionAndFriction = (tension, friction) => (
    {tension: tensionFromOrigamiValue(tension), friction: frictionFromOrigamiValue(friction)}
)

var dampConfig = fromOrigamiTensionAndFriction(
    withDefault(170, 40),
    withDefault(26, 7)
)

class dampObjectSubscriber extends Subscriber {
    constructor(destination, dynamicFn, options : {}, scheduler = animationFrame) {
        super(destination, options);

        options instanceof BehaviorSubject
            ? options.subscribe((options) => this.parseOption(options))
            : this.parseOption(options)

        this.dynamicFn = dynamicFn;
        this.scheduler = scheduler;
        this.lastTime = Date.now();
        this.color = getRandomColor();
        this.animate = false;
        // id += 1;

        this.id = dampObjectSubscriber.___id = dampObjectSubscriber.___id + 1 || 0;
        this.count = 0;
    }
    parseOption(options) {
        this.options = options;
        this.k = options.stiffness || options.tension || k;
        this.b = options.damping || options.friction || b;
        this.speed = options.speed || 1;
        this.mass = options.mass || 1;
        this.fps = options.fps || 60;
        this.damp = options.damp || 1;
        this.interval = 1000 / this.fps;
    }

    next(value) {

        const props = {};

        if (typeof(value) === 'number') {
            Object.assign(props, {value});
        } else {
            Object
                .keys(value)
                .forEach((prop) => {
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
                mass: this.options.mass || 1
            };

        }
        this.to = {
            value
        };
        this.to = {
            ...props,
            velocity: props, // reset values to zero
            mass: this.options.mass || 1
        };

        const fromState = omit(
            this.from,
            ['onComplete', 'mass', 'velocity', 'animate']
        );
        const toState = omit(this.to, ['onComplete', 'mass', 'velocity', 'animate']);
        if (JSON.stringify(fromState) === JSON.stringify(toState)) {
            this
                .destination
                .next(toState);
            this.raf = cancelAnimationFrame(this.raf);
            this.render = false;
            return;
        }
        
        if (!this.raf && fromState !== toState) {
            this.render = true;
            this.lastTime = Date.now();
            this.raf = this.requestAnimationFrame(this.step);
        }

    }
    /**
   * fps locked requestAnimationFrame
   * @param  {function} callback function
   * @return {Numer}           requestAnimationFramID
   */
    _lastTime = 0;
    requestAnimationFrame = (callback) => {
        const animate = () => {
            const now = Date.now();
            const delta = now - this._lastTime;
            if (delta > this.interval) {
                this._lastTime = now - (delta % this.interval);
                callback()
            }
            if (this.render) {
                return window.requestAnimationFrame(animate);
            } else {
                window.cancelAnimationFrame(animate);
            }

        }
        return animate();
    }
    step = () => {
        const {
            to,
            from,
            options,
            speed,
            k,
            b,
            mass,
            damp,
        } = this;
        const now = Date.now();
        const elapsed = (now - this.lastTime) || 1;
        this.lastTime = now;

        calcDamp(from, to, speed, elapsed, k, b, mass, damp, {
            next: (currentState) => {

                this.from = {
                    ...this.from,
                    ...currentState
                };
                const nextState = currentState; //Object.keys(currentState).map(key => (Math.floor(currentState[key] * 1000) / 1000));
                this
                    .destination
                    .next(nextState);
                if (typeof options.enter === 'function') 
                    options.enter(nextState)
                this.render = true;
                // this.raf = this.requestAnimationFrame(this.step);
                // console.log('currentState',currentState)
                // plot('value'+this.id,time,10,'#32cd32')
            },
            cancel: (currentState) => {
                if (typeof options.complete === 'function') 
                    options.complete(currentState)
                // console.log(
                //     `damp complete! {this.id}:  ${this.id} executed  in ${this.lastTime}`
                // )
                this.render = false
                this
                    .destination
                    .next(currentState);
                this.raf = cancelAnimationFrame(this.raf);
                if (typeof currentState.onComplete === 'function') {
                    currentState.onComplete()
                }

            }
        },);

    }
}

export class dampObjectOperator {
    constructor(dynamicFn, options, scheduler) {

        this.options = options;
        this.dynamicFn = dynamicFn;
        this.scheduler = scheduler;
    }
    call(subscriber, source) {
        return source.subscribe(
            new dampObjectSubscriber(subscriber, this.dynamicFn, this.options, this.scheduler)
        );
    }
}

export function damp(options = {}, scheduler = animationFrame) {
    const defaults = {
        dynamicFn: 'LINEAR',
        ...options
    }
    return this.lift(
        new dampObjectOperator(defaults.dynamicFn, options, scheduler)
    );
}

Observable.prototype.damp = damp;
