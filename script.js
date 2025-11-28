// ====================================================
// ZOOM + PAN SYSTEM  (MAP ONLY)
// ====================================================
const DEFAULT_ROCKET_SIZE = 1;

const zoomContainer = document.getElementById("zoomContainer");
const gateControlsPanel = document.getElementById("gateControls");
const gateList = document.getElementById("gateList");
const savedLevelsPanel = document.getElementById("savedLevelsPanel");
const savedLevelsList = document.getElementById("savedLevelsList");
const DESIRED_VIEW_RANGE = 60; // Shows -30 to 30 on both axes
const MAX_ZOOM = 30;
let zoom = 1;
let translateX = 0;
let translateY = 0;
let sliderActive = false;

function applyTransform() {
    zoomContainer.style.transform =
        `translate(${translateX}px, ${translateY}px) scale(${zoom})`;
    updateRocketTransform();
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
    const isOverGatePanel = gateControlsPanel.contains(e.target);
    if (isOverGatePanel) {
        e.preventDefault();
        gateList.scrollTop += e.deltaY;
        return;
    }

    e.preventDefault();

    const zoomStep = 1.1;
    const pointerX = e.clientX;
    const pointerY = e.clientY;

    const worldX = (pointerX - translateX) / zoom;
    const worldY = (pointerY - translateY) / zoom;

    zoom = e.deltaY < 0 ? zoom * zoomStep : zoom / zoomStep;
    zoom = Math.min(Math.max(zoom, 0.2), MAX_ZOOM);

    translateX = pointerX - worldX * zoom;
    translateY = pointerY - worldY * zoom;

    updateGridForZoom();
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
const ROCKET_BASE_WIDTH = 40;
const ROCKET_BASE_HEIGHT = 64;
rocket.style.width = `${ROCKET_BASE_WIDTH}px`;
rocket.style.height = `${ROCKET_BASE_HEIGHT}px`;
const gameArea = document.getElementById("gameArea");

const gateSvg = document.getElementById("gateSvg");

const gateXLabel = document.getElementById("gateXLabel");
const gateTopLabel = document.getElementById("gateTopLabel");
const gateBottomLabel = document.getElementById("gateBottomLabel");

const topControlsPanel = document.getElementById("topControls");
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

const rocketSizeSlider = document.getElementById("rocketSizeSlider");
const rocketSizeInput = document.getElementById("rocketSizeInput");

const resetBtn = document.getElementById("resetBtn");
const nextBtn = document.getElementById("nextBtn");

const sliderDefaults = {
    y: parseFloat(ySlider.defaultValue),
    slope: parseFloat(slopeSlider.defaultValue),
    quad: parseFloat(quadSlider.defaultValue),
    cubic: parseFloat(cubicSlider.defaultValue),
    rocketSize: parseFloat(rocketSizeSlider.defaultValue) || DEFAULT_ROCKET_SIZE,
};

const gateXInput = document.getElementById("gateXInput");
const gateY1Input = document.getElementById("gateY1Input");
const gateY2Input = document.getElementById("gateY2Input");
const addGateBtn = document.getElementById("addGateBtn");
const gridSvg = document.getElementById("gridSvg");

const savedLevels = [
    {
        name: "Level 1",
        gates: [
            { x: 10, y1: 20, y2: 50 }
        ]
    },
    {
        name: "Level 2",
        gates: [
            { x: 5, y1: -10, y2: 0 },
            { x: 10, y1: 5, y2: 10 }
        ]
    },
    {
        name: "Level 3",
        gates: [
            { x: 8, y1: -30, y2: 5 },
            { x: 16, y1: 15, y2: 45 }
        ]
    },
    {
        name: "Level 4",
        gates: [
            { x: 6, y1: -25, y2: 15 },
            { x: 12, y1: -5, y2: 25 },
            { x: 18, y1: 30, y2: 70 }
        ]
    },
    {
        name: "Level 5",
        gates: [
            { x: 4, y1: -40, y2: -5 },
            { x: 10, y1: 0, y2: 35 },
            { x: 16, y1: 25, y2: 60 },
            { x: 22, y1: 55, y2: 95 }
        ]
    },
    {
        name: "Level 6",
        gates: [
            { x: 5, y1: -60, y2: -20 },
            { x: 12, y1: -15, y2: 20 },
            { x: 18, y1: 10, y2: 45 },
            { x: 26, y1: 40, y2: 80 }
        ]
    }
];

const canvas = document.getElementById("trailCanvas");
const ctx = canvas.getContext("2d");

const MAP_SIZE = 3000;
const WORLD_CENTER = MAP_SIZE / 2;

gridSvg.setAttribute("width", MAP_SIZE);
gridSvg.setAttribute("height", MAP_SIZE);
gridSvg.setAttribute("viewBox", `0 0 ${MAP_SIZE} ${MAP_SIZE}`);

gateSvg.setAttribute("width", MAP_SIZE);
gateSvg.setAttribute("height", MAP_SIZE);
gateSvg.setAttribute("viewBox", `0 0 ${MAP_SIZE} ${MAP_SIZE}`);

canvas.width = MAP_SIZE;
canvas.height = MAP_SIZE;

let rocketX, rocketY;
let rocketSize = parseFloat(rocketSizeSlider.value) || DEFAULT_ROCKET_SIZE;
let slope = 0;
let quad = 0;
let cubic = 0;
let speed = 6;
let facing = "right";
let rocketAngle = 90;

setRocketSize(rocketSize, false);
updateRocketTransform();

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

const GRID_ZOOM_STEPS = [
    { maxPercent: 100, gridSpacing: 200 },
    { maxPercent: 300, gridSpacing: 120 },
    { maxPercent: 800, gridSpacing: 60 },
    { maxPercent: 1500, gridSpacing: 30 },
    { maxPercent: 3000, gridSpacing: 15 },
    { maxPercent: Infinity, gridSpacing: 8 },
];

let currentGridConfig = null;
let currentLabelFontSize = null;
let currentGateLabelFontSize = null;

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

function refreshPanelBodyHeight(panel) {
    const body = panel.querySelector(".panelBody");
    if (!body || panel.classList.contains("collapsed")) return;
    body.style.maxHeight = `${body.scrollHeight}px`;
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

function updateRocketTransform() {
    const zoomCompensation = 1 / zoom;
    rocket.style.setProperty("--rocket-zoom-compensation", zoomCompensation);
    rocket.style.transform = `scale(${zoomCompensation}) rotate(${rocketAngle}deg)`;
}

function updateRocketSize(maintainCenter = true) {
    const previousWidth = rocket.clientWidth;
    const previousHeight = rocket.clientHeight;
    const canMaintainCenter = maintainCenter &&
        rocketX !== undefined && rocketY !== undefined;
    const centerX = canMaintainCenter ? rocketX + previousWidth / 2 : null;
    const centerY = canMaintainCenter ? rocketY + previousHeight / 2 : null;

    const width = ROCKET_BASE_WIDTH * rocketSize;
    const height = ROCKET_BASE_HEIGHT * rocketSize;

    rocket.style.width = `${width}px`;
    rocket.style.height = `${height}px`;

    if (canMaintainCenter) {
        rocketX = centerX - width / 2;
        rocketY = centerY - height / 2;
        rocket.style.left = rocketX + "px";
        rocket.style.top = rocketY + "px";
    }
}

function setRocketSize(value, maintainCenter = true) {
    const clamped = Math.min(Math.max(value, 0.5), 2);
    rocketSize = clamped;
    rocketSizeSlider.value = clamped;
    rocketSizeInput.value = clamped.toFixed(2).replace(/\.00$/, "");
    updateRocketSize(maintainCenter);
}

// GATES
function drawGates() {
    while (gateSvg.firstChild) gateSvg.removeChild(gateSvg.firstChild);

    const lineGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    lineGroup.setAttribute("stroke", "lime");
    lineGroup.setAttribute("stroke-width", "3");
    lineGroup.setAttribute("shape-rendering", "geometricPrecision");

    const labelFontSize = getLabelFontSizeForZoom(zoom);
    currentGateLabelFontSize = labelFontSize;

    const labelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    labelGroup.dataset.role = "gate-labels";
    labelGroup.setAttribute("fill", "white");
    labelGroup.setAttribute("font-size", labelFontSize);
    labelGroup.setAttribute("font-family", "Arial, sans-serif");
    labelGroup.setAttribute("text-anchor", "start");
    labelGroup.setAttribute("dominant-baseline", "middle");

    gates.forEach(gate => {
        const x = toScreenX(gate.x);
        const y1 = toScreenY(gate.y1);
        const y2 = toScreenY(gate.y2);
        const gapTop = Math.min(y1, y2);
        const gapBottom = Math.max(y1, y2);

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x);
        line.setAttribute("y1", gapTop);
        line.setAttribute("x2", x);
        line.setAttribute("y2", gapBottom);
        lineGroup.appendChild(line);

        if (gate.showCoordinates) {
            const labelOffset = 8;
            const topLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
            topLabel.dataset.role = "gate-label";
            topLabel.setAttribute("x", x + labelOffset);
            topLabel.setAttribute("y", y1);
            topLabel.textContent = `( ${gate.x}, ${gate.y1} )`;

            const bottomLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
            bottomLabel.dataset.role = "gate-label";
            bottomLabel.setAttribute("x", x + labelOffset);
            bottomLabel.setAttribute("y", y2);
            bottomLabel.textContent = `( ${gate.x}, ${gate.y2} )`;

            labelGroup.appendChild(topLabel);
            labelGroup.appendChild(bottomLabel);
        }
    });

    gateSvg.appendChild(lineGroup);
    gateSvg.appendChild(labelGroup);
}

function renderGateList() {
    gateList.innerHTML = "";

    if (!gates.length) {
        const empty = document.createElement("div");
        empty.textContent = "No gates yet.";
        empty.style.textAlign = "center";
        gateList.appendChild(empty);
        refreshPanelBodyHeight(gateControlsPanel);
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

    refreshPanelBodyHeight(gateControlsPanel);
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

function loadSavedLevel(levelIndex) {
    const level = savedLevels[levelIndex];
    if (!level) return;

    clearGates();
    level.gates.forEach(gate => addGate(gate.x, gate.y1, gate.y2));

    facing = "right";
    rocketAngle = 90;
    resetRocket();
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

function clearGates() {
    gates = [];
    gateIdCounter = 1;
    activeRunGateIds = new Set();
    gatesCrossed = new Set();
    drawGates();
    updateGateInfo();
    renderGateList();
}

function resetSlidersToDefaults() {
    ySlider.value = sliderDefaults.y;
    yInput.value = sliderDefaults.y;

    slopeSlider.value = sliderDefaults.slope;
    slopeInput.value = sliderDefaults.slope;
    slope = sliderDefaults.slope;

    quadSlider.value = sliderDefaults.quad;
    quadInput.value = sliderDefaults.quad;
    quad = sliderDefaults.quad;

    cubicSlider.value = sliderDefaults.cubic;
    cubicInput.value = sliderDefaults.cubic;
    cubic = sliderDefaults.cubic;

    setRocketSize(sliderDefaults.rocketSize);
}

// RESET
function resetRocket() {
    cancelAnimationFrame(anim);
    anim = null;

    facing = "right";
    rocketAngle = 90;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lastTrailX = null;
    lastTrailY = null;

    const yCenter = parseFloat(ySlider.value);
    const safeYCenter = Number.isFinite(yCenter) ? yCenter : 0;

    rocketX = WORLD_CENTER - rocket.clientWidth / 2;
    rocketY = convertCenterToScreen(safeYCenter);

    rocket.style.left = rocketX + "px";
    rocket.style.top  = rocketY + "px";

    frameCount = 0;

    frozen = false;
    endThresholdX = null;
    lastGateTargetX = null;

    inFlight = false;
    roundFinished = false;
    gatesCrossed = new Set();
    activeRunGateIds = new Set();
    scoreBoard.resetRun();

    setControlsDisabled(false);
    hideResetButton();

    setDefaultView();
    centerGraphOnRocket();
    updateRocketTransform();
    updateGateInfo();
}

function resetGame() {
    scoreBoard.resetAll();
    resetRocket();
}

function nextIteration() {
    resetSlidersToDefaults();
    clearGates();
    scoreBoard.resetAll();
    resetRocket();
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

rocketSizeSlider.oninput = () => {
    setRocketSize(parseFloat(rocketSizeSlider.value));
};
rocketSizeInput.oninput = () => {
    let v = parseFloat(rocketSizeInput.value);
    if (isNaN(v)) v = rocketSize;
    setRocketSize(v);
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
registerSlider(rocketSizeSlider);

function renderSavedLevelButtons() {
    if (!savedLevelsList) return;

    savedLevelsList.innerHTML = "";
    savedLevels.forEach((level, index) => {
        const btn = document.createElement("button");
        btn.textContent = level.name;
        btn.className = "secondaryBtn";
        btn.addEventListener("click", () => loadSavedLevel(index));
        savedLevelsList.appendChild(btn);
    });

    refreshPanelBodyHeight(savedLevelsPanel);
}

makePanelDraggable(topControlsPanel);
makePanelDraggable(gateControlsPanel);
makePanelDraggable(gateInfoPanel);
makePanelDraggable(savedLevelsPanel);
initializeCollapsible(topControlsPanel);
initializeCollapsible(gateControlsPanel);
initializeCollapsible(gateInfoPanel);
initializeCollapsible(savedLevelsPanel);

window.addEventListener("resize", () => {
    [topControlsPanel, gateControlsPanel, gateInfoPanel, savedLevelsPanel].forEach(panel => {
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
nextBtn.onclick = () => nextIteration();

// VIEWPORT SETUP
function setDefaultView() {
    const targetZoom = Math.min(
        window.innerWidth / DESIRED_VIEW_RANGE,
        window.innerHeight / DESIRED_VIEW_RANGE
    );

    zoom = Math.min(Math.max(targetZoom, 0.2), MAX_ZOOM);
    updateGridForZoom();
}

// GRID
function getGridConfigForZoom(zoomLevel) {
    const zoomPercent = zoomLevel * 100;
    return GRID_ZOOM_STEPS.find(step => zoomPercent <= step.maxPercent);
}

function getLabelFontSizeForZoom(zoomLevel) {
    const targetScreenSize = 14;
    const minScreenSize = 10;
    const maxScreenSize = 18;

    const fontSize = targetScreenSize / zoomLevel;
    const minSize = minScreenSize / zoomLevel;
    const maxSize = maxScreenSize / zoomLevel;

    return Math.min(Math.max(fontSize, minSize), maxSize);
}

function updateGridForZoom() {
    const config = getGridConfigForZoom(zoom);
    if (!config) return;

    const labelFontSize = getLabelFontSizeForZoom(zoom);
    const spacingChanged = !currentGridConfig ||
        config.gridSpacing !== currentGridConfig.gridSpacing;
    const labelSizeChanged = currentLabelFontSize === null ||
        Math.abs(labelFontSize - currentLabelFontSize) > 0.01;

    if (spacingChanged) {
        currentGridConfig = config;
        currentLabelFontSize = labelFontSize;
        drawGrid(config, labelFontSize);
        return;
    }

    if (labelSizeChanged) {
        const labelGroup = gridSvg.querySelector('[data-role="grid-labels"]');
        if (labelGroup) {
            labelGroup.setAttribute("font-size", labelFontSize);
        }
        currentLabelFontSize = labelFontSize;
    }

    updateGateLabelsForZoom();
}

function updateGateLabelsForZoom() {
    const labelGroup = gateSvg.querySelector('[data-role="gate-labels"]');
    if (!labelGroup) return;

    const labelFontSize = getLabelFontSizeForZoom(zoom);
    if (currentGateLabelFontSize !== null &&
        Math.abs(labelFontSize - currentGateLabelFontSize) <= 0.01) {
        return;
    }

    labelGroup.setAttribute("font-size", labelFontSize);
    currentGateLabelFontSize = labelFontSize;
}

function drawGrid(config, labelFontSize) {
    const gridSpacing = config.gridSpacing;
    const tickLength = 12;
    const centerX = MAP_SIZE / 2;
    const centerY = MAP_SIZE / 2;

    while (gridSvg.firstChild) gridSvg.removeChild(gridSvg.firstChild);

    const gridGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    gridGroup.setAttribute("stroke", "#2d2d2d");
    gridGroup.setAttribute("stroke-width", "1");
    gridGroup.setAttribute("shape-rendering", "crispEdges");

    for (let x = 0; x <= MAP_SIZE; x += gridSpacing) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x);
        line.setAttribute("y1", 0);
        line.setAttribute("x2", x);
        line.setAttribute("y2", MAP_SIZE);
        gridGroup.appendChild(line);
    }

    for (let y = 0; y <= MAP_SIZE; y += gridSpacing) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", 0);
        line.setAttribute("y1", y);
        line.setAttribute("x2", MAP_SIZE);
        line.setAttribute("y2", y);
        gridGroup.appendChild(line);
    }

    gridSvg.appendChild(gridGroup);

    const axisGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    axisGroup.setAttribute("stroke", "#555");
    axisGroup.setAttribute("stroke-width", "2");
    axisGroup.setAttribute("shape-rendering", "crispEdges");

    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", centerX);
    yAxis.setAttribute("y1", 0);
    yAxis.setAttribute("x2", centerX);
    yAxis.setAttribute("y2", MAP_SIZE);
    axisGroup.appendChild(yAxis);

    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", 0);
    xAxis.setAttribute("y1", centerY);
    xAxis.setAttribute("x2", MAP_SIZE);
    xAxis.setAttribute("y2", centerY);
    axisGroup.appendChild(xAxis);

    gridSvg.appendChild(axisGroup);

    const tickGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    tickGroup.setAttribute("stroke", "#777");
    tickGroup.setAttribute("stroke-width", "1.5");
    tickGroup.setAttribute("shape-rendering", "crispEdges");

    const labelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    labelGroup.dataset.role = "grid-labels";
    labelGroup.setAttribute("fill", "#b0b0b0");
    labelGroup.setAttribute("font-size", labelFontSize);
    labelGroup.setAttribute("font-family", "Arial, sans-serif");

    function createLine(x1, y1, x2, y2) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        return line;
    }

    function createText(x, y, text, anchor = "middle", baseline = "hanging") {
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", x);
        label.setAttribute("y", y);
        label.setAttribute("text-anchor", anchor);
        label.setAttribute("dominant-baseline", baseline);
        label.textContent = text;
        return label;
    }

    for (let offset = 0; offset <= MAP_SIZE / 2; offset += gridSpacing) {
        const xPos = centerX + offset;
        const xNeg = centerX - offset;

        if (xPos <= MAP_SIZE) {
            tickGroup.appendChild(createLine(xPos, centerY - tickLength / 2, xPos, centerY + tickLength / 2));
            labelGroup.appendChild(createText(xPos, centerY + tickLength / 2 + 6, offset, "middle", "hanging"));
        }

        if (offset !== 0 && xNeg >= 0) {
            tickGroup.appendChild(createLine(xNeg, centerY - tickLength / 2, xNeg, centerY + tickLength / 2));
            labelGroup.appendChild(createText(xNeg, centerY + tickLength / 2 + 6, -offset, "middle", "hanging"));
        }
    }

    for (let offset = 0; offset <= MAP_SIZE / 2; offset += gridSpacing) {
        const yPos = centerY + offset;
        const yNeg = centerY - offset;

        if (yPos <= MAP_SIZE) {
            tickGroup.appendChild(createLine(centerX - tickLength / 2, yPos, centerX + tickLength / 2, yPos));
            labelGroup.appendChild(createText(centerX - tickLength / 2 - 6, yPos, -offset, "end", "middle"));
        }

        if (yNeg >= 0) {
            tickGroup.appendChild(createLine(centerX - tickLength / 2, yNeg, centerX + tickLength / 2, yNeg));
            labelGroup.appendChild(createText(centerX - tickLength / 2 - 6, yNeg, offset, "end", "middle"));
        }
    }

    gridSvg.appendChild(tickGroup);
    gridSvg.appendChild(labelGroup);
}

updateGridForZoom();
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
    rocketAngle = dir === "right" ? 90 : -90;
    updateRocketTransform();
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

renderSavedLevelButtons();
renderGateList();
// START GAME
resetRocket();
