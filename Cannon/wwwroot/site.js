// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

"use strict"
/**
 * Requests animation frame from browser and is better than used timed loops for animation.
 * 
 * */
window.requestAnimFrame = (function (callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame
        || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

//Global variables
var mousePos = { x: 0, y: 0 };
var themes = ["default", "kirby", "mario","pokemon"];
var offsets = [-152, 210, 175, 185];
var colors = ['#689faf', '#1e3834', '#33c5cb', '#769e8d'];
var audio = [];

window.onload = function () {
    //Initialize canvas
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.imageSmoothingEnabled = false;

    //Listener for mouse movemnt inside canvas
    canvas.addEventListener('mousemove', function (evt) {
        mousePos = { x: evt.offsetX, y: evt.offsetY};
    }, false);

    //load images, which then begins animation
    loadImages(ctx, canvas);
}

/**
 * Loads the images and audio files from files system into the global variables
 * Calls animation function once complete
 *
 * @param {Context} ctx - context of the canvas
 * @param {Canvas} canvas - canvas to draw on
 */
function loadImages(ctx, canvas) {
    //Initialize game data structure, holds important values for animation
    var game = {
        targetX: canvas.width / 2 - 50, targetY: 15, speed: 3,
        fired: false, clear: true, ballX: 0, ballY: 0, ballXSpeed: 0, ballYSpeed: 0, ballRate: 6,
        ballSpin: 0, theme: 0
    };
    
    //Listen for clicks, which cause the cannon to fire
    canvas.addEventListener('click', function (evt) {
        game.fired = true;
    });

    //Array of all images, sorted by theme.
    var images = [];
    for (var i = 0; i < themes.length; i++) {
        //Set the location string
        var name = "images/".concat(themes[i], "/", themes[i]);
        //push another array to images, which will contain a single theme
        images.push([]);

        //Load the cannon
        images[i][0] = new Image();
        images[i][0].offset = offsets[i] * Math.PI / 180
        images[i][0].ballOffset = images[0][0].offset - .5;
        images[i][0].src = name.concat("0.png");

        //Load the target
        images[i][1] = new Image();
        images[i][1].src = name.concat("1.png");

        //Load the cannonball
        images[i][2] = new Image();
        images[i][2].src = name.concat("2.png");

        //Load the background
        images[i][3] = new Image();
        images[i][3].path = name.concat("3.png");

        //Load the audio
        audio.push(new Audio('audio/'.concat(themes[i], '.mp3')));
        
        
    }

    loadOptions(game);
    animated(images, ctx, canvas, game);
}

/**
 * Set options variables and oninput functions.
 * @param {Object} game
 */
function loadOptions(game) {

    var drop = $("#theme");
    for (var i = 0; i < themes.length; i++) {
        drop.append($("<option></option>").attr({ "text": themes[i], "value": i }));
    }

    drop.change(function () {
        game.theme = $(this).find('option:selected').value;
    });
    var ballRateSlider = document.getElementById("bSpeed");
    document.getElementById("bSpeed").value = 6;
    ballRateSlider.oninput = function () {
        var ballSpeedText = document.getElementById("bSpeedText");
        ballSpeedText.innerHTML = this.value;
        game.ballRate = ballSpeedText.innerHTML;
    }

    var speedSlider = document.getElementById("tSpeed");
    speedSlider.oninput = function () {
        var targetSpeedText = document.getElementById("tSpeedText");
        targetSpeedText.innerHTML = 1 * this.value;
        if (game.speed > 0)
            game.speed = 1 * this.value;
        else
            game.speed = -1 * this.value;
    }
}

/**
 * Repeatedly draws the canvas, only waiting on animation frames.
 * 
 * @param {Object[][]} images - holds all images for canvas
 * @param {Context} ctx - context of the canvas
 * @param {Canvas} canvas - canvas to draw on
 * @param {Object[]} game - important game variables packaged together
 */
function animated(images, ctx, canvas, game) {
    var scaleCannon = 100;
    var scaleTarget = 100 * 10/game.scaleTarget;
    var scaleBall = 100 * 10/game.scaleBall;
    var angle = getAngleRad(mousePos.x, mousePos.y, canvas.width / 2, (canvas.height - scaleCannon / 2));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = canvas.clientWidth;
    $('#myCanvas').css('background-image', 'url("../'.concat(images[game.theme][3].path, '")'));
    $('#body').css('background-color', colors[game.theme]);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height - scaleCannon / 2);
    ctx.rotate(images[game.theme][0].offset + angle);
    ctx.drawImage(images[game.theme][0], -(scaleCannon / 2), -(scaleCannon / 2), scaleCannon, scaleCannon);
    ctx.restore();

    ctx.drawImage(images[game.theme][1], game.targetX, game.targetY, scaleTarget, scaleTarget);
    game.targetX += game.speed;
    if (game.targetX + scaleTarget > canvas.width || game.targetX < 0) {
        game.speed = -game.speed;
    }

    var ready = document.getElementById("readyFire");
    if (game.clear == false) {
        ready.innerHTML = "<h3>Reloading...</h3>";
        ready.style.backgroundColor = "red";
    }
    else {
        ready.innerHTML = "<h3>Ready to Fire</h3>";
        ready.style.backgroundColor = "green";
    }

    if (game.fired) {
        // if (ammo > 0)
        if (game.clear) {
            game.clear = false;
            // Bullets--
            game.ballX = (canvas.width / 2 - (scaleBall/ 2)) + 100 * Math.cos(angle + images[0][0].ballOffset);
            game.ballY = (canvas.height - scaleBall) + 100 * Math.sin(angle + images[0][0].ballOffset);
            game.ballXSpeed = game.ballRate * Math.cos(angle + images[game.theme][0].ballOffset);
            game.ballYSpeed = game.ballRate * Math.sin(angle + images[game.theme][0].ballOffset);
        } else {
            game.ballX += game.ballXSpeed;
            game.ballY += game.ballYSpeed;
        }

        ctx.save();
        ctx.translate(game.ballX + scaleBall / 2, game.ballY + scaleBall / 2);
        ctx.rotate(game.ballSpin);
        game.ballSpin += .2;
        ctx.drawImage(images[game.theme][2], -scaleBall/2, -scaleBall/2, scaleBall, scaleBall);
        ctx.restore();
        
        // Calculate collisions
        var target = { radius: game.scaleTarget, x: game.targetX, y: game.targetY };
        var ball = { radius: game.scaleBall, x: game.ballX, y: game.ballY };
        var dx = target.x - ball.x;
        var dy = target.y - ball.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < scaleTarget) {
            game.fired = false; 
            game.clear = true;
            // Hits++
        }
        if (game.ballX < -scaleBall || game.ballX > canvas.width || game.ballY < -scaleBall || game.ballY > canvas.height) {
            game.fired = false;
            game.clear = true;
        }
    }


   

    requestAnimFrame(function () {
        animated(images, ctx, canvas, game);
    });
}

function getAngleRad(ax, ay, bx, by) {
    var angleRad;
    if (ay < by) {
        angleRad = Math.atan((ay - by) / (ax - bx));
        if (angleRad < 0) {
            angleRad = Math.PI + angleRad;
        }
    } else {
        angleRad = -Math.atan((by - ay) / (ax - bx));
        if (angleRad > 0) {
            angleRad -= Math.PI;
        } else if (angleRad == 0 && ax > bx) {
            angleRad = Math.PI;
        }
    }

    var par1 = document.getElementById("one");
    var par2 = document.getElementById("two");

    par1.innerHTML = angleRad;
    par2.innerHTML = angleRad;

    return angleRad;
}

/*
function animate(images, canvas, numImages) {
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 1000 * (canvas.clientWidth / 1000);
    for (var i = 0; i < numImages; i++) {
        var img = images[i];
        images[i].cx = Math.floor(Math.random() * (canvas.width - canvas.imgW));
        images[i].cy = 100;
        console.log(images[i].cy);
        if (images[i].cx > canvas.width - canvas.imgW) {
            images[i].cx = canvas.width - canvas.imgW;
            images[i].xdir = randomDir(0);
        } else if (images[i].cx < 0) {
            images[i].cx = 0;
            images[i].xdir = randomDir();
        }
        if (images[i].cy > canvas.height - canvas.imgH) {
            images[i].cy = canvas.height - canvas.imgH;
            images[i].ydir = randomDir(0);
        } else if (images[i].cy < 0) {
            images[i].cy = 0;
            images[i].ydir = randomDir();
        }
        if (images[i].xdir === 0 || images[i].ydir === 0) {
            images[i].xdir = randomDir(1);
            images[i].ydir = randomDir(1);
        }

        context.drawImage(images[i], images[i].cx, images[i].cy, canvas.imgW, canvas.imgH);
    }

    requestAnimFrame(function () {
        animate(images, canvas, numImages);
    });
}

function getAngleDeg(ax, ay, bx, by) {
    var angleDeg;
    if (ay < by) {
        var angleRad = Math.atan((ay - by) / (ax - bx));
        angleDeg = angleRad * 180 / Math.PI;
        if (angleDeg < 0) {
            angleDeg += 180;
        }
        par1.innerHTML = angleRad;
    } else {
        var angleRad = -Math.atan((by - ay) / (ax - bx));
        angleDeg = angleRad * 180 / Math.PI;
        if (angleDeg > 0) {
            angleDeg -= 180;
        } else if (angleDeg == 0 && ax > bx) {
            angleDeg = 180;
        }
    }

    return (angleDeg);
}



*/