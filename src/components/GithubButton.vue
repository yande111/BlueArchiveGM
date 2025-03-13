<template>
  <el-button type="primary" class="github-button" @click="openGithub"> Github </el-button>
</template>

<script>
export default {
  name: 'GithubButton',
  methods: {
    openGithub() {
      window.open('https://github.com/PrimeStudentCouncil/BlueArchiveGM', '_blank')
    },
  },
}
</script>

<style scoped>
.github-button {
  background-color: #24292e;
  border-color: #24292e;
  color: #fff;
  /* 可根据需要调整尺寸 */
}
.github-button:hover {
  background-color: #3b4045;
  border-color: #3b4045;
}
</style>
