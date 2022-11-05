import fs from "fs"
import readline from "readline"
import lodash from "lodash"
import inquirer from 'inquirer'

if (!fs.existsSync("./node_modules")) {
  console.log("请先npm install安装，或者cnpm install安装")
  process.exit()
}

let configPath = "./config/config.js"
let rl

function question(query) {
  return new Promise((resolve) => {
    if (!rl) return
    rl.question(query.trim(), resolve)
  })
}

//检查配置文件config.js
async function check() {
  if (fs.existsSync(configPath)) {
    global.BotConfig = (await import(`../config/config.js`)).config

    //默认配置
    if (!global.BotConfig.account.log_level) {
      global.BotConfig.account.log_level = "info"
    }
    if (!global.BotConfig.account.platform) {
      global.BotConfig.account.platform = "5"
    }
    if (!global.BotConfig.pushTask) {
      global.BotConfig.pushTask = {
        signTime: "0 2 0 * * ?",
        isPushSign: 0,
      }
    }
    if (lodash.isUndefined(global.BotConfig.account.autoQuit)) {
      global.BotConfig.account.autoQuit = "1"
    }
    if (!global.BotConfig.cookieDoc) {
      global.BotConfig.cookieDoc = "docs.qq.com/doc/DUWNVQVFTU3liTVlO"
    }
    if (lodash.isUndefined(global.BotConfig.pushTask.isPushLedger)) {
      global.BotConfig.pushTask.isPushLedger = 1
    }
    if (lodash.isUndefined(global.BotConfig.pushTask.isPushNote)) {
      global.BotConfig.pushTask.isPushNote = 1
    }
    if (lodash.isUndefined(global.BotConfig.pushTask.isPushNews)) {
      global.BotConfig.pushTask.isPushNews = 1
    }
    if (lodash.isUndefined(global.BotConfig.disablePrivate)) {
      global.BotConfig.disablePrivate = false
    }
    if (lodash.isUndefined(global.BotConfig.decreaseCookie)) {
      global.BotConfig.decreaseCookie = 0
    }
  } else {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

  console.log("欢迎使用Yunzai-Bot，请按提示输入完成配置")
  let propmtList = [
    {
      type: 'Input',
      message: '请输入机器人QQ号(请用小号)：',
      name: 'QQ',
      validate (value) {
        if (/^[1-9][0-9]{4,14}$/.test(value)) return true
        return '请输入正确的QQ号'
      }
    },
    {
      type: process.platform == 'win32' ? 'Input' : 'password',
      message: '请输入登录密码(为空则扫码登录)：',
      name: 'pwd'
    },
    {
      type: 'list',
      message: '请选择登录端口：',
      name: 'platform',
      default: '5',
      choices: ['iPad', '安卓手机', '安卓手表', 'MacOS', 'aPad'],
      filter: (val) => {
        switch (val) {
          case 'iPad':return 5
          case 'MacOS':return 4
          case '安卓手机':return 1
          case '安卓手表':return 3
          case 'aPad':return 2
          default:return 5
        }
      }
    },
    {
      type: 'Input',
      message: '请输入主人QQ号：',
      name: 'masterQQ',
      validate (value) {
        if (/^[1-9][0-9]{4,14}$/.test(value)) return true
        return '请输入正确的QQ号'
      }
    },
    {
      type: 'Input',
      message: '请输入抽卡次数：',
      name: 'gachaDayNum',
      validate (value) {
        if (/^[0-9]+$/.test(value)) return true
        return '请输入正确数字'
      }
    },
    {
      type: 'Input',
      message: '请输入米游社Cookie：',
      name: 'cookie',
      validate (value) {
        if (!value) return true
        if (value.includes("ltoken") && value.includes("ltuid")) return true
        return '请输入正确的Cookie，留空跳过'
      }
    }
  ]
  const ret = await inquirer.prompt(propmtList)

    let str = fs.readFileSync("./config/config_default.js", "utf8")
    str = str.replace(/qq:(.*)""/, `qq:"${ret.QQ}"`)
    str = str.replace(/pwd:(.*)""/, `pwd:"${ret.pwd}"`)
    str = str.replace(/platform:(.*),/, `platform:"${ret.platform}",`)
    str = str.replace(/gachaDayNum: 1,/, `gachaDayNum: ${ret.gachaDayNum},`)
    str = str.replace(/masterQQ: \[123456,/, `masterQQ: [${ret.masterQQ},`)
    str = str.replace(/mysCookies:([^\]]*)/, `mysCookies:['${ret.cookie}',`)

    fs.writeFileSync(configPath, str)
    console.log("配置完成，其他配置请修改配置文件")
    global.BotConfig = (await import(`../config/config.js`)).config
    BotConfig.first = true
  }
}

export { check }