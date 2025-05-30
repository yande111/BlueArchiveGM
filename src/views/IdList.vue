<template>
  <el-card class="function-card" shadow="hover">
    <div class="header-section">
      <h2>物品列表</h2>
      <p class="tips">点击卡片可以复制ID ~</p>
    </div>

    <div class="idlist-container">
      <!-- 侧边栏 -->
      <div class="idlist-sidebar">
        <div class="sidebar-title">分类筛选</div>
        <el-menu class="idlist-menu" :default-active="selectedSource" @select="handleSourceSelect">
          <el-menu-item v-for="option in sourceOptions" :key="option.value" :index="option.value">
            <span class="menu-icon">{{ getMenuIcon(option.value) }}</span>
            <span class="menu-text">{{ option.label }}</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 主内容区 -->
      <div class="idlist-main">
        <!-- 搜索框 -->
        <div class="search-section">
          <el-input
            v-model="searchQuery"
            placeholder="搜索物品（名称、描述或ID）"
            class="search-input"
            size="large"
            clearable
          >
            <template #prefix>
              <i class="bi bi-search"></i>
            </template>
          </el-input>
          
          <!-- 稀有度筛选 -->
          <div class="filter-section">
            <div class="filter-group">
              <span class="filter-label">稀有度筛选:</span>
              <el-checkbox-group v-model="selectedRarities">
                <el-checkbox 
                  v-for="rarity in rarityOptions" 
                  :key="rarity.value" 
                  :label="rarity.value"
                  :class="['rarity-checkbox', rarity.class]"
                >
                  <span class="rarity-badge-small" :class="rarity.class">{{ rarity.label }}</span>
                </el-checkbox>
              </el-checkbox-group>
              <el-button 
                size="small" 
                type="info" 
                plain 
                @click="clearRarityFilter"
                class="clear-filter-btn"
              >
                清除筛选
              </el-button>
            </div>
          </div>
          
          <div class="search-stats">
            找到 <span class="count">{{ filteredItems.length }}</span> 个物品
            <span v-if="selectedRarities.length > 0" class="filter-info">
              (已筛选: {{ selectedRarities.join(', ') }})
            </span>
          </div>
        </div>

        <!-- 数据列表 -->
        <div class="idlist-list" v-if="paginatedItems.length > 0">
          <div
            v-for="(item, index) in paginatedItems"
            :key="index"
            class="idlist-item"
            @click="copyToClipboard(item.Id)"
          >
            <div class="item-icon-wrapper">
              <img :src="item.Icon" :alt="item.Name" class="idlist-item-icon" />
              <div class="rarity-badge" :class="getRarityClass(item.Rarity)">
                {{ getRarityText(item.Rarity) }}
              </div>
            </div>
            <div class="idlist-item-info">
              <div class="idlist-item-name">{{ item.Name }}</div>
              <div class="idlist-item-desc">{{ item.Desc }}</div>
              <div class="idlist-item-meta">
                <span class="idlist-item-id">ID: {{ item.Id }}</span>
                <span class="idlist-item-category">{{ getCategoryText(item.Category) }}</span>
              </div>
            </div>
            <div class="copy-hint">点击复制</div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <i class="bi bi-search"></i>
          <p>没有找到匹配的物品</p>
          <span>试试其他关键词吧</span>
        </div>

        <!-- 分页控件 -->
        <el-pagination
          v-if="filteredItems.length > pageSize"
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
import itemsData from '@/assets/json/id/items.json'
import studentsData from '@/assets/json/id/students.json'
import furnitureData from '@/assets/json/id/furniture.json'
import equipmentData from '@/assets/json/id/equipment.json'
import currencyData from '@/assets/json/id/currency.json'

export default {
  name: 'IdList',
  data() {
    return {
      searchQuery: '',
      selectedSource: 'combined',
      selectedRarities: [],
      pageSize: 10,
      currentPage: 1,
      sourceOptions: [
        { value: 'combined', label: '综合' },
        { value: 'Material', label: '材料' },
        { value: 'Character', label: '学生' },
        { value: 'Equipment', label: '装备' },
        { value: 'Furniture', label: '家具' },
        { value: 'Favor', label: '礼物' },
        { value: 'Emblem', label: '称号' },
        { value: 'Other', label: '其他' },
      ],
      rarityOptions: [
        { value: 'N', label: 'N', class: 'rarity-1' },
        { value: 'R', label: 'R', class: 'rarity-2' },
        { value: 'SR', label: 'SR', class: 'rarity-3' },
        { value: 'SSR', label: 'SSR', class: 'rarity-4' },
      ],
      // 数据存储
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
    // 根据选中分类过滤数据：
    // 当选中 "combined" 时，返回所有数据按 ID 升序排序；
    // 当选中 "Furniture" 时，匹配 JSON 中的 "Furnitures"；
    // 其它则直接按照 item.Category 匹配
    currentSourceItems() {
      if (this.selectedSource === 'combined') {
        return this.combinedItems.slice().sort((a, b) => a.Id - b.Id)
      } else if (this.selectedSource === 'Furniture') {
        return this.combinedItems.filter((item) => item.Category === 'Furnitures')
      } else {
        return this.combinedItems.filter((item) => item.Category === this.selectedSource)
      }
    },
    // 搜索过滤
    filteredItems() {
      const query = this.searchQuery.toLowerCase()
      let items = this.currentSourceItems.filter((item) => {
        return (
          (item.Name && item.Name.toLowerCase().includes(query)) ||
          (item.Desc && item.Desc.toLowerCase().includes(query)) ||
          (item.Id && item.Id.toString().includes(query))
        )
      })
      
      // 稀有度筛选
      if (this.selectedRarities.length > 0) {
        items = items.filter((item) => {
          const itemRarity = typeof item.Rarity === 'string' ? item.Rarity : 'N'
          return this.selectedRarities.includes(itemRarity)
        })
      }
      
      return items
    },
    // 分页数据
    paginatedItems() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredItems.slice(start, start + this.pageSize)
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
          this.$message.success(`ID ${id} 已复制到剪贴板！`)
        })
        .catch(() => {
          this.$message.error('复制失败')
        })
    },
    handleSourceSelect(key) {
      this.selectedSource = key
      this.currentPage = 1
    },
    handleRarityChange() {
      this.currentPage = 1
    },
    clearRarityFilter() {
      this.selectedRarities = []
      this.currentPage = 1
    },
    getMenuIcon(value) {
      const icons = {
        combined: '🔍', Material: '🧱', Character: '👤', Equipment: '⚔️',
        Furniture: '🏠', Favor: '🎁', Emblem: '🏆', Other: '📦'
      }
      return icons[value] || '📁'
    },
    getRarityClass(rarity) {
      if (typeof rarity === 'string') {
        const rarityMap = { 'N': 'rarity-1', 'R': 'rarity-2', 'SR': 'rarity-3', 'SSR': 'rarity-4' }
        return rarityMap[rarity] || 'rarity-1'
      }
      return `rarity-${rarity || 1}`
    },
    getRarityText(rarity) {
      return typeof rarity === 'string' ? rarity : ({ 1: 'N', 2: 'R', 3: 'SR', 4: 'SSR' }[rarity] || 'N')
    },
    getCategoryText(category) {
      const texts = {
        Material: '材料', Character: '学生', Equipment: '装备',
        Furnitures: '家具', Favor: '礼物', Emblem: '称号', Other: '其他'
      }
      return texts[category] || category
    }
  },
  watch: {
    searchQuery() {
      this.currentPage = 1
    },
    selectedRarities() {
      this.currentPage = 1
    },
  },
  async created() {
    const icons = import.meta.glob('@/assets/icon/*.png', { eager: true })
    const keys = ['Id', 'Rarity', 'Icon', 'Name', 'Desc', 'Category', 'SubCategory', 'DevName', 'School', 'Club', 'FamilyName', 'PersonalName', 'SchoolYear', 'CharacterAge', 'Birthday', 'CharacterSSRNew', 'ProfileIntroduction', 'Hobby', 'CharacterVoice', 'Illustrator', 'Designer', 'CharHeightMetric', 'CharHeightImperial']
    const allowedCategories = ['Material', 'Character', 'Equipment', 'Furnitures', 'Favor', 'Emblem']
    
    const processData = (data, defaultCategory = null, sourceKey) => {
      return data.map((item) => {
        const newItem = {}
        keys.forEach((key) => {
          if (item[key] !== undefined) newItem[key] = item[key]
        })
        
        let cat = newItem.Category || newItem.SubCategory || defaultCategory
        newItem.Category = allowedCategories.includes(cat) ? cat : 'Other'
        newItem.source = sourceKey
        
        // 处理学生稀有度
        if (sourceKey === 'students' && newItem.Icon) {
          if (newItem.Icon.endsWith('_sr')) {
            newItem.Rarity = 'SR'
          } else if (newItem.Icon.includes('_swimsuit') || newItem.Icon.includes('_original') || newItem.Icon.includes('_boss') || newItem.Icon.includes('_cnc')) {
            newItem.Rarity = 'SSR'
          } else if (newItem.Icon.match(/_[a-z]{2,3}$/)) {
            newItem.Rarity = 'R'
          } else {
            newItem.Rarity = 'N'
          }
        }
        
        // 处理图标
        if (sourceKey === 'students') {
          newItem.Icon = icons[`/src/assets/icon/${newItem.Id}.png`]?.default || ''
        } else if (newItem.Icon) {
          newItem.Icon = icons[`/src/assets/icon/${newItem.Icon}.png`]?.default || ''
        }
        
        return newItem
      })
    }
    
    this.itemsList = processData(itemsData, null, 'items')
    this.studentsList = processData(studentsData, 'Character', 'students')
    this.furnitureList = processData(furnitureData, '家具', 'Furnitures')
    this.equipmentList = processData(equipmentData, '装备', 'equipment')
    this.currencyList = processData(currencyData, '货币', 'currency')
  },
}
</script>

<style scoped>
/* 主卡片 */
.function-card {
  max-width: 1400px;
  margin: 20px auto;
  animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(20px) saturate(120%);
  border: 2px solid rgba(52, 152, 219, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(52, 152, 219, 0.15), 0 4px 16px rgba(174, 214, 241, 0.2);
  overflow: hidden;
  position: relative;
}

.function-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3498db 0%, #85c1e9 50%, #f8c9d4 100%);
}

.function-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(52, 152, 219, 0.2), 0 8px 24px rgba(174, 214, 241, 0.3);
  border-color: rgba(52, 152, 219, 0.4);
}

/* 头部 */
.header-section {
  text-align: center;
  margin-bottom: 30px;
  padding-top: 8px;
}

:deep(h2) {
  color: #2c3e50 !important;
  font-weight: 700;
  font-size: 2rem;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #3498db 0%, #5dade2 50%, #f1948a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tips {
  color: #5499c7;
  font-size: 14px;
  margin: 0;
  font-weight: 500;
}

/* 布局 */
.idlist-container {
  display: flex;
  gap: 24px;
  min-height: 600px;
}

/* 侧边栏 */
.idlist-sidebar {
  width: 260px;
  background: linear-gradient(135deg, #ebf4fd 0%, #d6eaf8 100%);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(52, 152, 219, 0.1);
  border: 2px solid rgba(174, 214, 241, 0.5);
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #2874a6;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #aed6f1;
}

.idlist-menu {
  border: none;
  background: transparent;
}

:deep(.el-menu-item) {
  padding: 12px 16px !important;
  margin: 4px 0 !important;
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  border: none !important;
  background: transparent !important;
  color: #2874a6 !important;
}

:deep(.el-menu-item:hover) {
  background: rgba(52, 152, 219, 0.15) !important;
  color: #1b4f72 !important;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #3498db 0%, #5dade2 100%) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
}

.menu-icon {
  font-size: 18px;
  margin-right: 12px;
  display: inline-block;
  width: 20px;
  text-align: center;
}

.menu-text {
  font-weight: 500;
}

/* 主内容区 */
.idlist-main {
  flex: 1;
  min-height: 100%;
}

/* 搜索和筛选 */
.search-section {
  margin-bottom: 24px;
}

.search-input {
  margin-bottom: 12px;
}

:deep(.search-input .el-input__wrapper) {
  border-radius: 16px !important;
  border: 2px solid #aed6f1 !important;
  transition: all 0.3s ease !important;
  padding: 8px 16px !important;
}

:deep(.search-input .el-input__wrapper:hover) {
  border-color: #5dade2 !important;
}

:deep(.search-input .el-input__wrapper.is-focus) {
  border-color: #3498db !important;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15) !important;
}

:deep(.search-input .el-input__inner) {
  font-size: 16px !important;
  height: 40px !important;
  color: #2874a6 !important;
}

:deep(.search-input .el-input__inner::placeholder) {
  color: #85c1e9 !important;
}

:deep(.search-input .el-input__prefix) {
  color: #5dade2 !important;
}

/* 稀有度筛选 */
.filter-section {
  margin-bottom: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fcff 0%, #ebf4fd 100%);
  border: 1px solid rgba(174, 214, 241, 0.5);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.08);
}

.filter-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: #2874a6;
  margin-right: 12px;
  white-space: nowrap;
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.rarity-checkbox .el-checkbox__input) {
  display: none !important;
}

:deep(.rarity-checkbox .el-checkbox__label) {
  padding: 0 !important;
}

.rarity-badge-small {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 28px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.rarity-badge-small.rarity-1 { background: linear-gradient(135deg, #85929e, #5d6d7e); }
.rarity-badge-small.rarity-2 { background: linear-gradient(135deg, #58d68d, #28b463); }
.rarity-badge-small.rarity-3 { background: linear-gradient(135deg, #5dade2, #3498db); }
.rarity-badge-small.rarity-4 { background: linear-gradient(135deg, #bb8fce, #8e44ad); }

:deep(.rarity-checkbox.is-checked .rarity-badge-small) {
  border-color: white;
  box-shadow: 0 0 0 2px #3498db;
  transform: scale(1.1);
}

.rarity-badge-small:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.clear-filter-btn {
  background: rgba(52, 152, 219, 0.1) !important;
  border-color: #aed6f1 !important;
  color: #2874a6 !important;
  font-size: 12px !important;
  padding: 4px 12px !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.clear-filter-btn:hover {
  background: rgba(52, 152, 219, 0.2) !important;
  border-color: #5dade2 !important;
  transform: translateY(-1px) !important;
}

.search-stats {
  font-size: 14px;
  color: #5499c7;
  text-align: center;
  font-weight: 500;
}

.count {
  font-weight: 700;
  color: #2874a6;
  background: rgba(52, 152, 219, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
}

.filter-info {
  font-size: 12px;
  color: #85c1e9;
  margin-left: 8px;
}

/* 物品列表 */
.idlist-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.idlist-item {
  background: linear-gradient(135deg, #ffffff 0%, #fbfcfd 100%);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(174, 214, 241, 0.3);
  box-shadow: 0 4px 16px rgba(52, 152, 219, 0.08), 0 2px 8px rgba(174, 214, 241, 0.1);
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.6s ease forwards;
}

.idlist-item:nth-child(even) {
  background: linear-gradient(135deg, #ffffff 0%, #f8fcff 100%);
}

.idlist-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3498db, #85c1e9, #f8c9d4);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.idlist-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(52, 152, 219, 0.15), 0 6px 16px rgba(174, 214, 241, 0.2);
  border-color: #5dade2;
}

.idlist-item:hover::before {
  transform: scaleX(1);
}

.item-icon-wrapper {
  position: relative;
  margin-bottom: 16px;
  text-align: center;
}

.idlist-item-icon {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
  background: linear-gradient(135deg, #ebf4fd 0%, #d6eaf8 100%);
  border: 2px solid #aed6f1;
  padding: 8px;
  transition: transform 0.3s ease;
}

.idlist-item:hover .idlist-item-icon {
  transform: scale(1.1);
  border-color: #5dade2;
}

.rarity-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  border: 2px solid white;
}

.rarity-1 { background: linear-gradient(135deg, #85929e, #5d6d7e); }
.rarity-2 { background: linear-gradient(135deg, #58d68d, #28b463); }
.rarity-3 { background: linear-gradient(135deg, #5dade2, #3498db); }
.rarity-4 { background: linear-gradient(135deg, #bb8fce, #8e44ad); }

.idlist-item-info {
  text-align: center;
}

.idlist-item-name {
  font-size: 16px;
  font-weight: 600;
  color: #1b4f72;
  margin-bottom: 8px;
  line-height: 1.2;
}

.idlist-item-desc {
  font-size: 13px;
  color: #5499c7;
  margin-bottom: 12px;
  line-height: 1.4;
  height: 2.8em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.idlist-item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  margin-bottom: 8px;
}

.idlist-item-id {
  background: linear-gradient(135deg, #ebf4fd 0%, #d6eaf8 100%);
  color: #2874a6;
  padding: 4px 8px;
  border-radius: 6px;
  font-family: 'Consolas', monospace;
  font-weight: 600;
  border: 1px solid rgba(174, 214, 241, 0.5);
}

.idlist-item-category {
  background: linear-gradient(135deg, #3498db 0%, #5dade2 100%);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3);
}

.copy-hint {
  font-size: 12px;
  color: #85c1e9;
  opacity: 0;
  transition: opacity 0.3s ease;
  text-align: center;
  font-weight: 500;
}

.idlist-item:hover .copy-hint {
  opacity: 1;
  color: #5499c7;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #85c1e9;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.6;
  color: #aed6f1;
}

.empty-state p {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #5499c7;
}

.empty-state span {
  font-size: 14px;
  color: #85c1e9;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-button-bg-color: #ebf4fd;
  --el-pagination-button-color: #2874a6;
  --el-pagination-hover-color: #3498db;
  --el-pagination-hover-bg-color: #d6eaf8;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(135deg, #3498db 0%, #5dade2 100%) !important;
  color: white !important;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

/* 响应式 */
@media (max-width: 1200px) {
  .idlist-list {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .idlist-container {
    flex-direction: column;
  }
  
  .idlist-sidebar {
    width: 100%;
    margin-bottom: 20px;
  }
  
  .idlist-list {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
  
  .idlist-item {
    padding: 16px;
  }
  
  .idlist-item-icon {
    width: 60px;
    height: 60px;
  }
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.idlist-item:nth-child(1) { animation-delay: 0.1s; }
.idlist-item:nth-child(2) { animation-delay: 0.2s; }
.idlist-item:nth-child(3) { animation-delay: 0.3s; }
.idlist-item:nth-child(4) { animation-delay: 0.4s; }
.idlist-item:nth-child(5) { animation-delay: 0.5s; }

.menu-icon:hover {
  transform: scale(1.2);
  transition: transform 0.2s ease;
}
</style>