import MysApi from './YzMysApi.js'
import lodash from 'lodash'
import NoteUser from './YzNoteUser.js'
import YzMysUser from './YzMysUser.js'
import Msg from '../../../components/Msg.js'
const noV2 = function (name) {
  console.log(`e.runtime error: V2暂不支持${name}...`)
}
export default class MysInfo {

  constructor (e) {
    if (e) {
      this.e = e
      this.userId = String(e.user_id)
    }
    /** 当前查询原神uid */
    this.uid = ''
    /** 当前ck信息 */
    this.ckInfo = {
      ck: '',
      uid: '',
      qq: '',
      ltuid: '',
      type: ''
    }
    // ck对应MysUser对象
    this.ckUser = null
    this._mysApi = null
    this.auth = ['dailyNote', 'bbs_sign_info', 'bbs_sign_home', 'bbs_sign', 'ys_ledger', 'compute', 'avatarSkill', 'detail']
  }

  static async init (e, api) {
    await MysInfo.initCache()

    let mysInfo = new MysInfo(e)

    let onlySelfCk = false


    if (mysInfo.checkAuth(api)) {
      /** 获取ck绑定uid */
      // 标记需要自身ck
      onlySelfCk = true
    }

    let mysApi = await e.getMysApi({
      auth: onlySelfCk ? 'cookie' : 'all',
      targetType: 'all',
      cookieType: onlySelfCk ? 'self' : 'all'
    })

    if (!mysApi || !mysApi.targetUser?.uid) {
      e.noTips = true
      return false
    }
    mysInfo.uid = mysApi.targetUser?.uid
    mysInfo.isSelf = onlySelfCk

    if (!['1', '2', '5', '6', '7', '8', '9'].includes(String(mysInfo.uid)[0])) {
      // e.reply('只支持查询国服uid')
      return false
    }
    mysInfo._mysApi = mysApi
    mysInfo._targetUser = mysApi.targetUser

    mysInfo.e.uid = mysApi.targetUser?.uid

    /** 获取ck */
    await mysInfo.getCookie()

    return mysInfo
  }

  static async getNoteUser (e) {
    await MysInfo.initCache()
    let user = await NoteUser.create(e)
    if (user) {
      return user
    }
    return false
  }

  /**
   * 获取UID
   * @param e
   * @returns {Promise<string|boolean|*|string>}
   */
  static async getUid (e) {
    let targetUser = Msg.getTargetMysUser(e)
    if (targetUser) {
      return targetUser.uid
    }
    return false
  }

  /**
   * 获取ck绑定uid
   * @param e
   * @returns {Promise<boolean|*>}
   */
  static async getSelfUid (e) {
    let { msg = '', at = '' } = e
    if (!msg) return false

    let user = await NoteUser.create(e)
    let selfUser = at ? await NoteUser.create(at) : user

    if (!selfUser.hasCk) {
      if (e.noTips !== true) e.reply('尚未绑定cookie', false, { at: selfUser.qq })
      return false
    }

    return selfUser.uid
  }

  /** 判断绑定ck才能查询 */
  checkAuth (api) {
    if (api === 'cookie') {
      return true
    }
    if (lodash.isObject(api)) {
      for (let i in api) {
        if (this.auth.includes(i)) {
          return true
        }
      }
    } else if (this.auth.includes(api)) {
      return true
    }
    return false
  }

  /**
   * @param e
   * @param e.apiSync 多个请求时是否同步请求
   * @param e.noTips  是否回复提示，用于第一次调用才提示，后续不再提示
   * @param api
   * * `index` 米游社原神首页宝箱等数据
   * * `spiralAbyss` 原神深渊
   * * `character` 原神角色详情
   * * `dailyNote` 原神树脂
   * * `bbs_sign` 米游社原神签到
   * * `detail` 详情
   * * `ys_ledger` 札记
   * * `compute` 养成计算器
   * * `avatarSkill` 角色技能
   * @param data 查询数据data
   * @param option 配置
   * @param option.log 是否显示请求日志
   */
  static async get (e, api, data = {}, option = {}) {
    let mysInfo = await MysInfo.init(e, api)

    if (!mysInfo.uid || !mysInfo.ckInfo.ck) return false
    e.uid = mysInfo.uid

    let mysApi = new MysApi(mysInfo.uid, mysInfo.ckInfo.ck, option)

    let res
    if (lodash.isObject(api)) {
      let all = []
      /** 同步请求 */
      if (e.apiSync) {
        res = []
        for (let i in api) {
          res.push(await mysApi.getData(i, api[i]))
        }
      } else {
        lodash.forEach(api, (v, i) => {
          all.push(mysApi.getData(i, v))
        })
        res = await Promise.all(all)
      }

      for (let i in res) {
        res[i] = await mysInfo.checkCode(res[i], res[i].api)

        if (res[i]?.retcode === 0) continue

        break
      }
    } else {
      res = await mysApi.getData(api, data)
      res = await mysInfo.checkCode(res, api)
    }

    return res
  }

  async checkReply () {
  }

  /* 获取请求所需ck */
  /**
   * 获取请求所需CK
   * @param onlySelfCk 是否只获取uid自己对应的ck。为true则只获取uid对应ck，若无则返回为空
   * @returns {Promise<string|string|*>} 查询ck，获取失败则返回空
   */
  async getCookie (onlySelfCk = false) {
    let mysApi = this._mysApi
    let { cookieUser } = mysApi
    if (cookieUser) {
      this.ckInfo = NoteUser.getV3Ck(cookieUser)
      this.ckUser = YzMysUser.create(this.ckInfo)
    }
    return this.ckInfo.ck
  }

  /**
   * 初始化公共CK
   * @returns {Promise<void>}
   */
  static async initPubCk () {
    noV2('MysInfo.initPubCk')
  }

  /**
   * 初始化用户CK
   * 默认会将用户CK加入查询池
   * @returns {Promise<void>}
   */
  static async initUserCk () {
    noV2('MysInfo.initPubCk')
  }

  /**
   * 初始化缓存
   * @param force 若已经初始化是否强制初始化
   * @param clearData 强制初始化时是否清除已有数据 (刷新/重置)
   * @returns {Promise<boolean>}
   */
  static async initCache (force = false, clearData = false) {

  }

  async checkCode (res, type) {
    noV2('MysInfo.checkCode')
  }

  /** 删除失效ck */
  async delCk () {
    noV2('MysInfo.delCk')
  }

  /** 查询次数满，今日内标记失效 */
  async disableToday () {
    /** 统计次数设为超限 */
    noV2('MysInfo.disableToday')
  }

  static async getBingCkUid () {
    noV2('MysInfo.getBingCkUid')
  }

  // 获取uid绑定的ck信息
  static async checkUidBing (uid) {
    noV2('MysInfo.checkUidBing')
  }

  static async delDisable () {
    noV2('MysInfo.delDisable')
  }
}
