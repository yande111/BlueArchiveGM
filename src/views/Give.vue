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
      if (!baseURL) {
        this.$message.error('请先在首页保存服务器地址')
        return
      }
      try {
        const url = `${baseURL}/cdq/api?cmd=g&uid=${this.form.uid}&id=${this.form.id}&t=${this.form.t}&num=${this.form.num}`
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
