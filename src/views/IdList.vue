<template>
  <el-card class="function-card" shadow="hover">
    <h2>物品列表</h2>
    <p>Tips：点击卡片可以复制ID哦 ~</p>

    <div class="idlist-container">
      <!-- 侧边栏 -->
      <div class="idlist-sidebar">
        <el-menu class="idlist-menu" :default-active="selectedSource" @select="handleSourceSelect">
          <el-menu-item v-for="option in sourceOptions" :key="option.key" :index="option.key">
            {{ option.label }}
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 主内容区 -->
      <div class="idlist-main">
        <!-- 搜索框 -->
        <el-input
          v-model="searchQuery"
          placeholder="搜索物品（名称、描述或ID）"
          class="search-input"
          prefix-icon="el-icon-search"
        />

        <!-- 分类筛选 -->
        <el-select v-model="selectedCategory" placeholder="选择分类" class="category-select">
          <el-option label="全部" value="all" />
          <el-option v-for="(cat, index) in categoryList" :key="index" :label="cat" :value="cat" />
        </el-select>

        <!-- 数据列表 -->
        <div class="idlist-list">
          <div
            v-for="(item, index) in paginatedItems"
            :key="index"
            class="idlist-item"
            @click="copyToClipboard(item.Id)"
          >
            <img :src="item.Icon" :alt="item.Name" class="idlist-item-icon" />
            <div class="idlist-item-info">
              <div class="idlist-item-name">{{ item.Name }}</div>
              <div class="idlist-item-desc">{{ item.Desc }}</div>
              <div class="idlist-item-id">ID: {{ item.Id }}</div>
              <!-- 综合视图中显示来源 -->
              <div class="idlist-item-source" v-if="selectedSource === 'combined'">
                来源：{{ getSourceLabel(item.source) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 分页控件 -->
        <el-pagination
          background
          layout="prev, pager, next, jumper"
          :total="filteredItems.length"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
          class="pagination"
        />
      </div>
    </div>
  </el-card>
</template>

<script>
import itemsData from '@/assets/items.json'
import studentsData from '@/assets/students.json'
import furnitureData from '@/assets/furniture.json'
import equipmentData from '@/assets/equipment.json'
import currencyData from '@/assets/currency.json'

export default {
  name: 'IdList',
  data() {
    return {
      searchQuery: '',
      selectedCategory: 'all',
      selectedSource: 'combined', // 'combined', 'items', 'students', 'furniture', 'equipment', 'currency'
      pageSize: 10,
      currentPage: 1,
      sourceOptions: [
        { label: '综合', key: 'combined' },
        { label: '物品', key: 'items' },
        { label: '学生', key: 'students' },
        { label: '家具', key: 'furniture' },
        { label: '装备', key: 'equipment' },
        { label: '货币', key: 'currency' },
      ],
      // 各数据源数组
      itemsList: [],
      studentsList: [],
      furnitureList: [],
      equipmentList: [],
      currencyList: [],
    }
  },
  computed: {
    // 合并所有数据源
    combinedItems() {
      return [
        ...this.itemsList,
        ...this.studentsList,
        ...this.furnitureList,
        ...this.equipmentList,
        ...this.currencyList,
      ]
    },
    // 当前选中数据源的列表
    currentSourceItems() {
      switch (this.selectedSource) {
        case 'combined':
          return this.combinedItems
        case 'items':
          return this.itemsList
        case 'students':
          return this.studentsList
        case 'furniture':
          return this.furnitureList
        case 'equipment':
          return this.equipmentList
        case 'currency':
          return this.currencyList
        default:
          return []
      }
    },
    // 根据搜索和分类过滤当前数据
    filteredItems() {
      const query = this.searchQuery.toLowerCase()
      let filtered = this.currentSourceItems.filter((item) => {
        return (
          (item.Name && item.Name.toLowerCase().includes(query)) ||
          (item.Desc && item.Desc.toLowerCase().includes(query)) ||
          (item.Id && item.Id.toString().includes(query))
        )
      })
      if (this.selectedCategory !== 'all') {
        filtered = filtered.filter((item) => item.Category === this.selectedCategory)
      }
      return filtered
    },
    // 分页显示数据
    paginatedItems() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredItems.slice(start, start + this.pageSize)
    },
    // 从当前数据中提取所有分类
    categoryList() {
      const categories = new Set()
      this.currentSourceItems.forEach((item) => {
        if (item.Category) {
          categories.add(item.Category)
        }
      })
      return Array.from(categories)
    },
  },
  methods: {
    handlePageChange(page) {
      this.currentPage = page
    },
    copyToClipboard(id) {
      navigator.clipboard
        .writeText(id.toString())
        .then(() => {
          this.$message.success(`ID ${id} 已复制！`)
        })
        .catch((err) => {
          this.$message.error('复制失败')
          console.error(err)
        })
    },
    handleSourceSelect(key) {
      this.selectedSource = key
      this.currentPage = 1
    },
    getSourceLabel(source) {
      const mapping = {
        items: '物品',
        students: '学生',
        furniture: '家具',
        equipment: '装备',
        currency: '货币',
      }
      return mapping[source] || source
    },
  },
  watch: {
    searchQuery() {
      this.currentPage = 1
    },
    selectedCategory() {
      this.currentPage = 1
    },
  },
  async created() {
    // 动态加载除学生之外的图标
    const icons = import.meta.glob('@/assets/icon/*.webp', { eager: true })
    // 指定需要读取的键列表
    const keys = [
      'Id',
      'Rarity',
      'Icon',
      'Name',
      'Desc',
      'Category',
      'SubCategory',
      'DevName',
      'School',
      'Club',
      'FamilyName',
      'PersonalName',
      'SchoolYear',
      'CharacterAge',
      'Birthday',
      'CharacterSSRNew',
      'ProfileIntroduction',
      'Hobby',
      'CharacterVoice',
      'Illustrator',
      'Designer',
      'CharHeightMetric',
      'CharHeightImperial',
    ]
    // 通用处理函数：只读取存在的键，设置默认分类，并添加数据源标识
    // 对于学生，忽略 Icon 字段，采用 id 构建图片 URL
    const processData = (data, defaultCategory = null, sourceKey) => {
      return data.map((item) => {
        const newItem = {}
        keys.forEach((key) => {
          if (item[key] !== undefined) {
            newItem[key] = item[key]
          }
        })
        if (!newItem.Category && defaultCategory) {
          newItem.Category = defaultCategory
        }
        newItem.source = sourceKey
        if (sourceKey === 'students') {
          // 使用相对路径并通过 icons 对象获取
          const iconPath = `/src/assets/icon/${newItem.Id}.webp`
          newItem.Icon = icons[iconPath]?.default || ''
        } else {
          if (newItem.Icon) {
            newItem.Icon = icons[`/src/assets/icon/${newItem.Icon}.webp`]?.default || ''
          }
        }
        return newItem
      })
    }
    // 分别处理各个 JSON 文件
    this.itemsList = processData(itemsData, null, 'items')
    this.studentsList = processData(studentsData, '学生', 'students')
    this.furnitureList = processData(furnitureData, '家具', 'furniture')
    this.equipmentList = processData(equipmentData, '装备', 'equipment')
    this.currencyList = processData(currencyData, '货币', 'currency')
  },
}
</script>

<style scoped>
/* 主卡片样式 */
.function-card {
  max-width: 1250px;
  margin: 10px auto 20px;
  animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  padding: 20px;
  background: rgba(255, 255, 255, 0.86) !important;
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow:
    0 12px 40px -12px rgba(0, 0, 0, 0.12),
    0 4px 24px -4px rgba(0, 0, 0, 0.08),
    inset 0 0 12px rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  overflow: hidden;
}

.function-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 16px 48px -12px rgba(0, 0, 0, 0.16),
    0 6px 32px -4px rgba(0, 0, 0, 0.12),
    inset 0 0 16px rgba(255, 255, 255, 0.5);
}

/* 标题 */
:deep(h2) {
  color: #2c3e50 !important;
  font-weight: 600;
  margin-bottom: 24px;
  padding-bottom: 12px;
  position: relative;
}
:deep(h2::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 48px;
  height: 3px;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 2px;
}

/* 侧边栏与主内容布局 */
.idlist-container {
  display: flex;
  gap: 20px;
}
.idlist-sidebar {
  width: 200px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
}
.idlist-menu {
  border: none;
  background: transparent;
}
.idlist-menu :deep(.el-menu-item) {
  padding: 10px 15px;
  margin: 5px 0;
}

/* 主内容区 */
.idlist-main {
  flex: 1;
  padding: 0 10px;
}

/* 搜索框样式 */
.search-input {
  margin-bottom: 20px;
  width: 100%;
  border-radius: 25px;
  overflow: hidden;
}
.search-input .el-input__inner {
  border: none;
  background: #f9f9f9;
  padding: 12px 20px;
  font-size: 16px;
  transition:
    box-shadow 0.3s ease,
    background-color 0.3s ease;
}
.search-input .el-input__inner:focus {
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 分类下拉框 */
.category-select {
  margin-bottom: 20px;
  width: 100%;
}

/* 数据列表使用 CSS Grid 显示一行 5 个 */
.idlist-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-top: 30px;
  animation: fadeInItems 1s ease-in-out;
}
.idlist-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}
.idlist-item:hover {
  background-color: #f1f1f1;
  transform: translateY(-4px);
  box-shadow: 0 12px 16px rgba(0, 0, 0, 0.1);
}
.idlist-item-icon {
  width: 100%;
  height: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px;
  background-color: #fff;
}
.idlist-item-info {
  margin-top: 10px;
}
.idlist-item-name {
  font-size: 16px;
  font-weight: bold;
  color: #1e90ff;
}
.idlist-item-desc {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}
.idlist-item-id {
  font-size: 12px;
  color: #aaa;
  margin-top: 5px;
}
.idlist-item-source {
  margin-top: 8px;
  font-size: 12px;
  color: #555;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  animation: fadeIn 1s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes fadeInItems {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .function-card {
    margin: 20px;
    border-radius: 12px;
  }
  :deep(h2) {
    font-size: 1.5rem;
  }
  .idlist-container {
    flex-direction: column;
  }
  .idlist-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #ddd;
    padding: 10px 0;
  }
  .idlist-main {
    padding: 0;
  }
  /* 手机端改为2列显示 */
  .idlist-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
