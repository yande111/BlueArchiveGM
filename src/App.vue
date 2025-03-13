<template>
  <div id="app">
    <div class="container">
      <Sidebar />
      <div class="content">
        <TopNavBar />
        <div class="main-content">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import TopNavBar from './components/TopNavBar.vue'

export default {
  name: 'App',
  components: {
    Sidebar,
    TopNavBar,
  },
}
</script>

<style>
#app {
  background-image: url('@/assets/banner1.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}

/* 完全移除所有遮罩相关样式 */
.container {
  display: flex;
  min-height: 100vh;
  background: transparent !important; /* 强制透明 */
}

.content {
  flex: 1;
  background: transparent !important;
  padding: 0;
}

.main-content {
  padding: 24px;
}
</style>
