/*******************************************************************************
 *
 *    Copyright 2018 Adobe. All rights reserved.
 *    This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License. You may obtain a copy
 *    of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software distributed under
 *    the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *    OF ANY KIND, either express or implied. See the License for the specific language
 *    governing permissions and limitations under the License.
 *
 ******************************************************************************/

'use strict';

const handlebars = require('handlebars');
const fs = require('fs');


class ProductGraphQlRequestBuilder {

    constructor(endpoint, template, requestArgs) {
        this.endpoint = endpoint;
        this.requestArgs = requestArgs.q;
        this.template = template;
        console.log(template);
        this.context = {};
    }

    build() {
        // Parse arguments
        /*this._parsePagination();
        this._parseFullTextSearch();
        this._parseSorting();
        this._parseFilter();
        this._parseAttributes();

       
        // Generate query
        let query = this._generateQuery();*/

        return {
            method: 'POST',
            uri: this.endpoint,
            body: {
                query: this.requestArgs,
                operationName: null,
                variables: null
            },
            headers: {
                'Store': 'default'
            },
            json: true,
            resolveWithFullResponse: true
        };
    }

    _parseAttributes() {
        this.context.attributes = this.requestArgs.GRAPHQL_PRODUCT_ATTRIBUTES || [];
    }

    /**
     * sample filter sku:1 | key:val
     */
    _parseFilter() {
        let filterArgs = this.requestArgs.filter && this.requestArgs.filter.indexOf('|') > 0 ? this.requestArgs.filter.split('|') : [];
        filterArgs = filterArgs.length === 0 && this.requestArgs.filter.length === 1 ? this.requestArgs.filter : [];
        let filterFields = [];

        filterArgs.forEach((filterArg) => {
            // Translate field names
            let field = ProductGraphQlRequestBuilder._translateFieldName(filterArg);

            // Parse value
            let value;
            let values;
            let split = filterArg.split(':');
            if (split.length == 2) {
                let val = split[1];
                if(val.indexOf(',') > 0){
                    values = val.split(',');
                }
                else{
                    value = val;
                }
            }

            if (field) {
                if (value) {
                    filterFields.push({field: field, value: value});
                } 
                else if (values) {
                    filterFields.push({field: field, values: values});
                } 
            }
        });

        return Object.assign(this.context, {filter: filterFields});
    }

    _parseSorting() {
        let sortArgs = this.requestArgs.sort && this.requestArgs.sort.length > 0 ? this.requestArgs.sort.split('|') : [];
        let sortFields = [];

        sortArgs.forEach((sortArg) => {
            // Get direction
            let direction = 'ASC';
            if (sortArg.split('.').slice(-1)[0] == 'desc') {
                direction = 'DESC';
            }

            // Translate field names
            let field = ProductGraphQlRequestBuilder._translateFieldName(sortArg);
            if (field) {
                sortFields.push({field: field, direction: direction});
            }
        });

        return Object.assign(this.context, {sort: sortFields});
    }

    static _translateFieldName(field) {
        if (field.startsWith('slug') || field.startsWith('url_key')) {
            return 'url_key';
        }
        if (field.startsWith('name')) {
            return 'name';
        }
        if (field.startsWith('price')) {
            return 'price';
        }
        if (field.startsWith('categories.id')) {
            return 'category_id';
        }
        if (field.startsWith('variants.sku') || field.startsWith('sku')) {
            return 'sku';
        }
        return null;
    }

    _parsePagination() {
        let limit = Number(this.requestArgs.limit);
        if (!limit || limit < 0) {
            limit = 25;
        }
        let offset = Number(this.requestArgs.offset);
        if (!offset || offset < 0) {
            offset = 0;
        }

        let currentPage = 1;
        if (limit > 0 && offset % limit === 0) {
            currentPage = (offset / limit) + 1;
        }

        return Object.assign(this.context, {
            'pageSize': limit, 
            'currentPage': currentPage
        });
    }

    _parseFullTextSearch() {
        if (!('text' in this.requestArgs)) {
            return;
        }
        let text = this.requestArgs.text;
        return Object.assign(this.context, {
            'search': text
        });
    }

    _generateQuery() {
        console.log(this.template);
        let queryTemplate = "{\r\n    products(\r\n        filter: {\r\n            {{#each filter}}\r\n            {{field}}: {\r\n                {{#if value}}\r\n                eq: \"{{value}}\"\r\n                {{/if}}\r\n                {{#if values}}\r\n                in: [{{#each values}}\"{{this}}\"{{#unless @last}}, {{/unless}}{{/each}}]\r\n                {{/if}}\r\n            }\r\n            {{/each}}\r\n        }\r\n        {{#if sort}}\r\n        sort: {\r\n            {{#each sort}}\r\n            {{field}}: {{direction}}\r\n            {{/each}}\r\n        }\r\n        {{/if}}\r\n        {{#if search}}\r\n        search: \"{{search}}\"\r\n        {{/if}}\r\n        pageSize: {{pageSize}}\r\n        currentPage: {{currentPage}}\r\n    ) {\r\n        total_count\r\n        page_info {\r\n          page_size\r\n          current_page\r\n        }\r\n        items {\r\n          id\r\n          sku\r\n          name\r\n          url_key\r\n          stock_status\r\n          description {\r\n            html\r\n          }\r\n          created_at\r\n          updated_at\r\n          {{#each attributes}}\r\n          {{this}}\r\n          {{/each}}\r\n          categories {\r\n            id\r\n            url_path\r\n          }\r\n          price {\r\n            regularPrice {\r\n              amount {\r\n                value\r\n                currency\r\n              }\r\n            }\r\n          }\r\n          image {\r\n            url\r\n          }\r\n          ... on ConfigurableProduct {\r\n            configurable_options {\r\n              attribute_code\r\n              label\r\n              values {\r\n                value_index\r\n                label\r\n              }\r\n            }\r\n            variants {\r\n              product {\r\n                id\r\n                sku\r\n                name\r\n                url_key\r\n                stock_status\r\n                description {\r\n                  html\r\n                }\r\n                created_at\r\n                updated_at\r\n                categories {\r\n                  id\r\n                }\r\n                price {\r\n                  regularPrice {\r\n                    amount {\r\n                      value\r\n                      currency\r\n                    }\r\n                  }\r\n                }\r\n                image {\r\n                  url\r\n                }\r\n                {{#each attributes}}\r\n                {{this}}\r\n                {{/each}}\r\n              }\r\n            }\r\n          }\r\n        }\r\n    }\r\n}";
        let compiledTemplate = handlebars.compile(queryTemplate);
        return compiledTemplate(this.context);
    }

}

module.exports = ProductGraphQlRequestBuilder;