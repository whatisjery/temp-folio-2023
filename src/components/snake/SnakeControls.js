import * as utils from '../../utils';

export default class Controls {
    constructor() {
        this.listeners = [];
        this.direction = {
            x: 1,
            y: 0
        };
    }

    get getSegmentHead() {
        return document.querySelectorAll('.snake__segment')[0];
    }

    init = () => {
        if (navigator.maxTouchPoints > 0) {
            this.listeners.push(utils.listen(window, 'touchstart', this.handleTouchOrClick));
        } else {
            this.listeners.push(utils.listen(window, 'mousedown', this.handleTouchOrClick));
            this.listeners.push(utils.listen(window, 'keydown', this.handleArrowPress));
        }
    };

    kill = () => {
        this.listeners.forEach(el => el.remove());
    };

    handleArrowPress = event => {
        switch (event.key) {
            case 'ArrowUp':
                if (this.direction.y === 0) {
                    this.direction = { x: 0, y: -1 };
                }
                break;
            case 'ArrowDown':
                if (this.direction.y === 0) {
                    this.direction = { x: 0, y: 1 };
                }
                break;
            case 'ArrowLeft':
                if (this.direction.x === 0) {
                    this.direction = { x: -1, y: 0 };
                }
                break;
            case 'ArrowRight':
                if (this.direction.x === 0) {
                    this.direction = { x: 1, y: 0 };
                }
                break;
        }
    };

    handleTouchOrClick = event => {
        if (!this.getSegmentHead) return;

        const bounds = this.getSegmentHead.getBoundingClientRect();

        if (this.direction.x !== 0) {
            switch (true) {
                case bounds.y > event.clientY:
                    this.direction = { x: 0, y: -1 };
                    break;
                case bounds.y < event.clientY:
                    this.direction = { x: 0, y: 1 };
                    break;
            }
        } else {
            switch (true) {
                case bounds.x > event.clientX:
                    this.direction = { x: -1, y: 0 };
                    break;
                case bounds.x < event.clientX:
                    this.direction = { x: 1, y: 0 };
                    break;
            }
        }
    };
}
