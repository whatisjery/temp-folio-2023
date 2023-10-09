import gsap from 'gsap';
import Ticker from '../../core/Ticker';
import * as utils from '../../utils';

import { store } from '../../store';

export default class Rotation extends Ticker {
    constructor(element) {
        super();

        this.element = element;
        this.progress = 0;
        this.speed = 0.2;
        this.multiplier = 50;
    }

    mount = () => {
        this.addTicker();

        this.rotateSetter = gsap.quickSetter(this.element, 'rotate', 'deg');
    };

    destroy() {
        this.removeTicker();
    }

    updateTicker = () => {
        if (!utils.inView(this.element)) return;

        const dt = utils.getDeltaTime(this.speed);
        const option = this.element.getAttribute('data-rotation');

        if (option === 'fast') {
            this.speed = 0.7;
            this.multiplier = 80;
        }

        if (store.scroll.direction === 1) {
            this.progress -= dt + -store.scroll.scrollSpeed * (this.multiplier * dt);
        } else {
            this.progress += dt + store.scroll.scrollSpeed * (this.multiplier * dt);
        }

        this.rotateSetter(this.progress);
    };
}
