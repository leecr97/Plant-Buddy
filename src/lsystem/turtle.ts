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
    orientation: vec3;

  constructor(pos: vec3, ori: vec3, q: quat, a: number, s: vec3, rd: number, f: vec3, u: vec3, r: vec3) {
    this.position = pos;
    this.orientation = ori;
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
    vec3.multiply(dist, this.orientation, vec3.fromValues(s, s, s));
    vec3.add(this.position, this.position, this.orientation);
    // console.log("move forward: " + this.position);
  }

  stepForward() {
    let s: number = this.scale[0];
    // this.scale *= 0.95;
    let dist : vec3 = vec3.create();
    vec3.multiply(dist, this.orientation, vec3.fromValues(s, s, s));
    vec3.add(this.position, this.position, dist);
    // console.log("move forward: " + this.position);
  }

  stepForwardSmall() {
    let s: number = 0.3;
    let dist : vec3 = vec3.create();
    vec3.multiply(dist, this.orientation, vec3.fromValues(s, s, s));
    vec3.add(this.position, this.position, dist);
    // console.log("move forward: " + this.position);
  }

  jumpForward() {
    let s: number = 6.9; // nice
    let dist : vec3 = vec3.create();
    vec3.multiply(dist, this.orientation, vec3.fromValues(s, s, s));
    vec3.add(this.position, this.position, dist);
    // console.log("move forward: " + this.position);
  }
  
  drawLeaf() {
    // leaf
  }

  drawPalmLeaf() {
    // palm leaf
  }

  drawShrubLeaf() {
    // shrub/succulent leaf
  }

  pointUp() {
    // console.log("point up");
    this.orientation[1] = -this.orientation[1];
    quat.rotationTo(this.quaternion, vec3.fromValues(0,1,0), this.orientation);
    quat.normalize(this.quaternion, this.quaternion);
  }

  pointDownwards() {
    this.orientation[1] = this.orientation[1] - 0.2;
    if (this.orientation[1] < -1) {
      this.orientation[1] = -1;
    }
    quat.rotationTo(this.quaternion, vec3.fromValues(0,1,0), this.orientation);
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
    // console.log("forward rot quat: " + this.quaternion);
  }
  // rotateAboutUp(deg: number) {
  //   let q: quat = quat.create();
  //   quat.setAxisAngle(q, this.up, deg * Math.PI / 180.0);

  //   vec3.transformQuat(this.forward, this.forward, q);
  //   vec3.normalize(this.forward, this.forward);
  //   vec3.transformQuat(this.right, this.right, q);
  //   vec3.normalize(this.right, this.right);

  //   quat.rotationTo(this.quaternion, vec3.fromValues(0,1,0), this.forward);
  //   console.log("up rot quat: " + this.quaternion);
  // }
  // rotateAboutRight(deg: number) {
  //   let q: quat = quat.create();
  //   quat.setAxisAngle(q, this.right, deg * Math.PI / 180.0);

  //   vec3.transformQuat(this.up, this.up, q);
  //   vec3.normalize(this.up, this.up);
  //   vec3.transformQuat(this.forward, this.forward, q);
  //   vec3.normalize(this.forward, this.forward);

  //   quat.rotationTo(this.quaternion, vec3.fromValues(0,0,1), this.up);
  //   // console.log("right rot quat: " + this.quaternion);
  // }
  rotate(axis: vec3, deg: number) {
    vec3.normalize(axis, axis);

    let q: quat = quat.create();
    quat.setAxisAngle(q, axis, deg * Math.PI / 180.0);
    quat.normalize(q, q);

    let tempOri: vec4 = vec4.fromValues(this.orientation[0], this.orientation[1], this.orientation[2], 0);
    vec4.transformQuat(tempOri, tempOri, q);
    this.orientation = vec3.fromValues(tempOri[0], tempOri[1], tempOri[2]);

    quat.rotationTo(this.quaternion, vec3.fromValues(0,1,0), this.orientation);
    quat.normalize(this.quaternion, this.quaternion);
  }

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
    let r: number = Math.floor(Math.random() * 41);
    // let r: number = 15;
    this.rotate(vec3.fromValues(0,0,1), r);
  }

  rotateUpNeg() {
    let r: number = Math.floor(Math.random() * 41);
    // let r: number = 15;
    this.rotate(vec3.fromValues(0,0,1), -1.0 * r);
  }
  
  rotateRightPos() {
    let r: number = Math.floor(Math.random() * 41);
    // let r: number = 15;
    this.rotate(vec3.fromValues(1,0,0), r);
  }

  rotateRightNeg() {
    let r: number = Math.floor(Math.random() * 41);
    // let r: number = 15;
    this.rotate(vec3.fromValues(1,0,0), -1.0 * r);
  }

  getTransformation() : mat4 {
    let transformMat: mat4 = mat4.create();
    mat4.fromRotationTranslationScale(transformMat, this.quaternion, this.position, this.scale);
    return transformMat;
  }

  tempRotateQuat(axis: vec3, deg: number) : quat {
    vec3.normalize(axis, axis);
    let q: quat = quat.create();
    quat.setAxisAngle(q, axis, deg * Math.PI / 180.0);
    quat.normalize(q,q);

    let v: vec3 = vec3.fromValues(this.orientation[0],this.orientation[1],this.orientation[2]);
    v = vec3.transformQuat(v, v, q);
    vec3.normalize(v, v);
    quat.rotationTo(q, vec3.fromValues(0,1,0), v);
    return q;
  }
  tempRotateRight(deg: number) {
    let q: quat = quat.create();
    quat.setAxisAngle(q, this.right, deg * Math.PI / 180.0);
    quat.normalize(q,q);

    let tempUp: vec3 = vec3.fromValues(this.up[0],this.up[1],this.up[2]);
    tempUp = vec3.transformQuat(tempUp, tempUp, q);
    vec3.normalize(tempUp, tempUp);

    let tempFor: vec3 = vec3.fromValues(this.up[0],this.up[1],this.up[2]);
    tempFor = vec3.transformQuat(tempFor, tempFor, q);
    vec3.normalize(tempFor, tempFor);

    quat.rotationTo(q, vec3.fromValues(0,0,1), tempUp);
    return q;
  }

  getLeafTransformation(wilt: boolean, palm: boolean, shrub: boolean) : mat4 {
    let rq: quat = quat.create();
    let rangle : number = Math.floor(Math.random() * 361);
    if (palm) {
      rq = this.quaternion;
    }
    else {
      rq = this.tempRotateQuat(vec3.fromValues(0,0,1), rangle);
    }
    if (wilt) {
      let rq2: quat = quat.create();
      let rangle2 : number = Math.floor(Math.random() * 16);

      rq2 = this.tempRotateRight(-1.0 * rangle2);
      quat.multiply(rq, rq, rq2);
    }

    // console.log("sc: " + this.scale[0]);
    let s: vec3 = vec3.create();
    if (shrub && !wilt) {
      let ss: number = 3 * this.scale[0];
      s = vec3.fromValues(ss, ss, ss);
    }
    else if (!wilt) {
      let ss: number = 1 / (4 * this.scale[0]);
      if (ss > 2) {
        ss = 2;
      }
      s = vec3.fromValues(ss, ss, ss);
      // console.log("s: " + ss);
    }
    else {
      // console.log(this.scale[0]);
      let ss: number = 2 * this.scale[0];
      s = vec3.fromValues(ss, ss, ss);
    }

    let transformMat: mat4 = mat4.create();
    mat4.fromRotationTranslationScale(transformMat, rq, this.position, s);
    return transformMat;
  }
}