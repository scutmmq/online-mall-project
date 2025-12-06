<template>
  <div class="merchant-reviews">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>顾客评价</h2>
      <p>查看和回复顾客对您商品的评价</p>
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
          <!-- 顾客信息和商品信息 -->
          <div class="customer-product-info">
            <div class="customer-info">
              <el-avatar :src="review.user.avatarUrl || defaultAvatar" size="small"></el-avatar>
              <span class="customer-name">{{ review.user.nickName }}</span>
              <span class="review-time">{{ formatDate(review.reviewTime) }}</span>
            </div>
            
            <div class="product-info" @click="goToProduct(review.product.id)">
              <el-image
                :src="review.product.imageUrl"
                class="product-image"
                fit="cover"
                lazy
              ></el-image>
              <div class="product-details">
                <h3 class="product-name">{{ review.product.name }}</h3>
              </div>
            </div>
          </div>

          <!-- 评价详情 -->
          <div class="review-details">
            <!-- 评分 -->
            <div class="rating">
              <!-- 修复：正确显示评分星星 -->
              <el-rate 
                :model-value="review.rating" 
                disabled
                :max="5"
                void-color="#eee"
                void-icon="Star"
              ></el-rate>
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
                :src="img"
                class="review-image"
                fit="cover"
                :preview-src-list="review.image.split(',')"
                :initial-index="index"
                hide-on-click-modal
              ></el-image>
            </div>

            <!-- 商家回复 -->
            <div class="merchant-reply" v-if="review.merchantReply">
              <div class="reply-header">
                <el-tag type="success" size="small">我</el-tag>
                <span class="reply-time">{{ formatDate(review.replyTime) }}</span>
              </div>
              <div class="reply-content">
                {{ review.merchantReply }}
              </div>
            </div>

            <!-- 回复输入框 -->
            <div class="reply-input" v-else>
              <el-button 
                type="primary" 
                size="small" 
                @click="openReplyDialog(review)"
                plain
              >
                回复评价
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <el-empty description="暂无顾客评价">
        <el-button type="primary" @click="$router.push('/merchant/products')">查看商品</el-button>
      </el-empty>
    </div>

    <!-- 回复对话框 -->
    <el-dialog
      v-model="replyDialogVisible"
      title="回复顾客评价"
      width="500px"
      :before-close="handleReplyDialogClose"
      :modal-append-to-body="false"
      :append-to-body="true"
      center
      top="15vh"
      modal-class="centered-dialog"
    >
      <el-form :model="replyForm" ref="replyFormRef">
        <el-form-item
          prop="merchantReply"
          :rules="[{ required: true, message: '请输入回复内容', trigger: 'blur' }]"
        >
          <el-input
            v-model="replyForm.merchantReply"
            type="textarea"
            :rows="4"
            placeholder="请输入您的回复..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleReplyDialogClose">取消</el-button>
          <el-button 
            type="primary" 
            @click="submitReply"
            :loading="isReplyLoading"
          >
            确定回复
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMerchantReviewsApi, replyReviewApi } from '@/api/product_review'

const router = useRouter()
const reviews = ref([])
const defaultAvatar = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')

// 回复对话框相关
const replyDialogVisible = ref(false)
const replyForm = ref({
  reviewId: null,
  merchantReply: ''
})
const replyFormRef = ref(null)
const isReplyLoading = ref(false)
const currentReplyReview = ref(null)

// 获取商家评价列表
const fetchMerchantReviews = async () => {
  try {
    const res = await getMerchantReviewsApi()
    if (res.code === 1) {
      reviews.value = res.data || []
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

// 跳转到商品详情页
const goToProduct = (productId) => {
  // 在新窗口打开商品详情页
  window.open(`/product/${productId}`, '_blank')
}

// 打开回复对话框
const openReplyDialog = (review) => {
  currentReplyReview.value = review
  replyForm.value.reviewId = review.id
  replyForm.value.merchantReply = ''
  replyDialogVisible.value = true
}

// 关闭回复对话框
const handleReplyDialogClose = () => {
  ElMessageBox.confirm('确定要取消回复吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    replyDialogVisible.value = false
    replyForm.value = {
      reviewId: null,
      merchantReply: ''
    }
    currentReplyReview.value = null
  }).catch(() => {
    // 取消关闭
  })
}

// 提交回复
const submitReply = async () => {
  if (!replyFormRef.value) return
  
  await replyFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    isReplyLoading.value = true
    try {
      const res = await replyReviewApi(replyForm.value)
      if (res.code === 1) {
        ElMessage.success('回复成功')
        replyDialogVisible.value = false
        
        // 更新本地数据
        const reviewIndex = reviews.value.findIndex(r => r.id === replyForm.value.reviewId)
        if (reviewIndex !== -1) {
          reviews.value[reviewIndex].merchantReply = replyForm.value.merchantReply
          reviews.value[reviewIndex].replyTime = new Date().toISOString()
        }
        
        // 重置表单
        replyForm.value = {
          reviewId: null,
          merchantReply: ''
        }
        currentReplyReview.value = null
      } else {
        ElMessage.error(res.msg || '回复失败')
      }
    } catch (error) {
      ElMessage.error('回复失败')
      console.error(error)
    } finally {
      isReplyLoading.value = false
    }
  })
}

// 页面加载时获取数据
onMounted(() => {
  fetchMerchantReviews()
})
</script>

<style scoped>
.merchant-reviews {
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

.customer-product-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.customer-name {
  font-weight: 500;
  color: #333;
}

.review-time {
  font-size: 12px;
  color: #999;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #eee;
}

.product-info:hover {
  background: rgba(102, 126, 234, 0.1);
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  border: 1px solid #eee;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.review-details {
  padding: 0 15px 15px;
}

.rating {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
}

.rating-text {
  font-size: 14px;
  color: #666;
}

.review-text p {
  font-size: 15px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 15px;
  white-space: pre-wrap;
}

.review-images {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.review-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
  border: 1px solid #eee;
}

.review-image:hover {
  transform: scale(1.05);
}

.merchant-reply {
  margin-top: 15px;
  padding: 15px;
  background: rgba(24, 144, 255, 0.05);
  border-radius: 8px;
  border-left: 3px solid #1890ff;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.reply-time {
  font-size: 12px;
  color: #999;
}

.reply-content {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  white-space: pre-wrap;
}

.reply-input {
  margin-top: 15px;
}

.empty-state {
  padding: 50px 0;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .merchant-reviews {
    padding: 15px;
  }
  
  .product-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .product-image {
    width: 100%;
    height: 120px;
  }
  
  .review-image {
    width: 70px;
    height: 70px;
  }
}
</style>