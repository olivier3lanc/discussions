module.exports = function() {
    let url = 'http://192.168.1.54';
    let baseurl = '/conversations/_site';
    const currentEnv = process.env.MY_ENVIRONMENT || "development";
    if (currentEnv == 'production') {
        url = 'https://unrivaled-dango-fdd77b.netlify.app';
        baseurl = ''
    }
    return {
        environment: process.env.MY_ENVIRONMENT || "development",
        url: url,
        baseurl: baseurl,
        imgsrv: 'https://wsrv.nl/?&url=',
        imgroot: 'https://olivier3lanc.ovh/cockpit/storage/uploads'
    };
};
  