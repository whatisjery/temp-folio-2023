import * as utils from '../../utils';

import Ticker from '../../core/Ticker';

import { gsap } from 'gsap';
import { store } from '../../store';

export default class SynergyDraw extends Ticker {
    constructor() {
        super(10);

        this.canvas = document.querySelector('.canvas__draw');
        this.ctx = this.canvas.getContext('2d');

        this.brush = {
            strokes: [],
            radius: 0,
            fade: 500
        };

        this.touchBurst = 0;
        this.listeners = [];
        this.onCanvas = false;
    }

    mount = () => {
        this.addTicker();
        this.setSizes();

        this.listeners.push(utils.listen(window, 'resize', this.setSizes));
        this.listeners.push(utils.listen(this.canvas, 'touchstart', this.onTouch));

        this.listeners.push(
            utils.listen(this.canvas, 'mouseleave', () => {
                this.onCanvas = false;
            })
        );

        this.listeners.push(
            utils.listen(this.canvas, 'mouseenter', () => {
                this.onCanvas = true;
            })
        );
    };

    destroy = () => {
        this.removeTicker();
        this.listeners.forEach(el => el.remove());
    };

    onTouch = () => {
        gsap.fromTo(
            this,
            {
                touchBurst: 0.01
            },
            {
                touchBurst: 0
            }
        );
    };

    updateTicker = () => {
        if (!utils.inView(this.canvas)) return;

        const currentTime = Date.now();
        const bounds = this.canvas.getBoundingClientRect();

        if ((store.cursor.mouseSpeed >= 0.04 || this.touchBurst > 0) && this.onCanvas) {
            this.brush.strokes.push({
                x: store.cursor.current.x - bounds.left,
                y: store.cursor.current.y - bounds.top,
                timestamp: currentTime,
                radius: this.brush.radius
            });
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const stroke of this.brush.strokes) {
            this.brushStroke(stroke, currentTime);
        }

        this.brush.strokes = this.brush.strokes.filter(stroke => {
            return currentTime - stroke.timestamp < this.brush.fade;
        });
    };

    brushStroke = (stroke, currentTime) => {
        const age = currentTime - stroke.timestamp;
        const ageFade = age / this.brush.fade;
        const opacity = this.easeOpacity(ageFade);

        if (opacity <= 0) return;

        const adjustedRadius = stroke.radius * (1 + ageFade);

        this.ctx.beginPath();
        this.ctx.arc(stroke.x, stroke.y, adjustedRadius, 0, 2 * Math.PI);

        this.ctx.strokeStyle = utils.getCSSvar('--color-mat');
        this.ctx.globalAlpha = opacity;
        this.ctx.lineWidth = 0.5;
        this.ctx.stroke();
    };

    easeOpacity = t => {
        if (t >= 1) return 0;
        return 0.4 - t * t;
    };

    setBrushSize = size => {
        this.brush.radius = size / 3.5;
    };

    setCanvasSize = size => {
        this.canvas.style.width = `${size - 5}px`;
        this.canvas.style.height = `${size - 5}px`;

        this.canvas.width = size;
        this.canvas.height = size;
    };

    setSizes = () => {
        const bounds = this.canvas.parentElement.getBoundingClientRect();
        const size = Math.min(bounds.width, bounds.height);

        this.setCanvasSize(size);
        this.setBrushSize(size);
    };
}
