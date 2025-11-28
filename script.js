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
    const pointerX = e.clientX;
    const pointerY = e.clientY;

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

const gateCanvas = document.getElementById("gateCanvas");
const gateCtx = gateCanvas.getContext("2d");

const gateXLabel = document.getElementById("gateXLabel");
const gateTopLabel = document.getElementById("gateTopLabel");
const gateBottomLabel = document.getElementById("gateBottomLabel");

const topControlsPanel = document.getElementById("topControls");
const gateControlsPanel = document.getElementById("gateControls");
const gateInfoPanel = document.getElementById("gateInfo");

const totalGatesLabel = document.getElementById("totalGatesCount");
const hitsLabel = document.getElementById("hitsCount");
const missesLabel = document.getElementById("missCount");
const hitsDots = document.getElementById("hitsDots");
const missDots = document.getElementById("missDots");

const ySlider = document.getElementById("ySlider");
const yInput = document.getElementById("yInput");

const slopeSlider = document.getElementById("slopeSlider");
const slopeInput = document.getElementById("slopeInput");

const quadSlider = document.getElementById("quadSlider");
const quadInput = document.getElementById("quadInput");

const cubicSlider = document.getElementById("cubicSlider");
const cubicInput = document.getElementById("cubicInput");

const resetBtn = document.getElementById("resetBtn");

const gateXInput = document.getElementById("gateXInput");
const gateY1Input = document.getElementById("gateY1Input");
const gateY2Input = document.getElementById("gateY2Input");
const addGateBtn = document.getElementById("addGateBtn");
const gateList = document.getElementById("gateList");

const gridCanvas = document.getElementById("gridCanvas");
const gridCtx = gridCanvas.getContext("2d");

const canvas = document.getElementById("trailCanvas");
const ctx = canvas.getContext("2d");

const MAP_SIZE = 3000;
const WORLD_CENTER = MAP_SIZE / 2;

gridCanvas.width = MAP_SIZE;
gridCanvas.height = MAP_SIZE;

gateCanvas.width = MAP_SIZE;
gateCanvas.height = MAP_SIZE;

canvas.width = MAP_SIZE;
canvas.height = MAP_SIZE;

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
let roundFinished = false;
let frozen = false;

let endThresholdX = null;
let lastGateTargetX = null;

let gates = [];
let gateIdCounter = 1;
let gatesCrossed = new Set();
let activeRunGateIds = new Set();

class ScoreBoard {
    constructor(hitsEl, missesEl, totalEl, hitDotsEl, missDotsEl) {
        this.hitsEl = hitsEl;
        this.missesEl = missesEl;
        this.totalEl = totalEl;
        this.hitDotsEl = hitDotsEl;
        this.missDotsEl = missDotsEl;

        this.hits = 0;
        this.misses = 0;
        this.runTotal = 0;
        this.runRemaining = 0;
        this.runStartMisses = 0;

        this.updateCounts();
        this.updateRunTotals();
    }

    resetRun() {
        this.runTotal = 0;
        this.runRemaining = 0;
        this.runStartMisses = this.misses;
        this.updateRunTotals();
    }

    startRun(totalGates) {
        this.runTotal = totalGates;
        this.runRemaining = totalGates;
        this.runStartMisses = this.misses;
        this.updateRunTotals();
    }

    recordHit() {
        this.hits++;
        this.runRemaining = Math.max(0, this.runRemaining - 1);
        this.updateCounts();
        this.addDots(this.hitDotsEl, 1, "lime");
    }

    recordMiss(count = 1) {
        if (!count) return;

        this.misses += count;
        this.runRemaining = Math.max(0, this.runRemaining - count);
        this.updateCounts();
        this.addDots(this.missDotsEl, count, "red");
    }

    finalizeRemainingAsMisses() {
        if (this.runRemaining > 0)
            this.recordMiss(this.runRemaining);
    }

    hasRunGates() {
        return this.runTotal > 0;
    }

    isRunComplete() {
        return this.runRemaining <= 0;
    }

    hadRunMisses() {
        return this.misses > this.runStartMisses;
    }

    updateCounts() {
        this.hitsEl.textContent = this.hits;
        this.missesEl.textContent = this.misses;
    }

    updateRunTotals() {
        this.totalEl.textContent = this.runTotal;
    }

    addDots(container, count, color) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const dot = document.createElement("span");
            dot.textContent = "●";
            dot.style.color = color;
            fragment.appendChild(dot);
        }
        container.appendChild(fragment);
    }

    resetAll() {
        this.hits = 0;
        this.misses = 0;
        this.runTotal = 0;
        this.runRemaining = 0;
        this.runStartMisses = 0;

        this.hitDotsEl.innerHTML = "";
        this.missDotsEl.innerHTML = "";

        this.updateCounts();
        this.updateRunTotals();
    }
}

const scoreBoard = new ScoreBoard(hitsLabel, missesLabel, totalGatesLabel, hitsDots, missDots);

function makePanelDraggable(panel) {
    const header = panel.querySelector(".panelHeader");
    if (!header) return;

    const rect = panel.getBoundingClientRect();
    panel.style.left = `${rect.left}px`;
    panel.style.top = `${rect.top}px`;
    panel.style.transform = "none";

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    function startDrag(clientX, clientY) {
        isDragging = true;
        offsetX = clientX - panel.offsetLeft;
        offsetY = clientY - panel.offsetTop;
        panel.classList.add("dragging");
    }

    function onPointerMove(e) {
        if (!isDragging) return;
        panel.style.left = `${e.clientX - offsetX}px`;
        panel.style.top = `${e.clientY - offsetY}px`;
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        panel.classList.remove("dragging");
    }

    header.addEventListener("pointerdown", e => {
        if (e.target.closest(".panelToggle")) return;
        startDrag(e.clientX, e.clientY);
    });

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
}

function initializeCollapsible(panel) {
    const body = panel.querySelector(".panelBody");
    const toggle = panel.querySelector(".panelToggle");
    if (!body || !toggle) return;

    function setButtonLabel() {
        toggle.textContent = panel.classList.contains("collapsed") ? "+" : "−";
    }

    function collapse() {
        body.style.maxHeight = `${body.scrollHeight}px`;
        requestAnimationFrame(() => {
            panel.classList.add("collapsed");
            body.style.maxHeight = "0px";
            setButtonLabel();
        });
    }

    function expand() {
        body.style.maxHeight = "0px";
        panel.classList.remove("collapsed");
        setButtonLabel();
        requestAnimationFrame(() => {
            body.style.maxHeight = `${body.scrollHeight}px`;
        });
    }

    toggle.addEventListener("click", () => {
        if (panel.classList.contains("collapsed")) {
            expand();
        } else {
            collapse();
        }
    });

    body.style.maxHeight = `${body.scrollHeight}px`;
    setButtonLabel();
}

// UTILS
function convertCenterToScreen(value) {
    return WORLD_CENTER - value - rocket.clientHeight / 2;
}

function convertScreenToCenter(y) {
    return -(y + rocket.clientHeight / 2 - WORLD_CENTER);
}

function toScreenX(value) {
    return WORLD_CENTER + value;
}

function toScreenY(value) {
    return WORLD_CENTER - value;
}

// GATES
function drawGates() {
    gateCtx.clearRect(0, 0, MAP_SIZE, MAP_SIZE);
    gateCtx.strokeStyle = "lime";
    gateCtx.lineWidth = 3;
    gateCtx.fillStyle = "white";
    gateCtx.font = "14px Arial";
    gateCtx.textAlign = "left";
    gateCtx.textBaseline = "middle";

    gates.forEach(gate => {
        const x = toScreenX(gate.x);
        const y1 = toScreenY(gate.y1);
        const y2 = toScreenY(gate.y2);
        const gapTop = Math.min(y1, y2);
        const gapBottom = Math.max(y1, y2);

        gateCtx.beginPath();
        gateCtx.moveTo(x, gapTop);
        gateCtx.lineTo(x, gapBottom);
        gateCtx.stroke();

        if (gate.showCoordinates) {
            const labelOffset = 8;
            const topLabel = `( ${gate.x}, ${gate.y1} )`;
            const bottomLabel = `( ${gate.x}, ${gate.y2} )`;

            gateCtx.fillText(topLabel, x + labelOffset, y1);
            gateCtx.fillText(bottomLabel, x + labelOffset, y2);
        }
    });
}

function renderGateList() {
    gateList.innerHTML = "";

    if (!gates.length) {
        const empty = document.createElement("div");
        empty.textContent = "No gates yet.";
        empty.style.textAlign = "center";
        gateList.appendChild(empty);
        return;
    }

    gates.forEach(gate => {
        if (gate.showCoordinates === undefined) gate.showCoordinates = false;

        const row = document.createElement("div");
        row.className = "gateItem";

        const xInput = document.createElement("input");
        xInput.type = "number";
        xInput.value = gate.x;
        xInput.className = "numInput";
        xInput.step = "50";

        const y1Input = document.createElement("input");
        y1Input.type = "number";
        y1Input.value = gate.y1;
        y1Input.className = "numInput";
        y1Input.step = "50";

        const y2Input = document.createElement("input");
        y2Input.type = "number";
        y2Input.value = gate.y2;
        y2Input.className = "numInput";
        y2Input.step = "50";

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        saveBtn.className = "saveBtn";
        saveBtn.onclick = () => {
            const x = parseFloat(xInput.value);
            const y1 = parseFloat(y1Input.value);
            const y2 = parseFloat(y2Input.value);

            if (!validateGateValues(x, y1, y2)) return;

            gate.x = x;
            gate.y1 = y1;
            gate.y2 = y2;
            drawGates();
            updateGateInfo();
            renderGateList();
        };

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.className = "removeBtn";
        removeBtn.onclick = () => {
            gates = gates.filter(g => g.id !== gate.id);
            drawGates();
            updateGateInfo();
            renderGateList();
        };

        const toggleLabel = document.createElement("label");
        toggleLabel.className = "toggleLabel";
        const coordsToggle = document.createElement("input");
        coordsToggle.type = "checkbox";
        coordsToggle.checked = gate.showCoordinates;
        coordsToggle.onchange = () => {
            gate.showCoordinates = coordsToggle.checked;
            drawGates();
        };
        toggleLabel.append(coordsToggle, document.createTextNode(" Show coords"));

        row.append(
            document.createTextNode("X:"),
            xInput,
            document.createTextNode(" Y1:"),
            y1Input,
            document.createTextNode(" Y2:"),
            y2Input,
            saveBtn,
            removeBtn,
            toggleLabel
        );

        gateList.appendChild(row);
    });
}

function validateGateValues(x, y1, y2) {
    if ([x, y1, y2].some(v => Number.isNaN(v))) {
        alert("Please enter numeric values for X, Y1, and Y2.");
        return false;
    }

    if (y1 >= y2) {
        alert("Gate requires Y1 < Y2 to form a gap.");
        return false;
    }

    return true;
}

function addGate(x, y1, y2) {
    if (!validateGateValues(x, y1, y2)) return;

    gates.push({ id: gateIdCounter++, x, y1, y2, showCoordinates: false });
    drawGates();
    updateGateInfo();
    renderGateList();
}

function getNextGate() {
    if (!gates.length || rocketX === undefined) return null;

    const rocketCenterX = rocketX + rocket.clientWidth / 2 - WORLD_CENTER;
    const candidates = gates.filter(gate =>
        !gatesCrossed.has(gate.id) &&
        (facing === "right" ? gate.x >= rocketCenterX : gate.x <= rocketCenterX)
    );

    if (!candidates.length) return null;

    const sorted = [...candidates].sort((a, b) =>
        facing === "right" ? a.x - b.x : b.x - a.x
    );

    return sorted[0];
}

function getGatesInFlightPath() {
    const rocketCenterX = rocketX + rocket.clientWidth / 2 - WORLD_CENTER;

    return gates.filter(gate => facing === "right"
        ? gate.x >= rocketCenterX
        : gate.x <= rocketCenterX
    );
}

function updateGateInfo() {
    const next = getNextGate();

    if (!next) {
        gateXLabel.textContent = "–";
        gateTopLabel.textContent = "–";
        gateBottomLabel.textContent = "–";
        return;
    }

    gateXLabel.textContent = Math.round(next.x);
    gateTopLabel.textContent = Math.round(next.y1);
    gateBottomLabel.textContent = Math.round(next.y2);
}

function setControlsDisabled(disabled) {
    const elements = [
        ySlider, yInput,
        slopeSlider, slopeInput,
        quadSlider, quadInput,
        cubicSlider, cubicInput,
        gateXInput, gateY1Input, gateY2Input,
        addGateBtn
    ];

    elements.forEach(el => el.disabled = disabled);

    gateList.querySelectorAll("input, button").forEach(el => {
        el.disabled = disabled;
    });
}

function hideResetButton() {
    resetBtn.style.display = "none";
}

function showResetButton() {
    resetBtn.style.display = "inline-block";
}

// RESET
function resetRocket() {
    cancelAnimationFrame(anim);
    anim = null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lastTrailX = null;
    lastTrailY = null;

    rocketX = WORLD_CENTER - rocket.clientWidth / 2;
    rocketY = WORLD_CENTER - rocket.clientHeight / 2;

    rocket.style.left = rocketX + "px";
    rocket.style.top  = rocketY + "px";

    slope = quad = cubic = 0;
    slopeSlider.value = slopeInput.value = 0;
    quadSlider.value  = quadInput.value  = 0;
    cubicSlider.value = cubicInput.value = 0;

    frameCount = 0;

    frozen = false;
    endThresholdX = null;
    lastGateTargetX = null;

    const c = convertScreenToCenter(rocketY);
    ySlider.value = yInput.value = c;

    inFlight = false;
    roundFinished = false;
    gatesCrossed = new Set();
    activeRunGateIds = new Set();
    scoreBoard.resetRun();

    setControlsDisabled(false);
    hideResetButton();

    centerGraphOnRocket();
    updateGateInfo();
}

function resetGame() {
    resetRocket();

    gateXInput.value = 0;
    gateY1Input.value = -200;
    gateY2Input.value = 200;

    gates = [];
    gateIdCounter = 1;
    drawGates();
    renderGateList();
    updateGateInfo();

    scoreBoard.resetAll();
}

// BEFORE LAUNCH
function setRocketFromCenter(v) {
    if (inFlight || frozen) return;
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

makePanelDraggable(topControlsPanel);
makePanelDraggable(gateControlsPanel);
makePanelDraggable(gateInfoPanel);
initializeCollapsible(topControlsPanel);
initializeCollapsible(gateControlsPanel);
initializeCollapsible(gateInfoPanel);

window.addEventListener("resize", () => {
    [topControlsPanel, gateControlsPanel, gateInfoPanel].forEach(panel => {
        if (!panel || panel.classList.contains("collapsed")) return;
        const body = panel.querySelector(".panelBody");
        if (!body) return;
        body.style.maxHeight = `${body.scrollHeight}px`;
    });
});

addGateBtn.onclick = () => {
    const x = parseFloat(gateXInput.value);
    const y1 = parseFloat(gateY1Input.value);
    const y2 = parseFloat(gateY2Input.value);

    addGate(x, y1, y2);
};

resetBtn.onclick = () => resetGame();

// GRID
function drawGrid() {
    const gridSpacing = 100;
    const tickLength = 12;
    const labelSpacing = 500;
    const centerX = gridCanvas.width / 2;
    const centerY = gridCanvas.height / 2;

    gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

    gridCtx.strokeStyle = "#2d2d2d";
    gridCtx.lineWidth = 1;

    for (let x = 0; x <= gridCanvas.width; x += gridSpacing) {
        gridCtx.beginPath();
        gridCtx.moveTo(x, 0);
        gridCtx.lineTo(x, gridCanvas.height);
        gridCtx.stroke();
    }

    for (let y = 0; y <= gridCanvas.height; y += gridSpacing) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, y);
        gridCtx.lineTo(gridCanvas.width, y);
        gridCtx.stroke();
    }

    gridCtx.strokeStyle = "#555";
    gridCtx.lineWidth = 2;

    gridCtx.beginPath();
    gridCtx.moveTo(centerX, 0);
    gridCtx.lineTo(centerX, gridCanvas.height);
    gridCtx.stroke();

    gridCtx.beginPath();
    gridCtx.moveTo(0, centerY);
    gridCtx.lineTo(gridCanvas.width, centerY);
    gridCtx.stroke();

    gridCtx.strokeStyle = "#777";
    gridCtx.fillStyle = "#888";
    gridCtx.font = "12px Arial";

    function drawVerticalTick(x) {
        gridCtx.beginPath();
        gridCtx.moveTo(x, centerY - tickLength / 2);
        gridCtx.lineTo(x, centerY + tickLength / 2);
        gridCtx.stroke();
    }

    function drawHorizontalTick(y) {
        gridCtx.beginPath();
        gridCtx.moveTo(centerX - tickLength / 2, y);
        gridCtx.lineTo(centerX + tickLength / 2, y);
        gridCtx.stroke();
    }

    for (let offset = 0; offset <= gridCanvas.width / 2; offset += gridSpacing) {
        const xPos = centerX + offset;
        const xNeg = centerX - offset;

        if (xPos <= gridCanvas.width) {
            drawVerticalTick(xPos);
            if (offset % labelSpacing === 0) {
                gridCtx.textAlign = "center";
                gridCtx.textBaseline = "top";
                gridCtx.fillText(offset, xPos, centerY + tickLength / 2 + 4);
            }
        }

        if (offset !== 0 && xNeg >= 0) {
            drawVerticalTick(xNeg);
            if (offset % labelSpacing === 0) {
                gridCtx.textAlign = "center";
                gridCtx.textBaseline = "top";
                gridCtx.fillText(-offset, xNeg, centerY + tickLength / 2 + 4);
            }
        }
    }

    for (let offset = 0; offset <= gridCanvas.height / 2; offset += gridSpacing) {
        const yPos = centerY + offset;
        const yNeg = centerY - offset;

        if (yPos <= gridCanvas.height) {
            drawHorizontalTick(yPos);
            if (offset % labelSpacing === 0 && offset !== 0) {
                gridCtx.textAlign = "right";
                gridCtx.textBaseline = "middle";
                gridCtx.fillText(-offset, centerX - tickLength / 2 - 6, yPos);
            }
        }

        if (yNeg >= 0) {
            drawHorizontalTick(yNeg);
            if (offset % labelSpacing === 0 && offset !== 0) {
                gridCtx.textAlign = "right";
                gridCtx.textBaseline = "middle";
                gridCtx.fillText(offset, centerX - tickLength / 2 - 6, yNeg);
            }
        }
    }
}

drawGrid();
drawGates();

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
    if (inFlight || frozen) return;
    facing = dir;
    rocket.style.transform =
        dir === "right" ? "rotate(90deg)" : "rotate(-90deg)";
    updateGateInfo();
}

function calculateEndThreshold(gatesInPath) {
    const rocketCenterX = rocketX + rocket.clientWidth / 2 - WORLD_CENTER;

    if (gatesInPath.length) {
        lastGateTargetX = facing === "right"
            ? Math.max(...gatesInPath.map(gate => gate.x))
            : Math.min(...gatesInPath.map(gate => gate.x));
    } else {
        lastGateTargetX = rocketCenterX;
    }

    endThresholdX = lastGateTargetX + (facing === "right" ? 100 : -100);
}

function hasReachedEnd(rocketCenterX) {
    if (endThresholdX === null) return false;

    return facing === "right"
        ? rocketCenterX >= endThresholdX
        : rocketCenterX <= endThresholdX;
}

function freezeSimulation() {
    if (roundFinished || frozen) return;

    cancelAnimationFrame(anim);
    anim = null;
    inFlight = false;
    roundFinished = true;
    frozen = true;

    setControlsDisabled(true);
    showResetButton();
}

function finalizeRun() {
    scoreBoard.finalizeRemainingAsMisses();
    freezeSimulation();
}

// LAUNCH
function launchRocket() {
    if (inFlight || frozen) return;

    const gatesInPath = getGatesInFlightPath();
    activeRunGateIds = new Set(gatesInPath.map(gate => gate.id));
    scoreBoard.startRun(activeRunGateIds.size);

    calculateEndThreshold(gatesInPath);

    inFlight = true;
    roundFinished = false;
    frameCount = 0;
    gatesCrossed = new Set();

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

        checkCollision(prevX, newX, newY);

        const rocketCenterX = newX - WORLD_CENTER;
        if (!roundFinished && hasReachedEnd(rocketCenterX))
            finalizeRun();

        if (!roundFinished)
            anim = requestAnimationFrame(update);
    }

    anim = requestAnimationFrame(update);
}

// COLLISION
function checkCollision(prevX, newX, centerY) {
    if (roundFinished) return;

    const offMap =
        rocketX < -rocket.clientWidth ||
        rocketX > MAP_SIZE ||
        rocketY < -rocket.clientHeight ||
        rocketY > MAP_SIZE;

    if (offMap) {
        finalizeRun();
        return;
    }

    let gateProcessed = false;

    for (const gate of gates) {
        if (!activeRunGateIds.has(gate.id) || gatesCrossed.has(gate.id)) continue;

        const gateX = toScreenX(gate.x);
        const crossed = facing === "right"
            ? prevX <= gateX && newX >= gateX
            : prevX >= gateX && newX <= gateX;

        if (!crossed) continue;

        gateProcessed = true;
        gatesCrossed.add(gate.id);

        const gapTop = Math.min(toScreenY(gate.y1), toScreenY(gate.y2));
        const gapBottom = Math.max(toScreenY(gate.y1), toScreenY(gate.y2));
        const hit = centerY >= gapTop && centerY <= gapBottom;

        if (hit) scoreBoard.recordHit();
        else     scoreBoard.recordMiss();
    }

    if (gateProcessed)
        updateGateInfo();
}

// KEYS
document.addEventListener("keydown", e => {
    if (frozen) return;

    if (e.key === "ArrowLeft") rotateRocket("left");
    if (e.key === "ArrowRight") rotateRocket("right");
    if (e.key === " ") launchRocket();
});

renderGateList();
// START GAME
resetRocket();
