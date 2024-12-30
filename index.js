const axios = require('axios');
// 使用示例
const fs = require('fs').promises;

async function downloadYuqueImage(yuqueImageUrl) {
  try {
    const response = await axios.get(yuqueImageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.yuque.com/'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

function generateFileName() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `image_${timestamp}_${random}.png`;
}

async function uploadToGithub(imageBuffer, fileName, token, owner, repo) {
  try {
    const content = Buffer.from(imageBuffer).toString('base64');
    const response = await axios({
      method: 'PUT',
      url: `https://api.github.com/repos/${owner}/${repo}/contents/${fileName}`,
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      },
      data: {
        message:'my commit message',
        committer:{
          name: '',
          email: ''
        },
        content
      }
    });
    return response.data;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

async function uploadYuqueImageToGithub(yuqueImageUrl, token, repo) {
  try {
    // 解析 repo
    const [owner, repository] = repo.split('/');
    
    // 下载图片
    const imageBuffer = await downloadYuqueImage(yuqueImageUrl);
    
    // 生成文件名
    const fileName = generateFileName();
    
    // 上传到 Github
    const githubUrl = await uploadToGithub(imageBuffer, fileName, token, owner, repository);
    
    return githubUrl;
  } catch (error) {
    console.error('Process failed:', error);
    throw error;
  }
}

async function processMarkdown({ markdownContent,token,repo}) {
  const yuqueImageRegex = /https:\/\/cdn\.nlark\.com\/yuque\/.*?\.png/g;
  
  const yuqueUrls = Array.from(markdownContent.matchAll(yuqueImageRegex)).map(match => match[0]);
  
  let processedContent = markdownContent;
  
  for (const yuqueUrl of yuqueUrls) {
    try {      
      const githubResponse = await uploadYuqueImageToGithub(
        yuqueUrl,
        token,
        repo
      );
      
      const newImageUrl = githubResponse.content.download_url;
      console.log('New Image URL:', newImageUrl);
      processedContent = processedContent.replace(yuqueUrl, newImageUrl);
      
      // 等待一段时间，避免 GitHub API 限制
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`Error processing image ${yuqueUrl}:`, error);
    }
  }
  
  return processedContent;
}

async function main() {
  const token = "" // 替换成你的 GitHub 访问令牌，参考：https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
  const repo = "" // 替换成你的 GitHub 仓库路径 如："Xutaotaotao/cloud_img"
  try {
    // 直接从文件读取 Markdown 内容
    const markdownContent = await fs.readFile('input.md', 'utf8');
    const processedMarkdown = await processMarkdown({
      markdownContent,
      token,
      repo
    });
    // 将处理后的内容写入新文件
    await fs.writeFile('output.md', processedMarkdown, 'utf8');
    
    console.log('Markdown processing completed!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();