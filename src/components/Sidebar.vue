<template>
  <div class="sidebar">
    <div class="logo-wrapper">
      <img src="@/assets/logo.png" alt="Logo" class="sidebar-logo" />
    </div>
    <el-menu
      class="el-menu-vertical-demo"
      :default-active="$route.path"
      router
      background-color="#ffffff"
      text-color="#000000"
      active-text-color="#1E90FF"
    >
      <el-menu-item index="/">首页</el-menu-item>
      <el-menu-item index="/give">给予物品</el-menu-item>
      <el-menu-item index="/give-all">给予全部物品</el-menu-item>
      <el-menu-item index="/get-player">获取玩家信息</el-menu-item>
      <el-menu-item index="/mail">发送邮件</el-menu-item>
      <el-menu-item index="/get-email-code">获取邮箱验证码</el-menu-item>
      <el-menu-item index="/about">关于</el-menu-item>
    </el-menu>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
}
</script>

<style scoped>
.sidebar {
  width: 220px;
  background-color: #ffffff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

/* LOGO区域 */
.logo-wrapper {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-logo {
  width: 120px;
  height: auto;
}

/* 菜单区域 */
.el-menu-vertical-demo {
  height: calc(100vh - 80px); /* 减去LOGO区域高度 */
  border-right: none;
}

/* 覆盖选中项样式：选中时背景加深 */
.el-menu-item.is-active {
  background-color: #e6f7ff !important;
}
</style>
