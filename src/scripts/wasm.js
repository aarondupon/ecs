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
      console.error(`abort called at main.ts:${line }:${column}`);
    },
  },
};
export default function wasm(input, callback) {
  const app = WebAssembly.instantiateStreaming(fetch(input), myImports)
    .then(callback);
  return app;
}
