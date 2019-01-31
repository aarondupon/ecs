import 'rxjs/add/operator/merge';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { merge } from 'rxjs/observable/merge';
import { race } from 'rxjs/observable/race';
import {combineLatest} from 'rxjs/observable/combineLatest'
import {map, switchMap, mergeMap} from 'rxjs/operators';
import { animationFrame } from 'rxjs/scheduler/animationFrame';
import vec2 from 'gl-vec2';
import { clamp,averange } from 'utils/MathUtil';
// import './helpers/touch';



let scrollings = [];
let prevTime = Date.now();
let allowWheel = true

const FPS = 60;//24
const timerObservable = Observable.timer(0,1000/FPS, animationFrame).share()

export const getClientPosition = touchEvent => ([
  touchEvent.changedTouches ? touchEvent.changedTouches[0].clientX : touchEvent.clientX,
  touchEvent.changedTouches ? touchEvent.changedTouches[0].clientY : touchEvent.clientY,
]);

const check = (x,y)=>{
    
    var test = x && x.isSameNode ? x.isSameNode(y) : (x===y)
    return test
}

const checkPreventDefault = (evt,options={})=>options.preventDefault && evt.preventDefault();
// The problem here is the overlap between the events; in terms of relationship to the underlying events, dragstart is triggered by EXACTLY the same thing as the first dragmove. In this case, order of subscription will determine order of execution, which, as you've said, isn't something you want to rely on. To address this, we must take control of the underlying events.
// Here's a simple function that takes an observable and returns an array containing two observables which will be issued the same values as the original observable but in which the events will always be passed to the first observable before the second observable, regardless of which is subscribed to first:

function prioritize(s$) {
    var first = new Subject();
    var second = s$.do(x => first.next(x)).share();
     
    const observables =  [
      Observable.using(
        () => second.subscribe(() => {}),
        () => first
      ),
      second
    ];
    return observables
  }

export const global = {
    mouseUp:merge(
        Observable.fromEvent(window, 'mouseup'),//.startWith(0),
        Observable.fromEvent(window, 'touchend', { passive: true })).share(),
    mouseMove:merge(
        Observable.fromEvent(window, 'mousemove'),//.startWith(0),
        Observable.fromEvent(window, 'touchmove', { passive: true })).share(),
    mouseDown:merge(
        Observable.fromEvent(window, 'mousedown'),//.startWith(0),
        Observable.fromEvent(window, 'touchstart', { passive: true })).share()
}



export const mouseEvents = {
    mouseDownEvent:(target = document,options)=>merge(
        Observable.fromEvent(target, 'mousedown',options),
        Observable.fromEvent(target, 'touchstart', { passive: true , ...options}),
        ).do(evt=>checkPreventDefault(evt,options)).map((evt)=>([...getClientPosition(evt),1])),
    mouseUpEvent:(target = document,options)=>merge(
        Observable.fromEvent(target, 'mouseup'),//.startWith(0),
        Observable.fromEvent(target, 'touchend', { passive: true,...options }),
        ).do(evt=>checkPreventDefault(evt,options)).map((evt)=>([...getClientPosition(evt),1])),
    // mouseMoveEvent:(target = document,options)=>{
    //     var z = 0
    //     const mousePress =  mouseEvents.mousePressEvent(target,options)
    //     const mouseUp =  mouseEvents.mouseUpEvent(target,options)
    //     const mouse = race(mousePress,mouseUp)
    //     return merge(
    //         Observable.fromEvent(target, 'mousemove'),
    //         Observable.fromEvent(target, 'touchmove', { passive: true ,...options}),
    //     ).do(evt=>checkPreventDefault(evt,options)).combineLatest(mouse,(evt,[x,y,z])=>([...getClientPosition(evt),z]))
    // },
    mouseMoveEvent:(target = document,options)=>{
        var z = 0;
        const mousePress = mouseEvents.mousePressEvent(target,options);
        const mouseUp = mouseEvents.mouseUpEvent(target,options);
        const mouse = race(mousePress,mouseUp);
        const mouseMove$ = merge(
            Observable.fromEvent(target, 'mousemove'),
            Observable.fromEvent(target, 'touchmove', { passive: true ,...options}),
        )
        .do(evt=>checkPreventDefault(evt,options))
        .map((evt)=>([...getClientPosition(evt),1]));

        return mouseMove$.pipe(
            mouseMove=>combineLatest(mouseMove,mouse),
            map(([m1,m2])=>{
                // console.log('m1,m2',m1,m2)
                return [m1[0],m1[1],m2[2]]
            })
            )
       
        // .withLatestFrom(mouse,(evt,[x,y,z])=>([...getClientPosition(evt),z]))
    },
    mouseDragEvent:(target = document,options)=>{
        const mouseUp =  mouseEvents.mouseUpEvent(window,options)
        const mouseMove =  mouseEvents.mouseMoveEvent(window,options)
        const mouseDown=  mouseEvents.mouseDownEvent(target,options)
        return mouseDown.mergeMap((md)=>
            mouseMove
            .filter(([x,y,z])=>z > 0)
            .takeUntil(mouseUp)
        )
    },
    mouseOverEvent:(target = document)=>merge(
        Observable.fromEvent(target, 'mouseover'),//.startWith(0),
        Observable.fromEvent(target, 'touchover', { passive: true }),
        ).map((evt)=>([...getClientPosition(evt),1])),
    mouseOutEvent:(target = document)=>merge(
        Observable.fromEvent(target, 'mouseout'),//.startWith(0),
        Observable.fromEvent(target, 'touchout', { passive: true }),
        ).map((evt)=>([...getClientPosition(evt),evt.target,1])),
    mouseEnterEvent:(target = document)=>merge(
        Observable.fromEvent(target, 'mouseenter'),//.startWith(0),
        Observable.fromEvent(target, 'touchenter', { passive: true }),
        ).map((evt)=>([...getClientPosition(evt),1])),
    mouseLeaveEvent:(target = document)=>merge(
        Observable.fromEvent(target, 'mouseleave'),//.startWith(0),
        Observable.fromEvent(target, 'touchleave', { passive: true }),
        ).map((evt)=>([...getClientPosition(evt),evt.target,1])),
    mouseFocusEvent:(target)=>merge(
        mouseEvents.mouseOverEvent(target),
        mouseEvents.mouseOutEvent(target),

    ),
    mouseClickEvent:(target = document)=>mouseEvents.mouseDownEvent(target)
    ,
    mouseDoubleClick:(target = document)=>{
        const mouseDown =  mouseEvents.mouseDownEvent(target)
        return mouseDown
        .buffer(mouseDown.debounceTime(250))
        .map(list => list.length)
        .filter(x => x === 2)
        .map((evt)=>([...getClientPosition(evt),1]))
    },
    mousePressEvent:(target = document)=>{
        const mouseDown =  mouseEvents.mouseDownEvent(target)
        const mouseUp = global.mouseUp;
        mouseUp.subscribe()
        const press = mouseDown.mergeMap(() =>
            timerObservable
            .map((step)=> clamp(step/1000*1,-1,1))
            ).takeUntil(mouseUp)
        .distinctUntilChanged().share()
        .withLatestFrom(mouseDown,((z,mm)=>{
            return [mm[0],mm[1],z]
        }))
        return press;
    },
    mouseHoldEvent:(target = document)=>{
        const timer =  timerObservable// Observable.timer(0,1000/24, animationFrame)
        const mouseDown = mouseEvents.mouseDownEvent(target)
        const mouseMove = mouseEvents.mouseMoveEvent(target)
        const mouseUp = mouseEvents.mouseUpEvent(target)
       mouseMove.subscribe()
       mouseUp.subscribe()
       const checkMouseHoldig =  mouseDown.mergeMap(md => 
            timer
                .takeUntil(mouseUp))
                .withLatestFrom(mouseMove,(t,md)=>{
                        return [t,md]
                    })
                .pairwise()
                .map(([[oldPress,oldPos],[newPress,newPos]]) => 
                    {
                    const acceleration = vec2.dist([oldPos[0],oldPos[1]],[newPos[0],newPos[1]])
                    const isHolding =  acceleration === 0 && newPress > 15 ;
                    // console.log('mouseHold____',newPress,oldPress,isHolding,acceleration)
                    return {newPos,isHolding}
                }).distinctUntilChanged().filter(x=>x.isHolding).map(x=>x.newPos)
        return checkMouseHoldig;
        
    }, 
}

export const MOUSE_MOVE = 'mousemove';
export const MOUSE_UP = 'mouseup';
export const MOUSE_DOWN = 'mousedown';
export const MOUSE_PRESS = 'mousepress';
export const MOUSE_DRAG = 'mousedrag';
export const MOUSE_HOLD = 'mousehold';
export const MOUSE_OUT = 'mouseout';
export const MOUSE_OVER = 'mouseover';
export const MOUSE_ENTER = 'mouseenter';
export const MOUSE_LEAVE = 'mouseleave';
export const MOUSE_DOUBLE_CLICK = 'mousedoubleclick';
export const MOUSE_CLICK = 'mouseclick';
export const MOUSE_WHEEL = 'mousewheel';
export const MOUSE_INIT = 'mouseinit';

const mouseAction = (type = null,x=0,y=0,z=0,wheel=0)=>({
    type:type,
    coords:[x,y,z,wheel],
})
let count  = 0
const createMouse = (target,allowedEvents, coords) =>{
    // let target = document
    const mouseDown = mouseEvents.mouseDownEvent(target);
    const mouseUp = mouseEvents.mouseUpEvent(target);
    const mouseHold = mouseEvents.mouseHoldEvent(target);
    const mouseMove = mouseEvents.mouseMoveEvent(target);
    const mouseDrag = mouseEvents.mouseDragEvent(target);
    const mousePress = mouseEvents.mousePressEvent(target);
    const mouseDoubleClick = mouseEvents.mouseDoubleClick(target);
    const mouseOut = mouseEvents.mouseOutEvent(target);
    const mouseOver = mouseEvents.mouseOverEvent(target);
    const mouseEnter = mouseEvents.mouseEnterEvent(target);
    const mouseLeave = mouseEvents.mouseLeaveEvent(target);
    
    const mouseInit = new BehaviorSubject(coords);

    const mouseMoveWithVelocity = mouseMove
    .pairwise()
    .map(([xyz1,xyz2]) => {
        const acceleration = vec2.dist([xyz1[0],xyz1[1]],[xyz2[0],xyz2[1]]);
        const action =  mouseAction(MOUSE_MOVE,...xyz2);
        action.velocity = acceleration;
        return action
    })
       
    let events = [mouseInit.map(xyz=>mouseAction(MOUSE_INIT,...xyz))];
    if(allowedEvents){
        allowedEvents.includes('mouseout') && events.push(mouseOut.map(xy=>mouseAction(MOUSE_OUT,...xy)))
        allowedEvents.includes('mouseover') && events.push(mouseOver.map(xy=>mouseAction(MOUSE_OVER,...xy)))
        allowedEvents.includes('mousedown') && events.push(mouseDown.map(xyz=>mouseAction(MOUSE_DOWN,...xyz)))
        allowedEvents.includes('mouseup') && events.push(mouseUp.map(xyz=>mouseAction(MOUSE_UP,...xyz)))
        allowedEvents.includes('mousehold') && events.push(mouseHold.map(xyz=>mouseAction(MOUSE_HOLD,...xyz)))
        allowedEvents.includes('mousemovewithvelocity') && events.push(mouseMoveWithVelocity)
        allowedEvents.includes('mousemove') && events.push(mouseMove.map(xyz=>mouseAction(MOUSE_MOVE,...xyz)))
        allowedEvents.includes('mousedrag') && events.push(mouseDrag.map(xyz=>mouseAction(MOUSE_DRAG,...xyz)))
        allowedEvents.includes('mousepress') && events.push(mousePress.map(xyz=>mouseAction(MOUSE_PRESS,...xyz)))
        allowedEvents.includes('mousedoubleclick') && events.push(mouseDoubleClick.map(xyz=>mouseAction(MOUSE_DOUBLE_CLICK,...xyz)))
        allowedEvents.includes('mouseenter') && events.push(mouseEnter.map(xyz=>mouseAction(MOUSE_ENTER,...xyz)))
        allowedEvents.includes('mouseleave') && events.push(mouseLeave.map(xyz=>mouseAction(MOUSE_LEAVE,...xyz)))

    }else{
        events = [
            ...events,
            mouseOut.map(xy=>mouseAction(MOUSE_OUT,...xy)),
            mouseOver.map(xy=>mouseAction(MOUSE_OVER,...xy)),
            mouseDown.map(xyz=>mouseAction(MOUSE_DOWN,...xyz)),
            mouseUp.map(xyz=>mouseAction(MOUSE_UP,...xyz)),
            mouseHold.map(xyz=>mouseAction(MOUSE_HOLD,...xyz)),
            mouseMoveWithVelocity,//mouseMove.map(xyz=>mouseAction(MOUSE_MOVE,...xyz)),
            mouseDrag.map(xyz=>mouseAction(MOUSE_DRAG,...xyz)),
            mousePress.map(xyz=>mouseAction(MOUSE_PRESS,...xyz)),
            mouseDoubleClick.map(xyz=>mouseAction(MOUSE_DOUBLE_CLICK,...xyz)),
            mouseEnter.map(xyz=>mouseAction(MOUSE_ENTER,...xyz)),
            mouseLeave.map(xyz=>mouseAction(MOUSE_LEAVE,...xyz)),

        ]
    }

    let z = 0;
    const mouse = Observable.merge(...events);
    if(coords) mouseInit.next(coords)
    return mouse;
}
export const touchEvent = (target,events, coords = [0,0,0])=>{
    // console.log('touchEvent',target)
    // const observable =  switchTarget(createMouse,[target,events,coords]);

    // return observable
    count ++
    // const mouseInit = new BehaviorSubject(coords);
    let observable;
    if(target instanceof Observable){  
        
        observable = target.filter(x=>x !== null).distinctUntilChanged(check).mergeMap(e=>{
            console.log('mergeMap',e)
            return  e ? createMouse(e || document,events,coords) : new Observable()
        })
        
    }else{
        
        observable = createMouse(target,events,coords);
    }
    
    return observable;
    
}

export function switchTarget(createEvent,theArgs){  
 
    const args$ = Observable.combineLatest(...theArgs.map(value=>{
        console.log('value:::::',value)
        return value instanceof Observable ? value : new BehaviorSubject(value || null);
    }));


    args$.pipe(mergeMap(()=>{
        debugger
        return createEvent(...args)
    }))


    return args$;
}