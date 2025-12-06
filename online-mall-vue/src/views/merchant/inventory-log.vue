<template>
    <div class="inventory-log-container">
        <el-card>
            <div slot="header" class="card-header">
                <h2>库存变更日志</h2>
            </div>

            <!-- 筛选条件区域 -->
            <el-form :model="searchForm" inline class="search-form">
                <el-form-item label="变更类型">
                    <el-select v-model="searchForm.changeType" placeholder="全部类型" clearable>
                        <el-option label="入库" value="in"></el-option>
                        <el-option label="出库" value="out"></el-option>
                        <el-option label="调整" value="adjust"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="日期范围">
                    <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
                        end-placeholder="结束日期" value-format="YYYY-MM-DD"></el-date-picker>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="fetchLogs">查询</el-button>
                    <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
            </el-form>

            <!-- 日志表格 -->
            <el-table v-loading="loading" :data="currentPageLogs" border style="width: 100%; margin-top: 15px"
                empty-text="暂无库存变更记录">
                <el-table-column prop="productName" label="商品名称" min-width="150"></el-table-column>
                <el-table-column prop="changeType" label="变更类型" width="100">
                    <template #default="scope">
                        <el-tag :type="scope.row.changeType === '入库' ? 'success' :
                            scope.row.changeType === '出库' ? 'danger' : 'warning'
                            ">
                            {{ scope.row.changeType }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="changeQuantity" label="变更数量" width="120">
                    <template #default="scope">
                        <span :style="scope.row.changeQuantity > 0 ? 'color: green' : 'color: red'">
                            {{ scope.row.changeQuantity > 0 ? '+' + scope.row.changeQuantity : scope.row.changeQuantity
                            }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="currentQuantity" label="变更后库存" width="120"></el-table-column>
                <el-table-column prop="reason" label="变更原因" min-width="200"></el-table-column>
                <el-table-column prop="referenceID" label="关联ID" width="150">
                    <template #default="scope">
                        {{ scope.row.referenceID || '-' }}
                    </template>
                </el-table-column>
                <el-table-column prop="createdTime" label="操作时间" min-width="180">
                    <template #default="scope">
                        {{ formatDateTime(scope.row.createdTime) }}
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination v-if="total > 0" class="pagination" :current-page="pageInfo.pageNum"
                :page-size="pageInfo.pageSize" :total="total" :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                @current-change="handleCurrentChange"></el-pagination>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { getInventoryLogApi } from '@/api/merchant';

// 搜索表单
const searchForm = ref({
    changeType: '',
});

// 日期范围
const dateRange = ref([]);

// 所有日志数据（前端分页用）
const allLogs = ref([]);
// 当前页显示的日志
const currentPageLogs = computed(() => {
    const start = (pageInfo.value.pageNum - 1) * pageInfo.value.pageSize;
    const end = start + pageInfo.value.pageSize;
    return allLogs.value.slice(start, end);
});

const loading = ref(false);
// 总记录数（用于分页组件）
const total = ref(0);

// 分页信息
const pageInfo = ref({
    pageNum: 1,
    pageSize: 10,
});

// 获取所有日志数据
const fetchLogs = async () => {
    try {
        loading.value = true;

        // 处理查询参数（移除分页参数，获取全部数据）
        const params = {
            ...searchForm.value,
        };

        // 处理日期范围
        if (dateRange.value && dateRange.value.length === 2) {
            params.startDate = `${dateRange.value[0]}T00:00:00`;
            params.endDate = `${dateRange.value[1]}T23:59:59`;
        }

        console.log('查询参数:', params);
        const res = await getInventoryLogApi(params);
        if (res.code === 1) {
            // 存储所有日志数据
            allLogs.value = res.data || [];
            // 更新总记录数
            total.value = allLogs.value.length;
            // 重置到第一页
            pageInfo.value.pageNum = 1;
        } else {
            ElMessage.error('获取日志失败：' + res.msg);
            allLogs.value = [];
            total.value = 0;
        }
    } catch (err) {
        console.error('获取库存日志失败：', err);
        ElMessage.error('网络错误，无法获取日志数据');
        allLogs.value = [];
        total.value = 0;
    } finally {
        loading.value = false;
    }
};

// 重置搜索条件
const resetSearch = () => {
    searchForm.value = {
        changeType: '',
    };
    dateRange.value = [];
    pageInfo.value.pageNum = 1;
    fetchLogs();
};

// 格式化日期时间
const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).replace(/\//g, '-');
};

// 分页事件处理
const handleSizeChange = (size) => {
    pageInfo.value.pageSize = size;
    pageInfo.value.pageNum = 1; // 切换页大小时重置到第一页
};

const handleCurrentChange = (page) => {
    pageInfo.value.pageNum = page;
};

// 页面加载时获取日志
onMounted(() => {
    fetchLogs();
});
</script>

<style scoped>
.inventory-log-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.search-form {
    margin: 15px 0;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
}

.pagination {
    margin-top: 15px;
    text-align: right;
}

:deep(.el-tag) {
    margin: 0 2px;
}
</style>