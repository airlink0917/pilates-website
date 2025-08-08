const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3000;

// ローカルIPアドレスを取得
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// MIMEタイプの判定
function getContentType(filePath) {
    const extname = path.extname(filePath);
    const contentTypes = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
    };
    return contentTypes[extname] || 'application/octet-stream';
}

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': getContentType(filePath) });
            res.end(content, 'utf-8');
        }
    });
});

const localIP = getLocalIP();

server.listen(PORT, () => {
    console.log('===============================================');
    console.log('ピラティスウェブサイトサーバーが起動しました！');
    console.log('===============================================');
    console.log('');
    console.log('アクセス方法：');
    console.log(`PCから: http://localhost:${PORT}`);
    console.log(`モバイルから: http://${localIP}:${PORT}`);
    console.log('');
    console.log('※ モバイルからアクセスする場合は、');
    console.log('   PCとモバイルが同じWi-Fiに接続されている必要があります');
    console.log('');
    console.log('サーバーを停止するには Ctrl+C を押してください');
    console.log('===============================================');
});