import { BLOCH_PAD, CIRCUIT_RATIO, GATE_SIZE } from "@/models/CircuitModels";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/Addons.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function createArrow(direction: THREE.Vector3, color: THREE.ColorRepresentation) {
  const arrow = new THREE.ArrowHelper(
    direction,
    new THREE.Vector3(0, 0, 0),
    1.5,
    color,
    0.2,
    0.1
  );
  return arrow
}

function createAxisLabel(text: string, position: THREE.Vector3, color: string): CSS2DObject {
  const div = document.createElement("div");
  div.textContent = text;
  div.style.cssText = `
    color: ${color};
    font-size: 11px;
    font-family: monospace;
    pointer-events: none;
  `;
  const label = new CSS2DObject(div);
  label.position.copy(position);
  return label;
}

function createValueMesh(
  x: number,
  y: number,
  z: number
): THREE.Group {
  const valueGroup = new THREE.Group();

  const valueGeometry = new THREE.SphereGeometry(0.05, 16, 16);
  const valueMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
  const valueMesh = new THREE.Mesh(valueGeometry, valueMaterial);
  valueMesh.position.set(x, y, z);
  valueGroup.add(valueMesh);

  if (x == 0 && y == 0 && z == 0) return valueGroup;

  const direction = new THREE.Vector3().subVectors(new THREE.Vector3(x, y, z), new THREE.Vector3(0, 0, 0));
  const length = direction.length();

  const geometry = new THREE.CylinderGeometry(0.02, 0.02, length, 16, 16);
  const mesh = new THREE.Mesh(geometry, valueMaterial);

  mesh.position.copy(new THREE.Vector3(0, 0, 0)).addScaledVector(direction, 0.5);

  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize(),
  );

  valueGroup.add(mesh);

  return valueGroup;
}

export interface BlochSphereProps {
  x: number,
  y: number,
  z: number,
}

function BlochSphere({ x, y, z }: BlochSphereProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current!;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
    camera.position.set(1.75, 1.75, 1.75);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize((GATE_SIZE - BLOCH_PAD) * CIRCUIT_RATIO, (GATE_SIZE - BLOCH_PAD) * CIRCUIT_RATIO);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const meshGroup = new THREE.Group();

    // Sphere
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0x4488ff, transparent: true, opacity: 0.3, shininess: 1.0 });
    const sphere = new THREE.Mesh(geometry, material);
    meshGroup.add(sphere);

    // Arrows
    const xArrow = createArrow(new THREE.Vector3(1, 0, 0), 0xFF0000);
    meshGroup.add(xArrow);
    const yArrow = createArrow(new THREE.Vector3(0, 1, 0), 0x00FF00);
    meshGroup.add(yArrow);
    const zArrow = createArrow(new THREE.Vector3(0, 0, 1), 0x0000FF);
    meshGroup.add(zArrow);

    // Labels
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize((GATE_SIZE - BLOCH_PAD) * CIRCUIT_RATIO, (GATE_SIZE - BLOCH_PAD) * CIRCUIT_RATIO);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0";
    labelRenderer.domElement.style.pointerEvents = "none";
    mount.appendChild(labelRenderer.domElement);
    meshGroup.add(createAxisLabel("x", new THREE.Vector3(1.7, 0, 0), "#FF0000"));
    meshGroup.add(createAxisLabel("y", new THREE.Vector3(0, 1.7, 0), "#00FF00"));
    meshGroup.add(createAxisLabel("z", new THREE.Vector3(0, 0, 1.7), "#0000FF"));

    // Value mesh
    const valueGroup = createValueMesh(x, y, z);
    meshGroup.add(valueGroup);

    scene.add(meshGroup);

    // Drag and drop
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.object.up.set(0, 0, 1);
    controls.update();
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = false;
    controls.enablePan = false;

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(2, 2, 2);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      mount.removeChild(labelRenderer.domElement);
    };
  }, [x, y, z]);

  return <div ref={mountRef} style={{ position: "relative" }} />;
}

export default BlochSphere;
