<template>
    <div class="stock-modify-container">
        <el-card>
            <div slot="header" class="card-header">
                <h2>库存修改</h2>
                <el-button type="primary" @click="fetchProducts">
                    <el-icon>
                        <Refresh />
                    </el-icon> 刷新商品
                </el-button>
            </div>

            <!-- 加载状态 -->
            <el-skeleton v-if="loading" :rows="6" style="width: 100%"></el-skeleton>

            <!-- 无商品提示 -->
            <div v-else-if="merchantProducts.length === 0" class="empty-tip">
                <el-empty description="暂无商品数据，请先添加商品"></el-empty>
            </div>

            <div v-else>
                <!-- 商品库存总览表格 -->
                <el-card class="product-stock-overview" style="margin-bottom: 20px;">
                    <div slot="header">
                        <h3>商品库存总览</h3>
                    </div>
                    <el-table :data="merchantProducts" border size="small" style="width: 100%">
                        <el-table-column prop="id" label="商品ID" width="80"></el-table-column>
                        <el-table-column prop="name" label="商品名称" min-width="150"></el-table-column>
                        <el-table-column prop="sku" label="规格" min-width="120"></el-table-column>
                        <el-table-column prop="stockQuantity" label="当前库存" width="100"
                            :cell-style="({ row }) => row.stockQuantity <= 0 ? { color: 'red', fontWeight: 'bold' } : {}">
                            <template #default="scope">
                                {{ scope.row.stockQuantity }}
                                <span v-if="scope.row.stockQuantity <= 0" style="margin-left: 5px;">(缺货)</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="120">
                            <template #default="scope">
                                <el-button type="text" @click="selectProduct(scope.row)" style="padding: 0"
                                    :disabled="!scope.row.id">
                                    选择修改
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>

                <!-- 库存修改表单 -->
                <el-form ref="inventoryForm" :model="formState" :rules="formRules" label-width="120px"
                    class="modify-form" id="modifyForm">
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <el-form-item label="商品选择" prop="productId">
                                <el-select v-model="formState.productId" placeholder="请选择商品" clearable
                                    @change="handleProductChange" style="width: 100%">
                                    <el-option v-for="product in merchantProducts" :key="`product_${product.id}`"
                                        :label="`${product.name} (当前库存: ${product.stockQuantity})`"
                                        :value="product.id"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>

                        <el-col :span="8">
                            <el-form-item label="变更类型" prop="changeType">
                                <el-select v-model="formState.changeType" placeholder="请选择类型" clearable
                                    style="width: 100%" @change="validateStock">
                                    <!-- 关键修改：将value改为中文，与后端枚举匹配 -->
                                    <el-option label="入库" value="入库"></el-option>
                                    <el-option label="出库" value="出库"></el-option>
                                    <el-option label="盘点调整" value="调整"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>

                        <el-col :span="8">
                            <el-form-item label="变更数量" prop="changeQuantity">
                                <el-input v-model.number="formState.changeQuantity" placeholder="请输入数量" type="number"
                                    min="1" @input="validateStock" style="width: 100%"></el-input>
                                <el-text type="info" size="small" class="quantity-tip">
                                    出库时系统自动处理为减少库存
                                </el-text>
                            </el-form-item>
                        </el-col>

                        <el-col :span="24">
                            <el-form-item label="变更原因" prop="reason">
                                <el-input v-model="formState.reason" placeholder="请输入变更原因" maxlength="200"
                                    type="textarea" rows="3" style="width: 100%"></el-input>
                            </el-form-item>
                        </el-col>

                        <el-col :span="24" class="form-actions">
                            <el-button type="primary" @click="submitModify">提交修改</el-button>
                            <el-button @click="resetForm">重置</el-button>
                        </el-col>
                    </el-row>
                </el-form>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox, ElEmpty } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import { modifyStockApi } from '@/api/merchant';
import { getProductsOfMeApi } from '@/api/product';

// 表单状态
const formState = ref({
    productId: null,
    changeQuantity: null,
    reason: '',
    changeType: null, // 现在存储的是中文值："入库"、"出库"、"调整"
    referenceId: null
});

// 商品列表
const merchantProducts = ref([]);
const loading = ref(true);
const inventoryForm = ref(null);

// 表单验证规则
const formRules = {
    productId: [
        { required: true, message: '请选择商品', trigger: 'change' }
    ],
    changeType: [
        { required: true, message: '请选择变更类型', trigger: 'change' }
    ],
    changeQuantity: [
        { required: true, message: '请输入变更数量', trigger: 'blur' },
        { type: 'number', min: 1, message: '数量必须为正整数', trigger: 'blur' }
    ],
    reason: [
        { required: true, message: '请输入变更原因', trigger: 'blur' },
        { min: 2, max: 200, message: '原因长度在2-200字符之间', trigger: 'blur' }
    ]
};

// 获取商家商品列表
const fetchProducts = async () => {
    try {
        loading.value = true;
        merchantProducts.value = [];

        const res = await getProductsOfMeApi();
        if (res && res.code === 1 && Array.isArray(res.data)) {
            merchantProducts.value = res.data;
            ElMessage.success(`成功加载 ${res.data.length} 个商品`);
        } else {
            ElMessage.error(`获取商品失败：${res?.msg || '返回格式错误'}`);
        }
    } catch (err) {
        console.error('获取商品接口调用失败:', err);
        ElMessage.error('网络错误，无法加载商品列表');
    } finally {
        loading.value = false;
    }
};

// 选择商品（从表格选择）
const selectProduct = async (product) => {
    if (!product || !product.id) {
        ElMessage.warning('商品信息不完整，无法选择');
        return;
    }

    try {
        await nextTick();
        formState.value.productId = product.id;
        formState.value = { ...formState.value };

        if (inventoryForm.value) {
            inventoryForm.value.validateField('productId');
        }

        const formElement = document.getElementById('modifyForm');
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth' });
        }

        ElMessage.success(`已选择商品：${product.name}`);
    } catch (err) {
        console.error('选择商品失败:', err);
        ElMessage.error('选择商品时发生错误');
    }
};

// 商品选择变更处理
const handleProductChange = (productId) => {
    formState.value.productId = productId;
    validateStock();
};

// 验证库存
const validateStock = () => {
    if (!formState.value.productId || !formState.value.changeType) return;

    const selectedProduct = merchantProducts.value.find(p => p.id === formState.value.productId);
    if (!selectedProduct) return;

    // 注意：这里的changeType已经是中文值了
    if (formState.value.changeType === '出库') {
        const requiredQuantity = formState.value.changeQuantity || 0;
        if (selectedProduct.stockQuantity < requiredQuantity) {
            ElMessage.warning(`库存不足！当前库存: ${selectedProduct.stockQuantity}, 请求出库: ${requiredQuantity}`);
        }
    }
};

// 提交库存修改
const submitModify = async () => {
    console.log('提交函数被触发');
    if (!inventoryForm.value) {
        console.error('未获取到表单实例');
        return;
    }

    try {
        await inventoryForm.value.validate();
    } catch (err) {
        console.error('表单验证失败:', err);
        ElMessage.error('请完善表单信息后再提交');
        return;
    }

    const selectedProduct = merchantProducts.value.find(p => p.id === formState.value.productId);
    if (!selectedProduct) {
        ElMessage.error('未找到选中的商品信息');
        return;
    }

    // 注意：这里的changeType是中文值
    if (formState.value.changeType === '出库' && selectedProduct.stockQuantity < formState.value.changeQuantity) {
        ElMessage.error(`库存不足！当前库存: ${selectedProduct.stockQuantity}, 无法出库: ${formState.value.changeQuantity}`);
        return;
    }

    // 提交数据：changeType为中文，与后端枚举匹配
    const submitData = {
        productId: formState.value.productId,
        changeQuantity: formState.value.changeType === '出库'
            ? -Math.abs(formState.value.changeQuantity)
            : Math.abs(formState.value.changeQuantity),
        reason: formState.value.reason,
        changeType: formState.value.changeType, // 直接传递中文值
        referenceId: formState.value.referenceId
    };

    try {
        console.log('发送请求数据:', submitData);
        const confirm = await ElMessageBox.confirm(
            `确认要${formState.value.changeType}商品【${selectedProduct.name}】的库存吗？\n` +
            `当前库存: ${selectedProduct.stockQuantity} → 变更后: ${selectedProduct.stockQuantity + submitData.changeQuantity}`,
            '库存变更确认',
            {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning'
            }
        );

        if (confirm === 'confirm') {
            const res = await modifyStockApi(submitData);
            console.log('API返回结果:', res);
            if (res.code === 1) {
                ElMessage.success('库存修改成功！');
                resetForm();
                fetchProducts();
            } else {
                ElMessage.error('修改失败：' + res.msg);
            }
        }
    } catch (err) {
        if (err === 'cancel') return;
        console.error('库存修改错误详情：', err);
        ElMessage.error(`网络错误: ${err.message || '未知错误'}`);
    }
};

// 重置表单
const resetForm = () => {
    if (inventoryForm.value) {
        inventoryForm.value.resetFields();
    }
    formState.value = {
        productId: null,
        changeQuantity: null,
        reason: '',
        changeType: null,
        referenceId: null
    };
};

// 页面加载时获取商品列表
onMounted(() => {
    fetchProducts();
});
</script>

<style scoped>
/* 样式保持不变 */
.stock-modify-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.product-stock-overview {
    background-color: #fafafa;
}

.modify-form {
    margin-top: 20px;
    padding: 10px;
    background-color: #fff;
    border-radius: 4px;
}

.form-actions {
    display: flex;
    gap: 10px;
    padding: 10px 0;
    justify-content: flex-start;
}

.quantity-tip {
    display: block;
    margin-top: 5px;
}

:deep(.el-skeleton) {
    padding: 20px 0;
}

.empty-tip {
    padding: 40px 0;
    text-align: center;
}

:deep(.el-table) {
    margin-top: 10px;
}

:deep(.el-table .el-button) {
    color: #1890ff;
    cursor: pointer;
}

:deep(.el-table .el-button:hover) {
    color: #40a9ff;
    text-decoration: underline;
}
</style>