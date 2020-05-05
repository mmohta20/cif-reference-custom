/*******************************************************************************
 *
 *    Copyright 2019 Adobe. All rights reserved.
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

const DataLoader = require('dataloader');
const Client = require('../baseclient/client.js');
const CategoryMapper = require('../mapper/CategoryMapper.js')
const Category = require('../models/Category.js');

class CategoryTreeLoader {

    /**
     * @param {Object} [actionParameters] Some optional parameters of the I/O Runtime action, like for example authentication info.
     */
    constructor(actionParameters) {
        // The loading function: "categoryIds" is an Array of category ids
        let loadingFunction = categoryIds => {
            // This loader loads each category one by one, but if the 3rd party backend allows it,
            // it could also fetch all categories in one single request. In this case, the method
            // must still return an Array of categories with the same order as the keys.
            return Promise.resolve(categoryIds.map(categoryId => {
                console.debug(`--> Fetching category with id ${categoryId}`);
                return this.__getCategoryById(categoryId, actionParameters).then(function(magento2Response){
                    return CategoryMapper.mapCategory(magento2Response);
                }).catch(error => {
                        console.error(`Failed loading category ${categoryId}, got error ${JSON.stringify(error, null, 0)}`);
                        return null;
                    });
            }));
        };

        this.loader = new DataLoader(keys => loadingFunction(keys));
    }

    /**
     * Loads the category with the given categoryId.
     * 
     * @param {*} categoryId
     * @returns {Promise} A Promise with the category data.
     */
    load(categoryId) {
        return this.loader.load(categoryId);
    }

    /**
     * In a real 3rd-party integration, this method would query the 3rd-party system
     * in order to fetch a category based on the category id. This method returns a Promise,
     * for example to simulate some HTTP REST call being performed to the 3rd-party commerce system.
     * 
     * @param {Number} categoryId The category id (integer).
     * @param {Object} actionParameters Some parameters of the I/O action itself (e.g. backend server URL, authentication info, etc)
     * @returns {Promise} A Promise with the category data.
     */
    __getCategoryById(categoryId, actionParameters) {

        // Each category contains the list of its sub-categories ids: the function CategoryTree.children()
        // demonstrates how these ids can be mapped to detailed category data.
        // In contrast, each category does not return the ids of the products it contains.
        // The function CategoryTree.products() shows how one would have to fetch the products
        // in an extra request if they are being requested in the GraphQL query.

        let options = {};
        options.baseUrl = 'http://internal-hpwszmy-gopegmkbduhfw.us-4.magentosite.cloud/rest/all/V1/';
        options.auth='bwku8kfea5yw8i8lv153su2g2dyu6es9';
        let baseClient = new Client(options);
        return  baseClient.getCategoryById(categoryId);
    }

    // For a given category id, builds a dummy url_path
    // Example for category id 221 --> "2/22/221"
    __toSlug(categoryId) {
        if (categoryId < 10) {
            return new String(categoryId);
        }

        let previous = 0;
        return new String(categoryId)
            .split('')
            .map(s => parseInt(s))
            .map(i => {
                previous = (previous * 10) + i;
                return previous;
            })
            .join('/');
    }
}

module.exports = CategoryTreeLoader;