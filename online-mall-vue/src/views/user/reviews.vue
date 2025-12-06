<template>
  <div class="user-reviews">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>我的评价</h2>
      <p>查看和管理您的商品评价</p>
    </div>

    <!-- 评价列表 -->
    <div class="reviews-container" v-if="reviews.length > 0">
      <el-card 
        class="review-card" 
        v-for="review in reviews" 
        :key="review.id"
        shadow="hover"
      >
        <div class="review-content">
          <!-- 商品信息 -->
          <div class="product-info" @click="goToProduct(review.product.id)">
            <el-image
              :src="review.product.imageUrl"
              class="product-image"
              fit="cover"
              lazy
            ></el-image>
            <div class="product-details">
              <h3 class="product-name">{{ review.product.name }}</h3>
              <p class="review-time">{{ formatDate(review.reviewTime) }}</p>
            </div>
          </div>

          <!-- 评价详情 -->
          <div class="review-details">
            <!-- 用户信息 -->
            <div class="user-info">
              <el-image
                :src="review.user.avatarUrl"
                class="user-avatar"
                fit="cover"
                lazy
              ></el-image>
              <div class="user-details">
                <h4 class="user-name">{{ review.user.nickName }}</h4>
              </div>
            </div>

            <!-- 评分 -->
            <div class="rating">
              <span 
                v-for="i in 5" 
                :key="i" 
                class="star"
                :class="getStarClass(i, review.rating)"
              >
                ★
              </span>
              <span class="rating-text">{{ review.rating }}分</span>
            </div>

            <!-- 评价内容 -->
            <div class="review-text">
              <p>{{ review.content }}</p>
            </div>

            <!-- 评价图片 -->
            <div class="review-images" v-if="review.image">
              <el-image
                v-for="(img, index) in review.image.split(',')"
                :key="index"
                :src="img.trim()"
                class="review-image"
                fit="cover"
                :preview-src-list="review.image.split(',').map(url => url.trim())"
                :initial-index="index"
                :preview-teleported="true"
                hide-on-click-modal
              ></el-image>
            </div>
            
            <!-- 商家回复 -->
            <div class="merchant-reply" v-if="review.merchantReply">
              <div class="reply-header">
                <img :src="review.merchantLogoUrl || defaultMerchantLogo" :alt="review.merchantName || '商家'" class="merchant-logo" @error="handleImageError">
                <span class="merchant-name">{{ review.merchantName || '未知商家' }}</span>
                <span class="reply-time">{{ formatDate(review.replyTime) }}</span>
              </div>
              <div class="reply-content">
                {{ review.merchantReply }}
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <el-empty description="暂无评价记录">
        <el-button type="primary" @click="$router.push('/home')">去购物</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserReviewsApi } from '@/api/product_review'

const router = useRouter()
const reviews = ref([])
const defaultMerchantLogo = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')

// 获取用户评价列表
const fetchUserReviews = async () => {
  try {
    const res = await getUserReviewsApi()
    if (res.code === 1) {
      reviews.value = res.data || []
      // 验证数据结构
      reviews.value.forEach(review => {
        if (review.merchantReply) {
          // 确保必要的字段存在
          if (!review.merchantName) {
            console.warn('缺少merchantName字段:', review)
          }
          if (!review.merchantLogoUrl) {
            console.warn('缺少merchantLogoUrl字段:', review)
          }
        }
      })
    } else {
      ElMessage.error(res.msg || '获取评价列表失败')
    }
  } catch (error) {
    ElMessage.error('获取评价列表失败')
    console.error(error)
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取星级评分的类名
const getStarClass = (index, rating) => {
  // 计算当前星星应该显示的状态
  const floorRating = Math.floor(rating)
  const decimalPart = rating - floorRating
  
  if (index <= floorRating) {
    // 完全填充的星星
    return 'filled'
  } else if (index === floorRating + 1 && decimalPart > 0) {
    // 半填充的星星（只要有小数部分就显示半星）
    return 'half-filled'
  } else {
    // 空星星
    return ''
  }
}

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.src = defaultMerchantLogo.value
}

// 跳转到商品详情页
const goToProduct = (productId) => {
  router.push(`/product/${productId}`)
}

// 页面加载时获取数据
onMounted(() => {
  fetchUserReviews()
})
</script>

<style scoped>
.user-reviews {
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.page-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.page-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.page-header p {
  color: #666;
  font-size: 14px;
}

.review-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.review-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.review-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.product-info:hover {
  background: rgba(102, 126, 234, 0.1);
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.review-time {
  font-size: 14px;
  color: #999;
}

.review-details {
  padding: 0 15px 15px;
}

/* 新增：用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 8px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #eee;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.rating {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.star {
  color: #ddd;
  font-size: 18px;
  margin-right: 2px;
}

.star.filled {
  color: #faad14;
}

.star.half-filled {
  color: #faad14;
  position: relative;
}

.star.half-filled::before {
  content: "★";
  color: #ddd;
  position: absolute;
  left: 0;
  top: 0;
  overflow: hidden;
  width: 50%;
}

.rating-text {
  margin-left: 8px;
  font-size: 14px;
  color: #666;
}

.review-text p {
  font-size: 15px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 15px;
}

.review-images {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.review-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
  border: 1px solid #eee;
}

.review-image:hover {
  transform: scale(1.05);
}

/* 新增：商家回复样式 */
.merchant-reply {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #1890ff;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.merchant-logo {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #eee;
}

.merchant-name {
  font-weight: 500;
  color: #333;
}

.reply-time {
  font-size: 12px;
  color: #999;
}

.reply-content {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.empty-state {
  padding: 50px 0;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-reviews {
    padding: 15px;
  }
  
  .product-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .product-image {
    width: 100%;
    height: 150px;
  }
  
  .review-image {
    width: 80px;
    height: 80px;
  }
}
</style>