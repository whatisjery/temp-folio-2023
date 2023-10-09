import gsap from 'gsap';
import Emitter from '../../core/Emitter';
import * as utils from '../../utils';

import { EMITTERS } from '../../constant';
import { store } from '../../store';

export default class Resume {
    constructor() {
        this.resume = document.querySelector('.resume');
        this.closeBtn = document.querySelector('.resume__close');
        this.openBtn = document.querySelector('.resume__open');
        this.img = document.querySelector('.resume__img');

        this.timeline = null;
        this.sharedEasing = { ease: 'expo.inOut', duration: 1.3 };
        this.resumePath = '/files/resume.pdf';

        this.listeners = [];
    }

    mount = () => {
        this.setUpTimeline();

        this.listeners.push(utils.listen(this.openBtn, 'click', this.onShowResume));
        this.listeners.push(utils.listen(this.closeBtn, 'click', this.onHideResume));
        this.listeners.push(utils.listen(this.img, 'click', this.onClickResume));
        this.listeners.push(utils.listen(window, 'resize', this.onHideResume));

        this.transition();
    };

    destroy = () => {
        if (this.timeline) this.timeline.kill();

        this.listeners.forEach(el => el.remove());

        Emitter.off(EMITTERS.showResume);
    };

    setUpTimeline = () => {
        this.timeline = gsap.timeline({ defaults: this.sharedEasing, paused: true });
    };

    transition = () => {
        this.timeline.set(this.resume, {
            opacity: 0,
            pointerEvents: 'none'
        });

        this.timeline.set(this.img, {
            scale: 0.8,
            pointerEvents: 'none'
        });

        this.timeline
            .to(this.resume, {
                opacity: 1,
                pointerEvents: 'initial',
                display: 'flex'
            })
            .to(
                this.img,
                {
                    scale: 1,
                    pointerEvents: 'initial'
                },
                0
            );
    };

    onClickResume = async () => {
        if (utils.isDevice()) {
            this.onHideResume();
            return;
        }

        await this.downloadResume();
    };

    downloadResume = async () => {
        try {
            const response = await fetch(this.resumePath);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const aElement = document.createElement('a');

            aElement.href = url;
            aElement.download = this.resumePath.split('/')[2];
            aElement.style.display = 'none';

            document.body.appendChild(aElement);
            aElement.click();

            URL.revokeObjectURL(url);
            aElement.remove();
        } catch (err) {
            console.error(err);
            store.cursor.textBubble.textContent = 'Use another browser';
        }
    };

    onShowResume = () => {
        this.timeline.play();
        store.scroll.scrollable = false;
        Emitter.emit(EMITTERS.showResume, this.sharedEasing);
    };

    onHideResume = () => {
        this.timeline.reverse();
        store.scroll.scrollable = true;
        Emitter.emit(EMITTERS.hideResume, this.sharedEasing);
    };
}
