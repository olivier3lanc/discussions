// Fetch l'URL et permet d'utiliser le résultat du fetch avec la variable = nom du fichier
// Par exemple cms_fetch_links.js est utilisable dans les templates avec la variable cms_fetch_links
const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function() {
  let url = "https://olivier3lanc.ovh/cockpit/api/content/items/pages";
  // let url = "https://simplejsoncms.com/api/87s1dlzluv";
  

  /* This returns a promise */
  return EleventyFetch(url, {
      duration: "1s", // save for 1 sec
      type: "json",    // we’ll parse JSON for you
      fetchOptions: {
        headers: {
            "api-key": "API-1020e8d751390aa50ed06e5b161368c503757904"
        }
      }
  });
};