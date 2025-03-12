<template>
  <el-card class="function-card" shadow="hover">
    <h2>给予玩家单个物品</h2>
    <el-form :model="form" label-width="100px">
      <el-form-item label="玩家ID">
        <el-input v-model="form.uid" placeholder="请输入玩家ID"></el-input>
      </el-form-item>
      <el-form-item label="物品ID">
        <el-input v-model="form.id" placeholder="请输入物品ID"></el-input>
      </el-form-item>
      <el-form-item label="物品类型">
        <el-input v-model="form.t" placeholder="请输入物品类型"></el-input>
      </el-form-item>
      <el-form-item label="数量">
        <el-input-number v-model="form.num" :min="1"></el-input-number>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleGive">提交</el-button>
      </el-form-item>
    </el-form>
    <el-alert
      v-if="response"
      title="响应"
      type="success"
      :description="response"
      show-icon
      style="margin-top: 20px"
    ></el-alert>
    <!-- 折叠帮助文档 -->
    <el-collapse class="documentation">
      <el-collapse-item title="使用方法（必看！）">
        <ui class="guide-list">
          <li>提示：玩家不在线或未注册</li>
          <li><code>解决方法：注册或登录当前用户</code></li>
          <li>不知道物品ID？</li>
          <li><code>前往ID列表查看</code></li>
          <li>物品类型不知道？</li>
          <li>以下是物品类别：</li>
          <li><code>"Material": // 材料</code></li>
          <li><code>"Character": // 角色</code></li>
          <li><code>"Equipment": // 装备</code></li>
          <li><code>"Furniture": // 家具</code></li>
          <li><code>"Favor": // 礼物</code></li>
          <li><code>"Emblem": // 称号</code></li>
        </ui>
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>

<script>
import axios from 'axios'
export default {
  name: 'Give',
  data() {
    return {
      form: {
        uid: '',
        id: '',
        t: '',
        num: 1,
      },
      response: '',
    }
  },
  methods: {
    async handleGive() {
      const baseURL = localStorage.getItem('serverAddress')
      const authKey = localStorage.getItem('serverAuthKey') // 获取保存的密钥

      if (!baseURL) {
        this.$message.error('请先在首页保存服务器地址')
        return
      }

      try {
        const url = `${baseURL}/cdq/api?cmd=g&uid=${this.form.uid}&id=${this.form.id}&t=${this.form.t}&num=${this.form.num}`
        const res = await axios.get(url, {
          headers: {
            Authorization: authKey, // 添加请求头
          },
        })
        this.response = JSON.stringify(res.data)
      } catch (error) {
        this.response = '请求错误：' + error
      }
    },
  },
}
</script>

<style scoped>
.function-card {
  max-width: 600px;
  margin: 40px auto;
  animation: fadeIn 1s ease;
}
</style>
