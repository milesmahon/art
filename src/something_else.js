const canvasSketch = require("canvas-sketch");
const { linspace, lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");

// You can force a specific seed by replacing this with a string value
const defaultSeed = "";

// Set a random seed so we can reproduce this print later
random.setSeed(defaultSeed || random.getRandomSeed());

// Print to console so we can see which seed is being used and copy it if desired
console.log("Random Seed:", random.getSeed());

const settings = {
  hotkeys: false,
  suffix: random.getSeed(),
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
  const pointCount = 10;
  const background = "hsl(0, 0%, 98%)";

  // segment settings
  //   const frequency = 0.7;
  const alpha = 1;

  // Create some flat data structure worth of points
  let x = 0;
  let y = 0;
  let c = 0;

  // chromosomes/squid
  //   let gaussStddev = 0.1;
  //   let gaussMean = 0.01;

  let gaussStddev = 5;
  let gaussMean = 0.2;

  let gaussSizeStddev = 2;
  let gaussSizeMean = 0.1;

  const points = Array.from(new Array(pointCount)).map(() => {
    if (c % 2 == 0) {
      x = (x + random.gaussian(gaussMean, gaussStddev)) % 1;
    } else {
      y = (y + random.gaussian(gaussMean, gaussStddev)) % 1;
    }
    c++;
    return {
      position: [x, y],
      //   position: [random.value(), random.value()],
      size: Math.abs(random.gaussian(gaussSizeMean, gaussSizeStddev)),
    };
  });
  console.log(points);

  return ({ context, width, height }) => {
    // Fill the canvas
    context.fillStyle = background;
    context.globalAlpha = 1;
    context.fillRect(0, 0, width, height);

    // draw grid
    points.forEach(({ position, size }) => {
      radius = size * width * 0.05;
      const [u, v] = position;
      context.lineWidth = 0.1;

      // scale to inner size
      let x = lerp(margin, width - margin, u);
      let y = lerp(margin, height - margin, v);

      // draw cell
      context.globalAlpha = alpha;
      context.strokeStyle = foreground;

      // get a random angle from noise
      //   const n = random.noise2D(u * 2 - 1, v * 2 - 1, frequency);

      context.fillStyle = "hsl(0, 0%, 15%)";
      context.strokeStyle = random.pick(palette);
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2, true);
      context.stroke();
    });
  };
};

function segment(
  context,
  x,
  y,
  angle = 0,
  length = 1,
  lineWidth = 1,
  color = foreground
) {
  const halfLength = length / 2;
  const u = Math.cos(angle) * halfLength;
  const v = Math.sin(angle) * halfLength;

  context.strokeStyle = color;
  context.beginPath();
  context.moveTo(x - u, y - v);
  context.lineTo(x + u, y + v);
  context.lineWidth = lineWidth;
  context.stroke();
}

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
