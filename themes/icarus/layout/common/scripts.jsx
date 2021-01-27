const { Component, Fragment } = require('inferno');
const Plugins = require('./plugins');
module.exports = class extends Component {
    render() {
        const { site, config, helper, page } = this.props;
        const { url_for, cdn } = helper;
        const { article } = config;
        // const language = page.lang || page.language || config.language || 'en';

        let fold = 'unfolded';
        let clipboard = true;
        if (article && article.highlight) {
            if (typeof article.highlight.clipboard !== 'undefined') {
                clipboard = !!article.highlight.clipboard;
            }
            if (typeof article.highlight.fold === 'string') {
                fold = article.highlight.fold;
            }
        }

        const embeddedConfig = `var IcarusThemeSettings = {
            article: {
                highlight: {
                    clipboard: ${clipboard},
                    fold: '${fold}'
                }
            }
        };`;

        return <Fragment>
            <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.min.js"></script>

            {clipboard && <script src="https://cdn.bootcdn.net/ajax/libs/clipboard.js/2.0.6/clipboard.min.js"></script>}

            <script src="https://cdn.bootcdn.net/ajax/libs/highlight.js/10.4.1/highlight.min.js"></script>
            <script dangerouslySetInnerHTML={{ __html: embeddedConfig }}></script>
            <script src={url_for('/js/column.js')}></script>
            <Plugins site={site} config={config} page={page} helper={helper} head={false} />
            <script src={url_for('/js/main.js')} defer></script>
        </Fragment>;
    }
};
