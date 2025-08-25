import * as Three from 'three';
import {
  generateTerrain,
  possiblePaths,
  setPath,
  setTerrain,
  terrainFunctions
} from './world/terrain.ts';
import updateMovement from './movement.ts';
import { animateTrees, generateTrees } from './world/trees.ts';
import { generateSphere } from './world/sky.ts';
import {fps} from './tools/fps.ts';

import { playAudioAndAnalyze } from './sound/mp3.ts';
// import { generateWater, updateWater } from './world/water.ts';
import { Firework } from './world/fireworks.ts';
const scene = new Three.Scene();
const camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new Three.WebGLRenderer({ antialias: true });
const WORLD_SIZE = 100;

const TREES_COUNT = 350;
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);
const light = new Three.DirectionalLight(0xfffddb, 1);
light.position.set(10, 10, 10);

scene.add(light);
const light2 = new Three.AmbientLight(0xfffaad, 0.5);
light2.position.set(-10, -5, 15);

scene.add(light2);
setTerrain(terrainFunctions.noise);

setPath(possiblePaths.sinWave);
// flat surface
const plane = generateTerrain(WORLD_SIZE);
const sphere = generateSphere(WORLD_SIZE);
const trees = generateTrees(WORLD_SIZE, TREES_COUNT); // 100 дерев на мапі 50x50
scene.add(trees);
scene.add(sphere);

scene.add(plane);
// camera
camera.position.set(0, 45, 45);

// const water = generateWater(WORLD_SIZE, -2.0);
// scene.add(water);

const fireworks: Firework[] = [];
let fireworkTimer = 0;

const clock = new Three.Clock();

camera.lookAt(0, 0, 0);
const animate = () => {
  requestAnimationFrame(animate);
  // const elapsed = clock.getElapsedTime();
  const delta = clock.getDelta();
  // updateWater(water, elapsed);
  updateMovement(camera); // reacting to keyboard to articulate the camera
  renderer.render(scene, camera);
  fireworkTimer += delta;
  if (fireworkTimer > 2.5) {
    const pos = new Three.Vector3(
      (Math.random() - 0.5) * 80,
      0,
      (Math.random() - 0.5) * 80
    );
    const fw = new Firework(pos);
    scene.add(fw.mesh);
    fireworks.push(fw);
    fireworkTimer = 0;
  }

  for (const fw of fireworks) {
    fw.update(delta, scene);
  }
};

animate();

playAudioAndAnalyze(animateTrees);

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

fps();