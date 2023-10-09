import gsap from 'gsap';
import Emitter from '../../core/Emitter';

import { EMITTERS, GAME } from '../../constant';
import { store } from '../../store';

export default class CursorGameTriggers {
    constructor(cursorCirclePath, circlePath, cursorDotPath, bounds) {
        this.state = GAME.stopped;
        this.cursorCirclePath = cursorCirclePath;
        this.circlePath = circlePath;
        this.cursorDotPath = cursorDotPath;
        this.bounds = bounds;
    }

    setupTimeline = () => {
        this.timeline = gsap.timeline({});

        this.timeline = gsap.timeline({
            defaults: {
                duration: 2.5,
                ease: 'power1.in'
            }
        });
    };

    start = () => {
        if (this.timeline) this.timeline.clear();

        this.state = GAME.starting;

        this.setupTimeline();

        this.timeline
            .to(this.cursorCirclePath, {
                strokeDashoffset: `${this.circlePath}`,
                opacity: 0
            })
            .to(
                this.cursorDotPath,
                {
                    attr: {
                        r: 15
                    }
                },
                0
            );

        this.timeline.eventCallback('onComplete', () => {
            this.state = GAME.running;

            if (!store.snake) Emitter.emit(EMITTERS.gameStart);
        });
    };

    stop = () => {
        if (this.state !== GAME.running) return;

        this.state = GAME.stopping;

        this.timeline.reverse();

        this.timeline.eventCallback('onReverseComplete', () => {
            store.snake.destroy();
            store.snake = undefined;
        });
    };

    interuptStart = () => {
        if (this.state !== GAME.starting) return;

        this.timeline.reverse();

        this.timeline.eventCallback('onReverseComplete', () => {
            this.state = GAME.stopped;
        });
    };

    interuptStop = () => {
        if (this.state !== GAME.stopping) return;

        this.timeline.play();

        this.timeline.eventCallback('onComplete', () => {
            this.state = GAME.running;
        });
    };
}
