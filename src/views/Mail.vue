<template>
  <el-card class="function-card" shadow="hover">
    <h2>发送邮件</h2>
    <el-form :model="form" label-width="120px">
      <el-form-item label="玩家ID">
        <el-input v-model="form.player" placeholder="请输入玩家ID"></el-input>
      </el-form-item>
      <el-form-item label="发件人">
        <el-input v-model="form.sender" placeholder="请输入发件人名称"></el-input>
      </el-form-item>
      <el-form-item label="邮件内容">
        <el-input
          type="textarea"
          v-model="form.comment"
          placeholder="请输入邮件内容"
          :rows="4"
        ></el-input>
      </el-form-item>
      <el-form-item label="发送时间">
        <el-input-number v-model="form.send_date" :min="0" placeholder="发送时间"></el-input-number>
      </el-form-item>
      <el-form-item label="过期时间">
        <el-input-number
          v-model="form.expire_date"
          :min="0"
          placeholder="过期时间"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="附件列表">
        <el-input
          type="textarea"
          v-model="form.parcel_info_list"
          placeholder='例如: [{"type":2,"id":3,"num":99999999}]'
          :rows="4"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <div class="input-container">
          <el-button type="primary" @click="handleMail">提交</el-button>
        </div>
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
        player: '',
        sender: '',
        comment: '',
        send_date: 0,
        expire_date: 0,
        parcel_info_list: '',
      },
      response: '',
    }
  },
  methods: {
    async handleMail() {
      const baseURL = localStorage.getItem('serverAddress')
      const authKey = localStorage.getItem('serverAuthKey')
      if (!baseURL) {
        this.$message.error('请先在首页保存服务器地址')
        return
      }
      const url = `${baseURL}/cdq/api?cmd=m&player=${this.form.player}&sender=${encodeURIComponent(this.form.sender)}&comment=${encodeURIComponent(this.form.comment)}&send_date=${this.form.send_date}&expire_date=${this.form.expire_date}&parcel_info_list=${encodeURIComponent(this.form.parcel_info_list)}`
      try {
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
.input-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
