
import "allocator/arena";

import Spring from "./spring";
// import "allocator/tlsf";
// import "allocator/buddy";
type float = i32;

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
/**
 *  code for doing calculations on memory object 
 * that is't  initial value is set from js. 
 */
export function calc():void{
  for (var i:i32=0;i< b.length;i++){
    b[i] = b[i]-1;
  }
}

var b:Array<f64> ;
export function craeteDataBuffer(num:i32): Array<f64> {
  b = new Array<f64>(num);
  let i:i32 = 0;
  while (i < num) {
      b[i] = 0;
      i = i + 1;
  }
  return b;
}

export function getArray(): Array<f64> {
  return b;
}
export function getData(index:i32):f64 {
  return b[index];
}
export function setData(index:i32, value:f64):void {
  b[index] = value;
}


export function update(ptrData:i32,value:f64,offset:i32):void{
  store<f64>(ptrData+(offset*8), value)
}

export function saveToMemory(ptrData:i32,value:f64,offset:i32):void{
  store<f64>(ptrData+(offset*8), value)
}
export function readFromMemory(ptrData:i32,offset:i32):f64{
  const value:f64 = load<f64>((ptrData+(offset*8)));
  return value;
}

export function readFast_(ptrData:i32,offset:i32):f64{
  let value:f64 = load<f64>(ptrData+(offset*8));
  // let newValue = value - 1;
  // saveFast(ptrData,newValue);
  return value;
}



declare function sayHello(): void;
declare function logArray(arr:Array<i32>): void;

/** TETSING CONST. WASM to JS */
let pointer:i32;

const test:String = 'Aaron';

sayHello();//

let arr:Float64Array = new Float64Array(3);
function readSpring(i:i32):Float64Array{
  arr[0] = load<f64>(i); 
  arr[1] = load<f64>(i+1*8); 
  arr[2] = load<f64>(i+2*8); 
  return arr;
}

function writeSpring(spring:Float64Array,i:i32):Float64Array{
  store<f64>(i, spring[0]);
  store<f64>(i+1*8, spring[1]);
  store<f64>(i+2*8, spring[2]);
  return spring;
}

function updateSpring(spring:Float64Array,from:f64,to:f64,velocity:f64):Float64Array{
  spring[0] = from;
  spring[1] = to;
  spring[2] = velocity;
  return spring;
}

function getVelocity(time:f64,from:f64,to:f64,velocity:f64):f64{
  const k:f64 = 16.0;
  const b:f64 = 3.5;
  const mass:f64 = 1.0;
  const speed:f64 = 1.0;
  const t:f64 = time * speed;
  const curr:f64 = from;
  const s:f64 = -k * (curr - to);
  const d:f64 = -b * (velocity);
  const force:f64 = (s + d);
  const a:f64 = force / mass;
  const o_velocity:f64 = velocity + (a * (t / 1000.0) * 1.0);
  return o_velocity;
}

function getNext(time:f64,from:f64,to:f64,velocity:f64):f64{
  const speed:f64 = 1.0;
  const t:f64 = time * speed;
  const curr:f64 = from;
  const o_curr:f64 = curr + (velocity * (t / 1000.0) * 1.0);
  // const o_curr:f64 = curr + (-(curr - to) * (t/1000.0)) ;

  return o_curr;
}

export function solveSpring( ptr:i32, len:i32, time:f64):void{
  // GOOD
  // for (let i = ptr; i < ptr + len * 8; i += 8) {
  //   let item:f64 = load<f64>(i); 
  //   item = item -1;
  //   store<f64>(i, item);
  // }

  // VERSION 2
  let i:i32 = ptr;
  let next:f64;
  while (i < ptr + len * 8) {

  

    let spring:Float64Array = readSpring(i);
    
    // // update to
    // spring[1] = springs[1];

    let from:f64 = spring[0];
    let to:f64 = spring[1];
    let velocity:f64 = spring[2];

     // fix extreem movements bug BUGS BBBBBBUGS!
    if((to*to) > 1){
      to = from;
    }

    velocity = getVelocity(time,from,to,velocity);
    from = getNext(time,from,to,velocity);
    
    updateSpring(spring,from,to,velocity);
    writeSpring(spring,i);

    i += (8 * 3);
  }

}