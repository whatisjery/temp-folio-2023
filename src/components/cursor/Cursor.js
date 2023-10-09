import * as utils from '../../utils';

import gsap from 'gsap';
import Ticker from '../../core/Ticker';

import { GAME, SIZES } from '../../constant';
import { store } from '../../store';
import CursorGameTriggers from './CursorGameTrigger';

export default class Cursor extends Ticker {
    constructor() {
        super();

        this.current = { x: 0, y: 0 };
        this.last = { x: 0, y: 0 };
        this.bounds = { x: 0, y: 0 };
        this.mouse = { x: window.innerWidth / 2.25, y: window.innerHeight / 1.8 };
        this.ease = 0.12;
        this.speedThreshold = 30;
        this.mouseSpeed = 0;

        this.cursor = document.querySelector('.cursor');
        this.cursorDotPath = '.cursor__dot circle';
        this.cursorCircle = '.cursor__circle';
        this.cursorDot = '.cursor__dot';
        this.cursorBubble = document.querySelector('.cursor__bubble');
        this.cursorTextBubble = document.querySelector('.cursor__text-bubble');
        this.cursorCirclePath = document.querySelector('.cursor__circle-path');
        this.dataHover = document.querySelectorAll('[data-cursor-hover]');
        this.dataBubble = document.querySelectorAll('[data-cursor-bubble]');
        this.circlePath = this.cursorCirclePath.firstElementChild.getTotalLength() + 1;

        this.gameTrigger = new CursorGameTriggers(
            this.cursorCirclePath,
            this.circlePath,
            this.cursorDotPath,
            this.bounds
        );

        this.cursorListeners = [];
        this.globalListeners = [];
    }

    mount = () => {
        this.initStyles();
        this.addTicker();
        this.addListeners();
    };

    destroy = () => {
        this.removeTicker();
        this.cursorListeners.forEach(el => el.remove());
        this.globalListeners.forEach(el => el.remove());
    };

    initStyles = () => {
        this.yBubbleSetter = gsap.quickSetter(this.cursorBubble, 'y', 'px');
        this.xBubbleSetter = gsap.quickSetter(this.cursorBubble, 'x', 'px');
        this.xCircleSetter = gsap.quickSetter(this.cursorCircle, 'x', 'px');
        this.yCircleSetter = gsap.quickSetter(this.cursorCircle, 'y', 'px');
        this.xDotSetter = gsap.quickSetter(this.cursorDot, 'x', 'px');
        this.yDotSetter = gsap.quickSetter(this.cursorDot, 'y', 'px');
        this.scaleXSetter = gsap.quickSetter(this.cursorCirclePath, 'scaleX');
        this.rotateSetter = gsap.quickSetter(this.cursorCirclePath, 'rotate', 'deg');

        gsap.set([this.cursorCircle, this.cursorDot, this.cursorBubble], {
            xPercent: -50,
            yPercent: -50
        });

        gsap.set(this.cursorCirclePath, {
            strokeDasharray: `${this.circlePath} ${this.circlePath}`
        });
    };

    trackCursorPosition = ({ clientX, clientY }) => {
        this.mouse.x = clientX;
        this.mouse.y = clientY;
    };

    getMouseSpeed = (deltaX, deltaY) => {
        const vX = utils.clamp(Math.abs(deltaX) / this.speedThreshold, 0, 1);
        const vY = utils.clamp(Math.abs(deltaY) / this.speedThreshold, 0, 1);

        this.mouseSpeed = vX + vY;

        if (this.mouseSpeed < 0.01) this.mouseSpeed = 0;
    };

    applyStrechEffect = (deltaX, deltaY) => {
        if (this.gameTrigger.state === GAME.stopped) {
            const rotation = Math.atan2(deltaY, deltaX) * (180 / Math.PI).toFixed();

            this.rotateSetter(rotation);
            this.scaleXSetter(1 + this.mouseSpeed);
        } else {
            this.rotateSetter(0);
            this.scaleXSetter(1);
        }
    };

    smoothCursorPosition = () => {
        const t = utils.getDeltaTime(this.ease);

        this.last.x = this.current.x;
        this.last.y = this.current.y;

        if (this.bounds.x) {
            this.current.x = utils.lerp(this.last.x, this.bounds.x, t);

            this.xDotSetter(this.current.x + (this.bounds.x - this.last.x) * t);
        } else {
            this.current.x = utils.lerp(this.last.x, this.mouse.x, t);

            // Adds up a bit a delay for the dot.
            this.xDotSetter(this.current.x + (this.mouse.x - this.last.x) * t);
        }

        if (this.bounds.y) {
            this.current.y = utils.lerp(this.last.y, this.bounds.y, t);

            this.yDotSetter(this.current.y + (this.bounds.y - this.last.y) * t);
        } else {
            this.current.y = utils.lerp(this.last.y, this.mouse.y, t);

            // Adds up a bit a delay for the dot.
            this.yDotSetter(this.current.y + (this.mouse.y - this.last.y) * t);
        }

        this.xCircleSetter(this.current.x);
        this.yCircleSetter(this.current.y);
        this.xBubbleSetter(this.current.x);
        this.yBubbleSetter(this.current.y);
    };

    dataStickToElement = bounds => {
        this.bounds = {
            x: bounds.x - 5,
            y: bounds.y + 3 + bounds.height / 2
        };

        gsap.to(this.cursorDotPath, {
            scale: 0.7,
            ease: 'expo.out',
            zIndex: 101
        });

        gsap.to(this.cursorCirclePath, {
            opacity: 0,
            duration: 1,
            ease: 'expo.out',
            strokeDashoffset: `${this.circlePath}`
        });
    };

    dataFollowElements = bounds => {
        this.bounds = {
            x: bounds.x / 1.025
        };

        gsap.to(this.cursorCirclePath, {
            opacity: 0,
            duration: 1,
            ease: 'expo.out',
            strokeDashoffset: `${this.circlePath}`
        });
    };

    dataRingToElement = bounds => {
        this.bounds = {
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2 + 2
        };

        gsap.to(this.cursorDotPath, {
            scale: 0
        });
    };

    dataResetCircle = () => {
        gsap.to(this.cursorCirclePath, {
            opacity: 1,
            duration: 1,
            ease: 'expo.out',
            strokeDashoffset: 0,

            onComplete: () => {
                delete this.cursor.dataset.active;
            }
        });
    };

    dataResetDot = () => {
        gsap.to(this.cursorDotPath, {
            scale: 1,

            onComplete: () => {
                delete this.cursor.dataset.active;
            }
        });
    };

    onDataHover = ({ currentTarget }) => {
        if (this.gameTrigger.state === GAME.starting) {
            this.gameTrigger.interuptStart();
            return;
        }

        gsap.killTweensOf([this.cursorDotPath, this.cursorCirclePath]);

        this.cursor.dataset.active = true;

        const attributeType = currentTarget.getAttribute('data-cursor-hover');
        const bounds = currentTarget.getBoundingClientRect();

        if (attributeType === 'stick') {
            this.dataStickToElement(bounds);
        } else if (attributeType === 'follow') {
            this.dataFollowElements(bounds);
        } else if (attributeType === 'ring') {
            this.dataRingToElement(bounds);
        }
    };

    onDataReset = ({ currentTarget }) => {
        if (this.gameTrigger.state === GAME.starting) {
            this.gameTrigger.interuptStart();
            return;
        }

        this.bounds = { x: 0, y: 0 };

        const attributeType = currentTarget.getAttribute('data-cursor-hover');

        if (attributeType === 'follow' || attributeType === 'stick') {
            this.dataResetCircle();
        } else {
            this.dataResetDot();
        }
    };

    showTextBubble = ({ currentTarget }) => {
        const opt = JSON.parse(currentTarget.getAttribute('data-cursor-bubble'));

        this.cursorTextBubble.innerHTML = opt[0];

        gsap.set([this.cursorCirclePath, this.cursorDotPath], {
            opacity: 0
        });

        gsap.set(this.cursorBubble, {
            backgroundColor: `var(${opt[1]})`,
            color: `var(${opt[2]})`
        });

        gsap.to(this.cursorBubble, {
            scale: 1,
            ease: 'expo.out',
            duration: 0.5
        });
    };

    hideTextBubble = () => {
        this.cursorTextBubble.innerHTML = null;

        gsap.set(this.cursorBubble, {
            background: 'var(--color-accent)'
        });

        gsap.set([this.cursorCirclePath, this.cursorDotPath], {
            opacity: 1
        });

        gsap.to(this.cursorBubble, {
            scale: 0,
            ease: 'expo.out',

            onComplete: () => {
                delete this.cursor.dataset.active;
            }
        });
    };

    handleMouseUp = ({ button, target }) => {
        if (utils.isDevice() || window.innerWidth <= SIZES.s) return;

        if (button === 2 || this.cursor.dataset.active) return;

        if (target.closest('.game-area')) {
            if (this.gameTrigger.state === GAME.running) this.gameTrigger.stop();

            if (this.gameTrigger.state === GAME.stopped && store.snake === undefined) {
                this.gameTrigger.start();
            }
        }
    };

    handleMouseDown = ({ target }) => {
        if (utils.isDevice() || window.innerWidth <= SIZES.s) return;

        if (target.closest('.game-area')) {
            if (this.gameTrigger.state === GAME.stopping) this.gameTrigger.interuptStop();

            if (this.gameTrigger.state === GAME.starting) this.gameTrigger.interuptStart();
        }
    };

    handleResize = () => {
        if (utils.isDevice() || window.innerWidth <= SIZES.s) {
            gsap.to('.cursor', { opacity: 0 });
        } else {
            gsap.to('.cursor', { opacity: 1 });
        }
    };

    addListeners = () => {
        this.cursorListeners.push(utils.listen(window, 'mousemove', this.trackCursorPosition));
        this.cursorListeners.push(utils.listen(window, 'resize', this.handleResize));

        this.dataHover.forEach(el => {
            this.cursorListeners.push(utils.listen(el, 'mousemove', this.onDataHover));
            this.cursorListeners.push(utils.listen(el, 'mouseleave', this.onDataReset));
        });

        this.dataBubble.forEach(el => {
            this.cursorListeners.push(utils.listen(el, 'mouseenter', this.showTextBubble));
            this.cursorListeners.push(utils.listen(el, 'mouseleave', this.hideTextBubble));
        });

        if (navigator.maxTouchPoints > 0) {
            this.cursorListeners.push(utils.listen(window, 'touchend', this.handleMouseDown));
            this.cursorListeners.push(utils.listen(window, 'touchstart', this.handleMouseUp));
        } else {
            this.cursorListeners.push(utils.listen(window, 'mouseup', this.handleMouseDown));
            this.cursorListeners.push(utils.listen(window, 'mousedown', this.handleMouseUp));
        }
    };

    updateTicker = () => {
        this.smoothCursorPosition();

        const deltaX = this.current.x - this.last.x;
        const deltaY = this.current.y - this.last.y;

        this.getMouseSpeed(deltaX, deltaY);
        this.applyStrechEffect(deltaX, deltaY);
    };
}
