// Track tree state
let nodeExists = new Array(15).fill(false); // Index 0 = root, etc.
let showingPreview = false;

//dynamic expanding
function expandArrayIfNeeded(requiredIndex) {
    if (requiredIndex >= nodeExists.length) {
        // Double the array size or expand to accommodate the required index
        const newSize = Math.max(nodeExists.length * 2, requiredIndex + 10);
        const oldLength = nodeExists.length;

        nodeExists.length = newSize;
        // Fill new positions with false
        for (let i = oldLength; i < newSize; i++) {
            nodeExists[i] = false;
        }

        console.log(`Expanded array from ${oldLength} to ${newSize} nodes`);
    }
}

function updateContainerHeight() {
    const maxLevel = Math.max(...nodeExists.map((exists, index) =>
        exists || index === 0 ? getNodeLevel(index) : -1
    ));

    const requiredHeight = (maxLevel + 1) * TREE_CONFIG.levelHeight + 100; // Extra padding
    const container = document.querySelector('.tree-container');

    if (requiredHeight > container.offsetHeight) {
        container.style.height = requiredHeight + 'px';
    }
}


// Helper function to calculate node level
function getNodeLevel(index) {
    if (index === 0) return 0; // Root is level 0
    return Math.floor(Math.log2(index + 1));
}

// Helper function to get parent index
function getParentIndex(index) {
    if (index === 0) return null; // Root has no parent
    return Math.floor((index - 1) / 2);
}

// Helper function to get all nodes on a level
function getNodesOnLevel(level) {
    const startIndex = Math.pow(2, level) - 1;
    const endIndex = Math.pow(2, level + 1) - 2;
    return { startIndex, endIndex };
}

// Configuration for tree layout
const TREE_CONFIG = {
    nodeWidth: 60,
    nodeHeight: 60,
    levelHeight: 100,
    baseSpacing: 200,
    minSpacing: 80, // Minimum space between nodes
    containerPadding: 50 // Padding from container edges
};



// Calculate spacing that prevents collisions
function calculateOptimalSpacing(level, containerWidth) {
    const nodesOnLevel = Math.pow(2, level);

    if (level === 0) return 0; // Root has no siblings

    // Calculate maximum possible spacing
    const availableWidth = containerWidth - (2 * TREE_CONFIG.containerPadding);
    const maxSpacing = (availableWidth - (nodesOnLevel * TREE_CONFIG.nodeWidth)) / (nodesOnLevel - 1);

    // Use base spacing divided by level, but not less than minimum
    const idealSpacing = TREE_CONFIG.baseSpacing / Math.pow(2, level - 1);

    // Return the smaller of ideal or maximum possible, but at least minimum
    return Math.max(TREE_CONFIG.minSpacing, Math.min(idealSpacing, maxSpacing));
}



// Calculate the X position for a node based on its parent
function calculateNodeX(nodeIndex, containerWidth) {
    if (nodeIndex === 0) {
        // Root node - center it
        return (containerWidth - TREE_CONFIG.nodeWidth) / 2;
    }

    const parentIndex = getParentIndex(nodeIndex);
    const parentX = calculateNodeX(parentIndex, containerWidth);

    // Determine if this is left or right child
    const isLeftChild = (nodeIndex % 2 === 1);
    const level = getNodeLevel(nodeIndex);

    // Use optimal spacing for this level
    const horizontalOffset = calculateOptimalSpacing(level, containerWidth);

    if (isLeftChild) {
        return Math.max(TREE_CONFIG.containerPadding, parentX - horizontalOffset);
    } else {
        return Math.min(containerWidth - TREE_CONFIG.nodeWidth - TREE_CONFIG.containerPadding, parentX + horizontalOffset);
    }
}

// Calculate the Y position for a node
function calculateNodeY(nodeIndex) {
    const level = getNodeLevel(nodeIndex);
    return level * TREE_CONFIG.levelHeight;
}

const inputField = document.querySelector('input[type="text"]');
const rootNode = document.getElementById('node-0');

rootNode.addEventListener('click', function(e) {
    e.stopPropagation();
    console.log('Root node clicked!');
    if (!showingPreview) {
        showChildOptions(0);
    } else {
        hideChildOptions();
    }
});

// Function to rearrange all existing nodes when tree grows
function rearrangeAllNodes() {
    const containerWidth = document.querySelector('.tree-container').offsetWidth;

    // Get all existing nodes
    for (let i = 0; i < nodeExists.length; i++) {
        if (nodeExists[i] || i === 0) {
            const nodeElement = document.getElementById(`node-${i}`);
            if (nodeElement) {
                const x = calculateNodeX(i, containerWidth);
                const y = calculateNodeY(i);

                // Animate the movement (optional)
                nodeElement.style.transition = 'left 0.3s ease-in-out';
                nodeElement.style.left = x + 'px';
                nodeElement.style.top = y + 'px';
            }
        }
    }

    // Remove transition after animation
    setTimeout(() => {
        document.querySelectorAll('.tree-node').forEach(node => {
            node.style.transition = '';
        });
    }, 300);
}

function showChildOptions(parentIndex) {
    const leftChildIndex = (parentIndex * 2) + 1;
    const rightChildIndex = (parentIndex * 2) + 2;

    // Expand array if needed
    expandArrayIfNeeded(rightChildIndex);

    // Add preview nodes directly
    if (!nodeExists[leftChildIndex]) {
        createPreviewNode(leftChildIndex, null, 'left');
    }

    if (!nodeExists[rightChildIndex]) {
        createPreviewNode(rightChildIndex, null, 'right');
    }

    showingPreview = true;
}



function createPreviewNode(index, parentLevel, position) {
    const previewNode = document.createElement('div');
    previewNode.className = 'tree-node preview';
    previewNode.id = `preview-${index}`;
    previewNode.setAttribute('data-position', position);

    // Calculate position based on parent
    const containerWidth = document.querySelector('.tree-container').offsetWidth;
    const x = calculateNodeX(index, containerWidth);
    const y = calculateNodeY(index);

    previewNode.style.left = x + 'px';
    previewNode.style.top = y + 'px';

    // Add to tree container (not to level)
    document.querySelector('.tree-container').appendChild(previewNode);

    // Add click event to create actual node
    previewNode.addEventListener('click', function(e) {
        e.stopPropagation();
        createActualNode(index, position);
    });
}

function createActualNode(index, position) {
    // Find and remove the preview node
    const previewNode = document.getElementById(`preview-${index}`);
    if (previewNode) {
        previewNode.remove();
    }

    // Create actual node
    const actualNode = document.createElement('div');
    actualNode.className = 'tree-node';
    actualNode.id = `node-${index}`;
    actualNode.setAttribute('data-position', position);

    // Calculate position based on parent
    const containerWidth = document.querySelector('.tree-container').offsetWidth;
    const x = calculateNodeX(index, containerWidth);
    const y = calculateNodeY(index);

    actualNode.style.left = x + 'px';
    actualNode.style.top = y + 'px';

    // Add to tree container (not to level)
    document.querySelector('.tree-container').appendChild(actualNode);

    // Add click event to actual node
    actualNode.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log(`Node ${index} clicked!`);
        if (!showingPreview) {
            showChildOptions(index);
        } else {
            hideChildOptions();
        }
    });

    // Mark as existing
    nodeExists[index] = true;

    console.log(`Created ${position} node at index ${index}`);

    // Update container height if needed
    updateContainerHeight();

    // Rearrange all nodes to prevent collisions
    rearrangeAllNodes();

    // Hide all preview nodes after creating actual node
    hideChildOptions();
}

function hideChildOptions() {
    // Remove all preview nodes
    const previewNodes = document.querySelectorAll('.tree-node.preview');
    previewNodes.forEach(node => node.remove());
    showingPreview = false;
}

inputField.addEventListener('input', function() {
    const inputValue = inputField.value.trim();
    if (inputValue) {
        const numbers = inputValue.split(',').map(num => num.trim()).filter(num => num !== '');
        populateTreeWithNumbers(numbers);
    } else {
        clearAllNodes();
    }
});

function populateTreeWithNumbers(numbers) {
    for (let i = 0; i < nodeExists.length; i++) {
        if (nodeExists[i] || i === 0) {
            const nodeElement = document.getElementById(`node-${i}`);
            if (nodeElement && numbers[i] !== undefined) {
                nodeElement.textContent = numbers[i];
            } else if (nodeElement) {
                nodeElement.textContent = '';
            }
        }
    }
}

function clearAllNodes() {
    for (let i = 0; i < nodeExists.length; i++) {
        if (nodeExists[i] || i === 0) {
            const nodeElement = document.getElementById(`node-${i}`);
            if (nodeElement) {
                nodeElement.textContent = '';
            }
        }
    }
}


// Position root node when page loads
window.addEventListener('load', function() {
    const rootNode = document.getElementById('node-0');
    const containerWidth = document.querySelector('.tree-container').offsetWidth;

    const x = calculateNodeX(0, containerWidth);
    const y = calculateNodeY(0);

    rootNode.style.left = x + 'px';
    rootNode.style.top = y + 'px';
    rootNode.style.position = 'absolute';

    nodeExists[0] = true;
});

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        rearrangeAllNodes();
    }, 250); // Debounce resize events
});