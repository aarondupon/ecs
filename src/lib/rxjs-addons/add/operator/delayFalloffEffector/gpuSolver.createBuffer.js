/* eslint func-names: 0, no-bitwise: 0, no-underscore-dangle:0, no-undef:0 */

// import Spring from '../../../../../../assembly/spring';
import GPU from 'gpu.js';
import FpsController from '../../../../FpsController';
// import createMesure from '../../../../utils/dev/mesure';
import createAnimate from './animatie';

// const count = 10;//1e3// MAX MEMORY SIZE
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

  initialize(count, delayMS, outputToTexture) {
    const canvas = document.getElementsByTagName('canvas')[0] || document.createElement('canvas');
    const gl = canvas.getContext('webgl', { antialias: false });
    // const body = document.getElementsByTagName('body')[0];
    // body.appendChild(canvas);
    const gpu = new GPU({ webGl: gl });
    this.gpu = gpu;
    window.__gpu = gpu;
    window.__gl = gl;
    this.count = count;
    this.gl = gl;

 

    // const input = new Uint16Array(count);
    const toValues = new Float64Array(count);
    const fromValues = new Float64Array(count);
    const indices = new Float64Array(count).map((x, i) => i + 1);
    this.input = new Uint16Array(count);
    this.outputToTexture = outputToTexture;
    this.toValues = toValues;
    this.fromValues = fromValues;
    this.indices = indices;
    this.delayMS = delayMS;
    this.delay = this.delayMS / 60 > 0 ? Math.ceil(this.delayMS / 60) : 0;
    this.maxHistory = (count) * this.delay;


    // alert(this.maxHistory)
    this.history = Array(this.maxHistory).fill(0);
    this.history = Float64Array.from(this.history);
    // input texture
    const createHistoryTexture = gpu.createKernel(function (input) {
      return input[this.thread.x];
    }).setOutput([this.maxHistory]).setOutputToTexture(true);
    const bufferHistory = createHistoryTexture(this.history);

    // input texture
    const createOutputTexture = gpu.createKernel(function (input) {
      return input[this.thread.x];
    }).setOutput([this.input.length]).setOutputToTexture(true);
    // const bufferOutput = createOutputTexture(toValues);


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
      function setTo(i, u_to, historyIdxScalar) {
        const o_from = to[i * historyIdxScalar];
        return o_from;
      },
      function next(i, u_to, i_from, u_time) {
        return u_to;
      },
    ], function (t, indices, to, from, historyIdxScalar) {
      return next(indices[this.thread.x], to[this.thread.x * historyIdxScalar], setTo(this.thread.x, to, historyIdxScalar), t);
    })
      .setOutput([this.input.length])
      .setOutputToTexture(this.outputToTexture);
    /* eslint-enable */

    // const render = gpu.createKernel(function (input) {
    //   // var output = 0;
    //   // for (var i = 0; i < 1; i++) {
    //   //   output = input[this.thread.x];
    //   // }
    //   // return output;
    //   return input[this.thread.x];
    // }).setOutput([this.input.length]).setOutputToTexture(true);

    this.KERNALS = {
      megaKernelSpring,
      // render,
    };

    this.CREATE = {
      createHistoryTexture,
      createOutputTexture,
    };

    this.FBO = {
      buffer,
      bufferHistory,
    };


    if (this.outputToTexture) {
      this.toValues = this.FBO.buffer;
      this.results = this.FBO.buffer;
    } else {
      this.results = toValues;
    }

    this.unitSize = this.count;
    this.bufferCount += this.unitSize;
    this.update(this.bufferCount, this.toValues);
  }

  update(ptr, values) {
    
    // if (fpsController.checkfps(25, this.ptr)) {
    const isArray = Array.isArray(values);
    // this.history.unshift(values[0] || values);
    // this.history = this.history.slice(0, this.maxHistory);
    this.history.copyWithin(1, 0, this.maxHistory - 1);

    this.history[0] = isArray ? values[0] : values;

    const bufferHistory = this.CREATE.createHistoryTexture(this.history);
    const output = this.CREATE.createOutputTexture(Array(this.count).fill(Math.random(1) + 1));

    this.output = output;
    this.FBO.bufferHistory = bufferHistory;

    this.updateKernals();
    this.readKernals();
    // }
    this.gl.flush();
    // this.readKernals2(output)
    this.ptr_ = ptr;
    return  this.results;
    // return ptr;
  }

  updateKernals() {
    const {
      megaKernelSpring,
      // render,
    } = this.KERNALS;

    const now = performance.now();
    const time = (now - this.lastTime) || 1;
    this.lastTime = now;
    const historyIdxScalar = this.delay;
    const state = megaKernelSpring(
      time,
      this.indices,
      this.FBO.bufferHistory,
      this.FBO.buffer,
      historyIdxScalar
    );
    const [currentValue] = state;
    this._buffer = currentValue;

    this.state = state;
  }

  readKernals() {
    const texture = this.FBO.buffer;
    const gl = texture.webGl;
    const texSize = texture.size;
    const bytes = new Uint8Array(texSize[0] * texSize[1] * 4);
    let results;


    if (this.outputToTexture) {
      this.results = this.state.result;
      for (let i = 0; i < this.subscribers.length; i += 1) {
        this.subscribers[i](this.results);
      }
      return results;
    }
    
    results = this.state.result
    
    // console.log(a)
    for (let i = 0; i < this.subscribers.length; i += 1) {
      const ptr = i * (this.unitSize);
      const values = results.slice(ptr, ptr + this.unitSize);
      this.subscribers[i](a);
    }
    this.results = results;
    return results
    const floatOutput = false;


    // if (this.outputToTexture) {
    //   for (let i = 0; i < this.subscribers.length; i += 1) {
    //     this.subscribers[i](this.results);
    //   }
    //   this.results = this.output;// this.FBO.buffer //this.FBO.bufferHistory;
    //   return;
    // }
    // if (floatOutput) {
    //   const w = texSize[0];
    //   const h = Math.ceil(texSize[1] / 4);
    //   results = new Float32Array(w * h * 4);
    //   gl.readPixels(0, 0, w, h, gl.RGBA, gl.FLOAT, results);
    // } else {
    //   gl.readPixels(0, 0, texSize[0], texSize[1], gl.RGBA, gl.UNSIGNED_BYTE, bytes);
    //   results = new Float32Array(bytes.buffer);
    // }
    // for (let i = 0; i < this.subscribers.length; i += 1) {
    //   const ptr = i * (this.unitSize);
    //   const values = results.slice(ptr, ptr + this.unitSize);
    //   this.subscribers[i](values);
    // }
    // // console.log(this.FBO.bufferHistory.toArray(this.gpu))
    // this.results = results;
  }
  /* eslint-disable */
  readKernals2(buffer) {
    const texture = buffer;
    const gl = texture.webGl;
    const texSize = texture.size;
    const bytes = new Uint8Array(texSize[0] * texSize[1] * 4);

    let results;
    const floatOutput = false;

    // if (this.outputToTexture) {
    //   this.results = this.FBO.buffer;
    //   for (let i = 0; i < this.subscribers.length; i += 1) {
    //     this.subscribers[i](this.results);
    //   }
    //   return;
    // }
    if (floatOutput) {
      const w = texSize[0];
      const h = Math.ceil(texSize[1] / 4);
      results = new Float32Array(w * h * 4);
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.FLOAT, results);
    } else {
      // gl.copyTexSubImage2D(texture,0,0,0,0,0,texSize[0],texSize[0]);
      gl.readPixels(0, 0, texSize[0], texSize[1], gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      results = new Float32Array(bytes.buffer);
    }
    // console.log('this.toValues', results, texSize);
    // for (let i = 0; i < this.subscribers.length; i += 1) {
    //   const ptr = (i) * (this.unitSize);
    //   const values = results.slice(ptr, ptr + this.unitSize);
    //   this.subscribers[i](values);
    // }S
    // this.results = results;
  }
  /* eslint-enbable */
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

function createSolver(count, delay, outputToTexture) {
  if (!springSolver) {
    springSolver = new SpringSolver();
    springSolver.initialize(count, delay, outputToTexture);
    // springSolver.startSolver();
  }
  return springSolver;
}

export default createSolver;
