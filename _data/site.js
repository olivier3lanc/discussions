module.exports = function() {
    return {
        environment: process.env.MY_ENVIRONMENT || "development",
        imgsrv: 'https://wsrv.nl/?&url=',
        imgroot: 'https://olivier3lanc.ovh/cockpit/storage/uploads'
    };
};
  