import React from 'react';
var Observable = require('rxjs/Observable').Observable;
// var Subject = require('rxjs/Subject').Subject;
var map = require('rxjs/operator/map').map;
// var merge = require('rxjs/operator/merge').merge;
// var startWith = require('rxjs/operator/startWith').startWith;
// var scan = require('rxjs/operator/scan').scan;

class ConnectView extends React.Component {
      constructor(props) {
        super(props);
        this.state =  this.props.targetState;
      }
      subscribe(){
        let state$ = this.props.targetState;
        let selector = (state) => state;
        let _self = this;


        // this.subscription = state$.map(selector).subscribe((state)=>{
        //   _self.setState(state)
        // });
        //debugger
        this.subscription = map.call(state$,selector).subscribe((state)=>{
           _self.setState(state)
        });
      }
      componentWillMount() {
         if(!this.props.pause) this.subscribe()
      }
      componentWillReceiveProps(nextProps) {
        if(nextProps.pause !== this.props.pause){
          if(nextProps.pause){
            this.subscription.unsubscribe()
          }else{
            this.subscribe()
          }


        }
      }

      componentWillUnmount() {
        this.subscription.unsubscribe();
      }
      render(): ReactElement {
        const renderedChildren = this.props.children(this.state);
        return renderedChildren && React.Children.only(renderedChildren);
      }
};

export default ConnectView;
