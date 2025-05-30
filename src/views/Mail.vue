<template>
  <el-card class="function-card" shadow="hover">
    <h2>邮件发送系统</h2>

    <!-- 邮件类型选择 -->
    <el-form :model="form" :rules="rules" ref="mailForm" label-width="120px">
      <el-form-item label="邮件类型">
        <el-radio-group v-model="mailType" @change="handleMailTypeChange">
          <el-radio-button value="simple">用户邮件</el-radio-button>
          <el-radio-button value="game">游戏邮件</el-radio-button>
        </el-radio-group>
        <div class="help-text">
          <span v-if="mailType === 'simple'">适用于发送简单文本邮件给多个用户</span>
          <span v-else>适用于发送带附件的游戏内邮件，支持全局和私人邮件</span>
        </div>
      </el-form-item>

      <!-- 用户邮件模式 -->
      <template v-if="mailType === 'simple'">
        <el-form-item label="邮件标题" prop="header">
          <el-input v-model="form.header" placeholder="请输入邮件标题">
            <template #prefix>
              <el-icon><Document /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="邮件内容" prop="body">
          <el-input
            type="textarea"
            v-model="form.body"
            placeholder="请输入邮件内容"
            :rows="4"
          ></el-input>
        </el-form-item>

        <el-form-item label="接收者列表">
          <div class="attachment-list">
            <div v-for="(user, idx) in form.usernames" :key="idx" class="attachment-card simple-user">
              <el-input
                v-model="form.usernames[idx]"
                placeholder="请输入接收者邮箱或用户名"
                size="small"
              >
                <template #prefix>
                  <el-icon><Message /></el-icon>
                </template>
              </el-input>
              <el-button
                type="danger"
                size="small"
                circle
                class="delete-btn"
                @click="removeUser(idx)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button type="primary" size="small" class="add-btn" @click="addUser">
              <el-icon><Plus /></el-icon> 添加接收者
            </el-button>
          </div>
        </el-form-item>
      </template>

      <!-- 游戏邮件模式 -->
      <template v-else>
        <el-form-item label="邮件选项" prop="player_type">
          <el-radio-group v-model="form.player_type">
            <el-radio :label="0">全局邮件</el-radio>
            <el-radio :label="1">私人邮件</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="form.player_type === 1" label="玩家UID" prop="uid">
          <el-input v-model="form.uid" placeholder="请输入玩家UID">
            <template #prefix>
              <el-icon><Document /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="发件人" prop="sender">
          <el-input v-model="form.sender" placeholder="请输入发件人名称">
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="邮件内容" prop="comment">
          <el-input
            type="textarea"
            v-model="form.comment"
            placeholder="请输入邮件内容"
            :rows="4"
          ></el-input>
        </el-form-item>

        <el-form-item label="发送时间" prop="send_date">
          <div class="time-selector">
            <input
              type="date"
              v-model="sendDateOnly"
              @change="updateSendDateTime"
              class="native-date-input"
            />
            <input
              type="time"
              v-model="sendTimeOnly"
              @change="updateSendDateTime"
              class="native-time-input"
            />
            <div class="quick-buttons">
              <el-button size="small" type="primary" plain @click="setSendTimeNow">现在</el-button>
              <el-button size="small" type="success" plain @click="setSendTimeMorning">明天9点</el-button>
            </div>
          </div>
          <div class="time-preview">{{ formatDisplayTime(form.send_date) }}</div>
        </el-form-item>

        <el-form-item label="过期时间" prop="expire_date">
          <div class="time-selector">
            <input
              type="date"
              v-model="expireDateOnly"
              @change="updateExpireDateTime"
              class="native-date-input"
            />
            <input
              type="time"
              v-model="expireTimeOnly"
              @change="updateExpireDateTime"
              class="native-time-input"
            />
            <div class="quick-buttons">
              <el-button size="small" type="warning" plain @click="setExpireTime7Days">7天后</el-button>
              <el-button size="small" type="danger" plain @click="setExpireTimeNever">永不过期</el-button>
            </div>
          </div>
          <div class="time-preview">{{ formatDisplayTime(form.expire_date) }}</div>
        </el-form-item>

        <el-form-item label="附件列表">
          <div class="attachment-list">
            <div v-for="(item, index) in form.parcel_info_list" :key="index" class="attachment-card">
              <div class="attachment-content">
                <div class="field-group">
                  <div class="field-label">
                    附件类型
                    <el-tooltip content="选择附件类型（0表示无类型附件）" placement="top">
                      <el-icon class="tip-icon"><QuestionFilled /></el-icon>
                    </el-tooltip>
                  </div>
                  <el-select v-model="item.type" placeholder="必填" size="small" class="type-select">
                    <el-option
                      v-for="option in typeOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </div>
                <div class="field-group">
                  <div class="field-label">
                    物品ID
                    <el-tooltip content="输入游戏内物品ID，最多7位数" placement="top">
                      <el-icon class="tip-icon"><QuestionFilled /></el-icon>
                    </el-tooltip>
                  </div>
                  <el-input-number
                    v-model.number="item.id"
                    :min="0"
                    :max="999999"
                    class="id-input"
                    size="small"
                  />
                </div>
                <div class="field-group">
                  <div class="field-label">
                    数量
                    <el-tooltip content="必须大于等于0的整数，最大999" placement="top">
                      <el-icon class="tip-icon"><QuestionFilled /></el-icon>
                    </el-tooltip>
                  </div>
                  <el-input-number
                    v-model.number="item.num"
                    :min="0"
                    :max="999"
                    class="num-input"
                    size="small"
                  />
                </div>
                <el-button
                  type="danger"
                  size="small"
                  circle
                  class="delete-btn"
                  @click="removeAttachment(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <el-button type="primary" size="small" class="add-btn" @click="addAttachment">
              <el-icon><Plus /></el-icon> 添加附件
            </el-button>
          </div>
        </el-form-item>
      </template>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button class="submit-btn" type="primary" @click="handleSubmit" :loading="isSubmitting">
          {{ isSubmitting ? '提交中...' : '发送邮件' }}
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
            <p class="message-text">老师！邮件发送结果：</p>
            <p class="code">{{ response }}</p>
            <p class="message-text">请检查是否发送成功</p>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import axios from 'axios'
import { Delete, Plus, Message, Document, QuestionFilled } from '@element-plus/icons-vue'
import banner from '@/assets/images/bg1.ccb168ef.jpg'

export default {
  name: 'MailSystem',
  components: { Delete, Plus, Message, Document, QuestionFilled },
  data() {
    return {
      mailType: 'simple', // simple 或 game
      form: {
        // 用户邮件字段
        header: '',
        body: '',
        usernames: [''],
        // 游戏邮件字段
        player_type: 0,
        uid: '',
        sender: '系统管理员',
        comment: '',
        send_date: Math.floor(Date.now() / 1000),
        expire_date: Math.floor(Date.now() / 1000) + 604800, // 7天后过期
        parcel_info_list: [],
      },
      typeOptions: [
        { value: 0, label: '无类型附件' },
        { value: 1, label: '货币' },
        { value: 2, label: '道具' },
        { value: 3, label: '角色' },
        { value: 4, label: '装备' },
        { value: 5, label: '经验' },
        { value: 6, label: '材料' },
        { value: 7, label: '消耗品' },
        { value: 8, label: '礼品' },
        { value: 9, label: '其他' }
      ],
      rules: {
        header: [{ required: true, message: '请输入邮件标题', trigger: 'blur' }],
        body: [{ required: true, message: '请输入邮件内容', trigger: 'blur' }],
        sender: [{ required: true, message: '请输入发件人', trigger: 'blur' }],
        comment: [{ required: true, message: '请输入邮件内容', trigger: 'blur' }],
        send_date: [{ type: 'number', required: true, message: '请选择发送时间', trigger: 'change' }],
        expire_date: [{ type: 'number', required: true, message: '请选择过期时间', trigger: 'change' }],
        uid: [
          {
            required: true,
            message: '私人邮件必须填写UID',
            trigger: 'blur'
          }
        ],
      },
      isSubmitting: false,
      response: '',
      banner,
      sendDateOnly: '',
      sendTimeOnly: '',
      expireDateOnly: '',
      expireTimeOnly: '',
    }
  },
  created() {
    // 初始化发送时间为当前时间
    const now = new Date()
    this.sendDateOnly = now.toISOString().split('T')[0]
    this.sendTimeOnly = now.toTimeString().substr(0, 5)
    this.form.send_date = Math.floor(now.getTime() / 1000)

    // 初始化过期时间为7天后
    const expire = new Date()
    expire.setDate(expire.getDate() + 7)
    this.expireDateOnly = expire.toISOString().split('T')[0]
    this.expireTimeOnly = '23:59'
    this.form.expire_date = Math.floor(expire.getTime() / 1000)
  },
  methods: {
    handleMailTypeChange() {
      // 切换邮件类型时重置表单
      this.response = ''
      if (this.mailType === 'simple') {
        this.form.usernames = ['']
      } else {
        this.form.parcel_info_list = []
      }
    },

    // 用户邮件方法
    addUser() {
      this.form.usernames.push('')
    },
    removeUser(idx) {
      if (this.form.usernames.length > 1) {
        this.form.usernames.splice(idx, 1)
      }
    },

    // 游戏邮件方法
    addAttachment() {
      this.form.parcel_info_list.push({ type: 0, id: 0, num: 0 })
    },
    removeAttachment(index) {
      this.form.parcel_info_list.splice(index, 1)
    },

    async handleSubmit() {
      // 根据邮件类型进行不同的验证和提交
      if (this.mailType === 'simple') {
        await this.submitSimpleMail()
      } else {
        await this.submitGameMail()
      }
    },

    async submitSimpleMail() {
      // 简单校验
      if (!this.form.header || !this.form.body) {
        this.$message.error('标题和内容不能为空')
        return
      }
      if (this.form.usernames.some((u) => !u.trim())) {
        this.$message.error('存在空的接收者，请检查')
        return
      }

      this.isSubmitting = true
      try {
        const params = {
          cmd: 'mail',
          header: this.form.header,
          body: this.form.body,
          usernames: this.form.usernames.join(';'),
        }

        const baseURL = localStorage.getItem('serverAddress')
        const authKey = localStorage.getItem('serverAuthKey')
        let config = { params }
        if (authKey) config.headers = { Authorization: authKey }

        const res = await axios.get(`${baseURL}/cdq/api`, config)
        if (res.data.code === 0) {
          this.$message.success('系统邮件发送成功')
        } else {
          this.$message.error('发送失败')
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

    async submitGameMail() {
      this.$refs.mailForm.validate(async (valid) => {
        if (!valid) return

        this.isSubmitting = true
        try {
          const baseURL = localStorage.getItem('serverAddress')
          const authKey = localStorage.getItem('serverAuthKey')

          const params = {
            cmd: 'gameMail',
            player: Boolean(this.form.player_type),
            sender: this.form.sender,
            comment: this.form.comment,
            sendDate: this.form.send_date,
            expireDate: this.form.expire_date,
            parcelInfoList: JSON.stringify(
              this.form.parcel_info_list.map((item) => ({
                type: item.type,
                id: item.id,
                num: item.num,
              })),
            ),
          }

          if (this.form.player_type === 1) params.uid = this.form.uid

          let config = { params }
          if (authKey) config.headers = { Authorization: authKey }

          const res = await axios.get(`${baseURL}/cdq/api`, config)
          res.data.code === 0 ? this.$message.success('游戏邮件发送成功') : this.$message.error('发送失败')
          this.response = res.data.msg
        } catch (err) {
          const msg = err.response?.data?.message || err.message
          this.$message.error(msg)
          this.response = msg
        } finally {
          this.isSubmitting = false
        }
      })
    },

    updateDateTime(dateField, timeField, targetField) {
      if (this[dateField] && this[timeField]) {
        const [hours, minutes] = this[timeField].split(':')
        const date = new Date(this[dateField])
        date.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        this.form[targetField] = Math.floor(date.getTime() / 1000)
      }
    },

    updateSendDateTime() {
      this.updateDateTime('sendDateOnly', 'sendTimeOnly', 'send_date')
    },

    updateExpireDateTime() {
      this.updateDateTime('expireDateOnly', 'expireTimeOnly', 'expire_date')
    },

    setTime(dateField, timeField, targetField, date, time) {
      this[dateField] = date.toISOString().split('T')[0]
      this[timeField] = time
      this.updateDateTime(dateField, timeField, targetField)
    },

    setSendTimeNow() {
      const now = new Date()
      this.setTime('sendDateOnly', 'sendTimeOnly', 'send_date', now, now.toTimeString().substring(0, 5))
    },

    setSendTimeMorning() {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      this.setTime('sendDateOnly', 'sendTimeOnly', 'send_date', tomorrow, '09:00')
    },

    setExpireTime7Days() {
      const date = new Date()
      date.setDate(date.getDate() + 7)
      this.setTime('expireDateOnly', 'expireTimeOnly', 'expire_date', date, '23:59')
    },

    setExpireTimeNever() {
      const date = new Date()
      date.setFullYear(date.getFullYear() + 100)
      this.setTime('expireDateOnly', 'expireTimeOnly', 'expire_date', date, '23:59')
    },

    formatDisplayTime(timestamp) {
      if (!timestamp) return '未设置'
      return new Date(timestamp * 1000).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
  },
}
</script>

<style scoped>
.function-card {
  max-width: 780px;
  margin: 40px auto;
  animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  background: rgba(255, 255, 255, 0.96) !important;
  backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow:
    0 12px 40px -12px rgba(0, 0, 0, 0.12),
    0 4px 24px -4px rgba(0, 0, 0, 0.08),
    inset 0 0 12px rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

.function-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 16px 48px -12px rgba(0, 0, 0, 0.16),
    0 6px 32px -4px rgba(0, 0, 0, 0.12),
    inset 0 0 16px rgba(255, 255, 255, 0.5);
}

:deep(h2) {
  color: #2c3e50 !important;
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

.help-text {
  margin-top: 8px;
  font-size: 13px;
  color: #6b7280;
}

:deep(.el-form-item__label) {
  color: #4a5568 !important;
  font-weight: 500 !important;
}

/* 基础组件样式 - 这些选择器都在Element Plus组件中使用 */
:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  transition: all 0.3s ease;
  border-radius: 8px !important;
}

:deep(.el-input__inner:focus),
:deep(.el-textarea__inner:focus) {
  border-color: #4facfe !important;
  box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2) !important;
}

:deep(.el-radio-button__inner) {
  border-radius: 8px !important;
  border: none !important;
  background: #f3f4f6 !important;
  color: #374151 !important;
  font-weight: 500 !important;
  padding: 8px 20px !important;
  margin-right: 8px !important;
  transition: all 0.3s ease !important;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3) !important;
  transform: translateY(-1px) !important;
}

.submit-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  border: none !important;
  padding: 12px 32px !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px -4px rgba(79, 172, 254, 0.4) !important;
}

/* 附件列表样式 */
.attachment-list {
  width: 100%;
}

.attachment-card {
  margin-bottom: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: transform 0.2s ease;
}

.attachment-card:hover {
  transform: translateX(2px);
}

.simple-user {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
}

.attachment-content {
  display: grid;
  grid-template-columns: 160px 1fr 1fr 40px;
  gap: 12px;
  align-items: center;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.add-btn {
  width: 100%;
  margin-top: 12px;
  background: rgba(59, 130, 246, 0.05);
  border: 1px dashed #3b82f6;
  color: #3b82f6;
}

/* 响应卡片样式 */
.respond-card {
  margin-top: 24px;
}

.respond-card-container {
  width: 500px;
  margin: 0 auto;
  border: 1px solid #ee9ea8;
  border-radius: 5px;
  background: #fff;
  box-shadow: 0 0 20px #ccc;
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
  margin: 20px auto;
}

.message-text {
  font-size: 16px;
  color: #333;
  margin: 10px 0;
}

.code {
  font-size: 18px;
  font-weight: bold;
  color: #ee9ea8;
  background: white;
  padding: 10px 20px;
  border-radius: 5px;
  display: inline-block;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .function-card {
    margin: 20px;
  }

  .attachment-content {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}

/* 时间选择器样式 */
.time-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.time-preview {
  font-size: 14px;
  font-weight: 500;
  color: #4facfe;
  padding: 8px 12px;
  background: rgba(79, 172, 254, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(79, 172, 254, 0.2);
  text-align: center;
  width: 100%;
}

.quick-buttons {
  display: flex;
  gap: 6px;
}

.quick-buttons .el-button {
  font-size: 11px !important;
  padding: 4px 12px !important;
  border-radius: 16px !important;
  transition: all 0.2s ease !important;
}

.quick-buttons .el-button:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1) !important;
}

.native-date-input,
.native-time-input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
  min-width: 140px;
}

.native-date-input:focus,
.native-time-input:focus {
  border-color: #4facfe;
  box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2);
}
</style>