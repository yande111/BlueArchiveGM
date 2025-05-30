<template>
  <div class="function-card">
    <el-card shadow="hover">
      <h2>设置学生属性</h2>
      <el-form label-width="120px">
        <el-form-item label="老师UID">
          <el-input v-model="uid" placeholder="请输入老师的游戏UID"></el-input>
        </el-form-item>
        <el-form-item label="学生ID">
          <div class="student-id-input-group">
            <el-input v-model="id" placeholder="请输入学生ID" required></el-input>
            <el-button
              type="primary"
              @click="showStudentSelector = true"
              style="margin-left: 8px;"
              class="select-student-btn"
            >
              <el-icon><List /></el-icon>
              选择学生
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="一键满配">
          <el-switch
            v-model="max"
            active-text="开启"
            inactive-text="关闭"
            :active-value="1"
            :inactive-value="0"
          ></el-switch>
        </el-form-item>

        <!-- 当非一键满配时，显示各属性开关及对应输入框 -->
        <template v-if="max === 0">
          <el-form-item label="星级开关">
            <el-switch v-model="enableStar" active-text="启用" inactive-text="禁用"></el-switch>
          </el-form-item>
          <el-form-item label="星级" v-if="enableStar">
            <el-input
              v-model.number="starGrade"
              type="number"
              placeholder="请输入星级"
            ></el-input>
          </el-form-item>

          <el-form-item label="等级开关">
            <el-switch v-model="enableLevel" active-text="启用" inactive-text="禁用"></el-switch>
          </el-form-item>
          <el-form-item label="等级" v-if="enableLevel">
            <el-input v-model.number="level" type="number" placeholder="请输入等级"></el-input>
          </el-form-item>

          <el-form-item label="好感开关">
            <el-switch v-model="enableFavor" active-text="启用" inactive-text="禁用"></el-switch>
          </el-form-item>
          <el-form-item label="好感" v-if="enableFavor">
            <el-input
              v-model.number="favorRank"
              type="number"
              placeholder="请输入好感值"
            ></el-input>
          </el-form-item>
        </template>

        <el-form-item>
          <el-button
            type="primary"
            @click="setCharacter"
            :loading="isSubmitting"
            class="submit-btn"
          >
            {{ isSubmitting ? '提交中...' : '提交请求' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div v-if="response" class="respond-card">
        <div class="respond-card-container">
          <div class="header">
            <img class="header-image" :src="banner1" alt="操作结果" />
          </div>
          <div class="body">
            <div class="message-box">
              <p class="message-text">老师！这是您的操作结果：</p>
              <p class="code">{{ response }}</p>
              <p class="message-text">请检查是否生效</p>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>

  <!-- 学生选择器弹窗 -->
  <el-dialog
    v-model="showStudentSelector"
    title="选择学生"
    width="90%"
    :close-on-click-modal="false"
    class="student-selector-dialog"
    :style="{ maxWidth: '700px' }"
  >
    <div class="student-selector">
      <!-- 搜索框 -->
      <el-input
        v-model="studentSearchQuery"
        placeholder="搜索学生姓名或ID"
        class="student-search"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <!-- 学生列表 -->
      <div v-if="isLoadingStudents" class="loading-students">
        <el-icon class="is-loading"><Loading /></el-icon>
        <p>正在加载学生数据...</p>
      </div>

      <div v-else class="student-list">
        <div
          v-for="student in filteredStudents"
          :key="student.Id"
          class="student-item"
          @click="selectStudent(student)"
        >
          <div class="student-avatar">
            <img
              v-if="student.Icon"
              :src="student.Icon"
              :alt="student.Name"
              @error="handleStudentImageError"
            />
            <el-icon v-else><Avatar /></el-icon>
          </div>
          <div class="student-info">
            <div class="student-name">{{ student.Name || student.PersonalName || '未知学生' }}</div>
            <div class="student-details">
              <span class="student-id">ID: {{ student.Id }}</span>
              <span v-if="student.School" class="student-school">{{ student.School }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="!isLoadingStudents && filteredStudents.length === 0"
        description="没有找到匹配的学生"
        :image-size="80"
      />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showStudentSelector = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import axios from 'axios'
import banner1 from '@/assets/images/bg1.ccb168ef.jpg'
import { List, Search, Loading, Avatar } from '@element-plus/icons-vue'

export default {
  name: 'Character',
  components: { List, Search, Loading, Avatar },
  data() {
    return {
      uid: '',
      id: '',
      starGrade: null,
      level: null,
      favorRank: null,
      // 新增开关状态
      enableStar: false,
      enableLevel: false,
      enableFavor: false,
      max: 0,
      response: '',
      isSubmitting: false,
      banner1: banner1,
      // 学生选择器相关
      showStudentSelector: false,
      studentSearchQuery: '',
      isLoadingStudents: false,
      studentsData: [],
    }
  },
  computed: {
    filteredStudents() {
      if (!this.studentsData.length) return []

      if (!this.studentSearchQuery.trim()) {
        return this.studentsData
      }

      const query = this.studentSearchQuery.toLowerCase()
      return this.studentsData.filter(student => {
        const name = (student.Name || student.PersonalName || '').toLowerCase()
        const id = String(student.Id || '')
        return name.includes(query) || id.includes(query)
      })
    }
  },
  methods: {
    async setCharacter() {
      const baseURL = localStorage.getItem('serverAddress')
      if (!baseURL) {
        this.$message.error('请先在首页保存服务器地址')
        return
      }
      const authKey = localStorage.getItem('serverAuthKey')
      const headers = authKey ? { Authorization: authKey } : {}

      this.isSubmitting = true
      try {
        // 严格参数顺序构建
        const params = [
          `cmd=character`,
          `uid=${encodeURIComponent(this.uid)}`,
          `id=${encodeURIComponent(this.id)}`,
        ]

        if (this.max === 0) {
          const dynamicParams = [
            this.enableStar && this.starGrade !== null
              ? `starGrade=${encodeURIComponent(this.starGrade)}`
              : '',
            this.enableLevel && this.level !== null
              ? `level=${encodeURIComponent(this.level)}`
              : '',
            this.enableFavor && this.favorRank !== null
              ? `favorRank=${encodeURIComponent(this.favorRank)}`
              : '',
          ].filter(Boolean)
          params.push(...dynamicParams)
        }

        params.push(`max=${encodeURIComponent(this.max)}`)

        const url = `${baseURL}/cdq/api?${params.join('&')}`

        const res = await axios.get(url, { headers })
        if (res.data.code === 0) {
          this.response = JSON.stringify(res.data, null, 2)
          this.$message.success('操作成功')
        } else {
          this.response = res.data.msg
          this.$message.error('操作失败')
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message
        this.response = `请求错误：${errorMsg}`
        this.$message.error(this.response)
        console.error(error)
      } finally {
        this.isSubmitting = false
      }
    },

    async fetchStudents() {
      this.isLoadingStudents = true
      try {
        // 导入学生数据
        const studentsData = await import('@/assets/json/id/students.json')

        // 动态加载图标
        let icons = {}
        try {
          icons = import.meta.glob('@/assets/icon/*.png', { eager: true })
        } catch (error) {
          console.warn('Failed to load icons:', error)
        }

        // 处理学生数据
        this.studentsData = studentsData.default.map(student => {
          const iconPath = `/src/assets/icon/${student.Id}.png`
          return {
            ...student,
            Icon: icons[iconPath]?.default || ''
          }
        })

      } catch (error) {
        this.studentsData = []
        this.$message.error('获取学生列表失败')
        console.error('获取学生数据失败:', error)
      } finally {
        this.isLoadingStudents = false
      }
    },

    selectStudent(student) {
      this.id = student.Id
      this.showStudentSelector = false
      this.$message.success(`已选择学生：${student.Name || student.PersonalName || '未知学生'} (ID: ${student.Id})`)
    },

    handleStudentImageError(event) {
      event.target.style.display = 'none'
      // 显示默认图标
      const iconElement = event.target.parentElement.querySelector('.el-icon')
      if (iconElement) {
        iconElement.style.display = 'block'
      }
    },
  },
  watch: {
    showStudentSelector(val) {
      if (val && !this.studentsData.length) {
        this.fetchStudents()
      }
    }
  }
}
</script>

<style scoped>
.function-card {
  max-width: 780px;
  margin: 20px auto;
  animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 12px 40px -12px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.function-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 48px -12px rgba(0, 0, 0, 0.16);
}

/* 学生ID输入组 */
.student-id-input-group {
  display: flex;
  align-items: center;
  width: 100%;
}

.student-id-input-group .el-input {
  flex: 1;
}

.select-student-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  border: none !important;
  padding: 8px 16px !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
  color: white !important;
}

.select-student-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4) !important;
}

.select-student-btn .el-icon {
  margin-right: 6px;
}

.respond-card {
  display: flex;
  align-items: center;
  padding: 8px;
  color: #666;
  font-size: 14px;
}

.respond-card-container {
  width: 500px;
  margin: 0 auto;
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

:deep(h2) {
  color: #2c3e50 !important;
  font-weight: 600;
  margin: 0 24px 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
}

:deep(h2::after) {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 2px;
}

.submit-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  border: none !important;
  padding: 12px 32px !important;
  transition: transform 0.2s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
}

.el-form-item:last-child {
  margin-top: 24px;
}

/* 学生选择器弹窗样式 */
:deep(.student-selector-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.student-selector-dialog .el-dialog__header) {
  background: #ffffff;
  color: #1f2937;
  padding: 20px 24px;
  margin: 0;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.student-selector-dialog .el-dialog__title) {
  color: #1f2937;
  font-weight: 600;
  font-size: 18px;
}

:deep(.student-selector-dialog .el-dialog__body) {
  padding: 0;
  max-height: 70vh;
  overflow: hidden;
}

.student-selector {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
}

/* 搜索框样式 - 优化响应式 */
.student-search {
  margin: 20px 24px 16px 24px;
  width: auto;
  max-width: 100%;
  box-sizing: border-box;
}

:deep(.student-search .el-input__wrapper) {
  border-radius: 8px !important;
  border: 1px solid #e1e5e9 !important;
  transition: all 0.3s ease !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

:deep(.student-search .el-input__wrapper.is-focus) {
  border-color: #667eea !important;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
}

:deep(.student-search .el-input__inner) {
  width: 100% !important;
  box-sizing: border-box !important;
}

/* 加载状态 */
.loading-students {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  color: #6b7280;
}

.loading-students .el-icon {
  font-size: 32px;
  margin-bottom: 12px;
  color: #667eea;
}

/* 学生列表 - 优化滚动和布局 */
.student-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 20px 24px;
  max-height: 400px;
  min-height: 200px;
}

.student-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: rgba(249, 250, 251, 0.8);
  border: 1px solid rgba(229, 231, 235, 0.6);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.student-item:hover {
  background: rgba(102, 126, 234, 0.05);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.student-item:last-child {
  margin-bottom: 0;
}

/* 学生头像 */
.student-avatar {
  width: 48px;
  height: 48px;
  margin-right: 16px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.student-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.student-avatar .el-icon {
  font-size: 24px;
  color: #9ca3af;
}

/* 学生信息 */
.student-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.student-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-details {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
  flex-wrap: wrap;
}

.student-id {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 500;
  font-family: 'JetBrains Mono', monospace;
  flex-shrink: 0;
}

.student-school {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 对话框底部 */
.dialog-footer {
  padding: 16px 24px;
  background: rgba(249, 250, 251, 0.8);
  border-top: 1px solid rgba(229, 231, 235, 0.8);
  display: flex;
  justify-content: flex-end;
}

.dialog-footer .el-button {
  border-radius: 8px;
  padding: 8px 20px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.student-selector-dialog) { width: 95vw !important; margin: 0 auto !important; }
  .student-search { margin: 16px 16px 12px 16px; }
  .student-list { padding: 0 16px 16px 16px; max-height: 300px; }
  .student-item { padding: 10px 12px; }
  .student-avatar { width: 40px; height: 40px; margin-right: 12px; }
  .student-name { font-size: 15px; }
  .student-details { gap: 6px; }
  .dialog-footer { padding: 12px 16px; }
}

@media (max-width: 480px) {
  :deep(.student-selector-dialog) { width: 98vw !important; }
  .student-search { margin: 12px 12px 8px 12px; }
  .student-list { padding: 0 12px 12px 12px; }
  .student-item { padding: 8px 10px; }
  .student-avatar { width: 36px; height: 36px; margin-right: 10px; }
  .student-name { font-size: 14px; }
  .student-details { font-size: 12px; gap: 4px; }
}

/* 滚动条 */
.student-list::-webkit-scrollbar { width: 6px; }
.student-list::-webkit-scrollbar-track { background: rgba(243, 244, 246, 0.8); border-radius: 3px; }
.student-list::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.8); border-radius: 3px; }
.student-list::-webkit-scrollbar-thumb:hover { background: rgba(107, 114, 128, 0.8); }

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