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
var themes = ["Default", "Kirby", "Mario","Pokemon","Duck Hunt", "Stormtrooper", "Metroid"];
var offsets = [-152, 210, 175, 185, -135, 180, -180];
var colors = ['#689faf', '#1e3834', '#33c5cb', '#769e8d', '#62aeb1', '#403d3a','#242a2f'];
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
        targetX: canvas.width / 2 - 50, targetY: 15, targetSize: 10, speed: 3,
        fired: false, clear: true, ballX: 0, ballY: 0, ballXSpeed: 0, ballYSpeed: 0, ballRate: 6,
        ballSpin: 0, theme: 0, ballSize: 5, ammo: 10, score: 0, dashLength: 7, dashSpace: 10,
        drawDashes: true
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

    loadOptions(game,images);
    animated(images, ctx, canvas, game);
}

/**
 * Set options variables and oninput functions.
 * @param {Object} game
 */
function loadOptions(game, images) {

    var path = window.location.pathname;

    //Initialize theme
    $('#body').css('background-color', colors[game.theme]);
    $('#myCanvas').css('background-image', 'url("../'.concat(path, images[game.theme][3].path, '")'));
    $('.info-part').css('background-color', shadeColor2(colors[game.theme], -.5));
   
    //Dropdown to select theme
    var drop = $("#theme");
    for (var i = 0; i < themes.length; i++) {
        var op = $("<option></option>").text(themes[i]);
        op.attr("data-val", i);
        drop.append(op);
    }
    drop.change(function () {
        game.theme = parseInt($(this).find('option:selected').attr("data-val"));
        $('#body').css('background-color', colors[game.theme]);
        $('#myCanvas').css('background-image', 'url("../'.concat(path, images[game.theme][3].path, '")'));
        $('.info-part').css('background-color', shadeColor2(colors[game.theme], -.5));
    });

    //Ball Speed
    var bSpeedT = document.getElementById("bSpeedText");
    var bRate = document.getElementById("bSpeed");
    bSpeedT.innerHTML = game.ballRate;
    bRate.value = game.ballRate;
    bRate.oninput = function () {
        bSpeedT.innerHTML = this.value;
        game.ballRate = this.value;
    }

    //Ball Size
    var bSizeT = document.getElementById("bSizeText");
    var bSize = document.getElementById("bSize");
    bSizeT.innerHTML = game.ballSize;
    bSize.value = game.ballSize;
    bSize.oninput = function () {
        bSizeT.innerHTML = this.value;
        game.ballSize = this.value;
    }

    //Target Speed
    var tSpeedT = document.getElementById("tSpeedText");
    var tSpeed = document.getElementById("tSpeed");
    tSpeedT.innerHTML = game.speed;
    tSpeed.value = game.speed;
    tSpeed.oninput = function () {
        tSpeedT.innerHTML = this.value;
        if (game.speed > 0)
            game.speed = 1* this.value;
        else
            game.speed = -1 * this.value;
    }
    
    //Target Size
    var tSizeT = document.getElementById("tSizeText");
    var tSize = document.getElementById("tSize");
    tSizeT.innerHTML = game.targetSize;
    tSize.value = game.targetSize;
    tSize.oninput = function () {
        tSizeT.innerHTML = this.value;
        game.targetSize = this.value;
    }

    //Draw Dashes
    var drawDashes = document.getElementById("drawDashes");
    drawDashes.checked = game.drawDashes;
    drawDashes.oninput = function () {
        game.drawDashes = this.checked;
    }

    //Dash Length
    var dashLengthT = document.getElementById("dashLengthText");
    var dashLength = document.getElementById("dashLength");
    dashLengthT.innerHTML = game.dashLength;
    dashLength.value = game.dashLength;
    dashLength.oninput = function () {
        dashLengthT.innerHTML = this.value;
        game.dashLength = this.value;
    }

    //Dash Space
    var dashSpaceT = document.getElementById("dashSpaceText");
    var dashSpace = document.getElementById("dashSpace");
    dashSpaceT.innerHTML = game.dashSpace;
    dashSpace.value = game.dashSpace;
    dashSpace.oninput = function () {
        dashSpaceT.innerHTML = this.value;
        game.dashSpace = this.value;
    }

    //Initialize Ready to fire button
    var ready = document.getElementById("readyFire");
    ready.innerHTML = "Click to Start";
    ready.style.backgroundColor = "green";

    //Initialize close button on alert
    var span = document.getElementsByClassName("close")[0];
    span.onclick = function () {
        $('#alert').css('display', "none");
    }

    //Initialize ammo and score
    var ammo = document.getElementById("ammo");
    var score = document.getElementById("score");
    $("#reset-button").click(function () {
        reset(game)
    });
    ammo.innerHTML = game.ammo;
    score.innerHTML = game.score;
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
    var scaleTarget = 100 * game.targetSize/10;
    var scaleBall = 100 * game.ballSize/10;
    var angle = getAngleRad(mousePos.x, mousePos.y, canvas.width / 2, (canvas.height - scaleCannon / 2));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = canvas.clientWidth;

    //Draw Cannon and rotate accordingly
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height - scaleCannon / 2);
    ctx.rotate(images[game.theme][0].offset + angle);
    ctx.drawImage(images[game.theme][0], -(scaleCannon / 2), -(scaleCannon / 2), scaleCannon, scaleCannon);
    ctx.restore();

    //Draw Target and handle switching directions
    ctx.drawImage(images[game.theme][1], game.targetX, game.targetY, scaleTarget, scaleTarget);
    game.targetX += game.speed;
    if (game.targetX + scaleTarget > canvas.width) {
        if (game.speed > 0) {
            game.speed = -game.speed;
        } else {
            game.targetX = canvas.width - scaleTarget;
        }
    } else if (game.targetX < 0){
        if (game.speed < 0) {
            game.speed = -game.speed;
        } else {
            game.targetX = 0 + scaleTarget;
        }
    }

    //Draw Dashed Line to Mouse
    if (game.drawDashes) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + 50 * Math.cos(angle + images[0][0].ballOffset), (canvas.height - scaleCannon / 2) + 50 * Math.sin(angle + images[0][0].ballOffset));
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.setLineDash([game.dashLength, game.dashSpace]);
        ctx.strokeStyle = "#FF0000";
        ctx.stroke();
        ctx.restore();
    }

    //Draw cannonball when fired
    if (game.fired) {
        var done = false;

        if (game.clear) {
            //Update information boxes and game variables
            audio[game.theme].play();
            $("#optionsRow .tgl").prop('disabled', true);
            var ready = document.getElementById("readyFire");
            ready.innerHTML = "Reloading...";
            ready.style.backgroundColor = "red";

            game.clear = false;
            game.ammo--;
            document.getElementById("ammo").innerHTML = game.ammo;
            var rand = 0;
            if (game.theme == 5) {
                rand = Math.random() * 180;
            }
            //Calculate ball spawn position and speed
            var specialOffset = 100 + (game.ballSize - 10) * 5;
            game.ballX = (canvas.width / 2 - (scaleBall / 2)) + specialOffset * Math.cos(angle + images[0][0].ballOffset + rand);
            game.ballY = (canvas.height - specialOffset) + specialOffset * Math.sin(angle + images[0][0].ballOffset + rand);
            game.ballXSpeed = game.ballRate * Math.cos(angle + images[game.theme][0].ballOffset + rand);
            game.ballYSpeed = game.ballRate * Math.sin(angle + images[game.theme][0].ballOffset + rand);
        } else {
            game.ballX += game.ballXSpeed;
            game.ballY += game.ballYSpeed;
        }

        //Rotate Ball
        ctx.save();
        ctx.translate(game.ballX + scaleBall / 2, game.ballY + scaleBall / 2);
        ctx.rotate(game.ballSpin);
        game.ballSpin += .2;
        ctx.drawImage(images[game.theme][2], -scaleBall / 2, -scaleBall / 2, scaleBall, scaleBall);
        ctx.restore();

        // Calculate collisions
        var ballOffsetX = (game.ballX + scaleBall / 2);
        var ballOffsetY = (game.ballY + scaleBall / 2);
        var tarOffsetX = (game.targetX + scaleTarget / 2);
        var tarOffsetY = (game.targetY + scaleTarget / 2);
        var dx = tarOffsetX - ballOffsetX;
        var dy = tarOffsetY - ballOffsetY;
        var distance = Math.sqrt(dx * dx + dy * dy) + (1.4 * game.ballSize/9);
        if (distance < (scaleBall + scaleTarget) / 2) {
            done = true;
            game.score++;
            document.getElementById("score").innerHTML = game.score;
        }

        if (game.ballX < -scaleBall || game.ballX > canvas.width || game.ballY < -scaleBall || game.ballY > canvas.height) {
            game.fired = false;
            game.clear = true;
        }



        if (game.ballX < -scaleBall || game.ballX > canvas.width || game.ballY < -scaleBall || game.ballY > canvas.height) {
            done = true;
        }

        if (done) {
            if (game.ammo == 0) {
                reset(game, true);
            } else {
                game.fired = false;
                game.clear = true;
                var ready = document.getElementById("readyFire");
                ready.innerHTML = "Ready to Fire";
                ready.style.backgroundColor = "green";
            }
            
        }
    }

    requestAnimFrame(function () {
        animated(images, ctx, canvas, game);
    });
}

/**
 * Resets the game and allows editing of options again.
 * @param {Object} game - Game data structure
 * @param {boolean} alert - Whether or not to display an alert
 */
function reset(game, alert) {
    if (alert) {
        var modal = $('#alert');
        var modalH = $('.modal-header');
        var modalB = $('.modal-body');
        var modalF = $('.modal-footer');
        var darker = shadeColor2(colors[game.theme], -.2);

        modal.css('display', "block");
        modalH.css('background-color', darker);
        modalB.css('background-color', colors[game.theme]);
        modalB.children().html("Final Score: ".concat(game.score));
        modalF.css('background-color', darker);
    }
    game.fired = false;
    game.clear = true;
    game.ammo = 10;
    game.score = 0;

    document.getElementById("score").innerHTML = game.score;
    document.getElementById("ammo").innerHTML = game.ammo;
    $("#optionsRow .tgl").prop('disabled', false);
    
    var ready = document.getElementById("readyFire");
    ready.innerHTML = "Click to Start";
    ready.style.backgroundColor = "green";
}

/**
 * Takes two points (a line) and finds the angle created
 * between that line and the x-axis.
 * 
 * @param {float} ax - Point 1 x
 * @param {float} ay - Point 1 y
 * @param {float} bx - Point 2 x
 * @param {float} by - Point 2 y
 */
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

    return angleRad;
}


/**
 * Takes either a percentage and a color to chade or a
 * percentage and two colors to blend.
 * 
 * NOT MY CODE.
 * Source: https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
 *
 * @param {float} color - percentage to darken
 * @param {any} percent - Color to blend to
 */
function shadeColor2(color, percent) {
    var f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
    return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
}
/*
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