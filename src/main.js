import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const COLOR_TOPAZ = 0xFFC87C; 
const COLOR_COMPLEMENTARY = 0x003783; 

const lastThreeDigits = 59; //0,59
const abc = lastThreeDigits + 200;
const ambientIntensity = abc / 1000.0;

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
camera.position.set(0, 0, 5);

// Hybrid Glow ShaderMaterial for the glowing cube
const hybridGlowMaterial = new THREE.ShaderMaterial({
    uniforms: {
        glowColor: { value: new THREE.Color(0xffffff) },
    },
    vertexShader: `
        varying vec3 vPosition;
        void main() {
            vPosition = position; // Pass local position of vertex to fragment shader
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vPosition;

        void main() {
            float intensity = 1.0 - length(vPosition) * 0.3;
            vec3 finalColor = glowColor * intensity + glowColor * 0.5;
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `,
    transparent: true,
});

// Add central glowing cube
const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const glowingCube = new THREE.Mesh(cubeGeometry, hybridGlowMaterial);
glowingCube.position.set(0, 0, 0);
scene.add(glowingCube);

// Add point light
const pointLight = new THREE.PointLight(0xffffff, 2, 10);
pointLight.position.copy(glowingCube.position); // Match cube's position initially
scene.add(pointLight);

// Load font and add text
const fontLoader = new FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    // Alphabet ShaderMaterial
    const alphabetMaterial = new THREE.ShaderMaterial({
        uniforms: {
            ambientIntensity: { value: ambientIntensity },
            lightPosition: { value: glowingCube.position },
            objectColor: { value: new THREE.Color(COLOR_TOPAZ) },
            lightColor: { value: new THREE.Color(0xffffff) },
            shininess: { value: 50.0 },
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = vec3(modelViewMatrix * vec4(position, 1.0));
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float ambientIntensity;
            uniform vec3 lightPosition;
            uniform vec3 objectColor;
            uniform vec3 lightColor;
            uniform float shininess;
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                vec3 ambient = ambientIntensity * objectColor;
                vec3 lightDir = normalize(lightPosition - vPosition);
                float diff = max(dot(vNormal, lightDir), 0.0);
                vec3 diffuse = diff * objectColor;
                vec3 viewDir = normalize(-vPosition);
                vec3 halfwayDir = normalize(lightDir + viewDir);
                float spec = pow(max(dot(vNormal, halfwayDir), 0.0), shininess);
                vec3 specular = spec * lightColor;

                gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
            }
        `,
    });

    const textGeometryM = new TextGeometry('M', {
        font: font,
        size: 1,
        height: 0.2,
    });
    const textMeshM = new THREE.Mesh(textGeometryM, alphabetMaterial);
    textMeshM.position.set(-2.3, 0, 0); // Position on the left side
    scene.add(textMeshM);

    // Digit ShaderMaterial
    const digitMaterial = new THREE.ShaderMaterial({
        uniforms: {
            ambientIntensity: { value: ambientIntensity },
            lightPosition: { value: glowingCube.position },
            objectColor: { value: new THREE.Color(COLOR_COMPLEMENTARY) },
            lightColor: { value: new THREE.Color(0xffffff) },
            shininess: { value: 100.0 },
        },
        vertexShader: alphabetMaterial.vertexShader,
        fragmentShader: `
            uniform float ambientIntensity;
            uniform vec3 lightPosition;
            uniform vec3 objectColor;
            uniform vec3 lightColor;
            uniform float shininess;
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                vec3 ambient = ambientIntensity * objectColor;
                vec3 lightDir = normalize(lightPosition - vPosition);
                float diff = max(dot(vNormal, lightDir), 0.0);
                vec3 diffuse = diff * objectColor;
                vec3 viewDir = normalize(-vPosition);
                vec3 halfwayDir = normalize(lightDir + viewDir);
                float spec = pow(max(dot(vNormal, halfwayDir), 0.0), shininess);
                vec3 specular = spec * objectColor; // Metallic highlight related to base color

                gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
            }
        `,
    });

    const textGeometry9 = new TextGeometry('9', {
        font: font,
        size: 1,
        height: 0.2,
    });
    const textMesh9 = new THREE.Mesh(textGeometry9, digitMaterial);
    textMesh9.position.set(1.2, 0, 0);
    scene.add(textMesh9);
});

// Key press logic
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w': // Move cube up
            glowingCube.position.y += 0.1;
            break;
        case 's': // Move cube down
            glowingCube.position.y -= 0.1;
            break;
        case 'a': // Move camera left
            camera.position.x -= 0.1;
            break;
        case 'd': // Move camera right
            camera.position.x += 0.1;
            break;
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update point light position to match the glowing cube
    pointLight.position.copy(glowingCube.position);

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
