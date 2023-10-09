import * as THREE from 'three';
import * as utils from '../../utils';

import gsap from 'gsap';
import Emitter from '../../core/Emitter';
import fragment from '../../shaders/media/fragment.glsl';
import vertex from '../../shaders/media/vertex.glsl';

import { EMITTERS, LAYERS, SIZES } from '../../constant';
import { store } from '../../store';

export default class ThreeMedia {
    constructor({ image, scene, isResume, texture }) {
        this.image = image;
        this.scene = scene;
        this.texture = texture;
        this.isResume = isResume;

        this.mouseVec = new THREE.Vector2();
        this.isHovering = false;
        this.isResumeShowing = false;
        this.timeoutId = null;
        this.listeners = [];

        this.mount();
    }

    mount = () => {
        this.createMesh();

        Emitter.on(EMITTERS.showResume, this.onShowResume);
        Emitter.on(EMITTERS.hideResume, this.onHideResume);

        this.listeners.push(utils.listen(this.image, 'mousemove', this.onMouseMove));
        this.listeners.push(utils.listen(this.image, 'mouseenter', this.onMouseEnter));
        this.listeners.push(utils.listen(this.image, 'mouseleave', this.onMouseLeave));
    };

    destroy = () => {
        this.listeners.forEach(el => el.remove());

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }

        Emitter.off(EMITTERS.showResume);
        Emitter.off(EMITTERS.hideResume);

        this.texture.dispose();
        this.material.dispose();
        this.geometry.dispose();

        this.scene.remove(this.mesh);
    };

    setDimensions = () => {
        const bounds = this.image.getBoundingClientRect();

        this.mesh.position.set(
            bounds.left - window.innerWidth / 2 + bounds.width / 2,
            -bounds.top + window.innerHeight / 2 - bounds.height / 2,
            0
        );

        this.mesh.scale.set(bounds.width, bounds.height);
    };

    createMesh = () => {
        this.geometry = new THREE.PlaneGeometry(1, 1, 30, 30);

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uTexture: { value: this.texture },
                uScrollSpeed: { value: 0 },
                uIsHover: { value: 0 },
                uOpacity: { value: 0 },
                uIsResume: { value: this.isResume },
                uResumeTransition: { value: 0 },
                uMouseSpeed: { value: 0 },
                uMsize: { value: window.innerWidth <= SIZES.m ? 1 : 0 },
                uMouse: { value: new THREE.Vector2() }
            },
            side: THREE.DoubleSide,
            fragmentShader: fragment,
            vertexShader: vertex
        });

        this.material.depthWrite = false;
        this.material.transparent = true;
        this.material.blending = THREE.NormalBlending;

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
        this.mesh.layers.set(LAYERS.media);

        this.mesh.frustumCulled = false;

        this.setDimensions();
    };

    onResize = () => {
        this.material.uniforms.uMsize.value = window.innerWidth <= SIZES.m ? 1 : 0;

        this.setDimensions();
    };

    update = time => {
        if (store.scroll.isScrolling || this.isResumeShowing) {
            this.setDimensions();
        }

        if (this.isHovering) {
            const bounds = this.image.getBoundingClientRect();
            const vec = {
                x: (store.cursor.current.x - bounds.left) / bounds.width,
                y: (store.cursor.current.y - bounds.top) / bounds.height
            };
            this.mouseVec.set(vec.x, vec.y);
            this.material.uniforms.uMouse.value = this.mouseVec;
        }

        this.material.uniforms.uTime.value = time;
        this.material.uniforms.uScrollSpeed.value = store.scroll.scrollSpeed;
        this.material.uniforms.uMouseSpeed.value = store.cursor.mouseSpeed;
    };

    onMouseEnter = () => {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }

        this.isHovering = true;

        gsap.to(this.material.uniforms.uIsHover, {
            duration: 1.5,
            ease: 'expo.out',
            value: 1
        });
    };

    onMouseLeave = () => {
        this.timeoutId = setTimeout(() => (this.isHovering = false), 500);

        gsap.to(this.material.uniforms.uIsHover, {
            duration: 1.5,
            ease: 'expo.out',
            value: 0
        });
    };

    onShowResume = sharedEasing => {
        gsap.to(this.material.uniforms.uOpacity, {
            ...sharedEasing,
            value: 1,
            onStart: () => (this.isResumeShowing = true)
        });

        gsap.fromTo(
            this.material.uniforms.uResumeTransition,
            { value: 0.5 },
            { value: 0, ...sharedEasing }
        );
    };

    onHideResume = sharedEasing => {
        gsap.to(this.material.uniforms.uOpacity, {
            ...sharedEasing,
            value: 0,
            onComplete: () => {
                this.isResumeShowing = false;
            }
        });

        gsap.fromTo(
            this.material.uniforms.uResumeTransition,
            { value: 0 },
            { value: 0.2, ...sharedEasing }
        );
    };
}
