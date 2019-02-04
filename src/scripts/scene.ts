import createSphere from './create-sphere';
import createTorus from './create-torus';
import createSdfcontentText from './create-sdfcontent-text';
import * as createTexture from 'gl-texture2d';
import {default as hex } from 'hex2rgb';
import { drawChildren, translate, composition } from './behaviors';
import {drawBehavior, translateBehavior, composotionBehavior} from './behaviors';

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

  const thorus = createESCElement(
    composotionBehavior(),
    drawBehavior(),
    translateBehavior(),
  )(createTorus())

  const dot = createESCElement(
    composotionBehavior(),
    drawBehavior(),
    translateBehavior(),
  )(createSphere())

  dot.parent = thorus
  dot.position = [0,0,0]
  dot.color = hex2rgb('#CC00CC');
  

  registerElement(dot);
  registerElement(thorus);

  
  // dot2.position = [0,0,0]
  // dot2.color = hex2rgb('#CC00CC');
  // dot2.parent = thorus
  

  registerElement(dot);
  registerElement(thorus);
  
  raf(60).subscribe(
    (time)=>{
      dot.position = [0,Math.sin(time/10)/3,2*Math.sin(time/10)]
      // dot2.position = [0,Math.sin(time/10)/3,2*Math.sin(time/10)]
    }
  )


  const sphere = createSphere(gl);
  
  const text  = createSdfcontentText(gl, { width:100, style:{} });

  const nullObj = createElement(
        composition(),
        drawChildren(),
      )({})

  // nullObj.add(thorus);
  nullObj.add(sphere);
  nullObj.add(text);
  registerElement(nullObj);
  // set light position to [0,0,0]
  // craete element from composition,drawChildren & add sphere;
  // createElement(composition(), drawChildren() )({}).add(sphere)

  // upload our textures with mipmapping and repeat wrapping
  const textures = images.map(image => {
    const tex = createTexture(gl, image);
    // setup smooth scaling
    tex.bind();
    tex.generateMipmap();
    tex.minFilter = gl.LINEAR_MIPMAP_LINEAR;
    tex.magFilter = gl.LINEAR;

    // and repeat wrapping
    tex.wrap = gl.REPEAT;

    // minimize distortion on hard angles
    const ext = gl.getExtension('EXT_texture_filter_anisotropic');
    if (ext) {
      const maxAnistrophy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      tex.bind();
      gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(16, maxAnistrophy));
    }

    return tex;
  });

  const [diffuse, normal, specular] = textures;

  return function updateScene(time, camera) {
   
   

    // move our light around
    light.position[0] = -Math.sin(time / 2) * 0.9;
    light.position[1] = -.5+(Math.sin(time / 2) *2);//* 0.3;
    light.position[2] = 0.5 + Math.sin(time / 2) ;

    // bind our textures to the correct slots
    diffuse.bind(0);
    normal.bind(1);
    specular.bind(2);


    thorus.position = light.position;
    // // draw our phong mesh
    // mesh.draw(camera);

    // // text.position = light.position;

    sphere.position = light.position;
    sphere.color = light.color;
    sphere.light = light;

    // thorus.light = light;



    // sphere.draw(camera);

    // // // group.children.forEach(element => {

    // group.position = light.position;
    // group.source.draw(camera);
    // // });

  };
}
