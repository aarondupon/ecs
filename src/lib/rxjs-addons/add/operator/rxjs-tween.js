import { Observable } from 'rxjs/Observable';
import { animationFrame } from 'rxjs/scheduler/animationFrame';
import Ease from './../../EaseUtil';


export function tween(
  duration = 2000,
  options,
  scheduler = animationFrame,
) {
  return this.lift(new TweenOperator(duration, options, scheduler));
}

export function TweenOperator(duration, options={}, scheduler) {
  this.duration = duration;
  this.scheduler = scheduler;
  console.log('Ease(options.easingFn)',Ease.getEase(options.easingFn))
  this.options = {
    delay: 0,
    ...options,
    easingFn: Ease.getEase(options.easingFn) || Ease.linear,

  };
}

TweenOperator.prototype.call = function tweenCall(destination, source) {
  return source._subscribe({
    destination,
    next(curr) {
      const {
        prev, innerSub, scheduler, options,
      } = this;

      this.start = scheduler.now();
      this.prev = this.curr;
      this.curr = curr;
      if (innerSub) innerSub.unsubscribe();
      if (options.delay) {
        setTimeout(() => {
          this.innerSub = this.scheduler.schedule(
            this._dispatchTween,
            0,
            this,
          );
        }, options.delay);
      } else {
        this.innerSub = this.scheduler.schedule(
          this._dispatchTween,
          0,
          this,
        );
      }
    },
    error(err) { this.destination.error(err); },
    complete() { this.destination.complete(); },
    duration: this.duration,
    scheduler: this.scheduler,
    options: this.options,
    innerSub: undefined,
    prev: undefined,
    start: undefined,
    _dispatchTween(state) {
      // `this` is the action
      const {
        start, curr, options, duration, destination, scheduler,
      } = state;
      let { prev } = state;
      const d = scheduler.now() - start;
      prev = prev || 0;
      if (d < duration) {
        // time, begin, change, duration
        const result = options.easingFn(d, prev, (curr - prev), duration);
        destination.next(result);
        state.innerSub = this.schedule(state, 0);
      }
    },
  });
};

Observable.prototype.tween = tween;
