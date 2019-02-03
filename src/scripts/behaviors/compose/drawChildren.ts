
import { mat4 } from 'gl-matrix';

declare interface IDrawObject{
  geo?:any,
  shader?:any,
  gl?:any,
  model?:any,
};
const drawChildren = (specs:IDrawObject = {}) => (metods:any) => {
  const {
      geo, shader, gl, model,
      } = specs;

  function draw(camera) {

    this.children && this.children.forEach((child) => {
      if( typeof child.draw === 'function') {
        child.draw(camera);
      }else{
        // console.warn('behavior:drawChildren:child.draw is not a function at childre.forEach')
      }
    });
  }

  const comp =  {
    ...metods,
    draw: { value: draw },
  };

  return comp;
};
export default drawChildren;