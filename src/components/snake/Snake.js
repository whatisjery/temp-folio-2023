import gsap from 'gsap';
import Emitter from '../../core/Emitter';
import Ticker from '../../core/Ticker';
import Controls from './SnakeControls';
import Food from './SnakeFood';
import Grid from './SnakeGrid';
import Score from './SnakeScore';
import Segment from './SnakeSegment';

import { EMITTERS, GAME, SIZES } from '../../constant';
import { store } from '../../store';

export default class Snake extends Ticker {
    constructor() {
        super(50);

        this.appGrid = [...document.querySelectorAll('.grid')];

        this.size = SIZES.snake;
        this.sizeX = Math.round(window.innerWidth / this.size) - 1;
        this.sizeY = Math.round(window.innerHeight / this.size) - 1;

        this.SnakeControl = new Controls();
        this.SnakeScore = new Score();
        this.SnakeGrid = new Grid(this.sizeX, this.sizeY, this.size);
        this.SnakeSegment = new Segment(this.sizeX, this.sizeY, this.SnakeGrid);
        this.SnakeFood = new Food(this.sizeX, this.sizeY, this.SnakeSegment);
    }

    get getSnake() {
        return document.querySelector('.snake');
    }

    mount = () => {
        this.SnakeScore.init();
        this.SnakeGrid.draw();

        this.SnakeGrid.setGridStyles();
        this.SnakeControl.init();

        this.addTicker();
        this.setInitialStyles();

        store.scroll.scrollToBottom();
    };

    destroy = () => {
        gsap.set(document.body, { pointerEvents: 'initial' });
        gsap.set(this.appGrid, { opacity: 1 });

        if (this.SnakeGrid && this.SnakeGrid.getGrid) {
            gsap.set(this.SnakeGrid.getGrid, {
                opacity: 0,
                duration: 1.7,
                ease: 'expo.inOut'
            });
        }

        if (this.getSnake) this.getSnake.remove();

        if (this.SnakeControl) this.SnakeControl.kill();

        this.resetCursor();

        Emitter.emit(EMITTERS.gameStop);

        this.removeTicker();
    };

    resetCursor = () => {
        store.cursor.gameTrigger.state = GAME.stopped;

        store.cursor.bounds = { x: 0, y: 0 };

        store.cursor.gameTrigger.timeline.reverse();

        store.cursor.gameTrigger.timeline.eventCallback('onReverseComplete', () => {
            store.snake = undefined;
        });
    };

    setInitialStyles = () => {
        gsap.set(this.appGrid, {
            opacity: 0
        });

        gsap.set(document.body, {
            pointerEvents: 'none'
        });

        gsap.set(this.getSnake, {
            pointerEvents: 'initial'
        });
    };

    boundCorrection = (val, size) => {
        if (val > size) return 1;
        else if (val < 1) return size;

        return val;
    };

    updateSnake = () => {
        const head = { ...this.SnakeSegment.segments[0] };

        const tail = this.SnakeSegment.segments.slice(0, -1);

        const newHead = {
            x: this.boundCorrection(head.x + this.SnakeControl.direction.x, this.sizeX),
            y: this.boundCorrection(head.y + this.SnakeControl.direction.y, this.sizeY)
        };

        const foodColision =
            newHead.x === this.SnakeFood.location.x && newHead.y === this.SnakeFood.location.y;

        if (foodColision) {
            this.SnakeScore.update();
            this.SnakeSegment.grow(this.SnakeFood.location);
            this.SnakeFood.location = this.SnakeFood.spawn();
        } else {
            this.SnakeSegment.segments = [newHead, ...tail];
        }
    };
    updateTicker = () => {
        this.updateSnake();

        this.SnakeFood.draw();
        this.SnakeFood.attachToCursor();

        this.SnakeSegment.draw();
        this.SnakeSegment.collision(this.destroy.bind(this));
    };
}
