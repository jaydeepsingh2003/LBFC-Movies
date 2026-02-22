
'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

export function CinemaCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -1000, y: -1000 });
  const target = useRef({ x: -1000, y: -1000 });
  const isHovering = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return; // Disable on touch devices

    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -window.innerWidth / 2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      -window.innerHeight / 2,
      0.1,
      1000
    );
    camera.position.z = 1;

    // Particle Nebula
    const particlesCount = 40;
    const positions = new Float32Array(particlesCount * 3);
    const opacities = new Float32Array(particlesCount);
    const sizes = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      opacities[i] = Math.random();
      sizes[i] = Math.random() * 4 + 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      uniforms: {
        uColor: { value: new THREE.Color('#e11d48') },
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute float opacity;
        varying float vOpacity;
        void main() {
          vOpacity = opacity;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 4.0 * (1.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vOpacity;
        uniform vec3 uColor;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          gl_FragColor = vec4(uColor, vOpacity * (1.0 - d * 2.0));
        }
      `,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Main Glow Ring
    const ringGeo = new THREE.RingGeometry(12, 14, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#e11d48',
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    scene.add(ring);

    const handleMouseMove = (e: MouseEvent) => {
      target.current.x = e.clientX - window.innerWidth / 2;
      target.current.y = -e.clientY + window.innerHeight / 2;
    };

    const handleMouseEnter = () => {
      isHovering.current = true;
      gsap.to(ring.scale, { x: 2.5, y: 2.5, duration: 0.4, ease: 'back.out(2)' });
      gsap.to(ringMat, { opacity: 0.1, duration: 0.4 });
    };

    const handleMouseLeave = () => {
      isHovering.current = false;
      gsap.to(ring.scale, { x: 1, y: 1, duration: 0.4, ease: 'back.out(2)' });
      gsap.to(ringMat, { opacity: 0.4, duration: 0.4 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Track hover states globally
    const trackHover = () => {
      const interactives = document.querySelectorAll('button, a, input, [role="button"], .group');
      interactives.forEach(el => {
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
      });
    };
    
    const observer = new MutationObserver(trackHover);
    observer.observe(document.body, { childList: true, subtree: true });
    trackHover();

    let time = 0;
    const animate = () => {
      time += 0.01;
      material.uniforms.uTime.value = time;

      // Smoothed mouse follow
      mouse.current.x += (target.current.x - mouse.current.x) * 0.15;
      mouse.current.y += (target.current.y - mouse.current.y) * 0.15;

      ring.position.x = mouse.current.x;
      ring.position.y = mouse.current.y;

      // Update particles
      const positionsAttr = geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        // Shift trail
        if (i > 0) {
          positionsAttr.array[i3] += (positionsAttr.array[(i - 1) * 3] - positionsAttr.array[i3]) * 0.4;
          positionsAttr.array[i3 + 1] += (positionsAttr.array[(i - 1) * 3 + 1] - positionsAttr.array[i3 + 1]) * 0.4;
        } else {
          positionsAttr.array[i3] = mouse.current.x;
          positionsAttr.array[i3 + 1] = mouse.current.y;
        }
      }
      positionsAttr.needsUpdate = true;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.left = -window.innerWidth / 2;
      camera.right = window.innerWidth / 2;
      camera.top = window.innerHeight / 2;
      camera.bottom = -window.innerHeight / 2;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] pointer-events-none mix-blend-screen"
      style={{ touchAction: 'none' }}
    />
  );
}
