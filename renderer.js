const { ipcRenderer } = require("electron");

// Canvas and context
const canvas = document.getElementById("bug");
const ctx = canvas.getContext("2d");

// Adjust canvas to window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Disable smoothing so pixels look sharp
ctx.imageSmoothingEnabled = false;

// Load sprite
const sprite = new Image();
sprite.src = "./Beetle.png"; // replace with your sprite

// Spritesheet properties
const frameCols = 4;
const frameRows = 1;
const frameWidth = 32;
const frameHeight = 32;
const frameCount = 4;

// Flag to control animation
let animationActive = true;

// Array of bugs
const bugs = [];

// Create a bug
function createBug() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    dx: (Math.random() - 0.5) * 4,
    dy: (Math.random() - 0.5) * 4,
    frameIndex: 0,
    frameSpeed: 10,
    frameTicker: 0,
    scale: 4,
  };
}

// First bug
setTimeout(() => {
  bugs.push(createBug());
}, 180000); // 3 minutes

// Draw all bugs
function drawBugs() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bugs.forEach((b) => {
    const col = b.frameIndex % frameCols;
    const row = 0; // only first row
    const sx = col * frameWidth;
    const sy = row * frameHeight;

    ctx.drawImage(
      sprite,
      sx,
      sy,
      frameWidth,
      frameHeight,
      b.x,
      b.y,
      frameWidth * b.scale,
      frameHeight * b.scale
    );
  });
}

// Update bugs
function updateBugs() {
  bugs.forEach((b) => {
    b.x += b.dx;
    b.y += b.dy;

    // Bounce on edges
    if (b.x < 0 || b.x > canvas.width - frameWidth * b.scale) b.dx *= -1;
    if (b.y < 0 || b.y > canvas.height - frameHeight * b.scale) b.dy *= -1;

    // Animate frames
    b.frameTicker++;
    if (b.frameTicker >= b.frameSpeed) {
      b.frameIndex = (b.frameIndex + 1) % frameCount;
      b.frameTicker = 0;
    }
  });
}

// Main animation
function animate() {
  if (!animationActive) return; // stop animation if flag is false
  updateBugs();
  drawBugs();
  requestAnimationFrame(animate);
}

// Multiply bugs
function multiplyBugs() {
  const newBugs = bugs.map(() => createBug());
  bugs.push(...newBugs);
}
setInterval(() => {
  if (animationActive) multiplyBugs();
}, 180000); // 180,000 ms = 3 minutes

// Listen for message from main.js to stop bugs
ipcRenderer.on("detener-bichos", () => {
  animationActive = false;
});

// Start animation when sprite loads
sprite.onload = () => {
  animate();
};
