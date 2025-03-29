import * as SimplexNoise from 'simplex-noise';
import * as THREE from 'three';
import alea from 'alea';

const SEED = '12dsd3fsd'; // Change this to get a different world

// create a new random function based on the seed
const prng = alea(SEED);

const noise = SimplexNoise.createNoise2D(prng); // DETERMINISTIC SEED-BASED NOISE

// Generate terrain height at given coordinates
export function getHeight(x: number, z: number): number {
  const scale = 0.1; // Controls the "stretch" of the landscape
  const octaves = 4; // Number of noise layers
  let amplitude = 10; // Max terrain height
  let height = 0;
  let frequency = scale;

  for (let i = 0; i < octaves; i++) {
    height += noise(x * frequency, z * frequency) * amplitude;
    amplitude *= 0.0001; // Reduce amplitude
    frequency *= 1.2; // Increase frequency
  }

  return height;
}

// Generate terrain mesh
export function generateTerrain(size: number): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(size, size, size, size);
  geometry.rotateX(-Math.PI / 2);

  const vertices = geometry.attributes.position.array as Float32Array;

  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const z = vertices[i + 2];
    vertices[i + 1] = getHeight(x, z); // Set Y coordinate based on noise
  }

  geometry.computeVertexNormals(); // Fix lighting

  const material = new THREE.MeshStandardMaterial({ color: 0x228B22, wireframe: true });
  return new THREE.Mesh(geometry, material);
}
