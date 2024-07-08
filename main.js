import * as THREE from 'three';
import { marchingCubes, createCamera, createLights, createRenderer, createSky, sphereScalarField, perlin2ScalarField, perlin3ScalarField, simplex2ScalarField, simplex3ScalarField } from './components';
import Stats from 'stats.js';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = createCamera();

// Create a renderer
const renderer = createRenderer();

createSky(scene);

// Create a point light
createLights(scene);

// const scalarField = sphereScalarField(20);
// const scalarField = perlin3ScalarField(20,20,20,20, 'seed');
// // Define the isolevel
// const isolevel = 0;
// // Run the marching cubes algorithm
// const isosurface = marchingCubes(scalarField, isolevel, 'white');
// scene.add(isosurface);

const sfs = {x: 30, y: 20, z: 30}

// perlin 2d
const p2sf = perlin2ScalarField(sfs.x,sfs.z,sfs.y,20, 'seed');
const p2is = marchingCubes(p2sf, 0, 'white');
p2is.rotation.y = 0;
scene.add(p2is);
// perlin 3d
const p3sf = perlin3ScalarField(sfs.x,sfs.z,sfs.y,20, 'seed');
const p3is = marchingCubes(p3sf, 0, 'red');
p3is.rotation.y = Math.PI / 2;
scene.add(p3is);
// simplex 2d
const s2sf = simplex2ScalarField(sfs.x,sfs.z,sfs.y,20, 'seed');
const s2is = marchingCubes(s2sf, 0, 'green');
s2is.rotation.y = Math.PI * 3 / 2;
scene.add(s2is);
// simplex 3d
const s3sf = simplex3ScalarField(sfs.x,sfs.z,sfs.y,20, 'seed');
const s3is = marchingCubes(s3sf, 0, 'blue');
s3is.rotation.y = Math.PI;
scene.add(s3is);

// Create a character model
const character = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
character.position.set(0, sfs.y + 5, 0);
scene.add(character);


// Update character position based on key inputs
const characterAcceleration = 0.1;
let characterSpeed = 0;

document.addEventListener('keydown', (event) => {
    if (event.key === 'w') {
        characterSpeed += characterAcceleration;
    } else if (event.key === 's') {
        characterSpeed -= characterAcceleration;
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
  const angleY = (mouseY / window.innerHeight) * Math.PI - Math.PI/2; // Angle for the y-axis rotation

  // Update camera position for circular orbit
  camera.position.x = character.position.x - radius * Math.sin(angleX) * Math.cos(angleY);
  camera.position.y = character.position.y + radius * Math.sin(angleY);
  camera.position.z = character.position.z + radius * Math.cos(angleX) * Math.cos(angleY);
  camera.lookAt(character.position);

  character.rotation.y = - angleX;
}

const xCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0, 10, 32), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
xCylinder.rotation.z = -Math.PI / 2; // Rotate the cylinder to align with the x-axis
xCylinder.position.set(5, 0, 0); // Position the x-axis cylinder
scene.add(xCylinder);

const yCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0, 10, 32), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
yCylinder.position.set(0, 5, 0); // Position the y-axis cylinder
scene.add(yCylinder);

const zCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0, 10, 32), new THREE.MeshBasicMaterial({ color: 0x0000ff }));
zCylinder.rotation.x = Math.PI / 2; // Rotate the cylinder to align with the z-axis
zCylinder.position.set(0, 0, 5); // Position the z-axis cylinder
scene.add(zCylinder);

// Initialize stats
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

// Render the scene
function animate() {
    stats.begin();

    requestAnimationFrame(animate);

    // Update character position
    character.position.x += (character.position.x - camera.position.x) * characterSpeed;
    character.position.y += (character.position.y - camera.position.y) * characterSpeed;
    character.position.z += (character.position.z - camera.position.z) * characterSpeed;

    // Update character and camera orientation based on mouse movement
    updateCameraOrbit();

    renderer.render(scene, camera);

    // console.log(character.rotation)

    stats.end();
}
animate();