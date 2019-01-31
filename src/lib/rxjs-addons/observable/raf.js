import { Observable } from 'rxjs/Observable';
import { animationFrame } from 'rxjs/scheduler/animationFrame';
import 'rxjs/add/observable/timer';

/**
 * @param  {} step=1000
 */
function Raf(step = 1000){
    return Observable.timer(0, step, animationFrame)
  }
Raf.prototype.constructor = Raf;

export default Raf;