import { EMITTERS } from '../constant';
import { store } from '../store';

import Emitter from '../core/Emitter';
import Accordion from './accordion/Accordion';
import Cursor from './cursor/Cursor';
import Footer from './footer/Footer';
import Grid from './grid/Grid';
import Line from './line/Line';
import Loader from './loader/Loader';
import Pager from './pager/Pager';
import Resume from './resume/Resume';
import Ribbon from './ribbon/Ribbon';
import Scroll from './scroll/Scroll';
import Snake from './snake/Snake';
import Synergy from './synergy/Synergy';
import TextHover from './text-hover/TextHover';
import TextSplit from './text-split/TextSplit';
import Three from './three/Three';

export default class Components {
    mount = () => {
        store.loader = new Loader();
        store.loader.mount();

        store.cursor = new Cursor();
        store.cursor.mount();

        store.scroll = new Scroll();
        store.scroll.mount();

        this.textSplit = new TextSplit();
        this.textSplit.mount();

        this.grid = new Grid();
        this.grid.mount();

        this.accordion = new Accordion();
        this.accordion.mount();

        this.pager = new Pager();
        this.pager.mount();

        this.footer = new Footer();
        this.footer.mount();

        this.line = new Line();
        this.line.mount();

        this.textHover = new TextHover();
        this.textHover.mount();

        this.ribbon = new Ribbon();
        this.ribbon.mount();

        this.synergy = new Synergy();
        this.synergy.mount();

        Emitter.on(EMITTERS.assetsLoaded, ({ gltf, loadedAssets }) => {
            this.three = new Three({ gltf, loadedAssets });
            this.three.mount();

            this.resume = new Resume();
            this.resume.mount();
        });

        Emitter.on(EMITTERS.gameStart, () => {
            store.snake = new Snake();
            store.snake.mount();
        });
    };

    destroy = () => {
        if (this.textSplit) this.textSplit.destroy();
        if (this.grid) this.grid.destroy();
        if (this.synergy) this.synergy.destroy();
        if (this.Header) this.pager.destroy();
        if (this.footer) this.footer.destroy();
        if (this.accordion) this.accordion.destroy();
        if (this.ribbon) this.ribbon.destroy();
        if (this.resume) this.resume.destroy();
        if (this.canvasThree) this.canvasThree.destroy();
        if (this.textHover) this.textHover.destroy();
        if (this.line) this.line.destroy();
    };
}
