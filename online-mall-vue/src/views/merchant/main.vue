<template>
    <div class="merchant-home">
        <!-- 加载状态 -->
        <el-skeleton v-if="loading" :rows="6" style="width: 100%"></el-skeleton>

        <!-- 错误提示 -->
        <el-alert v-if="error" title="数据加载失败" type="error" show-icon :description="errorMsg"></el-alert>

        <!-- 商家信息卡片 -->
        <div v-if="merchant" class="merchant-card">
            <!-- 头部：logo + 基本信息 -->
            <div class="header">
                <img :src="merchant.logoUrl" alt="商家logo" class="logo" @error="handleLogoError">
                <div class="base-info">
                    <h1 class="name">{{ merchant.name }}</h1>
                    <div class="tags">
                        <el-tag :type="statusType">{{ merchant.status }}</el-tag>
                        <el-tag type="info">{{ merchant.merchantType }}商家</el-tag>
                        <el-tag v-if="merchant.isActive" type="success">已激活</el-tag>
                        <el-tag v-else type="warning">未激活</el-tag>
                    </div>
                </div>
            </div>

            <!-- 主体：详细信息 -->
            <div class="details">
                <el-row :gutter="20">
                    <!-- 左侧：基本信息 -->
                    <el-col :span="16">
                        <el-card>
                            <template #header>商家信息</template>
                            <el-descriptions column="1" border>
                                <el-descriptions-item label="商家描述">{{ merchant.description || '暂无描述'
                                }}</el-descriptions-item>
                                <el-descriptions-item label="联系人">{{ merchant.contactPerson }}</el-descriptions-item>
                                <el-descriptions-item label="联系电话">{{ merchant.contactPhone }}</el-descriptions-item>
                                <el-descriptions-item label="邮箱">{{ merchant.email }}</el-descriptions-item>
                                <el-descriptions-item label="地址">{{ merchant.address }}</el-descriptions-item>
                                <el-descriptions-item label="营业执照">{{ merchant.businessLicense }}</el-descriptions-item>
                                <el-descriptions-item label="创建时间">{{ formatTime(merchant.createdTime)
                                }}</el-descriptions-item>
                                <el-descriptions-item label="更新时间">{{ formatTime(merchant.updatedTime)
                                }}</el-descriptions-item>
                            </el-descriptions>
                        </el-card>
                    </el-col>

                    <!-- 右侧：经营数据 -->
                    <el-col :span="8">
                        <el-card>
                            <template #header>经营数据</template>
                            <div class="stats">
                                <div class="stat-item">
                                    <div class="label">店铺评分</div>
                                    <div class="value">
                                        <!-- 修复：正确显示评分星星 -->
                                        <el-rate 
                                            :model-value="Math.round(merchant.rating * 2) / 2" 
                                            disabled 
                                            :max="5" 
                                            allow-half
                                            void-color="#eee"
                                            void-icon="Star"
                                        ></el-rate>
                                        <span class="score">{{ merchant.rating.toFixed(1) }}</span>
                                        <!-- 显示评分数量 -->
                                        <span class="rating-count">({{ merchant.ratingCount || 0 }}条评价)</span>
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <div class="label">总销量</div>
                                    <div class="value">{{ merchant.totalSales }}</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getMerchantOfMe } from '@/api/merchant'; // 导入接口

// 状态管理
const loading = ref(true);
const error = ref(false);
const errorMsg = ref('');
const merchant = ref(null);

// 处理logo加载失败
const handleLogoError = (e) => {
    e.target.src = '/images/default-logo.png'; // 替换为默认图片
};

// 格式化时间
const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 根据状态获取标签类型
const statusType = computed(() => {
    switch (merchant.value?.status) {
        case '待审核': return 'warning';
        case '已通过': return 'success';
        case '已拒绝': return 'danger';
        default: return 'info';
    }
});

// 页面加载时获取数据
onMounted(async () => {
    try {
        loading.value = true;
        const res = await getMerchantOfMe();
        if (res.code === 1) {
            merchant.value = res.data;
        } else {
            error.value = true;
            errorMsg.value = res.msg || '获取商家信息失败';
        }
    } catch (err) {
        error.value = true;
        errorMsg.value = '网络错误，请稍后重试';
        console.error('获取商家信息失败：', err);
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
.merchant-home {
    padding: 20px;
}

.merchant-card {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.header {
    display: flex;
    align-items: center;
    padding: 20px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #eee;
}

.logo {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    object-fit: cover;
    margin-right: 20px;
    border: 1px solid #eee;
}

.base-info .name {
    margin: 0 0 10px 0;
    font-size: 24px;
    color: #333;
}

.tags {
    display: flex;
    gap: 10px;
}

.details {
    padding: 20px;
}

.stats {
    padding: 10px 0;
}

.stat-item {
    margin-bottom: 20px;
}

.stat-item .label {
    color: #666;
    margin-bottom: 8px;
    font-size: 14px;
}

.stat-item .value {
    font-size: 20px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.score {
    color: #f59e0b;
}

/* 评分数量样式 */
.rating-count {
    color: #606266;
    font-size: 14px;
    font-weight: normal;
}
</style>