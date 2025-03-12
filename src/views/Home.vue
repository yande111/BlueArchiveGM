<template>
  <el-card class="home-card" shadow="hover">
    <div class="logo-container">
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
    </div>
    <h2>BlueArchiveGM 控制台</h2>
    <p>欢迎使用 BlueArchiveGM 控制台，请在下方输入服务器地址开始使用。</p>
    <div class="input-container">
      <el-input
        v-model="serverAddress"
        placeholder="请输入服务器地址"
        style="width: 300px"
      ></el-input>
      <el-button type="primary" @click="saveServerAddress">保存</el-button>
    </div>
    <p>文本测试</p>
    <p>文本测试</p>
    <p>文本测试</p>
    <p>文本测试</p>
    <p>文本测试</p>
    <p>文本测试</p>
  </el-card>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      serverAddress: localStorage.getItem('serverAddress') || '',
    }
  },
  methods: {
    saveServerAddress() {
      localStorage.setItem('serverAddress', this.serverAddress)
      this.$message.success('服务器地址已保存')
    },
  },
}
</script>

<style scoped>
.home-card {
  max-width: 600px;
  margin: 40px auto;
  text-align: center;
  animation: fadeIn 1s ease;
}
.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.logo {
  width: 200px;
  height: auto;
  animation: bounce 2s infinite;
}
.input-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}
</style>
