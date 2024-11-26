// Rymentz
// MIT License

const canvas = document.getElementById('kaspaCanvas');
const ctx = canvas.getContext('2d');
const bpsSlider = document.getElementById('bpsSlider');
const bpsValue = document.getElementById('bpsValue');
const subtitleDisplay = document.getElementById('subtitle');

const PADDING = 20; // Espace minimal depuis les bords
const NODE_SPREAD = 40; // Distance maximale verticale entre parent et enfant

class Block {
    constructor(x, y, parent) {
        this.x = x;
        this.y = y;
        this.parent = parent;
        this.children = [];
        this.color = 'rgba(41, 128, 185, 1)';
        this.speed = 0.5 + Math.random() * 0.5;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        this.drawLinks();
    }

    drawLinks() {
        if (this.parent) {
            this.drawLink(this.parent);
        }
        this.children.forEach(child => {
            this.drawLink(child);
        });
    }

    drawLink(otherBlock) {
        if (this.x >= 0 || otherBlock.x >= 0) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(otherBlock.x, otherBlock.y);
            ctx.strokeStyle = 'rgba(189, 195, 199, 0.4)';
            ctx.stroke();
            ctx.closePath();
        }
    }

    update() {
        this.x -= this.speed;
        if (this.x < 0) {
            this.color = 'rgba(41, 128, 185, 0.2)';
        }
    }
}

let blocks = [];
const genesisBlock = new Block(canvas.width - 50, canvas.height / 2, null);
blocks.push(genesisBlock);

let blocksCreated = 0;
let lastSecond = Date.now();
let targetBPS = 9;
let blockInterval;

function getValidYPosition(parentY) {
    // Calculer une position Y aléatoire dans les limites de la fenêtre
    const minY = Math.max(PADDING, parentY - NODE_SPREAD);
    const maxY = Math.min(canvas.height - PADDING, parentY + NODE_SPREAD);
    return Math.random() * (maxY - minY) + minY;
}

function createNewBlock() {
    const parentIndices = [];
    for (let i = 0; i < 3; i++) {
        const index = blocks.length - 1 - Math.floor(Math.random() * Math.min(15, blocks.length));
        if (index >= 0 && !parentIndices.includes(index)) {
            parentIndices.push(index);
        }
    }

    if (parentIndices.length === 0) return;

    const mainParent = blocks[parentIndices[0]];
    const newY = getValidYPosition(mainParent.y);
    
    const newBlock = new Block(
        canvas.width - 50,
        newY,
        mainParent
    );

    parentIndices.forEach(index => {
        const parent = blocks[index];
        parent.children.push(newBlock);
    });

    blocks.push(newBlock);
    blocksCreated++;
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    blocks.forEach(block => {
        block.update();
        block.draw();
    });

    const now = Date.now();
    const elapsed = now - lastSecond;

    blocks = blocks.filter(block => block.x >= -50);

    if (elapsed >= 1000) {
        subtitleDisplay.textContent = `BPS: ${blocksCreated}`;
        blocksCreated = 0;
        lastSecond = now;
    }

    requestAnimationFrame(animate);
}

bpsSlider.addEventListener('input', function() {
    targetBPS = parseInt(this.value);
    bpsValue.textContent = targetBPS;
    
    if (blockInterval) {
        clearInterval(blockInterval);
    }
    
    const interval = 1000 / targetBPS;
    blockInterval = setInterval(createNewBlock, interval);
});

blockInterval = setInterval(createNewBlock, 1000 / targetBPS);
requestAnimationFrame(animate);