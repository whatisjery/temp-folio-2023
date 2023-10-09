import * as THREE from 'three';
import * as utils from '../../utils';

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Emitter from '../../core/Emitter';

import { EMITTERS, LAYERS, SIZES } from '../../constant';
import { store } from '../../store';

export default class ThreeModel {
    constructor({ scene, modelCamera, gltf, customPass }) {
        this.scene = scene;
        this.modelCamera = modelCamera;
        this.gltf = gltf;
        this.customPass = customPass;

        this.webglCanvas = '.canvas__webgl';
        this.aboutSection = document.querySelector('.about');
        this.footerSection = document.querySelector('.footer');
        this.modelAnchor = document.querySelector('.grid__model-anchor');

        this.mixer = null;
        this.model = null;
        this.actions = [];
        this.sizeFactor = 1210;

        this.mount();
    }

    mount = async () => {
        this.initModel();
        this.createLights();
        this.onGameStart();
        this.onGameStop();

        this.scrollSetter = gsap.quickSetter(this.modelAnchor, 'translateY', 'px');
    };

    destroy = () => {
        if (this.mixer) this.mixer.stopAllAction();

        this.scene.remove(this.model);
    };

    createLights = () => {
        const ambientLight = new THREE.AmbientLight(0xffffff, 3);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.3);
        directionalLight.position.set(0.55, 0.7, 1);
        this.scene.add(directionalLight);

        ambientLight.layers.enable(LAYERS.model);
        directionalLight.layers.enable(LAYERS.model);
    };

    initModel = () => {
        this.scene.add(this.gltf.scene);

        this.model = this.gltf.scene.children[0];

        this.updateScale();
        this.modelPosition();
        this.toggleModelVisibility();
        this.topModelPos();

        this.mixer = new THREE.AnimationMixer(this.model);
        this.mixer.clipAction(this.gltf.animations[0]).play();

        this.mapActions(this.gltf);
        this.playAction('walking');
        this.onScrollAtTop();
        this.onScrollAtFooter();

        this.model.rotation.z = 0.2;
    };

    mapActions = gltf => {
        this.actions = gltf.animations.map(anim => ({
            animation: this.mixer.clipAction(anim),
            name: anim.name
        }));
    };

    playAction = actionName => {
        this.actions.forEach(({ name, animation }) => {
            if (name === actionName) {
                animation.play();
                animation.reset();
            } else {
                animation.stop();
            }
        });
    };

    getAction = name => {
        return this.actions.find(action => {
            if (action.name === name) return action;
        }).animation;
    };

    crossFadeAction = (from, to) => {
        const fromAction = this.getAction(from);
        const toAction = this.getAction(to);

        toAction.setLoop(THREE.LoopOnce, 0);
        toAction.clampWhenFinished = true;
        toAction.time = 0;

        toAction.play();

        if (fromAction.isRunning()) {
            fromAction.crossFadeTo(toAction, 0.3, false);
        }
    };

    toggleModelVisibility = () => {
        this.model.traverse(object => (object.visible = window.innerWidth >= SIZES.s));
    };

    topModelPos = () => {
        if (window.innerWidth <= SIZES.m) {
            gsap.set(this.modelAnchor, { gridColumn: 1, marginLeft: '10vw' });
        } else {
            gsap.set(this.modelAnchor, { gridColumn: 3, marginLeft: '-1vw' });
        }
    };

    bottomModelPos = () => {
        if (window.innerWidth <= SIZES.m) {
            gsap.set(this.modelAnchor, { gridColumn: 7, marginLeft: '-3vw' });
        } else {
            gsap.set(this.modelAnchor, { gridColumn: 3, marginLeft: '0vw' });
        }
    };

    modelPosition = () => {
        const bounds = this.modelAnchor.getBoundingClientRect();

        this.model.position.set(
            bounds.left - window.innerWidth / 2 + bounds.width / 2,
            -bounds.top + window.innerHeight / 2 - bounds.height / 2,
            0
        );
    };

    updateScale = () => {
        const maxScaleFactor = Math.max(window.innerHeight / this.sizeFactor);
        this.model.scale.set(maxScaleFactor, maxScaleFactor, maxScaleFactor);
    };

    onResize = () => {
        this.toggleModelVisibility();
        this.updateScale();
    };

    onScrollAtTop = () => {
        ScrollTrigger.create({
            trigger: this.aboutSection,
            start: 'top bottom',

            onEnter: () => {
                this.playAction('walking');
            },

            onEnterBack: () => {
                this.playAction('walking');
                this.model.rotation.z = 0.2;
            },

            onUpdate: ({ progress }) => {
                this.topModelPos();

                this.scrollSetter(-store.scroll.last * progress * 8.5);
            }
        });
    };

    onScrollAtFooter = () => {
        ScrollTrigger.create({
            trigger: this.footerSection,

            onEnter: () => {
                this.playAction('waiting');
                Emitter.emit(EMITTERS.footerEnter);
            },

            onUpdate: ({ progress }) => {
                if (!this.model) return;

                this.bottomModelPos();

                let y = 0;

                y = Math.round(utils.mapRange(0, 0.5, window.innerHeight + 1300, 0, progress));

                this.model.rotation.z = y * 0.005;

                this.scrollSetter(y);
            }
        });
    };

    onGameStart = () => {
        Emitter.on(EMITTERS.gameStart, () => {
            this.crossFadeAction('waiting', 'falling');

            gsap.to(this.webglCanvas, {
                ease: 'customEase',
                duration: 1,
                opacity: 0,
                delay: 2
            });
        });
    };

    onGameStop = () => {
        Emitter.on(EMITTERS.gameStop, () => {
            this.playAction('waiting');

            gsap.to(this.webglCanvas, {
                ease: 'customEase',
                duration: 1,
                opacity: 1
            });
        });
    };

    update = () => {
        if (this.mixer) this.mixer.update(gsap.ticker.deltaRatio() * 0.015);
        if (this.model) this.modelPosition();
    };
}
