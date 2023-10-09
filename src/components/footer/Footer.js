import * as utils from '../../utils';

import gsap from 'gsap';
import Emitter from '../../core/Emitter';
import Ticker from '../../core/Ticker';

import { EMITTERS, SIZES } from '../../constant';
import { store } from '../../store';

export default class Footer extends Ticker {
    constructor() {
        super();
        this.footer = document.querySelector('.footer');
        this.footerEmail = document.querySelector('.footer__email');
        this.footerWrapper = document.querySelector('.footer__wrapper');
        this.footerSliderItem = [...document.querySelectorAll('.footer__slider-item')];
        this.footerGameInfo = document.querySelector('.game-info');

        this.timeline = null;
        this.listeners = [];
    }

    mount = () => {
        this.setupTimeline();
        this.addTicker();
        this.switchText();
        this.parallaxReveal();
        this.displayGameInfos();

        this.listeners.push(utils.listen(this.footerEmail, 'click', this.onCopyEmail));
        this.listeners.push(utils.listen(window, 'resize', this.updateFooterHeight));
        this.listeners.push(utils.listen(window, 'resize', this.displayGameInfos));
    };

    destroy = () => {
        if (this.timeline) this.timeline.kill();

        this.removeTicker();

        this.listeners.forEach(el => el.remove());
    };

    displayGameInfos = () => {
        if (window.innerWidth <= SIZES.s || utils.isDevice()) {
            this.footerGameInfo.classList.add('u-hide');
        } else {
            this.footerGameInfo.classList.remove('u-hide');
        }
    };

    onCopyEmail = async event => {
        if (window.innerWidth > SIZES.s) {
            event.preventDefault();
        }

        try {
            await navigator.clipboard.writeText(event.target.textContent.trim());
            store.cursor.cursorTextBubble.textContent = 'Email copied !';
        } catch (err) {
            console.error(err);
            store.cursor.cursorTextBubble.textContent = 'Use another browser';
        }
    };

    switchText = () => {
        Emitter.on(EMITTERS.gameStart, () => {
            gsap.to(this.footerSliderItem, {
                yPercent: EMITTERS.gameStart ? -100 : 0,
                duration: 1.4,
                ease: 'expo.inOut'
            });
        });

        Emitter.on(EMITTERS.gameStop, () => {
            gsap.to(this.footerSliderItem, {
                yPercent: 0,
                duration: 1.4,
                ease: 'expo.inOut'
            });
        });
    };

    updateFooterHeight = () => {
        this.footer.style.height = `${window.innerHeight}px`;
    };

    setupTimeline = () => {
        this.timeline = gsap.timeline({ paused: true });
    };

    parallaxReveal = () => {
        this.timeline.fromTo(
            this.footerWrapper,
            { yPercent: -60 },
            { yPercent: 0, ease: 'none' },
            0
        );
    };

    updateTicker = () => {
        if (!utils.inView(this.footerWrapper)) return;

        const bounds = this.footerWrapper.getBoundingClientRect();

        const value = -bounds.top + window.innerHeight;

        this.timeline.progress(utils.progress(value, 0, bounds.height));
    };
}
