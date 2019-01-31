/* eslint func-names: 0, no-bitwise: 0 */
import GPU from 'gpu.js';
import FpsController from '../../../../FpsController';
// import createMesure from '../../../../utils/dev/mesure';
import createAnimate from './animatie';
// import Spring from '../../../../../../assembly/spring';

// const count = 10;// 1e3// MAX MEMORY SIZE
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
  }

  initialize(count, delayMS) {
    const canvas = document.getElementsByTagName('canvas')[0] || document.createElement('canvas');
    const gl = canvas.getContext('webgl', { antialias: false });
    const body = document.getElementsByTagName('body')[0];
    body.appendChild(canvas);
    const gpu = new GPU({ webGl: gl });
    this.gpu = gpu;
    this.count = count;


    // const input = new Uint16Array(count);
    const toValues = new Float64Array(count);
    const fromValues = new Float64Array(count);
    const indices = new Float64Array(count).map((x, i) => i + 1);
    this.input = new Uint16Array(count);
    this.toValues = toValues;
    this.fromValues = fromValues;
    this.indices = indices;
    this.delayMS = delayMS;
    this.delay = this.delayMS / 60 > 0 ? Math.floor(this.delayMS / 60) : 0;
    this.maxHistory = (count) * this.delay;
    this.results = toValues;

    // alert(this.maxHistory)
    this.history = Array(this.maxHistory).fill(0);
    // input texture
    const createHistoryTexture = gpu.createKernel(function (input) {
      return input[this.thread.x];
    }).setOutput([this.maxHistory]).setOutputToTexture(true);
    const bufferHistory = createHistoryTexture(this.history);

    // input texture
    const createInputTexture = gpu.createKernel(function (input) {
      return input[this.thread.x];
    }).setOutput([this.input.length]).setOutputToTexture(true);
    const inputTexture = createInputTexture(this.input);
    // input texture
    // const createIndicesTexture = gpu.createKernel(function (input) {
    //   return input[this.thread.x];
    // }).setOutput([this.input.length]).setOutputToTexture(true);
    // const inputIndicesTexture = createIndicesTexture(indices);
    // buffer
    const createBuffer = gpu.createKernel(function (input) {
      return input[this.thread.x];
    }).setOutput([this.input.length]).setOutputToTexture(true);
    const buffer = createBuffer(inputTexture);
    // const bufferIndices = createBuffer(inputIndicesTexture);


    // input
    /* eslint-disable */
    const megaKernelSpring = gpu.createKernelMap([
      function next(i, u_to, i_from, u_time) {
        return u_to;
      },
    ], function (t, indices, to, from) {
      return next(indices[this.thread.x], to[this.thread.x], from[this.thread.x], t);
    })
      .setOutput([this.input.length])
      .setOutputToTexture(true);
     /* eslint-enable */

    const render = gpu.createKernel(function (input) {
      // var output = 0;
      // for (var i = 0; i < 1; i++) {
      //   output = input[this.thread.x];
      // }
      // return output;
      return input[this.thread.x];
    }).setOutput([this.input.length]).setOutputToTexture(true);

    this.KERNALS = {
      megaKernelSpring,
      render,
    };

    this.CREATE = {
      createHistoryTexture,
    };

    this.FBO = {
      buffer,
      bufferHistory,
    };

    this.unitSize = this.count;
    this.bufferCount += this.unitSize;
    this.update(this.bufferCount, this.toValues);
  }

  update(ptr, values) {
    // console.log('this.results',values)
    // update history buffer
    this.history.unshift(values);
    this.history = this.history.slice(0, this.maxHistory);
    let i = 0;

    if (fpsController.checkfps(25, ptr)) {
      while (i < this.unitSize) {
        const historyIdx = i * this.delayMS;
        // set to values
        this.toValues[(ptr * this.unitSize) + i] = this.history[historyIdx]
        || this.toValues[(ptr * this.unitSize) + i];
        i += 1;
      }
      this.updateKernals();
      this.readKernals();
    }
    return this.history;
  }

  updateKernals() {
    const {
      megaKernelSpring,
    } = this.KERNALS;

    const now = performance.now();
    const time = (now - this.lastTime) || 1;
    this.lastTime = now;
    const currentState = megaKernelSpring(time, this.indices, this.toValues, this.FBO.buffer);
    const [currentValue] = currentState;
    this.FBO.buffer = currentValue;
  }

  readKernals() {
    const texture = this.FBO.buffer;
    const gl = texture.webGl;
    const texSize = texture.size;
    const bytes = new Uint8Array(texSize[0] * texSize[1] * 4);
    let results;
    const floatOutput = false;
    if (floatOutput) {
      const w = texSize[0];
      const h = Math.ceil(texSize[1] / 4);
      results = new Float32Array(w * h * 4);
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.FLOAT, results);
    } else {
      gl.readPixels(0, 0, texSize[0], texSize[1], gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      results = new Float32Array(bytes.buffer);
    }
    for (let i = 0; i < this.subscribers.length; i += 1) {
      const ptr = i * (this.unitSize);
      const values = results.slice(ptr, ptr + this.unitSize);
      this.subscribers[i](values);
    }
    // console.log(results)
    this.results = results;
  }

  tick(callback) {
    this.subscribers.push(callback);
    return this.subscribers.length;
  }

  startSolver() {
    const animate = createAnimate(() => fpsController.checkfps(30, 1));
    animate(24, () => {
      this.updateKernals();
      this.readKernals();
    });
  }
}

let springSolver;

function createSolver(count, delay) {
  if (!springSolver) {
    springSolver = new SpringSolver();
    springSolver.initialize(count, delay);
    // springSolver.startSolver();
  }
  return springSolver;
}

export default createSolver;
