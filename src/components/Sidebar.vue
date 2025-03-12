<template>
  <div class="sidebar">
    <div class="sidebar-content">
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
        <el-menu-item index="/" class="menu-item">首页</el-menu-item>
        <el-menu-item index="/give" class="menu-item">给予物品</el-menu-item>
        <el-menu-item index="/give-all" class="menu-item">给予全部物品</el-menu-item>
        <el-menu-item index="/get-player" class="menu-item">获取玩家信息</el-menu-item>
        <el-menu-item index="/mail" class="menu-item">发送邮件</el-menu-item>
        <el-menu-item index="/get-email-code" class="menu-item">获取邮箱验证码</el-menu-item>
        <el-menu-item index="/item-list" class="menu-item">物品列表</el-menu-item>
        <el-menu-item index="/about" class="menu-item">关于</el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
}
</script>

<style scoped>
/* 外层侧边栏背景铺满视口 */
.sidebar {
  width: 220px;
  min-height: 100vh; /* 背景铺满整个视口 */
  position: relative;
  background-color: #ffffff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

/* 用伪元素确保背景效果一致 */
.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff;
  z-index: -1;
}

/* 内容容器，高度为90vh，并垂直居中 */
.sidebar-content {
  height: 90vh;
  margin: auto 0;
  display: flex;
  flex-direction: column;
}

/* LOGO区域 */
.logo-wrapper {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-logo {
  width: 200px;
  height: auto;
}

/* 菜单区域占据剩余空间 */
.el-menu-vertical-demo {
  flex: 1;
  border-right: none;
}

/* 侧边栏选项样式 */
.menu-item {
  background-color: #fff;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

/* 鼠标悬停时背景色 */
.menu-item:hover {
  background-color: #f5f5f5; /* 鼠标悬停背景色 */
}

/* 选中项的背景色和文字颜色 */
.el-menu-item.is-active {
  background-color: #e8f4ff !important; /* 选中项的背景色 */
  color: #1e90ff !important; /* 选中的文字颜色 */
  transition:
    background-color 0.3s ease,
    color 0.3s ease; /* 选中项背景颜色和文字颜色过渡动画 */
}

/* 非选中项的默认背景 */
.el-menu-item:not(.is-active) {
  background-color: transparent;
  transition:
    background-color 0.3s ease,
    color 0.3s ease; /* 非选中项背景色和文字颜色过渡 */
}
</style>
