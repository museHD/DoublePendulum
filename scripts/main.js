//Reference to canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cw = 720;
const ch = 720;

//Declaring temporary values for simulations
var g = 9.8;
var length = 150;
// var mass = 10;
var a_1 = Math.PI/2;
var a_2 = Math.PI ;
const anchor_x = 360;
const anchor_y = 200;
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
const n_eqns = 4; //4 equations to solve;
var input = new Array(n_eqns);
var output = new Array(n_eqns);
var current = new Array(n_eqns);
var laststate;


class DP {
 
 static g = 9.8;

    constructor(){

       
        this.length = 150;
        // var mass = 10;
        this.a_1 = Math.PI/2;
        this.a_2 = Math.PI ;
        this.anchor_x = 360;
        this.anchor_y = 200;
        this.t = 0;
        this.prev_update = Date.now();
        this.p1 = { r: 10, a: a_1, l: length, x: 0, y: 0, vel: 0, mass:5, acc:0 };
        this.p2 = { r: 10, a: a_2, l: length, x: 0, y: 0, vel: 0, mass:3, acc:0 };
        
    }

    static RK(p1, p2, t, inp, out, h) {

        var yt = [];
        var k1 = [], k2 = [], k3 = [], k4 = [];
        var i;
        var hh = 0.5 * h;
        var xh = t + hh;

        //Values are hard-coded according to the Runge-Kutta integrator.
        //Calls Derivatives 4 times and iterates through calculation for each variable
        
        DP.Derivatives(inp, current, p1, p2);
        for (i = 0; i < n_eqns; i++)
        {
            k1[i] = h*current[i];
            yt[i] = inp[i] + 0.5*k1[i];
        }

        DP.Derivatives(yt, current, p1, p2);
        for (i = 0; i < n_eqns; i++)
        {
            k2[i] = h*current[i];
            yt[i] = inp[i] + 0.5*k2[i];
        } 

        DP.Derivatives(yt, current, p1, p2);
        for (i = 0; i < n_eqns; i++)
        {
            k3[i] = h*current[i];
            yt[i] = inp[i] + k3[i];
        } 

        DP.Derivatives(yt, current, p1, p2);
        for (i = 0; i < n_eqns; i++)
        {
            k4[i] = h*current[i];
            out[i] = inp[i] + k1[1]/6.0 + k2[i]/3.0 + k3[i]/3.0 + k4[i]/6.0;
        } 

        return
    }


    /**
     * Calculates angles according to the physics formulae for the double pendulum
     * @param {array} i input variables
     * @param {array} o output variables
     */

    static Derivatives(i,o, p1, p2) {

        //Uses input and output to assign theta1, theta2, omega1, omega2 (angles and vels.)


        o[0] = i[1];
        var exp1 = -this.g * (2 * p1.mass + p2.mass) * Math.sin(p1.a);
        var exp2 = -p2.mass * this.g * Math.sin(p1.a - 2 * p2.a);
        var exp3 = (-2 * Math.sin(p1.a - p2.a) * p2.mass) * (p2.vel * p2.vel * p2.l + p1.vel * p1.vel * p1.l * Math.cos(p1.a - p2.a));
        var den = p1.l * (2 * p1.mass + p2.mass - p2.mass * Math.cos(2 * p1.a - 2 * p2.a));
        var calc1 = (exp1 + exp2 + exp3) / den;

        o[1] = calc1;
        o[2] = i[3];

        var exp1 = 2 * Math.sin(p1.a - p2.a);
        var exp2 = (p1.vel * p1.vel * p1.l * (p1.mass + p2.mass)) + this.g * (p1.mass + p2.mass) * Math.cos(p1.a);
        var exp3 = p2.vel * p2.vel * p2.l * p2.mass * Math.cos(p1.a - p2.a);
        var den = p2.l * (2 * p1.mass + p2.mass - p2.mass * Math.cos(2 * p1.a - 2 * p2.a));
        var calc2 = (exp1 * (exp2 + exp3)) / den;

        o[3] = calc2;
    }


    /**
     * Function to Update physics for the double pendulum
     */
    UpdatePhysics() {

        console.log(this.p2.x, this.p2.y);
        //Update physics ? - might be able to make these changes directly but must be tested


        t = Date.now() - prev_update;
        prev_update = Date.now();

        input = [this.p1.a, this.p1.vel, this.p2.a, this.p2.vel];

        DP.RK(this.p1, this.p2, t, input, output, 0.2 );
        this.p1.a = output[0];
        this.p1.vel = output[1];
        this.p2.a = output[2];
        this.p2.vel = output[3];

        this.p1.x = this.p1.l * Math.sin(this.p1.a) + anchor_x;
        this.p1.y = this.p1.l * Math.cos(this.p1.a) + anchor_y;

        //Previous location of second circle for path
        old_x = this.p2.x;
        old_y = this.p2.y;
        
        this.p2.x = this.p2.l * Math.sin(this.p2.a) + this.p1.x;
        this.p2.y = this.p2.l * Math.cos(this.p2.a) + this.p1.y;

    }


    /**
     * Draw the double pendulum and connecting lines in order
     */
    DrawObjects() {
        
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

    //Draw trail for p1/p2
    static DrawTrail(obj, thickness){
        
        //rightmost(length) value is latest, leftmost(0) value is oldest
        path.shift();
        var cords = {x:obj.x, y:obj.y, vel:Math.abs(obj.vel)};
        path.push(cords);


        for (var i = path.length - 1; i >= 0; i--) {
            // console.log(path[i]);

            if (typeof path[i]!= "undefined"){
                ctx.beginPath();
                ctx.arc(path[i].x, path[i].y, thickness, 0, 2 * Math.PI);                
                ctx.fill();
                // working code for interpolation
                // ctx.beginPath();
                // ctx.moveTo(path[i-1].x, path[i-1].y);
                // ctx.lineTo(path[i].x, path[i].y);
                // ctx.stroke();
            }

        }

    }


}





/**
 * Function to check UI inputs every update
 */
function UpdateInput(p1, p2){

    
    //Mass and rod length being read and changed    
    p1.l = parseInt(document.getElementById('L1').value);
    p2.l = parseInt(document.getElementById('L2').value);
    console.log(p1.mass);
    p1.mass = parseInt(document.getElementById('M1').value);
    p2.mass = parseInt(document.getElementById('M2').value);

}


var pen = new DP();

/**
 * Update everything inside the canvas 
 */
function UpdateCanvas(p1,p2) {
    //Handle drawing of objects, images, trails, stats, etc (anything that needs to be drawn on canvas)

    /**
     * Clear canvas and reset to location of second object
     */
    function Clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.moveTo(p2.x, p2.y);
    }

    /**
     * Draw the double pendulum and connecting lines in order
     */
    function DrawObjects(p1,p2) {
        
        ctx.beginPath();
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

    DrawObjects(p1,p2);
    firstframe = false;

}

/**
 * Updates all aspects every frame
 */
function UpdateFrame() {
    debugger;
    //Update All components
    UpdateInput(pen.p1,pen.p2);
    pen.UpdatePhysics();
    UpdateCanvas(pen.p1,pen.p2);
    

    if (!paused)
        requestAnimationFrame(UpdateFrame);
}

requestAnimationFrame(UpdateFrame);


// Code for Play and pause button; changes paused flag to control reqanimframe for updateFrame
document.getElementById('play').addEventListener('click', function() {
paused = !paused;
// requestAnimationFrame(UpdateCanvas);
if(!paused) {
    requestAnimationFrame(UpdateFrame);
}
});