//Reference to canvas and HTML elements
const canvasplaceholder = document.getElementById("canvas-placeholder");
const canvas = document.createElement("canvas");
canvasplaceholder.replaceWith(canvas);
const ctx = canvas.getContext("2d");
const cw = 800;
const ch = 800;
canvas.width = cw;
canvas.height = ch;
canvas.classList.add("column", "canvas-container");
const instancesdisplay = document.getElementById("instances");

//Declaring temporary values for simulations
var g = 9.8;
var length = 150;
// var mass = 10;
// var a_1 = Math.PI/2;
// var a_2 = Math.PI ;
const anchor_x = cw / 2;
const anchor_y = 0.25 * ch;
var t = 0;
var prev_update = Date.now();

//Declaring initial variables to be used
var kin_energy, pot_energy;
firstframe = true;
var paused = false;
var img_data = ctx.getImageData(0, 0, cw, ch);
var old_x;
var old_y;
const trail_length = 100;
var path = new Array(trail_length);
var tickrate = 60;
var t0,
  t1 = 0;
const n_eqns = 4; //4 equations to solve;
var input = new Array(n_eqns);
var output = new Array(n_eqns);
var current = new Array(n_eqns);
var laststate;
var selected_index;

class DP {
  static g = 9.8;

  constructor() {
    this.length = 150;
    // var mass = 10;
    this.a_1 = Math.PI / 2;
    this.a_2 = Math.PI / 2;
    this.anchor_x = 360;
    this.anchor_y = 200;
    this.t = 0;
    this.prev_update = Date.now();
    this.p1 = {
      r: 10,
      a: this.a_1,
      l: this.length,
      x: 0,
      y: 0,
      vel: 0,
      mass: 5,
      acc: 0,
    };
    this.p2 = {
      r: 10,
      a: this.a_2,
      l: this.length,
      x: 0,
      y: 0,
      vel: 0,
      mass: 3,
      acc: 0,
    };
    this.trail_length = 100;
    this.path = new Array(this.trail_length);
    this.trail = true;
    this.color = {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
    };
  }

  ResetPos() {
    this.p1.a = this.a_1;
    this.p1.vel = 0;
    this.p2.a = this.a_2;
    this.p2.vel = 0;
    // this.p1.a = this.a_1;
    // this.p2.a = this.a_2;
    this.p1.x = this.p1.l * Math.sin(this.p1.a) + anchor_x;
    this.p1.y = this.p1.l * Math.cos(this.p1.a) + anchor_y;
    this.p2.x = this.p2.l * Math.sin(this.p2.a) + this.p1.x;
    this.p2.y = this.p2.l * Math.cos(this.p2.a) + this.p1.y;

    this.path = new Array(this.trail_length);
  }

  static RK(p1, p2, t, inp, out, h) {
    var yt = [];
    var k1 = [],
      k2 = [],
      k3 = [],
      k4 = [];
    var i;
    var hh = 0.5 * h;
    var xh = t + hh;

    //Values are hard-coded according to the Runge-Kutta integrator.
    //Calls Derivatives 4 times and iterates through calculation for each variable

    DP.Derivatives(inp, current, p1, p2);
    for (i = 0; i < n_eqns; i++) {
      k1[i] = h * current[i];
      yt[i] = inp[i] + 0.5 * k1[i];
    }

    DP.Derivatives(yt, current, p1, p2);
    for (i = 0; i < n_eqns; i++) {
      k2[i] = h * current[i];
      yt[i] = inp[i] + 0.5 * k2[i];
    }

    DP.Derivatives(yt, current, p1, p2);
    for (i = 0; i < n_eqns; i++) {
      k3[i] = h * current[i];
      yt[i] = inp[i] + k3[i];
    }

    DP.Derivatives(yt, current, p1, p2);
    for (i = 0; i < n_eqns; i++) {
      k4[i] = h * current[i];
      out[i] = inp[i] + k1[1] / 6.0 + k2[i] / 3.0 + k3[i] / 3.0 + k4[i] / 6.0;
    }

    return;
  }

  /**
   * Calculates angles according to the physics formulae for the double pendulum
   * @param {array} i input variables
   * @param {array} o output variables
   */

  static Derivatives(i, o, p1, p2) {
    //Uses input and output to assign theta1, theta2, omega1, omega2 (angles and vels.)

    o[0] = i[1];
    var exp1 = -this.g * (2 * p1.mass + p2.mass) * Math.sin(p1.a);
    var exp2 = -p2.mass * this.g * Math.sin(p1.a - 2 * p2.a);
    var exp3 =
      -2 *
      Math.sin(p1.a - p2.a) *
      p2.mass *
      (p2.vel * p2.vel * p2.l + p1.vel * p1.vel * p1.l * Math.cos(p1.a - p2.a));
    var den =
      p1.l * (2 * p1.mass + p2.mass - p2.mass * Math.cos(2 * p1.a - 2 * p2.a));
    var calc1 = (exp1 + exp2 + exp3) / den;

    o[1] = calc1;
    o[2] = i[3];

    var exp1 = 2 * Math.sin(p1.a - p2.a);
    var exp2 =
      p1.vel * p1.vel * p1.l * (p1.mass + p2.mass) +
      this.g * (p1.mass + p2.mass) * Math.cos(p1.a);
    var exp3 = p2.vel * p2.vel * p2.l * p2.mass * Math.cos(p1.a - p2.a);
    var den =
      p2.l * (2 * p1.mass + p2.mass - p2.mass * Math.cos(2 * p1.a - 2 * p2.a));
    var calc2 = (exp1 * (exp2 + exp3)) / den;

    o[3] = calc2;
  }

  /**
   * Function to Update physics for the double pendulum
   */
  UpdatePhysics() {
    //Update physics ? - might be able to make these changes directly but must be tested

    t = Date.now() - prev_update;
    prev_update = Date.now();

    input = [this.p1.a, this.p1.vel, this.p2.a, this.p2.vel];

    DP.RK(this.p1, this.p2, t, input, output, 0.2);
    this.p1.a = output[0];
    this.p1.vel = output[1];
    this.p2.a = output[2];
    this.p2.vel = output[3];

    //Previous location of second circle for path
    old_x = this.p2.x;
    old_y = this.p2.y;

    // this.p1.a += this.p1.vel;
    // this.p2.a += this.p2.vel;
  }

  /**
   * Draw the double pendulum and connecting lines in order
   */
  DrawObjects() {
    this.p1.x = this.p1.l * Math.sin(this.p1.a) + anchor_x;
    this.p1.y = this.p1.l * Math.cos(this.p1.a) + anchor_y;
    this.p2.x = this.p2.l * Math.sin(this.p2.a) + this.p1.x;
    this.p2.y = this.p2.l * Math.cos(this.p2.a) + this.p1.y;
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.beginPath();
    ctx.moveTo(anchor_x, anchor_y);
    ctx.lineTo(this.p1.x, this.p1.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.p1.x, this.p1.y, this.p1.r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.p2.x, this.p2.y, this.p2.r, 0, 2 * Math.PI);
    ctx.fill();
  }

  //Draw trail for p1/p2
  static DrawTrail(obj, thickness, path, color) {
    //rightmost(length) value is latest, leftmost(0) value is oldest
    path.shift();
    var cords = { x: obj.x, y: obj.y, vel: Math.abs(obj.vel) };
    path.push(cords);

    ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},0.1)`;
    ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},0.6)`;
    // console.log(`rgba(${color.r},${color.g},${color.b},0.5)`);
    for (var i = path.length - 1; i >= 0; i--) {
      // console.log(path[i]);

      if (typeof path[i] != "undefined" && typeof path[i - 1] != "undefined") {
        ctx.beginPath();
        ctx.arc(path[i].x, path[i].y, thickness, 0, 2 * Math.PI);
        ctx.fill();
        // working code for interpolation
        ctx.beginPath();
        ctx.moveTo(path[i - 1].x, path[i - 1].y);
        ctx.lineTo(path[i].x, path[i].y);
        ctx.stroke();
      }
      // ctx.fillStyle = 'black';
    }
  }
}

/**
 * Function to check UI inputs every update
 */
function UpdateInput() {
  for (var i = sliders.length - 1; i >= 0; i--) {
    sliders[i].previousElementSibling.innerHTML = sliders[i].value + "<br>";
  }

  p1 = selected.p1;
  p2 = selected.p2;

  //selccted variable to change which instance is being affected

  //Mass and rod length being read and changed
  p1.l = parseInt(document.getElementById("L1").value);
  p2.l = parseInt(document.getElementById("L2").value);
  p1.mass = parseInt(document.getElementById("M1").value);
  p2.mass = parseInt(document.getElementById("M2").value);
  selected.a_1 =
    (parseInt(document.getElementById("A1").value) * Math.PI) / 180;
  selected.a_2 =
    (parseInt(document.getElementById("A2").value) * Math.PI) / 180;
  selected.trail = document.getElementById("trailcheck").checked;
  if (paused) {
    document.getElementById("A1").oninput = function () {
      p1.a = (parseInt(document.getElementById("A1").value) * Math.PI) / 180;
    };
    document.getElementById("A2").oninput = function () {
      p2.a = (parseInt(document.getElementById("A2").value) * Math.PI) / 180;
    };
  } else {
    document.getElementById("A1").oninput = "";
    document.getElementById("A2").oninput = "";
  }
  UpdateCanvas();
}

/**
 * Takes values of instances and loads them to the HTML sliders
 */
function LoadInput() {
  p1 = selected.p1;
  p2 = selected.p2;

  document.getElementById("L1").value = parseInt(p1.l);
  document.getElementById("L2").value = parseInt(p2.l);
  document.getElementById("M1").value = parseInt(p1.mass);
  document.getElementById("M2").value = parseInt(p2.mass);
  document.getElementById("A1").value = (selected.a_1 * 180) / Math.PI;
  document.getElementById("A2").value = (selected.a_2 * 180) / Math.PI;
  document.getElementById("trailcheck").checked = selected.trail;
}

/**
 * Change the selected element and instance
 * @param {int} i index of instance
 */
function ChangeSelected(i) {
  selected_index = i;
  const g = document.getElementById("instances");
  selected = pendulums[i];
  g.children[i].classList.add("selected");
  g.children[
    i
  ].style.backgroundColor = `rgba(${pendulums[i].color.r},${pendulums[i].color.g},${pendulums[i].color.b},0.6)`;
  LoadInput();
}

/**
 * Go through html list and update colour of all elements
 */
function UpdateInstanceList() {
  const g = document.getElementById("instances");
  for (let i = 0, len = g.children.length; i < len; i++) {
    g.children[
      i
    ].style.backgroundColor = `rgba(${pendulums[i].color.r},${pendulums[i].color.g},${pendulums[i].color.b},0.2)`;
    g.children[i].onclick = function () {
      var index = i;

      for (let i = 0, len = g.children.length; i < len; i++) {
        g.children[i].classList.remove("selected");
        g.children[
          i
        ].style.backgroundColor = `rgba(${pendulums[i].color.r},${pendulums[i].color.g},${pendulums[i].color.b},0.2)`;
      }
      // console.log(index);
      ChangeSelected(index);
    };
  }
}

/**
 * Create new DP Instance and add to array
 */
function NewInstance() {
  UpdateInstanceList();
  const g = document.getElementById("instances");
  pendulums.push(new DP());
  instance = document.createElement("div");
  instance.classList.add("dp-instance");
  instance.innerHTML = "instance" + pendulums.length;
  instancesdisplay.appendChild(instance);
  UpdateInstanceList();
  selected_index = pendulums.length - 1;
  ChangeSelected(selected_index);
}

/**
 * Delete selected instance and element
 */
function DeleteInstance() {
  // UpdateInstanceList();
  ChangeSelected(selected_index);
  const g = document.getElementById("instances");
  if (g.children.length > 1) {
    g.removeChild(g.children[selected_index]);
    pendulums.splice(selected_index, 1);
    // selected_index -= 1;
    // selected = pendulums[selected_index];
    // if (selected_index > 0){
    // selected_index -= 1;}
  }
  ChangeSelected(pendulums.length - 1);
  UpdateInstanceList();
}

/**
 * Update canvas
 */
function UpdateCanvas() {
  /**
   * Clear canvas
   */
  function Clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  //Draw double pendulums for each instance
  function DrawAllObjects() {
    for (var i = pendulums.length - 1; i >= 0; i--) {
      pendulums[i].DrawObjects();
    }
  }

  //If instance has enabled trails, draw them
  function DrawReqTrails() {
    for (var i = pendulums.length - 1; i >= 0; i--) {
      if (pendulums[i].trail) {
        DP.DrawTrail(pendulums[i].p2, 2, pendulums[i].path, pendulums[i].color);
      }
    }
  }

  Clear();
  DrawAllObjects();
  DrawReqTrails();
}

/**
 * Go through all DPs and update physics
 */
function UpdateAllPhyscics() {
  for (var i = pendulums.length - 1; i >= 0; i--) {
    pendulums[i].UpdatePhysics();
  }
}

UpdateInstanceList();
const perf = document.getElementById("performance");

/**
 * Updates all components every frame; Only updates physics if unpaused
 */
function UpdateFrame() {
  t0 = performance.now();

  UpdateInput();
  UpdateCanvas();

  if (!paused) {
    UpdateAllPhyscics();
  }

  //Frame Time Info
  t1 = performance.now();
  perf.innerHTML = `${(t1 - t0).toFixed(3)}`;

  requestAnimationFrame(UpdateFrame);
}

//Call first frame
requestAnimationFrame(UpdateFrame);

// Code for Play and pause button; changes paused flag to control reqanimframe for updateFrame

function Play() {
  btn = document.getElementById("play");
  if (!paused) {
    btn.classList.remove("paused");
  } else {
    btn.classList.add("paused");
  }
  paused = !paused;
}

document.getElementById("reset").addEventListener("click", function () {
  for (var i = pendulums.length - 1; i >= 0; i--) {
    pendulums[i].ResetPos();
  }
});

// Used in UpdateInput
var sliders = document.getElementsByClassName("slider");

//Initiating instances
var pendulums = [];
NewInstance();
var selected = pendulums[0];

LoadInput();
