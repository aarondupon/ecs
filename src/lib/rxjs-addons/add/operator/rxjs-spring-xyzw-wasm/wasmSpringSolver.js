/* eslint func-names: 0, no-bitwise: 0 */
import FpsController from '../../../../FpsController';
import createMesure from '../../../../utils/dev/mesure';
import createAnimate from './animatie';
// import Spring from '../../../../../../assembly/spring';


// decleartype float = Number // interchangeable f32/f64 for testing
// type f64 = number
// type f32 = number
// import "allocator/arena";
/* eslint disable */
class ISpring {
  from;
  to;
  velocity;
  static size = 3;
  static k = 16;
  static b = 3.5;
  static damp = 1.0;
  static mass = 1.0;
}

class Spring extends ISpring{
  from;
  to;
  velocity; // define attributes using GLSL types
  constructor(from, to, velocity){
    super();
    this.from = from;
    this.to = to;
    this.velocity = velocity;
  }
  static write(node, buffer, index) {
    buffer[index * ISpring.size] = node.from;
    buffer[index * ISpring.size + 1] = node.to;
    buffer[index * ISpring.size + 2] = node.velocity;
    return node;
    }
  static read(node, buffer, index) {
    node.from = buffer[index * ISpring.size];
    node.to = buffer[index * ISpring.size + 1];
    node.velocity = buffer[index * ISpring.size + 2];
    return node;
    }
}

const count = 1e3 * Spring.size * 2; // MAX MEMORY SIZE
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
      this.addSpring(this.queue[i]);
    }
  }

  addSpring(spring) {
    
   
   
    if(spring && spring.length) {
      this.unitSize = spring.length *Spring.size;
    };
    
    // loading
    if (!SpringSolver.wasmInscance) {
      this.queue.push(spring);
      return this.bufferCount;
    }
    // loaded
    
    const { ptrB } = this;
    const { exports } = SpringSolver.wasmInscance;
    const idx = this.bufferCount;
    const offset = (idx * Spring.size) 
    console.log(this.unitSize)
    for (var i = 0; i < this.unitSize; i += 1){
      const index = (i)*Spring.size
      const offset = (idx * Spring.size)  + index;
      exports.saveToMemory((ptrB >>> 2), spring[i], offset + 0); // to from
      exports.saveToMemory((ptrB >>> 2), spring[i], offset + 1); // to to
      exports.saveToMemory((ptrB >>> 2), 0, offset + 2); // to velocity
    }
    
    this.bufferCount += this.unitSize;
    
    return this.bufferCount;
  }

  update(idx, values) {
    if (!SpringSolver.wasmInscance) {
      return this.data;
    }
    const { ptrB } = this;
    const { exports } = SpringSolver.wasmInscance;
    for (var i = 0; i < this.unitSize; i += 1){
      const index = (i)*Spring.size
      const offset = (idx * Spring.size)  + index;
      exports.saveToMemory((ptrB >>> 2), values[i], (offset) + 1); // to value
    }

    
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
      exports.solveSpring(ptrB >>> 2, maxBufferCount*this.unitSize, time);
      // read wasm buffer data
      const results = this.readBuffer(ptrB, maxBufferCount*Spring.size);
      // console.log(results)
      // for (let i = 0; i < this.subscribers.length; i += 1) {
      //   this.subscribers[i](results);
      // }

      for (let i = 0; i < this.subscribers.length; i += 1) {
        const ptr = i*Spring.size;
        let values = []
        for (let u = 0; u < this.unitSize; u += 1) {
          const value = results.slice(ptr+(u*Spring.size),ptr+(u*Spring.size)+(Spring.size));
          values.push(value[0]);
        }

        // console.log('results:::',values);//results.slice(ptr+(1*Spring.size),ptr+(1*Spring.size)+(Spring.size)));
        // const offset = (idx * Spring.size)  + index;
        values && values.length > 0 && this.subscribers[i](values);
       
        
        // console.log('results:::',results,count)
       

        // console.log('values',i,ptr,values)
      }
      // console.log(results)
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
        exports.solveSpring((ptrB >>> 2) + 0, maxBufferCount*this.unitSize, time);
        
      }
     
      // console.log('results:::',results,count)
      start = pass*chunckSize;
      end = Math.min(start + chunckSize, bufferCount);
      if(fpsController.checkfps(30, 'render_'+pass)){
        // read wasm buffer data
        results = this.readBuffer(ptrB + start, end);
        for (let i = start; i < end; i += 1) {

          const ptr = i*Spring.size;
          let values = []
          for (let u = 0; u < this.unitSize; u += 1) {
            const value = results.slice(ptr+(u*Spring.size),ptr+(u*Spring.size)+(Spring.size));
            values.push(value[0]);
          }
          values && values.length > 0 && this.subscribers[i] && this.subscribers[i](values);

          // results && this.subscribers[i] && this.subscribers[i](results);
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
