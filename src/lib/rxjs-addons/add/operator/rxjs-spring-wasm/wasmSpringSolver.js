/* eslint func-names: 0, no-bitwise: 0 */
import FpsController from '../../../../FpsController';
import createMesure from '../../../../utils/dev/mesure';
import createAnimate from './animatie';
import Spring from '../../../../../../assembly/spring';

const count = 1e4 * Spring.size; // MAX MEMORY SIZE
const fpsController = new FpsController();
const mesure = createMesure(() => fpsController.checkfps(1, 10));
const animate = createAnimate(() => fpsController.checkfps(60, 1));
const memory = new WebAssembly.Memory({ initial: 0 });
const myImports = {
  env: {
    memory,
    sayHello() {
      console.log('Hello from WebAssembly!');
    },
    logArray: (ptr) => {
      console.log('LOGGIN FUKCING NOW', new Uint32Array(memory.buffer, ptr, 0));
    },
    abort(msg, file, line, column) {
      console.error(`abort called at main.ts:${line}:${column}`);
    },
  },
};

function wasm(input, callback) {
  const app = WebAssembly.instantiateStreaming(fetch(input), myImports)
    .then(callback);
  return app;
}

class SpringSolver {
  constructor() {
    this.subscribers = [];
    this.queue = [];
    this.bufferCount = 0;
  }

  initialize(count) {
    this.count = count;
    this.unitSize = Spring.size;
    const { exports } = SpringSolver.wasmInscance;
    this.data = new Float64Array(count).map(() => 10000000000);
    this.ptrB = exports.craeteDataBuffer(this.data.length << 2);
    for (let i = 0; i < count; i += 1) {
      Spring.write(new Spring(0, 0, 0), this.data, i);
      // send data to wasm module pointer
      exports.saveToMemory((this.ptrB >>> 2), this.data[i], i);
    }
  }

  loadQueue() {
    for (let i = 0; i < this.queue.length; i += 1) {
      this.addSpring(...this.queue[i]);
    }
  }

  addSpring(idx, spring) {
    // loading
    if (!SpringSolver.wasmInscance) {
      this.queue.push([idx, spring]);
      return this.bufferCount;
    }
    // loaded
    const { ptrB } = this;
    const { exports } = SpringSolver.wasmInscance;
    this.bufferCount += 1;
    exports.saveToMemory((ptrB >>> 2), spring.to, (idx * Spring.size) + 0); // to from
    exports.saveToMemory((ptrB >>> 2), spring.from, (idx * Spring.size) + 1); // to to
    exports.saveToMemory((ptrB >>> 2), spring.velocity, (idx * Spring.size) + 2); // to velocity
    return this.bufferCount;
  }

  update(idx, value) {
    if (!SpringSolver.wasmInscance) {
      return this.data;
    }
    const { ptrB } = this;
    const { exports } = SpringSolver.wasmInscance;
    exports.saveToMemory((ptrB >>> 2), value, (idx * Spring.size) + 1); // to value
    return idx;
  }

  tick(callback) {
    this.subscribers.push(callback);
    return this.subscribers.length;
  }

  readBuffer(pointer, length) {
    if (!SpringSolver.wasmInscance) {
      return this.data;
    }
    const { exports } = SpringSolver.wasmInscance;
    for (let i = 0; i < length; i += 1) {
      this.data[i] = exports.readFromMemory(pointer >>> 2, i);
    }
    return this.data;
  }

  startSolver() {
    if (this.started) return;
    const { exports } = SpringSolver.wasmInscance;
    const animate = createAnimate(() => fpsController.checkfps(60, 1));
    animate(60, () => {
      const { bufferCount, ptrB } = this;
      const maxBufferCount = bufferCount;
      const now = performance.now();
      const time = (now - this.lastTime) || 1;
      this.lastTime = now;
      // calculate new spring values in wasm
      exports.solveSpring(ptrB >>> 2, maxBufferCount, time);
      // read wasm buffer data
      const results = this.readBuffer(ptrB, maxBufferCount);
      // console.log('results:::',results,count)
      for (let i = 0; i < this.subscribers.length; i += 1) {
        this.subscribers[i](results);
      }
    });
  }
  renderTasks = []
  startSolverScheduled() {
    if (this.started) return;
    const { exports } = SpringSolver.wasmInscance;
    const chunckSize = 512;
    let results;
    // const animate = createAnimate(() => fpsController.checkfps(600, 1));
    // animate(60, (i) => {
    let i = 0;
   const loop =() =>{
    
     
      const { bufferCount, ptrB } = this;
      const maxBufferCount = bufferCount;
      let start = 0;
      let end = maxBufferCount;
      const maxPass = Math.ceil(maxBufferCount/chunckSize);
      const pass = i%maxPass;
  
      const now = performance.now();
        const time = (now - this.lastTime) || 1;
        this.lastTime = now;

      if( fpsController.checkfps(60, pass)){ 
        // calculate new spring values in wasm
        exports.solveSpring((ptrB >>> 2) + 0, maxBufferCount, time);
        
      }
     
      // console.log('results:::',results,count)
      start = pass*chunckSize;
      end = Math.min(start + chunckSize, bufferCount);
      if(fpsController.checkfps(30, 'render_'+pass)){
        // read wasm buffer data
        results = this.readBuffer(ptrB + start, end);
        for (let i = start; i < end; i += 1) {
          results && this.subscribers[i] && this.subscribers[i](results);
        }
      }
      
        i++;
        window.requestAnimationFrame(loop)
      };
      window.requestAnimationFrame(loop)

    this.started = true;
  }
}

SpringSolver.wasmInscance = undefined;

const springSolver = new SpringSolver();
wasm('./assembly/index.wasm', (result) => {
  SpringSolver.wasmInscance = result.instance;
  springSolver.initialize(count);
  springSolver.loadQueue(count);
  springSolver.startSolverScheduled();
});

function createSolver() {
  return springSolver;
}

export default createSolver;
