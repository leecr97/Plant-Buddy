import {vec3, mat4, quat, vec4} from 'gl-matrix';

export default class Turtle {
    position: vec3 = vec3.create();
    quaternion: quat = quat.create();
    recursionDepth: number; // how many [ characters have been found while drawing before ]s
    angle: number;
    scale: vec3 = vec3.create();
    // age: number = 0;
    forward: vec3;
    up: vec3;
    right: vec3;
    rotAxis: vec3;

  constructor(pos: vec3, q: quat, a: number, s: vec3, rd: number, f: vec3, u: vec3, r: vec3) {
    this.position = pos;
    this.quaternion = q;
    this.angle = a;
    this.scale = s;
    this.recursionDepth = rd;
    this.forward = f;
    this.up = u;
    this.right = r;

    // if (ag > this.age) {
    //   this.age = ag;
    // }
  }

  moveForward() {
    let s: number = 2;
    // this.scale *= 0.95;
    let dist : vec3 = vec3.create();
    vec3.multiply(dist, this.forward, vec3.fromValues(s, s, s));
    vec3.add(this.position, this.position, this.forward);
    // console.log("move forward: " + this.position);
  }

  stepForward() {
    let s: number = 1;
    // this.scale *= 0.95;
    let dist : vec3 = vec3.create();
    vec3.multiply(dist, this.forward, vec3.fromValues(s, s, s));
    vec3.add(this.position, this.position, dist);
    // console.log("move forward: " + this.position);
  }
  
  drawLeaf() {
    // leaf
    this.rotAxis = vec3.fromValues(0,0,1);
  }

  drawPalmLeaf() {
    // palm leaf
    this.rotAxis = vec3.fromValues(0,1,0);
  }

  pointUp() {
    console.log("point up");
    this.forward[1] = -this.forward[1];
    quat.rotationTo(this.quaternion, vec3.fromValues(0,1,0), this.forward);
    quat.normalize(this.quaternion, this.quaternion);
  }

  pointDownwards() {
    this.forward[1] = this.forward[1] - 0.2;
    if (this.forward[1] < -1) {
      this.forward[1] = -1;
    }
    quat.rotationTo(this.quaternion, vec3.fromValues(0,1,0), this.forward);
    quat.normalize(this.quaternion, this.quaternion);
  }

  rotateAboutForward(deg: number) {
    let q: quat= quat.create();
    quat.setAxisAngle(q, this.forward, deg * Math.PI / 180.0);

    vec3.transformQuat(this.up, this.up, q);
    vec3.normalize(this.up, this.up);
    vec3.transformQuat(this.right, this.right, q);
    vec3.normalize(this.right, this.right);

    quat.rotationTo(this.quaternion, vec3.fromValues(1,0,0), this.right);
    console.log("forward rot quat: " + this.quaternion);
  }
  rotateAboutUp(deg: number) {
    let q: quat = quat.create();
    quat.setAxisAngle(q, this.up, deg * Math.PI / 180.0);

    vec3.transformQuat(this.forward, this.forward, q);
    vec3.normalize(this.forward, this.forward);
    vec3.transformQuat(this.right, this.right, q);
    vec3.normalize(this.right, this.right);

    quat.rotationTo(this.quaternion, vec3.fromValues(0,1,0), this.forward);
    console.log("up rot quat: " + this.quaternion);
  }
  rotateAboutRight(deg: number) {
    let q: quat = quat.create();
    quat.setAxisAngle(q, this.right, deg * Math.PI / 180.0);

    vec3.transformQuat(this.up, this.up, q);
    vec3.normalize(this.up, this.up);
    vec3.transformQuat(this.forward, this.forward, q);
    vec3.normalize(this.forward, this.forward);

    quat.rotationTo(this.quaternion, vec3.fromValues(0,0,1), this.up);
    console.log("right rot quat: " + this.quaternion);
  }
  // rotate(axis: vec3, deg: number) {
  //   vec3.normalize(axis, axis);
  //   let q: quat = quat.create();
  //   quat.setAxisAngle(q, axis, deg * Math.PI / 180.0);
  //   quat.normalize(q,q);

  //   this.forward = vec3.transformQuat(this.forward, this.forward, q);
  //   vec3.normalize(this.forward, this.forward);
  //   quat.rotationTo(this.quaternion, vec3.fromValues(0,1,0), this.forward);
  // }

  rotateForwardPos() {
    let r: number = Math.floor(Math.random() * 181);
    // let r: number = 15;
    this.rotateAboutForward(r);
  }

  rotateForwardNeg() {
    let r: number = Math.floor(Math.random() * 181);
    // let r: number = 15;
    this.rotateAboutForward(-1.0 * r);
  }

  rotateUpPos() {
    let r: number = Math.floor(Math.random() * this.angle);
    // let r: number = 15;
    this.rotateAboutUp(r);
  }

  rotateUpNeg() {
    let r: number = Math.floor(Math.random() * this.angle);
    // let r: number = 15;
    this.rotateAboutUp(-1.0 * r);
  }
  
  rotateRightPos() {
    let r: number = Math.floor(Math.random() * this.angle);
    // let r: number = 15;
    this.rotateAboutRight(r);
  }

  rotateRightNeg() {
    let r: number = Math.floor(Math.random() * this.angle);
    // let r: number = 15;
    this.rotateAboutRight(-1.0 * r);
  }

  getTransformation() : mat4 {
    let transformMat: mat4 = mat4.create();
    mat4.fromRotationTranslationScale(transformMat, this.quaternion, this.position, this.scale);
    return transformMat;
  }

  rotateQuat(axis: vec3, deg: number) : quat {
    vec3.normalize(axis, axis);
    let q: quat = quat.create();
    quat.setAxisAngle(q, axis, deg * Math.PI / 180.0);
    quat.normalize(q,q);

    let v: vec3 = vec3.fromValues(this.forward[0],this.forward[1],this.forward[2]);
    v = vec3.transformQuat(v, v, q);
    vec3.normalize(v, v);
    quat.rotationTo(q, vec3.fromValues(0,1,0), v);
    return q;
  }

  getLeafTransformation(wilt: boolean) : mat4 {
    let rq: quat = quat.create();
    let rangle : number = Math.floor(Math.random() * 361);
    // rq = this.rotateQuat(vec3.fromValues(1,0,0), rangle);
    // rangle  = Math.floor(Math.random() * 361);
    // rq = this.rotateQuat(vec3.fromValues(0,1,0), rangle);
    // rangle = Math.floor(Math.random() * 361);
    
    // console.log("angle: " + rangle);
    // if (wilt) {
    //   this.orientation[1] -= 0.05;
    // }
    // rq = this.rotateQuat(this.rotAxis, rangle);
    rq = this.quaternion;
    // if (wilt) {
    //   this.orientation[1] += 0.05;
    // }

    // console.log("sc: " + this.scale[0]);
    let s: vec3 = vec3.create();
    if (!wilt) {
      let ss: number = 1 / (4 * this.scale[0]);
      if (ss > 2) {
        ss = 2;
      }
      s = vec3.fromValues(ss, ss, ss);
      // console.log("s: " + ss);
    }
    else {
      // console.log(this.scale[0]);
      let ss: number = 1 / (4 * this.scale[0]);
      s = vec3.fromValues(ss, ss, ss);
    }

    let transformMat: mat4 = mat4.create();
    mat4.fromRotationTranslationScale(transformMat, rq, this.position, s);
    return transformMat;
  }
}