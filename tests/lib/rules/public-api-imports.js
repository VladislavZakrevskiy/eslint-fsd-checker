/**
 * @fileoverview dont import from public api
 * @author vlad
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/public-api-imports'),
    RuleTester = require('eslint').RuleTester

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester()
ruleTester.run('public-api-imports', rule, {
    valid: [
        // give me some code that won't trigger a warning
    ],

    invalid: [
        {
            code: "import {exampleSlice} from 'entities/Article/model/slice/ExampleSlice' ",
            errors: [
                {
                    filename:
                        'C:\\Users\\SkY\\Desktop\\ulbi_course\\src\\entities\\Article',
                    code: "import {lvmdlv} from '@/entities/Article'",
                    errors: [],
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
                            message: 'Must be from public api',
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
        },
    ],
})
