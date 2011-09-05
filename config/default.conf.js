exports.config = {
    port: 5222, 
    domain: 'localhost',
    tls: {
        keyPath: './tls/localhost-key.pem',
        certPath: './tls/localhost-cert.pem'
    }
}