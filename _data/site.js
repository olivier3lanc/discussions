module.exports = function() {
    return {
        environment: process.env.MY_ENVIRONMENT || "development",
        imgsrv: process.env.IMAGE_SERVER_ENDPOINT,
        imgroot: process.env.SOURCES_IMAGES_ROOT,
        api: process.env.COCKPIT_API_KEY
    };
};
  