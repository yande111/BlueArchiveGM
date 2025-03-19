<template>
  <div class="page">
    <el-card class="card" shadow="hover">
      <h2>设置学生属性</h2>
      <el-form label-width="120px">
        <el-form-item label="玩家ID">
          <el-input v-model="uid" placeholder="请输入玩家游戏ID"></el-input>
        </el-form-item>
        <el-form-item label="学生ID">
          <el-input v-model="id" placeholder="请输入学生ID"></el-input>
        </el-form-item>
        <el-form-item label="星级">
          <el-input
            v-model.number="starGrade"
            type="number"
            placeholder="请输入星级，默认5"
          ></el-input>
        </el-form-item>
        <el-form-item label="等级">
          <el-input
            v-model.number="level"
            type="number"
            placeholder="请输入等级，默认90"
          ></el-input>
        </el-form-item>
        <el-form-item label="好感">
          <el-input
            v-model.number="favorRank"
            type="number"
            placeholder="请输入好感值，默认100"
          ></el-input>
        </el-form-item>
        <el-form-item label="最大次数">
          <el-input
            v-model.number="max"
            type="number"
            placeholder="请输入最大次数，默认1"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="setCharacter">提交请求</el-button>
        </el-form-item>
      </el-form>
      <el-alert
        v-if="response"
        :title="alertTitle"
        :type="responseType"
        :description="response"
        show-icon
        class="response-alert"
      ></el-alert>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'Character',
  data() {
    return {
      uid: '',
      id: '',
      starGrade: 5,
      level: 90,
      favorRank: 100,
      max: 1,
      response: '', // 保存响应内容
      responseType: 'success', // 响应类型，可为 'success' 或 'error'
    }
  },
  computed: {
    alertTitle() {
      return this.responseType === 'error' ? '错误信息' : '响应内容'
    },
  },
  methods: {
    setCharacter() {
      const baseURL = localStorage.getItem('serverAddress')
      if (!baseURL) {
        this.$message.error('请先在首页保存服务器地址')
        return
      }
      const authKey = localStorage.getItem('authKey')
      const headers = authKey ? { Authorization: authKey } : {}
      const url = `${baseURL}/cdq/api?cmd=character&uid=${this.uid}&id=${this.id}&starGrade=${this.starGrade}&level=${this.level}&favorRank=${this.favorRank}&max=${this.max}`
      axios
        .get(url, { headers })
        .then((res) => {
          // 根据返回的 code 判断响应是成功还是错误
          if (res.data.code === 0) {
            this.responseType = 'success'
            this.$message.success('学生属性设置成功')
          } else {
            this.responseType = 'error'
            this.$message.error('请求失败：' + res.data.msg)
          }
          this.response = JSON.stringify(res.data, null, 2)
        })
        .catch((error) => {
          this.$message.error('请求失败')
          this.responseType = 'error'
          const errorMsg = error.response?.data?.message || error.message
          this.response = '请求错误：' + errorMsg
          console.error(error)
        })
    },
  },
}
</script>

<style scoped>
.page {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.card {
  width: 500px;
  background: rgba(255, 255, 255, 0.86) !important;
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow:
    0 12px 40px -12px rgba(0, 0, 0, 0.12),
    0 4px 24px -4px rgba(0, 0, 0, 0.08),
    inset 0 0 12px rgba(255, 255, 255, 0.4);
  animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  overflow: hidden;
  padding: 20px;
}

/* 标题样式：下划线效果 */
.card h2 {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 8px;
  position: relative;
}

.card h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 2px;
}

/* 表单项间距 */
.el-form-item {
  margin-bottom: 16px;
}

/* 输入框样式 */
.el-input__inner {
  border-radius: 8px !important;
  border: 1px solid #ddd !important;
  transition: border-color 0.3s ease;
}

.el-input__inner:focus {
  border-color: #4facfe !important;
  box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2) !important;
}

/* 提交按钮样式 */
.el-button {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  border: none !important;
  border-radius: 8px !important;
  color: #fff !important;
  font-weight: 600;
  padding: 12px 32px !important;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px -4px rgba(79, 172, 254, 0.4) !important;
}

/* 响应内容样式，统一玻璃质感风格 */
.response-alert {
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.86) !important;
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow:
    0 12px 40px -12px rgba(0, 0, 0, 0.12),
    0 4px 24px -4px rgba(0, 0, 0, 0.08),
    inset 0 0 12px rgba(255, 255, 255, 0.4);
  white-space: pre-wrap;
  font-family: monospace;
  animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
