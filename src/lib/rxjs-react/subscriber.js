import PropTypes from 'prop-types';
import React from 'react';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { merge } from 'rxjs/observable/merge';
import { combineLatest } from 'rxjs/observable/combineLatest';
import omit from 'lodash.omit';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeWhile';
import 'rxjs-addons/add/operator/debug';
import shallowequal from 'shallowequal';

const findObservalblesOfObject = mixedObject => Object.keys(mixedObject).reduce((observables, key) => {
  const prop = mixedObject[key];
  if (prop instanceof Observable) {
    return {
      ...observables,
      [key]: prop,
    };
  }
  return observables;
}, {});

const getObservalbleValuesAsProps = observables => Object.keys(observables).reduce((props, key) => ({
  ...props,
  [key]: observables[key].value,
}), {});


const getOtherProps = props => Object.keys(props).reduce((newProps, key) => {
  const prop = props[key];
  // console.log('prop instanceof Observable ',prop instanceof Observable,prop )
  if (prop instanceof Observable === false) {
    return {
      ...newProps,
      [key]: prop,
    };
  }
  return newProps;
}, {});



export default class Subscriber extends React.Component {
      static propTypes = {}
      static defaultProps = {}
      state = {
        observables:{},
      }
      
      componentWillMount(){
        this.destroy$ = new Subject();
        this.subscribe(this.props);
      }

      componentWillReceiveProps(nextProps) {
        this.subscribe(nextProps);
      }
      componentWillUnmount() {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
      }
      subscriptions = {}
      subscribe(props) {
          // const observablesAsProps = getObservalbleValuesAsProps(findObservalblesOfObject(props));
          // this.setState({
          //   ...observablesAsProps,
          // })
          
          const observables = {};
          let mappedObservables = {};
          if(typeof mapPropToObservers ===  'function'){
            const observablesToMap = {}
            Object.keys(props).forEach((key) => {
              const prop = props[key];
              if (prop instanceof Observable) {
                observablesToMap[key] = prop;
              }
              
            });
            mappedObservables = mapPropToObservers(observablesToMap);
          }
          const propsAndMappedObservables = {...props,...mappedObservables};
          Object.keys(propsAndMappedObservables).forEach((key) => {
            const prop = propsAndMappedObservables[key];
            if (prop instanceof Observable) {
            let observable = prop;
              // default behaviour
              if(this.subscriptions[key]) return;
              observables[key]= observable;
              this.subscriptions[key] = prop.takeUntil(this.destroy$).subscribe((streamValue) => {
                
                    
                    
                    if( 
                        this.state === undefined 
                        || shallowequal(this.state[key],streamValue) === false
                        // || JSON.stringify(this.state[key]) !== JSON.stringify(streamValue)
                      ){
                        const newState = {
                          ...this.state,
                          [key]:streamValue
                        }
                        if(this._innerComponent) this._innerComponent[key] = streamValue;
                        this.setState(newState)
                    }
                    
                  
                });
            };
          })

          
        
          this.setState({
            observables,
          })
       // }
      }
      render(): ReactElement {
        const {
          props,
          state
        } =  this;
        const {
          mapStateToProps,
        } = props
        // const otherProps = omit(props, 'children');
        const passThroughProps = {...state}
        if(typeof props.children === 'function'){
          const renderedChildren = props.children(passThroughProps);
          return renderedChildren && React.Children.only(renderedChildren);
        }else{
          return props.children || null;
        }
       
        
        
      }
    }