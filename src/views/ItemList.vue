<template>
  <el-card class="function-card" shadow="hover">
    <h2>物品列表</h2>
    <p>Tips：点击卡片可以复制ID哦 ~</p>

    <!-- 搜索框 -->
    <el-input
      v-model="searchQuery"
      placeholder="搜索物品（名称、描述或ID）"
      class="search-input"
      @input="filterItems"
    />

    <div class="item-list">
      <div
        v-for="(item, index) in paginatedItems"
        :key="index"
        class="item"
        @click="copyToClipboard(item.Id)"
      >
        <img :src="item.Icon" :alt="item.Name" class="item-icon" />
        <div class="item-info">
          <div class="item-name">{{ item.Name }}</div>
          <div class="item-desc">{{ item.Desc }}</div>
          <div class="item-id">ID: {{ item.Id }}</div>
        </div>
      </div>
    </div>

    <!-- 分页控件，支持输入页码跳转 -->
    <el-pagination
      background
      layout="prev, pager, next, jumper"
      :total="filteredItems.length"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="handlePageChange"
      class="pagination"
    />
  </el-card>
</template>

<script>
import items from '@/assets/items.json'

export default {
  name: 'ItemList',
  data() {
    return {
      items: Array.isArray(items) ? items : [], // 确保 items 是数组
      currentPage: 1, // 当前页
      pageSize: 10, // 每页显示的物品数量
      searchQuery: '', // 搜索框输入的内容
      filteredItems: Array.isArray(items) ? items : [], // 过滤后的物品列表
    }
  },
  computed: {
    // 计算当前页显示的物品
    paginatedItems() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredItems.slice(start, end)
    },
  },
  methods: {
    // 处理分页变更
    handlePageChange(page) {
      this.currentPage = page
    },

    // 复制 ID 到剪贴板
    copyToClipboard(id) {
      const textToCopy = id.toString()
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          this.$message.success(`ID ${id} 已复制！`)
        })
        .catch((err) => {
          this.$message.error('复制失败')
          console.error(err)
        })
    },

    // 过滤物品列表
    filterItems() {
      if (!this.searchQuery) {
        this.filteredItems = this.items
      } else {
        this.filteredItems = this.items.filter((item) => {
          const searchText = this.searchQuery.toLowerCase()
          return (
            item.Name.toLowerCase().includes(searchText) ||
            item.Desc.toLowerCase().includes(searchText) ||
            item.Id.toString().includes(searchText)
          )
        })
      }
      this.currentPage = 1 // 搜索后，重置为第一页
    },
  },
  watch: {
    // 当搜索框内容发生变化时，重新过滤物品列表
    searchQuery() {
      this.filterItems()
    },
  },
}
</script>

<style scoped>
.function-card {
  max-width: 900px;
  margin: 40px auto;
  animation: fadeIn 1s ease;
  padding-bottom: 20px;
}

.search-input {
  margin-bottom: 20px;
  width: 100%;
}

.item-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 150px;
  text-align: center;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.item:hover {
  background-color: #f1f1f1;
}

.item-icon {
  width: 100%;
  height: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px;
  background-color: #fff;
}

.item-info {
  margin-top: 10px;
}

.item-name {
  font-size: 16px;
  font-weight: bold;
  color: #1e90ff;
}

.item-desc {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.item-id {
  font-size: 12px;
  color: #aaa;
  margin-top: 5px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
