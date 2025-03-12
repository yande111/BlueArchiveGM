<template>
  <el-card class="home-card" shadow="hover">
    <div class="logo-container">
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
      <h2>BlueArchiveGM 控制台</h2>
      <p class="description">欢迎使用 BlueArchiveGM 控制台，请配置服务器连接信息</p>
    </div>

    <div class="form-container">
      <div class="input-container">
        <el-input
          v-model="serverAddress"
          placeholder="服务器地址（例：http://127.0.0.1:5000）"
          clearable
        >
          <template #prefix>
            <el-icon><Link /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="input-container">
        <el-input v-model="serverAuthKey" placeholder="认证密钥" show-password clearable>
          <template #prefix>
            <el-icon><Key /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="action-group">
        <el-button
          type="primary"
          @click="saveConfig"
          :loading="saving"
          class="save-button"
          :disabled="!isFormValid"
        >
          <el-icon class="icon"><Upload /></el-icon>
          {{ hasSaved ? '更新配置' : '保存配置' }}
        </el-button>

        <el-button
          type="success"
          @click="manualUpdate"
          :loading="updating"
          class="update-button"
          :disabled="!isFormValid || !hasSaved"
        >
          <el-icon class="icon"><Refresh /></el-icon>
          {{ updating ? '更新中...' : '更新服务器状态' }}
        </el-button>
      </div>
    </div>

    <transition name="fade-slide" mode="out-in">
      <div v-if="hasData" key="content">
        <el-card class="server-status-card">
          <h3 class="server-title">服务器状态（{{ autoUpdateStatus }}）</h3>
          <el-skeleton :loading="loading" animated :rows="5">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="用户数量">{{
                serverData.playerNum
              }}</el-descriptions-item>
              <el-descriptions-item label="TPS">{{ serverData.tps }}</el-descriptions-item>
              <el-descriptions-item label="RT">{{ serverData.rt }}</el-descriptions-item>
              <el-descriptions-item label="客户端版本">{{
                serverData.clientVersion
              }}</el-descriptions-item>
              <el-descriptions-item label="服务器版本">{{
                serverData.serverVersion
              }}</el-descriptions-item>
              <el-descriptions-item label="CPU 状态">{{ serverData.cpuOc }}</el-descriptions-item>
              <el-descriptions-item label="内存状态">{{
                serverData.memoryOc
              }}</el-descriptions-item>
            </el-descriptions>
            <div class="update-time">最后更新：{{ lastUpdate || '--:--:--' }}</div>
          </el-skeleton>
        </el-card>
      </div>
      <el-card v-else key="empty" class="server-status-card empty-placeholder">
        <div class="empty-text">暂无服务器状态数据</div>
      </el-card>
    </transition>

    <el-collapse class="documentation">
      <el-collapse-item title="操作指南">
        <ul class="guide-list">
          <li>首次使用需填写地址和密钥后点击「保存配置」</li>
          <li>地址示例：<code>http://127.0.0.1:5000</code></li>
          <li>KEY需联系服务器管理员获取</li>
          <li>状态信息在页面可见时每30秒自动同步</li>
          <li>可随时手动点击更新按钮刷新状态</li>
        </ul>
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>

<script>
import axios from 'axios'
import { Key, Link, Refresh, Upload } from '@element-plus/icons-vue'

export default {
  name: 'Home',
  components: { Key, Link, Refresh, Upload },
  data() {
    return {
      serverAddress: localStorage.getItem('serverAddress') || '',
      serverAuthKey: localStorage.getItem('serverAuthKey') || '',
      hasSaved: !!localStorage.getItem('serverAddress'),
      saving: false,
      updating: false,
      serverData: null,
      autoUpdateTimer: null,
      autoUpdateErrorShown: false,
      lastUpdate: null,
      isPageVisible: true,
      loading: false,
      updateQueue: null,
    }
  },
  computed: {
    isFormValid() {
      const isValid = this.serverAddress && this.serverAuthKey
      return isValid && this.serverAddress.startsWith('http')
    },
    autoUpdateStatus() {
      return this.isPageVisible ? '每30秒自动同步' : '后台暂停更新'
    },
    hasData() {
      return !!this.serverData || this.loading
    },
  },
  methods: {
    async saveConfig() {
      if (!this.serverAddress.startsWith('http')) {
        this.$message.error('地址需包含 http/https 协议头')
        return
      }

      this.saving = true
      try {
        localStorage.setItem('serverAddress', this.serverAddress)
        localStorage.setItem('serverAuthKey', this.serverAuthKey)

        if (!this.hasSaved) {
          this.hasSaved = true
          await this.manualUpdate(true)
          this.startAutoUpdate()
          this.$message.success('配置保存成功')
        } else {
          this.restartAutoUpdate()
          this.$message.success('配置更新成功')
        }
      } catch (error) {
        this.$message.error('操作失败: ' + error.message)
      } finally {
        this.saving = false
      }
    },

    async manualUpdate(silent = false) {
      if (this.updating) return
      this.loading = true
      this.updating = true

      try {
        // 添加平滑过渡延迟
        await new Promise((resolve) => setTimeout(resolve, 300))

        const response = await axios.get(`${this.serverAddress}/cdq/api?cmd=ping`, {
          headers: { Authorization: this.serverAuthKey },
          timeout: 5000,
        })

        if (response.status === 200 && response.data.code === 0) {
          const parsedData = JSON.parse(response.data.msg)
          await this.applyDataUpdate(parsedData)
          if (!silent) this.$message.success('状态更新成功')
          this.autoUpdateErrorShown = false
          return true
        }
      } catch (error) {
        this.handleUpdateError(error, silent)
      } finally {
        this.loading = false
        this.updating = false
      }
      return false
    },

    async applyDataUpdate(parsedData) {
      // 分阶段更新数据
      const tempData = { ...this.serverData }

      // 第一阶段更新核心数据
      tempData.playerNum = parsedData.playerNum || 0
      tempData.tps = parsedData.tps || 0
      this.serverData = { ...tempData }
      await this.$nextTick()

      // 第二阶段更新其他数据
      tempData.rt = parsedData.rt || 0
      tempData.clientVersion = parsedData.clientVersion || '未知'
      tempData.serverVersion = parsedData.serverVersion || '未知'
      this.serverData = { ...tempData }
      await this.$nextTick()

      // 第三阶段更新资源数据
      tempData.cpuOc = parsedData.cpuOc ? parsedData.cpuOc.toFixed(2) + '%' : '未知'
      tempData.memoryOc = parsedData.memoryOc || '未知'
      this.serverData = { ...tempData }

      this.lastUpdate = this.getCurrentTime()
    },

    handleUpdateError(error, silent) {
      let message = '状态更新失败: '
      if (error.response) {
        message += `服务器错误 (${error.response.status})`
      } else if (error.request) {
        message += '无法连接到服务器'
      } else {
        message += error.message
      }
      if (!silent) this.$message.error(message)
    },

    startAutoUpdate() {
      this.clearAutoUpdate()
      if (!this.hasSaved) return

      // 延迟初始化自动更新
      this.updateQueue = setTimeout(() => {
        if (!this.isPageVisible) return

        this.autoUpdateTimer = setInterval(async () => {
          if (document.visibilityState === 'visible') {
            try {
              await this.silentUpdate()
            } catch (error) {
              console.error('Auto update error:', error)
            }
          }
        }, 30000)

        // 立即执行静默更新
        this.silentUpdate()
      }, 500)
    },

    async silentUpdate() {
      try {
        const response = await axios.get(`${this.serverAddress}/cdq/api?cmd=ping`, {
          headers: { Authorization: this.serverAuthKey },
          timeout: 5000,
        })

        if (response.status === 200 && response.data.code === 0) {
          const parsedData = JSON.parse(response.data.msg)
          await this.applyDataUpdate(parsedData)
          this.autoUpdateErrorShown = false
        }
      } catch (error) {
        if (!this.autoUpdateErrorShown) {
          this.$message.warning(`自动同步失败: ${error.message}`)
          this.autoUpdateErrorShown = true
        }
      }
    },

    getCurrentTime() {
      const now = new Date()
      return `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
    },

    restartAutoUpdate() {
      this.clearAutoUpdate()
      this.startAutoUpdate()
    },

    clearAutoUpdate() {
      clearTimeout(this.updateQueue)
      if (this.autoUpdateTimer) {
        clearInterval(this.autoUpdateTimer)
        this.autoUpdateTimer = null
      }
    },

    handleVisibilityChange() {
      this.isPageVisible = document.visibilityState === 'visible'
      if (this.isPageVisible) {
        // 添加返回时的延迟加载
        setTimeout(() => this.startAutoUpdate(), 300)
      } else {
        this.clearAutoUpdate()
      }
    },
  },

  beforeUnmount() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    this.clearAutoUpdate()
  },

  mounted() {
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
    if (this.hasSaved) {
      this.handleVisibilityChange()
    }
  },
}
</script>

<style scoped>
.home-card {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.logo-container {
  text-align: center;
  margin-bottom: 1.5rem;
}

.logo {
  width: 370px;
  height: 90px;
  margin-bottom: 1rem;
  object-fit: contain;
  transition: opacity 0.3s;
}

.input-container {
  margin: 1.2rem 0;
}

.action-group {
  margin-top: 2rem;
  display: flex;
  gap: 12px;
  align-items: center;
}

.save-button,
.update-button {
  min-width: 120px;
  padding: 0 20px;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.update-button {
  flex: 1;
  min-width: 160px;
}

.server-status-card {
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  background: #f8f9fa;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.server-title {
  margin: 0 0 1.2rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
}

.update-time {
  margin-top: 1.5rem;
  text-align: center;
  color: #666;
  font-size: 0.9em;
}

.documentation {
  margin-top: 2rem;
  border-radius: 8px;
}

.guide-list {
  padding-left: 1.8rem;
  color: #4a5568;
  line-height: 1.7;
}

.guide-list li {
  margin-bottom: 0.8rem;
}

.guide-list code {
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.icon {
  margin-right: 8px;
  font-size: 1.1em;
}

.empty-placeholder {
  text-align: center;
  color: #999;
  padding: 2rem;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 480px) {
  .home-card {
    margin: 1rem;
    padding: 1.5rem;
  }

  .action-group {
    flex-direction: column;
  }

  .save-button,
  .update-button {
    width: 100%;
    min-width: unset;
  }
}
</style>
