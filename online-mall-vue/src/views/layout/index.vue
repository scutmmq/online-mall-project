<template>
    <div class="home-container">

        <!-- 搜索框区域 -->
        <div class="search-container">
            <ElInput v-model="keyword" placeholder="请搜索商品" class="input" @keyup.enter="comeToSearch()">
                <template #prefix>
                    <el-icon>
                        <Search style="cursor: default;" />
                    </el-icon>
                </template>
                <template #suffix>
                    <ElButton type="primary" class="input-button" @click="comeToSearch()">搜索
                    </ElButton>
                </template>
            </ElInput>
        </div>

        <!-- 全部按钮 + 一级分类导航 -->
        <div class="all-and-level1">
            <div class="all-btn" @click="handleAllClick" :class="{ active: isAll }">
                全部
            </div>

            <div class="level1-nav">
                <div v-for="level1 in level1Categories" :key="level1.id" @click="handleLevel1Click(level1)"
                    :class="{ active: selectedLevel1Id === level1.id && !isAll }">
                    <img :src="level1.icon" alt="分类图标" v-if="level1.icon">
                    <span>{{ level1.name }}</span>
                </div>
            </div>
        </div>

        <!-- 二级分类导航 -->
        <div class="level2-nav" v-if="selectedLevel1Id && !isAll">
            <div v-for="level2 in level2Categories" :key="level2.id" @click="handleLevel2Click(level2)"
                :class="{ active: selectedLevel2Id === level2.id }">
                {{ level2.name }}
            </div>
        </div>

        <!-- 三级分类标签 -->
        <div class="level3-tags" v-if="selectedLevel2Id && !isAll">
            <div v-for="level3 in level3Categories" :key="level3.id" @click="handleLevel3Click(level3)"
                :class="{ active: selectedLevel3Id === level3.id }">
                {{ level3.name }}
            </div>
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

        <!-- 无数据提示 -->
        <div class="empty-tip" v-if="productList.length === 0 && isLoaded">
            暂无商品数据~
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
import { useRouter } from 'vue-router';
import { ElButton, ElInput, ElPagination } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { getProductsApi } from '@/api/product';
import { getCategoriesApi } from '@/api/category';
import router from '@/router/router';

// 搜索相关状态
const keyword = ref('');
const comeToSearch = () => {
    router.push({
        path: "/search",
        query: { keyword: keyword.value }
    });
};

// 分页相关状态
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);

// 分类和商品状态
const level1Categories = ref([]);
const level2Categories = ref([]);
const level3Categories = ref([]);
const productList = ref([]);
const isLoaded = ref(false);

// 选中状态
const selectedLevel1Id = ref(null);
const selectedLevel2Id = ref(null);
const selectedLevel3Id = ref(null);
const isAll = ref(true);

// 页面加载时获取分类和商品
onMounted(async () => {
    const level1Res = await getCategoriesApi({ level: 1 });
    if (level1Res.code === 1) {
        level1Categories.value = level1Res.data;
    }
    await fetchProducts();
});

// 监听分类和分页变化，重新加载商品
watch([selectedLevel1Id, selectedLevel2Id, selectedLevel3Id, isAll, page, pageSize], async () => {
    await fetchProducts();
}, { immediate: false });

// 获取商品列表
const fetchProducts = async () => {
    isLoaded.value = false;
    let categoryId = null;

    if (!isAll.value) {
        if (selectedLevel3Id.value) {
            categoryId = selectedLevel3Id.value;
        } else if (selectedLevel2Id.value) {
            categoryId = selectedLevel2Id.value;
        } else if (selectedLevel1Id.value) {
            categoryId = selectedLevel1Id.value;
        }
    }

    const productRes = await getProductsApi({
        categoryId,
        isActive: 1,
        page: page.value,
        pageSize: pageSize.value
    });

    if (productRes.code === 1) {
        productList.value = productRes.data.rows;
        total.value = productRes.data.total;
    }
    isLoaded.value = true;
};

// 一级分类点击事件
const handleLevel1Click = async (level1) => {
    isAll.value = false;
    selectedLevel1Id.value = level1.id;
    selectedLevel2Id.value = null;
    selectedLevel3Id.value = null;
    page.value = 1;

    const level2Res = await getCategoriesApi({ parentId: level1.id, level: 2 });
    level2Categories.value = level2Res.code === 1 ? level2Res.data : [];
};

// 二级分类点击事件
const handleLevel2Click = async (level2) => {
    selectedLevel2Id.value = level2.id;
    selectedLevel3Id.value = null;
    page.value = 1;

    const level3Res = await getCategoriesApi({ parentId: level2.id, level: 3 });
    level3Categories.value = level3Res.code === 1 ? level3Res.data : [];
};

// 三级分类点击事件
const handleLevel3Click = (level3) => {
    selectedLevel3Id.value = level3.id;
    page.value = 1;
};

// 全部按钮点击事件
const handleAllClick = () => {
    isAll.value = true;
    selectedLevel1Id.value = null;
    selectedLevel2Id.value = null;
    selectedLevel3Id.value = null;
    level2Categories.value = [];
    level3Categories.value = [];
    page.value = 1;
};

// 分页事件
const handleSizeChange = (newSize) => {
    pageSize.value = newSize;
};
const handleCurrentChange = (newPage) => {
    page.value = newPage;
};

// 商品详情跳转
const goToDetail = (productId) => {
    router.push(`/product/${productId}`);
};
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  /* 添加背景和阴影效果，类似于App.vue的整体风格 */
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  margin-top: 20px;
  animation: fadeInUp 0.5s ease-out;
  position: relative;
  overflow: hidden;
}

.home-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  z-index: -1;
}

/* 搜索框样式 */
.search-container {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  width: 100%;
  /* 添加背景和圆角 */
  background: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  animation: slideInDown 0.5s ease-out;
}

.input {
  width: 800px;
  height: 50px;
  /* 增加圆角和阴影 */
  border-radius: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  transition: all 0.3s;
}

.input:focus-within {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  border-color: rgba(102, 126, 234, 0.5);
  transform: translateY(-2px);
}

.input-button {
  height: 100%;
  margin-right: -10px;
  width: 80px;
  /* 圆角按钮 */
  border-radius: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 500;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.input-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.input-button:hover::before {
  transform: translateX(100%);
}

.input-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.input :deep(.el-input__suffix) {
  padding-right: 0;
}

.input :deep(.el-input__wrapper) {
  cursor: default;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.8);
}

.input :deep(.el-input__inner) {
  background: transparent;
  border: none;
  font-size: 16px;
  color: #333;
  padding-left: 20px;
}

.input :deep(.el-input__inner)::placeholder {
  color: #999;
  font-style: italic;
}

/* 分类样式 */
.all-and-level1 {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  /* 添加背景和圆角 */
  background: rgba(255, 255, 255, 0.8);
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  animation: slideInLeft 0.5s ease-out;
  position: relative;
  overflow: hidden;
}

.all-and-level1::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.all-btn {
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  /* 使用渐变背景 */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

.all-btn.active {
  background-color: #1890ff;
  color: white;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  transform: translateY(-2px);
}

.level1-nav {
  display: flex;
  gap: 5px;
  align-items: center;
  /* 添加横向滚动 */
  overflow-x: auto;
  padding: 5px 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(102, 126, 234, 0.5) rgba(255, 255, 255, 0.5);
}

/* 自定义滚动条样式 */
.level1-nav::-webkit-scrollbar {
  height: 6px;
}

.level1-nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 3px;
}

.level1-nav::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.5);
  border-radius: 3px;
}

.level1-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.8);
}

.level1-nav > div {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  /* 使用柔和的背景色 */
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  flex-shrink: 0;
}

.level1-nav > div::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.level1-nav > div:hover::before {
  transform: translateX(100%);
}

.level1-nav > div:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.level1-nav > div.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.level1-nav img {
  width: 24px;
  height: 24px;
}

.level2-nav {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 10px 0;
  /* 添加横向滚动 */
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(24, 144, 255, 0.5) rgba(255, 255, 255, 0.5);
  /* 添加背景和圆角 */
  background: rgba(255, 255, 255, 0.8);
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  animation: slideInRight 0.5s ease-out;
}

/* 自定义滚动条样式 */
.level2-nav::-webkit-scrollbar {
  height: 6px;
}

.level2-nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 3px;
}

.level2-nav::-webkit-scrollbar-thumb {
  background: rgba(24, 144, 255, 0.5);
  border-radius: 3px;
}

.level2-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(24, 144, 255, 0.8);
}

.level2-nav > div {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  /* 添加悬停效果 */
  background: rgba(255, 255, 255, 0.7);
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  flex-shrink: 0;
}

.level2-nav > div::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.level2-nav > div:hover::before {
  transform: translateX(100%);
}

.level2-nav > div:hover {
  border-color: #1890ff;
  background-color: rgba(24, 144, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.level2-nav > div.active {
  border-color: #1890ff;
  color: #1890ff;
  background-color: rgba(24, 144, 255, 0.1);
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

.level3-tags {
  display: flex;
  flex-wrap: nowrap;
  gap: 12px;
  margin-bottom: 20px;
  /* 添加横向滚动 */
  overflow-x: auto;
  padding: 10px 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(102, 126, 234, 0.5) rgba(255, 255, 255, 0.5);
  /* 添加背景和圆角 */
  background: rgba(255, 255, 255, 0.8);
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  animation: zoomIn 0.5s ease-out;
}

/* 自定义滚动条样式 */
.level3-tags::-webkit-scrollbar {
  height: 6px;
}

.level3-tags::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 3px;
}

.level3-tags::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.5);
  border-radius: 3px;
}

.level3-tags::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.8);
}

.level3-tags > div {
  padding: 4px 12px;
  background-color: #f5f5f5;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  /* 添加悬停效果 */
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  flex-shrink: 0;
}

.level3-tags > div::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.level3-tags > div:hover::before {
  transform: translateX(100%);
}

.level3-tags > div:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.level3-tags > div.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 商品列表样式 */
.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
  margin-bottom: 40px;
}

.product-item {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  /* 添加背景和阴影 */
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.5s ease-out;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(5px);
}

.product-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transform: scaleX(0);
  transition: transform 0.3s ease;
  transform-origin: left;
}

.product-item:hover::before {
  transform: scaleX(1);
}

.product-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  /* 添加渐变边框效果 */
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.product-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
  /* 添加阴影 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  position: relative;
}

.product-img::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.product-img:hover {
  transform: scale(1.02);
}

.product-img:hover::after {
  opacity: 1;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  /* 统一调整信息间距 */
}

.product-name {
  font-size: 16px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
  font-weight: 500;
  position: relative;
}

.product-name::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.product-item:hover .product-name::after {
  width: 100%;
}

.product-price {
  font-size: 18px;
  color: #ff4d4f;
  font-weight: 600;
  margin: 0;
  /* 添加背景 */
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
  position: relative;
}

.product-price::before {
  content: '￥';
  margin-right: 2px;
}

/* 新增商家名称样式 */
.product-merchant {
  font-size: 13px;
  color: #666;
  margin: 0;
  display: flex;
  align-items: center;
  /* 添加背景 */
  background: rgba(102, 126, 234, 0.1);
  padding: 4px 8px;
  border-radius: 8px;
  width: fit-content;
  transition: all 0.3s;
}

.product-merchant:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
}

.product-merchant::before {
  content: "🏠";
  margin-right: 4px;
}

.product-category {
  font-size: 14px;
  color: #999;
  margin: 0;
  /* 添加背景 */
  background: rgba(24, 144, 255, 0.1);
  padding: 4px 8px;
  border-radius: 8px;
  width: fit-content;
  transition: all 0.3s;
}

.product-category:hover {
  background: rgba(24, 144, 255, 0.2);
  transform: translateY(-1px);
}

.product-rating {
  font-size: 14px;
  color: #faad14;
  margin: 0;
  display: flex;
  align-items: center;
  /* 添加背景 */
  background: rgba(250, 173, 20, 0.1);
  padding: 4px 8px;
  border-radius: 8px;
  width: fit-content;
  transition: all 0.3s;
}

.product-rating:hover {
  background: rgba(250, 173, 20, 0.2);
  transform: translateY(-1px);
}

.product-rating span {
  color: #999;
  margin-left: 4px;
  font-size: 12px;
}

.empty-tip {
  text-align: center;
  padding: 50px;
  color: #999;
  font-size: 16px;
  /* 添加背景和圆角 */
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  animation: bounceIn 0.5s ease-out;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding: 20px 0;
  /* 添加背景和圆角 */
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  animation: slideInUp 0.5s ease-out;
}

.pagination-container :deep(.el-pagination) {
  display: flex;
  align-items: center;
  gap: 10px;
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

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .home-container {
    padding: 10px;
  }
  
  .search-container {
    padding: 10px;
  }
  
  .input {
    width: 100%;
  }
  
  .all-and-level1 {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .level1-nav {
    flex-wrap: nowrap;
    width: 100%;
  }
  
  .level2-nav, .level3-tags {
    padding: 10px;
    flex-wrap: nowrap;
  }
  
  .product-list {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
  }
  
  .product-item {
    padding: 12px;
  }
  
  .product-img {
    height: 150px;
  }
}

/* 小屏幕设备优化 */
@media (max-width: 480px) {
  .level1-nav > div,
  .level2-nav > div,
  .level3-tags > div {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .all-btn {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .product-list {
    grid-template-columns: 1fr;
  }
}
</style>
