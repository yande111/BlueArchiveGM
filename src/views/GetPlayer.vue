<template>
  <el-card class="function-card" shadow="hover">
    <h2>获取玩家信息</h2>
    <el-form :model="form" label-width="100px">
      <el-form-item label="玩家ID">
        <el-input v-model="form.uid" placeholder="请输入玩家ID"></el-input>
      </el-form-item>
      <el-form-item label="二进制输出">
        <el-switch v-model="form.bin" active-value="1" inactive-value="0"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleGetPlayer">提交</el-button>
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
  </el-card>
</template>

<script>
import axios from 'axios'
export default {
  name: 'GetPlayer',
  data() {
    return {
      form: {
        uid: '',
        bin: '0',
      },
      response: '',
    }
  },
  methods: {
    async handleGetPlayer() {
      const baseURL = localStorage.getItem('serverAddress')
      const authKey = localStorage.getItem('serverAuthKey')
      if (!baseURL) {
        this.$message.error('请先在首页保存服务器地址')
        return
      }
      try {
        const url = `${baseURL}/cdq/api?cmd=gp&uid=${this.form.uid}&bin=${this.form.bin}`
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
