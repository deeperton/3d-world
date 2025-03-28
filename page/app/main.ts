import * as THREE from 'three';

// Створюємо сцену, камеру і рендерер
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Додаємо світло (бо без нього буде темна жопа)
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// Додаємо тестову площину (землю)
const geometry = new THREE.PlaneGeometry(50, 50, 50, 50); // Полігональна сітка для майбутньої деталізації
const material = new THREE.MeshStandardMaterial({ color: 0x228B22, wireframe: true });
const plane = new THREE.Mesh(geometry, material);

plane.rotation.x = -Math.PI / 2; // Кладемо горизонтально
scene.add(plane);

// Камера з висоти пташиного польоту
camera.position.set(0, 20, 20);
camera.lookAt(0, 0, 0);

// Запускаємо рендер-цикл
const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};
animate();

// Автоматичний ресайз
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});