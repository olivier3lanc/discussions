// Fetch l'URL et permet d'utiliser le résultat du fetch avec la variable = nom du fichier
// Par exemple cms_fetch_links.js est utilisable dans les templates avec la variable cms_fetch_links
const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function() {
  /* This returns a promise */
  return EleventyFetch(process.env.COCKPIT_ENDPOINT_PAGES, {
      duration: "1s", // save for 1 sec
      type: "json",    // we’ll parse JSON for you
      fetchOptions: {
        headers: {
            "api-key": process.env.COCKPIT_API_KEY
        }
      }
  });
};