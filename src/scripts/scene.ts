import createSphere from './create-sphere';
import createTorus from './create-torus';
import createSdfcontentText from './create-sdfcontent-text';
import * as createTexture from 'gl-texture2d';
import {default as hex } from 'hex2rgb';
import {getComponent,getTable, getTaskTable} from './system/helpers/system';
import { drawChildren, translate, composition } from './behaviors';
import addBehavior from './compose/operators/addBehavior';
import createElement from './compose/createElement';
import createESCElement from './compose/createESCElement';
import registerElement from './compose/registerElement';
import {timer} from 'rxjs';
import { animationFrame } from 'rxjs/scheduler/animationFrame';
import {scan} from 'rxjs/operators'


function raf(step = 1000) {
  return timer(0, 1000 / step, animationFrame).pipe(
      scan((total, value, index) => total + 1, 0));
}

var hex2rgb = (str) => {
  return hex(str).rgb.map(x => x/255)
}
/*
/*
  Brings together the textures, mesh, and lights into a unified scene.
 */
const light = {
  falloff: 1.5,
  radius: .1,
  position: [0, 0, .1],
  color: hex2rgb('#fffa9e'),
  ambient: hex2rgb('#373c3d'),
};



export default function scene(gl, images) {
  // the 3D objects for our scene
  const text  = createSdfcontentText(gl, { width:150, style:{} });
  // const registration =  registerElement(text);

  // registration.unregister()
  // setTimeout(()=>registration.unregister(),1000);
  // const translate3dTable = getTable('translate3d') // TODO CHEck if exist

  return function updateScene(time, camera) {

    // const data  = translate3dTable.get('text-component');
    // if(data){
    //   data.position = [100+100*Math.sin(time*.01),10,0]
    // }
  
    

  };
}
