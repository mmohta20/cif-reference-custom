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

const ProductGraphQlRequestBuilder = require('./ProductGraphQlRequestBuilder');
const httpRequest = require('request-promise-native');
const ProductMapper = require('./ProductMapper');
const HttpStatusCodes = require('http-status-codes');


/**
 * This action searches a single Magento product by either its SKU or slug.
 *
 * @param   {object} args                               Object of request parameters.
 * @param   {String} param                              Parameter key that should be used. Can be slug or id. Key needs to exist in args.
 * @param   {String} filterKey                          Key of the filter that is used to find the product. Can be slug or variants.sku.
 * 
 * @return  {Promise.<Product}                          A promise which resolves to a product model representation
 */
function getProduct(argsForBuilder) {


    const builder = new ProductGraphQlRequestBuilder('http://internal-hpwszmy-gopegmkbduhfw.us-4.magentosite.cloud/graphql', __dirname + '/searchProducts.graphql', argsForBuilder);

    const requestOptions = builder.build();
    let request = httpRequest(requestOptions);
    return request.then(response => {
        if (response.body.errors) {
            return Promise.reject({
                'err': response.body.errors
            });
        }

        const items = response.body.data.products.items;
        if (!items || items.length === 0) {
            return Promise.reject({
                statusCode: HttpStatusCodes.NOT_FOUND
            });
        }
        const productMapper = new ProductMapper();
        return productMapper.mapGraphQlResponse(response.body);
    }).catch((error) => {
        return Promise.reject({
            'err': error
        });
    });

}

module.exports = getProduct;