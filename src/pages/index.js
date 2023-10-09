import * as utils from '../utils';

import Components from '../components';
import Project from '../components/project/Project';
import Rotation from '../components/rotation/Rotation';
import Tags from '../components/tags/Tags';
import { store } from '../store';

export default class Home {
    constructor() {
        this.cpContainers = {
            rotation: null,
            tags: null,
            projects: null,
            canvas: null
        };

        this.listeners = [];
    }

    domElement = () => {
        this.rotations = [...document.querySelectorAll('[data-rotation]')];
        this.tags = [...document.querySelectorAll('.tag__container')];
        this.projects = [...document.querySelectorAll('.project')];
        this.links = [...document.querySelectorAll('a')];
    };

    mount = () => {
        this.vpHeight();
        this.domElement();

        this.components = new Components();
        this.components.mount();

        this.cpContainers.projects = this.projects.map(el => {
            const component = new Project(el);
            component.mount();
            return component;
        });

        this.cpContainers.tags = this.tags.map(el => {
            const component = new Tags(el);
            component.mount();
            return component;
        });

        this.cpContainers.rotation = this.rotations.map(el => {
            const component = new Rotation(el);
            component.mount();
            return component;
        });

        this.links.forEach(link => {
            this.listeners.push(
                utils.listen(link, 'click', event => event.stopImmediatePropagation())
            );
        });

        this.listeners.push(
            utils.listen(window, 'resize', () => {
                if (!store.snake) return;
                store.snake.destroy();
            })
        );

        this.listeners = utils.listen(window, 'resize', this.vpHeight);

        this.listeners = utils.listen(screen.orientation, 'change', () => {
            window.location.reload();
        });
    };

    destroy = () => {
        this.components.destroy();

        if (this.listeners.length) {
            this.listeners.forEach(el => el.remove());
        }

        if (this.cpContainers.tags) {
            this.cpContainers.tags.forEach(el => el.destroy());
        }

        if (this.cpContainers.rotation) {
            this.cpContainers.rotation.forEach(el => el.destroy());
        }

        if (this.cpContainers.projects) {
            this.cpContainers.projects.forEach(el => el.destroy());
        }
    };

    vpHeight = () => {
        const vh = window.innerHeight * 0.01;

        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
}
