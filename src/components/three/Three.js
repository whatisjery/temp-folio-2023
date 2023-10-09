import * as THREE from 'three';
import * as utils from '../../utils';

import Ticker from '../../core/Ticker';
import fragment from '../../shaders/postprocessing/fragment.glsl';
import vertex from '../../shaders/postprocessing/vertex.glsl';
import ThreeMedia from './ThreeMedia';
import ThreeModel from './ThreeModel';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { LAYERS } from '../../constant';
import { store } from '../../store';

export default class Three extends Ticker {
    constructor({ gltf, loadedAssets }) {
        super();

        this.distance = 2500;
        this.time = 0;
        this.isAtFooter = 0;
        this.webglCanvas = document.querySelector('.canvas__webgl');
        this.loadedAssets = loadedAssets;
        this.scene = new THREE.Scene();
        this.model = undefined;
        this.medias = [];
        this.gltf = gltf;

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspectRatio = this.width / this.height;
        this.pixelRatio = Math.min(window.devicePixelRatio, 0.6);
        this.fov = 2 * Math.atan(this.height / 2 / this.distance) * (180 / Math.PI);
        this.listener = null;
    }

    mount = () => {
        this.addTicker();
        this.setModelCamera();
        this.setRenderer();
        this.createImages();
        this.createModel();
        this.postProcessingPass();

        this.listener = utils.listen(window, 'resize', this.onResize);
    };

    destroy = () => {
        this.removeTicker();

        if (this.listener) this.listener.remove();

        this.medias.forEach(media => media.destroy());
        this.model.destroy();

        this.composer.dispose();
        this.renderer.dispose();

        this.modelCamera = null;
        this.mediaCamera = null;
    };

    setModelCamera = () => {
        this.modelCamera = new THREE.PerspectiveCamera(
            this.fov,
            this.aspectRatio,
            this.distance * 0.1,
            this.distance * 2
        );

        this.modelCamera.position.setZ(this.distance);
        this.modelCamera.layers.set(LAYERS.model);

        this.mediaCamera = new THREE.PerspectiveCamera(
            this.fov,
            this.aspectRatio,
            this.distance * 0.001,
            this.distance
        );

        this.mediaCamera.position.setZ(this.distance);
        this.mediaCamera.layers.set(LAYERS.media);
    };

    setRenderer = () => {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            depth: true,
            canvas: this.webglCanvas
        });

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width * this.pixelRatio, this.height * this.pixelRatio, false);
    };

    postProcessingPass = () => {
        this.composer = new EffectComposer(this.renderer);
        this.renderPass = new RenderPass(this.scene, this.modelCamera);
        this.composer.addPass(this.renderPass);

        this.customPass = new ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                uScrollSpeed: { value: 0 },
                uTime: { value: 0 }
            },
            vertexShader: vertex,
            fragmentShader: fragment
        });

        this.customPass.renderToScreen = true;

        this.composer.addPass(this.customPass);
    };

    createImages = () => {
        this.medias = this.loadedAssets.map(data => {
            const resume = data.image.classList.contains('resume__img');

            return new ThreeMedia({
                image: data.image,
                texture: data.imageTexture,
                scene: this.scene,
                isResume: resume ? 1 : 0
            });
        });
    };

    createModel = () => {
        this.model = new ThreeModel({
            scene: this.scene,
            modelCamera: this.modelCamera,
            gltf: this.gltf,
            customPass: this.customPass
        });
    };

    resizeViewport = () => {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspectRatio = this.width / this.height;
        this.pixelRatio = Math.min(window.devicePixelRatio, 0.6);

        let fovCalculation = 2 * Math.atan(this.height / 2 / this.distance) * (180 / Math.PI);

        this.fov = fovCalculation;
    };

    resizeCameras = () => {
        this.mediaCamera.fov = this.fov;
        this.modelCamera.fov = this.fov;

        this.mediaCamera.aspect = this.aspectRatio;
        this.modelCamera.aspect = this.aspectRatio;

        this.mediaCamera.updateProjectionMatrix();
        this.modelCamera.updateProjectionMatrix();
    };

    resizeRenderer = () => {
        this.renderer.setSize(this.width * this.pixelRatio, this.height * this.pixelRatio, false);
    };

    updateTicker = () => {
        this.time += 0.05;

        this.medias.map(media => media.update(this.time));
        this.model.update(this.time);

        this.renderer.autoClear = false;

        this.renderer.clear();
        this.composer.render();

        this.renderer.clearDepth();
        this.renderer.render(this.scene, this.mediaCamera);

        this.customPass.uniforms.uTime.value = this.time;

        if (store.loading) {
            this.customPass.uniforms.uScrollSpeed.value = store.loader.transition.progress;
        } else {
            this.customPass.uniforms.uScrollSpeed.value = store.scroll.scrollSpeed;
        }
    };

    onResize = () => {
        this.resizeViewport();
        this.resizeRenderer();
        this.resizeCameras();

        this.medias.forEach(media => media.onResize());

        this.model.onResize();
    };
}
