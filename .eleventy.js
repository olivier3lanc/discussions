module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy("assets");
    // Shortcodes added in this way are available in:
    // * Markdown
    // * Liquid
    // * Nunjucks
    // * Handlebars (not async)
    // * JavaScript
    // eleventyConfig.addShortcode("user", function(firstName, lastName) { … });
  
    // Async support for `addShortcode` is new in Eleventy v2.0.0
    // eleventyConfig.addPairedShortcode("model_ui", async function(section) {

    //     return section.data
    //  });
    // eleventyConfig.addShortcode("link_it", async function(cms_site, lang, permalink) {

    //     return `${env.url}/${env.baseurl}/${lang}/${permalink}`
    // });
  
    // Async method available
    // eleventyConfig.addAsyncShortcode("user", async function(myName) { /* … */ });
};