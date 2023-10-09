import * as THREE from 'three';
import * as utils from '../../utils';

import FontFaceObserver from 'fontfaceobserver';
import gsap from 'gsap';
import Emitter from '../../core/Emitter';
import glbModel from '../../models/model.glb';
import LoaderReveal from './LoaderReveal';
import LoaderTransition from './LoaderTransition';

import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EMITTERS, FONTS } from '../../constant';
import { store } from '../../store';

export default class Loader {
    constructor() {
        this.loader = document.querySelector('.loader');
        this.loaderDigit = '.loader__digit';
        this.loaderPrevDigits = [...document.querySelectorAll(`${this.loaderDigit}.prev`)];
        this.loaderNextDigits = [...document.querySelectorAll(`${this.loaderDigit}.next`)];
        this.loaderSlider = document.querySelector('.loader__slider');
        this.preloader = document.querySelector('.preloader');
        this.images = [...document.querySelectorAll('.project__img, .resume__img')];

        this.percProgress = 0;
        this.loadedImages = [];
        this.listener = null;
        this.steps = 2;

        this.transition = new LoaderTransition();
        this.reveal = new LoaderReveal(this.loader, this.transition, this.destroy.bind(this));
    }

    mount = async () => {
        try {
            await Promise.all([this.loadFonts(), this.loadAssets(0)]);

            this.removePreloader();

            this.reveal.setupTimeline();

            this.transition.update();
        } catch (err) {
            console.error(err);
            window.location.pathname = '/broken';
        }
    };

    destroy = () => {
        this.loader.remove();
        this.listener.remove();

        this.transition.kill();
        this.reveal.kill();

        store.loader = undefined;
        store.loading = false;
    };

    delayExecution = async (ms = 500) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    removePreloader = () => {
        this.listener = utils.listen(window, 'DOMContentLoaded', this.preloader.remove());
    };

    loadFonts = () => {
        return Promise.all(FONTS.map(font => new FontFaceObserver(font).load()));
    };

    loadModel = (index = 1) => {
        if (index !== this.steps - 1) return;

        return new Promise(resolve => {
            const dracoLoader = new DRACOLoader();

            dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

            const loader = new GLTFLoader();

            loader.setDRACOLoader(dracoLoader);

            loader.load(glbModel, gltf => {
                this.gltf = gltf;
                resolve(gltf);
            });
        });
    };

    loadImgs = async index => {
        const imagePromises = this.getImagesChunk(index).map(image => {
            return new Promise((resolve, reject) => {
                new THREE.TextureLoader().load(
                    image.src,
                    texture => {
                        this.loadedImages.push({
                            image: image,
                            imageTexture: texture
                        });
                        resolve(true);
                    },
                    undefined,
                    error => {
                        console.error('Error while loading texture:', error);
                        reject(error);
                    }
                );
            });
        });

        await Promise.all(imagePromises);
    };

    loadAssets = async index => {
        try {
            await Promise.all([this.loadImgs(index), this.loadModel(index)]);

            this.loadingCycle(index);
        } catch (err) {
            console.error(err);
            window.location.pathname = '/broken';
        }
    };

    getImagesChunk = index => {
        const chunk = Math.ceil(this.images.length / this.steps);

        return Array.from({ length: this.steps }, (_, index) =>
            this.images.slice(index * chunk, (index + 1) * chunk)
        )[index];
    };

    calcPercProgress = index => {
        const randOffset = 15;
        const min = Math.floor(Math.random() * randOffset * 2) - randOffset;
        const max = 100;

        const percentage = Math.max(0, Math.min(max, ((index + 1) / this.steps) * max + min));

        this.percProgress = index === this.steps - 1 ? 100 : percentage;
    };

    insertLoadingNumbers = elements => {
        elements.forEach((el, index) => {
            let numbers = Math.floor(this.percProgress).toString();
            el.textContent = [...numbers][index];
        });
    };

    nextLoadingStep = index => {
        if (this.percProgress !== 100) {
            this.loadAssets(index + 1);

            gsap.set(this.loaderDigit, { x: 0 });

            this.insertLoadingNumbers(this.loaderNextDigits, this.percProgress);
        } else {
            this.loadingStepsCompleted();
        }
    };

    loadingStepsCompleted = () => {
        Emitter.emit(EMITTERS.assetsLoaded, {
            gltf: this.gltf,
            loadedAssets: this.loadedImages
        });

        this.reveal.startSequence();
    };

    loadingStepStart = () => {
        const width = Number(this.loader.offsetWidth - this.loaderSlider.offsetWidth);

        const padding = window.getComputedStyle(this.loader).paddingLeft;

        const formatedPadding = Number(padding.replace('px', '')) * 2;

        gsap.to(this.loaderSlider, {
            duration: 1.4,
            ease: 'expo.inOut',
            x: ((width - formatedPadding) * this.percProgress) / 100
        });
    };

    loadingCycle = async index => {
        this.calcPercProgress(index);

        this.insertLoadingNumbers(this.loaderPrevDigits);

        await this.delayExecution();

        gsap.to(this.loaderDigit, {
            x: this.loaderSlider.offsetWidth,
            duration: 1.2,
            ease: 'expo.inOut',
            stagger: { amount: -0.2 },

            onStart: () => this.loadingStepStart(),

            onComplete: () => this.nextLoadingStep(index)
        });
    };
}
