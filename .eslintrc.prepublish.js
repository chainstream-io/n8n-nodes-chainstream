/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * @type {import('@types/eslint').ESLint.ConfigData}
 */
module.exports = {
    extends: "./.eslintrc.js",

    overrides: [
        {
            files: ['package.json'],
            plugins: ['eslint-plugin-n8n-nodes-base'],
            rules: {
                'n8n-nodes-base/community-package-json-name-still-default': 'error',
                'n8n-nodes-base/community-package-json-missing-keywords': 'error',
                'n8n-nodes-base/community-package-json-missing-description': 'error',
                'n8n-nodes-base/community-package-json-missing-author': 'error',
                'n8n-nodes-base/community-package-json-missing-repository': 'error',
            },
        },
    ],
};
