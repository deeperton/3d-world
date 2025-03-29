import * as Three from 'three';
import { generateTerrain } from './world/terrain.ts';
import updateMovement from './movement.ts';

const scene = new Three.Scene();
const camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new Three.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new Three.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

// flat surface
const plane = generateTerrain(50);
scene.add(plane);

// camera
camera.position.set(0, 20, 20);
camera.lookAt(0, 0, 0);


const animate = () => {
  requestAnimationFrame(animate);
  updateMovement(camera); // reacting to keyboard to articulate the camera
  renderer.render(scene, camera);
};
animate();


window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
