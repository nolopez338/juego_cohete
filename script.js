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

const topControlsPanel = document.getElementById("topControls");

const totalGatesLabel = document.getElementById("totalGatesCount");
const hitsLabel = document.getElementById("hitsCount");
const missesLabel = document.getElementById("missCount");
const hitsDots = document.getElementById("hitsDots");
const missDots = document.getElementById("missDots");

const yMinInput = document.getElementById("yMinInput");
const ySlider = document.getElementById("ySlider");
const yInput = document.getElementById("yInput");

const slopeMinInput = document.getElementById("slopeMinInput");
const slopeSlider = document.getElementById("slopeSlider");
const slopeInput = document.getElementById("slopeInput");

const quadMinInput = document.getElementById("quadMinInput");
const quadSlider = document.getElementById("quadSlider");
const quadInput = document.getElementById("quadInput");

const cubicMinInput = document.getElementById("cubicMinInput");
const cubicSlider = document.getElementById("cubicSlider");
const cubicInput = document.getElementById("cubicInput");
const yMaxInput = document.getElementById("yMaxInput");
const slopeMaxInput = document.getElementById("slopeMaxInput");
const quadMaxInput = document.getElementById("quadMaxInput");
const cubicMaxInput = document.getElementById("cubicMaxInput");

const rocketSizeLabel = document.getElementById("rocketSizeLabel");
const rocketSizeSlider = document.getElementById("rocketSizeSlider");
const rocketSizeInput = document.getElementById("rocketSizeInput");
const rocketSizeSetBtn = document.getElementById("rocketSizeSetBtn");

const resetBtn = document.getElementById("resetBtn");
const restartBtn = document.getElementById("restartBtn");
const nextBtn = document.getElementById("nextBtn");

const sliderDefaults = {
    y: parseFloat(ySlider.defaultValue),
    slope: parseFloat(slopeSlider.defaultValue),
    quad: parseFloat(quadSlider.defaultValue),
    cubic: parseFloat(cubicSlider.defaultValue),
    rocketSize: parseFloat(rocketSizeSlider.defaultValue) || DEFAULT_ROCKET_SIZE,
};

function clampNumber(value, min, max) {
    if (!Number.isFinite(value)) return min;
    return Math.min(Math.max(value, min), max);
}

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

const trailSvg = document.getElementById("trailSvg");
const trailPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
trailPath.setAttribute("fill", "none");
trailPath.setAttribute("stroke", "cyan");
trailPath.setAttribute("stroke-width", "3");
trailPath.setAttribute("vector-effect", "non-scaling-stroke");
trailPath.setAttribute("stroke-linecap", "round");
trailPath.setAttribute("stroke-linejoin", "round");
trailSvg.appendChild(trailPath);

const MAP_SIZE = 3000;
const WORLD_CENTER = MAP_SIZE / 2;

gridSvg.setAttribute("width", MAP_SIZE);
gridSvg.setAttribute("height", MAP_SIZE);
gridSvg.setAttribute("viewBox", `0 0 ${MAP_SIZE} ${MAP_SIZE}`);

gateSvg.setAttribute("width", MAP_SIZE);
gateSvg.setAttribute("height", MAP_SIZE);
gateSvg.setAttribute("viewBox", `0 0 ${MAP_SIZE} ${MAP_SIZE}`);

trailSvg.setAttribute("width", MAP_SIZE);
trailSvg.setAttribute("height", MAP_SIZE);
trailSvg.setAttribute("viewBox", `0 0 ${MAP_SIZE} ${MAP_SIZE}`);

let rocketX, rocketY;
let rocketSize = parseFloat(rocketSizeSlider.value) || DEFAULT_ROCKET_SIZE;
let rocketSizeLocked = false;
let slope = 0;
let quad = 0;
let cubic = 0;
let speed = 6;
let facing = "right";
let rocketAngle = 90;

setRocketSize(rocketSize, false);
updateRocketSizeControls();
updateRocketTransform();

let anim = null;
let lastTrailX = null;
let lastTrailY = null;
let trailPathData = "";
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
        this.runStartHits = 0;
        this.runStartMisses = 0;

        this.updateCounts();
        this.updateRunTotals();
    }

    resetRun() {
        this.runTotal = 0;
        this.runRemaining = 0;
        this.runStartHits = this.hits;
        this.runStartMisses = this.misses;
        this.updateRunTotals();
    }

    startRun(totalGates) {
        this.runTotal = totalGates;
        this.runRemaining = totalGates;
        this.runStartHits = this.hits;
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

    removeDots(container, count) {
        for (let i = 0; i < count; i++) {
            const lastDot = container.lastElementChild;
            if (!lastDot) break;
            container.removeChild(lastDot);
        }
    }

    clearLastRunResults() {
        const hitsToRemove = Math.max(0, this.hits - this.runStartHits);
        const missesToRemove = Math.max(0, this.misses - this.runStartMisses);

        this.removeDots(this.hitDotsEl, hitsToRemove);
        this.removeDots(this.missDotsEl, missesToRemove);

        this.hits = this.runStartHits;
        this.misses = this.runStartMisses;
        this.updateCounts();
        this.resetRun();
    }

    resetAll() {
        this.hits = 0;
        this.misses = 0;
        this.runTotal = 0;
        this.runRemaining = 0;
        this.runStartHits = 0;
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

function updateRocketSizeControls(disabled = false) {
    const isDisabled = disabled || rocketSizeLocked;
    rocketSizeSlider.disabled = isDisabled;
    rocketSizeInput.disabled = isDisabled;
    rocketSizeSetBtn.disabled = disabled || rocketSizeLocked;
    rocketSizeSlider.style.display = rocketSizeLocked ? "none" : "";
}

function setRocketSize(value, maintainCenter = true) {
    const clamped = Math.min(Math.max(value, 0.5), 2);
    rocketSize = clamped;
    rocketSizeSlider.value = clamped;
    rocketSizeInput.value = clamped.toFixed(2).replace(/\.00$/, "");
    updateRocketSize(maintainCenter);
}

const GATE_BASE_STROKE_WIDTH = 3;

// GATES
function drawGates() {
    while (gateSvg.firstChild) gateSvg.removeChild(gateSvg.firstChild);

    const lineGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    lineGroup.setAttribute("stroke", "lime");
    lineGroup.setAttribute("stroke-width", getGateStrokeWidthForZoom(zoom));
    lineGroup.setAttribute("shape-rendering", "geometricPrecision");
    lineGroup.dataset.role = "gate-lines";

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
        line.setAttribute("vector-effect", "non-scaling-stroke");
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
            renderGateList();
        };

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.className = "removeBtn";
        removeBtn.onclick = () => {
            gates = gates.filter(g => g.id !== gate.id);
            drawGates();
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

function getGatesInFlightPath() {
    const rocketCenterX = rocketX + rocket.clientWidth / 2 - WORLD_CENTER;

    return gates.filter(gate => facing === "right"
        ? gate.x >= rocketCenterX
        : gate.x <= rocketCenterX
    );
}

function setControlsDisabled(disabled) {
    const elements = [
        yMinInput, ySlider, yInput, yMaxInput,
        slopeMinInput, slopeSlider, slopeInput, slopeMaxInput,
        quadMinInput, quadSlider, quadInput, quadMaxInput,
        cubicMinInput, cubicSlider, cubicInput, cubicMaxInput,
        gateXInput, gateY1Input, gateY2Input,
        addGateBtn
    ];

    elements.forEach(el => el.disabled = disabled);

    gateList.querySelectorAll("input, button").forEach(el => {
        el.disabled = disabled;
    });

    updateRocketSizeControls(disabled);
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
    renderGateList();
}

function resetSlidersToDefaults() {
    handleYChange(sliderDefaults.y);
    handleSlopeChange(sliderDefaults.slope);
    handleQuadChange(sliderDefaults.quad);
    handleCubicChange(sliderDefaults.cubic);

    setRocketSize(sliderDefaults.rocketSize);
}

// RESET
function resetRocket() {
    cancelAnimationFrame(anim);
    anim = null;

    facing = "right";
    rocketAngle = 90;

    trailPathData = "";
    trailPath.setAttribute("d", "");
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
}

function resetGame() {
    scoreBoard.clearLastRunResults();
    resetRocket();
}

function setupRangeLimits({ slider, minInput, maxInput, valueInput, onValueUpdated }) {
    if (!slider || !minInput || !maxInput) return;

    const syncRange = () => {
        let minVal = parseFloat(minInput.value);
        let maxVal = parseFloat(maxInput.value);

        minVal = Number.isFinite(minVal) ? minVal : parseFloat(slider.min);
        maxVal = Number.isFinite(maxVal) ? maxVal : parseFloat(slider.max);

        if (minVal > maxVal) {
            [minVal, maxVal] = [maxVal, minVal];
            minInput.value = minVal;
            maxInput.value = maxVal;
        }

        slider.min = minVal;
        slider.max = maxVal;

        if (valueInput) {
            valueInput.min = minVal;
            valueInput.max = maxVal;
        }

        const clampedValue = clampNumber(parseFloat(slider.value), minVal, maxVal);
        if (slider.value !== clampedValue) {
            slider.value = clampedValue;
        }
        if (valueInput && valueInput.value !== String(clampedValue)) {
            valueInput.value = clampedValue;
        }

        if (typeof onValueUpdated === "function") {
            onValueUpdated(clampedValue);
        }
    };

    minInput.addEventListener("input", syncRange);
    maxInput.addEventListener("input", syncRange);

    syncRange();
}

function nextRun() {
    clearGates();
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
function handleYChange(value) {
    const min = parseFloat(ySlider.min);
    const max = parseFloat(ySlider.max);
    const clamped = clampNumber(value, min, max);
    ySlider.value = clamped;
    yInput.value = clamped;
    setRocketFromCenter(parseInt(clamped));
}

function handleSlopeChange(value) {
    const min = parseFloat(slopeSlider.min);
    const max = parseFloat(slopeSlider.max);
    const clamped = clampNumber(value, min, max);
    slopeSlider.value = clamped;
    slopeInput.value = clamped;
    slope = clamped;
}

function handleQuadChange(value) {
    const min = parseFloat(quadSlider.min);
    const max = parseFloat(quadSlider.max);
    const clamped = clampNumber(value, min, max);
    quadSlider.value = clamped;
    quadInput.value = clamped;
    quad = clamped;
}

function handleCubicChange(value) {
    const min = parseFloat(cubicSlider.min);
    const max = parseFloat(cubicSlider.max);
    const clamped = clampNumber(value, min, max);
    cubicSlider.value = clamped;
    cubicInput.value = clamped;
    cubic = clamped;
}

ySlider.oninput = () => handleYChange(parseFloat(ySlider.value));
yInput.oninput = () => handleYChange(parseFloat(yInput.value));

slopeSlider.oninput = () => handleSlopeChange(parseFloat(slopeSlider.value));
slopeInput.oninput = () => handleSlopeChange(parseFloat(slopeInput.value));

quadSlider.oninput = () => handleQuadChange(parseFloat(quadSlider.value));
quadInput.oninput = () => handleQuadChange(parseFloat(quadInput.value));

cubicSlider.oninput = () => handleCubicChange(parseFloat(cubicSlider.value));
cubicInput.oninput = () => handleCubicChange(parseFloat(cubicInput.value));

setupRangeLimits({
    slider: ySlider,
    minInput: yMinInput,
    maxInput: yMaxInput,
    valueInput: yInput,
    onValueUpdated: handleYChange,
});

setupRangeLimits({
    slider: slopeSlider,
    minInput: slopeMinInput,
    maxInput: slopeMaxInput,
    valueInput: slopeInput,
    onValueUpdated: handleSlopeChange,
});

setupRangeLimits({
    slider: quadSlider,
    minInput: quadMinInput,
    maxInput: quadMaxInput,
    valueInput: quadInput,
    onValueUpdated: handleQuadChange,
});

setupRangeLimits({
    slider: cubicSlider,
    minInput: cubicMinInput,
    maxInput: cubicMaxInput,
    valueInput: cubicInput,
    onValueUpdated: handleCubicChange,
});

rocketSizeSlider.oninput = () => {
    setRocketSize(parseFloat(rocketSizeSlider.value));
};
rocketSizeInput.oninput = () => {
    let v = parseFloat(rocketSizeInput.value);
    if (isNaN(v)) v = rocketSize;
    setRocketSize(v);
};
rocketSizeSetBtn.onclick = () => {
    rocketSizeLocked = true;
    if (rocketSizeLabel) rocketSizeLabel.remove();
    rocketSizeSlider.remove();
    rocketSizeSetBtn.remove();
    updateRocketSizeControls();
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
makePanelDraggable(savedLevelsPanel);
initializeCollapsible(topControlsPanel);
initializeCollapsible(gateControlsPanel);
initializeCollapsible(savedLevelsPanel);

window.addEventListener("resize", () => {
    [topControlsPanel, gateControlsPanel, savedLevelsPanel].forEach(panel => {
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
restartBtn.onclick = () => nextIteration();
nextBtn.onclick = () => nextRun();

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
    updateGateStrokesForZoom();
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

function updateGateStrokesForZoom() {
    const lineGroup = gateSvg.querySelector('[data-role="gate-lines"]');
    if (!lineGroup) return;

    const strokeWidth = getGateStrokeWidthForZoom(zoom);
    lineGroup.setAttribute("stroke-width", strokeWidth);
}

function getGateStrokeWidthForZoom(zoomLevel) {
    return GATE_BASE_STROKE_WIDTH / zoomLevel;
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
    if (!trailPathData) {
        trailPathData = `M ${x1} ${y1}`;
    }

    trailPathData += ` L ${x2} ${y2}`;
    trailPath.setAttribute("d", trailPathData);
}

// ROTATION
function rotateRocket(dir) {
    if (inFlight || frozen) return;
    facing = dir;
    rocketAngle = dir === "right" ? 90 : -90;
    updateRocketTransform();
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

    lastTrailX = rocketX + rocket.clientWidth / 2;
    lastTrailY = rocketY + rocket.clientHeight / 2;

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
