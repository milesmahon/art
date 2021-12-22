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

// blues
const line_palette = [
  "#7400b8",
  "#6930c3",
  "#5e60ce",
  "#5390d9",
  "#4ea8de",
].map((x) => hexToHSL(x));

const sketch = ({ width, height }) => {
  const pageSize = Math.min(width, height);

  // page settings
  const margin = pageSize * 0.1;
  const gridSize = 50;
  const background = "hsl(0, 0%, 98%)";

  // segment settings
  const length = pageSize * 0.03;
  // bigger = more graphic
  const lineWidth = pageSize * 0.1;
  // low frequency = more regular waves, higher = more random
  const frequency = 0.1;
  // transparency
  const alpha = 0.2;

  // Create some flat data structure worth of points
  const cells = linspace(gridSize, false)
    .map((v) => {
      return linspace(gridSize, false).map((u) => {
        return [u, v];
      });
    })
    .flat();

  const pointCount = 100;
  const points = Array.from(new Array(pointCount)).map(() => {
    return {
      position: [random.value(), random.value()],
      size: Math.abs(random.gaussian()),
    };
  });

  return ({ context }) => {
    // Fill the canvas
    context.fillStyle = background;
    context.globalAlpha = 1;
    context.fillRect(0, 0, width, height);

    // draw grid
    const innerSize = pageSize - margin * 2;

    // lines
    cells.forEach((cell) => {
      const [u, v] = cell;

      // scale to inner size
      let x = u * innerSize;
      let y = v * innerSize;

      // center on page
      x += (width - innerSize) / 2;
      y += (height - innerSize) / 2;

      // draw cell
      context.globalAlpha = alpha;
      context.strokeStyle = foreground;

      // get a random angle from noise
      const n = Random.noise2D(u * 2 - 1, v * 2 - 1, frequency);
      const angle = n * Math.PI * 2;
      segment(
        context,
        x,
        y,
        angle,
        length,
        lineWidth,
        random.pick(line_palette)
      );
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
