/* eslint func-names: 0, no-bitwise: 0, no-underscore-dangle:0, no-undef:0 */


import GPU from 'gpu.js';
import FpsController from '../../../../FpsController';
import createAnimate from './animatie';
// import Spring from '../../../../../../assembly/spring';

// const count = 10;// 1e3// MAX MEMORY SIZE
const fpsController = new FpsController();
var ping = 0;
const FPS = 30;
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

  initialize(options) {
    const {count = 1, delayMS = 10, outputToTexture, inputFPS, outputFPS} = options
    const canvas = document.getElementsByTagName('canvas')[0] || document.createElement('canvas');
    const gl = canvas.getContext('webgl', { antialias: false });
    // const body = document.getElementsByTagName('body')[0];
    // body.appendChild(canvas);
    // this.gpu = new GPU();
    this.gpu =  window.__gpu || new GPU({ webGl: gl });// window.__gpu || new GPU({ webGl: gl });
    this.gl = gl;

    this.count = count;
    this.outputToTexture = outputToTexture;
    this.delayMS = delayMS;
    this.delay = this.delayMS / 60 > 0 ? Math.ceil(this.delayMS / 60) : 0;
    this.updateInputFPS = options.inputFPS || FPS;
    this.updateOutputFPS = options.outputFPS || FPS;
    // this.createBuffers(count)


    // // input
    // this.createKernels()

    // // set intial state
    // this.unitSize = this.count;
    // this.bufferCount += this.unitSize;
    // this.update(this.bufferCount, this.toValues);
  }

  createBuffers(bufferCount,values) {

    if (values && values.type === 'NumberTexture') {
      this.createTextureBuffers(bufferCount,values)
      return;
    }
    this.toValues = Float32Array.of(...values);//new Float32Array(bufferCount);
    this.fromValues =  Float32Array.of(...values); //new Float32Array(bufferCount);
    this.indices = new Float32Array(bufferCount).map((x, i) => i + 1);
    this.results = this.toValues;
    this.input =  Float32Array.of(...values);///new Float32Array(bufferCount);
    // console.log('!!!!!',this.fromValues[0])
    // buffer generator
    // alert(bufferCount+'  '+this.input.length)
    const createBuffer = this.gpu.createKernel(function (input) {
      return input[this.thread.x];
    }).setOutput([bufferCount]).setOutputToTexture(true);
    const createVelocityBuffer = this.gpu.createKernel(function (input) {
      return input[this.thread.x];
    }).setOutput([bufferCount]).setOutputToTexture(true);
    const createFromBuffer = this.gpu.createKernel(function (input) {
      return input[this.thread.x];
    }).setOutput([bufferCount]).setOutputToTexture(true);
    this.createBuffers = createBuffer
    // console.log('reactBuffer',this.input.length, createBuffer([9,0,9,99,999,0,0,0,0,0]))
    this.FBO = {
      buffer: createBuffer(this.input),
      from: createFromBuffer(this.fromValues),
      bufferVelocity: createVelocityBuffer(new Float32Array(bufferCount)),
      bufferIndices: createBuffer(this.indices),
    };
  }

  createTextureBuffers(bufferCount, fromTexture) {
    const values = Array(fromTexture.output[0]|| bufferCount).fill(0); // data.toArray(this.GPU);
    this.toValues = Float32Array.of(...values); // new Float32Array(bufferCount);
    this.indices = new Float32Array(bufferCount).map((x, i) => i + 1);
    this.results = this.toValues;
    this.input =  Float32Array.of(...values); // new Float32Array(bufferCount);
    // console.log('!!!!!',this.fromValues[0])
    // buffer generator
    // alert(bufferCount+'  '+this.input.length)
    const createBuffer = this.gpu.createKernel(function (input) {
      return input[this.thread.x];
    }).setOutput([bufferCount]).setOutputToTexture(true);
    const createVelocityBuffer = this.gpu.createKernel(function (input) {
      return input[this.thread.x];
    }).setOutput([bufferCount]).setOutputToTexture(true);
    const createFromBuffer = this.gpu.createKernel(function (input) {
      return input[this.thread.x];
    }).setOutput([bufferCount]).setOutputToTexture(true);
    this.createBuffers = createBuffer;
    // console.log('reactBuffer',this.input.length, createBuffer([9,0,9,99,999,0,0,0,0,0]))
    this.FBO = {
      // buffer: fromTexture,
      from: fromTexture,
      bufferVelocity: createVelocityBuffer(new Float32Array(bufferCount)),
      bufferIndices: createBuffer(this.indices),
    };
  }

  // FIXME: NOT COMPLETE NEEDS TO BE DYNAMIC
  addSpring(values) {

    const ptr = this.bufferCount;
    if (values && values.type && values.type === 'NumberTexture') {
      const [unitSize] = values.output;
      this.unitSize = unitSize;
    } else {
      this.unitSize = values.length;
    }

    //  console.log(this.unitSize);
    this.bufferCount += this.unitSize;

    this.createBuffers(this.bufferCount,values);
    // // input
    this.createKernels(this.bufferCount);
    // // set intial state
    // this.bufferCount += this.unitSize;
    this.update(ptr, values);

    if (!this.raf) {
      this.startSolver();
      this.raf = true;
    }

    return ptr;//this.bufferCount;
  }

  update(ptr, values) {
    // alert(ptr)
   
    if (values && values.type && values.type === 'NumberTexture') {
      this.updateNumberTexture(ptr, values);
    }
    if (fpsController.checkfps(this.updateInputFPS, this.ptr+'_inputfps')) {
    for (let i = 0; i < this.unitSize; i += 1) {
      this.toValues[(ptr * this.unitSize) + i] = values[i];
    }
    }
    // this.ptr_ = ptr;
    // return this.results;
    return ptr;
  }

  updateNumberTexture(prt, texture) {
    // if (fpsController.checkfps(25, this.ptr)) {
    this.toValues = texture;
    // this.ptr_ = prt;
    return this.results;
  }


  createKernels() {
    const megaKernelSpring = this.gpu.createKernelMap([
      function calcVelocity(uTo, iFrom, iVelocity, uTime) {
        const k = 16;
        const b = 4.;
        const mass = 1.0;
        const speed = 1.0;
        const t = uTime * speed;
        const curr = iFrom;
        const toValue = uTo;
        const velocity = iVelocity;
        const s = -k * (curr - toValue);
        const d = -b * (velocity);
        const force = (s + d);
        const a = force / mass;
        var oVelocity = velocity + (a * (t / 1000.0) * 1.0);
        return oVelocity;
      },
      function next2(uTo, iFrom, velocity, uTime) {
        const speed = 1.0;
        const t = (uTime * speed);
        let curr = iFrom;

        var oFrom = curr + curr + (velocity * (t / 1000.0) * 1.0);

        if (abs(oFrom - iFrom) > 1.0) {
          oFrom = uTo;
        }
        return oFrom;
      },
    ], function (time, to, from, velocity) {
      /* eslint-disable */
      return next2(
        to[this.thread.x],
        from[this.thread.x],
        calcVelocity(to[this.thread.x], from[this.thread.x], velocity[this.thread.x], time),
        time
        );
      /* eslint-enable */
    })
      .setOutput([this.input.length])
      .setOutputToTexture(this.outputToTexture);


    const updateVelocity = this.gpu.createKernel(
      function (uTo, iFrom, iVelocity, uTime) {
        const k = 36;
        const b = 4.;
        const mass = 1.0;
        const speed = 1.0;
        const t = uTime * speed;
        const curr = iFrom[this.thread.x];
        const toValue = uTo[this.thread.x];
        const velocity = iVelocity[this.thread.x];
        const s = -k * (curr - toValue);
        const d = -b * (velocity);
        const force = (s + d);
        const a = force / mass;
        const oVelocity = velocity + (a * (t / 1000.0) * 1.0);
        return oVelocity;
      }
    ).setOutput([this.input.length]).setOutputToTexture(true);

    const updatePostion = this.gpu.createKernel(
      function (uTo, iFrom, iVelocity, uTime) {
        const speed = 1.0;
        const velocity = iVelocity[this.thread.x];
        const t = (uTime * speed);
        const curr = iFrom[this.thread.x];
        let oFrom = curr + (velocity * (t / 1000.0) * 1.0);
        // if (abs(oFrom - curr) > 1.0) {
        //   oFrom = curr + (oFrom - curr)*.01;
        // }
        return oFrom;
      }
    ).setOutput([this.input.length]).setOutputToTexture(true);
    

    this.KERNALS = {
      megaKernelSpring,
      updateVelocity,
      updatePostion,


    };
  }

  updateKernals() {
    const {
      megaKernelSpring,
      updateVelocity,
      updatePostion,
    } = this.KERNALS;

    const now = Date.now();
    const time = ((now - this.lastTime) || 1);
    this.lastTime = now;
    // var b = this.FBO.from.toArray(this.gpu);
    // console.log('FROM:',b)
    // FIREFOX BUG HACK BUFFER NOT WORKING!!!::::  CALCULATIONS ARE BAD 
    if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
      this.FBO.bufferVelocity = updateVelocity(this.toValues, this.FBO.from,  this.FBO.bufferVelocity, time);
      this.FBO.from = updatePostion(this.toValues, this.FBO.from,  this.FBO.bufferVelocity, time);
    }
      // updatePostion(this.FBO.buffer);
    //  console.log(this.FBO.from.toArray(this.gpu))
    ping ++
    const pong = ping % 2 === 0;

    const state = megaKernelSpring(time, this.toValues, this.FBO.from, this.FBO.bufferVelocity);
    const [velocityState, currentValue] = state;
    this.state = state;
    this.FBO.bufferVelocity = velocityState;
    this.FBO.from = currentValue;

   
    // this.FBO.buffer = currentValue;
    // console.log(state.result[2])

    const { gl } = this;
    // fpsController.checkfps(1, this.ptr) && console.log(position);
  }

  readKernals() {
    const texture = this.FBO.from;
    // const gl = texture.webGl;
    // const texSize = texture.size;
    // // const bytes = new Uint8Array(texSize[0] * texSize[1] * 4);
    let results;
    // const floatOutput = false;

    if (this.outputToTexture) {
      this.results = this.FBO.from
      for (let i = 0; i < this.subscribers.length; i += 1) {
        this.subscribers[i](this.results);
      }
      return;
    }
    // if (floatOutput) {
    //   const w = texSize[0];
    //   const h = Math.ceil(texSize[1] / 4);
    //   results = new Float32Array(w * h * 4);
    //   gl.readPixels(0, 0, w, h, gl.RGBA, gl.FLOAT, results);
    // } else {
    //   // gl.copyTexSubImage2D(texture,0,0,0,0,0,texSize[0],texSize[0]);

    //   gl.readPixels(0, 0, texSize[0], texSize[1], gl.RGBA, gl.UNSIGNED_BYTE, bytes);
    //   results = new Float32Array(bytes.buffer);
    // }
    results =  this.FBO.from.toArray(this.gpu)//this.state.result;
    for (let i = 0; i < this.subscribers.length; i += 1) {
      const ptr = (i) * (this.unitSize);
      const values = results.slice(ptr, ptr + this.unitSize);
      this.subscribers[i](values);
    }


    this.results = results;
  }

  tick(callback) {
    this.subscribers.push(callback);
    return this.subscribers.length;
  }

  startSolver() {
    const animate = createAnimate(() => fpsController.checkfps(this.updateOutputFPS, `${this._ptr}_loop_123`));
    animate(4, () => {
      this.updateKernals();
      this.readKernals();
    });
  }
}

let springSolver;

function createSolver(options) {
  if (!springSolver) {
    springSolver = new SpringSolver();
    springSolver.initialize(options);
  }
  return springSolver;
}

export default createSolver;
