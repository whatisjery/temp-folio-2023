import * as utils from '../../utils';

import gsap from 'gsap';

export default class LoaderTransition {
    constructor() {
        this.progress = 1;

        this.canvas = document.querySelector('.canvas__transition');
        this.ctx = this.canvas.getContext('2d');
        this.pixelRatio = Math.min(window.devicePixelRatio, 0.6);
        this.angle = Math.round(window.innerWidth / 21);
        this.setSizes();

        this.listener = null;
    }

    update = () => {
        this.clearCanvas();
        this.calcSegmentsAndAmplitude();
    };

    kill = () => {
        this.clearCanvas();
        this.canvas.remove();
        if (this.listener) this.listener.remove();
    };

    setSizes = () => {
        gsap.set(this.canvas, {
            rotation: 180
        });

        this.canvas.height = window.innerHeight * this.pixelRatio;
        this.canvas.width = window.innerWidth * this.pixelRatio;
    };

    clearCanvas = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    calcSegmentsAndAmplitude = () => {
        this.ctx.save();

        this.widthSegments = Math.ceil(this.canvas.width / 10);
        this.amplitude = this.angle * Math.sin(this.progress * Math.PI);

        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);

        const progress = (1 - this.progress) * this.canvas.height;

        this.ctx.lineTo(0, progress);

        for (let index = 0; index <= this.widthSegments; index++) {
            const x = 10 * index;
            const y = progress - Math.sin((x / this.canvas.width) * -Math.PI) * this.amplitude;
            this.ctx.lineTo(x, y);
        }

        this.ctx.fillStyle = utils.getCSSvar('--color-mat');
        this.ctx.fill();
        this.ctx.restore();
    };
}
