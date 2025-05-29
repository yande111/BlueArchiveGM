<template>
  <div id="app">
    <!-- 引入公告弹窗组件 -->
    <AnnouncementModal ref="announcementModal" />
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
import AnnouncementModal from './components/Announcement.vue'

export default {
  name: 'App',
  components: {
    Sidebar,
    TopNavBar,
    AnnouncementModal,
  },
  mounted() {
    // 挂载后自动打开公告弹窗（可根据需求调整调用时机）
    this.$refs.announcementModal.open()
  },
}
</script>

<style>
#app {
  background-image: url('@/assets/images/banner1.jpg');
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
