<template>
    <div class="address-page">
        <el-card>
            <div slot="header" class="card-header">
                <h2>地址管理</h2>
                <el-button type="primary" size="small" @click="handleAdd">
                    <el-icon>
                        <Plus />
                    </el-icon>新增地址
                </el-button>
            </div>

            <!-- 地址列表 -->
            <div class="address-list" v-if="addressList.length > 0">
                <el-checkbox-group v-model="selectedAddressIds" class="batch-select">
                    <el-checkbox :indeterminate="isIndeterminate" @change="handleCheckAllChange">
                        全选
                    </el-checkbox>
                    <el-button type="text" danger size="small" @click="handleBatchDelete"
                        :disabled="selectedAddressIds.length === 0">
                        批量删除
                    </el-button>
                </el-checkbox-group>

                <div class="address-card" v-for="(addr, index) in addressList" :key="addr.id">
                    <el-checkbox v-model="selectedAddressIds" :label="index + 1" :value="addr.id"
                        @change="handleItemChange"></el-checkbox>
                    <div class="address-info">
                        <div class="address-header">
                            <span class="recipient">{{ addr.recipient }} {{ addr.phone }}</span>
                            <span class="default-tag" v-if="addr.isDefault === 1">默认地址</span>
                        </div>
                        <div class="address-detail">
                            {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}
                            <span class="postal-code" v-if="addr.postalCode">{{ addr.postalCode }}</span>
                        </div>
                    </div>

                    <div class="address-actions">
                        <el-button type="text" size="small" @click="handleEdit(addr)">
                            编辑
                        </el-button>
                        <el-button type="text" size="small" @click="handleSetDefault(addr.id)"
                            v-if="addr.isDefault === 0">
                            设为默认
                        </el-button>
                        <el-button type="text" size="small" danger @click="handleDelete(addr.id)">
                            删除
                        </el-button>
                    </div>
                </div>
            </div>

            <!-- 空状态 -->
            <div class="empty-address" v-else>
                <el-empty description="暂无收货地址">
                    <el-button type="primary" @click="handleAdd">
                        <el-icon>
                            <Plus />
                        </el-icon>添加收货地址
                    </el-button>
                </el-empty>
            </div>
        </el-card>

        <!-- 地址表单弹窗 -->
        <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
            <el-form :model="addressForm" :rules="formRules" ref="addressFormRef" label-width="100px">
                <el-form-item label="姓名" prop="recipient">
                    <el-input v-model="addressForm.recipient" placeholder="请输入姓名" />
                </el-form-item>

                <el-form-item label="联系电话" prop="phone">
                    <el-input v-model="addressForm.phone" placeholder="请输入联系电话" />
                </el-form-item>

                <el-form-item label="省份" prop="province">
                    <el-input v-model="addressForm.province" placeholder="请输入省份" />
                </el-form-item>

                <el-form-item label="城市" prop="city">
                    <el-input v-model="addressForm.city" placeholder="请输入城市" />
                </el-form-item>

                <el-form-item label="区县" prop="district">
                    <el-input v-model="addressForm.district" placeholder="请输入区县（可选）" />
                </el-form-item>

                <el-form-item label="详细地址" prop="detail">
                    <el-input v-model="addressForm.detail" placeholder="请输入详细地址" type="textarea" rows="2" />
                </el-form-item>

                <el-form-item label="邮政编码" prop="postalCode">
                    <el-input v-model="addressForm.postalCode" placeholder="请输入邮政编码（可选）" />
                </el-form-item>

                <el-form-item v-if="!isEdit">
                    <el-checkbox v-model="addressForm.isDefault">设为默认地址</el-checkbox>
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleDialogSubmit">确认</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive, toRefs } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
// 导入地址相关接口（需根据你的实际接口路径调整）
import {
    getAddressApi,
    addAddressApi,
    updateAddressApi,
    deleteAddressApi,
    deleteAddressesApi,
    defaultAddressApi
} from '@/api/address.js';

// 地址列表数据
const addressList = ref([]);

// 批量选择相关
const selectedAddressIds = ref([]);
const isIndeterminate = ref(false);

// 弹窗相关
const dialogVisible = ref(false);
const dialogTitle = ref('新增地址');
const isEdit = ref(false);

// 表单数据（与UserAddress实体对应）
const addressForm = reactive({
    id: null,
    recipient: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    postalCode: '',
    isDefault: 0 // 0-非默认，1-默认
});

// 表单验证规则
const formRules = ref({
    recipient: [
        { required: true, message: '请输入收件人姓名', trigger: 'blur' },
        { max: 20, message: '收件人姓名不能超过20个字符', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    province: [
        { required: true, message: '请输入省份', trigger: 'blur' }
    ],
    city: [
        { required: true, message: '请输入城市', trigger: 'blur' }
    ],
    detail: [
        { required: true, message: '请输入详细地址', trigger: 'blur' },
        { max: 200, message: '详细地址不能超过200个字符', trigger: 'blur' }
    ]
});

// 表单引用
const addressFormRef = ref(null);

// 获取地址列表
const fetchAddressList = async () => {
    try {
        const res = await getAddressApi();
        if (res.code === 1) {
            // 后端返回PageResult，数据在result中
            addressList.value = res.data.rows || [];
        } else {
            ElMessage.error(res.msg || '获取地址列表失败');
        }
    } catch (error) {
        ElMessage.error('获取地址列表失败');
        console.error(error);
    }
};

// 新增地址
const handleAdd = () => {
    // 重置表单
    addressFormRef.value?.resetFields();
    // 初始化表单数据
    Object.assign(addressForm, {
        id: null,
        recipient: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail: '',
        postalCode: '',
        isDefault: 0
    });
    dialogTitle.value = '新增地址';
    isEdit.value = false;
    dialogVisible.value = true;
};

// 编辑地址
const handleEdit = (addr) => {
    // 重置表单
    addressFormRef.value?.resetFields();
    // 填充表单数据
    Object.assign(addressForm, {
        id: addr.id,
        recipient: addr.recipient,
        phone: addr.phone,
        province: addr.province,
        city: addr.city,
        district: addr.district,
        detail: addr.detail,
        postalCode: addr.postalCode,
        isDefault: addr.isDefault
    });
    dialogTitle.value = '编辑地址';
    isEdit.value = true;
    dialogVisible.value = true;
};

// 提交表单（新增/编辑）
const handleDialogSubmit = async () => {
    try {
        // 表单验证
        await addressFormRef.value.validate();

        // 处理isDefault（复选框是boolean，转为1/0）
        addressForm.isDefault = addressForm.isDefault ? 1 : 0;

        let res;
        if (isEdit.value) {
            // 编辑地址
            res = await updateAddressApi(addressForm);
        } else {
            // 新增地址
            res = await addAddressApi(addressForm);
        }

        if (res.code === 1) {
            ElMessage.success(isEdit.value ? '地址更新成功' : '地址添加成功');
            dialogVisible.value = false;
            // 重新获取地址列表
            fetchAddressList();
        } else {
            ElMessage.error(res.msg || (isEdit.value ? '地址更新失败' : '地址添加失败'));
        }
    } catch (error) {
        console.error('表单验证失败：', error);
    }
};

// 设置默认地址
const handleSetDefault = async (addressId) => {
    try {
        const res = await defaultAddressApi(addressId);
        if (res.code === 1) {
            ElMessage.success('默认地址设置成功');
            fetchAddressList(); // 刷新列表
        } else {
            ElMessage.error(res.msg || '设置默认地址失败');
        }
    } catch (error) {
        ElMessage.error('设置默认地址失败');
        console.error(error);
    }
};

// 删除单个地址
const handleDelete = async (addressId) => {
    try {
        const confirm = await ElMessageBox.confirm(
            '确定要删除该地址吗？',
            '删除确认',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        );

        if (confirm === 'confirm') {
            const res = await deleteAddressApi(addressId);
            if (res.code === 1 && res.data) {
                ElMessage.success('地址删除成功');
                fetchAddressList(); // 刷新列表
            } else {
                ElMessage.error('地址删除失败');
            }
        }
    } catch (error) {
        // 取消删除时不做处理
        if (error !== 'cancel') {
            console.error('删除地址失败：', error);
        }
    }
};

// 批量删除地址
const handleBatchDelete = async () => {
    if (selectedAddressIds.value.length === 0) return;

    try {
        // 关键修正：过滤空值 + 拼接为合法字符串（如 "9,10"）
        const validIds = selectedAddressIds.value
            .filter(id => id !== null && id !== undefined && id !== '') // 过滤空值
            .join(',');

        if (!validIds) { // 若过滤后无有效ID，直接返回
            ElMessage.warning('没有选中有效的地址');
            return;
        }

        const confirm = await ElMessageBox.confirm(
            `确定要删除选中的${validIds.split(',').length}个地址吗？`,
            '批量删除确认',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        );

        if (confirm === 'confirm') {
            const res = await deleteAddressesApi(validIds); // 传递过滤后的ID字符串
            if (res.code === 1 && res.data) {
                ElMessage.success('批量删除成功');
                selectedAddressIds.value = [];
                fetchAddressList();
            } else {
                ElMessage.error('批量删除失败');
            }
        }
    } catch (error) {
        if (error !== 'cancel') console.error('批量删除失败：', error);
    }
};
// 全选/取消全选
const handleCheckAllChange = (val) => {
    addressList.value.forEach(addr => {
        if (val) {
            selectedAddressIds.value.push(addr.id);
        }
    });
    if (!val) {
        selectedAddressIds.value = [];
    }
    isIndeterminate.value = false;
};

// 单个选择变化
const handleItemChange = () => {
    const total = addressList.value.length;
    const selected = selectedAddressIds.value.length;
    isIndeterminate.value = selected > 0 && selected < total;
};

// 页面挂载时获取地址列表
onMounted(() => {
    fetchAddressList();
});
</script>

<style scoped>
.address-page {
    padding: 20px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    min-height: 100%;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    animation: fadeInUp 0.5s ease-out;
    position: relative;
    overflow: hidden;
}

.address-page::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    z-index: -1;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid rgba(102, 126, 234, 0.2);
    padding-bottom: 15px;
    position: relative;
}

.card-header::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 2px;
}

.card-header h2 {
    margin: 0;
    font-size: 20px;
    color: #333;
    font-weight: 600;
}

/* 地址列表 */
.address-list {
    margin-top: 25px;
}

.batch-select {
    margin-bottom: 20px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(102, 126, 234, 0.1);
    display: flex;
    align-items: center;
    gap: 15px;
}

.address-card {
    display: flex;
    align-items: flex-start;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 15px;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(102, 126, 234, 0.1);
    animation: slideInUp 0.3s ease-out;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
}

.address-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transform: scaleX(0);
    transition: transform 0.3s ease;
    transform-origin: left;
}

.address-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.address-card:hover::before {
    transform: scaleX(1);
}

.address-card .el-checkbox {
    margin-top: 3px;
    margin-right: 20px;
}

.address-info {
    flex: 1;
}

.address-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.recipient {
    font-weight: 600;
    color: #333;
    font-size: 16px;
}

.default-tag {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
    color: #667eea;
    font-size: 12px;
    padding: 4px 12px;
    border-radius: 20px;
    font-weight: 500;
}

.address-detail {
    color: #555;
    line-height: 1.6;
    font-size: 14px;
}

.postal-code {
    margin-left: 10px;
    color: #777;
    font-size: 12px;
}

.address-actions {
    display: flex;
    gap: 15px;
    white-space: nowrap;
}

/* 自定义按钮样式 */
:deep(.el-button--primary) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
}

:deep(.el-button--primary::before) {
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

:deep(.el-button--primary:hover::before) {
    transform: translateX(100%);
}

:deep(.el-button--primary:hover) {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(102, 126, 234, 0.4);
}

:deep(.el-button--text) {
    color: #667eea !important;
    transition: all 0.3s;
}

:deep(.el-button--text:hover) {
    color: #764ba2 !important;
    transform: translateY(-1px);
}

:deep(.el-button--text.danger) {
    color: #ff4d4f !important;
}

:deep(.el-button--text.danger:hover) {
    color: #d9363e !important;
}

/* 空状态 */
.empty-address {
    padding: 50px 0;
    text-align: center;
}

/* 弹窗表单 */
:deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

:deep(.el-dialog__header) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 20px;
}

:deep(.el-dialog__title) {
    color: white;
    font-weight: 500;
}

:deep(.el-dialog__body) {
    padding: 25px;
}

:deep(.el-form-item) {
    margin-bottom: 20px;
}

:deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(102, 126, 234, 0.2);
    transition: all 0.3s;
}

:deep(.el-input__wrapper:hover) {
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.4);
}

:deep(.el-textarea__inner) {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(102, 126, 234, 0.2);
    transition: all 0.3s;
}

:deep(.el-textarea__inner:hover) {
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.4);
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
    .address-page {
        padding: 15px;
    }
    
    .address-card {
        flex-direction: column;
        gap: 15px;
    }
    
    .address-actions {
        align-self: flex-end;
    }
    
    .batch-select {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
}
</style>