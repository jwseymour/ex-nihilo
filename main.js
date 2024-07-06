import * as THREE from 'three';
import { createCamera, createCubeGroup, createLights, createPlane, createRenderer, createSky } from './components';
import Stats from 'stats.js';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = createCamera();

// Create a renderer
const renderer = createRenderer();

// Create a very large plane along the x-y plane
const plane = createPlane(scene);

createSky(scene);

// Create a point light
const { light, lightSphere, ambientLight } = createLights(scene);

const group = new THREE.Group();
let groupList = createCubeGroup(group, scene);

// Create a character model
const character = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
scene.add(character);

// Update character position based on key inputs
const characterSpeed = 1;
const characterPosition = { x: 0, z: 0 };

document.addEventListener('keydown', (event) => {
    if (event.key === 'w') {
        characterPosition.z -= Math.cos(character.rotation.y) * characterSpeed;
        characterPosition.x -= Math.sin(character.rotation.y) * characterSpeed;
    } else if (event.key === 's') {
        characterPosition.z += Math.cos(character.rotation.y) * characterSpeed;
        characterPosition.x += Math.sin(character.rotation.y) * characterSpeed;
    } else if (event.key === 'a') {
        characterPosition.z += Math.cos(character.rotation.y - Math.PI/2) * characterSpeed;
        characterPosition.x += Math.sin(character.rotation.y - Math.PI/2) * characterSpeed;
    } else if (event.key === 'd') {
        characterPosition.z -= Math.cos(character.rotation.y - Math.PI/2) * characterSpeed;
        characterPosition.x -= Math.sin(character.rotation.y - Math.PI/2) * characterSpeed;
    }
});

let mouseX = 0;
let mouseY = 0;

// Event listener for mouse move
window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

// Update character and camera orientation based on mouse movement
function updateCameraOrbit() {
  const radius = 10; // Radius of the circular orbit
  const angleX = (mouseX / window.innerWidth) * 2 * Math.PI; // Angle for the x-axis rotation
  const angleY = (mouseY / window.innerHeight) * Math.PI / 2; // Angle for the y-axis rotation

  // Update camera position for circular orbit
  camera.position.x = character.position.x - radius * Math.sin(angleX) * Math.cos(angleY);
  camera.position.y = character.position.y + radius * Math.sin(angleY);
  camera.position.z = character.position.z + radius * Math.cos(angleX) * Math.cos(angleY);
  camera.lookAt(character.position);

  character.rotation.y = - angleX;
}

// Initialize stats
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

// Render the scene
function animate() {
    stats.begin();

    requestAnimationFrame(animate);

    // Update character position
    character.position.x = characterPosition.x;
    character.position.z = characterPosition.z;

    // Update character and camera orientation based on mouse movement
    updateCameraOrbit();

    renderer.render(scene, camera);

    stats.end();
}
animate();