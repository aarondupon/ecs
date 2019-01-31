// import "allocator/arena";
type float = f64; // interchangeable f32/f64 for testing
// import "allocator/arena";
class ISpring {
  from: f64;
  to: f64;
  velocity: f64;
  static size:i32 = 3;
  static k:f64 = 16;
  static b:f64 = 3.5;
  static damp:f64 = 1.0;
  static mass:f64 = 1.0;
}

export default class Spring extends ISpring{
  from: f64;
  to: f64;
  velocity: f64; // define attributes using GLSL types
  constructor(from:f64, to:f64, velocity:f64){
    super();
    this.from = from;
    this.to = to;
    this.velocity = velocity;
  }
  static write(node: ISpring, buffer: Float64Array, index: i32): ISpring {
    buffer[index * ISpring.size] = node.from;
    buffer[index * ISpring.size + 1] = node.to;
    buffer[index * ISpring.size + 2] = node.velocity;
    return node;
    }
  static read(node: ISpring, buffer: Float64Array, index: i32): ISpring {
    node.from = buffer[index * ISpring.size];
    node.to = buffer[index * ISpring.size + 1];
    node.velocity = buffer[index * ISpring.size + 2];
    return node;
    }
}


/*
interface ISpring extends Obj<float | Object>{
    value:Obj<float>
    damp:string;
    isOvershooting: Obj<float>
    velocity: Obj<float>
    mass:float
}
*/
// export class Aaron{
//   x: f64;
//   y: f64;
//   static size():i32{return 4};
//   static write(node: Aaron, buffer: Float64Array, index: i32): Aaron {
//     buffer[index * Aaron.size()] = node.x;
//     buffer[index * Aaron.size() + 1] = node.y;
//     return node;
//     }
//   static read(node: Aaron, buffer: Float64Array, index: i32): Aaron {
//     node.x = buffer[index * Aaron.size()]
//     node.y = buffer[index * Aaron.size() + 1] 
//     return node;
//     }
// }

// var a: Map<String, float> = new Map<String, float>();

// a.set('x',2222200);
// a.set('y',1000000000);
// a.set('z',1000000000);


// class Spring{
//   constructor(
//     public value:Map<String, float> = new Map<String, float>(),
//   ){

//   }
// }

// export function createSpring(spring:Spring):Spring{
//     return spring;
// }

// function springFromToValue(from, to, speed, currentTime, k, b,damp, { next, cancel }) {
//   const t = currentTime * speed;
//   const current = from;
//   const property = 'value';
//   // const currentValue = from[property];
//   const fromValue = from[property]; 
//   to[property] = to[property]*damp;
//   const toValue = to[property];
//   const mass = current.mass;
//   const velocity = current.velocity[property];
//   // current spring value
//   const s = -k * ((fromValue - toValue));
//   // current damping value
//   const d = -b * (velocity);
//   // current acceleration value
//   const a = (s + d) / mass;
//   // update velocity
//   current.velocity[property] += a * (t / 1000) * 1;
//   // update position
//   current[property] += current.velocity[property] * (t / 1000) * 1;
  
//   if ( round(Math.abs(current.velocity[property])) < PRECISION){//} || current[property] !== 0) {
     
//       if(damp === 1){
//         cancel(to[property]);
//        }else{
//         cancel(0);
//        } 
//        return;
//   }
//   if(current[property] !== from) next(current);

//   return current;
// }