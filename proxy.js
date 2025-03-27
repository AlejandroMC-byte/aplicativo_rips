const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
const webservices = {
    "fal":"https://siis.fundacional.org:8443/SIIS_FAL/webservices/ApiFacturasRipsElectronicos",
    "dime":"http://172.16.0.117/SIIS_DIME/webservices/ApiFacturasRipsElectronicos",
    "sigma":"https://siis04.simde.com.co/SIIS_SIGMA/webservices/ApiFacturasRipsElectronicos",
    "cya": "https://siis05.simde.com.co/SIIS_CYA/webservices/ApiFacturasRipsElectronicos",
    "ucimed":"https://siis04.simde.com.co/SIIS_UCIMED/webservices/ApiFacturasRipsElectronicos",
    "posmedica": "https://siis04.simde.com.co/SIIS_POSMEDICA/webservices/ApiFacturasRipsElectronicos",
    "obtenerFacturas": "https://devel82els.simde.com.co/facturacionElectronica/public/api/obtenerFacturas"
};

app.use(bodyParser.json());

app.use('/api', (req, res, next) => {
    console.log('🔹 JSON Enviado:', req.body);
    console.log('Webservices:', req.body.webservices);
    console.log('Webservices target:', webservices[req.body.webservices]);

    const target = webservices[req.body.webservices];
    if (!target) {
        return res.status(400).send('Invalid webservice');
    }

    const proxy = createProxyMiddleware({
        target: target,
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
        secure: false,
        followRedirects: true,
        onProxyReq: (proxyReq, req, res) => {
            if (req.method === 'POST' && req.body) {
                const bodyData = JSON.stringify(req.body);
                // Reescribir el cuerpo de la solicitud
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
                proxyReq.end();
            }
            console.log('🔹 Proxy Request:', proxyReq.method, req.url);
        },
        onProxyRes: (proxyRes, req, res) => {
            console.log('🔹 Proxy Response:', proxyRes.statusCode, req.method, req.url);
        },
        preserveHeaderKeyCase: true // Mantiene los encabezados originales
    });

    proxy(req, res, next);
});

app.listen(4000, () => {
    console.log('✅ Proxy corriendo en http://localhost:4000');
});
