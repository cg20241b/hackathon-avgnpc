import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Define colors
const COLOR_TOPAZ = 0xFFC87C;
const COLOR_COMPLEMENTARY = 0x003783;

// Initialize renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Initialize scene
const scene = new THREE.Scene();

// Initialize camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 2, 5);

// Add helpers
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(15, 50);
scene.add(gridHelper);

// Load font
let font;
const fontLoader = new FontLoader();
const fontPromise = new Promise((resolve, reject) => {
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (loadedFont) => {
        font = loadedFont;
        resolve();
    }, undefined, (error) => {
        reject(error);
    });
});

// Create text meshes once the font is loaded
fontPromise.then(() => {
    // Topaz color for the alphabet character "M" from "Alam"
    const textMaterialM = new THREE.MeshBasicMaterial({ color: COLOR_TOPAZ });

    // Create the alphabet character "M"
    const textGeometryM = new TextGeometry('M', {
        font: font,
        size: 1,
        height: 0.2,
    });
    const textMeshM = new THREE.Mesh(textGeometryM, textMaterialM);
    textMeshM.position.set(-2.3, 0, 0); // Position the text on the left side
    scene.add(textMeshM);

    // Complementary color for the digit "9" from "059"
    const textMaterial9 = new THREE.MeshBasicMaterial({ color: COLOR_COMPLEMENTARY });

    // Create the digit "9"
    const textGeometry9 = new TextGeometry('9', {
        font: font,
        size: 1,
        height: 0.2,
    });
    const textMesh9 = new THREE.Mesh(textGeometry9, textMaterial9);
    textMesh9.position.set(1.2, 0, 0); // Position the text on the right side
    scene.add(textMesh9);
}).catch((error) => {
    console.error('An error occurred while loading the font:', error);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation loop
animate();