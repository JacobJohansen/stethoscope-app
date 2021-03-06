import { NUDGE, DEFAULT_DARWIN_APP_PATH } from '../../constants'
import kmd from '../../lib/kmd'
import os from 'os'

const MacSecurity = {
  async automaticAppUpdates (root, args, context) {
    const result = await kmd('com.apple.commerce', context)
    return result.updates.autoUpdate !== '0'
  },

  async automaticDownloadUpdates (root, args, context) {
    const result = await kmd('com.apple.SoftwareUpdate', context)
    return result.updates.automaticDownload !== '0'
  },

  async automaticConfigDataInstall (root, args, context) {
    const result = await kmd('com.apple.SoftwareUpdate', context)
    return result.updates.configDataInstall !== '0'
  },

  async automaticSecurityUpdates (root, args, context) {
    const result = await kmd('com.apple.SoftwareUpdate', context)
    return result.updates.criticalUpdateInstall !== '0'
  },

  async automaticOsUpdates (root, args, context) {
    const result = await kmd('com.apple.SoftwareUpdate', context)
    return result.updates.automaticallyInstallMacOSUpdates !== '0'
  },

  async automaticCheckEnabled (root, args, context) {
    const result = await kmd('com.apple.SoftwareUpdate', context)
    return result.updates.automaticCheckEnabled !== '0'
  },

  async applications (root, appsToValidate, context) {
    const requests = appsToValidate.map(({ name, paths = {} }) => {
      const variables = {
        NAME: name,
        PATH: (paths.darwin || DEFAULT_DARWIN_APP_PATH).replace(/^~/, os.homedir())
      }
      return kmd('app', context, variables)
    })
    return Promise.all(requests)
  },

  async automaticUpdates (root, args, context) {
    const checkEnabled = await MacSecurity.automaticCheckEnabled(root, args, context)
    if (!checkEnabled) {
      return false
    }

    const appUpdates = await MacSecurity.automaticAppUpdates(root, args, context)
    const osUpdates = await MacSecurity.automaticOsUpdates(root, args, context)
    const securityUpdates = await MacSecurity.automaticSecurityUpdates(root, args, context)
    const automaticDownloadUpdates = await MacSecurity.automaticDownloadUpdates(root, args, context)
    const automaticConfigDataInstall = await MacSecurity.automaticConfigDataInstall(root, args, context)

    const missingSuggested = [
      appUpdates,
      osUpdates,
      securityUpdates,
      automaticDownloadUpdates,
      automaticConfigDataInstall
    ].some((setting) => setting !== true)

    if (missingSuggested) {
      return NUDGE
    }

    return true
  },

  async remoteLogin (root, args, context) {
    const result = await kmd('remote-login', context)
    return parseInt(result.remoteLogin, 10) > 0
  },

  async diskEncryption (root, args, context) {
    const result = await kmd('file-vault', context)
    return result.fileVaultEnabled === 'true'
  },

  // TODO when branching logic works in kmd
  async screenLock (root, args, context) {
    // const result = await kmd('screen-lock', context)
    return true
  },

  // TODO implement
  async screenIdle (root, args, context) {
    // const result = await kmd('screen-idle', context)
    return true
  },

  async firewall (root, args, context) {
    const result = await kmd('firewall', context)
    return parseInt(result.firewallEnabled, 10) > 0
  },

  async openWifiConnections (root, args, context) {
    const result = await kmd('openWifiConnections', context)
    return result.wifiConnections === 'Closed'
  }

}

export default MacSecurity
