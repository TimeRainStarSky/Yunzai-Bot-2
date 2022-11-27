import { check } from "./lib/check.js"
import { init } from "./lib/init.js"
import { createClient } from "oicq"
import solve from "./lib/dealMsg.js"
import common from "./lib/common.js"
import inquirer from 'inquirer'
import fetch from 'node-fetch'

process.title = 'Yunzai-Bot'

//检查配置文件
await check()

//创建oicq
const Bot = createClient(BotConfig.account.qq, {
  log_level: BotConfig.account.log_level,
  platform: BotConfig.account.platform,
  resend: false,
  data_dir: process.cwd() + "/data",
})
global.Bot = Bot

//扫码登录 or 密码登录
Bot.on("system.login.qrcode",async function (e) {
  await inquirer.prompt({
    type: 'Input',
    message: '扫码完成后，按回车继续登录',
    name: 'enter'
  })
  this.login()
}).login(BotConfig.account.pwd)

//提交滑动验证码
Bot.on("system.login.slider",async function (e) {
  let txhelper = { url: e.url.replace('ssl.captcha.qq.com','txhelper.glitch.me') }

  const ret = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: '触发滑动验证，请选择验证方式:',
      choices: ['1.手动获取ticket', '2.滑动验证app请求码']
    }
  ])

  let ticket

  if (ret.type == '2.滑动验证app请求码') {
    txhelper.req = await fetch(txhelper.url).catch((err) => this.logger.error(err))
    if (txhelper.req){
      txhelper.req = await txhelper.req.text()
    } else {
      console.log('请求错误，返回手动获取ticket方式')
    }

    console.log(txhelper.req)
    await inquirer.prompt({
      type: 'Input',
      message: '验证完成后，按回车继续登录',
      name: 'enter'
    })

    txhelper.res = await fetch(txhelper.url).catch((err) => this.logger.error(err))
    txhelper.res = await txhelper.res.text()
    if (!txhelper.res){
      console.log('请求错误，返回手动获取ticket方式')
    } else if (txhelper.res == txhelper.req){
      console.log('未完成验证，返回手动获取ticket方式')
    } else {
      ticket = txhelper.res
    }
  }

  if (!ticket) {
    let res = await inquirer.prompt({
      type: 'Input',
      message: '请输入ticket:',
      name: 'ticket',
      validate (value) {
        if (!value) return 'ticket不能为空'
        if (value.toLowerCase() == 'ticket') return '请输入获取的ticket'
        if (value == e.url) return '请勿输入滑动验证链接'
        return true
      }
    })
    ticket = res.ticket
  }

  this.submitSlider(ticket)
})

//设备锁
Bot.on("system.login.device",async function (e) {
  this.sendSmsCode()
  await common.sleep(1000)
  let input = await inquirer.prompt({
    type: 'Input',
    message: '请输入短信验证码:',
    name: 'code',
    validate (value) {
      if (!value) return '验证码不能为空'
      if (/^[0-9]+$/.test(value)) return true
      return '请输入正确数字'
    }
  })
  this.submitSmsCode(input.code)
})

//登录错误
Bot.on("system.login.error", function (e) {
  if (e.code == 1) this.logger.error("请打开config.js，修改输入正确的密码")
  process.exit()
})

//监听上线事件
Bot.on("system.online", async () => {
  await init()
})

//监听群聊消息事件
Bot.on("message.group", (event) => {
  event.isGroup = true
  solve.dealMsg(event).catch((error) => {
    Bot.logger.error(error)
  })
})

//监听私聊消息事件
Bot.on("message.private", (event) => {
  event.isPrivate = true
  solve.dealMsg(event).catch((error) => {
    Bot.logger.error(error)
  })
})

//监听好友事件
Bot.on("request.friend", (event) => {
  solve.dealFriend(event)
})

//监听群通知
Bot.on("notice.group", (event) => {
  event.isGroup = true
  solve.dealGroupNotice(event).catch((error) => {
    Bot.logger.error(error)
  })
})

//监听群事件
Bot.on("request.group", (event) => {
  solve.dealGroupRequest(event)
})