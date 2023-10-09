import posthtml from 'posthtml';
import expressions from 'posthtml-expressions';
import include from 'posthtml-include';
import linkyfy from './plugin-linkyfy';
import about from './src/content/about';
import accordions from './src/content/accordions';
import projects from './src/content/projects';
import tags from './src/content/tags';

const postHtml = () => ({
    name: 'post-html-plugin',

    transformIndexHtml: async html => {
        const result = await posthtml([
            include({ root: './' }),
            expressions({
                locals: {
                    projects,
                    accordions,
                    tags,
                    about
                }
            }),
            linkyfy('INO', 'https://www.ino.global/en/')
        ]).process(html, {
            from: './index.html'
        });

        return result.html;
    }
});

export default postHtml;
