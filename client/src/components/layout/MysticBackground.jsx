import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const MysticBackground = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        // Configuração básica Three.js para partículas estelares
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x0b0a1d, 0.0); // Transparent to potential gradients behind
        mountRef.current.appendChild(renderer.domElement);

        // Criar partículas (estrelas)
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 2000; // Reduced count slightly for performance safety
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 1000;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.7,
            transparent: true,
            opacity: 0.8
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        // Nebulosa central (ponto de luz discreto) - Removed strong light to let CSS gradients do heavy lifting
        // const nebulaLight = new THREE.PointLight(0x9d4edd, 0.5, 300);
        // nebulaLight.position.set(0, 0, 0);
        // scene.add(nebulaLight);

        camera.position.z = 500;

        // Animação suave
        let animationFrameId;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            stars.rotation.y += 0.0003;
            stars.rotation.x += 0.0001;
            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            starGeometry.dispose();
            starMaterial.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{
                background: 'radial-gradient(ellipse at center, rgba(157, 78, 221, 0.1) 0%, rgba(11, 10, 29, 0) 70%)'
            }}
        />
    );
};

export default MysticBackground;
