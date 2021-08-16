//Reference to canvas
const canvas = document.getElementById("canvas");
console.log(canvas);
const ctx = canvas.getContext("2d");

//Declaring temporary values for simulations
var g = 9.8;
var length = 100;
var mass = 5;
var a_1 = Math.PI / 2;
var a_2 = 5*Math.PI / 6;
const anchor_x = 360;
const anchor_y = 200;


//Either create objects to manage pendulums or manage variables only (object method might be easier to manage)
ball_a = { r: 10, a: a_1, l: length, x: 0, y: 0, vel: 0 };
ball_b = { r: 10, a: a_2, l: length, x: 0, y: 0, vel: 0 };

function RK() {
    //Either implement Runge-Kutta differential equation function or import existing algo
}

function UpdatePhysics() {
    //Update physics ? - might be able to make these changes directly but must be tested

    ball_a.a += 0.05;
    //ball_b.a += 0.05;

    //Update x and y values of pendulums to be drawn
    ball_a.x = ball_a.l * Math.sin(ball_a.a) + anchor_x;
    ball_a.y = ball_a.l * Math.cos(ball_a.a) + anchor_y;

    ball_b.x = ball_b.l * Math.sin(ball_b.a) + ball_a.x;
    ball_b.y = ball_b.l * Math.cos(ball_b.a) + ball_a.y;
}

function UpdateCanvas() {
    //Handle drawing of objects, images, trails, stats, etc (anything that needs to be drawn on canvas)

    function Clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

    }

    function DrawObjects() {
        
        ctx.moveTo(anchor_x, anchor_y);
        ctx.lineTo(ball_a.x, ball_a.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ball_a.x, ball_a.y, ball_a.r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.moveTo(ball_a.x, ball_a.y);
        ctx.lineTo(ball_b.x, ball_b.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ball_b.x, ball_b.y, ball_b.r, 0, 2 * Math.PI);
        ctx.fill();
    }
    Clear();
    DrawObjects();
}


function UpdateFrame() {
    //UpdatePhysics and then UpdateCanvas
    UpdatePhysics();
    UpdateCanvas();

    requestAnimationFrame(UpdateFrame);
}

requestAnimationFrame(UpdateFrame);