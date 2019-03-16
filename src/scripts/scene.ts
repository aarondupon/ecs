import createSphere from './create-sphere';
import createTorus from './create-torus';
import createSdfcontentText from './create-sdfcontent-text';
import * as createTexture from 'gl-texture2d';
import { default as hex } from 'hex2rgb';
import { getComponent, getTable, getTaskTable, getComponentList, getComponentNames } from './system/helpers/system';
import { drawChildren, translate, composition } from './behaviors';
import addBehavior from './compose/operators/addBehavior';
import createElement from './compose/createElement';
import createESCElement from './compose/createESCElement';
import registerElement from './compose/registerElement';
import { timer, Observable } from 'rxjs';
import { animationFrame } from 'rxjs/scheduler/animationFrame';
import { map, scan, share , pairwise } from 'rxjs/operators';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { TweenMax } from 'gsap';
// import createAnimate from './system/helpers/animatie';
// import FpsController from './system/helpers/FpsController';

// const fpsController = new FpsController()
// const animate = createAnimate(() => fpsController.checkfps(1, 1));

// animate(1, () => {
//   console.log('fps')
// })

function raf(step = 1000) {
  const date = Date.now()
  return timer(0, 1000 / step).pipe(
      // map(x=>Date.now()),
      // pairwise(),
      // map(([a,b]) => a-b)

      // scan((total) => total + 1, date),
      );
}

const hex2rgb = (str) => {
  return hex(str).rgb.map(x => x / 255);
};
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

const GENARTOR:any =  raf(60);
const GENARTOR2:any =  raf(1);

const translate3dTable = getTable('translate3d'); // TODO CHEck if exist
const rotate3dTable = getTable('rotate3d'); // TODO CHEck if exist

// const pos = {left:0}
// if(pos) TweenMax.to(pos, 2, {left:1000, repeat:-1, yoyo:true,onUpdate:(v)=>{
//   // console.log(pos.left)
//     translate3dTable.update(`text-component`,{
//     position : [(10 * 1) + pos.left, 10, 0],
//   });

// }})

GENARTOR.subscribe(time => {
  const w = window.innerWidth - 200;
  // translate3dTable.update(`text-component`,{
  //   position : [window.innerWidth/2+Math.floor(w * Math.sin(Date.now() * .0007)), 10, 0],
  // });

  // console.log('translate3dTable.size',translate3dTable.size)
//   for (let i = 0; i < translate3dTable.size; i++){

//     // rotate3dTable.update('text-component'+i, { rotation : [0, 0, i*90] });
//     translate3dTable.update(`text-component${i}`,{
//       position : [(10 * i) + (window.innerWidth * Math.sin(time * .01)), 10*i, i*10],
//     });

// }
  let idx = 0;
  translate3dTable.forEach((component, key, map) => {
    const position = [(10 * idx) + (window.innerWidth * Math.sin(time * .01 * idx)), 50 * idx, 0];
    // console.log(key,position[1])
    translate3dTable.update(key, {
      position,
    });
    idx = (idx + 1)  %  (map.size);
  });

  // translate3dTable.update('text-component', { position : [(window.innerWidth * Math.sin(time*.1)), 10, 0] });

});
const i = 0;
// GENARTOR2.subscribe(time => {
//   i ++;
//   // console.log(time)
//   // console.log(rotate3dTable.get('text-component'))
//   // rotate3dTable.update('text-component', { rotation : [0, 0, i*90] });
//   // for (let i = 0; i < 50; i++){
//   //   rotate3dTable.update('text-component'+i, { rotation : [0, 0, i*90] });
//   // }

// });

// GENARTOR.subscribe(time=>{
//   const data  = translate3dTable.get('text-component');
//   if(data){
//     console.log(data)
//     data.position = [100+(100*Math.sin(time*.1)),10,0];
//     translate3dTable.next('text-component',{data})
//   }

// })

export default function scene(gl, images) {
  // the 3D objects for our scene
  // const text  = createSdfcontentText(gl, { width:150, style:{} });

  for (let i = 0; i < 10; i++) {
    const text  = createSdfcontentText({ width:350, style:{} });
    const registration =  registerElement(text);
    // setTimeout(()=>{
    //   const text  = createSdfcontentText({ width:350, style:{} });
    //   const registration =  registerElement(text);
    // },i*5)

  }

    // setTimeout(()=>{
    //   const text  = createSdfcontentText({ width:350, style:{} });
    //   const registration =  registerElement(text);
    // },1000)
  // const registration =  registerElement(text);

  // registration.unregister()
  // setTimeout(()=>registration.unregister(),1000);

  return function updateScene(time, camera) {

  };
}
