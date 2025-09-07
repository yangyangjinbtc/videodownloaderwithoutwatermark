// 改进的代理服务器，用于绕过CORS限制
const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3003;

// 使用指定的抖音解析API
const API_CONFIG = {
    baseUrl: 'https://api.guijianpan.com/waterRemoveDetail/xxmQsyByAk',
    accessKey: 'aa36655e670544f08f4136042a310eb2'
};

const server = http.createServer(async (req, res) => {
    console.log(`收到请求: ${req.method} ${req.url}`);
    
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url.startsWith('/api/parse')) {
        try {
            const queryParams = url.parse(req.url, true).query;
            const videoUrl = queryParams.url;

            if (!videoUrl) {
                console.log('错误: 缺少视频URL参数');
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false,
                    error: '缺少视频URL参数' 
                }));
                return;
            }

            console.log('开始解析视频:', videoUrl);
            await parseVideo(videoUrl, res);
        } catch (error) {
            console.error('处理请求时发生错误:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false,
                error: '服务器内部错误: ' + error.message 
            }));
        }
    } else if (req.url === '/api/test') {
        // 添加测试接口
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: true,
            message: '代理服务器运行正常',
            timestamp: new Date().toISOString()
        }));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: false,
            error: '接口不存在' 
        }));
    }
});

async function parseVideo(videoUrl, res) {
    console.log(`开始解析视频: ${videoUrl}`);
    
    try {
        // 构建API请求URL
        const apiUrl = `${API_CONFIG.baseUrl}?ak=${API_CONFIG.accessKey}&link=${encodeURIComponent(videoUrl)}`;
        console.log('调用API:', apiUrl);

        const result = await makeRequest(apiUrl);
        console.log('API原始响应:', result.substring(0, 500) + '...');
        
        let data;
        try {
            data = JSON.parse(result);
        } catch (parseError) {
            console.error('JSON解析失败:', parseError.message);
            throw new Error('API响应格式错误');
        }

        console.log('API解析后数据:', JSON.stringify(data, null, 2));

        // 根据你提供的API数据结构处理响应
        if (data.code === '10000' && data.content && data.content.success) {
            const content = data.content;
            const videoData = {
                success: true,
                title: content.title || '抖音视频',
                url: content.url,
                cover: content.cover,
                author: content.author || '未知作者',
                type: content.type || 'VIDEO',
                likeNum: content.likeNum || 0,
                originText: content.originText || videoUrl
            };

            if (videoData.url) {
                console.log('解析成功！返回数据:', videoData);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(videoData));
                return;
            } else {
                throw new Error('API返回的数据中缺少视频URL');
            }
        } else {
            throw new Error(data.msg || 'API返回错误状态');
        }
    } catch (error) {
        console.error('解析失败:', error.message);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: false, 
            error: '解析失败: ' + error.message + '。请检查链接是否正确或稍后重试。' 
        }));
    }
}

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        
        const req = client.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve(data);
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('请求超时'));
        });
    });
}

server.listen(PORT, () => {
    console.log(`代理服务器运行在 http://localhost:${PORT}`);
    console.log('请在浏览器中打开 index.html 文件');
});