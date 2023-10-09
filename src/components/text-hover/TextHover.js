import gsap from 'gsap';
import * as utils from '../../utils';

export default class TextHover {
    constructor() {
        this.textHover = [...document.querySelectorAll('.text-hover')];

        this.options = [
            { position: 'afterbegin', val: 100 },
            { position: 'beforeend', val: -100 }
        ];

        this.listeners = [];
    }

    mount = () => {
        this.textHover.forEach(el => {
            el.childNodes.forEach(container => {
                this.listeners.push(
                    utils.listen(container, 'mousemove', event => this.onHover(event, container))
                );
            });
        });
    };

    destroy = () => {
        this.listeners.forEach(listener => listener.remove());
    };

    getOptions = (event, container) => {
        const { left, width } = container.getBoundingClientRect();
        const index = event.clientX - left < width / 2 ? 0 : 1;

        return { ...this.options[index] };
    };

    cloneElement = (container, option, element) => {
        container.insertAdjacentHTML(
            option.position,
            `<span class="text-split__letter clone ${option.position}">${element}</span>`
        );
    };

    stretchChar = (container, option) => {
        gsap.to(container.children, {
            scaleX: 1.23,
            duration: 1,
            transformOrigin: `${option.position === 'beforeend' ? 'right' : 'left'}`,
            ease: 'expo.inOut',
            yoyo: true,
            repeat: 1
        });
    };

    translateChars = (container, option) => {
        gsap.to(container.children, {
            xPercent: option.val,
            duration: 1.8,
            ease: 'customEase',
            yoyo: true,
            repeat: 1,
            onStart: () => {
                container.dataset.active = true;
            },
            onComplete: () => {
                delete container.dataset.active;

                const clone = container.querySelector('.clone');

                if (clone) clone.remove();
            }
        });
    };

    animate = (container, option, element) => {
        gsap.killTweensOf(container.children);

        if (container.children.length === 1) {
            this.stretchChar(container, option);
            this.cloneElement(container, option, element);
        }

        if (container.children.length === 2) {
            this.translateChars(container, option);
        }
    };

    onHover = (event, container) => {
        if (container.dataset.active) return;

        const option = this.getOptions(event, container);
        const element = container.firstChild.textContent;

        this.animate(container, option, element);
    };
}
