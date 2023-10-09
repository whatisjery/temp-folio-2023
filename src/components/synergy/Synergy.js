import gsap from 'gsap';
import { SIZES } from '../../constant';
import SynergyDraw from './SynergyDraw';

export default class Synergy {
    constructor() {
        this.synergy = document.querySelector('.synergy');
        this.synergyCircle = [...document.querySelectorAll('.synergy__circle-container')];
        this.synergyDraw = new SynergyDraw();
    }

    mount = () => {
        this.watchMedias();
        this.synergyDraw.mount();
    };

    destroy = () => {
        if (this.matchMedia) this.matchMedia.kill();
        this.synergyDraw.destroy();
    };

    watchMedias = () => {
        this.matchMedia = gsap.matchMedia();
        this.matchMedia.add(
            {
                isMobile: `(max-width: ${SIZES.s}px)`,
                isDesktop: `(min-width: ${SIZES.s + 1}px)`
            },
            context => {
                this.reveal(context.conditions);
            }
        );
    };

    reveal = () => {
        gsap.fromTo(
            this.synergyCircle,
            {
                yPercent: 140
            },
            {
                duration: 2,
                ease: 'expo.out',
                yPercent: 0,

                scrollTrigger: {
                    trigger: this.synergy,
                    toggleActions: 'restart restart none restart'
                },
                stagger: {
                    amount: 0.32
                }
            }
        );
    };
}
