//Reference to canvas
const canvas = document.getElementById("canvas");
console.log(canvas);
const ctx = canvas.getContext("2d");

//Declaring temporary values for simulations
var g = 9.8;
var length = 20;
var mass = 5;
var a_1 = Math.PI / 2;
var a_2 = Math.PI / 2;


//Either create objects to manage pendulums or manage variables only (object method might be easier to manage)

function RK() {
    //Either implement Runge-Kutta differential equation function or import existing algo
}

function UpdatePhysics() {
    //Update physics ? - might be able to make these changes directly but must be tested
}

function UpdateCanvas() {
    //Handle drawing of objects, images, trails, stats, etc (anything that needs to be drawn on canvas)
}

function UpdateFrame() {
    //UpdatePhysics and then UpdateCanvas
}