<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal" :class="{ 'modal-enter': showAnimation, 'modal-exit': !showAnimation }">
      <div class="modal-header">
        <h2 class="header-title">
          <span v-if="announcement.Title">公告 - {{ announcement.Title }}</span>
          <span v-else>公告</span>
        </h2>
        <div class="header-line"></div>
      </div>
      <div class="modal-content">
        <div v-if="announcement.Time" class="announcement-time">📅 {{ announcement.Time }}</div>
        <!-- 当 Type 为 "html" 时，用 iframe 加载 URL 指定的内容 -->
        <div v-if="announcement.Type === 'html'" class="announcement-body">
          <iframe
            :src="announcement.Url"
            frameborder="0"
            style="width: 100%; height: 300px"
          ></iframe>
        </div>
        <!-- 否则展示 Content 字段 -->
        <div
          v-else-if="announcement.Content"
          class="announcement-body"
          v-html="announcement.Content"
        ></div>
      </div>
      <div class="modal-footer">
        <div class="footer-line"></div>
        <button class="ack-button" @click="acknowledge">收到啦</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnnouncementModal',
  data() {
    return {
      show: false,
      showAnimation: false,
      // 初始公告数据结构，字段名称与 JSON 对应
      announcement: { KitanoID: '', Time: '', Url: '', Title: '', Content: '', Type: '' },
    }
  },
  methods: {
    open() {
      // 先拉取公告数据，再判断是否需要展示
      this.fetchAnnouncement()
    },
    close() {
      this.showAnimation = false
      setTimeout(() => (this.show = false), 400) // 动画结束后隐藏
    },
    acknowledge() {
      // 记录当前公告的 KitanoID，后续不重复展示
      localStorage.setItem('announcementLastSeen', this.announcement.KitanoID)
      this.close()
    },
    fetchAnnouncement() {
      fetch('/Announcement.json')
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return response.json()
        })
        .then((data) => {
          if (Array.isArray(data)) {
            data.sort((a, b) => b.KitanoID - a.KitanoID)
            const latest = data[0]
            this.announcement = {
              KitanoID: latest.KitanoID,
              Time: latest.Time,
              Url: latest.Url,
              Title: latest.Title,
              Content: latest.Content || '',
              Type: latest.Type || '',
            }
          } else {
            // 如果返回的是单个公告对象，同样做字段转换
            this.announcement = {
              KitanoID: data.KitanoID,
              Time: data.Time,
              Url: data.Url,
              Title: data.Title,
              Content: data.Content || '',
              Type: data.Type || '',
            }
          }
          // 若 localStorage 中已存在当前公告的 KitanoID，则不再展示
          const lastSeen = localStorage.getItem('announcementLastSeen')
          if (lastSeen && lastSeen === String(this.announcement.KitanoID)) return

          // 否则展示公告
          this.show = true
          this.showAnimation = true
        })
        .catch((error) => {
          console.error('获取公告数据出错:', error)
          // 如果获取公告失败，不显示公告而不是报错
        })
    },
  },
  mounted() {
    this.open()
  },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(24px) saturate(140%);
  border-radius: 16px;
  box-shadow: 0 12px 40px -12px rgba(0, 0, 0, 0.12);
  max-width: 500px;
  width: 90%;
  overflow: hidden;
  transform-origin: center;
  transition:
    transform 0.4s ease,
    opacity 0.4s ease;
}

.modal-enter {
  transform: scaleY(0);
  opacity: 0;
  animation: openModal 0.4s forwards;
}

.modal-exit {
  animation: closeModal 0.4s forwards;
}

@keyframes openModal {
  from {
    transform: scaleY(0);
    opacity: 0;
  }
  to {
    transform: scaleY(1);
    opacity: 1;
  }
}

@keyframes closeModal {
  from {
    transform: scaleY(1);
    opacity: 1;
  }
  to {
    transform: scaleY(0);
    opacity: 0;
  }
}

.modal-header {
  text-align: center;
  padding: 16px 8px 8px;
}
.header-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
  position: relative;
}
.header-line {
  height: 3px;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  width: 60px;
  margin: 0 auto 8px;
  border-radius: 2px;
}

.modal-content {
  padding: 16px;
  text-align: center;
  font-size: 16px;
  color: #333;
}

.announcement-time {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.announcement-body {
  text-align: center;
  margin-bottom: 16px;
  line-height: 1.6;
}

.modal-footer {
  text-align: center;
  padding: 12px 0 16px;
}
.footer-line {
  height: 1px;
  background-color: #ddd;
  margin-bottom: 8px;
}
.ack-button {
  padding: 12px 24px;
  border: none;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.ack-button:hover {
  transform: translateY(-2px);
}
</style>
