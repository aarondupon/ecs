import { map } from 'rxjs/operators';
import createSolver from './gpuSolver.createBuffer';
// import createSolver from './gpuSolver';
let id = 0;

const delayFalloffEffector = (options) => {
  const effectorSolver = options.delay ? createSolver(options.count, options.delay, options.outputToTexture) : undefined;
  return map( (value) => {
    // console.log(value,options.delay )
    return options.delay > 0 ? effectorSolver.update((id), value) :  Array(options.count).fill(value); 
  });
};
export default delayFalloffEffector;
