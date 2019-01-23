import { Cookies } from 'quasar'
import API from 'src/plugins/api'

export const me = async (context) => {
  const payload = await API.call({
    context,
    method: 'get',
    url: '/me'
  })
  if (payload) {
    context.commit('setUser', payload)
  }
}

export const logout = async (context) => {
  const token = Cookies.get('refresh_token')
  if (token) {
    await API.call({
      context,
      method: 'post',
      url: '/oauth/revoke',
      data: { token }
    })
  }
  let domain = window.location.hostname
  domain = domain.substring(domain.lastIndexOf('.', domain.lastIndexOf('.') - 1) + 1)
  Cookies.remove('access_token', { path: '/', domain })
  Cookies.remove('refresh_token', { path: '/', domain })
  context.commit('clear')
  localStorage.removeItem('blockchainAccounts')
}

export const startSteemConnectLogin = () => {
  let callbackURL = ''
  if (typeof window !== 'undefined') {
    callbackURL = `${window.location.protocol}//${window.location.host}`
  }
  window.location = `https://steemconnect.com/oauth2/authorize?client_id=${process.env.STEEMCONNECT_CLIENT_ID}&redirect_uri=${callbackURL}&response_type=code&scope=offline,comment,vote,comment_options,custom_json&state=steemconnectlogin`
}

export const updateAvatarUrl = (context, avatarUrl) => {
  context.commit('updateAvatarUrl', avatarUrl)
}
