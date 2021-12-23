const canvasSketch = require("canvas-sketch");
const Random = require("canvas-sketch-util/random");
const { linspace, lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");

// You can force a specific seed by replacing this with a string value
const defaultSeed = "";

// Set a random seed so we can reproduce this print later
Random.setSeed(defaultSeed || Random.getRandomSeed());

// Print to console so we can see which seed is being used and copy it if desired
console.log("Random Seed:", Random.getSeed());

const settings = {
  hotkeys: false,
  suffix: Random.getSeed(),
  dimensions: "letter",
  orientation: "portrait",
  pixelsPerInch: 300,
  units: "cm",
};

const foreground = "hsl(345, 100%, 50%)";

const palette = [
  hexToHSL("#264653"),
  hexToHSL("#2a9d8f"),
  hexToHSL("#e9c46a"),
  hexToHSL("#f4a261"),
  hexToHSL("#e76f51"),
];

const sketch = ({ width, height }) => {
  // page settings
  const margin = 2;
  const pointCount = 50;
  const background = "hsl(0, 0%, 98%)";

  // segment settings
  const frequency = 0.6;
  const alpha = 0.5;

  // Create some flat data structure worth of points
  let x = 0;
  let y = 0;
  let c = 0;
  const points = Array.from(new Array(pointCount)).map(() => {
    if (c % 2 == 0) {
      x += random.value() % 2;
    } else {
      y += random.value() % 2;
    }
    return {
      position: [x, y],
      size: Math.abs(random.gaussian()),
    };
  });

  return ({ context, width, height }) => {
    // Fill the canvas
    context.fillStyle = background;
    context.globalAlpha = 1;
    context.fillRect(0, 0, width, height);

    // draw grid
    points.forEach(({ position, size }) => {
      radius = size * width * 0.06;
      const [u, v] = position;
      context.lineWidth = 0.9;

      // scale to inner size
      let x = lerp(margin, width - margin, u);
      let y = lerp(margin, height - margin, v);

      // draw cell
      context.globalAlpha = alpha;
      context.strokeStyle = foreground;

      // get a random angle from noise
      const n = Random.noise2D(u * 2 - 1, v * 2 - 1, frequency);

      context.fillStyle = "hsl(0, 0%, 15%)";
      context.strokeStyle = random.pick(palette);
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2, false);
      context.stroke();
    });
  };
};

function hexToHSL(H) {
  // Convert hex to RGB first
  let r = 0,
    g = 0,
    b = 0;
  if (H.length == 4) {
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length == 7) {
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  if (delta == 0) h = 0;
  else if (cmax == r) h = ((g - b) / delta) % 6;
  else if (cmax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return "hsl(" + h + "," + s + "%," + l + "%)";
}

canvasSketch(sketch, settings);
