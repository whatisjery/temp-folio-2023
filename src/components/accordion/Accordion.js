import * as utils from '../../utils';

export default class Accordion {
    constructor() {
        this.boxes = [...document.querySelectorAll('.accordion__box')];
        this.listeners = [];
    }

    mount = () => {
        this.listeners.push(utils.listen(window, 'load', () => this.openBoxOnMount(1)));

        this.boxes.forEach(box => {
            this.listeners.push(utils.listen(window, 'resize', () => this.resizeOpenedBox(box)));
            this.listeners.push(utils.listen(box, 'click', this.onClick));
        });
    };

    destroy = () => {
        this.listeners.forEach(el => el.remove());
    };

    openBoxOnMount = boxNb => {
        this.openCurrentBox(this.boxes[boxNb]);
    };

    onClick = event => {
        const box = event.currentTarget.closest('.accordion__box');

        if (!box.classList.contains('open')) {
            this.closePrevBox();
            this.openCurrentBox(box);
        }
    };

    resizeOpenedBox = box => {
        const content = box.querySelector('.accordion__content');

        if (box.classList.contains('open')) {
            content.style.height = 'auto';
            content.style.height = `${content.scrollHeight}px`;
        }
    };

    openCurrentBox = box => {
        const content = box.querySelector('.accordion__content');

        content.style.height = `${content.scrollHeight}px`;

        box.classList.add('open');
    };

    closePrevBox = () => {
        const activeBox = this.boxes.find(box => box.classList.contains('open'));

        if (activeBox) {
            const content = activeBox.querySelector('.accordion__content');

            content.style.height = null;

            activeBox.classList.remove('open');
        }
    };
}
