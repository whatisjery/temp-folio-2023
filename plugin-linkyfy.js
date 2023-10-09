const linkyfy = (key, link) => {
    return tree => {
        return tree.match({ tag: 'p', content: [new RegExp(key, 'gi')] }, node => {
            node.content = node.content.map(item => {
                if (typeof item === 'string') {
                    return item.replace(
                        new RegExp(key, 'gi'),
                        `<a target='_blank' href='${link}' rel='nofollow'>${key}</a>`
                    );
                }
                return item;
            });
            return node;
        });
    };
};

export default linkyfy;
