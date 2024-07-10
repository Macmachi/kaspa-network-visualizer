// By Arnaud R. 
const canvas = document.getElementById('kaspaCanvas');
const ctx = canvas.getContext('2d');
const bpsSlider = document.getElementById('bpsSlider');
const bpsValue = document.getElementById('bpsValue');
const subtitleDisplay = document.getElementById('subtitle');

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

        // Dessiner les liens vers les parents
        this.drawLinks();
    }

    drawLinks() {
        if (this.parent) {
            this.drawLink(this.parent);
        }
        // Dessiner les liens vers les enfants
        this.children.forEach(child => {
            this.drawLink(child);
        });
    }

    drawLink(otherBlock) {
        // Vérifier si l'un des blocs est encore visible
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
const genesisBlock = new Block(canvas.width - 50, 300, null);
blocks.push(genesisBlock);

let blocksCreated = 0;
let lastSecond = Date.now();
let targetBPS = 9;
let lastBlockCreation = 0;

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
    const newBlock = new Block(
        canvas.width - 50,
        Math.max(10, Math.min(canvas.height - 10, mainParent.y + (Math.random() * 160 - 80))),
        mainParent
    );

    parentIndices.forEach(index => {
        const parent = blocks[index];
        parent.children.push(newBlock);
    });

    blocks.push(newBlock);
    blocksCreated++;
}

function animate(currentTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    blocks.forEach(block => {
        block.update();
        block.draw();
    });

    const now = Date.now();
    const elapsed = now - lastSecond;

    if (currentTime - lastBlockCreation > 1000 / targetBPS) {
        createNewBlock();
        lastBlockCreation = currentTime;
    }

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
});

requestAnimationFrame(animate);