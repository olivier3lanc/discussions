module.exports = function() {
    return {
        environment: process.env.MY_ENVIRONMENT || "development",
        imgsrv: process.env.IMAGE_SERVER_ENDPOINT,
        imgroot: process.env.SOURCES_IMAGES_ROOT,
        api: process.env.COCKPIT_API_KEY,
        theme_color_values: ["grey", "blue", "green", "orange", "red"],
        alignment_values: ["left", "right"]
    };
};
  