import fs from 'node:fs'
import path from 'node:path'
import Common from '../common.js'

/**
 * 发送私聊消息，仅给好友发送
 * @param user_id qq号
 * @param msg 消息
 */
async function relpyPrivate (userId, msg) {
  return await Common.relpyPrivate(userId, msg)
}

/**
 * 休眠函数
 * @param ms 毫秒
 */
function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 下载保存文件
 * @param fileUrl 下载地址
 * @param savePath 保存路径
 */
async function downFile (fileUrl, savePath, param = {}) {
  console.log('V2暂不支持common.downFile')
}

function mkdirs (dirname) {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirs(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}

/**
 * 制作转发消息
 * @param e oicq消息e
 * @param msg 消息数组
 * @param dec 转发描述
 */
async function makeForwardMsg (e, msg = [], dec = '') {
  console.log('V2暂不支持common.makeForwardMsg')
}

export default { sleep, relpyPrivate, downFile, makeForwardMsg }
