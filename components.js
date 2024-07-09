import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { Vector3 } from 'three';
import { getEdgeTable, getTriTable } from './MC_lookup.js';
import { createNoise2D, createNoise3D } from 'simplex-noise';
import PerlinNoise from './perlinNoise.js';
import Alea from 'alea';

export function createCamera() {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    return camera;
}

export function createRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
    return renderer;
}

export function createPlane(scene) {
    const planeGeometry = new THREE.PlaneGeometry(10000, 10000);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x555555, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    scene.add(plane)
    return plane
}

export function createLights(scene) {
    const light = new THREE.PointLight(0xffffff, 1000);
    light.position.set(0, 30, 0); // Position the light above the center of the plane
    light.castShadow = true; // Enable shadow casting
    scene.add(light);

    // Set up shadow properties for the light
    light.shadow.mapSize.width = 1024; // Shadow map width
    light.shadow.mapSize.height = 1024; // Shadow map height
    light.shadow.camera.near = 0.5; // Shadow camera near plane
    light.shadow.camera.far = 500; // Shadow camera far plane

    const lightSphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const lightSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lightSphere = new THREE.Mesh(lightSphereGeometry, lightSphereMaterial);
    scene.add(lightSphere);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
    scene.add(ambientLight);

    return { light, lightSphere, ambientLight };
}

export function createSky(scene) {
    const sky = new Sky();
    sky.scale.setScalar( 450000 );

    const sunPosition = new Vector3().setFromSphericalCoords( 1, Math.PI/2, Math.PI);

    sky.material.uniforms.sunPosition.value = sunPosition;

    scene.add( sky );
}

export function createCubeGroup(group, scene) {
    let groupList = [];
    let groupPos = [];

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

    return groupList;
}

export function sphereScalarField(size) {
    const scalarField = new Array(size).fill().map(() => 
        new Array(size).fill().map(() => 
            new Array(size).fill(0)
        )
    );

    const center = size / 2;
    const radius = size / 4;

    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            for (let z = 0; z < size; z++) {
                const dx = x - center;
                const dy = y - center;
                const dz = z - center;
                scalarField[x][y][z] = Math.sqrt(dx * dx + dy * dy + dz * dz) - radius;
            }
        }
    }
    return scalarField
}

export function perlin2ScalarField(width, depth, amplitude, frequency, seed) {
    const scalarField = new Array(width).fill().map(() => 
        new Array(amplitude).fill().map(() => 
            new Array(depth).fill(0)
        )
    );

    const perlinNoise = new PerlinNoise;

    for (let z = 0; z < depth; z++) {
        for (let x = 0; x < width; x++) {
            const value = perlinNoise.noise(x / frequency, z / frequency, 1) * amplitude/2 + amplitude/2;
            // console.log(value);
            for (let y = 0; y < amplitude; y++) {
                if (y > value) {
                    scalarField[x][y][z] = -1;
                } else {
                    scalarField[x][y][z] = 1;
                }
            }
        }
    }
    // console.log(scalarField);
    return scalarField;
}

export function perlin3ScalarField(width, depth, height, frequency, seed) {
    const scalarField = new Array(width).fill().map(() => 
        new Array(height).fill().map(() => 
            new Array(depth).fill(0)
        )
    );

    const perlinNoise = new PerlinNoise;

    for (let z = 0; z < depth; z++) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const value = perlinNoise.noise(x / frequency, y / frequency, z / frequency);
                // console.log(value);
                scalarField[x][y][z] = value;
            }
        }
    }

    // console.log(scalarField);
    return scalarField;
}

export function simplex2ScalarField(width, depth, amplitude, frequency, seed) {
    const scalarField = new Array(width).fill().map(() => 
        new Array(amplitude).fill().map(() => 
            new Array(depth).fill(0)
        )
    );

    const noise2D = createNoise2D(Alea(seed));

    for (let z = 0; z < depth; z++) {
        for (let x = 0; x < width; x++) {
            const value = noise2D(x / frequency, z / frequency) * amplitude/2 + amplitude/2;
            // console.log(value);
            for (let y = 0; y < amplitude; y++) {
                if (y > value) {
                    scalarField[x][y][z] = -1;
                } else {
                    scalarField[x][y][z] = 1;
                }
            }
        }
    }
    // console.log(scalarField);
    return scalarField;
}

export function simplex3ScalarField(width, depth, height, frequency, seed) {
    const scalarField = new Array(width).fill().map(() => 
        new Array(height).fill().map(() => 
            new Array(depth).fill(0)
        )
    );

    const noise3D = createNoise3D(Alea(seed));

    for (let z = 0; z < depth; z++) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const value = noise3D(x / frequency, y / frequency, z / frequency);
                // console.log(value);
                scalarField[x][y][z] = value;
            }
        }
    }
    // console.log(scalarField);
    return scalarField;
}

export function marchingCubes(scalarField, isolevel, color = 0x00ff00) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('marchingCubesWorker.js');
        worker.postMessage({ scalarField, isolevel, color });

        worker.onmessage = function (e) {
            const loader = new THREE.ObjectLoader();
            const group = loader.parse(e.data);
            resolve(group);
        };

        worker.onerror = function (error) {
            reject(error);
        };
    });
}