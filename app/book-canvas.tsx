"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  SHEET_A_URL,
  SHEET_B_URL,
  ALL_COVERS,
  BOOK_INDICES,
} from "./book-data";

export default function BookCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- 1. Scene, Camera, Renderer ---
    const scene = new THREE.Scene();

    const getTargetFov = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspect = width / height;
      if (width <= 760 || aspect < 1) {
        return 40;
      }
      // On wide screens (e.g. aspect > 1.8), keep books comfortably framed and centered
      if (aspect > 2.2) {
        return 22;
      }
      return 19.5;
    };

    const camera = new THREE.PerspectiveCamera(
      getTargetFov(),
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    // Specification camera: (3.6, 2.15, 7.4) looking at (-1.4, 0.05, -0.6)
    camera.position.set(3.6, 2.15, 7.4);
    camera.lookAt(-1.4, 0.05, -0.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // --- 2. Lighting & Environment ---
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    const envTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.55;

    // Key Light
    const keyLight = new THREE.DirectionalLight(0xfff3e4, 2.4);
    keyLight.position.set(-4, 6, 6);
    scene.add(keyLight);

    // Rim Light
    const rimLight = new THREE.DirectionalLight(0xbfd2ff, 1.1);
    rimLight.position.set(6, 3, -4);
    scene.add(rimLight);

    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.12);
    scene.add(ambientLight);

    // --- 3. Page Procedural Textures ---
    function createPageTexture(isHorizontal: boolean) {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#efe7d6";
      ctx.fillRect(0, 0, 256, 256);

      const count = 128;
      for (let i = 0; i < count; i++) {
        const alpha = 0.05 + Math.random() * 0.12;
        ctx.fillStyle = `rgba(80, 50, 30, ${alpha})`;
        if (isHorizontal) {
          ctx.fillRect(0, i * 2, 256, 1);
        } else {
          ctx.fillRect(i * 2, 0, 1, 256);
        }
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      return tex;
    }

    const foreEdgeTex = createPageTexture(true);
    const topBottomTex = createPageTexture(false);

    const foreEdgeMat = new THREE.MeshStandardMaterial({
      map: foreEdgeTex,
      roughness: 0.9,
    });
    const topBottomMat = new THREE.MeshStandardMaterial({
      map: topBottomTex,
      roughness: 0.9,
    });

    // --- 4. Load Sheets & Build Books ---
    const textureLoader = new THREE.TextureLoader();
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    const sheetATexture = textureLoader.load(SHEET_A_URL, () => {
      renderer.render(scene, camera);
    });
    sheetATexture.colorSpace = THREE.SRGBColorSpace;
    sheetATexture.anisotropy = maxAniso;

    const sheetBTexture = textureLoader.load(SHEET_B_URL, () => {
      renderer.render(scene, camera);
    });
    sheetBTexture.colorSpace = THREE.SRGBColorSpace;
    sheetBTexture.anisotropy = maxAniso;

    const bookGeometry = new THREE.BoxGeometry(1, 1.5, 0.2);

    interface BookItem {
      group: THREE.Group;
      mesh: THREE.Mesh;
      index: number;
      // Spring state
      y: number;
      vy: number;
      targetY: number;
      z: number;
      vz: number;
      targetZ: number;
    }

    const books: BookItem[] = [];

    // Master books container for global responsive centering
    const booksRoot = new THREE.Group();
    scene.add(booksRoot);

    // Create 32 books
    for (let i = 0; i < 32; i++) {
      const coverIndex = BOOK_INDICES[i];
      const coverDef = ALL_COVERS[coverIndex];
      const baseSheet = coverDef.sheet === "A" ? sheetATexture : sheetBTexture;

      // Cover texture clone with trim
      const coverTex = baseSheet.clone();
      coverTex.needsUpdate = true;
      coverTex.colorSpace = THREE.SRGBColorSpace;
      coverTex.anisotropy = maxAniso;

      const repeatU = (coverDef.w - 6) / 2336;
      const repeatV = (coverDef.h - 6) / 1744;
      const offsetU = (coverDef.x + 3) / 2336;
      const offsetV = 1 - (coverDef.y + coverDef.h - 3) / 1744;

      coverTex.repeat.set(repeatU, repeatV);
      coverTex.offset.set(offsetU, offsetV);

      // Spine & back color: cover's spine colour * 0.62
      const spineColorObj = new THREE.Color(coverDef.spineColor).multiplyScalar(0.62);

      const spineMat = new THREE.MeshPhysicalMaterial({
        color: spineColorObj,
        roughness: 0.55,
        clearcoat: 0.3,
      });

      const coverMat = new THREE.MeshPhysicalMaterial({
        map: coverTex,
        roughness: 0.42,
        clearcoat: 0.55,
        clearcoatRoughness: 0.35,
      });

      const backMat = new THREE.MeshStandardMaterial({
        color: spineColorObj,
        roughness: 0.6,
      });

      // Face materials: +x (fore-edge), -x (spine), +y (top), -y (bottom), +z (cover), -z (back)
      const materials = [
        foreEdgeMat,
        spineMat,
        topBottomMat,
        topBottomMat,
        coverMat,
        backMat,
      ];

      const mesh = new THREE.Mesh(bookGeometry, materials);

      // Group position: (1.55 + i·(−.5), −1.12, .9 + i·(−.2)), rotation.y = .32
      const group = new THREE.Group();
      group.position.set(1.55 + i * -0.5, -1.12, 0.9 + i * -0.2);
      group.rotation.y = 0.32;

      // Initial lift state at -3
      mesh.position.y = -3;
      mesh.position.z = 0;

      group.add(mesh);
      booksRoot.add(group);

      books.push({
        group,
        mesh,
        index: i,
        y: -3,
        vy: 0,
        targetY: -3,
        z: 0,
        vz: 0,
        targetZ: 0,
      });
    }

    // Dynamic adjustment to center the row nicely across varying viewport widths
    const updateCentering = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspect = width / height;

      // If the screen is extra wide, shift the books slightly left to bring them closer to center
      if (aspect > 1.9) {
        const offset = Math.min((aspect - 1.9) * 0.45, 0.65);
        booksRoot.position.x = -offset;
      } else if (width <= 760) {
        booksRoot.position.x = 0.4;
      } else {
        booksRoot.position.x = 0;
      }
    };
    updateCentering();

    // --- 5. Interaction & Pointer Handling ---
    let pointerX = -9999;
    let pointerY = -9999;
    let hasPointer = false;
    let lastPointerMoveTime = performance.now();
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      hasPointer = true;
      lastPointerMoveTime = performance.now();
      if ("touches" in e) {
        if (e.touches.length > 0) {
          pointerX = e.touches[0].clientX;
          pointerY = e.touches[0].clientY;
        }
      } else {
        pointerX = (e as MouseEvent).clientX;
        pointerY = (e as MouseEvent).clientY;
      }
    };

    const onPointerLeave = () => {
      hasPointer = false;
    };

    const onBlur = () => {
      hasPointer = false;
    };

    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("touchstart", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);
    window.addEventListener("blur", onBlur);

    // --- 6. Resize Handling ---
    const onResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.fov = getTargetFov();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      updateCentering();
    };
    window.addEventListener("resize", onResize);

    // --- 7. Animation Loop with Springs ---
    let animationFrameId: number;
    let lastTime = performance.now();
    const startTime = performance.now();

    const samplePoint = new THREE.Vector3(0, 0.1, 0);
    const screenCoord = new THREE.Vector3();

    // Springs parameters
    const K = 70;
    const C = 12.5;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const elapsedTime = (now - startTime) / 1000;

      // Determine active cursor position
      let activeX = pointerX;
      let activeY = pointerY;
      let isSweepActive = false;

      const idleDuration = (now - lastPointerMoveTime) / 1000;
      if (isCoarse || !hasPointer || idleDuration > 4) {
        isSweepActive = true;
      }

      if (isSweepActive) {
        // Virtual cursor sweeps between book 29 and book 1 projected to the screen
        const u = (Math.sin(elapsedTime * 0.45) + 1) / 2;

        const b1 = books[1];
        const b29 = books[29];

        let p1X = window.innerWidth * 0.7;
        let p1Y = window.innerHeight * 0.8;
        let p29X = window.innerWidth * 0.2;
        let p29Y = window.innerHeight * 0.4;

        if (b1 && b29) {
          b1.mesh.getWorldPosition(screenCoord);
          screenCoord.project(camera);
          p1X = ((screenCoord.x + 1) / 2) * window.innerWidth;
          p1Y = ((-screenCoord.y + 1) / 2) * window.innerHeight;

          b29.mesh.getWorldPosition(screenCoord);
          screenCoord.project(camera);
          p29X = ((screenCoord.x + 1) / 2) * window.innerWidth;
          p29Y = ((-screenCoord.y + 1) / 2) * window.innerHeight;
        }

        activeX = p29X + u * (p1X - p29X);
        activeY = p29Y + u * (p1Y - p29Y);
      }

      const s = Math.max(window.innerWidth, window.innerHeight) * 0.085;
      const sSq = s * s;

      // Update each book
      for (let i = 0; i < books.length; i++) {
        const book = books[i];

        // Intro check: starts at y = -3, rises when t > 0.25 + (32 - i) * 0.035
        const introThreshold = 0.25 + (32 - i) * 0.035;
        const hasRisen = elapsedTime > introThreshold;

        let targetLift = 0;
        if (hasRisen) {
          // Project (0, .1, 0) of mesh to screen pixels
          book.mesh.localToWorld(screenCoord.copy(samplePoint));
          screenCoord.project(camera);

          const sx = ((screenCoord.x + 1) / 2) * window.innerWidth;
          const sy = ((-screenCoord.y + 1) / 2) * window.innerHeight;

          const dx = sx - activeX;
          const dy = (sy - activeY) * 0.55;
          const distSq = dx * dx + dy * dy;

          const influence = Math.exp(-distSq / sSq);
          targetLift = 0.78 * influence;
        }

        book.targetY = hasRisen ? targetLift : -3;
        book.targetZ = hasRisen ? targetLift * 0.35 : 0;

        // 4 sub-steps per frame
        const substeps = 4;
        const h = dt / substeps;

        for (let step = 0; step < substeps; step++) {
          // Vertical spring
          const forceY = (book.targetY - book.y) * K - book.vy * C;
          book.vy += forceY * h;
          book.y += book.vy * h;

          // Forward spring (local z)
          const forceZ = (book.targetZ - book.z) * K - book.vz * C;
          book.vz += forceZ * h;
          book.z += book.vz * h;
        }

        // Apply position
        book.mesh.position.y = book.y;
        book.mesh.position.z = book.z;

        // Lean slightly while it moves: mesh.rotation.x = -v * .012
        book.mesh.rotation.x = -book.vy * 0.012;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("touchstart", onPointerMove);
      window.removeEventListener("touchmove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerLeave);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("resize", onResize);

      roomEnv.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
      bookGeometry.dispose();
      foreEdgeTex.dispose();
      topBottomTex.dispose();
      foreEdgeMat.dispose();
      topBottomMat.dispose();
      sheetATexture.dispose();
      sheetBTexture.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-[2]"
      aria-hidden="true"
    />
  );
}
