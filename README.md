# 语雀 Markdown 图片转换

语雀 Markdown 图片转换为 Github 图床图片

## 用法

index.js 中修改配置

```js
  const token = "" // 替换成你的 GitHub 访问令牌，参考：https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
  const repo = "" // 替换成你的 GitHub 仓库路径 如："Xutaotaotao/cloud_img"
```

input.md 为你的语雀 Markdown 文件

output.md 为转换后的文件

## 运行

```bash
node index.js
```

## 注意事项
- 网络需要畅通访问 GitHub API