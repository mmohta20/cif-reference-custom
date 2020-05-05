class Category {

    constructor(id) {

        /**
         * The list of subcategories for this category. Depending on the backend system, the returned items may only have their ids being set.
         * @type {Category[]}
         */
        this.children = undefined;

        /**
         * The date-time when this object was created. The JSON representation must be in RFC339 / ISO8601 format
         * @type {string}
         */
        this.createdAt = undefined;

        /**
         * The description of the category.
         * @type {string}
         */
        this.description = undefined;

        /**
         * The internal unique ID of the category in the commerce backend system.
         * @type {string}
         */
        this.id = id;

        /**
         * The date-time when this object was last modified. The JSON representation must be in RFC339 / ISO8601 format
         * @type {string}
         */
        this.lastModifiedAt = undefined;

        /**
         * The id of the main parent category (if this category has multiple parents).
         * @type {string}
         */
        this.mainParentId = undefined;

        /**
         * The name of the category.
         * @type {string}
         */
        this.name = undefined;

        /**
         * The list of parent categories for this category. Depending on the backend system, the returned items may only have their ids being set.
         * @type {Category[]}
         */
        this.parents = undefined;

        /**
         * Slug or human readable key that uniquely identifies the category and that can be used for SEO friendly urls. The slug can be a path containing slashes.
         * @type {string}
         */
        this.slug = undefined;
    }   
}
module.exports = Category;