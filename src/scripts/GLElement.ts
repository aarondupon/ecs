import { vec3, quat, mat3, mat4 } from 'gl-matrix';

const RAD_TO_DEG = 180 / Math.PI;


export default class GLElement {
  nodeId: number;
  orientation: quat;
  scale: vec3;
  parent: GLElement | null;
  children:Map<number, GLElement>;
  source: any;
  _position:vec3;
  private transform: mat4;
  constructor(element = null) {
    this.nodeId = GLElement.getuid();

    this._position = vec3.create();
    this.orientation = quat.create();
    this.scale = vec3.fromValues(1, 1, 1);
    this.transform = mat4.create();

    this.parent = null;
    this.children = new Map();
    this.source = element;
  }
  draw(camera){
    this.source.draw(camera)
  }
  static from (element) {
    return new GLElement(element);
  }
  set position(value:vec3) {
    
    if (this.source) this.source.position =  value;
    this.children.forEach(child => {
      console.log(child, value);
      child.position = value;
    });
    this._position = value;
  }
  get position():vec3 {
    
    return this._position;
  }
  clone(): GLElement {
    const cloned = new GLElement();
    cloned.setTransform(this.position, this.orientation, this.scale);
    return cloned;
  }

  copyFrom(other: GLElement): GLElement {
    this.setTransform(other.position, other.orientation, other.scale);
    this.calcTransform();
    return this;
  }

  /* Static methods */

  static NODE_UID = 0;

  static getuid(): number {
    return ++GLElement.NODE_UID;
  }

  /* Instance methods */

  getId(): number {
    return this.nodeId;
  }

  // Expects the child to also be a GLElement
  add(child: GLElement): GLElement {
    child.setParent(this);
    this.children.set(child.getId(), child);
    return this;
  }

  remove(child: GLElement): GLElement {
    this.children.delete(child.getId());
    return this;
  }

  setParent(parent: GLElement) {
    this.parent = parent;
  }

  // Returns null if node is an orphan
  getParent(): GLElement | null {
    return this.parent;
  }

  // Returns null if the id isn't present
  getChild(id: number): GLElement | null {
    return this.children.get(id) || null;
  }

  // Traverses the children of this node, depth-first, and calls func on each one (including the node itself)
  traverseDepthFirst(func: (child: GLElement) => void): GLElement {
    func(this);
    // @ts-ignore
    Object.values(this.children).forEach((child: GLElement) => {
      child.traverseDepthFirst(func);
    });

    return this;
  }

  // Traverses the children of this node, breadth-first, and calls func on each one (including the node itself)
  traverseBreadthFirst(func: (child: GLElement) => void): GLElement {
    const queue: Array<GLElement> = [this];

    while (queue.length) {
      const child = queue.shift() as GLElement;
      func(child);
      // @ts-ignore
      Object.values(child.children).forEach((child: GLElement) => {
        queue.push(child);
      });
    }

    return this;
  }

  // used for lazy calculations of the transform matrix
  private calcTransform() {
    this.transform = mat4.fromRotationTranslationScale(this.transform, this.orientation, this.position, this.scale);
  }

  getTransform(): mat4 {
    // First calculates the transform, then returns a defensive clone of it
    this.calcTransform();
    return mat4.clone(this.transform);
  }

  getPosition(): vec3 {
    // Defensive clone
    return vec3.clone(this.position);
  }

  getDistFrom(point: vec3): number {
    // Returns a number
    return vec3.dist(this.position, point);
  }

  getOrientation(): quat {
    // Defensive clone
    return quat.clone(this.orientation);
  }

  getScale(): vec3 {
    // Defensive clone
    return vec3.clone(this.scale);
  }

  getXAxis(): vec3 {
    const xaxis = vec3.fromValues(1, 0, 0);
    vec3.transformQuat(xaxis, xaxis, this.orientation);
    return vec3.normalize(xaxis, xaxis);
  }

  getYAxis(): vec3 {
    const yaxis = vec3.fromValues(0, 1, 0);
    vec3.transformQuat(yaxis, yaxis, this.orientation);
    return vec3.normalize(yaxis, yaxis);
  }

  getZAxis(): vec3 {
    const zaxis = vec3.fromValues(0, 0, 1);
    vec3.transformQuat(zaxis, zaxis, this.orientation);
    return vec3.normalize(zaxis, zaxis);
  }

  getGlobalTransform(): mat4 {
    const transform = this.getTransform();

    if (this.parent) {
      return mat4.multiply(transform, transform, this.parent.getGlobalTransform());
    }

    return transform;
  }

  getGlobalPosition(): vec3 {
    const position = this.getPosition();

    if (this.parent) {
      return vec3.add(position, position, this.parent.getGlobalPosition());
    }

    return position;
  }

  getGlobalOrientation(): quat {
    let orientation = this.getOrientation();

    if (this.parent) {
      orientation = quat.multiply(orientation, orientation, this.parent.getGlobalOrientation());
      return quat.normalize(orientation, orientation);
    }

    return orientation;
  }

  getGlobalScale(): vec3 {
    const scale = this.getScale();

    if (this.parent) {
      return vec3.multiply(scale, scale, this.parent.getGlobalScale());
    }

    return scale;
  }

  setTransform(position: vec3, orientation: quat, scale: vec3): GLElement {
    this.position = vec3.clone(position);
    this.orientation = quat.clone(orientation);
    quat.normalize(this.orientation, this.orientation);
    this.scale = vec3.clone(scale);
    return this;
  }

  translate(factor: vec3): GLElement {
    vec3.add(this.position, this.position, factor);
    return this;
  }

  // Translates along the local x axis
  translateX(factor: number): GLElement {
    const localXAxis = this.getXAxis();
    vec3.scale(localXAxis, localXAxis, factor);
    return this.translate(localXAxis);
  }

  // Translates along the local y axis
  translateY(factor: number): GLElement {
    const localYAxis = this.getYAxis();
    vec3.scale(localYAxis, localYAxis, factor);
    return this.translate(localYAxis);
  }

  // Translates along the local z axis
  translateZ(factor: number): GLElement {
    const localZAxis = this.getZAxis();
    vec3.scale(localZAxis, localZAxis, factor);
    return this.translate(localZAxis);
  }

  setPosition(position: vec3): GLElement {
    this.position = vec3.clone(position);
    return this;
  }

  rotateQuat(rotation: quat): GLElement {
    quat.multiply(this.orientation, this.orientation, rotation);
    quat.normalize(this.orientation, this.orientation);
    return this;
  }

  rotateX(xRadians: number): GLElement {
    quat.rotateX(this.orientation, this.orientation, xRadians);
    quat.normalize(this.orientation, this.orientation);
    return this;
  }

  rotateY(yRadians: number): GLElement {
    quat.rotateY(this.orientation, this.orientation, yRadians);
    quat.normalize(this.orientation, this.orientation);
    return this;
  }

  rotateZ(zRadians: number): GLElement {
    quat.rotateZ(this.orientation, this.orientation, zRadians);
    quat.normalize(this.orientation, this.orientation);
    return this;
  }

  rotateMat(inputMat: mat4): GLElement {
    const rotationMat = mat3.fromMat4(mat3.create(), inputMat);
    const rotationQuat = quat.fromMat3(quat.create(), rotationMat);
    quat.normalize(rotationQuat, rotationQuat);
    quat.multiply(this.orientation, this.orientation, rotationQuat);
    quat.normalize(this.orientation, this.orientation);
    return this;
  }

  setOrientation(orientation: quat): GLElement {
    this.orientation = quat.clone(orientation);
    quat.normalize(this.orientation, this.orientation);
    return this;
  }

  // uses quat.fromEuler, but assumes that the input is in radians, rather than degrees
  setFromEuler(euler: vec3): GLElement {
    const degX = RAD_TO_DEG * euler[0];
    const degY = RAD_TO_DEG * euler[1];
    const degZ = RAD_TO_DEG * euler[2];
    this.orientation = quat.fromEuler(this.orientation, degX, degY, degZ);
    quat.normalize(this.orientation, this.orientation);
    return this;
  }

  // lookAt // TODO
  // lookAt orients this object at a given position looking at a given other position

  scaleBy(scaleVector: vec3): GLElement {
    this.scale = vec3.multiply(this.scale, this.scale, scaleVector);
    return this;
  }

  scaleMult(factor: number): GLElement {
    this.scale = vec3.scale(this.scale, this.scale, factor);
    return this;
  }

  setScale(scaleVector: vec3): GLElement {
    this.scale = vec3.clone(scaleVector);
    return this;
  }
}
