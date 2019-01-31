/* eslint func-names: 0, no-bitwise: 0 */
// https://github.com/glennirwin/webgp/blob/master/src/API.md
// @ts-ignore
import * as fastdom from 'fastdom';

import { fromEvent, Observable, of, timer, Subject, BehaviorSubject } from 'rxjs';
import { map, repeat, scan, timeout, tap, throttleTime } from 'rxjs/operators';
import { animationFrame } from 'rxjs/scheduler/animationFrame';
import FpsController from '../lib/FpsController';
import delayFalloffEffector from '../lib/rxjs-addons/add/operator/delayFalloffEffector';
import { stepEffector } from '../lib/rxjs-addons/add/operator/step-effector/effector';
// import { springEffector } from '../lib/rxjs-addons/add/operator/springEffector';
// import { springEffector } from '../lib/rxjs-addons/add/operator/rxjs-spring-xyzw-wasm/spring';
import { springEffector } from '../lib/rxjs-addons/add/operator/rxjs-spring-gpu/index';
import '../styles/index.scss';

const package2 = require('rxjs/package.json');
const is5 = /^5\./.test(package2.version);

console.log(package2.version);
console.log(is5);
