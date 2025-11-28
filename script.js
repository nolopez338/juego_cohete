// ====================================================
// ZOOM + PAN SYSTEM  (MAP ONLY)
// ====================================================
const zoomContainer = document.getElementById("zoomContainer");
let zoom = 1;
let translateX = 0;
let translateY = 0;
let sliderActive = false;

function applyTransform() {
    zoomContainer.style.transform =
        `scale(${zoom}) translate(${translateX}px, ${translateY}px)`;
}

function centerGraphOnRocket() {
    const rocketCenterX = rocketX + rocket.clientWidth / 2;
    const rocketCenterY = rocketY + rocket.clientHeight / 2;

    translateX = window.innerWidth / 2 - rocketCenterX * zoom;
    translateY = window.innerHeight / 2 - rocketCenterY * zoom;

    applyTransform();
}

// --- MOUSE ZOOM ---
document.addEventListener("wheel", (e) => {
    e.preventDefault();

    const zoomStep = 1.1;
    const rect = zoomContainer.getBoundingClientRect();

    const pointerX = e.clientX - rect.left;
    const pointerY = e.clientY - rect.top;

    const worldX = (pointerX - translateX) / zoom;
    const worldY = (pointerY - translateY) / zoom;

    zoom = e.deltaY < 0 ? zoom * zoomStep : zoom / zoomStep;
    zoom = Math.min(Math.max(zoom, 0.2), 3);

    translateX = pointerX - worldX * zoom;
    translateY = pointerY - worldY * zoom;

    applyTransform();

}, { passive: false });

// --- MOUSE DRAG PAN ---
let isPanning = false;
let startX = 0, startY = 0;

document.addEventListener("mousedown", (e) => {
    if (sliderActive) return;

    isPanning = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
});

document.addEventListener("mouseup", () => {
    isPanning = false;
    sliderActive = false;
});

document.addEventListener("mousemove", (e) => {
    if (!isPanning) return;

    translateX = e.clientX - startX;
    translateY = e.clientY - startY;

    applyTransform();
});

// ====================================================
// GAME LOGIC  (unchanged from previous version)
// ====================================================

const rocket = document.getElementById("rocket");
const gameArea = document.getElementById("gameArea");
const gate = document.getElementById("gate");

const gateXLabel = document.getElementById("gateXLabel");
const gateTopLabel = document.getElementById("gateTopLabel");
const gateBottomLabel = document.getElementById("gateBottomLabel");

const ySlider = document.getElementById("ySlider");
const yInput = document.getElementById("yInput");

const slopeSlider = document.getElementById("slopeSlider");
const slopeInput = document.getElementById("slopeInput");

const quadSlider = document.getElementById("quadSlider");
const quadInput = document.getElementById("quadInput");

const cubicSlider = document.getElementById("cubicSlider");
const cubicInput = document.getElementById("cubicInput");

const canvas = document.getElementById("trailCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 3000;
canvas.height = 3000;

let rocketX, rocketY;
let slope = 0;
let quad = 0;
let cubic = 0;
let speed = 6;
let facing = "right";

let anim = null;
let lastTrailX = null;
let lastTrailY = null;
let frameCount = 0;

let inFlight = false;
let popupActive = false;
let roundFinished = false;

let hits = 0;
let misses = 0;
const gateWidth = 150;

// UTILS
function convertCenterToScreen(value) {
    return 1500 - value - rocket.clientHeight / 2;
}

function convertScreenToCenter(y) {
    return -(y + rocket.clientHeight / 2 - 1500);
}

// GATE
function spawnGate() {
    const gapY = Math.random() * (3000 - gateWidth);

    gate.style.height = gateWidth + "px";
    gate.style.top = gapY + "px";

    const left = facing === "right"
        ? (3000 - gate.clientWidth)
        : 0;

    gate.style.left = left + "px";

    gateXLabel.textContent = Math.round(left);
    gateTopLabel.textContent = Math.round(gapY);
    gateBottomLabel.textContent = Math.round(gapY + gateWidth);
}

// RESET
function resetRocket() {
    cancelAnimationFrame(anim);
    anim = null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lastTrailX = null;
    lastTrailY = null;

    rocketX = 1500 - rocket.clientWidth / 2;
    rocketY = 1500 - rocket.clientHeight / 2;

    rocket.style.left = rocketX + "px";
    rocket.style.top  = rocketY + "px";

    slope = quad = cubic = 0;
    slopeSlider.value = slopeInput.value = 0;
    quadSlider.value  = quadInput.value  = 0;
    cubicSlider.value = cubicInput.value = 0;

    frameCount = 0;

    const c = convertScreenToCenter(rocketY);
    ySlider.value = yInput.value = c;

    inFlight = false;
    roundFinished = false;

    centerGraphOnRocket();
    spawnGate();
}

// BEFORE LAUNCH
function setRocketFromCenter(v) {
    if (inFlight || popupActive) return;
    rocketY = convertCenterToScreen(v);
    rocket.style.top = rocketY + "px";
}

// SLIDERS
ySlider.oninput = () => {
    yInput.value = ySlider.value;
    setRocketFromCenter(parseInt(ySlider.value));
};
yInput.oninput = () => {
    let v = parseInt(yInput.value);
    if (isNaN(v)) v = 0;
    v = Math.max(-100, Math.min(100, v));
    yInput.value = v;
    ySlider.value = v;
    setRocketFromCenter(v);
};

slopeSlider.oninput = () => {
    slope = parseFloat(slopeSlider.value);
    slopeInput.value = slope;
};
slopeInput.oninput = () => {
    let v = parseFloat(slopeInput.value);
    v = Math.max(-10, Math.min(10, v));
    slopeInput.value = slopeSlider.value = v;
    slope = v;
};

quadSlider.oninput = () => {
    quad = parseFloat(quadSlider.value);
    quadInput.value = quad;
};
quadInput.oninput = () => {
    let v = parseFloat(quadInput.value);
    v = Math.max(-1, Math.min(1, v));
    quadInput.value = quadSlider.value = v;
    quad = v;
};

cubicSlider.oninput = () => {
    cubic = parseFloat(cubicSlider.value);
    cubicInput.value = cubic;
};
cubicInput.oninput = () => {
    let v = parseFloat(cubicInput.value);
    v = Math.max(-0.01, Math.min(0.01, v));
    cubicInput.value = cubicSlider.value = v;
    cubic = v;
};

function registerSlider(slider) {
    ["mousedown", "touchstart"].forEach(evt => {
        slider.addEventListener(evt, () => sliderActive = true);
    });

    ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach(evt => {
        slider.addEventListener(evt, () => sliderActive = false);
    });
}

registerSlider(ySlider);
registerSlider(slopeSlider);
registerSlider(quadSlider);
registerSlider(cubicSlider);

// TRAIL
function drawTrail(x1, y1, x2, y2) {
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

// ROTATION
function rotateRocket(dir) {
    if (inFlight || popupActive) return;
    facing = dir;
    rocket.style.transform =
        dir === "right" ? "rotate(90deg)" : "rotate(-90deg)";
}

// LAUNCH
function launchRocket() {
    if (inFlight || popupActive) return;

    inFlight = true;
    frameCount = 0;

    function update() {

        const prevX = rocketX + rocket.clientWidth / 2;
        const prevY = rocketY + rocket.clientHeight / 2;

        rocketX += (facing === "right" ? speed : -speed);

        rocketY -= slope;
        rocketY -= quad  * frameCount * frameCount;
        rocketY -= cubic * frameCount * frameCount * frameCount;

        frameCount++;

        rocket.style.left = rocketX + "px";
        rocket.style.top  = rocketY + "px";

        const newX = rocketX + rocket.clientWidth / 2;
        const newY = rocketY + rocket.clientHeight / 2;

        if (lastTrailX !== null)
            drawTrail(prevX, prevY, newX, newY);

        lastTrailX = newX;
        lastTrailY = newY;

        checkCollision();
        anim = requestAnimationFrame(update);
    }

    anim = requestAnimationFrame(update);
}

// COLLISION
function checkCollision() {
    if (roundFinished) return;

    const gateRect = gate.getBoundingClientRect();
    const rocketRect = rocket.getBoundingClientRect();
    const centerY = rocketRect.top + rocketRect.height / 2;

    const hit = centerY >= gateRect.top && centerY <= gateRect.bottom;

    if (facing === "right" && rocketRect.right >= gateRect.left)
        endLaunch(hit);

    if (facing === "left" && rocketRect.left <= gateRect.right)
        endLaunch(hit);
}

// END
function endLaunch(success) {
    cancelAnimationFrame(anim);
    anim = null;
    inFlight = false;
    roundFinished = true;

    if (success) {
        hits++;
        document.getElementById("hitsCount").textContent = hits;
        document.getElementById("hitsDots").innerHTML += "<span style='color:lime;'>●</span>";
    } else {
        misses++;
        document.getElementById("missCount").textContent = misses;
        document.getElementById("missDots").innerHTML += "<span style='color:red;'>●</span>";
    }

    showPopup(success ? "Success!" : "Miss!");
}

function showPopup(text) {
    document.getElementById("popupMessage").textContent = text;
    document.getElementById("popupOverlay").style.display = "flex";
    popupActive = true;
}

document.getElementById("popupBtn").onclick = () => {
    document.getElementById("popupOverlay").style.display = "none";
    popupActive = false;
    resetRocket();
};

// KEYS
document.addEventListener("keydown", e => {
    if (popupActive && e.key === "Enter")
        document.getElementById("popupBtn").click();

    if (e.key === "ArrowLeft") rotateRocket("left");
    if (e.key === "ArrowRight") rotateRocket("right");
    if (e.key === " ") launchRocket();
});

// START GAME
resetRocket();
