# V2-Yunzai

Yunzai目前正在重构V3版本，具体可参见 [V3-Yunzai](https://github.com/Le-niao/Yunzai-Bot) ，目前V3-Yunzai在逐步完善中

由于V3架构变化较大，V2版本暂无法平滑迁移且停止维护，故fork此版本Yunzai，在V3重构完成前此版本会保持维护，进行必要的Bug修正以及卡池等信息补充

## 已有V2-Yunzai切换至 喵喵V2-Yunzai

在Yunzai根目录夹打开终端，运行

```
// 使用gitee
git remote set-url origin https://gitee.com/yoimiya-kokomi/Yunzai-Bot

// 使用github
git remote set-url origin https://github.com/yoimiya-kokomi/Yunzai-Bot
```

即可切换Yunzai远程仓库地址，运行git pull拉取更新即可使用喵喵版V2-Yunzai（版本>2.2.0)

后续亦可使用#更新 命令进行更新

## 新安装喵喵V2-Yunzai

**若为全新安装，推荐直接安装新版V3** 

若确实需要安装V2，可使用以下方法

```
1.克隆项目
// 使用gitee
git clone https://gitee.com/yoimiya-kokomi/Yunzai-Bot.git
cd Yunzai-Bot

// 使用github
git clone https://github.com/yoimiya-kokomi/Yunzai-Bot.git
cd Yunzai-Bot


2. 用cnpm安装依赖
npm install -g cnpm --registry=https://registry.npmmirror.com
cnpm install

3.首次运行，按提示输入完成配置登录
node app

4.需要后台运行的，停止现在的输入下面命令
npm start
```

其余操作及说明可参见[原版V2-Yunzai文档](README2.md)