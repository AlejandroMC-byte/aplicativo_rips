const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/api', createProxyMiddleware({
    target: 'http://172.16.0.117/SIIS_DIME/webservices/ApiFacturasRipsElectronicos',
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
    secure: false,
    onProxyReq: (proxyReq, req, res) => {
        if (req.method === 'POST') {
            proxyReq.method = 'POST';  // 🔹 Forzar método POST
        }
        console.log('🔹 Proxy Request:', proxyReq.method, req.url);
    }
}));

app.listen(4000, () => {
    console.log('✅ Proxy corriendo en http://localhost:4000');
});
