/**
 * @fileoverview fsd relative path
 * @author vlad
 */
'use strict'

const path = require('path')
const { isPathRelative } = require('../helpers/index')

const layers = {
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
        fixable: 'code', // Or `code` or `whitespace`
        schema: [
            {
                type: 'object',
                properties: {
                    alias: {
                        type: 'string',
                    },
                },
            },
        ], // Add a schema if the rule has options
        messages: {
            'Must be relative': 'Must be relative',
        },
    },

    create(context) {
        const alias = context.options[0].alias || ''

        const getNormilizedCurrentFilePath = (
            currentFile
        ) => {
            const normalizedPath =
                path.toNamespacedPath(currentFile)
            const projectFrom =
                normalizedPath.split('src')[1]
            return projectFrom.split('\\').join('/')
        }

        const shouldBeRelative = (from, to) => {
            if (isPathRelative(to)) {
                return false
            }

            const toArray = to.split('/')
            const toLayer = toArray[0]
            const toSlice = toArray[1]

            if (!toLayer || !toSlice || !layers[toLayer]) {
                return false
            }

            const projectFrom =
                getNormilizedCurrentFilePath(from)
            const fromArray = projectFrom.split('/')

            const fromLayer = fromArray[1]
            const fromSlice = fromArray[2]

            if (
                !fromLayer ||
                !fromSlice ||
                !layers[fromLayer]
            ) {
                return false
            }

            return (
                fromSlice === toSlice &&
                toLayer === fromLayer
            )
        }

        return {
            ImportDeclaration(node) {
                const value = node.source.value
                const importTo = alias
                    ? value.replace(`${alias}/`, '')
                    : value

                const fromFileName = context.filename

                if (
                    shouldBeRelative(fromFileName, importTo)
                ) {
                    context.report({
                        messageId: 'Must be relative',
                        node,
                        fix: (fixer) => {
                            const normalizedPath =
                                getNormilizedCurrentFilePath(
                                    fromFileName
                                )
                                    .split('/')
                                    .slice(0, -1)
                                    .join('/')

                            let relativePath = path
                                .relative(
                                    normalizedPath,
                                    `/${importTo}`
                                )
                                .split('\\')
                                .join('/')

                            if (
                                !relativePath.startsWith(
                                    '.'
                                )
                            ) {
                                relativePath =
                                    './' + relativePath
                            }

                            return fixer.replaceText(
                                node.source,
                                `'${relativePath}'`
                            )
                        },
                    })
                }
            },
        }
    },
}
