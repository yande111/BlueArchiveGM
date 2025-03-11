<template>
  <div id="app">
    <div class="container">
      <Sidebar />
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
export default {
  name: 'App',
  components: { Sidebar },
}
</script>

<style scoped>
.container {
  display: flex;
  min-height: 100vh;
}
.content {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
}
</style>
