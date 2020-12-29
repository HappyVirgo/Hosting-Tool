const {createProxyMiddleware} = require("http-proxy-middleware");

module.exports = app => {
    app.use(
        "/",
        createProxyMiddleware({
            target: "https://app.hosttools.com",
            changeOrigin: true
        })
    );
};
