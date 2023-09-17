const menu = document.getElementById('menu');
const gameCanvas = document.getElementById('gameCanvas');
const salirButton = document.getElementById('salir');
const inicioButton = document.getElementById('inicio');
const menuAudio = document.getElementById('menuAudio');
const gameAudio = document.getElementById('gameAudio');

function agregarImagenDeFondo() {
    menu.style.backgroundImage = "url('PACMA.jpg')";
    menu.style.backgroundSize = 'cover';
    menu.style.backgroundRepeat = 'no-repeat';
    menu.style.width = '100%';
    menu.style.height = '100vh';
}
agregarImagenDeFondo();
var inGame = false;
function showMenu() {
    inGame = false;
    gameCanvas.style.display = 'none';
}

function startGame() {
    menuAudio.pause();
    menuAudio.currentTime = 0;
    gameAudio.play();
    inGame = true;
    menu.style.display = 'none';
    gameCanvas.style.display = 'block';
    salirButton.style.display = 'block';
    main();
}

document.getElementById('salir').addEventListener('click', function () {
    showMenu();
});

document.getElementById('inicio').addEventListener('click', function () {
    startGame();
});

function Block(X, Y, I) {
    I = I || {};
    I.X = X;
    I.Y = Y;
    I.w = 20;
    I.h = 20;
    I.type = 1;
    I.draw = function () {
        ctx.fillStyle = "blue";
        ctx.fillRect(X, Y, I.h, I.w);
    }
    return I;
}

function Level(level) {
    var I = 0;
    var R = 0;
    level.forEach(function (brick) {
        switch (brick) {
            case 1:
                blocks.push(new Block(I * 20, R * 20));
                break;
            case 2:
                blocks.push(new punto(I * 20, R * 20));
                break;
            case 3:
                players.push(new Player(I * 20, R * 20));
                brick = 0;
                break;
            case 4:
                blocks.push(new pastilla(I * 20, R * 20));
                break;
            case 5:
                ghosts.push(new fantasma(I * 20, R * 20));
                brick = 0;
                break;

        }
        if (I == 39) {
            R++;
            I = 0;
        } else {
            I++;
        }
    });
}

//jugador
function Player(X, Y, I) {
    I = I || {};
    I.startX = X;
    I.startY = Y;
    I.X = X;
    I.Y = Y
    I.h = 20;
    I.w = 20;
    I.direction = "r";
    I.speed = 4;
    I.pos = new Array();
    var keysdisabled = new Array();
    I.draw = function () {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(I.X + I.w / 2, I.Y + I.h / 2, I.w / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    I.update = function () {
        switch (I.direction) {
            case "r":
                if (I.X + I.speed >= c.width - I.w) {
                    I.X = 0;
                } else {
                    I.X = I.X + I.speed;
                }
                break;
            case "l":
                if (I.X + I.speed <= 0) {
                    I.X = c.width - I.w;
                } else {
                    I.X = I.X - I.speed;
                }
                break;
            case "u":
                if (I.Y + I.speed <= 0) {
                    I.direction = "s";
                    I.Y = 0;
                } else {
                    I.Y = I.Y - I.speed;
                }
                break;
            case "d":
                if (I.Y + I.speed >= c.height - I.h) {
                    I.direction = "s";
                    I.Y = c.height - I.h;
                } else {
                    I.Y = I.Y + I.speed;
                }
                break;
        }
        I.pos['me'] = getPosition(I.X, I.Y);
        I.pos['above'] = I.pos['me'] - 40;
        I.pos['below'] = I.pos['me'] + 40;
        I.pos['right'] = I.pos['me'] + 1;
        I.pos['left'] = I.pos['me'] - 1;
        if (I.X % 20 === 0 && I.Y % 20 === 0) {
            if (keydown.Right == true && mapa[0][I.pos['right']] != 1) {
                I.direction = "r";
            }
            if (keydown.Left == true && mapa[0][I.pos['left']] != 1) {
                I.direction = "l";
            }
            if (keydown.Up == true && mapa[0][I.pos['above']] != 1) {
                I.direction = "u";
            }
            if (keydown.Down == true && mapa[0][I.pos['below']] != 1) {
                I.direction = "d";
            }
            if (keydown.Space == true) {
            }
        }

        blocks.forEach(function (block) {
            var collide = collideDetect(I, block);

            if (block.type == 2 || block.type == 4) {
                if (block.active == true) remainingDots++;
            }
            if (collide != false && block.type == 1) {
                I.X = collide['X'];
                I.Y = collide['Y'];
                I.direction = 'c';
            }
            if (collide != false && block.type == 2 && block.active == true) {
                block.collect();
            }
            if (collide != false && block.type == 4 && block.active == true) {
                block.collect();
                power = 1;
            }
        });
        ghosts.forEach(function (ghost) {
            // Detectar colisión con fantasma.
            var collide = collideDetect(I, ghost);
            if (collide != false && power == 0) {
                if (lives == 0) paused = 1;
                lives--;
                I.X = I.startX;
                I.Y = I.startY;
                ghosts.forEach(function (ghost) {
                    ghost.X = ghost.startX;
                    ghost.Y = ghost.startY;
                });
            } else if (collide != false && power == 1) {
                ghost.X = ghost.startX;
                ghost.Y = ghost.startY;
                score += 100;
            }
        });
    }
    return I;
}

var mapa = Array();
mapa[0] = Array(
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 1,
    1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1,
    1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1,
    1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
    1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1,
    1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
    1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1,
    1, 2, 2, 2, 2, 2, 2, 4, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1,
    1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
    1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1,
    1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
    1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1,
    1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1,
    1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1,
    1, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 1,
    1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
    , 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
    , 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
    , 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
);

//punto//
function punto(X, Y, I) {
    I = I || {};
    I.X = X;
    I.Y = Y;
    I.h = 20;
    I.w = 20;
    I.active = true;
    I.type = 2;
    I.draw = function () {
        if (I.active == true) {
            var dotX = (I.X) + (I.w / 2) - 1;
            var dotY = (I.Y) + (I.h / 2) - 1;
            ctx.fillStyle = "pink";
            ctx.fillRect(dotX, dotY, 2, 2);
        }
    }
    I.collect = function () {
        I.active = false;
        score++;
    }
    return I;
}

function pastilla(X, Y, I) {
    I = I || {};
    I.X = X;
    I.Y = Y;
    I.h = 20;
    I.w = 20;
    I.active = true;
    I.type = 4;

    I.draw = function () {
        if (I.active === true) {
            var dotX = I.X + I.w / 2;
            var dotY = I.Y + I.h / 2;
            var radius = 8;

            ctx.fillStyle = "yellow";
            ctx.beginPath();
            ctx.arc(dotX, dotY, radius, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    I.update = function () {
    }
    I.collect = function () {
        I.active = false;
        score += 10;
    }
    return I;
}

function Hud(X, Y, I) {
    I = I || {};
    I.X = 200;
    I.Y = 10;
    I.h = 20;
    I.w = 20;
    I.draw = function () {
        ctx.fillStyle = "red";
        ctx.font = "15px Arial";
        ctx.fillText("Score: " + score, 10, 420);
        ctx.fillText("Lives: " + lives, 10, 440);
        ctx.fillText("Time: " + time + "s", 10, 460);

        if (lives < 0) ctx.fillText("Game Over!", 10, 460);
    }
    return I;
}

var time = 0;
var timerInterval;
function startTimer() {
    timerInterval = setInterval(function () {
        time++;
    }, 1000);

}
startTimer();

function fantasma(X, Y, I) {
    I = I || {};
    I.X = X;
    I.Y = Y;
    I.startX = X;
    I.startY = Y;
    I.h = 20;
    I.w = 20;
    I.direction = "s";
    I.speed = 2;
    I.pos = new Array();

    var keysdisabled = new Array();

    I.draw = function () {
        if (power == 0) {
            ctx.fillStyle = "white";
            ctx.fillRect(I.X, I.Y, I.h, I.w);
        } else if (power == 1) {
            ctx.fillStyle = "blue";
            ctx.fillRect(I.X, I.Y, I.h, I.w);
        }
    }

    I.update = function () {
        switch (I.direction) {
            case "r":
                if (I.X + I.speed >= c.width - I.w) {
                    I.direction = "s";
                    I.X = c.width - I.w;
                } else {
                    I.X = I.X + I.speed;
                }
                break;
            case "l":
                if (I.X + I.speed <= 0) {
                    I.direction = "s";
                    I.X = 0;
                } else {
                    I.X = I.X - I.speed;
                }
                break;
            case "u":
                if (I.Y + I.speed <= 0) {
                    I.direction = "s";
                    I.Y = 0;
                } else {
                    I.Y = I.Y - I.speed;
                }
                break;
            case "d":
                if (I.Y + I.speed >= c.height - I.h) {
                    I.direction = "s";
                    I.Y = c.height - I.h;
                } else {
                    I.Y = I.Y + I.speed;
                }
                break;
        }

        I.pos['me'] = getPosition(I.X, I.Y);
        I.pos['above'] = I.pos['me'] - 40;
        I.pos['below'] = I.pos['me'] + 40;
        I.pos['right'] = I.pos['me'] + 1;
        I.pos['left'] = I.pos['me'] - 1;


        if (I.X % 20 === 0 && I.Y % 20 === 0) {
            var directions = new Array();
            for (var key in I.pos) {
                if (mapa[0][I.pos[key]] != 1 && key != "me") {
                    if (I.direction == 'l' && key != 'right') directions.push(key);
                    if (I.direction == 'r' && key != 'left') directions.push(key);
                    if (I.direction == 'u' && key != 'below') directions.push(key);
                    if (I.direction == 'd' && key != 'above') directions.push(key);
                    if (I.direction == 's') directions.push(key);
                }
            }

            var rnd = Math.floor((Math.random() * directions.length) + 0);
            switch (directions[rnd]) {
                case "right":
                    I.direction = "r";
                    break;
                case "left":
                    I.direction = "l";
                    break;
                case "above":
                    I.direction = "u";
                    break;
                case "below":
                    I.direction = "d";
                    break;
            }
        }

        blocks.forEach(function (block) {
            var collide = collideDetect(I, block);
            if (collide != false && block.type == 1) {
                I.X = collide['X'];
                I.Y = collide['Y'];
                I.direction = 's';
            }
        });

        if (power == 1) {
            var H = new Date();
            if (powerTimer == 0) powerTimer = H.getTime();
            if (H.getTime() > powerTimer + 10000) {
                power = 0;
                powerTimer = 0;
            }
        }
    }
    return I;
}

var c = document.getElementById('gameCanvas');
var ctx = c.getContext("2d");
var FPS = 30;
var players = new Array();
var blocks = new Array();
var ghosts = new Array();
var hud = new Hud();
var level = 0;
var score = 0;
var lives = 5;
var power = 0;
var powerTimer = 0;
var paused = 0;
var remainingDots = 0;
Level(mapa[level]);
function main() {
    if (paused === 1) return;
    update();
    draw();
    requestAnimationFrame(main);
}

function update() {
    if (paused == 1) return;
    players.forEach(function (player) {
        player.update();
    });

    if (remainingDots == 0) {
        paused = 1;
    } else {
        remainingDots = 0;
    }
    ghosts.forEach(function (ghost) {
        ghost.update();
    });
}

function draw() {
    hud.draw();
    if (paused == 1) return;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 800, 600);

    blocks.forEach(function (block) {
        block.draw();
    });
    players.forEach(function (player) {
        player.draw();
    });
    ghosts.forEach(function (ghost) {
        ghost.draw();
    });
    hud.draw();
}

function collideDetect(player, block) {
    var X;
    var Y;
    if (player.Y == block.Y && player.X < block.X + block.w && player.X > block.X) {
        X = block.X + block.w;
        Y = player.Y;
        return { 'X': X, 'Y': Y, 'D': 'l' };
    }
    if (player.Y == block.Y && player.X + player.w > block.X && player.X < block.X + block.w) {
        X = block.X - player.w;
        Y = player.Y;
        return { 'X': X, 'Y': Y, 'D': 'l' };
    }
    if (player.X == block.X && player.Y + player.h > block.Y && player.Y + player.h < block.Y + block.h) {
        X = player.X;
        Y = block.Y - player.h;
        return { 'X': X, 'Y': Y, 'D': 'l' };
    }
    if (player.X == block.X && player.Y < block.Y + block.h && player.Y > block.Y) {
        X = player.X;
        Y = block.Y + block.h;
        return { 'X': X, 'Y': Y, 'D': 'l' };
    }
    return false;
}

function getPosition(X, Y) {
    var blockX = (X / 20);
    var blockY = (Y / 20);
    var blockID = (blockY * 40) + blockX;
    return blockID;

}

var keydown = [];
window.onkeydown = function (e) {
    switch (e.keyCode) {
        case 37:
            keydown.Left = true;
            break;
        case 65:
            keydown.Left = true;
            break;
        case 38:
            keydown.Up = true;
            break;
        case 87:
            keydown.Up = true;
            break;
        case 39:
            keydown.Right = true;
            break;
        case 68:
            keydown.Right = true;
            break;
        case 40:
            keydown.Down = true;
            break;
        case 83:
            keydown.Down = true;
            break;
        case 32:
            keydown.Space = true;
            break;
    }
}

window.onkeyup = function (e) {
    switch (e.keyCode) {
        case 37:
            keydown.Left = false;
            break;
        case 65:
            keydown.Left = false;
            break;
        case 38:
            keydown.Up = false;
            break;
        case 87:
            keydown.Up = false;
            break;
        case 39:
            keydown.Right = false;
            break;
        case 68:
            keydown.Right = false;
            break;
        case 40:
            keydown.Down = false;
            break;
        case 83:
            keydown.Down = false;
            break;
        case 32:
            keydown.Space = false;
            break;
    }
}

if (inGame) {
    main();
} else {
    showMenu();
}

main();