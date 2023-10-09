import gsap from 'gsap';
import Ticker from '../../core/Ticker';
import * as utils from '../../utils';

import { store } from '../../store';

export default class Ribbon extends Ticker {
    constructor() {
        super();

        this.ribbon = document.querySelector('.ribbon');

        this.progress = 0;
        this.multiplier = 2.4;
        this.listeners = [];
        this.bounds = null;
    }

    mount = () => {
        this.addTicker();

        this.listeners.push(utils.listen(window, 'resize', this.getBounds));
        this.translateSetter = gsap.quickSetter(this.ribbon, 'translateX', 'px');
    };

    destroy = () => {
        this.removeTicker();

        this.listeners.forEach(el => el.remove());
        this.bounds = null;
    };

    getBounds = () => {
        this.ribbon.offsetHeight;
        this.bounds = this.ribbon.firstElementChild.getBoundingClientRect();
    };

    getSpeed = () => {
        if (!store.snake) {
            return (1 + Math.abs(store.scroll.scrollSpeed) * 50) * this.multiplier;
        } else {
            // Adds up a bit a speed when food gets eaten
            const mouseSpeed = store.cursor.mouseSpeed * 0.1;

            return (1 + Math.abs(store.scroll.scrollSpeed + mouseSpeed) * 50) * this.multiplier;
        }
    };

    updateTicker = () => {
        if (!utils.inView(this.ribbon)) return;

        if (!this.bounds) this.getBounds();

        const dt = gsap.ticker.deltaRatio();

        this.progress -= this.getSpeed() * dt;

        if (Math.abs(this.progress) >= this.bounds.width) {
            this.progress = 0;
        }

        this.translateSetter(this.progress);
    };
}
