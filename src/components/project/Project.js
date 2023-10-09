import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import * as utils from '../../utils';

import { SIZES } from '../../constant';

export default class Projects {
    constructor(project) {
        this.header = document.querySelector('.header');
        this.headerTitle = document.querySelector('.project-section-header__title');

        this.project = project;
        this.projectTitle = [...document.querySelectorAll('.project__title')];
        this.projectContent = this.project.querySelector('.project__content');
        this.projectImgs = this.project.querySelector('.project__img-group');

        this.scrollTrigger = null;
        this.listeners = [];
    }

    mount = () => {
        this.pinContent();
        this.reveal();

        this.listeners.push(utils.listen(window, 'resize', this.pinContent));
    };

    destroy = () => {
        if (this.listeners) this.listeners.forEach(el => el.remove());
    };

    reveal = () => {
        gsap.killTweensOf(this.headerTitle.children);

        gsap.fromTo(
            this.headerTitle.children,
            {
                yPercent: 100
            },
            {
                yPercent: 0,
                duration: 1.5,
                delay: 0.1,
                ease: 'expo.out',
                overwrite: 'auto',
                stagger: {
                    amount: 0.27
                },

                scrollTrigger: {
                    trigger: this.headerTitle,
                    toggleActions: 'restart none none restart'
                }
            },
            0
        );
    };

    getScreenRatio = () => {
        const ratio = window.innerWidth / window.innerHeight;
        return Math.round(ratio * 100) / 100;
    };

    pinContent = () => {
        if (this.scrollTrigger) {
            this.scrollTrigger.kill();
            this.scrollTrigger = null;
        }

        if (this.getScreenRatio() >= 2.4 || window.innerWidth <= SIZES.m) {
            return;
        }

        this.scrollTrigger = ScrollTrigger.create({
            pin: true,
            pinSpacing: false,
            scroller: '#scroller',
            trigger: this.projectContent,
            endTrigger: this.projectImgs,
            start: `bottom bottom-=8%`,
            end: `bottom bottom-=110px`
        });
    };
}
