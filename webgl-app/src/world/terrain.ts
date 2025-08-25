import * as SimplexNoise from 'simplex-noise';
import * as THREE from 'three';
import alea from 'alea';


// const SEED = '12d00003fsd';
// const SEED = '6cd651fc7243c8ef314ef185d33971b6';
const SEED = 'Sasha';
// const SEED = 'Danyil';

// Create a seeded PRNG for deterministic noise
const prng = alea(SEED);
const noise = SimplexNoise.createNoise2D(prng);

const RIVER_HEIGHT = -2;

// Define a type for custom math terrain functions
export type TerrainFunction = (x: number, z: number) => number;

// Default noise-based terrain generator
function noiseBasedTerrain(x: number, z: number): number {
  const scale = 0.05;
  const octaves = 4;
  let amplitude = 2;
  let height = 0;
  let frequency = scale;

  for (let i = 0; i < octaves; i++) {
    height += noise(x * frequency, z * frequency) * amplitude;
    amplitude *= 0.5;
    frequency *= 1.8;
  }

  return height;
}

// Create some predefined math terrain functions
export const terrainFunctions = {
  // Default noise-based terrain
  noise: noiseBasedTerrain,

  // Sine wave terrain
  sinWave: (x: number, z: number): number => {
    return Math.sin(x * 0.2) * 3 + Math.sin(z * 0.3) * 2;
  },

  // Cosine wave terrain
  cosWave: (x: number, z: number): number => {
    return Math.cos(x * 0.2) * 3 + Math.cos(z * 0.3) * 2;
  },

  // Combined sin/cos wave
  sinCosWave: (x: number, z: number): number => {
    return Math.sin(x * 0.1) * Math.cos(z * 0.1) * 5;
  },

  // Flat terrain (for testing)
  flat: () => 0
};

// Define a path or feature that follows a mathematical function
export interface MathPath {
  pathFunction: (x: number) => number; // Function defining the path's Z coordinate for any X
  pathWidth: number;                   // Width of the path
  pathHeight: number;                  // Height of the path
  blendWidth: number;                  // Width of the blending zone between path and terrain
}

export const possiblePaths = {
  sinWave: {
    pathFunction: (x: number) => Math.sin(x * 0.1) * 15, // Sine wave path
    pathWidth: 5,         // 5 units wide
    pathHeight: RIVER_HEIGHT,       // Slightly below ground level (like a river)
    blendWidth: 3         // 3 units of smooth blending on each side
  } as MathPath,
  flat: {
    pathFunction: () => 0, // Flat path
    pathWidth: 10,          // 10 units wide
    pathHeight: RIVER_HEIGHT,          // Ground level
    blendWidth: 2           // 2 units of smooth blending on each side
  } as MathPath,
  cosWave: {
    pathFunction: (x: number) => Math.cos(x * 0.1) * 15, // Cosine wave path
    pathWidth: 5,          // 5 units wide
    pathHeight: RIVER_HEIGHT,        // Slightly below ground level
    blendWidth: 3          // 3 units of smooth blending on each side
  } as MathPath,
  parabolicWave: {
    pathFunction: (x: number) => Math.pow(x, 2) * 0.1, // Parabolic path
    pathWidth: 5,          // 5 units wide
    pathHeight: RIVER_HEIGHT,        // Slightly below ground level
    blendWidth: 3          // 3 units of smooth blending on each side
  } as MathPath,
  noPath: {
    pathFunction: () => 0, // No path
    pathWidth: 0,          // 0 units wide
    pathHeight: 0,         // No height
    blendWidth: 0          // No blending
  }
}

let worldTerrainFunction = terrainFunctions.noise;
let pathFunction: MathPath = possiblePaths.sinWave;

export function getPath(): MathPath {
  return pathFunction;
}

export function getCurrentTerrainFunction() {
  return worldTerrainFunction;
}

export function setTerrain(terrain: TerrainFunction) {
  worldTerrainFunction = terrain;
}

export function setPath(path: MathPath) {
  pathFunction = path;
}

// Generate terrain height at given coordinates
export function getHeight(x: number, z: number, terrainFunc: TerrainFunction = worldTerrainFunction,
                          mathPath: MathPath = pathFunction): number {
  // Start with the base terrain height
  const baseHeight = terrainFunc(x, z);

  // If no path is specified, just return the base terrain
  if (!mathPath) {
    return baseHeight;
  }

  // Calculate the z-position of the path at this x-coordinate
  const pathZ = mathPath.pathFunction(x);

  // Calculate distance from the path center
  const distanceFromPath = Math.abs(z - pathZ);

  // If inside the path, use the path height
  if (distanceFromPath < mathPath.pathWidth / 2) {
    return mathPath.pathHeight;
  }
  // If in the blend zone, smoothly transition from path to terrain
  else if (distanceFromPath < mathPath.pathWidth / 2 + mathPath.blendWidth) {
    // Calculate blend factor (0 at path edge, 1 at outer edge)
    const blendFactor = (distanceFromPath - mathPath.pathWidth / 2) / mathPath.blendWidth;
    // Smooth transition using cosine interpolation
    const smoothBlend = (1 - Math.cos(blendFactor * Math.PI)) / 2;
    // Blend between path height and terrain height
    return mathPath.pathHeight * (1 - smoothBlend) + baseHeight * smoothBlend;
  }

  // Outside the path and blend zone, use the base terrain height
  return baseHeight;
}

// Calculate max height for tree placement
export function getMaxTreeHeight(size: number, maxY: number = 10,
                                 terrainFunc: TerrainFunction = worldTerrainFunction,
                                 mathPath: MathPath = pathFunction): number {
  let maxTreeHeight = -Infinity;
  for (let x = -size / 2; x < size / 2; x++) {
    for (let z = -size / 2; z < size / 2; z++) {
      const height = getHeight(x, z, terrainFunc, mathPath);
      if (height < maxY && height > maxTreeHeight) {
        maxTreeHeight = height;
      }
    }
  }
  return maxTreeHeight;
}

export function getNoise() {
  return noise;
}

// Generate terrain mesh with optional math path
export function generateTerrain(size: number): THREE.Mesh {

  const terrainFunc = getCurrentTerrainFunction();
  const mathPath = getPath();

  const resolution = 500; // 1000 gives more detail but consumes more energy
  const geometry = new THREE.PlaneGeometry(size, size, resolution, resolution);

  geometry.rotateX(-Math.PI / 2);

  const vertices = geometry.attributes.position.array as Float32Array;
  const colors = [];

  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const z = vertices[i + 2];
    const y = getHeight(x, z, terrainFunc, mathPath);
    vertices[i + 1] = y;

    const maxHeight = 10;

    let color: THREE.Color;

    const sandHeight = RIVER_HEIGHT + 1.5; // sand

    if (y < RIVER_HEIGHT + 0.1) {
      // deep water
      color = new THREE.Color(0x0373fc); // clear blue
    } else if (y < sandHeight) {
      // sand
      const t = (y - RIVER_HEIGHT) / (sandHeight - RIVER_HEIGHT); // normalize between 0 and 1
      color = new THREE.Color().lerpColors(
        new THREE.Color(0x0373fc), // вода
        new THREE.Color(0xC2B280), // пісок
        t
      );
    } else {
      // the rest of the terrain
      const greenMin = sandHeight;
      const greenMax = maxHeight;
      const t = (y - greenMin) / (greenMax - greenMin); // normalize between 0 and 1
      color = new THREE.Color().lerpColors(
        new THREE.Color(0x1b5e20), // dark green
        new THREE.Color(0x4caf50), // light green
        t
      );
    }

    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals(); // Fix lighting

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true, // Enable vertex color interpolation
  });

  return new THREE.Mesh(geometry, material);
}