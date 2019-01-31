import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { DeferObservable } from 'rxjs/observable/DeferObservable';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';

import { take, filter, map, share, withLatestFrom } from 'rxjs/operators'
import { merge } from 'rxjs/observable/merge';

import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/do';

const TIMER_COMPLETE_EVENT = 'timercomplete';
const TIMER_UPDATE_EVENT = 'timerupdate';
const TIMER_START_EVENT = 'timerstart';
const TIMER_STOP_EVENT = 'timerstop';
const TIMER_RESET_EVENT = 'timerreset';
const TIMER_PAUSE_EVENT = 'timerpause';
const TIMER_ERROR_EVENT = 'timererror';
const TIMER_SEEK_EVENT = 'timerseek';


const timerEvent = (type,time)=>({type,time:isNaN(time) ? 0 : time})


function getPausableTimer(timeout, pause) { 
     const pausableTimer$ = new DeferObservable(() => {
      let seconds = 0;
      let duration = 10;
      let step = 10;
      return new IntervalObservable(1000/step).pipe(
        withLatestFrom(pause),
        filter(([v, paused]) => !paused),
        take((timeout/step)*(1000/step)),
        map(() => {
          seconds +=step;
          // console.log('seconds',seconds)
          return Number(Number(timeout - seconds*(step/1000)).toFixed(2));
        }),

      )
    }).pipe(share())
    return pausableTimer$;
    ///{ stepTimer: pausableTimer$, completeTimer: pausableTimer$.pipe(reduce((x, y) => y)) }
  }



/**
 * create a new timer observable instance
 *
 * @export
 * @class Timer
 * @extends {Observable}
 */
export class Timer extends Observable {
  
 

  defaultProps = {
    timerUpdate(){},
    timerError(){},
    timerComplete(){},
    startTime:2000,
    step:10,
  }
  /**
   * @param  {function} timerUpdate 
   * @param  {function} timerComplete
   * @param  {number} startTime
   * @param  {number} step
   */
  constructor(startTime,step,paused = true,loop = true,timerUpdate,timerComplete){
    super()

    const {defaultProps} = this;
    const options = {
      loop:loop,
      startTime: startTime || defaultProps.startTime,
      step: step || defaultProps.step,
      timerUpdate: timerUpdate || defaultProps.timerUpdate,
      timerComplete: timerComplete || defaultProps.timerComplete,
    }
    this._currentTime = startTime;
    this.options = Object.assign({},this.defaultProps,options)
    this.duration = this.options.startTime;
    this.source = new Subject();
    this.source.___name ='time';
    this.time = this.source.map(x=>x.time)
    this.percentTime = this.source.map(x=>x.time/this.options.startTime)

    this._pause$.next(paused)
    this.start()
    
    
  }
  _currentTime = 0
  _reset$ = new Subject()
  _start$ = new Subject()
  _stop$ = new Subject()
  _pause$ = new BehaviorSubject(true)
  duration = 0
  /**
   * create count down observable
   *  @memberof Timer
   */
  _createCountDownObserver(time){ 
    let {step,startTime} = this.options;
    if(time !== undefined) startTime = time;
    return getPausableTimer(startTime /1000 ,this._pause$).map(x=>x)
    .do((time)=>{
        this._currentTime = time*1000;
        this.options.timerUpdate(time*1000)
        this.source.next(timerEvent(TIMER_UPDATE_EVENT,time*1000))        
      },
      (time)=>{
        this.options.timerError(time*1000)
        this.source.next(timerEvent(TIMER_ERROR_EVENT,time*1000))
      },
      (time)=>{
        this.options.timerComplete(time*1000)
        this.source.next(timerEvent(TIMER_COMPLETE_EVENT,time*1000)) 
        if(this.options.loop){
          this.reset();
          this.start();
        
        }
      },
    )
    .takeUntil(this._stop$)
  }
  /**
   * time observer
   *  @memberof Timer
   */
  timer$ = merge(
    this._start$.switchMap((time)=>this._createCountDownObserver(time)).takeUntil(this._stop$).map(() => 1),
    this._reset$.map(() => 0)
  )
  /**
   * stop timer
   *  @memberof Timer
   */
  stop = () => {
    this.started = false;
    this._stop$.next()
    this.source.next(timerEvent(TIMER_STOP_EVENT,0)) 
  }
  /**
   * start timer
   * @param  {number} time=0 starttime
   * @memberof Timer
   */
  start = (time,delay=0) => {
    this.started = true
    if(this.tID) clearTimeout(this.tID);
    this._tID = setTimeout(()=>{
      if(this.selfSubscription) this.selfSubscription.unsubscribe();
      this.selfSubscription = this.timer$.subscribe();
      this._start$.next(time);
    },delay)
  }
  set currentTime(time){
    this._start$.next(time);
  }
  get currentTime(){
     return this._currentTime;
  }
  /**
   * reset timer
   * @param  {number} time=0 resetTime
   * @memberof Timer
   */
  reset = (time=0)=>{ 
      this.started = false;     
      this.options.startTime = time || this.options.startTime;
      this._stop$.next();
      this._reset$.next();
      this.source.next(timerEvent(TIMER_RESET_EVENT,this.options.startTime));
  }
  /**
   * toggles state between play and pause (start & stop)
   * @memberof Timer
   */
  playPause = () =>{
    this._pause$._value ? this.resume() : this.pause();
    return this._pause$._value; 
  }
   /**
   * pause state between play and pause (start & stop)
   * @memberof Timer
   */
  pause = () =>{
   this._pause$.next(true);
  }
   /**
   * resumus timer not paused
   * @memberof Timer
   */
  resume = (time,delay) =>{
    if(!this.started || time !== undefined){
      this.start(time,delay); 
    }
    this._pause$.next(false);
  }
  complete = () =>{
    this.source.next(timerEvent(TIMER_COMPLETE_EVENT,0)) 
    this.start(0);   
  }
  seek = (time)=>{
    this.source.next(timerEvent(TIMER_SEEK_EVENT,time))
    this.start(time);   
  }
  seekPercent = (percent)=>{
    this.source.next(timerEvent(TIMER_SEEK_EVENT,percent*this.options.startTime))
  }
}