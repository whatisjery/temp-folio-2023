import * as utils from '../../utils';

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

export default class Pager {
    constructor() {
        this.header = document.querySelector('.header');

        this.pagerSection = '.pager__section';
        this.pagerContainer = '.pager__container';
        this.pagerTitle = document.querySelector('.pager__title');

        this.dataSections = [...document.querySelectorAll('[data-section]')];

        this.scrollTrigger = null;
        this.listeners = [];
    }

    mount = () => {
        this.listeners.push(
            utils.listen(window, ['load', 'resize'], () => {
                this.dataSections.forEach(this.trigger);
            })
        );
    };

    destroy = () => {
        this.listener.forEach(el => el.remove());

        if (this.scrollTrigger) this.scrollTrigger.kill();
    };

    animateContainer = ({ y }) => {
        gsap.killTweensOf(this.pagerContainer);

        gsap.to(this.pagerContainer, {
            y,
            overwrite: 'auto',
            ease: 'expo.out',
            duration: 1.2
        });
    };

    animateDigits = ({ yPercent }) => {
        gsap.killTweensOf(this.pagerSection);

        gsap.to(this.pagerSection, {
            yPercent,
            overwrite: 'auto',
            ease: 'expo.out',
            duration: 1.2
        });
    };

    trigger = (section, index) => {
        this.scrollTrigger = ScrollTrigger.create({
            trigger: section,

            start: () => {
                if (index === this.dataSections.length - 1) {
                    return `top ${this.header.offsetHeight}px`;
                }

                return 'top center';
            },

            onEnter: () => {
                if (!index) {
                    this.animateContainer({ y: -this.pagerTitle.offsetHeight });

                    return;
                }

                if (index === this.dataSections.length - 1) {
                    this.header.classList.add('is-blend-mode');

                    gsap.set(this.header, { zIndex: 1 });
                }

                this.animateDigits({ yPercent: -100 * index });
            },

            onLeaveBack: () => {
                if (!index) {
                    this.animateContainer({ y: 0 });

                    return;
                }

                if (index === this.dataSections.length - 1) {
                    this.header.classList.remove('is-blend-mode');

                    gsap.set(this.header, { zIndex: 101 });
                }

                this.animateDigits({ yPercent: -100 * (index - 1) });
            }
        });
    };
}
