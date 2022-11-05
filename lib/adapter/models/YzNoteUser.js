/**
 * Bot实际User用户类
 * 主键QQ
 *
 *  User可以注册UID，通过 getRegUid / setRegUid
 *  一个User可以绑定多个MysUser CK，绑定MysUser
 */
import BaseModel from './BaseModel.js'
import fs from 'node:fs';
import User from '../../components/models/User.js'
const noV2 = function (name) {
  console.log(`e.runtime error: V2暂不支持${name}...`)
}
export default class NoteUser extends BaseModel {
  constructor (qq, data = null) {
    super()
    // 检查实例缓存
    let cacheObj = this._getThis('user', qq)
    if (cacheObj) {
      return cacheObj
    }
    this.qq = qq
    this._user = new User(qq)
    // 缓存实例
    return this._cacheThis()
  }

  // 初始化 user
  /**
   * 创建NoteUser实例
   * @param qq NoterUser对应id（qq）
   * * 若传入e对象则会识别e.user_id，并将user对象添加至e.user
   * @param data 用户对应MysCookie数据，为空则自动读取
   * @returns {Promise<NoteUser|*>}
   */
  static async create (qq, data = null) {
    // 兼容处理传入e
    if (qq && qq.user_id) {
      let e = qq
      let user = await NoteUser.create(e.user_id)
      e.user = user
      return user
    }
    let user = new NoteUser(qq, data)
    // 检查绑定uid (regUid)
    await user.getRegUid()
    // 传入data则使用，否则读取
    return user
  }

  static async forEach (fn) {
    noV2('NoteUser.forEach')
  }

  /**
   * 获取当前用户uid
   * 如果为绑定用户，优先获取ck对应uid，否则获取绑定uid
   */
  get uid () {
    return this._user?.uid || ''
  }

  /**
   * 当前用户是否具备CK
   */
  get hasCk () {
    return this._user?.isCookieUser || false
  }

  /**
   * 获取绑定CK的UID列表，如未绑定CK则返回空数组
   */
  get ckUids () {
    noV2('NoteUser.ckUids')
  }

  /**
   * 获取当前生效CK
   *
   * 返回isMain的uid，没有的话返回首位
   */
  get mainCk () {
    noV2('NoteUser.mainCk')
  }

  /**
   * 获取当前用户的所有ck
   * @returns { {ltuid:{ckData, ck, uids}} }
   */
  get cks () {
    noV2('NoteUser.cks')
  }

  /**
   * 获取当前用户的绑定UID
   * 主要供内部调用，建议使用 user.uid 获取用户uid
   * @returns {Promise<*>}
   */
  async getRegUid () {
    if (this._user) {
      let mysUser = await this._user.getMysUser()
      if (mysUser) {
        this._regUid = mysUser.uid
      }
    }
    return this._regUid
  }

  /**
   * 设置当前用户的绑定uid
   * @param uid 要绑定的uid
   * @param force 若已存在绑定uid关系是否强制更新
   */
  async setRegUid (uid = '', force = false) {
    if (this._user) {
      await this._user.regMysUser({ uid }, force)
    }
    return ''
  }

  /**
   * 切换绑定CK生效的UID
   * @param uid 要切换的UID
   */
  async setMainUid (uid = '') {
    noV2('NoteUser.setMainUid')
  }

  /**
   * 初始化或重置 当前用户缓存
   */
  async initCache () {
    // 刷新绑定CK的缓存
    if (this._user) {
      await this._user.refreshCache()
    }
  }

  /**
   * 为当前用户增加CK
   * @param cks 绑定的ck
   */
  async addCk (cks) {
    noV2('NoteUser.addCk')
  }

  /**
   * 删除当前用户绑定CK
   * @param ltuid 根据ltuid删除，未传入则删除当前生效uid对应ltuid
   * @param needRefreshCache 是否需要刷新cache，默认刷新
   */
  async delCk (ltuid = '', needRefreshCache = true) {
    noV2('NoteUser.delCk')
  }

  /**
   * 检查当前用户绑定的CK状态
   */
  async checkCk () {
    noV2('NoteUser.checkCk')
  }

  /**
   * 内部方法：读取CK数据
   * 【V2重写】
   * @private
   */
  _getCkData () {
    let ckData = {}
    for (let id in NoteCookie) {
      let ck = NoteCookie[id] || {}
      if (ck.qq === this.qq) {
        let v3Ck = getV3Ck(ck)
        if (v3Ck) {
          ckData[uid] = v3Ck
        }
      }
    }
    this.ckData = ckData
    return this.ckData
  }

  /**
   * 内部方法：写入CK数据
   * 【V2重写】
   * @private
   */
  _saveCkData () {
    noV2('NoteUser._saveCkData')
    return false
    let tmp = {}
    for (let uid in this.ckData) {
      let ckd = this.ckData[uid] || {}
      let { id, ck, qq, uid, ltuid } = ckd
      if (uid && qq && id) {
        let nc = NoteCookie[id] || {
          isPush: false,
          isSignPush: false
        }
        nc.uid = uid
        nc.qq = qq
        nc.cookie = ck
        nc.ltuid = ltuid
        tmp[id] = nc
      }
    }
    for (let id in NoteCookie) {
      if (NoteCookie[id] && NoteCookie[id].qq === this.qq) {
        delete NoteCookie[id]
      }
    }
    for (let id in tmp) {
      NoteCookie[id] = tmp[id]
    }
    let path = "data/NoteCookie/NoteCookie.json";
    fs.writeFileSync(path, JSON.stringify(NoteCookie, "", "\t"));
  }
}

const getLtuid = function (ck) {
  let ret = /ltuid=(\d+)/.exec(ck)
  if (ret && ret[1]) {
    return ret[1]
  }
  return ''
}
const getV3Ck = function (ck) {
  if (ck.cookie && ck.uid) {
    let { uid, qq, cookie } = ck
    let ltuid = getLtuid(cookie)
    if (ltuid) {
      return {
        uid,
        qq,
        ck: cookie,
        ltuid,
        login_ticket: '',
        device_id: '',
        isMain: true,
        id: uid
      }
    }
  }
  return false
}
NoteUser.getV3Ck = getV3Ck
