// Track tree state
let nodeExists = [false, false, false, false, false, false, false]; // Index 0 = root, etc.
let showingPreview = false;

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
    // For root node (index 0), children are at indices 1 and 2
    const leftChildIndex = (parentIndex * 2) + 1;
    const rightChildIndex = (parentIndex * 2) + 2;

    // Create level 1 if it doesn't exist
    let level1 = document.getElementById('level-1');
    if (!level1) {
        level1 = document.createElement('div');
        level1.className = 'tree-level';
        level1.id = 'level-1';
        document.querySelector('.tree-container').appendChild(level1);
    }

    // Create left child preview
    if (!nodeExists[leftChildIndex]) {
        createPreviewNode(leftChildIndex, level1);
    }

    // Create right child preview
    if (!nodeExists[rightChildIndex]) {
        createPreviewNode(rightChildIndex, level1);
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
    const level1 = document.getElementById('level-1');

    // Create actual node
    const actualNode = document.createElement('div');
    actualNode.className = 'tree-node';
    actualNode.id = `node-${index}`;
    actualNode.setAttribute('data-position', position);

    // Insert actual node in the correct position
    if (previewNode && previewNode.parentNode === level1) {
        // If preview node exists and is a child of level1, replace it in its exact position
        level1.insertBefore(actualNode, previewNode.nextSibling);
        previewNode.remove(); // Remove the preview node after inserting actualNode
    } else {
        // If no preview node or it's not in level1, use the original positioning logic
        if (position === 'left') {
            level1.insertAdjacentElement('afterbegin', actualNode);
        } else {
            level1.appendChild(actualNode);
        }
    }

    actualNode.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log(`Node ${index} clicked!`);
        // TODO: Add child creation logic here later
    });

    // Mark as existing
    nodeExists[index] = true;

    console.log(`Created ${position} node at index ${index}`);
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
        // Parse the input into numbers
        const numbers = inputValue.split(',').map(num => num.trim()).filter(num => num !== '');

        // Fill all existing nodes with numbers
        populateTreeWithNumbers(numbers);
    } else {
        // Clear all nodes if input is empty
        clearAllNodes();
    }
});

function populateTreeWithNumbers(numbers) {
    // Go through all possible node positions
    for (let i = 0; i < nodeExists.length; i++) {
        if (nodeExists[i] || i === 0) { // Include root (index 0) even if not marked as existing
            const nodeElement = document.getElementById(`node-${i}`);
            if (nodeElement && numbers[i] !== undefined) {
                nodeElement.textContent = numbers[i];
            } else if (nodeElement) {
                nodeElement.textContent = ''; // Clear if no number available
            }
        }
    }
}

function clearAllNodes() {
    // Clear text from all existing nodes
    for (let i = 0; i < nodeExists.length; i++) {
        if (nodeExists[i] || i === 0) {
            const nodeElement = document.getElementById(`node-${i}`);
            if (nodeElement) {
                nodeElement.textContent = '';
            }
        }
    }
}