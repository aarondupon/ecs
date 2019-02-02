
import { mat4 } from 'gl-matrix';

declare interface IDrawObject{
  geo?:any,
  shader?:any,
  gl?:any,
  model?:any,
};
const draw = (specs:IDrawObject = {}) => (metods:any) => {
  const {
 geo, shader, gl, model,
} = specs;

  function render(camera) {

    // this.children && this.children.forEach((child) => {
    //   child.draw(camera);
    // });

    if (geo && shader && gl && model) {
      const position = this.getTranslate();
      mat4.identity(model);
      mat4.translate(model, model, position);
      const s = 0.5;
      const scale = [s, s, s];
      mat4.scale(model, model, scale);
      shader.bind();
      shader.uniforms.projection = camera.projection;
      shader.uniforms.view = camera.view;
      shader.uniforms.model = model;
      shader.uniforms.color = [1, 0, 0];
            // // draw the mesh
      geo.bind(shader);
      geo.draw(gl.POINTS);
      geo.unbind();

    }
  }

  const comp =  {
    ...metods,
    draw: { value: render },
  };

  return comp;
};
export default draw;