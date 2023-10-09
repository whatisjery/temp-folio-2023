import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import VirtualScroll from 'virtual-scroll';
import Ticker from '../../core/Ticker';
import * as utils from '../../utils';

import { store } from '../../store';

export default class Scroll extends Ticker {
    constructor() {
        super();

        this.scroller = document.getElementById('scroller');
        this.links = [...document.querySelectorAll('a[data-link]')];
        this.scrollBar = document.querySelector('.scroll-bar__inner');

        this.vs = new VirtualScroll({
            touchMultiplier: utils.isDevice() ? 3.8 : 2.2,
            mouseMultiplier: 0.5,
            firefoxMultiplier: 90,
            passive: true
        });

        this.last = 0;
        this.ease = 0.09;
        this.current = 0;
        this.scrollSpeed = 0;
        this.direction = 1;
        this.scrollable = true;
        this.isScrolling = false;
        this.pageHeight = null;
        this.listeners = [];

        this.scrollSetter = gsap.quickSetter(this.scroller, 'translateY', 'px');
        this.scaleSetter = gsap.quickSetter(this.scrollBar, 'scaleX');
    }

    mount = () => {
        this.vs.on(this.onScroll);

        this.addTicker();
        this.scrollTrigger();

        this.links.forEach(el =>
            this.listeners.push(
                utils.listen(el, 'click', event => {
                    event.preventDefault();
                    this.scrollToSection(event.currentTarget.dataset.link);
                })
            )
        );

        this.listeners.push(
            utils.listen(window, 'touchmove', event => event.preventDefault(), {
                passive: false
            })
        );
    };

    destroy = () => {
        this.removeTicker();
        this.vs.off(this.onScroll);
        this.listeners.forEach(el => el.remove());
    };

    scrollToSection = sectionId => {
        this.getPageHeight();

        const section = document.querySelector(`#${sectionId}`);

        const headerOffsetHeight = ['about', 'project'].find(key => sectionId === key) ? 100 : 0;

        if (section) {
            return (this.current = -section.offsetTop + headerOffsetHeight);
        }
    };

    scrollToBottom = () => {
        this.current = Math.min(0, -(this.pageHeight - window.innerHeight));
    };

    getScrollSpeed = () => {
        // Adjustments to smooth out scrolling behavior for mouse wheels with notches
        const opts = {
            max: 0.001,
            ease: 0.3
        };

        let speed = utils.clamp((this.last - this.current) * opts.max, -1, 1);

        this.scrollSpeed = opts.ease * speed + (1 - opts.ease) * this.scrollSpeed;

        if (Math.abs(this.scrollSpeed) < opts.max) this.scrollSpeed = 0;
    };

    getScrollDirection = deltaY => {
        if (deltaY < 1 && this.direction !== -1) {
            return (this.direction = -1);
        } else if (deltaY > 1 && this.direction !== 1) {
            this.direction = 1;
        }
    };

    scrollBarVisibility = realPageHeight => {
        if (Math.abs(realPageHeight) <= Math.abs(this.last) + 60) {
            if (this.scrollBarVisible) {
                gsap.to(this.scrollBar, { opacity: 0 });
                this.scrollBarVisible = false;
            }
        } else {
            if (!this.scrollBarVisible) {
                gsap.to(this.scrollBar, { opacity: 1 });
                this.scrollBarVisible = true;
            }
        }
    };

    scrollBarUpdate = () => {
        const realPageHeight = this.pageHeight - window.innerHeight;
        const value = Math.abs(this.last) / realPageHeight || 0;

        this.scaleSetter(value);
        this.scrollBarVisibility(realPageHeight);
    };

    getPageHeight = () => {
        this.pageHeight = this.scroller.offsetHeight;
    };

    onScroll = ({ deltaY }) => {
        if (store.loading || store.snake || !this.scrollable) return;

        if (!this.isScrolling) this.getPageHeight();

        this.getScrollDirection(deltaY);

        this.current += deltaY;
        this.current = Math.max((this.pageHeight - window.innerHeight) * -1, this.current);
        this.current = Math.min(0, this.current);
    };

    scrollTrigger = () => {
        ScrollTrigger.scrollerProxy('#scroller', {
            scrollTop(value) {
                if (arguments.length) return (store.scroll.current = -value);
                return Math.abs(store.scroll.last);
            },

            getBoundingClientRect() {
                return {
                    top: 0,
                    left: 0,
                    width: window.innerWidth,
                    height: window.innerHeight
                };
            },

            pinType: 'transform'
        });

        ScrollTrigger.defaults({
            scroller: '#scroller',
            start: 'top bottom',
            end: 'bottom top'
        });
    };

    updateTicker = () => {
        if (-this.last < 0.1) {
            this.last = 0;
        }

        this.last += (this.current - this.last) * utils.getDeltaTime(this.ease);

        this.getScrollSpeed();

        this.scrollBarUpdate();

        ScrollTrigger.update();

        this.isScrolling = Math.abs(this.current - this.last) > 0.5;

        this.scrollSetter(this.last);
    };
}
