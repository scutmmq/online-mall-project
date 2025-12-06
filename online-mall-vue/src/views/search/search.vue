<template>
    <div class="search-container">
        <!-- 搜索框区域（复用首页逻辑，保留关键词） -->
        <div class="search-box">
            <ElInput v-model="keyword" placeholder="请搜索商品" class="input" @keyup.enter="handleSearch()" autofocus>
                <template #prefix>
                    <el-icon>
                        <Search style="cursor: default;" />
                    </el-icon>
                </template>
                <template #suffix>
                    <ElButton type="primary" class="input-button" @click="handleSearch()">
                        搜索
                    </ElButton>
                </template>
            </ElInput>
        </div>

        <!-- 搜索结果提示 -->
        <div class="search-tip" v-if="isSearched">
            为您找到关于「{{ keyword }}」的 {{ total }} 个商品
        </div>

        <!-- 商品列表 -->
        <div class="product-list">
            <div class="product-item" v-for="product in productList" :key="product.id" @click="goToDetail(product.id)">
                <img :src="product.imageUrl" alt="商品图片" class="product-img">
                <div class="product-info">
                    <h3 class="product-name">{{ product.name }}</h3>
                    <p class="product-price">¥{{ product.price.toFixed(2) }}</p>
                    <!-- 新增商家名称展示 -->
                    <p class="product-merchant">商家：{{ product.merchantName || '未知商家' }}</p>
                    <p class="product-category">{{ product.categoryName }}</p>
                    <p class="product-rating">⭐ {{ product.rating }} ({{ product.ratingCount || 0 }}条评价)</p>
                </div>
            </div>
        </div>

        <!-- 无结果提示 -->
        <div class="empty-tip" v-if="productList.length === 0 && isLoaded && isSearched">
            没有找到关于「{{ keyword }}」的商品，请尝试其他关键词
        </div>

        <!-- 分页组件 -->
        <div class="pagination-container" v-if="total > 0 && isLoaded">
            <ElPagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[10, 20, 30, 50]"
                :total="total" layout="total, sizes, prev, pager, next, jumper" :hide-on-single-page="false"
                @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElButton, ElInput, ElPagination } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { getProductsApi } from '@/api/product';

// 路由相关
const route = useRoute();
const router = useRouter();

// 搜索关键词（从路由参数获取初始值）
const keyword = ref(route.query.keyword || '');

// 分页相关
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);

// 商品列表状态
const productList = ref([]);
const isLoaded = ref(false);
const isSearched = ref(!!keyword.value); // 是否执行过搜索

// 页面加载时，如果有关键词则自动搜索
onMounted(async () => {
    if (keyword.value) {
        await fetchProducts();
    }
});

// 监听关键词变化（手动搜索时触发）
watch(keyword, (newVal) => {
    // 输入框为空时清空列表
    if (!newVal && isSearched.value) {
        productList.value = [];
        total.value = 0;
    }
});

// 监听分页变化，重新加载商品
watch([page, pageSize], async () => {
    if (isSearched.value) {
        await fetchProducts();
    }
});

// 执行搜索
const handleSearch = async () => {
    if (!keyword.value.trim()) return; // 空关键词不搜索

    // 更新路由参数（便于刷新和分享）
    router.push({
        path: '/search',
        query: { keyword: keyword.value.trim() }
    });

    page.value = 1; // 重置到第一页
    isSearched.value = true;
    await fetchProducts();
};

// 获取搜索结果
const fetchProducts = async () => {
    isLoaded.value = false;
    try {
        const res = await getProductsApi({
            keyword: keyword.value.trim(), // 传递搜索关键词
            isActive: 1,
            page: page.value,
            pageSize: pageSize.value
        });

        if (res.code === 1) {
            productList.value = res.data.rows;
            total.value = res.data.total;
        }
    } catch (error) {
        console.error('搜索商品失败:', error);
    } finally {
        isLoaded.value = true;
    }
};

// 分页事件
const handleSizeChange = (newSize) => {
    pageSize.value = newSize;
};

const handleCurrentChange = (newPage) => {
    page.value = newPage;
};

// 跳转到商品详情
const goToDetail = (productId) => {
    router.push(`/product/${productId}`);
};
</script>

<style scoped>
.search-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

/* 搜索框样式 */
.search-box {
    display: flex;
    justify-content: center;
    margin: 20px 0 30px;
    width: 100%;
}

.input {
    width: 800px;
    height: 50px;
}

.input-button {
    height: 100%;
    margin-right: -10px;
    width: 80px;
}

.input :deep(.el-input__suffix) {
    padding-right: 0;
}

/* 搜索提示 */
.search-tip {
    margin: 0 0 20px 10px;
    color: #666;
    font-size: 14px;
}

/* 商品列表样式（复用首页） */
.product-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-top: 20px;
    margin-bottom: 40px;
}

.product-item {
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
}

.product-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.product-img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 4px;
    margin-bottom: 12px;
}

.product-name {
    font-size: 16px;
    margin-bottom: 8px;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.product-price {
    font-size: 18px;
    color: #ff4d4f;
    margin-bottom: 4px;
    font-weight: 600;
}

.product-category {
    font-size: 14px;
    color: #999;
    margin-bottom: 4px;
}

.product-rating {
    font-size: 14px;
    color: #faad14;
}

/* 无结果提示 */
.empty-tip {
    text-align: center;
    padding: 50px;
    color: #999;
    font-size: 16px;
}

/* 分页样式 */
.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 30px;
    padding: 20px 0;
}

.pagination-container :deep(.el-pagination) {
    display: flex;
    align-items: center;
    gap: 10px;
}

/* 新增商家名称样式 */
.product-merchant {
    font-size: 13px;
    color: #666;
    margin: 0;
    display: flex;
    align-items: center;
}

.product-merchant::before {
    content: "🏠";
    margin-right: 4px;
}
</style>