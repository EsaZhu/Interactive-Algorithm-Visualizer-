// Track tree state
let nodeExists = new Array(15).fill(false); // Index 0 = root, etc.
let showingPreview = false;

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

function showChildOptions(parentIndex) {
    const leftChildIndex = (parentIndex * 2) + 1;
    const rightChildIndex = (parentIndex * 2) + 2;

    // Check if we're exceeding our array bounds
    if (leftChildIndex >= nodeExists.length) {
        console.log("Tree is at maximum size");
        return;
    }

    const childLevel = getNodeLevel(leftChildIndex);

    // Create or get the level element
    let levelElement = document.getElementById(`level-${childLevel}`);
    if (!levelElement) {
        levelElement = document.createElement('div');
        levelElement.className = 'tree-level';
        levelElement.id = `level-${childLevel}`;

        // Insert in correct order (levels should be in order)
        const container = document.querySelector('.tree-container');
        const existingLevels = container.querySelectorAll('.tree-level');
        let inserted = false;

        existingLevels.forEach(level => {
            const levelNum = parseInt(level.id.split('-')[1]);
            if (childLevel < levelNum && !inserted) {
                container.insertBefore(levelElement, level);
                inserted = true;
            }
        });

        if (!inserted) {
            container.appendChild(levelElement);
        }
    }

    // Add preview nodes
    if (!nodeExists[leftChildIndex]) {
        createPreviewNode(leftChildIndex, levelElement, 'left');
    }

    if (rightChildIndex < nodeExists.length && !nodeExists[rightChildIndex]) {
        createPreviewNode(rightChildIndex, levelElement, 'right');
    }

    showingPreview = true;
}

function createPreviewNode(index, parentLevel, position) {
    const previewNode = document.createElement('div');
    previewNode.className = 'tree-node preview';
    previewNode.id = `preview-${index}`;
    previewNode.setAttribute('data-position', position); // Help identify left vs right

    // Add click event to create actual node
    previewNode.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        createActualNode(index, position);
    });

    parentLevel.appendChild(previewNode);
}

function createActualNode(index, position) {
    // Find the preview node
    const previewNode = document.getElementById(`preview-${index}`);
    const childLevel = getNodeLevel(index);
    const levelElement = document.getElementById(`level-${childLevel}`);

    if (!levelElement) {
        console.error(`Level element level-${childLevel} not found`);
        return;
    }

    // Create actual node
    const actualNode = document.createElement('div');
    actualNode.className = 'tree-node';
    actualNode.id = `node-${index}`;
    actualNode.setAttribute('data-position', position);

    // Insert actual node in the correct position
    if (previewNode && previewNode.parentNode === levelElement) {
        // If preview node exists and is a child of the correct level, replace it
        levelElement.insertBefore(actualNode, previewNode.nextSibling);
        previewNode.remove(); // Remove the preview node after inserting actualNode
    } else {
        // If no preview node, position relative to parent node
        const parentIndex = getParentIndex(index);
        const parentNode = parentIndex !== null ? document.getElementById(`node-${parentIndex}`) : null;

        if (parentNode && levelElement) {
            // Find all nodes in the current level
            const siblingNodes = Array.from(levelElement.querySelectorAll('.tree-node:not(.preview)'))
                .filter(node => node.id.startsWith('node-'))
                .map(node => parseInt(node.id.split('-')[1]));

            // Determine insertion point
            const leftChildIndex = parentIndex * 2 + 1;
            const rightChildIndex = parentIndex * 2 + 2;

            if (position === 'left') {
                // Insert as first child of parent (before right child if it exists)
                const rightChildNode = rightChildIndex < nodeExists.length ? document.getElementById(`node-${rightChildIndex}`) : null;
                if (rightChildNode) {
                    levelElement.insertBefore(actualNode, rightChildNode);
                } else {
                    levelElement.appendChild(actualNode);
                }
            } else {
                // Insert as last child of parent
                levelElement.appendChild(actualNode);
            }
        } else {
            // Fallback: append to level
            levelElement.appendChild(actualNode);
        }
    }

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

    console.log(`Created ${position} node at index ${index} in level ${childLevel}`);
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