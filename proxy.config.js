const PROXY_CONFIG = {
  "/model-service": {
    "target": "http://192.168.1.160:50002",
    "secure": false,
    "changeOrigin": true,
  },
  "/security-service": {
    "target": "http://192.168.1.160:50002",
    "secure": false,
    "changeOrigin": true,
  },
  "/model-processor-service": {
    "target": "http://192.168.1.160:50002",
    "secure": false,
    "changeOrigin": true,
  }
};

module.exports = PROXY_CONFIG; 