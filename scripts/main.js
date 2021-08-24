//Reference to canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cw = 720;
const ch = 720;

//Declaring temporary values for simulations
var g = 9.8;
var length = 150;
var mass = 40;
var a_1 = Math.PI/2 + 0.001;
var a_2 = Math.PI/2 ;
const anchor_x = 360;
const anchor_y = 200;
var t = 0;
var prev_update = Date.now();

//Declaring initial variables to be used 
var kin_energy, pot_energy;
firstframe = true;
var paused = false;
var img_data = ctx.getImageData(0, 0, cw, ch);;
var old_x;
var old_y;
var tickrate = 60;
const n_eqns = 4; //4 equations to solve;
var input = new Array(n_eqns);
var output = new Array(n_eqns);
var current = new Array(n_eqns);
var laststate;



//Either create objects to manage pendulums or manage variables only (object method might be easier to manage)
p1 = { r: 10, a: a_1, l: length, x: 0, y: 0, vel: 0, mass:10, acc:0 };
p2 = { r: 10, a: a_2, l: length, x: 0, y: 0, vel: 0, mass:10, acc:0 };

function RK(t, inp, out, h) {
    //Either implement Runge-Kutta differential equation function or import existing algo
    //Implement Runge-Kutta integration to provide more accurate angles

    var yt = [];
    var k1 = [], k2 = [], k3 = [], k4 = [];
    var i;
    hh = 0.5 * h;
    xh = t + hh;

    //Values are hard-coded according to the Runge-Kutta integrator.

    Derivatives(inp, current);
    for (i = 0; i < n_eqns; i++)
    {
        k1[i] = h*current[i];
        yt[i] = inp[i] + 0.5*k1[i];
    }

    Derivatives(yt, current);
    for (i = 0; i < n_eqns; i++)
    {
        k2[i] = h*current[i];
        yt[i] = inp[i] + 0.5*k2[i];
    } 

    Derivatives(yt, current);
    for (i = 0; i < n_eqns; i++)
    {
        k3[i] = h*current[i];
        yt[i] = inp[i] + k3[i];
    } 

    Derivatives(yt, current);
    for (i = 0; i < n_eqns; i++)
    {
        k4[i] = h*current[i];
        out[i] = inp[i] + k1[1]/6.0 + k2[i]/3.0 + k3[i]/3.0 + k4[i]/6.0;
    } 

    return
    //loop and input output

}

function Derivatives(i,o) {

    //Uses input and output to assign theta1, theta2, omega1, omega2 (angles and vels.)

    o[0] = i[1];
    var exp1 = -g * (2 * p1.mass + p2.mass) * Math.sin(p1.a);
    var exp2 = -p2.mass * g * Math.sin(p1.a - 2 * p2.a);
    var exp3 = (-2 * Math.sin(p1.a - p2.a) * p2.mass) * (p2.vel * p2.vel * p2.l + p1.vel * p1.vel * p1.l * Math.cos(p1.a - p2.a));
    var den = p1.l * (2 * p1.mass + p2.mass - p2.mass * Math.cos(2 * p1.a - 2 * p2.a));
    var calc1 = (exp1 + exp2 + exp3) / den;

    o[1] = calc1;
    o[2] = i[3];

    var exp1 = 2 * Math.sin(p1.a - p2.a);
    var exp2 = (p1.vel * p1.vel * p1.l * (p1.mass + p2.mass)) + g * (p1.mass + p2.mass) * Math.cos(p1.a);
    var exp3 = p2.vel * p2.vel * p2.l * p2.mass * Math.cos(p1.a - p2.a);
    var den = p2.l * (2 * p1.mass + p2.mass - p2.mass * Math.cos(2 * p1.a - 2 * p2.a));
    var calc2 = (exp1 * (exp2 + exp3)) / den;

    o[3] = calc2;
}


function UpdateInput(){


    // const cb = document.getElementById('trailcheck');
    // if (laststate != cb.checked){
    // console.log(cb.checked); 
    // laststate=cb.checked;

    p1.l = document.getElementById('L1').value;
    p2.l = document.getElementById('L2').value;
    console.log(p1.mass);
    // p1.mass = document.getElementById('M1').value;
    // p2.mass = document.getElementById('M2').value;

    play = document.getElementById('play');
    play.onclick = function(event){}
    
}

function UpdatePhysics() {

    //Update physics ? - might be able to make these changes directly but must be tested


    // NEW POGGERS CODE

    t = Date.now() - prev_update;
    // console.log(t);
    prev_update = Date.now();

    input = [p1.a, p1.vel, p2.a, p2.vel];

    RK(t, input, output, 0.2);
    p1.a = output[0];
    p1.vel = output[1];
    p2.a = output[2];
    p2.vel = output[3];


    // REDUNDANT CODE

    //Physics without integeration

    //angle_a_change = (-g * (p1.mass + p2.mass) * Math.sin(p1.a) - p2.mass * g * Math.sin(p1.a - p2.a) - 2 * Math.sin(p1.a - p2.a) * p2.mass * (p2.vel ** 2 * p2.l + p1.vel ** 2 * p1.l * Math.cos(p1.a - p2.a)))/p1.l*(2*p1.mass + p2.mass - p2.mass*Math.cos(2*p1.a - 2*p2.a))
    // var exp1 = -g * (2 * p1.mass + p2.mass) * Math.sin(p1.a);
    // var exp2 = -p2.mass * g * Math.sin(p1.a - 2 * p2.a);
    // var exp3 = (-2 * Math.sin(p1.a - p2.a) * p2.mass) * (p2.vel * p2.vel * p2.l + p1.vel * p1.vel * p1.l * Math.cos(p1.a - p2.a));
    // var den = p1.l * (2 * p1.mass + p2.mass - p2.mass * Math.cos(2 * p1.a - 2 * p2.a));
    // p1.acc = (exp1 + exp2 + exp3) / den;
    // //console.log(p1.vel);


    // var exp1 = 2 * Math.sin(p1.a - p2.a);
    // var exp2 = (p1.vel * p1.vel * p1.l * (p1.mass + p2.mass)) + g * (p1.mass + p2.mass) * Math.cos(p1.a);
    // var exp3 = p2.vel * p2.vel * p2.l * p2.mass * Math.cos(p1.a - p2.a);
    // var den = p2.l * (2 * p1.mass + p2.mass - p2.mass * Math.cos(2 * p1.a - 2 * p2.a));
    // p2.acc = (exp1 * (exp2 + exp3)) / den;

    //Update x and y values of pendulums to be drawn
    p1.x = p1.l * Math.sin(p1.a) + anchor_x;
    p1.y = p1.l * Math.cos(p1.a) + anchor_y;

    //Previous location of second circle for path
    old_x = p2.x;
    old_y = p2.y;
    
    
    p2.x = p2.l * Math.sin(p2.a) + p1.x;
    p2.y = p2.l * Math.cos(p2.a) + p1.y;


    // p2.vel += p2.acc;
    // p1.vel += p1.acc;
    // p1.a += p1.vel;

    // p2.a += p2.vel;



    // Find formulae for energy and forces in the system
    /*
    kin_energy = 0.5 * p1.mass * p1.l * p1.l * p1.vel * p1.vel + 0.5 * p2.mass * (p1.l * p1.l * p1.vel * p1.vel + p2.l * p2.l * p2.vel * p2.vel + 2 * p1.l * p2.l * p1.vel * p2.vel * Math.cos(p1.a - p2.a));
    pot_energy = -(p1.mass + p2.mass) * 9.8 * p1.l * Math.cos(p1.a) - p2.mass * 9.8 * p2.l * Math.cos(p2.a);
    console.log("total: " + (pot_energy));*/
    
}

function UpdateCanvas() {
    //Handle drawing of objects, images, trails, stats, etc (anything that needs to be drawn on canvas)

    function Clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.moveTo(p2.x, p2.y);

    }

    function DrawObjects() {
        
        ctx.moveTo(anchor_x, anchor_y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(p2.x, p2.y, p2.r, 0, 2 * Math.PI);
        ctx.fill();
    }
    Clear();

    if (firstframe) {
        ctx.putImageData(img_data, 0, 0);
        ctx.moveTo(old_x, old_y);
        ctx.beginPath();
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        //ctx.fillRect(p2.x, p2.y, 5, 5);
        img_data = ctx.getImageData(0, 0, cw, ch);
    }
    else {
        ctx.putImageData(img_data, 0, 0);
        ctx.beginPath();
        ctx.moveTo(old_x, old_y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        //ctx.fillRect(p2.x, p2.y, 5, 5);
        img_data = ctx.getImageData(0, 0, cw, ch);
    }


    DrawObjects();
    firstframe = false;

}


function UpdateFrame() {
    //UpdatePhysics and then UpdateCanvas
    UpdatePhysics();
    UpdateCanvas();
    UpdateInput();

    if (!paused)
        requestAnimationFrame(UpdateFrame);
}

requestAnimationFrame(UpdateFrame);