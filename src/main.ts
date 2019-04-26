import {vec3, mat4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import LSystem from './lsystem/LSystem';
import {readTextFile} from './globals';
import Mesh from './geometry/Mesh';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  PlantType: 1,
  'Water Your Plant': waterPlant,
  'Plant Seed': plantSeed,
  'Pause': pause, // for debugging
};

let square: Square;
let screenQuad: ScreenQuad;
let time: number = 0.0;

let axiom: string = "FFX";
let expandedAxiom: string = "";
let iterations: number = 0;
let leaf: Mesh;
let branch: Mesh;
let dirt: Mesh;
let pot: Mesh;

let plantHealth: number = 100;
let scaleTrack: number = 5;
let wilt: boolean = false;

let plantAlive: boolean = false;
let plantType: number = 1;
let plantStatus: number = -1; 

let paused: boolean = false;
let started: boolean = false;

function loadDirt() {
  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  // let dirtobj: string = readTextFile('https://raw.githubusercontent.com/leecr97/Plant-Buddy/master/src/obj/dirt.obj');
  let dirtobj: string = readTextFile('./src/obj/dirt.obj');
  dirt = new Mesh(dirtobj, vec3.fromValues(0,0,0));
  dirt.create();

  let colorsArray : number[] = [];
  let col1Array : number[] = [];
  let col2Array : number[] = [];
  let col3Array : number[] = [];
  let col4Array : number[] = [];

  // draw dirt
  colorsArray = [130.0 / 255.0, 101.0 / 255.0, 84.0 / 255.0, 1.0];
  col1Array = [5, 0, 0, 0];
  col2Array = [0, 5, 0, 0];
  col3Array = [0, 0, 5, 0];
  col4Array = [0, -30, 0, 1];
  let colors : Float32Array = new Float32Array(colorsArray);
  let col1 : Float32Array = new Float32Array(col1Array);
  let col2 : Float32Array = new Float32Array(col2Array);
  let col3 : Float32Array = new Float32Array(col3Array);
  let col4 : Float32Array = new Float32Array(col4Array);
  dirt.setInstanceVBOs(colors, col1, col2, col3, col4);
  dirt.setNumInstances(1);

  let potobj: string = readTextFile('./src/obj/pot.obj');
  pot = new Mesh(potobj, vec3.fromValues(0,0,0));
  pot.create();

  if (plantType == 2) {
    // draw pot
    colorsArray = [178.0 / 255.0, 115.0 / 255.0, 92.0 / 255.0, 1.0];
    col1Array = [3, 0, 0, 0];
    col2Array = [0, 3, 0, 0];
    col3Array = [0, 0, 3, 0];
    col4Array = [0, -10, 0, 1];
    colors = new Float32Array(colorsArray);
    col1 = new Float32Array(col1Array);
    col2 = new Float32Array(col2Array);
    col3 = new Float32Array(col3Array);
    col4 = new Float32Array(col4Array);
  }
  else {
    colorsArray = [178.0 / 255.0, 115.0 / 255.0, 92.0 / 255.0, 1.0];
    col1Array = [0, 0, 0, 0];
    col2Array = [0, 0, 0, 0];
    col3Array = [0, 0, 0, 0];
    col4Array = [0, -15, 0, 1];
    colors = new Float32Array(colorsArray);
    col1 = new Float32Array(col1Array);
    col2 = new Float32Array(col2Array);
    col3 = new Float32Array(col3Array);
    col4 = new Float32Array(col4Array);
  }
  pot.setInstanceVBOs(colors, col1, col2, col3, col4);
  pot.setNumInstances(1);
}

function loadPlant() {
  if (plantType == 0) {
    // let branchobj: string = readTextFile('https://raw.githubusercontent.com/leecr97/Plant-Buddy/master/src/obj/branch.obj');
    let branchobj: string = readTextFile('./src/obj/branch.obj');
    branch = new Mesh(branchobj, vec3.fromValues(0,0,0));
    branch.create();

    // let leafobj: string = readTextFile('https://raw.githubusercontent.com/leecr97/Plant-Buddy/master/src/obj/leaf.obj');
    let leafobj: string = readTextFile('./src/obj/treeleaf.obj');
    leaf = new Mesh(leafobj, vec3.fromValues(0,0,0));
    leaf.create();
  }
  else if (plantType == 1) {
    // let branchobj: string = readTextFile('https://raw.githubusercontent.com/leecr97/Plant-Buddy/master/src/obj/branch.obj');
    let branchobj: string = readTextFile('./src/obj/palmbranch.obj');
    branch = new Mesh(branchobj, vec3.fromValues(0,0,0));
    branch.create();

    // let leafobj: string = readTextFile('https://raw.githubusercontent.com/leecr97/Plant-Buddy/master/src/obj/leaf.obj');
    let leafobj: string = readTextFile('./src/obj/palmleaf.obj');
    leaf = new Mesh(leafobj, vec3.fromValues(0,0,0));
    leaf.create();
  }
  else if (plantType == 2) {
    // let branchobj: string = readTextFile('https://raw.githubusercontent.com/leecr97/Plant-Buddy/master/src/obj/branch.obj');
    let branchobj: string = readTextFile('./src/obj/shrubbranch.obj');
    branch = new Mesh(branchobj, vec3.fromValues(0,0,0));
    branch.create();

    // let leafobj: string = readTextFile('https://raw.githubusercontent.com/leecr97/Plant-Buddy/master/src/obj/leaf.obj');
    let leafobj: string = readTextFile('./src/obj/shrubleaf.obj');
    leaf = new Mesh(leafobj, vec3.fromValues(0,0,0));
    leaf.create();
  }
  
  // lsystem
  let currAxiom: string;
  if (!wilt) {
    currAxiom = axiom;
  }
  else {
    currAxiom = expandedAxiom;
  }
  let ls : LSystem = new LSystem(currAxiom, iterations, scaleTrack, wilt, plantType);
  ls.parseLSystem();
  if (!wilt) {
    expandedAxiom = ls.expandedAxiom;
    // console.log("expanded: " + expandedAxiom);
  }
  let bData: mat4[] = ls.branchData;
  let lData: mat4[] = ls.leafData;

  if (!plantAlive) {
    bData = [];
    lData = [];
  }

  // Set up instanced rendering data arrays here.
  let colorsArray : number[] = [];
  let col1Array : number[] = [];
  let col2Array : number[] = [];
  let col3Array : number[] = [];
  let col4Array : number[] = [];

  // draw branches
  colorsArray = [];
  col1Array = [];
  col2Array = [];
  col3Array = [];
  col4Array = [];

  if (plantType != 2) {
    for (let i: number = 0; i < bData.length; i++) {
      let t: mat4 = bData[i];
      // console.log(t);

      // column data
      col1Array.push(t[0]);
      col1Array.push(t[1]);
      col1Array.push(t[2]);
      col1Array.push(t[3]);

      col2Array.push(t[4]);
      col2Array.push(t[5]);
      col2Array.push(t[6]);
      col2Array.push(t[7]);

      col3Array.push(t[8]);
      col3Array.push(t[9]);
      col3Array.push(t[10]);
      col3Array.push(t[11]);

      col4Array.push(t[12]);
      col4Array.push(t[13]);
      col4Array.push(t[14]);
      col4Array.push(t[15]);

      // color data
      if (!wilt) {
        colorsArray.push(76.0 / 255.0);
        colorsArray.push(56.0 / 255.0);
        colorsArray.push(28.0 / 255.0);
        colorsArray.push(1.0);
      }
      else {
        colorsArray.push(86.0 / 255.0);
        colorsArray.push(81.0 / 255.0);
        colorsArray.push(74.0 / 255.0);
        colorsArray.push(1.0);
      }
      
    }
  }
  let colors : Float32Array = new Float32Array(colorsArray);
  let col1 : Float32Array = new Float32Array(col1Array);
  let col2 : Float32Array = new Float32Array(col2Array);
  let col3 : Float32Array = new Float32Array(col3Array);
  let col4 : Float32Array = new Float32Array(col4Array);
  branch.setInstanceVBOs(colors, col1, col2, col3, col4);
  branch.setNumInstances(bData.length); 
  
  // draw leaves
  colorsArray = [];
  col1Array = [];
  col2Array = [];
  col3Array = [];
  col4Array = [];

  // console.log("leaves: " + lData.length);
  for (let i: number = 0; i < lData.length; i++) {
    let t: mat4 = lData[i];
    // console.log(t);

    // column data
    col1Array.push(t[0]);
    col1Array.push(t[1]);
    col1Array.push(t[2]);
    col1Array.push(t[3]);

    col2Array.push(t[4]);
    col2Array.push(t[5]);
    col2Array.push(t[6]);
    col2Array.push(t[7]);

    col3Array.push(t[8]);
    col3Array.push(t[9]);
    col3Array.push(t[10]);
    col3Array.push(t[11]);

    col4Array.push(t[12]);
    col4Array.push(t[13]);
    col4Array.push(t[14]);
    col4Array.push(t[15]);

    // color data
    if (!wilt) {
      colorsArray.push(66.0 / 255.0);
      colorsArray.push(124.0 / 255.0);
      colorsArray.push(68.0 / 255.0);
      colorsArray.push(1.0);
    }
    else {
      colorsArray.push(99.0 / 255.0);
      colorsArray.push(112.0 / 255.0);
      colorsArray.push(100.0 / 255.0);
      colorsArray.push(1.0);
    }
    
  }
  colors = new Float32Array(colorsArray);
  col1 = new Float32Array(col1Array);
  col2 = new Float32Array(col2Array);
  col3 = new Float32Array(col3Array);
  col4 = new Float32Array(col4Array);
  leaf.setInstanceVBOs(colors, col1, col2, col3, col4);
  leaf.setNumInstances(lData.length); 
}

function makePlantStatusBar() {
  var container = document.createElement( 'div' );
	container.style.cssText = 'position:absolute; top:0; left:0; cursor:pointer; opacity:0.9; z-index:5000;';
  var panel = document.createElement( 'canvas' );
  panel.id = "minicanvas";
  
  var context = panel.getContext( '2d' );
  context.font = "15px Arial";
  context.fillText('Plant Health: ', 50, 40);

  container.appendChild(panel);
  document.body.appendChild(container);
}

function updatePlantStatus(status: number) {
  // health
  var panel = <HTMLCanvasElement> document.getElementById('minicanvas');
  var context = panel.getContext('2d');
  context.clearRect(195,20,150,40);
  context.beginPath();
  context.fillText(plantHealth.toString(), 200, 40);

  // status
  // 1 = alive. 2 = wilting. 0 = dead.
  if (status != plantStatus) {
    plantStatus = status;
    if (plantHealth > 50) {
      context.clearRect(10,50,400,100);
      context.fillText('Your Plant is doing well! ^_^', 50, 90);
    }
    else if (plantHealth > 0) {
      context.clearRect(10,50,400,100);
      context.fillText('Your Plant is wilting! >_<', 50, 90);
      context.fillText('Water it to restore its health!', 50, 140);
    }
    else if (plantHealth <= 0) {
      context.clearRect(10,50,400,100);
      context.fillText('Your Plant has died... x_x', 50, 90);
      context.fillText('Plant a new seed to start over!', 50, 140);
    }
  }
  context.closePath();
}

function waterPlant() {
  console.log('water plant');
  plantHealth = 100;
  updatePlantStatus(1);
  wilt = false;
}

function plantSeed() {
  if (!started) {
    started = true;
    makePlantStatusBar();
    paused = false;
  }
  if (!plantAlive) {
    console.log('plant seed');
    plantAlive = true;
    waterPlant();
    loadPlant();
  }
  else {
    // console.log("");
  }
}

function pause() {
  paused = !paused;
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  // stats.domElement.style.position = 'absolute';
  // stats.domElement.style.left = '0px';
  // stats.domElement.style.top = '0px';
  // document.body.appendChild(stats.domElement);
  // makePlantStatusBar();

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'PlantType', { Tree: 0, 'Palm Tree': 1, Shrub: 2} );
  gui.add(controls, 'Water Your Plant');
  gui.add(controls, 'Plant Seed');
  gui.add(controls, 'Pause');
  gui.closed = true;

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadDirt();
  loadPlant();

  // const camera = new Camera(vec3.fromValues(50, 50, 10), vec3.fromValues(50, 50, 0));
  const camera = new Camera(vec3.fromValues(10, 20, 80), vec3.fromValues(0, 40, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  // gl.enable(gl.BLEND);
  // gl.blendFunc(gl.ONE, gl.ONE); // Additive blending
  gl.enable(gl.DEPTH_TEST);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    if (paused) {
      return;
    }
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    // update iteration every 100 ticks
    if (plantAlive && !paused) {
      if (time % 100 == 0) {
        // the plant grows steadily if it is healthy
        if (plantHealth > 50 && iterations < 5) {
          iterations += 1;
          loadPlant();
        }
        else if (plantHealth < 50 && iterations > 1) {
          wilt = true;
          iterations -= 1;
          loadPlant();
        }
      }
      // // update for scaling every 20 ticks
      // if (time % 20 == 0) {
      //   scaleTrack++;
      //   scaleTrack = scaleTrack % 6;
      //   // console.log(scaleTrack);
      //   loadPlant();
      // }
      // decrement plant health every 20 ticks
      if (time % 20 == 0 && plantHealth > 0) {
        plantHealth -= 1;
        let status: number = 1;
        if (plantHealth > 0 && plantHealth < 50) {
          status = 2;
        }
        else if (plantHealth <= 0) {
          status = 0;
        }
        updatePlantStatus(status);
        if (plantHealth == 0) {
          plantAlive = false;
        }
      }
    }
    
    if (plantType != controls.PlantType) {
      plantType = controls.PlantType;
      loadDirt();
      loadPlant();
    }
    // if (plantStatus)

    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      dirt,
      branch, 
      leaf, 
      pot,
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
