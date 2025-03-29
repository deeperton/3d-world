import * as Three from 'three';

const movement = { reset: false, resetRotation: false, forward: false, backward: false, left: false, right: false, rotationLeft: false, rotationRight: false, rotationUp: false, rotationDown: false };
const speed = 0.1;
const rotationSpeed = 0.02;
let firstTime = true;

let position: Three.Vector3;
let rotation: Three.Euler;

// Track key states
window.addEventListener('keydown', (e: KeyboardEvent) => {
  switch (e.key.toLowerCase()) {
    case 'w': {
      if (e.shiftKey) {
        movement.rotationDown = true;
      } else {
        movement.forward = true;
      }
      break;
    }
    case 's': {
      if (e.shiftKey) {
        movement.rotationUp = true;
      } else {
        movement.backward = true;
      }
      break;
    }
    case 'a':
      if (e.shiftKey) {
        movement.rotationLeft = true;
      } else {
        movement.left = true;
      }
      break;
    case 'd':
      if (e.shiftKey) {
        movement.rotationRight = true;
      } else {
        movement.right = true;
      }
      break;
    case 'r': {
      if(e.shiftKey) {
        movement.resetRotation = true;
      } else {
        movement.reset = true;
      }
    }
  }
});

window.addEventListener('keyup', (e: KeyboardEvent) => {
  movement.reset = movement.resetRotation = false;
  switch (e.key.toLowerCase()) {
    case 'w': movement.forward = movement.rotationDown = false; break;
    case 's': movement.backward = movement.rotationUp = false; break;
    case 'a': movement.left = movement.rotationLeft  = false; break;
    case 'd': movement.right = movement.rotationRight = false; break;
  }
  //save to local storage
  localStorage.setItem('cameraPosition', JSON.stringify(position));
  localStorage.setItem('cameraRotation', JSON.stringify(rotation));
});

// Update movement in animation loop
const updateMovement = (camera: Three.PerspectiveCamera) => {
  if (firstTime) {
    const cameraPosition = localStorage.getItem('cameraPosition');
    const cameraRotation = localStorage.getItem('cameraRotation');
    if (cameraPosition) {
      camera.position.copy(JSON.parse(cameraPosition));
    }
    if (cameraRotation) {
      camera.rotation.copy(JSON.parse(cameraRotation));
    }
    firstTime = false;
  }
  const direction = new Three.Vector3();
  camera.getWorldDirection(direction); // Get the direction camera is facing

  if (movement.forward) camera.position.addScaledVector(direction, speed);
  if (movement.backward) camera.position.addScaledVector(direction, -speed);

  if (movement.left) {
    const left = new Three.Vector3().crossVectors(camera.up, direction).normalize();
    camera.position.addScaledVector(left, speed);
  }

  if (movement.right) {
    const right = new Three.Vector3().crossVectors(direction, camera.up).normalize();
    camera.position.addScaledVector(right, speed);
  }

  if (movement.rotationLeft) camera.rotation.y += rotationSpeed;
  if (movement.rotationRight) camera.rotation.y -= rotationSpeed;
  if (movement.rotationUp) camera.rotation.x += rotationSpeed;
  if (movement.rotationDown) camera.rotation.x -= rotationSpeed;

  if (movement.reset) {
    camera.position.set(0, 20, 20);
    camera.lookAt(0, 0, 0);
  }
  if (movement.resetRotation) {
    camera.rotation.set(0, 0, 0);
  }

  position = camera.position.clone();
  rotation = camera.rotation.clone();
};

export default updateMovement;