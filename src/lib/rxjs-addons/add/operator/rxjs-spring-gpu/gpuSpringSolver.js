/* eslint func-names: 0, no-bitwise: 0 */
import FpsController from '../../../../FpsController';
import createMesure from '../../../../utils/dev/mesure';
import createAnimate from './animatie';
// import Spring from '../../../../../../assembly/spring';
import GPU from 'gpu.js';

const count = 1e4 // MAX MEMORY SIZE
const fpsController = new FpsController();
const mesure = createMesure(() => fpsController.checkfps(1, 10));
const animate = createAnimate(() => fpsController.checkfps(60, 1));
const PRESISION = 1e-2;


class SpringSolver {
  constructor() {
    this.subscribers = [];
    this.queue = [];
    this.bufferCount = 0;
    this.renderTasks = [];

   
  }

  initialize(options) {
    //inputThrottleTime:200,outputToTexture:false, outputFPS:25, inputFPS:60
    const { inputThrottleFPS,outputToTexture, outputFPS, inuptFPS } = options;
    this.options = options
    this.outputToTexture = outputToTexture;
    const canvas = document.getElementsByTagName('canvas1')[0] || document.createElement('canvas');
    const gl = canvas.getContext('webgl', { antialias: false });
    const body = document.getElementsByTagName('body')[0];
    body.appendChild(canvas);
    const gpu = window.__gpu || new GPU({ webGl: gl });
    this.gpu = gpu
    this.count = count;
    const input = new Uint16Array(count);
    const toValues = new Float64Array(count)
    const fromValues = new Float64Array(count)
    this.input = input;
    this.toValues = toValues;
    this.fromValues = fromValues;

    // input texture
    let createInputTexture = gpu.createKernel(function (input) {
      return 0;//input[this.thread.x];
    }).setOutput([input.length]).setOutputToTexture(true);
    const inputTexture = createInputTexture(input);
    // input texture
    let createInputVelocityTexture = gpu.createKernel(function (input) {
      return 0;//input[this.thread.x];
    }).setOutput([input.length]).setOutputToTexture(true);
    const inputVelocityTexture = createInputVelocityTexture(input);
    // buffer
    let createBuffer = gpu.createKernel(function (input) {
      return input[this.thread.x];
    }).setOutput([input.length]).setOutputToTexture(true);
    let buffer = createBuffer(inputTexture);
    let bufferVelocity = createBuffer(inputVelocityTexture);
    // input
    const megaKernelSpring = gpu.createKernelMap([
      function calcVelocity(u_to, i_from, i_velocity, u_time) {
        const k = 66.0;
        const b = 3.5;
        const mass = 1.0;
        const speed = 2.0;
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
      function next(u_to, i_from, velocity, u_time) {
        const speed = 1.0;
        const t = u_time * speed;
        var curr = i_from;

       
        var o_from = curr + (velocity * (t / 1000.0) * 1.0);

        if (abs(o_from-i_from) > 1.0) {
          o_from = u_to;
        }
        return o_from;
      },
    ], function (t, to, from, velocity) {
      return next(to[this.thread.x], from[this.thread.x], calcVelocity(to[this.thread.x], from[this.thread.x], velocity[this.thread.x], t), t);
    })
      .setOutput([input.length])
      .setOutputToTexture(this.outputToTexture ? true : false);


      let render = gpu.createKernel(function (input) {
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
      }
      
  }
  // FIXME: NOT COMPLETE
  addSpring(idx, spring) {
    this.bufferCount += 1;
    return this.bufferCount;
  }
 
  update(idx, value) {
    // console.log('idx',value)
    if(this.options.inputThrottleFPS ) { 
      fpsController.checkfps((this.options.inputThrottleFPS), 'update'+idx)  && (this.toValues[idx] = value);
    }else {
      this.toValues[idx] = value;
    }
      return idx;
    }
  updateTexture(idx,value){
    this.toValues = value;
    return idx;
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
    } = this.KERNALS


    const animate = createAnimate(() => fpsController.checkfps(60, 1));

    animate(60, () => {
      const { bufferCount } = this;
      const maxBufferCount = bufferCount;
      const now = performance.now();
      const time = (now - this.lastTime) || 1;
      this.lastTime = now;
      
      // calculate new spring values in wasm
      const currentState = megaKernelSpring(time, this.toValues, this.FBO.buffer, this.FBO.bufferVelocity);
      const [velocityState, currentValue] = currentState;
      this.FBO.buffer = currentValue;
      this.FBO.bufferVelocity = velocityState;
      
      
      // read wasm buffer data
      const results = render(currentValue);
      // console.log('results:::',results,count)
      for (let i = 0; i < this.subscribers.length; i += 1) {
        // console.log('results:::',results,count)
        this.subscribers[i](results);
      }
    });
  }
  
  startSolverScheduled() {
    if (this.started) return;
    const {
      megaKernelSpring,
      render,
    } = this.KERNALS
    const chunckSize = 10256;
    const {state} = this;
    // const animate = createAnimate(() => fpsController.checkfps(600, 1));
    // animate(60, (i) => {
    let i = 0;
   const loop =() =>{
    
     
      const { bufferCount } = this;
      const maxBufferCount = bufferCount;
      let start = 0;
      let end = maxBufferCount;
      const maxPass = Math.ceil(maxBufferCount/chunckSize);
      const pass = i%maxPass;
  
      const now = performance.now();
        const time = (now - this.lastTime) || 1;
        this.lastTime = now;

      if( fpsController.checkfps(30, pass)){ 
        // calculate new spring values in wasm
        const currentState = megaKernelSpring(time, this.toValues, this.FBO.buffer, this.FBO.bufferVelocity);
        const [velocityState, currentValue] = currentState;
        this.FBO.buffer = currentValue;
        this.FBO.bufferVelocity = velocityState;
        this.state = currentState;
        // this.state.result = currentValue
        
      }
     
      // console.log('results:::',results,count)
      start = pass*chunckSize;
      end = Math.min(start + chunckSize, bufferCount);
      // console.log(this.state)
      if(fpsController.checkfps(30, 'render_'+pass) && this.state){
        // read wasm buffer data
        
        const results = this.state.result;

          for (let i = start; i < end; i += 1) {
            if(results){
                this.subscribers[i] && this.subscribers[i](results);
            } 
          }
        }
      
      // if(fpsController.checkfps(30, 'render_'+pass)){
      //   // read wasm buffer data
        
      //   const texture = this.FBO.buffer;
      //   const gl = texture.webGl;
      //   const texSize = texture.size//texture.dimensions;//[gl.textureWidth,gl.textureHeight]
        
      //   const stepW =   chunckSize / (texSize[0]*4*4 ) * texSize[0];
      //   const step =  stepW * pass;
      //   const fragSize = [Math.floor((texSize[0]*4*4)/chunckSize),texture.size[1]];
      //   const fragW = fragSize[0];
      //   const fragH = Math.ceil(texSize[1] / 4);
      //   const w = texSize[0];
      //   const h = Math.ceil(texSize[1] / 4);
      //   let results;
      //   const floatOutput = false;
      //   // console.log('texture.size',texture.size)//[31, 33] (31*4*4)*(33*4*4)
      //   if(fpsController.checkfps(30, 'update'+pass)){
      //   if (floatOutput) {
			// 		var w = texSize[0];
			// 		var h = Math.ceil(texSize[1] / 4);
			// 		results = new Float32Array(w * h * 4);
			// 		gl.readPixels(0, 0, w, h, gl.RGBA, gl.FLOAT, result);
			// 	} else {
      //     var bytes = new Uint8Array(texSize[0] * texSize[1] * 4);
      //     // gl.readPixels(0, 0, texSize[0], texSize[1], gl.RGBA, gl.UNSIGNED_BYTE, bytes);
			// 		gl.readPixels(step, 0, step+stepW, texSize[1], gl.RGBA, gl.UNSIGNED_BYTE, bytes);
			// 		results = new Float32Array(bytes.buffer);
			// 	}
       
      //     for (let i = start; i < end; i += 1) {
      //       if(results){
      //           this.subscribers[i] && this.subscribers[i](results);
                
      //       } 
      //     }
      //   }
      // }
      
        i++;
        window.requestAnimationFrame(loop)
      };
      window.requestAnimationFrame(loop)

    this.started = true;
  }
}



let springSolver = undefined;

function createSolver(options) {
  if(!springSolver){
    springSolver = new SpringSolver(options);
    springSolver.initialize(options);
    springSolver.startSolverScheduled();
  }
  return springSolver;
}

export default createSolver;
