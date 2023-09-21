/**
 * @fileoverview dont import from public api
 * @author vlad
 */
'use strict'

const { isPathRelative } = require('../helpers/index')
const micromatch = require('micromatch')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
const layers = {
    entities: 'entities',
    features: 'features',
    widgets: 'widgets',
    pages: 'pages',
}

const PUBLIC_ERROR = 'PUBLIC_ERROR'
const TEST_PUBLIC_ERROR = 'TEST_PUBLIC_ERROR'

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
    meta: {
        type: 'layout', // `problem`, `suggestion`, or `layout`
        docs: {
            description: 'dont import from public api ',
            recommended: false,
            url: null, // URL to the documentation page for this rule
        },
        fixable: 'code', // Or `code` or `whitespace`
        schema: [
            {
                type: 'object',
                properties: {
                    alias: {
                        type: 'string',
                    },
                    testFiles: {
                        type: 'array',
                    },
                },
            },
        ], // Add a schema if the rule has options
        messages: {
            [PUBLIC_ERROR]: 'Must be from public api',
            [TEST_PUBLIC_ERROR]:
                'testing code have not to be in prod build',
        },
    },

    create(context) {
        const { alias = '', testFiles = [] } =
            context.options[0]

        return {
            ImportDeclaration(node) {
                const value = node.source.value
                const importTo = alias
                    ? value.replace(`${alias}/`, '')
                    : value

                if (isPathRelative(importTo)) {
                    return
                }
                const segments = importTo.split('/')
                const isImportNotFromPublicApi =
                    segments.length > 2
                const isTestPublicApi =
                    segments[2] === 'testing' &&
                    segments.length < 4

                const layer = segments[0]
                const slice = segments[1]

                if (!layers[layer]) {
                    return
                }

                if (
                    isImportNotFromPublicApi &&
                    !isTestPublicApi
                ) {
                    context.report({
                        messageId: PUBLIC_ERROR,
                        node,
                        fix: (fixer) => {
                            return fixer.replaceText(node.source, `'${alias}/${layer}/${slice}'`)
                        }
                    })
                }

                if (isTestPublicApi) {
                    const currentFileName = context.filename
                    const isCurrentFileTesting =
                        testFiles.some((pattern) =>
                            micromatch.isMatch(
                                currentFileName,
                                pattern
                            )
                        )

                    if (!isCurrentFileTesting) {
                        context.report({
                            messageId: TEST_PUBLIC_ERROR,
                            node,
                        })
                    }
                }
            },
        }
    },
}
