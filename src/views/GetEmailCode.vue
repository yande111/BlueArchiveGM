<template>
  <el-card class="function-card" shadow="hover">
    <h2>获取邮箱验证码</h2>
    <el-form :model="form" label-width="120px">
      <el-form-item label="邮箱账户">
        <el-input v-model="form.account" placeholder="请输入邮箱账户"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleGetEmailCode">提交</el-button>
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
  name: 'GetEmailCode',
  data() {
    return {
      form: {
        account: '',
      },
      response: '',
    }
  },
  methods: {
    async handleGetEmailCode() {
      const baseURL = localStorage.getItem('serverAddress')
      const authKey = localStorage.getItem('serverAuthKey')
      if (!baseURL) {
        this.$message.error('请先在首页保存服务器地址')
        return
      }
      try {
        const url = `${baseURL}/cdq/api?cmd=gec&account=${this.form.account}`
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
