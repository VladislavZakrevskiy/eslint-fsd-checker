/**
 * @fileoverview fsd relative path
 * @author vlad
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/path-checker'),
    RuleTester = require('eslint').RuleTester

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parserOptions: { ecmaVersion: 6, sourceType: 'module' },
})
ruleTester.run('path-checker', rule, {
    valid: [
        // give me some code that won't trigger a warning
    ],

    invalid: [
        {
            filename:
                'C:\\Users\\SkY\\Desktop\\ulbi_course\\src\\entities\\Article',
            code: "import {lvmdlv} from '@/entities/Article/model/slices/addComment'",
            errors: [
                {
                    message: 'Must be relative.',
                },
            ],
            options: [
                {
                    alias: '@',
                },
            ],
        },

        {
            filename:
                'C:\\Users\\SkY\\Desktop\\ulbi_course\\src\\entities\\Article',
            code: "import {lvmdlv} from 'entities/Article/model/slices/addComment'",
            errors: [
                {
                    message: 'Must be relative.',
                },
            ],
        },

        {
            filename:
                'C:\\Users\\SkY\\Desktop\\ulbi_course\\src\\entities\\Article',
            code: "import {lvmdlv} from '../../model/slices/addComment'",
            errors: [],
        },
    ],
})
