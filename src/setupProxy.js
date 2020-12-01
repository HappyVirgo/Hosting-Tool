const {createProxyMiddleware} = require("http-proxy-middleware");

module.exports = app => {
    app.use(
        "/",
        createProxyMiddleware({
            target: "https://hosttools.com",
            changeOrigin: true
        })
    );
};
