import * as SimplexNoise from 'simplex-noise';
import * as THREE from 'three';
import alea from 'alea';

const SEED = '12dsd3fsd'; // Change this to get a different world

// Create a seeded PRNG for deterministic noise
const prng = alea(SEED);
const noise = SimplexNoise.createNoise2D(prng);

// Generate terrain height at given coordinates
export function getHeight(x: number, z: number): number {
  const scale = 0.1; // Controls the "stretch" of the landscape
  const octaves = 4; // Number of noise layers
  let amplitude = 10; // Max terrain height
  let height = 0;
  let frequency = scale;

  for (let i = 0; i < octaves; i++) {
    height += noise(x * frequency, z * frequency) * amplitude;
    amplitude *= 0.5; // Reduce amplitude (but not до нуля, як у тебе)
    frequency *= 2; // Increase frequency
  }

  return height;
}

// Generate terrain mesh
export function generateTerrain(size: number): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(size, size, size, size);
  geometry.rotateX(-Math.PI / 2);

  const vertices = geometry.attributes.position.array as Float32Array;
  const colors = [];

  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const z = vertices[i + 2];
    const y = getHeight(x, z);
    vertices[i + 1] = y;

    // Grass gradient (dark green to light green)
    const minHeight = -5;
    const maxHeight = 10;
    const normalizedHeight = (y - minHeight) / (maxHeight - minHeight);
    const color = new THREE.Color().lerpColors(
      new THREE.Color(0x1b5e20), // Dark Green
      new THREE.Color(0x4caf50), // Light Green
      normalizedHeight
    );
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals(); // Fix lighting

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true, // Enable vertex color interpolation
  });

  return new THREE.Mesh(geometry, material);
}
