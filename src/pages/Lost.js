import Cursor from '../components/cursor/Cursor';
import TextHover from '../components/text-hover/TextHover';
import TextSplit from '../components/text-split/TextSplit';

import { store } from '../store';

export default class Lost {
    init = () => {
        this.title = document.querySelector('.not-found__title');
        this.body = document.querySelector('.not-found__body');
    };

    mount = () => {
        this.init();

        store.loading = false;
        store.cursor = new Cursor();
        store.cursor.mount();

        this.textSplit = new TextSplit();
        this.textSplit.mount();

        this.textHover = new TextHover();
        this.textHover.mount();

        this.cursor = new Cursor();
        this.cursor.mount();

        this.getPageTitle();
    };

    destroy = () => {
        if (this.cursor) this.cursor.destroy();
        if (this.textHover) this.textHover.destroy();
        if (this.textSplit) this.textSplit.destroy();
    };

    getPageTitle = () => {
        if (window.location.pathname === '/broken') {
            this.title.textContent = 'IT BROKE !';
            this.body.textContent = 'Something went wrong — Click here to reload.';
        }
    };
}
