# 复旦树洞前端 FDU Hole Front End

本项目依赖于[复旦树洞后端 FDU Hole Back End](https://github.com/fduhole/fduhole)

[![deploy to server](https://github.com/fduhole/vue/actions/workflows/main.yml/badge.svg)](https://github.com/fduhole/vue/actions/workflows/main.yml)

立即前往  
[master](https://fduhole.tk)  
[dev](https://fduhole.vercel.app)

## 开发
请不要直接修改 master 分支，开发过程中，临时更改提交到 dev 分支
```shell
# 克隆本仓库
git clone https://www.github.com/fduhole/vue.git
cd vue
# 安装依赖
npm install
# 运行开发服务器
npm run serve
```

## 发布
发布新版本请遵循以下流程
1. 将 dev 分支合并入 master 分支，并 push 至 GitHub
2. 新建 Release
3. 修改 dev 分支 package.json 中的版本号

## 反馈
欢迎通过提交 Issue 或 Pull Request 的方式参与到本项目的开发与维护当中！
