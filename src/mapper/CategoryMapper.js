'use strict';

const Category = require('../models/Category.js');


/**
 * Utility class to map Magento categories to CCIF categories.
 */
class CategoryMapper {
    
    /**
     * Maps an array of Magento categories to an array of CCIF categories
     *
     * @private
     * @param magentoResponse       JSON object returned by the Magento categories search.
     * @returns {Category[]}        An array of CCIF categories.
     */
    static _mapCategories(magentoResponse, ignoreCategoresWithLevelLowerThan) {
        return magentoResponse.items.map(category => {
            return CategoryMapper.mapCategory(category, ignoreCategoresWithLevelLowerThan);
        });
    }

    static mapCategory(magentoCategory) {
        let category = new Category(magentoCategory.id);
        category.name = magentoCategory.name;
        category.description = undefined; // This is unavailable in magento response.
        // TODO: Check if it is supported and the info is missing, or it just does not exist

       

        const slug = magentoCategory.custom_attributes.find(a => a.attribute_code === 'url_path');
        if (slug && slug.value) {
            category.slug = slug.value;
        }

        if (magentoCategory.created_at) {
            category.createdAt = magentoCategory.created_at;
        }
        if (magentoCategory.updated_at) {
            category.lastModifiedAt = magentoCategory.updated_at;
        }
        category.children = magentoCategory.children || [];

        return category;
    }
}

module.exports = CategoryMapper;