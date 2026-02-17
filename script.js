// --- Configuration & State ---
const CONFIG = {
    nodeRadius: 30, // half of width
    levelHeight: 80,
    containerPadding: 40
};

// Global state
let treeValues = []; // Stores the actual numbers (including nulls if we wanted sparse trees, but we stick to complete trees for heaps)
let currentHeapMode = null; // 'min' | 'max' | null

// --- DOM Elements ---
const container = document.getElementById('tree-container');
const svgLayer = document.getElementById('tree-svg');
const inputField = document.getElementById('array-input');
const minHeapBtn = document.getElementById('min-heap-btn');
const maxHeapBtn = document.getElementById('max-heap-btn');

// --- Initialization ---
window.addEventListener('resize', debounce(() => {
    renderTree(false); // Re-render without re-reading input to keep edit state
}, 300));

inputField.addEventListener('input', (e) => {
    parseInputAndRender(e.target.value);
});

minHeapBtn.addEventListener('click', () => {
    setHeapMode('min');
});

maxHeapBtn.addEventListener('click', () => {
    setHeapMode('max');
});

// --- Core Logic ---

function setHeapMode(mode) {
    currentHeapMode = mode;

    // UI Feedback
    minHeapBtn.classList.toggle('active', mode === 'min');
    maxHeapBtn.classList.toggle('active', mode === 'max');

    // Perform Sort
    if (treeValues.length > 0) {
        buildHeap(mode);
        renderTree(false); // Re-render, don't read from Input
        updateInputField(); // Sync input box with sorted array
    }
}

function parseInputAndRender(inputValue) {
    currentHeapMode = null; // Reset heap mode on manual input typing
    minHeapBtn.classList.remove('active');
    maxHeapBtn.classList.remove('active');

    const trimmed = inputValue.trim();
    if (!trimmed) {
        treeValues = [];
    } else {
        // Filter out non-numbers and empty strings
        treeValues = trimmed.split(',')
            .map(x => x.trim())
            .filter(x => x !== '' && !isNaN(x))
            .map(Number);

        // Limit to 100 nodes for performance
        if(treeValues.length > 100) treeValues.length = 100;
    }
    renderTree(false);
}

function updateInputField() {
    inputField.value = treeValues.join(', ');
}

// --- Heap Algorithms ---

function buildHeap(type) {
    // Start from the last non-leaf node and heapify down
    const startIdx = Math.floor(treeValues.length / 2) - 1;

    for (let i = startIdx; i >= 0; i--) {
        heapifyDown(i, treeValues.length, type);
    }
}

function heapifyDown(index, size, type) {
    let extreme = index;
    const left = 2 * index + 1;
    const right = 2 * index + 2;

    // Compare with Left Child
    if (left < size) {
        if (type === 'min' && treeValues[left] < treeValues[extreme]) {
            extreme = left;
        } else if (type === 'max' && treeValues[left] > treeValues[extreme]) {
            extreme = left;
        }
    }

    // Compare with Right Child
    if (right < size) {
        if (type === 'min' && treeValues[right] < treeValues[extreme]) {
            extreme = right;
        } else if (type === 'max' && treeValues[right] > treeValues[extreme]) {
            extreme = right;
        }
    }

    // If swap needed
    if (extreme !== index) {
        [treeValues[index], treeValues[extreme]] = [treeValues[extreme], treeValues[index]];
        heapifyDown(extreme, size, type);
    }
}

// Used when value is updated via click
function restoreHeapProperty() {
    if (!currentHeapMode) return;
    buildHeap(currentHeapMode);
    renderTree(false);
    updateInputField();
}

// --- Rendering Logic ---

function renderTree(readFromInput = true) {
    // 1. cleanup
    container.querySelectorAll('.tree-node').forEach(el => el.remove());
    svgLayer.innerHTML = ''; // Clear arrows

    // Define marker for arrowheads
    svgLayer.innerHTML = `
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7"
            refX="28" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
            </marker>
        </defs>
    `;

    if (treeValues.length === 0) return;

    // 2. Geometry calculations
    const depth = Math.floor(Math.log2(treeValues.length));
    const containerWidth = container.offsetWidth;

    // Ensure container is large enough for the deepest level
    // Max nodes at deepest level = 2^depth
    const requiredWidth = Math.pow(2, depth) * 70 + CONFIG.containerPadding * 2;

    // Use the larger of the two widths
    const effectiveWidth = Math.max(containerWidth, requiredWidth);

    // Update container height dynamically
    const requiredHeight = (depth + 1) * CONFIG.levelHeight + 100;
    container.style.height = `${requiredHeight}px`;

    // 3. Draw Nodes and Lines
    treeValues.forEach((value, index) => {
        const { x, y } = calculatePosition(index, effectiveWidth);

        // Create Node
        const nodeEl = document.createElement('div');
        nodeEl.className = 'tree-node';
        nodeEl.id = `node-${index}`;
        nodeEl.style.left = `${x}px`;
        nodeEl.style.top = `${y}px`;
        nodeEl.textContent = value;

        // Click to Edit
        nodeEl.addEventListener('click', (e) => handleNodeClick(index, e));

        container.appendChild(nodeEl);

        // Draw connection to parent (if not root)
        if (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parentPos = calculatePosition(parentIndex, effectiveWidth);
            drawArrow(parentPos.x, parentPos.y, x, y);
        }
    });
}

function calculatePosition(index, width) {
    const level = Math.floor(Math.log2(index + 1));
    const maxNodesInLevel = Math.pow(2, level);
    const indexInLevel = index - (Math.pow(2, level) - 1);

    // Divide the width into equal slices for the current level
    const partitionWidth = width / maxNodesInLevel;

    // Center the node within its partition
    const x = (indexInLevel * partitionWidth) + (partitionWidth / 2) - CONFIG.nodeRadius;
    const y = (level * CONFIG.levelHeight) + CONFIG.containerPadding;

    return { x, y };
}

function drawArrow(x1, y1, x2, y2) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    // Offset centers by radius so line starts/ends at center of node div
    const offset = CONFIG.nodeRadius;

    line.setAttribute("x1", x1 + offset);
    line.setAttribute("y1", y1 + offset);
    line.setAttribute("x2", x2 + offset);
    line.setAttribute("y2", y2 + offset);
    line.setAttribute("marker-end", "url(#arrowhead)");

    svgLayer.appendChild(line);
}

// --- Interaction Logic ---

function handleNodeClick(index, event) {
    event.stopPropagation();
    const nodeEl = document.getElementById(`node-${index}`);

    // If already editing, do nothing
    if (nodeEl.querySelector('input')) return;

    const currentValue = treeValues[index];
    nodeEl.textContent = '';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    input.className = 'node-input';

    // Auto-focus and select text
    nodeEl.appendChild(input);
    input.focus();
    input.select();

    // Confirm edit on Enter or Blur
    const confirmEdit = () => {
        const newValue = parseInt(input.value.trim());

        if (!isNaN(newValue)) {
            treeValues[index] = newValue;
            updateInputField(); // Sync top input

            if (currentHeapMode) {
                // If in heap mode, re-sort immediately
                restoreHeapProperty();
            } else {
                // Just update visual text
                nodeEl.textContent = newValue;
                // Re-render to be safe (remove input)
                renderTree(false);
            }
        } else {
            // Revert if invalid
            nodeEl.textContent = currentValue;
        }
    };

    input.addEventListener('blur', confirmEdit);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            input.blur(); // Triggers blur event
        }
    });
}

// --- Utilities ---

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}