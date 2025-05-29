<template>
  <el-card class="function-card" shadow="hover">
    <h2>操作邮箱验证码</h2>
    <el-form :model="form" label-width="120px">
      <!-- 目标邮箱 -->
      <el-form-item label="目标邮箱">
        <el-input v-model="form.account" placeholder="请输入目标邮箱" />
      </el-form-item>

      <!-- 操作类型 -->
      <el-form-item label="操作类型">
        <el-select v-model="form.opType" placeholder="请选择操作类型">
          <el-option label="设置" value="set" />
          <el-option label="获取" value="get" />
          <el-option label="删除" value="del" />
        </el-select>
      </el-form-item>

      <!-- 验证码 (仅设置时) -->
      <el-form-item v-if="form.opType === 'set'" label="验证码">
        <el-input-number
          v-model="form.code"
          :min="0"
          controls-position="right"
          placeholder="请输入验证码"
        />
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button class="submit-btn" type="primary" @click="handleSubmit" :loading="isSubmitting">
          {{ isSubmitting ? '提交中...' : '执行操作' }}
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 响应卡片 -->
    <div v-if="response" class="respond-card">
      <div class="respond-card-container">
        <div class="header">
          <img class="header-image" :src="banner" alt="操作结果" />
        </div>
        <div class="body">
          <div class="message-box">
            <p class="message-text">操作结果：</p>
            <p class="code">{{ response }}</p>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import axios from 'axios'
import banner from '@/assets/images/bg1.ccb168ef.jpg'

export default {
  name: 'EmailCodeManager',
  data() {
    return {
      form: {
        account: '',
        opType: '',
        code: null,
      },
      isSubmitting: false,
      response: '',
      banner,
    }
  },
  methods: {
    async handleSubmit() {
      // 校验必填
      if (!this.form.account || !this.form.opType) {
        this.$message.error('邮箱和操作类型为必填项')
        return
      }
      // 校验 code
      if (this.form.opType === 'set' && (this.form.code === null || this.form.code < 0)) {
        this.$message.error('请填写有效的验证码')
        return
      }

      this.isSubmitting = true
      try {
        const params = {
          cmd: 'emailCode',
          account: this.form.account,
          type: this.form.opType,
        }
        if (this.form.opType === 'set') params.code = this.form.code

        const baseURL = localStorage.getItem('serverAddress')
        const authKey = localStorage.getItem('serverAuthKey')
        const config = { params }
        if (authKey) config.headers = { Authorization: authKey }

        const res = await axios.get(`${baseURL}/cdq/api`, config)
        if (res.data.code === 0) {
          this.$message.success('操作成功')
        } else {
          this.$message.error('操作失败')
        }
        this.response = res.data.msg
      } catch (err) {
        const msg = err.response?.data?.message || err.message
        this.$message.error(msg)
        this.response = msg
      } finally {
        this.isSubmitting = false
      }
    },
  },
}
</script>

<style scoped>
/* 功能卡片通用样式 */
.function-card {
  max-width: 780px;
  margin: 40px auto;
  background: rgba(255, 255, 255, 0.96) !important;
  backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow:
    0 12px 40px -12px rgba(0, 0, 0, 0.12),
    0 4px 24px -4px rgba(0, 0, 0, 0.08),
    inset 0 0 12px rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}
.function-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 16px 48px -12px rgba(0, 0, 0, 0.16),
    0 6px 32px -4px rgba(0, 0, 0, 0.12),
    inset 0 0 16px rgba(255, 255, 255, 0.5);
}
:deep(h2) {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 24px;
  padding-bottom: 12px;
  position: relative;
}
:deep(h2::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 48px;
  height: 3px;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 2px;
}
.el-form-item__label {
  color: #4a5568;
  font-weight: 500;
  letter-spacing: 0.5px;
}
.el-input__inner,
.el-input-number__input {
  border-radius: 8px;
  transition: all 0.3s ease;
}
.el-input__inner:focus,
.el-input-number__input:focus {
  border-color: #4facfe;
  box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2);
}
.submit-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  border: none;
  padding: 12px 32px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px -4px rgba(79, 172, 254, 0.4);
}
/* 响应卡片样式 */
.respond-card {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
.respond-card-container {
  width: 100%;
  max-width: 500px;
  border: 1px solid #ee9ea8;
  box-shadow: 0 0 20px #ccc;
  border-radius: 5px;
  background: #fff;
}
.header-image {
  width: 100%;
  border-radius: 5px 5px 0 0;
}
.body {
  padding: 30px 20px;
}
.message-box {
  text-align: center;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 0 auto;
}
.message-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
}
.code {
  font-size: 18px;
  font-weight: bold;
  color: #ee9ea8;
  background: #fff;
  padding: 10px 20px;
  border-radius: 5px;
  display: inline-block;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
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
@media (max-width: 768px) {
  .function-card {
    margin: 20px;
    border-radius: 12px;
  }
  :deep(h2) {
    font-size: 1.5rem;
  }
}
</style>
