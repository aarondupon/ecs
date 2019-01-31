
import Ease from '../../EaseUtil';
import dynamics from '../../dynamics';
import { Observable } from 'rxjs/Observable';
import { animationFrame } from 'rxjs/scheduler/animationFrame';



var gravity  = dynamics.gravity;


function dynamic(dynamicFn = dynamics.DYNAMIC_TYPES.LINEAR, options={} ) {
  if(typeof dynamicFn !== 'function'){
    throw `Error rxjs-dynamic: first arrgument ${dynamicFn} is not a function`
  }
  return this.lift(new TweenOperator(dynamicFn,options));
};

function TweenOperator(dynamicFn,options) {
  this.options = options;
  this.dynamicFn = dynamicFn;
  
}

TweenOperator.prototype.call = function tweenCall(destination, source) {
  return source._subscribe({
    destination: destination,
    next: function (curr) {
      const { prev, innerSub } = this;
      
      this.prev = this.curr || {value:curr};
      this.curr = {value:curr} ;
      if (innerSub) innerSub.unsubscribe();
      this._dispatchTween(this)
    },
    error: function (err) { this.destination.error(err); },
    complete: function () { this.destination.complete(); },
    options: this.options,
    dynamicFn: this.dynamicFn,
    scheduler: this.scheduler,
    innerSub: undefined,
    prev: undefined,
    start: undefined,
    _dispatchTween: function (state) {
      // `this` is the action
      const { start, curr, dynamicFn, options, destination } = state;
      let { prev } = state;
      prev = prev || curr; 
      
      dynamics.animate(prev,curr, {
        type: dynamicFn,
        ...options,
        change:(tween,progress)=>{
          destination.next(tween.value);
        }
      })
    }
  });
};


export const DYNAMIC_TYPES = dynamics.DYNAMIC_TYPES;
Observable.prototype.dynamic = dynamic;