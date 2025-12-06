<template>
    <div class="my-products">
        <!-- 操作栏 -->
        <div class="operation-bar">
            <h2>我的商品管理</h2>
            <el-button type="primary" @click="handleAdd">
                <el-icon>
                    <Plus />
                </el-icon> 添加商品
            </el-button>
        </div>

        <!-- 商品列表 -->
        <el-card>
            <!-- 加载状态 -->
            <el-skeleton v-if="loading" :rows="5" style="width: 100%"></el-skeleton>

            <!-- 列表为空 -->
            <div v-else-if="products.length === 0" class="empty-state">
                <el-empty description="暂无商品，点击添加按钮创建商品"></el-empty>
            </div>

            <!-- 商品表格 - 显示库存列和评分相关列 -->
            <el-table v-else :data="products" border style="width: 100%">
                <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
                <el-table-column label="商品图片" width="100" align="center">
                    <template #default="scope">
                        <el-image :src="scope.row.imageUrl" :preview-src-list="[scope.row.imageUrl]" fit="cover"
                            width="60" height="60" fallback-src="/images/default-product.png"></el-image>
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="商品名称" min-width="100"></el-table-column>
                <el-table-column prop="categoryName" label="分类" width="120" align="center"></el-table-column>
                <el-table-column prop="price" label="价格(元)" width="100" align="center">
                    <template #default="scope">{{ scope.row.price.toFixed(2) }}</template>
                </el-table-column>
                <!-- 库存列 - 仅展示不提供编辑 -->
                <el-table-column prop="stockQuantity" label="库存" width="100" align="center"></el-table-column>

                <!-- 评分列 -->
                <el-table-column label="评分" width="160" align="center">
                    <template #default="scope">
                        <div class="rating-container">
                            <el-rate v-model="scope.row.rating" disabled :max="5" :precision="1"
                                style="margin-right: 8px"></el-rate>
                            <span class="rating-value">{{ (scope.row.rating || 0).toFixed(1) }}</span>
                        </div>
                    </template>
                </el-table-column>

                <!-- 平分数列 -->
                <el-table-column prop="ratingCount" label="评价数" width="100" align="center">
                    <template #default="scope">
                        {{ scope.row.ratingCount || 0 }}
                    </template>
                </el-table-column>

                <el-table-column prop="sku" label="规格" min-width="120"></el-table-column>
                <el-table-column prop="isActive" label="状态" width="100" align="center">
                    <template #default="scope">
                        <el-switch v-model="scope.row.isActive" :active-value="1" :inactive-value="0"
                            @change="handleStatusChange(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" align="center">
                    <template #default="scope">
                        <el-button type="primary" size="small" @click="handleEdit(scope.row)">
                            编辑
                        </el-button>
                        <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 添加/编辑商品弹窗 -->
        <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '添加商品' : '编辑商品'" :width="dialogWidth">
            <el-form ref="productFormRef" :model="productForm" :rules="formRules" label-width="120px">
                <!-- 编辑时需要ID，但不显示 -->
                <el-input v-model="productForm.id" type="hidden"></el-input>

                <el-form-item label="商品名称" prop="name">
                    <el-input v-model="productForm.name" placeholder="请输入商品名称" maxlength="100"></el-input>
                </el-form-item>

                <el-form-item label="商品描述" prop="description">
                    <el-input v-model="productForm.description" placeholder="请输入商品描述" type="textarea" rows="3"
                        maxlength="500"></el-input>
                </el-form-item>

                <el-form-item label="商品价格" prop="price">
                    <el-input v-model.number="productForm.price" placeholder="请输入商品价格" type="number" step="0.01"
                        min="0"></el-input>
                </el-form-item>

                <!-- 库存数量 - 仅在添加时显示和设置，编辑时不显示 -->
                <el-form-item label="库存数量" prop="stockQuantity" v-if="dialogType === 'add'">
                    <el-input v-model.number="productForm.stockQuantity" placeholder="请输入库存数量" type="number"
                        min="0"></el-input>
                </el-form-item>

                <!-- 分类选择区域 -->
                <el-form-item label="一级分类" prop="level1Id" v-if="dialogType === 'add'">
                    <el-select v-model="productForm.level1Id" placeholder="请选择一级分类" @change="handleLevel1Change">
                        <el-option v-for="level1 in level1Categories" :key="level1.id" :label="level1.name"
                            :value="level1.id"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="二级分类" prop="categoryId" v-if="dialogType === 'add'">
                    <el-select v-model="productForm.categoryId" placeholder="请先选择一级分类"
                        :disabled="!productForm.level1Id">
                        <el-option v-for="level2 in level2Categories" :key="level2.id" :label="level2.name"
                            :value="level2.id"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="分类信息" v-if="dialogType === 'edit'">
                    <el-input v-model="categoryInfo" disabled placeholder="分类信息"></el-input>
                    <el-input v-model="productForm.categoryId" type="hidden"></el-input>
                    <el-text type="info" size="small">
                        分类一旦创建不可修改
                    </el-text>
                </el-form-item>

                <el-form-item label="商品规格" prop="sku">
                    <el-input v-model="productForm.sku" placeholder="请输入商品规格（如颜色、尺寸等）" maxlength="100"></el-input>
                </el-form-item>

                <!-- 图片上传/URL输入二选一区域 -->
                <el-form-item label="商品图片" prop="imageUrl">
                    <!-- 显示已选图片预览 -->
                    <el-image v-if="productForm.imageUrl" :src="productForm.imageUrl" fit="cover" width="100"
                        height="100" class="uploaded-image" fallback-src="/images/default-product.png"></el-image>

                    <!-- 切换方式选择 -->
                    <div class="image-option-switch">
                        <el-radio-group v-model="imageInputType" @change="resetImageInput">
                            <el-radio label="upload">图片上传</el-radio>
                            <el-radio label="url">手动输入URL</el-radio>
                        </el-radio-group>
                    </div>

                    <!-- 图片上传方式 -->
                    <div v-if="imageInputType === 'upload'" class="image-upload-container">
                        <el-upload class="upload-btn" action="/api/image/upload" :show-file-list="false"
                            :on-success="handleUploadSuccess" :on-error="handleUploadError"
                            accept="image/jpeg,image/png,image/gif">
                            <el-button size="small" type="primary">点击上传图片</el-button>
                        </el-upload>
                        <el-text type="info" size="small" class="upload-tip">
                            支持JPG、PNG、GIF格式
                        </el-text>
                    </div>

                    <!-- URL输入方式 -->
                    <div v-else class="image-url-container">
                        <el-input v-model="productForm.imageUrl" placeholder="请输入图片完整URL（http/https开头）"
                            maxlength="500"></el-input>
                        <el-text type="info" size="small" class="url-tip">
                            示例：https://example.com/image.jpg
                        </el-text>
                    </div>
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="dialogType === 'add' ? handleAddSubmit() : handleEditSubmit()">
                    {{ dialogType === 'add' ? '添加' : '保存' }}
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive, toRefs } from 'vue';
import {
    getProductsOfMeApi,
    addProductApi,
    updateProductApi
} from '@/api/product';
import { getCategoriesApi } from '@/api/category';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';


// 状态管理
const state = reactive({
    loading: true,
    products: [],
    dialogVisible: false,
    dialogType: 'add',
    dialogWidth: '600px',
    productForm: {
        id: '',
        name: '',
        description: '',
        price: null,
        stockQuantity: null, // 库存字段
        categoryId: null, // 最终提交的二级分类ID
        level1Id: null,   // 一级分类ID（仅用于添加时选择）
        sku: '',
        imageUrl: ''
    },
    // 分类相关状态
    level1Categories: [], // 一级分类列表
    level2Categories: [], // 二级分类列表
    categoryInfo: '',     // 编辑时显示的分类信息
    // 图片输入方式：upload-上传，url-手动输入
    imageInputType: 'upload'
});
const {
    loading, products, dialogVisible, dialogType,
    dialogWidth, productForm, level1Categories,
    level2Categories, categoryInfo, imageInputType
} = toRefs(state);

// 表单引用和验证规则
const productFormRef = ref(null);
const formRules = {
    name: [
        { required: true, message: '请输入商品名称', trigger: 'blur' },
        { min: 2, max: 100, message: '名称长度在2-100字符之间', trigger: 'blur' }
    ],
    price: [
        { required: true, message: '请输入商品价格', trigger: 'blur' },
        { type: 'number', message: '请输入有效的数字', trigger: 'blur' },
    ],
    // 库存验证规则 - 仅在添加时生效
    stockQuantity: [
        { required: true, message: '请输入库存数量', trigger: 'blur' },
        { type: 'number', message: '请输入有效的数字', trigger: 'blur' },
    ],
    sku: [
        { required: true, message: '请输入商品规格', trigger: 'blur' }
    ],
    imageUrl: [
        { required: true, message: '请上传商品图片或输入图片URL', trigger: ['blur', 'change'] },
        {
            validator: (rule, value, callback) => {
                if (value.trim() === '') {
                    callback(new Error('图片不能为空'));
                } else if (state.imageInputType === 'url' && !/^https?:\/\/.*/.test(value.trim())) {
                    callback(new Error('请输入有效的HTTP/HTTPS URL'));
                } else {
                    callback();
                }
            }, trigger: ['blur', 'change']
        }
    ],
    // 分类选择验证规则
    level1Id: [
        { required: true, message: '请选择一级分类', trigger: 'change' }
    ],
    categoryId: [
        { required: true, message: '请选择二级分类', trigger: 'change' }
    ]
};

// 切换图片输入方式时重置输入状态
const resetImageInput = () => {
    if (productFormRef.value) {
        productFormRef.value.clearValidate('imageUrl');
    }
};

// 加载一级分类列表
const loadLevel1Categories = async () => {
    try {
        const res = await getCategoriesApi({ level: 1 });
        if (res.code === 1) {
            state.level1Categories = res.data || [];
        } else {
            ElMessage.error('获取分类失败：' + res.msg);
        }
    } catch (err) {
        console.error('获取分类错误：', err);
        ElMessage.error('网络错误，无法加载分类');
    }
};

// 一级分类变更时加载对应二级分类
const handleLevel1Change = async (level1Id) => {
    try {
        state.productForm.categoryId = null; // 重置二级分类选择
        if (level1Id) {
            const res = await getCategoriesApi({ parentId: level1Id, level: 2 });
            state.level2Categories = res.code === 1 ? res.data || [] : [];
        } else {
            state.level2Categories = [];
        }
    } catch (err) {
        console.error('获取二级分类错误：', err);
        ElMessage.error('网络错误，无法加载二级分类');
    }
};

// 图片上传成功回调
const handleUploadSuccess = (response) => {
    if (response.code === 1) {
        productForm.value.imageUrl = response.data;
        ElMessage.success('图片上传成功');
    } else {
        ElMessage.error('图片上传失败: ' + response.msg);
    }
};

// 图片上传失败回调
const handleUploadError = (error) => {
    console.error('图片上传错误:', error);
    ElMessage.error('图片上传失败，请重试或选择手动输入URL');
};

// 加载商品列表
const loadProducts = async () => {
    try {
        state.loading = true;
        const res = await getProductsOfMeApi();
        if (res.code === 1) {
            // 确保评分字段存在且为数字类型
            state.products = (res.data || []).map(product => ({
                ...product,
                rating: Number(product.rating) || 0,
                ratingCount: Number(product.ratingCount) || 0
            }));
        } else {
            ElMessage.error('获取商品列表失败：' + res.msg);
        }
    } catch (err) {
        console.error('获取商品列表错误：', err);
        ElMessage.error('网络错误，无法加载商品列表');
    } finally {
        state.loading = false;
    }
};

// 打开添加商品弹窗
const handleAdd = () => {
    state.dialogType = 'add';
    state.productForm = {
        id: '',
        name: '',
        description: '',
        price: null,
        stockQuantity: null, // 添加时需要设置库存
        categoryId: null,
        level1Id: null,
        sku: '',
        imageUrl: ''
    };
    state.level2Categories = [];
    state.imageInputType = 'upload'; // 默认上传方式
    if (productFormRef.value) {
        productFormRef.value.clearValidate();
    }
    state.dialogVisible = true;
};

// 打开编辑商品弹窗
const handleEdit = async (row) => {
    state.dialogType = 'edit';
    state.productForm = {
        id: row.id,
        name: row.name,
        description: row.description,
        price: Number(row.price),
        categoryId: Number(row.categoryId),
        level1Id: null,
        sku: row.sku,
        imageUrl: row.imageUrl
    };

    // 编辑时根据已有URL自动判断输入方式
    state.imageInputType = row.imageUrl && /^https?:\/\/.*/.test(row.imageUrl) ? 'url' : 'upload';

    // 获取分类详情用于显示
    try {
        const level2Res = await getCategoriesApi({ id: row.categoryId });
        if (level2Res.code === 1 && level2Res.data) {
            const level2 = level2Res.data;
            const level1Res = await getCategoriesApi({ id: level2.parentId });
            state.categoryInfo = level1Res.code === 1 && level1Res.data
                ? `${level1Res.data.name} / ${level2.name}`
                : level2.name;
        } else {
            state.categoryInfo = '未知分类';
        }
    } catch (err) {
        console.error('获取分类信息错误：', err);
        state.categoryInfo = '分类信息加载失败';
    }

    if (productFormRef.value) {
        productFormRef.value.clearValidate();
    }
    state.dialogVisible = true;
};

// 提交添加商品
const handleAddSubmit = async () => {
    if (!productFormRef.value) return;
    const valid = await productFormRef.value.validate();
    if (!valid) return;

    const submitData = {
        ...state.productForm,
        price: Number(state.productForm.price),
        stockQuantity: Number(state.productForm.stockQuantity), // 添加时提交库存
        categoryId: Number(state.productForm.categoryId)
    };
    delete submitData.level1Id;

    try {
        const res = await addProductApi(submitData);
        if (res.code === 1) {
            ElMessage.success('商品添加成功！');
            state.dialogVisible = false;
            loadProducts();
        } else {
            ElMessage.error('添加失败：' + res.msg);
        }
    } catch (err) {
        console.error('添加商品错误：', err);
        ElMessage.error('网络错误，添加失败');
    }
};

// 提交编辑商品
const handleEditSubmit = async () => {
    if (!productFormRef.value) return;
    const valid = await productFormRef.value.validate();
    if (!valid) return;

    // 编辑时不包含库存字段，防止修改
    const { stockQuantity, ...submitData } = {
        ...state.productForm,
        price: Number(state.productForm.price),
        categoryId: Number(state.productForm.categoryId)
    };

    try {
        const res = await updateProductApi(submitData);
        if (res.code === 1) {
            ElMessage.success('商品修改成功！');
            state.dialogVisible = false;
            loadProducts();
        } else {
            ElMessage.error('修改失败：' + res.msg);
        }
    } catch (err) {
        console.error('修改商品错误：', err);
        ElMessage.error('网络错误，修改失败');
    }
};

// 变更商品状态
const handleStatusChange = async (row) => {
    try {
        const res = await updateProductApi({
            ...row,
            isActive: row.isActive
        });
        if (res.code !== 1) {
            row.isActive = row.isActive === '1' ? '0' : '1';
            ElMessage.error('状态更新失败：' + res.msg);
        }
    } catch (err) {
        row.isActive = row.isActive === '1' ? '0' : '1';
        console.error('状态更新错误：', err);
        ElMessage.error('网络错误，状态更新失败');
    }
};

// 删除商品
const handleDelete = async (id) => {
    try {
        const confirm = await ElMessageBox.confirm(
            '确定要删除该商品吗？删除后不可恢复',
            '警告',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        );
        if (confirm === 'confirm') {
            ElMessage.info('删除功能需后端配合实现');
        }
    } catch (err) {
        // 取消删除不处理
    }
};

// 页面加载时初始化
onMounted(() => {
    loadProducts();
    loadLevel1Categories();
});
</script>

<style scoped>
.my-products {
    padding: 20px;
}

.operation-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.operation-bar h2 {
    margin: 0;
    color: #333;
}

.empty-state {
    padding: 50px 0;
    text-align: center;
}

/* 表格图片样式 */
:deep(.el-table .el-image) {
    border-radius: 4px;
}

/* 操作按钮间距 */
:deep(.el-table .el-button) {
    margin-right: 5px;
}

/* 分类ID提示文本样式 */
:deep(.el-form-item__error) {
    margin-top: 5px;
}

/* 上传图片样式 */
.uploaded-image {
    margin-bottom: 10px;
    border-radius: 4px;
}

.upload-btn {
    margin-bottom: 5px;
}

.upload-tip,
.url-tip {
    display: block;
    margin-top: 5px;
}

/* 图片输入方式切换样式 */
.image-option-switch {
    margin: 10px 0;
}

.image-upload-container,
.image-url-container {
    margin-bottom: 5px;
}

/* 分类选择框样式 */
:deep(.el-select) {
    width: 100%;
}

/* 评分相关样式 */
.rating-container {
    display: flex;
    align-items: center;
    justify-content: center;
}

.rating-value {
    color: #606266;
    font-size: 14px;
}

/* 评分组件样式调整 */
:deep(.el-rate) {
    --el-rate-icon-size: 16px;
}
</style>