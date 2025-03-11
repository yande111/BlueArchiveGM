<template>
  <el-card class="function-card" shadow="hover">
    <h2>发送邮件</h2>
    <el-form :model="form" label-width="100px">
      <el-form-item label="玩家ID">
        <el-input v-model="form.uid" placeholder="请输入玩家ID"></el-input>
      </el-form-item>
      <el-form-item label="邮件内容">
        <el-input
          type="textarea"
          v-model="form.msg"
          placeholder="请输入邮件内容"
          :rows="4"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleMail">提交</el-button>
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
  name: 'Mail',
  data() {
    return {
      form: {
        uid: '',
        msg: '',
      },
      response: '',
    }
  },
  methods: {
    async handleMail() {
      const baseURL = localStorage.getItem('serverAddress')
      if (!baseURL) {
        this.$message.error('请先在首页保存服务器地址')
        return
      }
      try {
        // 假设邮件命令为 cmd=m
        const url = `${baseURL}/cdq/api?cmd=m&uid=${this.form.uid}&msg=${encodeURIComponent(this.form.msg)}`
        const res = await axios.get(url)
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
