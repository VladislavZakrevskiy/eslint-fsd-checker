/**
 * @fileoverview fsd layerRules path
 * @author vlad
 */
'use strict'

const path = require('path')
const { isPathRelative } = require('../helpers/index')
const micromatch = require('micromatch')

const layers = {
    app: [
        'pages',
        'widgets',
        'features',
        'shared',
        'entities',
    ],
    pages: ['widgets', 'features', 'shared', 'entities'],
    widgets: ['features', 'shared', 'entities'],
    features: ['shared', 'entities'],
    entities: ['shared', 'entities'],
    shared: ['shared'],
}

const availableLayers = {
    app: 'app',
    entities: 'entities',
    features: 'features',
    shared: 'shared',
    widgets: 'widgets',
    pages: 'pages',
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
    meta: {
        type: 'layout', // `problem`, `suggestion`, or `layout`
        docs: {
            description: 'fsd relative path',
            recommended: false,
            url: null, // URL to the documentation page for this rule
        },
        fixable: null, // Or `code` or `whitespace`
        schema: [
            {
                type: 'object',
                properties: {
                    alias: {
                        type: 'string',
                    },
                    ignoreImportPatterns: {
                        type: 'array',
                    },
                },
            },
        ], // Add a schema if the rule has options
        messages: {
            'Wrong layer': 'Wrong layer',
        },
    },

    create(context) {
        const { alias = '', ignoreImportPatterns = [] } =
            context.options[0]

        const getCurrentFileLayer = () => {
            const currentFileName = context.filename

            const normalizedPath =
                path.toNamespacedPath(currentFileName)
            const projectPath =
                normalizedPath.split('src')[1]
            const segments = projectPath.split('\\')

            return segments[1]
        }

        const getImportLayer = (value) => {
            const importPath = alias
                ? value.replace(`${alias}/`, '')
                : value
            const segments = importPath.split('/')

            return segments[0]
        }

        return {
            ImportDeclaration(node) {
                const value = node.source.value
                const currentFileLayer =
                    getCurrentFileLayer()
                const importLayer = getImportLayer(value)

                if (isPathRelative(value)) {
                    return
                }

                if (
                    !availableLayers[importLayer] ||
                    !availableLayers[currentFileLayer]
                ) {
                    return
                }

                const isIgnored = ignoreImportPatterns.some(
                    (pattern) =>
                        micromatch.isMatch(value, pattern)
                )

                if (isIgnored) {
                    return
                }

                if (
                    !layers[currentFileLayer].includes(
                        importLayer
                    )
                ) {
                    context.report({
                        node,
                        messageId: 'Wrong layer',
                    })
                }
            },
        }
    },
}
