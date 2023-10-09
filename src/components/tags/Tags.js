import gsap from 'gsap';
import Ticker from '../../core/Ticker';
import * as utils from '../../utils';

export default class Tags extends Ticker {
    constructor(tags) {
        super(1700);
        this.tag = tags;
        this.slider = this.tag.querySelector('.tag__slider');
        this.tagItem = [...this.tag.querySelectorAll('.tag__item')];
        this.sequence = this.createSequence(this.tagItem.length);
    }

    createSequence = length => {
        const sequence = [...Array(length).keys()];

        return this.shuffleSequence(sequence);
    };

    shuffleSequence = arr => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }

        return arr;
    };

    mount = () => {
        this.listener = utils.listen(window, 'load', this.animate);
        this.sliderSetter = gsap.quickSetter(this.slider, 'y', 'px');
        this.tagSetter = gsap.quickSetter(this.tag, 'width', 'px');

        this.addTicker();
    };

    destroy = () => {
        this.removeTicker();
        if (this.listener) this.listener.remove();
    };

    animate = () => {
        if (this.sequence.length === 0) {
            this.sequence = this.createSequence(this.tagItem.length);
        }

        const index = this.getNextIndex();
        const bounds = this.tagItem[index].getBoundingClientRect();

        this.sliderSetter(-bounds.height * index);
        this.tagSetter(bounds.width);
    };

    getNextIndex = () => {
        return this.sequence.pop();
    };

    updateTicker = () => {
        if (!utils.inView(this.tag)) return;

        this.animate();
    };
}
