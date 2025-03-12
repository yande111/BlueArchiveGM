<template>
  <el-card class="function-card" shadow="hover">
    <h2>给予玩家全部物品</h2>
    <el-form :model="form" label-width="100px">
      <el-form-item label="玩家ID">
        <el-input v-model="form.uid" placeholder="请输入玩家ID"></el-input>
      </el-form-item>
      <el-form-item label="物品类型">
        <el-input v-model="form.t" placeholder="请输入物品类型"></el-input>
      </el-form-item>
      <el-form-item label="数量">
        <el-input-number v-model="form.num" :min="1"></el-input-number>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleGiveAll">提交</el-button>
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
    <el-collapse class="documentation">
      <el-collapse-item title="使用方法（必看！）">
        <ui class="guide-list">
          <li>提示：玩家不在线或未注册</li>
          <li><code>解决方法：注册或登录当前用户</code></li>
          <li>物品类别：</li>
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
  name: 'GiveAll',
  data() {
    return {
      form: {
        uid: '',
        t: '',
        num: 1,
      },
      response: '',
    }
  },
  methods: {
    async handleGiveAll() {
      const baseURL = localStorage.getItem('serverAddress')
      const authKey = localStorage.getItem('serverAuthKey')
      if (!baseURL) {
        this.$message.error('请先在首页保存服务器地址')
        return
      }
      try {
        const url = `${baseURL}/cdq/api?cmd=ga&uid=${this.form.uid}&t=${this.form.t}&num=${this.form.num}`
        const res = await axios.get(url, {
          headers: {
            Authorization: authKey,
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
