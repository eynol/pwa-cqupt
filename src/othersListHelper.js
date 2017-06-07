export default {
  _prfix: 'othersList',
  getUsersList: function () {
    var res = localStorage.getItem(this._prfix)
    if (res) {
      return JSON.parse(res)
    }
    return []
  },
  saveUsersList: function (list) {
    if (typeof list === 'object') {
      localStorage.setItem(this._prfix, JSON.stringify(list))
    } else if (typeof list === 'string') {
      localStorage.setItem(this._prfix, list)
    }
  }
}
