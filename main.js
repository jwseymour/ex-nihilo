import * as THREE from 'three';


// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true }); // Enable antialiasing for smoother edges
renderer.setSize(window.innerWidth, window.innerHeight); // Increase the size for higher resolution
renderer.setPixelRatio(window.devicePixelRatio); // Adjust pixel ratio for high-density displays
renderer.shadowMap.enabled = true; // Enable shadow mapping
document.body.appendChild(renderer.domElement);

// Create a very large plane along the x-y plane
const planeGeometry = new THREE.PlaneGeometry(10000, 10000);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x555555, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = Math.PI / 2;
scene.add(plane);

// Create a point light
const light = new THREE.PointLight(0xffffff, 1000);
light.position.set(0, 20, 0); // Position the light
light.castShadow = true; // Enable shadow casting
scene.add(light);

// Set up shadow properties for the light
light.shadow.mapSize.width = 1024; // Shadow map width
light.shadow.mapSize.height = 1024; // Shadow map height
light.shadow.camera.near = 0.5; // Shadow camera near plane
light.shadow.camera.far = 500; // Shadow camera far plane

// Create a sphere to visualize the light's position
const lightSphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
const lightSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const lightSphere = new THREE.Mesh(lightSphereGeometry, lightSphereMaterial);
scene.add(lightSphere);

// Create an ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(ambientLight);

const group = new THREE.Group();
let groupList = [];
let groupPos = [];

// Create a cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00aaff });
// const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
// const materials = [material, material, edgeMaterial, edgeMaterial, material, material];

let lastPos = [1, 0];
let currentPos = [0, 0];

for (let i = 0; i < 1000; i++) {
    let cube = new THREE.Mesh(geometry, material);
    groupList.push(cube);
    let difference = [currentPos[0] - lastPos[0], currentPos[1] - lastPos[1]];
    let randomChoice = Math.random();
    if (randomChoice < 0.8) {
        currentPos[0] += difference[0];
        currentPos[1] += difference[1];
      } else if ((randomChoice > 0.8) && (randomChoice < 0.9)) {
        currentPos[0] += difference[1];
        currentPos[1] += difference[0];
      } else {
        currentPos[0] -= difference[1];
        currentPos[1] -= difference[0];
      }
    groupList[i].position.set(currentPos[0], 0.5, currentPos[1]);
    groupPos.push([currentPos[0], currentPos[1]]);
    group.add(groupList[i]);
    lastPos[0] += difference[0];
    lastPos[1] += difference[1];
  }

// Calculate the centroid of the group
let centroid = new THREE.Vector3(0, 0, 0);
groupPos.forEach(pos => {
  centroid.x += pos[0];
  centroid.z += pos[1];
});
centroid.divideScalar(groupPos.length);

// Translate the group to the center
group.position.sub(centroid);

// const cube = new THREE.Mesh(geometry, material);
scene.add(group);

// Variables to store mouse position
let mouseX = 0;
let mouseY = 0;

// Event listener for mouse move
window.addEventListener('mousemove', (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

let isSpacePressed = false;

// Listen for keydown event
document.addEventListener('keydown', (event) => {
if (event.code === 'Space') {
    isSpacePressed = true;
}
});

// Listen for keyup event
document.addEventListener('keyup', (event) => {
if (event.code === 'Space') {
    isSpacePressed = false;
}
});

// Render the scene
function animate() {
  requestAnimationFrame(animate);

  // Calculate spherical coordinates
  const radius = 50; // Distance from the center of the group
  const phi = (mouseY / window.innerHeight) * Math.PI / 2; // Angle for the y-axis rotation
  const theta = (mouseX / window.innerWidth) * 2 * Math.PI; // Angle for the z-axis rotation

  // Update camera position
  camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
  camera.position.y = radius * Math.cos(phi);
  camera.position.z = radius * Math.sin(phi) * Math.cos(theta);

  // Make the camera look at the center of the scene
  camera.lookAt(scene.position);

  if (isSpacePressed) {
    // Update light position based on spacebar state
    light.position.z = Math.sin(Date.now() * 0.002) * 20;
    light.position.x = Math.cos(Date.now() * 0.002) * 20;

     // Update the visualization of the light's position
     lightSphere.position.copy(light.position);
  }
  renderer.render(scene, camera);
}
animate();