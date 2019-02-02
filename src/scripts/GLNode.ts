import { vec3, quat, mat3, mat4 } from 'gl-matrix';

const RAD_TO_DEG = 180 / Math.PI;
let NODE_UID = 0;
declare interface GLNode{
    getId:any,
    add?:any,
    name?:any,
    remove?:any,
    getParent?:any,
    setParent?:any,
    getChild?:any,
    prototype?:any,
};

function getuid() {
    return ++ NODE_UID;
}
export function draw(camera) {

    // this.source.draw(camera)
}

export function from(element) {
  element.NODE_UID = 0;
  element.getuid = getuid;
  return element;
}

  /* Instance methods */

export function getId(): number {
  return this.nodeId || getuid() ;
}

class Children extends Map<number, GLNode>{}
export function createChildren() {
  return new Children();
}

// Expects the child to also be a GLNode
export function  add(child: GLNode): number {
    // child.setParent(this);
    // if(!child.getId){
    //     console.error(`Object ${(child.constructor.name)} has no getId function that returns a unic number`)
    //     return this;
    // }
  const id = this.children.size;
  console.log('this.children.size;', this.children.size);
  this.children.set(id, child);
  return id;
}

export function remove(child: GLNode): GLNode {
  this.children && this.children.delete(child.getId());
  return this;
}

export function setParent(parent: GLNode) {
  this.parent = parent;
}

  // Returns null if node is an orphan
export function getParent(): GLNode | null {
  return this.parent;
}

  // Returns null if the id isn't present
export function getChild(id: number): GLNode | null {
  return this.children.get(id) || null;
}

/** TRANSFORM FUNCTONS */
// used for lazy calculations of the transform matrix
function  calcTransform() {
  this.transform = mat4.fromRotationTranslationScale(this.transform, this.orientation, this.position, this.scale);
}



export function getDistFrom(point: vec3): number {
// Returns a number
  return vec3.dist(this.position, point);
}

export function getOrientation(): quat {
// Defensive clone
  return quat.clone(this.orientation);
}

export function getScale(): vec3 {
// Defensive clone
  return vec3.clone(this.scale);
}

export function getXAxis(): vec3 {
  const xaxis = vec3.fromValues(1, 0, 0);
  vec3.transformQuat(xaxis, xaxis, this.orientation);
  return vec3.normalize(xaxis, xaxis);
}

export function getYAxis(): vec3 {
  const yaxis = vec3.fromValues(0, 1, 0);
  vec3.transformQuat(yaxis, yaxis, this.orientation);
  return vec3.normalize(yaxis, yaxis);
}

export function getZAxis(): vec3 {
  const zaxis = vec3.fromValues(0, 0, 1);
  vec3.transformQuat(zaxis, zaxis, this.orientation);
  return vec3.normalize(zaxis, zaxis);
}

export function getGlobalTransform(): mat4 {
  const transform = this.getTransform();

  if (this.parent) {
    return mat4.multiply(transform, transform, this.parent.getGlobalTransform());
  }

  return transform;
}

export function getGlobalPosition(): vec3 {
  const position = this.getPosition();

  if (this.parent) {
    return vec3.add(position, position, this.parent.getGlobalPosition());
  }

  return position;
}

export function getGlobalOrientation(): quat {
  let orientation = this.getOrientation();

  if (this.parent) {
    orientation = quat.multiply(orientation, orientation, this.parent.getGlobalOrientation());
    return quat.normalize(orientation, orientation);
  }

  return orientation;
}

export function getGlobalScale(): vec3 {
  const scale = this.getScale();

  if (this.parent) {
    return vec3.multiply(scale, scale, this.parent.getGlobalScale());
  }

  return scale;
}

export function setTransform(position: vec3, orientation: quat, scale: vec3): GLNode {
  this.position = vec3.clone(position);
  this.orientation = quat.clone(orientation);
  quat.normalize(this.orientation, this.orientation);
  this.scale = vec3.clone(scale);
  return this;
}

export function translate(factor: vec3): GLNode {
  vec3.add(this.position, this.position, factor);
  return this;
}

// Translates along the local x axis
export function translateX(factor: number): GLNode {
  const localXAxis = this.getXAxis();
  vec3.scale(localXAxis, localXAxis, factor);
  return this.translate(localXAxis);
}

// Translates along the local y axis
export function translateY(factor: number): GLNode {
  const localYAxis = this.getYAxis();
  vec3.scale(localYAxis, localYAxis, factor);
  return this.translate(localYAxis);
}

// Translates along the local z axis
export function translateZ(factor: number): GLNode {
  const localZAxis = this.getZAxis();
  vec3.scale(localZAxis, localZAxis, factor);
  return this.translate(localZAxis);
}

export function setPosition(position: vec3): GLNode {
  this.position = vec3.clone(position);
  return this;
}

export function rotateQuat(rotation: quat): GLNode {
  quat.multiply(this.orientation, this.orientation, rotation);
  quat.normalize(this.orientation, this.orientation);
  return this;
}

export function rotateX(xRadians: number): GLNode {
  quat.rotateX(this.orientation, this.orientation, xRadians);
  quat.normalize(this.orientation, this.orientation);
  return this;
}

export function rotateY(yRadians: number): GLNode {
  quat.rotateY(this.orientation, this.orientation, yRadians);
  quat.normalize(this.orientation, this.orientation);
  return this;
}

export function rotateZ(zRadians: number): GLNode {
  quat.rotateZ(this.orientation, this.orientation, zRadians);
  quat.normalize(this.orientation, this.orientation);
  return this;
}

export function rotateMat(inputMat: mat4): GLNode {
  const rotationMat = mat3.fromMat4(mat3.create(), inputMat);
  const rotationQuat = quat.fromMat3(quat.create(), rotationMat);
  quat.normalize(rotationQuat, rotationQuat);
  quat.multiply(this.orientation, this.orientation, rotationQuat);
  quat.normalize(this.orientation, this.orientation);
  return this;
}

export function setOrientation(orientation: quat): GLNode {
  this.orientation = quat.clone(orientation);
  quat.normalize(this.orientation, this.orientation);
  return this;
}

// uses quat.fromEuler, but assumes that the input is in radians, rather than degrees
export function setFromEuler(euler: vec3): GLNode {
  const degX = RAD_TO_DEG * euler[0];
  const degY = RAD_TO_DEG * euler[1];
  const degZ = RAD_TO_DEG * euler[2];
  this.orientation = quat.fromEuler(this.orientation, degX, degY, degZ);
  quat.normalize(this.orientation, this.orientation);
  return this;
}

// lookAt // TODO
// lookAt orients this object at a given position looking at a given other position

export function scaleBy(scaleVector: vec3): GLNode {
  this.scale = vec3.multiply(this.scale, this.scale, scaleVector);
  return this;
}

export function scaleMult(factor: number): GLNode {
  this.scale = vec3.scale(this.scale, this.scale, factor);
  return this;
}

export function setScale(scaleVector: vec3): GLNode {
  this.scale = vec3.clone(scaleVector);
  return this;
}
