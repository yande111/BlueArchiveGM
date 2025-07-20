<template>
  <el-card class="function-card" shadow="hover">
    <h2>配置生成器</h2>
    <div class="tab-bar">
      <el-button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab', { active: activeTab === tab.key }]"
        @click="switchTab(tab.key)"
      >
        {{ tab.label }}
      </el-button>
    </div>

    <transition name="fade" mode="out-in">
      <div :key="activeTab" class="config-flex">
        <!-- 表单区域 -->
        <div class="form-area">
          <!-- ArenaNPC 列表 -->
          <template v-if="activeTab === 'ArenaNPC'">
            <el-collapse v-model="activeCollapseArena" accordion>
              <el-collapse-item
                v-for="(item, idx) in formData"
                :key="item.Index"
                :title="`条目 ${idx + 1}`"
                :name="item.Index"
              >
                <el-form :model="item" label-width="130px">
                  <el-form-item label="Index">
                    <el-input-number v-model="item.Index" :min="1" />
                  </el-form-item>
                  <el-form-item label="NPC账户等级">
                    <el-input-number v-model="item.NpcaccountLevel" :min="0" />
                  </el-form-item>
                  <el-form-item label="NPC等级">
                    <el-input-number v-model="item.Npclevel" :min="0" />
                  </el-form-item>
                  <el-form-item label="NPC等级偏差">
                    <el-input-number v-model="item.NpclevelDeviation" :min="0" />
                  </el-form-item>
                  <el-form-item label="NPC星级">
                    <el-input-number v-model="item.NpcstarGrade" :min="0" />
                  </el-form-item>
                  <el-form-item label="队伍主学生ID">
                    <div
                      v-for="(id, i) in item.ExceptionMainCharacterIds"
                      :key="i"
                      class="array-item"
                    >
                      <el-input-number v-model="item.ExceptionMainCharacterIds[i]" :min="0" />
                      <el-button
                        type="text"
                        icon="el-icon-delete"
                        @click="removeArray(item.ExceptionMainCharacterIds, i)"
                      />
                    </div>
                    <el-button type="primary" @click="addArray(item.ExceptionMainCharacterIds)"
                      >添加ID</el-button
                    >
                  </el-form-item>
                  <el-form-item label="副学生ID">
                    <div
                      v-for="(id, i) in item.ExceptionSupportCharacterIds"
                      :key="i"
                      class="array-item"
                    >
                      <el-input-number v-model="item.ExceptionSupportCharacterIds[i]" :min="0" />
                      <el-button
                        type="text"
                        icon="el-icon-delete"
                        @click="removeArray(item.ExceptionSupportCharacterIds, i)"
                      />
                    </div>
                    <el-button type="primary" @click="addArray(item.ExceptionSupportCharacterIds)"
                      >添加ID</el-button
                    >
                  </el-form-item>
                </el-form>
                <el-button type="danger" @click="removeArenaItem(idx)">删除</el-button>
              </el-collapse-item>
            </el-collapse>
            <el-button type="primary" @click="addArenaItem" class="add-btn">添加条目</el-button>
          </template>

          <!-- Attendance 单条 + 奖励列表 -->
          <template v-else-if="activeTab === 'Attendance'">
            <el-form :model="formData" label-width="130px">
              <el-form-item label="Id"><el-input-number v-model="formData.Id" /></el-form-item>
              <el-form-item label="类型"><el-input v-model="formData.Type" /></el-form-item>
              <el-form-item label="账号类型"
                ><el-input v-model="formData.AccountType"
              /></el-form-item>
              <el-form-item label="账户等级限制"
                ><el-input-number v-model="formData.AccountLevelLimit"
              /></el-form-item>
              <el-form-item label="标题（勿动）"
                ><el-input v-model="formData.Title"
              /></el-form-item>
              <el-form-item label="标题图片（勿动）"
                ><el-input v-model="formData.TitleImagePath"
              /></el-form-item>
              <el-form-item label="计数规则"
                ><el-input v-model="formData.CountRule"
              /></el-form-item>
              <el-form-item label="CountReset"
                ><el-input v-model="formData.CountReset"
              /></el-form-item>
              <el-form-item label="BookSize"
                ><el-input-number v-model="formData.BookSize"
              /></el-form-item>
              <el-form-item label="StartDate"
                ><el-date-picker v-model="formData.StartDate" type="datetime"
              /></el-form-item>
              <el-form-item label="EndDate"
                ><el-date-picker v-model="formData.EndDate" type="datetime"
              /></el-form-item>
              <el-form-item label="MailType"><el-input v-model="formData.MailType" /></el-form-item>
            </el-form>
            <h3>奖励列表</h3>
            <el-collapse v-model="activeCollapseReward" accordion>
              <el-collapse-item
                v-for="(reward, i) in formData.AttendanceRewardArray"
                :key="i"
                :name="i"
              >
                <el-form :model="reward" label-width="130px">
                  <el-form-item label="RewardParcelType"
                    ><el-input-number v-model="reward.RewardParcelType" :min="0"
                  /></el-form-item>
                  <el-form-item label="RewardId"
                    ><el-input-number v-model="reward.RewardId" :min="0"
                  /></el-form-item>
                  <el-form-item label="RewardAmoun"
                    ><el-input-number v-model="reward.RewardAmoun" :min="0"
                  /></el-form-item>
                </el-form>
                <el-button type="danger" @click="removeAttendanceReward(i)">删除</el-button>
              </el-collapse-item>
            </el-collapse>
            <el-button type="primary" @click="addAttendanceReward" class="add-btn"
              >添加奖励</el-button
            >
          </template>

          <!-- RaidSchedule 对象多条，不可增删 -->
          <template v-else-if="activeTab === 'RaidSchedule'">
            <el-collapse v-model="activeCollapseSchedule" accordion>
              <el-collapse-item
                v-for="(item, key, idx) in formData"
                :key="key"
                :title="`条目 ${idx + 1}`"
                :name="key"
              >
                <el-form :model="item" label-width="130px">
                  <el-form-item label="SeasonId"
                    ><el-input-number v-model="item.SeasonId"
                  /></el-form-item>
                  <el-form-item label="SeasonStartData"
                    ><el-date-picker v-model="item.SeasonStartData" type="datetime"
                  /></el-form-item>
                  <el-form-item label="SeasonEndData"
                    ><el-date-picker v-model="item.SeasonEndData" type="datetime"
                  /></el-form-item>
                  <el-form-item label="NextSeasonId"
                    ><el-input-number v-model="item.NextSeasonId"
                  /></el-form-item>
                </el-form>
              </el-collapse-item>
            </el-collapse>
          </template>

          <!-- RaidEliminateSchedule 对象多条，不可增删 -->
          <template v-else-if="activeTab === 'RaidEliminateSchedule'">
            <el-collapse v-model="activeCollapseEliminate" accordion>
              <el-collapse-item
                v-for="(item, key, idx) in formData"
                :key="key"
                :title="`条目 ${idx + 1}`"
                :name="key"
              >
                <el-form :model="item" label-width="130px">
                  <el-form-item label="SeasonId"
                    ><el-input-number v-model="item.SeasonId"
                  /></el-form-item>
                  <el-form-item label="SeasonStartData"
                    ><el-date-picker v-model="item.SeasonStartData" type="datetime"
                  /></el-form-item>
                  <el-form-item label="SeasonEndData"
                    ><el-date-picker v-model="item.SeasonEndData" type="datetime"
                  /></el-form-item>
                  <el-form-item label="NextSeasonId"
                    ><el-input-number v-model="item.NextSeasonId"
                  /></el-form-item>
                </el-form>
              </el-collapse-item>
            </el-collapse>
          </template>
        </div>

        <!-- JSON 预览 & 导出 -->
        <div class="editor-area">
          <el-input
            type="textarea"
            :rows="20"
            v-model="jsonText"
            readonly
            placeholder="实时 JSON 预览"
          />
          <el-button type="primary" @click="exportJson" class="export-btn"
            >导出 {{ activeTab }}.json</el-button
          >
        </div>
      </div>
    </transition>
  </el-card>
</template>

<script>
import ArenaNPC from '@/assets/json/configmaker/ArenaNPC.json'
import Attendance from '@/assets/json/configmaker/Attendance.json'
import RaidSchedule from '@/assets/json/configmaker/RaidSchedule.json'
import RaidEliminateSchedule from '@/assets/json/configmaker/RaidEliminateSchedule.json'

export default {
  name: 'ConfigGenerator',
  data() {
    return {
      tabs: [
        { key: 'ArenaNPC', label: '战术对抗赛' },
        { key: 'Attendance', label: '签到' },
        { key: 'RaidSchedule', label: '总力战' },
        { key: 'RaidEliminateSchedule', label: '大决战' },
      ],
      activeTab: 'ArenaNPC',
      formData: null,
      jsonText: '',
      activeCollapseArena: [],
      activeCollapseReward: [],
      activeCollapseSchedule: [],
      activeCollapseEliminate: [],
    }
  },
  watch: {
    formData: {
      deep: true,
      handler() {
        this.updateJsonText()
      },
    },
  },
  created() {
    this.loadJson()
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab
      this.loadJson()
    },
    loadJson() {
      let data
      switch (this.activeTab) {
        case 'ArenaNPC':
          data = JSON.parse(JSON.stringify(ArenaNPC))
          this.activeCollapseArena = [data[0]?.Index]
          break
        case 'Attendance':
          const att = JSON.parse(JSON.stringify(Attendance['1']))
          att.AttendanceRewardArray = Object.values(att.AttendanceReward || {})
          data = att
          this.activeCollapseReward = [0]
          break
        case 'RaidSchedule':
          data = JSON.parse(JSON.stringify(RaidSchedule))
          this.activeCollapseSchedule = [Object.keys(data)[0]]
          break
        case 'RaidEliminateSchedule':
          data = JSON.parse(JSON.stringify(RaidEliminateSchedule))
          this.activeCollapseEliminate = [Object.keys(data)[0]]
          break
      }
      this.formData = data
      this.updateJsonText()
    },
    addArenaItem() {
      const nextIndex = this.formData.reduce((m, i) => Math.max(m, i.Index), 0) + 1
      this.formData.push({
        Index: nextIndex,
        NpcaccountLevel: 0,
        Npclevel: 0,
        NpclevelDeviation: 0,
        NpcstarGrade: 0,
        ExceptionMainCharacterIds: [],
        ExceptionSupportCharacterIds: [],
      })
      this.activeCollapseArena = [nextIndex]
    },
    removeArenaItem(i) {
      this.formData.splice(i, 1)
    },
    addArray(arr) {
      arr.push(0)
    },
    removeArray(arr, i) {
      arr.splice(i, 1)
    },
    addAttendanceReward() {
      this.formData.AttendanceRewardArray.push({ RewardParcelType: 0, RewardId: 0, RewardAmoun: 0 })
    },
    removeAttendanceReward(i) {
      this.formData.AttendanceRewardArray.splice(i, 1)
    },
    updateJsonText() {
      if (this.activeTab === 'ArenaNPC') {
        this.jsonText = JSON.stringify(this.formData, null, 2)
      } else if (this.activeTab === 'Attendance') {
        const rewardObj = {}
        this.formData.AttendanceRewardArray.forEach((r, idx) => {
          rewardObj[idx + 1] = r
        })
        const { AttendanceRewardArray, ...rest } = this.formData
        rest.AttendanceReward = rewardObj
        this.jsonText = JSON.stringify({ 1: rest }, null, 2)
      } else {
        this.jsonText = JSON.stringify(this.formData, null, 2)
      }
    },
    exportJson() {
      const blob = new Blob([this.jsonText], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${this.activeTab}.json`
      link.click()
      URL.revokeObjectURL(link.href)
    },
  },
}
</script>

<style scoped>
.function-card {
  max-width: 1080px;
  margin: 40px auto;
  padding: 24px;
  animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(16px) saturate(120%);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 20px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

:deep(h2) {
  color: #2c3e50 !important;
  font-weight: 700;
  margin-bottom: 20px;
  padding-bottom: 12px;
  font-size: 24px;
  text-align: center;
  position: relative;
}

:deep(h2::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 2px;
}

.tab-bar {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 28px;
}

.tab {
  background: transparent;
  font-weight: 500;
  color: #4a5568;
  border: 1px solid transparent;
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.3s;
  cursor: pointer;
}
.tab:hover {
  background-color: #f0f9ff;
  border-color: #4facfe;
}
.tab.active {
  color: #2c3e50;
  background-color: #e6f7ff;
  border-color: #4facfe;
}

.config-flex {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.form-area,
.editor-area {
  overflow-y: auto;
  max-height: 680px;
  padding-right: 8px;
}

.editor-area .el-input__inner,
.editor-area textarea {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  background-color: #f9f9f9;
}

.el-form-item {
  margin-bottom: 18px;
}

.add-btn,
.export-btn {
  margin-top: 16px;
  margin-bottom: 12px;
}

.export-btn {
  float: right;
}

.array-item {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.el-collapse {
  border: none;
  background: #fafafa;
  border-radius: 12px;
  padding: 4px 6px;
}

.el-collapse-item__header {
  font-weight: 600;
  padding: 10px 16px;
  font-size: 14px;
  border-radius: 8px;
}

.el-collapse-item__wrap {
  background-color: #fff;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 8px;
}

.el-form {
  padding: 8px 0;
}

.el-button {
  border-radius: 8px;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 自定义滚动条美化（可选） */
.form-area::-webkit-scrollbar,
.editor-area::-webkit-scrollbar {
  width: 6px;
}
.form-area::-webkit-scrollbar-thumb,
.editor-area::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}
</style>
