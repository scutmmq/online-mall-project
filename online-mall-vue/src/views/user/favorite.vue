<template>
    <div class="liked-products-page">
        <!-- 页面标题 -->
        <el-page-header @back="handleBack" content="我喜欢的商品" class="page-header"></el-page-header>

        <!-- 加载状态 -->
        <el-skeleton :loading="isLoading" :row="6" :loading-effect="'shine'" class="loading-container">
            <template #default>
                <!-- 空状态 -->
                <div v-if="isEmpty" class="empty-container">
                    <el-empty description="还没有喜欢的商品哦~">
                        <el-button type="primary" @click="handleBack">去逛逛</el-button>
                    </el-empty>
                </div>

                <!-- 商品列表 -->
                <div v-else class="products-grid">
                    <div class="product-card" v-for="product in likedProducts" :key="product.id"
                        @click="toProductDetail(product.id)">
                        <!-- 商品图片 -->
                        <el-image :src="product.imageUrl" :alt="product.name" class="product-img"
                            fit="cover"></el-image>

                        <!-- 商品名称 -->
                        <h3 class="product-name">{{ product.name }}</h3>

                        <!-- 价格 -->
                        <p class="product-price">¥{{ product.price.toFixed(2) }}</p>

                        <!-- 评分和商家 -->
                        <div class="product-footer">
                            <span class="product-rating">⭐ {{ product.rating }}</span>
                            <span class="product-merchant">{{ product.merchantName }}</span>
                        </div>

                        <!-- 商品状态标签 -->
                        <el-tag :type="product.isActive ? 'success' : 'danger'" class="status-tag">
                            {{ product.isActive ? '在售' : '已下架' }}
                        </el-tag>
                    </div>
                </div>
            </template>
        </el-skeleton>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
    ElPageHeader,
    ElSkeleton,
    ElEmpty,
    ElButton,
    ElImage,
    ElTag,
    ElMessage
} from 'element-plus';
import { getLikedProducts } from '@/api/product'; // 导入获取喜欢商品的接口

// 路由实例
const router = useRouter();

// 状态管理
const likedProducts = ref([]); // 喜欢的商品列表
const isLoading = ref(true); // 加载状态

// 计算属性：判断列表是否为空
// 计算属性：增加安全校验，处理可能的 null/undefined 情况
const isEmpty = computed(() => {
    // 先判断 likedProducts.value 是否存在，再检查 length
    return !likedProducts.value || likedProducts.value.length === 0;
});
// 页面加载时获取喜欢的商品
onMounted(async () => {
    await fetchLikedProducts();
});

// 获取喜欢的商品数据
const fetchLikedProducts = async () => {
    try {
        isLoading.value = true;
        const res = await getLikedProducts();
        if (res.code === 1) {
            likedProducts.value = res.data; // 保存商品列表
        } else {
            ElMessage.error('获取喜欢的商品失败：' + res.msg);
        }
    } catch (err) {
        console.error('获取喜欢的商品异常：', err);
        ElMessage.error('网络错误，请稍后重试');
    } finally {
        isLoading.value = false;
    }
};

// 返回上一页
const handleBack = () => {
    router.push('/')
};

// 跳转到商品详情页（与之前的详情页保持一致）
const toProductDetail = (productId) => {
    router.push(`/product/${productId}`);
};
</script>

<style scoped>
.liked-products-page {
    max-width: 1200px;
    margin: 20px auto;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.2);
    animation: fadeInUp 0.5s ease-out;
}

.page-header {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
}

.loading-container {
    margin-top: 20px;
}

.empty-container {
    margin: 50px 0;
    text-align: center;
}

/* 商品网格布局 */
.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 24px;
    margin-top: 20px;
}

/* 商品卡片样式 */
.product-card {
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    background: rgba(255, 255, 255, 0.7);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(5px);
}

.product-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
}

/* 商品图片 */
.product-img {
    width: 100%;
    height: 200px;
    border-radius: 8px;
    margin-bottom: 12px;
}

/* 商品名称 */
.product-name {
    font-size: 16px;
    color: #333;
    margin-bottom: 8px;
    line-height: 1.4;
    height: 40px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* 商品价格 */
.product-price {
    font-size: 18px;
    color: #ff4d4f;
    font-weight: 500;
    margin-bottom: 12px;
}

/* 商品底部信息 */
.product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #666;
}

.product-rating {
    display: flex;
    align-items: center;
}

/* 状态标签 */
.status-tag {
    position: absolute;
    top: 16px;
    right: 16px;
}

/* 动画关键帧 */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 响应式调整 */
@media (max-width: 768px) {
    .liked-products-page {
        margin: 10px auto;
        padding: 15px;
        border-radius: 8px;
    }

    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 16px;
    }

    .product-img {
        height: 160px;
    }

    .product-card {
        padding: 12px;
        border-radius: 8px;
    }
}
</style>