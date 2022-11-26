/**
 * MysUser 米游社用户类
 * 主键ltuid
 *
 * 一个MysUser对应一个有效CK
 * 一个MysUser可能有多个MysUid关联记录
 */
import BaseModel from './BaseModel.js'
import lodash from 'lodash'

const noV2 = function (name) {
  console.log(`e.runtime error: V2暂不支持${name}...`)
}
export default class MysUser extends BaseModel {
  constructor (data) {
    super()
    let ltuid = data.ltuid
    if (!ltuid) {
      return false
    }
    // 检查实例缓存
    let self = this._getThis('mys', ltuid)
    if (!self) {
      self = this
    }
    self.uids = self.uids || []
    self.ltuid = data.ltuid
    self.ck = self.ck || data.ck
    self.qq = self.qq || data.qq || 'pub'
    if (data.ck) {
      self.ckData = data
    }
    return self._cacheThis()
  }

  // 可传入ltuid、cookie、ck对象来创建MysUser实例
  // 在仅传入ltuid时，必须是之前传入过的才能被识别
  static async create (data) {
    if (!data) {
      return false
    }
    if (lodash.isPlainObject(data)) {
      return new MysUser(data)
    }
    // 传入cookiue
    let testRet = /ltuid=(\w{0,9})/g.exec(data)

    if (testRet && testRet[1]) {
      let ltuid = testRet[1]
      let uids = await MysUser.getCkUid(data)
      if (uids) {
        return new MysUser({
          ltuid,
          ck: data,
          type: 'ck',
          uids
        })
      }
    }
    // 传入ltuid
    if (/\d{4,9}/.test(data)) {
      // 查找ck记录
      noV2('MysUser.create，使用ltuid')
    }
    return false
  }

  // 根据uid获取查询MysUser
  static async getByQueryUid (uid, onlySelfCk = false) {
    noV2('MysUser.getByQueryUid')
  }

  // 为当前MysUser绑定uid
  addUid (uid) {
    noV2('MysUser.addUid')
  }

  // 初始化当前MysUser缓存记录
  async initCache (user) {
    noV2('MysUser.initCache')
  }

  static async eachServ (fn) {
    noV2('MysUser.eachServ')
  }

  // 清除当日缓存
  static async clearCache () {
    noV2('MysUser.clearCache')
  }

  async disable () {
    noV2('MysUser.disable')
  }

  //
  //
  /**
   * 删除缓存, 供User解绑CK时调用
   * @param user
   * @returns {Promise<boolean>}
   */
  async del (user) {
    noV2('MysUser.del')
  }

  // 删除MysUser用户记录，会反向删除User中的记录及绑定关系
  async delWithUser () {
    noV2('MysUser.delWithUser')
  }

  // 为当前用户添加uid查询记录
  async addQueryUid (uid) {
    noV2('MysUser.addQueryUid')
  }

  // 获取当前用户已查询uid列表
  async getQueryUids () {
    noV2('MysUser.getQueryUids')
  }

  // 根据uid获取查询ltuid
  async getQueryLtuid (uid) {
    noV2('MysUser.getQueryLtuid')
  }

  // 检查指定uid是否为当前MysUser所有
  async ownUid (uid) {
    noV2('MysUser.ownUid')
    return false
  }

  // 获取用户统计数据
  static async getStatData () {
    noV2('MysUser.getStatData')
  }

  /**
   * 删除失效用户
   * @returns {Promise<number>} 删除用户的个数
   */
  static async delDisable () {
    noV2('MysUser.delDisable')
  }

  static async getGameRole (ck, serv = 'mys') {
    noV2('MysUser.getGameRole')
  }

  /**
   * 获取ck对应uid列表
   * @param ck 需要获取的ck
   * @param withMsg false:uids / true: {uids, msg}
   * @param force 忽略缓存，强制更新
   * @returns {Promise<{msg: *, uids}>}
   */
  static async getCkUid (ck, withMsg = false, force = false) {
    noV2('MysUser.getCkUid')
  }

  /**
   * 检查CK状态
   * @param ck 需要检查的CK
   * @returns {Promise<boolean|{msg: string, uids: *[], status: number}>}
   */
  static async checkCkStatus (ck) {
    noV2('MysUser.checkCkStatus')
  }
}
