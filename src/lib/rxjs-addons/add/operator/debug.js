/* eslint no-console: 0 */
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';

const debuggerOn = true;

Observable.prototype.debug = function (message = '') {
  return this.do(
    (next) => {
      if (debuggerOn) {
        console.log(`DEBUG >>> ${this.operator.constructor.name}:${message} ${JSON.stringify(next)}`,next);
      }
    },
    (err) => {
      if (debuggerOn) {
        console.error('ERROR >>> ', message, err);
      }
    },
    () => {
      if (debuggerOn) {
        console.log('Obeservable Completed - ', message);
      }
    },
  );
};

export default Observable.prototype.debug;
