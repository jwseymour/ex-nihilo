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
                console.log(value);
                scalarField[x][y][z] = value;
            }
        }
    }

    console.log(scalarField);
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
    const group = new THREE.Group();
    const sizeX = scalarField.length;
    const sizeY = scalarField[0].length;
    const sizeZ = scalarField[0][0].length;

    const edgeTable = getEdgeTable();
    const triTable = getTriTable();

    function interpolate(p1, p2, val1, val2) {
        if (Math.abs(isolevel - val1) < 0.00001) return p1;
        if (Math.abs(isolevel - val2) < 0.00001) return p2;
        if (Math.abs(val1 - val2) < 0.00001) return p1;
        const mu = (isolevel - val1) / (val2 - val1);
        return p1.clone().lerp(p2, mu);
    }

    for (let x = 0; x < sizeX - 1; x++) {
        for (let y = 0; y < sizeY - 1; y++) {
            for (let z = 0; z < sizeZ - 1; z++) {
                const cubeCorners = [
                    new THREE.Vector3(x, y, z),
                    new THREE.Vector3(x + 1, y, z),
                    new THREE.Vector3(x + 1, y + 1, z),
                    new THREE.Vector3(x, y + 1, z),
                    new THREE.Vector3(x, y, z + 1),
                    new THREE.Vector3(x + 1, y, z + 1),
                    new THREE.Vector3(x + 1, y + 1, z + 1),
                    new THREE.Vector3(x, y + 1, z + 1)
                ];

                const cubeValues = [
                    scalarField[x][y][z],
                    scalarField[x + 1][y][z],
                    scalarField[x + 1][y + 1][z],
                    scalarField[x][y + 1][z],
                    scalarField[x][y][z + 1],
                    scalarField[x + 1][y][z + 1],
                    scalarField[x + 1][y + 1][z + 1],
                    scalarField[x][y + 1][z + 1]
                ];

                let cubeIndex = 0;
                for (let i = 0; i < 8; i++) {
                    if (cubeValues[i] < isolevel) cubeIndex |= 1 << i;
                }

                if (edgeTable[cubeIndex] === 0) continue;

                const vertList = new Array(12);
                if (edgeTable[cubeIndex] & 1) vertList[0] = interpolate(cubeCorners[0], cubeCorners[1], cubeValues[0], cubeValues[1]);
                if (edgeTable[cubeIndex] & 2) vertList[1] = interpolate(cubeCorners[1], cubeCorners[2], cubeValues[1], cubeValues[2]);
                if (edgeTable[cubeIndex] & 4) vertList[2] = interpolate(cubeCorners[2], cubeCorners[3], cubeValues[2], cubeValues[3]);
                if (edgeTable[cubeIndex] & 8) vertList[3] = interpolate(cubeCorners[3], cubeCorners[0], cubeValues[3], cubeValues[0]);
                if (edgeTable[cubeIndex] & 16) vertList[4] = interpolate(cubeCorners[4], cubeCorners[5], cubeValues[4], cubeValues[5]);
                if (edgeTable[cubeIndex] & 32) vertList[5] = interpolate(cubeCorners[5], cubeCorners[6], cubeValues[5], cubeValues[6]);
                if (edgeTable[cubeIndex] & 64) vertList[6] = interpolate(cubeCorners[6], cubeCorners[7], cubeValues[6], cubeValues[7]);
                if (edgeTable[cubeIndex] & 128) vertList[7] = interpolate(cubeCorners[7], cubeCorners[4], cubeValues[7], cubeValues[4]);
                if (edgeTable[cubeIndex] & 256) vertList[8] = interpolate(cubeCorners[0], cubeCorners[4], cubeValues[0], cubeValues[4]);
                if (edgeTable[cubeIndex] & 512) vertList[9] = interpolate(cubeCorners[1], cubeCorners[5], cubeValues[1], cubeValues[5]);
                if (edgeTable[cubeIndex] & 1024) vertList[10] = interpolate(cubeCorners[2], cubeCorners[6], cubeValues[2], cubeValues[6]);
                if (edgeTable[cubeIndex] & 2048) vertList[11] = interpolate(cubeCorners[3], cubeCorners[7], cubeValues[3], cubeValues[7]);

                for (let i = 0; triTable[cubeIndex][i] !== -1; i += 3) {
                    const p1 = vertList[triTable[cubeIndex][i]];
                    const p2 = vertList[triTable[cubeIndex][i + 1]];
                    const p3 = vertList[triTable[cubeIndex][i + 2]];

                    // Debugging logs
                    if (!p1 || !p2 || !p3) {
                        console.error('Undefined vertex detected', { cubeIndex, vertList, triTableEntry: triTable[cubeIndex] });
                        continue;
                    }

                    const geometry = new THREE.BufferGeometry().setFromPoints([p1, p2, p3]);
                    geometry.setIndex([0, 1, 2]);
                    geometry.computeVertexNormals();

                    const material = new THREE.MeshStandardMaterial({ color: color, side: THREE.DoubleSide });
                    const mesh = new THREE.Mesh(geometry, material);
                    group.add(mesh);
                }
            }
        }
    }

    return group;
}