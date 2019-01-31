import { Observable } from 'rxjs/Observable';

export default (keyCodes,throttleTime=100)=>Observable.fromEvent(document, 'keydown').filter(e => {
    return keyCodes.find((key)=>key === e.keyCode);
 }).throttleTime(throttleTime)