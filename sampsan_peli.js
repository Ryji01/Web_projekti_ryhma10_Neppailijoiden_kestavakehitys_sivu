const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// kierrätettävät
const goodIcons = [
    "📰",
    "📦",
    "💿",
];

// Ei roskiin kuuluvat
const badIcons = [
    "💣",
    "🔋",
    "📻",
];

const ICON_FONT_FRAC = 0.8;
const DOWN_ANGLE = Math.PI / 2;
const DOWN_BLOCK_ARC = Math.PI / 8; // block angle
const TRASH_HOVER_SCALE = 1.12;
const TRASH_SCALE_LERP = 0.2;
const trashOpenImg = new Image();
trashOpenImg.src = "sPeli/trashOpen.png";

const trashCanImg = new Image();
trashCanImg.src = "sPeli/trashCan.png";

function emojiFontPx(sq) {
    return Math.floor(Math.min(sq.w, sq.h) * ICON_FONT_FRAC);
}

let gameState = "start";
let spawnInterval = null;

let squares = [];
let nextId = 0;

let score = 0;
let goodScore = 0;
let badScore = 0;

const MAX_GOOD_SPAWNS = 20;

let draggingSquare = null;
let offsetX = 0;
let offsetY = 0;
let trashScaleCurrent = 1;

// Delete zone
const deleteZone = {
    x: canvas.width /2 - 62,
    y: canvas.height - 285,
    w: 155,
    h: 205
};


function drawScore() {
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, canvas.height - 20);
}
// Spawn square
function spawnSquare() {
    // Avoid initial trajectories that are too close to straight down.
    let angle = Math.random() * Math.PI * 2;
    while (Math.abs(Math.atan2(Math.sin(angle - DOWN_ANGLE), Math.cos(angle - DOWN_ANGLE))) < DOWN_BLOCK_ARC) {
        angle = Math.random() * Math.PI * 2;
    }
    const speed = 1 + Math.random() * 1;

    const size = [100, 100];

    const startX = canvas.width / 2 - size[0] / 2;
    const startY = canvas.height / 2 - size[1] / 2;

    const good = Math.random() < 2 / 3;
    const pool = good ? goodIcons : badIcons;
    const icon = pool[Math.floor(Math.random() * pool.length)];

    const emojiPx = Math.floor(Math.min(size[0], size[1]) * ICON_FONT_FRAC);
    const maxShiftX = Math.max(0, (size[0] - emojiPx) / 2 - 1);
    const maxShiftY = Math.max(0, (size[1] - emojiPx) / 2 - 1);
    const iconOffsetX = (Math.random() * 2 - 1) * maxShiftX;
    const iconOffsetY = (Math.random() * 2 - 1) * maxShiftY;

    //pelin status - alusta loppuun
    if (good) {
        console.log("good" + goodScore);
        goodScore ++;
    }
    if (goodScore >= MAX_GOOD_SPAWNS) {
        clearInterval(spawnInterval);
    }

    
    squares.push({
        good,
        icon,
        iconOffsetX,
        iconOffsetY,
        id: nextId++,
        x: startX,
        y: startY,
        prevX: startX,
        prevY: startY,
        dx: Math.cos(angle) * speed / 2,
        dy: Math.sin(angle) * speed,
        w: size[0],
        h: size[1]
    });
}

// Mouse down
canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Pick top-most square
    for (let i = squares.length - 1; i >= 0; i--) {
        const sq = squares[i];
        if (
            mouseX >= sq.x &&
            mouseX <= sq.x + sq.w &&
            mouseY >= sq.y &&
            mouseY <= sq.y + sq.h
        ) {
            draggingSquare = sq;
            offsetX = mouseX - sq.x;
            offsetY = mouseY - sq.y;

            // bring to front
            squares.push(squares.splice(i, 1)[0]);
            break;
        }
    }
});

// Mouse move
canvas.addEventListener("mousemove", (e) => {
    if (!draggingSquare) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    draggingSquare.x = mouseX - offsetX;
    draggingSquare.y = mouseY - offsetY;
});

// Mouse up (drop logic)
canvas.addEventListener("mouseup", () => {
    if (draggingSquare) {
        const sq = draggingSquare;

        const isInside =
            sq.x < deleteZone.x + deleteZone.w &&
            sq.x + sq.w > deleteZone.x &&
            sq.y < deleteZone.y + deleteZone.h &&
            sq.y + sq.h > deleteZone.y;

        if (isInside) {
            sq.good ? score++ : score--;
            squares = squares.filter(s => s.id !== sq.id);
            console.log(score);
        }
    }

    draggingSquare = null;
});

// Safety: release if mouse leaves canvas
canvas.addEventListener("mouseleave", () => {
    draggingSquare = null;
});

function onScreen(sq) {
    return (
        sq.x + sq.w > -50 &&
        sq.x < canvas.width + 50 &&
        sq.y + sq.h > -50 &&
        sq.y < canvas.height + 50
    );
}

// pelin state funktiot
function startGame() {
    gameState = "playing";

    clearInterval(spawnInterval);

    score = 0;
    squares = [];
    goodScore = 0;
    // start spawning
    spawnInterval = setInterval(spawnSquare, 1000);
}
function endGame() {
    gameState = "gameOver"
}
canvas.addEventListener("mousedown", (e) => {
    if (gameState === "gameOver") {
        startGame();
        return
    }
    if (gameState !== "start") return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // box dimensions (same as draw code!)
    const boxX = canvas.width * 1/6;
    const boxY = canvas.height / 3;
    const boxW = canvas.width * 4/6;
    const boxH = canvas.height / 3 - 25;

    const isInside =
        mouseX >= boxX &&
        mouseX <= boxX + boxW &&
        mouseY >= boxY &&
        mouseY <= boxY + boxH;

    if (isInside) {
        startGame();
    }
});

function loop() {
    if (gameState === "start") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        // box shadow
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 5;

        //ohje laatikko
        ctx.fillStyle = "rgba(2, 89, 70)"; 
        ctx.roundRect(canvas.width * 1/6, canvas.height / 3, canvas.width * 4/6, canvas.height / 3 - 25, 20);

        //reunat laatikolle
        ctx.strokeStyle = "White";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fill();

        //teksti
        ctx.fillStyle = "white";
        ctx.textAlign = "center";

        ctx.font = "40px Arial";
        ctx.fillText("Recycling Game", canvas.width / 2, canvas.height / 2 - 40);

        ctx.font = "20px Arial";
        ctx.fillText("Drag recyclable items into the bin", canvas.width / 2, canvas.height / 2);
        ctx.fillText("Click to Start", canvas.width / 2, canvas.height / 2 + 40);
        
        requestAnimationFrame(loop);
        return;        
    }
    if (gameState === "gameOver") { 
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        // box shadow
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 5;

        //ohje laatikko
        ctx.fillStyle = "rgba(2, 89, 70)"; 
        ctx.roundRect(canvas.width * 1/6, canvas.height / 3, canvas.width * 4/6, canvas.height / 3 - 25, 20);

        //reunat laatikolle
        ctx.strokeStyle = "White";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fill();

        //teksti
        ctx.fillStyle = "white";
        ctx.textAlign = "center";

        ctx.font = "40px Arial";
        ctx.fillText("Recycling Game", canvas.width / 2, canvas.height / 2 - 40);

        ctx.font = "20px Arial";
        ctx.fillText("Game over", canvas.width / 2, canvas.height / 2);
        ctx.fillText("click to re-Start", canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 80);

        requestAnimationFrame(loop);
        return;
    }
    if (
        gameState === "playing" &&
        goodScore >= MAX_GOOD_SPAWNS &&
        squares.length === 0
    ) {
        endGame();
    }

    // Clear whole canvas (simpler with UI elements)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawScore();

    squares = squares.filter(onScreen);

    // Highlight delete zone if hovering
    let hovering = false;
    if (draggingSquare) {
        const sq = draggingSquare;
        hovering =
            sq.x < deleteZone.x + deleteZone.w &&
            sq.x + sq.w > deleteZone.x &&
            sq.y < deleteZone.y + deleteZone.h &&
            sq.y + sq.h > deleteZone.y;
    }

    const trashScaleTarget = hovering ? TRASH_HOVER_SCALE : 1;
    trashScaleCurrent += (trashScaleTarget - trashScaleCurrent) * TRASH_SCALE_LERP;
    const trashScale = trashScaleCurrent;
    const trashDrawW = deleteZone.w * trashScale;
    const trashDrawH = deleteZone.h * trashScale;
    const trashDrawX = deleteZone.x - (trashDrawW - deleteZone.w) / 2;
    const trashDrawY = deleteZone.y - (trashDrawH - deleteZone.h) / 2;

    // Draw trash can first so icons stay on top.
    if (trashCanImg.complete && trashCanImg.naturalWidth > 0) {
        ctx.drawImage(trashCanImg, trashDrawX, trashDrawY, trashDrawW, trashDrawH);
    } else {
        // Fallback if image hasn't loaded yet
        ctx.fillStyle = hovering
            ? "rgba(255, 0, 0, 0.35)"
            : "rgba(255, 0, 0, 0.2)";
        ctx.fillRect(trashDrawX, trashDrawY, trashDrawW, trashDrawH);
    }

    // Draw squares
    squares.forEach(sq => {
        if (sq !== draggingSquare) {
            sq.x += sq.dx;
            sq.y += sq.dy;
        }

        ctx.font = `${emojiFontPx(sq)}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "black";
        ctx.shadowColor = "rgba(0, 0, 0, 1)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 2;
        ctx.fillText(
            sq.icon,
            sq.x + sq.w / 2 + sq.iconOffsetX,
            sq.y + sq.h / 2 + sq.iconOffsetY
        );
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    });

    requestAnimationFrame(loop);
    
}

// Start animation
loop();
