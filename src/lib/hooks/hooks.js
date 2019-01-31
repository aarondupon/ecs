import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import vec2 from 'gl-vec2';
import plot from 'plot';
import moize from 'moize';
import shallowequal from 'shallowequal';

//rxjs imports
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import debounce from 'lodash.debounce'
import throttle from 'lodash.throttle'

import { merge } from 'rxjs/observable/merge';
import { race } from 'rxjs/observable/race';
import { animationFrame } from 'rxjs/scheduler/animationFrame';
import { map,switchMap,mergeMap,switchMapTo,withLatestFrom } from 'rxjs/operators'
// import { takeUntil } from 'rxjs/operator/takeUntil';

import 'rxjs/add/observable/never';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';

import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/publishLast';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/timer';


import 'rxjs-addons/add/operator/debug';
import 'rxjs-addons/add/operator/rxjs-damp';
// import './rxjs-spring';
import 'rxjs-addons/add/operator/rxjs-pause';
import {Timer} from 'rxjs-addons/Timer';
//util imports
// import { intersects, mapRangeClamped,mapRange, clamp } from 'utils/MathUtil';


let hooks = null;
let forceUpdate = false
let count = 0;

const EFFECTS = []



function toString(string){
    // Note: cache should not be re-used by repeated calls to JSON.stringify.
    var cache = [];
    const jsonString = JSON.stringify(string, function(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Duplicate reference found
                try {
                    // If this value does not reference a parent it can be deduped
                    return JSON.parse(JSON.stringify(value));
                } catch (error) {
                    // discard key if value cannot be deduped
                    return;
                }
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    });
    cache = null; // Enable garbage collection
    return jsonString;
}




class State{
    constructor(id,value,cb){
        if(id){
            this.id = id
        }
        if(value){
            this.initialValue = value
        }

        this.cb = cb
        
    }
    type = 'state'
    initialValue = undefined
    prev = undefined
    value = undefined
    id = null
    doNext = true
    cb = null
    
    next = (value,cb)=>{
       
         if(this._effect &&  this.doNext){
             // state.doNext = false
            //  this._effect.bind(this)
             this._effect()
             // state.doNext = true
            // state._effect = null;
         }
         this.prev = this._value;
         this.value = value;
         this._value = value;
         
         if(this.type === 'state'){
            if(this.prev!==value){
            // if(JSON.stringify(this.prev) !==JSON.stringify(value)){
                if(this._subscriber ) this._subscriber(value) 
                if(typeof this.cb === 'function') this.cb(value)  
                if(typeof cb === 'function') setTimeout(()=>cb(value),1)
             }
         }
        
        
    }
    subscribe = (subscriber)=>{
        this._subscriber = subscriber
    }
}


class HOOK {
    constructor(props={}){
        this._name = name;
        if(props.hooks) this.hooks = [...props.hooks]
        this.count = 0;
    }
    clone = () =>{
        return new HOOK(this)
    }
    hooks = []
    add = (hook)=>{
        this.hooks.push(hook)
        this.count ++
    }
    get = (index)=>{
        this.count ++;
        return this.hooks[this.count-1];
    }
    reset = ()=>{
        this.hooks = 0;
        this.hooks = [];
    }
    remove = ()=>{
        this.hooks.forEach(hook=>{
            const {remove} = hook;
            remove && remove(hook.differValue);
        })
    }
    forceUpdate = true;
}

var STATE_HOOK = new HOOK();
var OBSERVABLE_HOOK = new HOOK();
var COMPONENET_ROOT_HOOK = new HOOK();
var EFFECTS_HOOK = new HOOK();
COMPONENET_ROOT_HOOK.forceUpdate = false;


const EMPTYHOOKS = {
}

export function rxjsHooks(pp){
    return (WrappedComponent)=>{
        
        class HookComponent extends React.Component {
            constructor(props) {
                super(props);
                this._componentHooks = {}                

            }
            componentWillUnmount(){
                const {
                    props,
                    __updateID
                } = this;
             
                EFFECTS_HOOK =  this._componentHooks.EFFECTS_HOOK || EFFECTS_HOOK
                EFFECTS_HOOK.remove();
                //console.log('unmount',EFFECTS_HOOK,props,__updateID);
            }
            componentDidMount(){
                
            }
            _forceUpdate(){
               
                this.forceUpdate()
            }
            disableRender = false
            __updateID = 0
            forceUpdateDebounced = throttle(this.forceUpdate,5000)
            render() {
                const {
                props,
                __updateID
                } = this;

          

                hooks = this._componentHooks || EMPTYHOOKS
                OBSERVABLE_HOOK =  this._componentHooks.OBSERVABLE_HOOK || OBSERVABLE_HOOK
                STATE_HOOK =  this._componentHooks.STATE_HOOK || STATE_HOOK
                COMPONENET_ROOT_HOOK =  this._componentHooks.COMPONENET_ROOT_HOOK || COMPONENET_ROOT_HOOK
                EFFECTS_HOOK =  this._componentHooks.EFFECTS_HOOK || EFFECTS_HOOK
                
                // forceUpdate = hooks.length > 0;
                forceUpdate = OBSERVABLE_HOOK.hooks.length > 0 || STATE_HOOK.hooks.length > 0 || EFFECTS_HOOK.hooks.length > 0 ;
                // console.log('RERENDER COMP',hooks.length ,forceUpdate,hooks)
                
                let comp = WrappedComponent({...props,ref:props.forwardedRef,__updateID})
              
                
              
                //console.log('WrappedComponent',WrappedComponent.props,this.props,pp)
                
                let componentHooks = hooks;
                count = 0
                STATE_HOOK.count = 0;
                OBSERVABLE_HOOK.count = 0;
                EFFECTS_HOOK.count = 0;

                // EFFECTS.forEach(effect=>{
                //     effect()
                // })
                
               
               if(!this._forceUpdateSubscriptionsAdded){
                    
                    // console.log('forceUpdateSubscriptionsAdded')
                
                    OBSERVABLE_HOOK.hooks.forEach(observable=>{
                        // FIXME: observable should not always subscribe!
                        if(observable[3] === true){
                        observable[2].subscribe((value)=>{ 
                            console.log('forceUpdate from  observable:::',this,observable,value)
                                 observable[0] = value;
                                 this._forceUpdate()
                            //    this.forceUpdateDebounced()  
                                 
                            })
                        } 
                        
                    })
                    
                    STATE_HOOK.hooks.forEach((observable,i)=>{
                        if(observable[3] === true){
                            //if(STATE_HOOK.forceUpdate){
                                observable[2].subscribe((value)=>{ 
                                    //if(shallowequal(observable[0],value) === false){
                                        // console.log('forceUpdateforceUpdateforceUpdate',observable[0],'\n',value)
                                        this.__updateID ++
                                        observable[0] = value;                                        
                                        this._forceUpdate()
                                   // }
                                   
                                    //this.forceUpdateDebounced()    
                                 })
                               } 
                            
                        // subscribeToState.bind(observable[2]);
                        // observable[2].forceUpdate = (callback)=>this.forceUpdate(callback)
                        
                        // observable[2].subscribe(subscribeToState)
                       // }  
                        
                    })
                   
                    COMPONENET_ROOT_HOOK.hooks.forEach(observable=>{
                        
                        if(observable &&  observable[3] === true){
                        if(COMPONENET_ROOT_HOOK.forceUpdate){
                            observable[2].subscribe((value)=>{ 
                                this._forceUpdate() //this.forceUpdateDebounced()    
                             })
                            } 
                        }
                        
                    })
                    this._forceUpdateSubscriptionsAdded = true
                }
               
                // console.log('componentHooks',hooks)
              //  this._componentHooks = [...hooks];
                // this._componentHooks = {
                //     STATE_HOOK:{...STATE_HOOK},//STATE_HOOK: JSON.parse(JSON.stringify(STATE_HOOK)),
                //     OBSERVABLE_HOOK:{...OBSERVABLE_HOOK}
                // }
                this._componentHooks = {
                    STATE_HOOK:new HOOK(STATE_HOOK),//STATE_HOOK: JSON.parse(JSON.stringify(STATE_HOOK)),
                    OBSERVABLE_HOOK:new HOOK(OBSERVABLE_HOOK),
                    COMPONENET_ROOT_HOOK:new HOOK(COMPONENET_ROOT_HOOK),
                    EFFECTS_HOOK:new HOOK(EFFECTS_HOOK),
                }
                hooks = null
                STATE_HOOK.reset()
                OBSERVABLE_HOOK.reset()
                COMPONENET_ROOT_HOOK.reset();
                EFFECTS_HOOK.reset()
                forceUpdate = false
               
               return comp;
            }
        }
  
        // HookComponent.displayName = `${WrappedComponent.name}.hooked`;
        // return HookComponent;

        function forwardRef(props, ref) {
            return <HookComponent {...props} forwardedRef={ref} />;
          }
        // Give this component a more helpful display name in DevTools.
        // e.g. "ForwardRef(logProps(MyComponent))"
        const name = WrappedComponent.displayName || WrappedComponent.name;
        forwardRef.displayName = `AnimateProps(${name})`;
        
        return React.forwardRef(forwardRef);
        


    } 

}


export function createState(value,cb){ 
    let triggerRender  = true;  
    
    let hookState = STATE_HOOK.get()
    if(hookState){   

        let state = hookState[2];
   
        state.cb = cb;
        if(shallowequal(hookState[2].initialValue,value)=== false){            
            // hookState[2].initialValue = value;
            state.next(value);
        }else{
                // state = hookState[2];
                // hookState[0] = value;        
        }
       
        return hookState
    }

    
    let state = new State(Math.random(),value,cb) 
    state.initialValue = value;
    const newHook = [value,null,state,triggerRender];
    // state.next(value)
    const set = (value)=>{
        console.log('value',value,newHook)
        newHook[0] = value
        state.next(value)
   }
//    console.log('valuevaluevalue',STATE_HOOK.count)
    newHook[1] = set
    STATE_HOOK.add(newHook)    
    return newHook;
}



export function createObservable(hookfuction,value,triggerRender=false){ 
 
    

 
    const hook = (context,args,name) => {
        const createFunction =  hookfuction.apply(context,args)
        return createFunction;
    }
    let observable ;
    let currentHook = OBSERVABLE_HOOK.get()
    if(currentHook){  
        
        // if(shallowequal(theArgs[0],hook.differValue) === false){

        //     const {__autoSubsrciption} = currentHook[2]
        //     __autoSubsrciption && __autoSubsrciption.unsubscribe()

        //     currentHook[2] = null
        //     observable = hookfuction();
        //     currentHook[2] = observable
        // }else{
        observable = currentHook[2];
    
        //hook.differValue = theArgs[0];  
       // hook();   //do to add nested observables
       
        // currentHook[0] = observable._value
       

        if(
            (currentHook[2].initialValue) !== (value) 
            && typeof value !== 'function'
            && value instanceof Observable === false
            && value !== undefined
        ){
            currentHook[0] = value;
            // if(JSON.stringify(observable.initialValue) !==JSON.stringify(value)){
            if( shallowequal(observable.initialValue,value) === false){
                // console.log('currentHook:value',value)
                if(typeof observable.next === 'function') observable.next(value)
            }
            observable.initialValue = value
           
            
        }
        // console.log('currentHook[0] = observable._value',currentHook[0],' = ',observable._value)
        return currentHook
   }else{
        
        observable = hook();
        if(observable === undefined){
            // console.error(`createObservable: hookfuction returns undefined`,hookfuction,args)
        }
   }
   const index = OBSERVABLE_HOOK.hooks.count 

   const newHook = [observable._value,null,observable,triggerRender];
   const set = (value)=>{
        
        currentHook = newHook
        // if(currentHook){ 
            observable = currentHook[2];
            currentHook[0] = value
        // }
        // console.log('ref::', currentHook[0],value,observable)
        observable.next(value)
   }

  
// 
    newHook[1] = set;// [observable._value,set,observable,triggerRender];
    OBSERVABLE_HOOK.add(newHook)    
    return newHook;
}


/**
 * @param  {} value
 * @param  {} subscribe=true
 */
export function useState(value,cb){ 
    const hook =  createState(value,cb)
    return hook
}
// export function useState(value,subscribe=false){ 
//     return  createObservable(()=>{
//         let observable;
//         observable = (value && value !== null)  ? new BehaviorSubject(value) : new BehaviorSubject(null)

//         if(value && value !== null) observable._value = value;
//         observable.initialValue = value

//         if(typeof subscribe === 'boolean' && subscribe === true) {
//             observable.subscribe();
//         }

//         if(typeof subscribe === 'function') {
//             observable.subscribe(value=>subscribe(value))
//         }

//         const check = (x,y)=>{
//             var test = x && x.isSameNode ? x.isSameNode(y) : (x===y)
//             return test
//         }

//         return observable
//             .filter(x=>x!==null)
//             .distinctUntilChanged(check)
        
//     })
// }
export function useObservableSwitch(creatObservable,theArgs,subscribe=false){  
    console.log('theArgs',theArgs)

    if(theArgs){  
        const args$ = Observable.combineLatest(...theArgs.map(value=>{
            return value instanceof Observable ? value : useObservable(value)[2];
        }));
        //const args$ =  useObservable(theArgs)[2];
        return useObservable(
           args$.pipe(
            switchMap(args=>typeof creatObservable === 'function'? creatObservable(args)  : creatObservable)
               ))
    }
    return useObservable(creatObservable,subscribe,theArgs)
}
/**
 * @param  {value || observable} value inital valeu or custom observable
 */
export function useObservable(value,subscribe=false,theArgs){ 
    const triggerRender = subscribe === true
    
    return  createObservable(()=>{
    
    
    let observable;
    if(value instanceof Observable){       
        observable = value;
    }else if(typeof value === 'function'){
        observable = value()
    }else{
        observable = value ? new BehaviorSubject(value) : new Subject();
        if(value) observable._value = value
        observable.initialValue = value
    }
    
    if(typeof subscribe === 'function') {
        observable.subscribe(subscribe)
    }else{
        // observable.subscribe();
    }
    
    return observable;


    },value,triggerRender)
}
/**
 * @param  {value || observable} value inital valeu or custom observable
 */
export function useRef(value,subscribe=false){ 

    return useObservable(value,true)
    const triggerRender = true;
    return  createObservable(()=>{
        let observable;
        observable = (value && value !== null)  ? new BehaviorSubject(value) : new BehaviorSubject(null)

        if(value && value !== null) observable._value = value;
        observable.initialValue = value

        if(typeof subscribe === 'boolean' && subscribe === true) {
            observable.subscribe();
        }

        if(typeof subscribe === 'function') {
            observable.subscribe(value=>subscribe(value))
        }

        const check = (x,y)=>{
            var test = (x && x.isSameNode &&  y && y.isSameNode ) ? x.isSameNode(y) : (x===y)
            return test
        }

        return observable
            .filter(x=>x!==null)
            .distinctUntilChanged(check)
        
    },value,triggerRender)
}

export function useProps(props){
        const hook = useObservable(props)
        return hook[2];
}

export function useObservableFast(value,...theArgs){
    const f =  useOnce(useObservable,value,...theArgs)(value)
    return f
}

/**
 * @param  {} hookfunction
 * @param  {} ...theArgs
 */
export function useHook(hookfunction,...theArgs){
    let triggerRender  = true;
    let hook = COMPONENET_ROOT_HOOK.get()
    
    if(hook){
        console.log('useHookuseHook',hook)
        return hook;
    }  
    hook = hookfunction(...theArgs)
    console.log('create new useHookuseHook',hook,theArgs)
    COMPONENET_ROOT_HOOK.add(hook)
    return hook
}
/**
 * @param  {} hookfunction
 * @param  {} ...theArgs
 */
export function useEffect(hookfunction,...theArgs){
    let triggerRender  = true;
    let hook = EFFECTS_HOOK.get();
    if(hook){
        //console.log('diff new useEffect (prev)',JSON.stringify(hook.differValue),'=== (curr)',JSON.stringify(theArgs[0]))
        if(shallowequal(theArgs[0],hook.differValue) === false){
       // if(JSON.stringify(theArgs[0]) !== JSON.stringify(hook.differValue)){   
            hookfunction()
        }
        hook.differValue = theArgs[0];
        
    }else{
        let remove = hookfunction(...theArgs)
        const clean = ()=>remove.call(this)
        console.log('create new useEffect',hookfunction,theArgs,EFFECTS_HOOK.count)
        EFFECTS_HOOK.add({differValue:theArgs[0],remove:remove})
    }
}

const createObservable2 = createObservable;


export function useOnce(fn,...theArgs){   
    let observable ;
    if(!forceUpdate && fn && typeof fn === 'function' ){        
        observable =  fn.apply(theArgs);
    }
    // do noting
    const newHook = fn;
    return newHook;
}

