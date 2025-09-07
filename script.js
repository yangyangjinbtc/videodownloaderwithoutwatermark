// 全局变量存储解析结果
let currentData = null;

// 测试JavaScript是否正常工作
function testJavaScript() {
    console.log('JavaScript正常工作！');
    alert('JavaScript正常工作！parseVideo函数存在：' + (typeof parseVideo === 'function'));
}

// 测试代理服务器连接
async function testProxyServer() {
    try {
        console.log('测试代理服务器连接...');
        const response = await fetch('http://localhost:3003/api/test', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('代理服务器响应:', data);
            alert('✅ 代理服务器连接成功！\n' + JSON.stringify(data, null, 2));
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error('代理服务器连接失败:', error);
        alert('❌ 代理服务器连接失败！\n错误: ' + error.message + '\n\n请确保已运行: node proxy-server.js');
    }
}

// 演示模式 - 使用模拟数据
function parseVideoDemo() {
    console.log('启动演示模式...');
    
    // 模拟解析过程
    const parseBtn = document.getElementById('parseBtn');
    const parseBtnText = document.getElementById('parseBtnText');
    
    parseBtn.disabled = true;
    parseBtnText.innerHTML = '<div class="loading"></div> 演示解析中...';
    
    setTimeout(() => {
        // 使用模拟数据
        const mockData = {
            success: true,
            title: '【演示】抖音热门视频 - 这是一个测试视频标题',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            cover: 'https://picsum.photos/400/300?random=1',
            author: '演示用户',
            type: 'video'
        };
        
        currentData = mockData;
        displayResult(currentData);
        hideError();
        
        // 恢复按钮状态
        parseBtn.disabled = false;
        parseBtnText.innerHTML = `
            <svg class="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
            开始解析
        `;
        
        console.log('演示模式解析完成！');
        alert('✅ 演示模式解析成功！\n现在可以测试下载功能。');
    }, 2000);
}

// 页面加载时显示密码验证
window.onload = function() {
    document.getElementById('passwordModal').style.display = 'block';
    
    // 确保密码输入框事件监听器在DOM加载后添加
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
    }
};

// 密码验证 - 添加动画效果
function checkPassword() {
    const password = document.getElementById('passwordInput').value;
    const modal = document.getElementById('passwordModal');
    const content = modal.querySelector('.modal-content');
    
    if (password === '123456782') {
        // 成功动画
        content.style.transform = 'scale(0.9)';
        content.style.opacity = '0';
        content.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            modal.style.display = 'none';
            // 添加成功提示
            showSuccessMessage('验证成功，正在进入系统...');
        }, 300);
    } else {
        // 错误动画
        content.style.animation = 'shake 0.5s';
        document.getElementById('passwordError').classList.remove('hidden');
        
        // 重置动画
        setTimeout(() => {
            content.style.animation = '';
        }, 500);
    }
}

// 显示成功消息
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: rgba(0, 255, 0, 0.2); border: 1px solid rgba(0, 255, 0, 0.5); color: #00ff00; padding: 15px 25px; border-radius: 10px; z-index: 1001; backdrop-filter: blur(10px);">
            ${message}
        </div>
    `;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 2000);
}

// 回车键确认密码的事件监听器已在window.onload中添加

// 提取URL的正则表达式
function extractUrl(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);
    return matches ? matches[0] : null;
}

// 解析视频 - 真实API版本
async function parseVideo() {
    console.log('=== 开始解析视频 ===');
    console.log('按钮被点击了！');
    
    const shareText = document.getElementById('shareLink').value.trim();
    console.log('输入的文本:', shareText);
    
    if (!shareText) {
        console.log('错误：输入为空');
        showError('请输入分享链接！');
        return;
    }

    const videoUrl = extractUrl(shareText);
    console.log('提取的URL:', videoUrl);
    
    if (!videoUrl) {
        console.log('错误：无法提取URL');
        showError('无法从分享链接中提取有效的视频链接！');
        return;
    }

    // 显示加载状态
    const parseBtn = document.getElementById('parseBtn');
    const parseBtnText = document.getElementById('parseBtnText');
    
    if (!parseBtn || !parseBtnText) {
        console.error('找不到按钮元素！');
        showError('页面元素加载错误！');
        return;
    }
    
    parseBtn.disabled = true;
    parseBtnText.innerHTML = '<div class="loading"></div> 解析中...';
    console.log('开始解析请求...');

    try {
        // 使用本地代理服务器进行解析
        const proxyUrl = `http://localhost:3003/api/parse?url=${encodeURIComponent(videoUrl)}`;
        console.log('调用代理服务器:', proxyUrl);
        
        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }

        const data = await response.json();
        console.log('代理服务器响应:', data);

        if (data.success) {
            currentData = data;
            displayResult(currentData);
            hideError();
            console.log('解析成功！', data);
        } else {
            // 显示具体的错误信息
            showError(data.error || '解析失败，请检查链接是否正确');
            console.log('解析失败:', data.error);
        }

    } catch (error) {
        console.error('解析错误：', error);
        showError('解析失败：' + error.message + '。请检查链接是否正确或稍后重试。');
    } finally {
        // 恢复按钮状态
        parseBtn.disabled = false;
        parseBtnText.innerHTML = `
            <svg class="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
            开始解析
        `;
    }
}

// 显示解析结果
function displayResult(data) {
    document.getElementById('resultArea').classList.remove('hidden');
    document.getElementById('videoTitle').textContent = data.title || '无标题';
    document.getElementById('videoCover').src = data.cover || '';
    
    // 打印调试信息
    console.log('=== 解析结果调试信息 ===');
    console.log('视频标题:', data.title);
    console.log('视频URL:', data.url);
    console.log('封面URL:', data.cover);
    console.log('URL类型:', data.type);
    console.log('原始数据:', data);
    
    // 滚动到结果区域
    document.getElementById('resultArea').scrollIntoView({ behavior: 'smooth' });
}

// 显示错误信息
function showError(message) {
    document.getElementById('errorArea').classList.remove('hidden');
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('resultArea').classList.add('hidden');
}

// 隐藏错误信息
function hideError() {
    document.getElementById('errorArea').classList.add('hidden');
}

// 清除错误并重新尝试
function clearError() {
    hideError();
    document.getElementById('shareLink').focus();
}

// 下载文件函数 - 修复跨域问题
function downloadFile(url, filename) {
    if (!url) {
        alert('文件链接无效！');
        return;
    }

    // 清理URL
    const cleanUrl = url.trim().replace(/^`|`$/g, '');
    
    // 方法1：直接下载（最可靠）
    try {
        const link = document.createElement('a');
        link.href = cleanUrl;
        link.download = filename;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        // 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('开始下载：', filename, 'URL:', cleanUrl);
    } catch (error) {
        console.error('下载失败：', error);
        
        // 方法2：打开新窗口让用户手动下载
        alert('由于浏览器限制，请点击"确定"后在新打开的页面中手动下载文件');
        window.open(cleanUrl, '_blank');
    }
}

// 下载视频 - 修复下载大小为0的问题
function downloadVideo() {
    if (!currentData || !currentData.url) {
        alert('视频链接无效！');
        return;
    }

    // 显示下载状态
    const btn = document.getElementById('downloadVideoBtn');
    const originalText = btn.textContent;
    btn.innerHTML = '<div class="loading"></div> 下载中...';
    btn.disabled = true;

    // 获取文件名
    const title = currentData.title || 'video';
    const safeTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_').substring(0, 50);
    const filename = `${safeTitle}.mp4`;

    try {
        // 使用原始URL直接下载（避免跨域问题）
        const cleanUrl = currentData.url.trim().replace(/^`|`$/g, ''); // 移除可能的反引号
        downloadFile(cleanUrl, filename);
    } catch (error) {
        console.error('下载失败：', error);
        alert('下载失败，请尝试右键另存为！');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// 下载封面 - 修复下载大小为0的问题
function downloadCover() {
    if (!currentData || !currentData.cover) {
        alert('封面链接无效！');
        return;
    }

    // 显示下载状态
    const btn = document.getElementById('downloadCoverBtn');
    const originalText = btn.textContent;
    btn.innerHTML = '<div class="loading"></div> 下载中...';
    btn.disabled = true;

    // 获取文件名
    const title = currentData.title || 'cover';
    const safeTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_').substring(0, 50);
    const filename = `${safeTitle}_cover.jpg`;

    try {
        // 使用原始URL直接下载（避免跨域问题）
        const cleanUrl = currentData.cover.trim().replace(/^`|`$/g, ''); // 移除可能的反引号
        downloadFile(cleanUrl, filename);
    } catch (error) {
        console.error('下载失败：', error);
        alert('下载失败，请尝试右键另存为！');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}