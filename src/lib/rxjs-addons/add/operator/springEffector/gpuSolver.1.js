/* eslint func-names: 0, no-bitwise: 0 */
import GPU from 'gpu.js';
import FpsController from '../../../../FpsController';
import createMesure from '../../../../utils/dev/mesure';
import createAnimate from './animatie';
// import Spring from '../../../../../../assembly/spring';

const count = 1e3;// 1e3// MAX MEMORY SIZE
const fpsController = new FpsController();
// const mesure = createMesure(() => fpsController.checkfps(1, 10));
// const animate = createAnimate(() => fpsController.checkfps(60, 1));
// const PRESISION = 1e-2;
// const unitSize = 4; (max )
// The minimum the specs allow is 128 vec4 uniforms in the vertex shader and 16 vec4 uniforms
// glGetIntegerv(GL_MAX_VERTEX_UNIFORM_VECTORS, &max_v_uniforms);
// glGetIntegerv(GL_MAX_FRAGMENT_UNIFORM_VECTORS, &max_f_uniforms);

class SpringSolver {
  constructor() {
    this.subscribers = [];
    this.queue = [];
    this.bufferCount = 0;
    this.renderTasks = [];
  }

  initialize(count) {
    const canvas = document.getElementsByTagName('canvas')[0] || document.createElement('canvas');
    const gl = canvas.getContext('webgl', { antialias: false });
    const body = document.getElementsByTagName('body')[0];
    body.appendChild(canvas);
    // const gpu = new GPU({ webGl: gl });
    const gpu = new GPU();
    this.gpu = gpu;
    this.count = count;
    const input = new Uint16Array(count);
    const toValues = new Float64Array(count);
    const fromValues = new Float64Array(count);
    const indices = new Float64Array(count).map((x, i) => i + 1);
    console.log('indices', indices);
    this.input = input;
    this.toValues = toValues;
    this.fromValues = fromValues;
    this.indices = indices;

    // input texture
    const createInputTexture = gpu.createKernel((input) => 
       0//input[this.thread.x];
    ).setOutput([input.length]).setOutputToTexture(true);

    const inputTexture = createInputTexture(input);
    // input texture
    const createInputVelocityTexture = gpu.createKernel((input) => 
       0//input[this.thread.x];
    ).setOutput([input.length]).setOutputToTexture(true);

    const createIndicesTexture = gpu.createKernel(function (input) {
      return input[this.thread.x];
    }).setOutput([input.length]).setOutputToTexture(true);

    const inputIndicesTexture = createIndicesTexture(indices);
    const inputVelocityTexture = createInputVelocityTexture(input);
    // buffer
    const createBuffer = gpu.createKernel((input) => 
       0//nput[this.thread.x];
    ).setOutput([input.length]).setOutputToTexture(true);
    const buffer = createBuffer(inputTexture);
    const bufferVelocity = createBuffer(inputVelocityTexture);
    const bufferIndices = createBuffer(inputIndicesTexture);


    // input
    const megaKernelSpring = gpu.createKernelMap([
      function calcVelocity(i, u_to, i_from, i_velocity, u_time, timeStep) {
        /**
       * Returns accurate MOD when arguments are approximate integers.
       */


        const k = 181.8;
        const b = 9.;
        const mass = 1.0;
        const speed = 1.0;
        const t = u_time * speed;
        const curr = i_from;
        const toValue = u_to;
        const velocity = i_velocity;
        const s = -k * (curr - toValue);
        const d = -b * (velocity);
        const force = (s + d);
        const a = force / mass;
        const o_velocity = velocity + (a * (t / 1000.0) * 1.0);
        return o_velocity;
      },
      function next(i, u_to, i_from, velocity, u_time, timeStep) {
        const speed = 1.0;
        const t = (u_time * speed);
        const curr = i_from;
        const o_from = curr + (velocity * (t / 1000.0) * 1.0);
        return o_from;
      },
    ], function (t, timeStep, indices, to, from, velocity) {
      //  var to2 = to[0];
      //  if(timeStep !==  indices[this.thread.x]){
      const to2 = to[this.thread.x];
      // }
      return next(indices[this.thread.x], to2, from[this.thread.x], calcVelocity(indices[this.thread.x], to2, from[this.thread.x], velocity[this.thread.x], t, timeStep), t, timeStep);
    })
      .setOutput([input.length])
      .setOutputToTexture(true);


    const render = gpu.createKernel(function (input) {
      // var output = 0;
      // for (var i = 0; i < 1; i++) {
      //   output = input[this.thread.x];
      // }
      // return output;
      return input[this.thread.x];
    }).setOutput([input.length])
      .setOutputToTexture(true);

    this.KERNALS = {
      megaKernelSpring,
      render,
    };

    this.FBO = {
      buffer,
      bufferVelocity,
    };
  }

  // FIXME: NOT COMPLETE
  addSpring(values) {
    this.unitSize = values.length;
    this.bufferCount += this.unitSize;
    this.update(this.bufferCount, values);
    return this.bufferCount;
  }

  update(ptr, values) {
    for (let i = 0; i < this.unitSize; i += 1) {
      this.toValues[(ptr * this.unitSize) + i] = values[i];
    }
    // console.log(this.toValues)
    return ptr;
  }

  updateNumberTexture(texture) {

  }

  tick(callback) {
    this.subscribers.push(callback);
    return this.subscribers.length;
  }

  startSolver() {
    if (this.started) return;
    const {
      megaKernelSpring,
      render,
    } = this.KERNALS;


    const animate = createAnimate(() => fpsController.checkfps(30, 1));
    let timeStep = 1;
    animate(60, () => {
      const { bufferCount } = this;
      const maxBufferCount = bufferCount;
      const now = performance.now();
      const time = (now - this.lastTime) || 1;
      timeStep += fpsController.checkfps(1, `${2}ddqd`);

      const count = 10;
      this.lastTime = now;
      // console.log('step',timeStep % count)

      // calculate new spring values in wasm
      const currentState = megaKernelSpring(time, timeStep % count, this.indices, this.toValues, this.FBO.buffer, this.FBO.bufferVelocity);
      const [velocityState, currentValue] = currentState;
      this.FBO.buffer = currentValue;
      this.FBO.bufferVelocity = velocityState;

      // read wasm buffer data
      const texture = this.FBO.buffer;
      const gl = texture.webGl;
      const texSize = texture.size;
      let results;
      const floatOutput = false;
      // console.log('texture.size',texture.size)//[31, 33] (31*4*4)*(33*4*4)
      if (floatOutput) {
        const w = texSize[0];
        const h = Math.ceil(texSize[1] / 4);
        results = new Float32Array(w * h * 4);
        gl.readPixels(0, 0, w, h, gl.RGBA, gl.FLOAT, result);
      } else {
        const bytes = new Uint8Array(texSize[0] * texSize[1] * 4);
        // gl.readPixels(0, 0, texSize[0], texSize[1], gl.RGBA, gl.UNSIGNED_BYTE, bytes);
        gl.readPixels(0, 0, texSize[0], texSize[1], gl.RGBA, gl.UNSIGNED_BYTE, bytes);
        results = new Float32Array(bytes.buffer);
      }
      // console.log('results:::',results,count)
      for (let i = 0; i < this.subscribers.length; i += 1) {
        // console.log('results:::',results,count)
        const ptr = i * (this.unitSize);
        const values = results.slice(ptr, ptr + this.unitSize);
        // console.log('values',i,ptr,values)
        this.subscribers[i](values);
      }
    });
  }

  startSolverScheduled() {
    if (this.started) return;
    const {
      megaKernelSpring,
      render,
    } = this.KERNALS;
    const chunckSize = 256;
    // const animate = createAnimate(() => fpsController.checkfps(600, 1));
    // animate(60, (i) => {
    let i = 0;
    const texture = this.FBO.buffer;
    const gl = texture.webGl;
    const bytes = new Uint8Array(texSize[0] * texSize[1] * 4);
    const loop = () => {
      const { bufferCount } = this;
      const maxBufferCount = bufferCount;
      const start = 0;
      const end = maxBufferCount;
      const maxPass = Math.ceil(maxBufferCount / chunckSize);
      const pass = (i % maxPass) + 1;
      const minChunckSize = Math.min(chunckSize, bufferCount);

      const now = performance.now();
      const time = (now - this.lastTime) || 1;
      this.lastTime = now;

      if (fpsController.checkfps(60, pass)) {
        // calculate new spring values in wasm
        const currentState = megaKernelSpring(time, this.toValues, this.FBO.buffer, this.FBO.bufferVelocity);
        const [velocityState, currentValue] = currentState;
        this.FBO.buffer = currentValue;
        this.FBO.bufferVelocity = velocityState;
      }

      // console.log('results:::',results,count)

      // if(fpsController.checkfps(30, 'render_'+pass)){
      // read wasm buffer data

      const texture = this.FBO.buffer;
      const gl = texture.webGl;
      const texSize = texture.size;// texture.dimensions;//[gl.textureWidth,gl.textureHeight]

      const stepW = (minChunckSize / (texSize[0] * 4 * 4) * texSize[0]) / 4;
      const step = stepW * pass;
      const fragSize = [Math.floor((texSize[0] * 4 * 4) / minChunckSize), texture.size[1]];
      const fragW = fragSize[0];
      const fragH = Math.ceil(texSize[1] / 4);
      // const w = texSize[0];
      // const h = Math.ceil(texSize[1] / 4);
      let results;
      const floatOutput = false;
      // console.log('texture.size',texture.size)//[31, 33] (31*4*4)*(33*4*4)
      // if(fpsController.checkfps(30, 'update'+pass)){
      if (floatOutput) {
        const w = texSize[0];
        const h = Math.ceil(texSize[1] / 4);
        // results = new Float32Array(w * h * 4);
        gl.readPixels(0, 0, w, h, gl.RGBA, gl.FLOAT, result);
      } else {
        // var bytes = new Uint8Array(texSize[0] * texSize[1] * 4);
        // console.log('step+stepW',step,stepW,step+stepW,texSize[0])
        gl.readPixels(step, 0, step + stepW, texSize[1], gl.RGBA, gl.UNSIGNED_BYTE, bytes);
        results = new Float32Array(bytes.buffer);
      }

      for (let i = 0; i < minChunckSize; i += 1) {
        const ptr = i * this.unitSize * pass;
        const values = results.slice(ptr, ptr + this.unitSize);
        values.length > 0 && this.subscribers[i * pass] && this.subscribers[i * pass](values);
      }
      // }
      // }

      i++;
      window.requestAnimationFrame(loop);
    };
    window.requestAnimationFrame(loop);

    this.started = true;
  }
}


let springSolver;

function createSolver() {
  if (!springSolver) {
    springSolver = new SpringSolver();
    springSolver.initialize(count);
    // springSolver.startSolverScheduled();
    springSolver.startSolver();
  }
  return springSolver;
}

export default createSolver;
