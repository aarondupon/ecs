import createSphere from './create-sphere';
import createTorus from './create-torus';
import createSdfcontentText from './create-sdfcontent-text/index';
import * as createTexture from 'gl-texture2d';
import GLElement from './GLElement';
import * as hex2rgb from 'hex2rgb';
/*
  Brings together the textures, mesh, and lights into a unified scene.
 */

export default function scene(gl, images) {
  // the 3D objects for our scene
  const mesh = createTorus(gl);
  const sphere = createSphere(gl);
  const text  = createSdfcontentText(gl,{width:100,style:{}})
  
  // const demo = new GLElement();
  const group = GLElement.from(createSphere(gl));
  // demo.add(sphere);
  
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

  const light = {
    falloff: 0.15,
    radius: 5,
    position: [0, 0, 0],
    color: hex2rgb('#00FFFF').rgb,
    ambient: hex2rgb('#0a040b').rgb,
  };

  return function draw(time, camera) {
    // move our light around
    light.position[0] = -Math.sin(time / 2) * 0.9;
    light.position[1] = Math.sin(time / 2) * 0.3;
    light.position[2] = 0.5 + Math.sin(time / 2) * 2;

    

    // bind our textures to the correct slots
    diffuse.bind(0);
    normal.bind(1);
    specular.bind(2);

    // draw our phong mesh
    mesh.light = light;
    mesh.draw(camera);

    text.draw(camera);
    // text.position = light.position;

    // sphere.position = light.position;
    // sphere.color = light.color;
    // sphere.light = light;
    // sphere.draw(camera);

    // // group.children.forEach(element => {
    
    group.position = light.position;
    group.source.draw(camera);
    // // });
    

  };
}
