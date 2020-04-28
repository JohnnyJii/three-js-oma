import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/controls/OrbitControls.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});
  renderer.autoClearColor = false;

  const fov = 75;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 15;

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0);
  controls.update();

  const scene = new THREE.Scene();

  {
    const color = 0xFF00FF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  const sphereGeometry = new THREE.SphereGeometry(1, 6, 6);
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const tetraGeometry = new THREE.TetrahedronGeometry(1, 0);

  const meshMaterial = new THREE.MeshPhongMaterial();
  const tetraMaterial = new THREE.Mesh(tetraGeometry, meshMaterial);
  const sphereMaterial = new THREE.Mesh(sphereGeometry, meshMaterial);
  const cubeMaterial = new THREE.Mesh(cubeGeometry, meshMaterial);

  function makeInstance(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({color});

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    cube.position.x = x;

    return cube;
  }

  const cubes = [
    makeInstance(cubeGeometry, cubeMaterial,  0),
    makeInstance(sphereGeometry, sphereMaterial, -5),
    makeInstance(tetraGeometry, tetraMaterial,  5),
  ];

  const bgScene = new THREE.Scene();
  let bgMesh;
  {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(
      'https://threejsfundamentals.org/threejs/resources/images/equirectangularmaps/tears_of_steel_bridge_2k.jpg',
    );
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;

    const shader = THREE.ShaderLib.equirect;
		const material = new THREE.ShaderMaterial({
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: shader.uniforms,
      depthWrite: false,
      side: THREE.BackSide,
    });
		material.uniforms.tEquirect.value = texture;
    const plane = new THREE.BoxBufferGeometry(2, 2, 2);
    bgMesh = new THREE.Mesh(plane, material);
    bgScene.add(bgMesh);
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) {
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    cubes.forEach((cube, ndx) => {
      const speed = 1 + ndx * .1;
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;
    });

    bgMesh.position.copy(camera.position);
    renderer.render(bgScene, camera);
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
