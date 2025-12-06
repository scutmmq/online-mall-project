<template>
    <div class="merchant-profile">
        <el-card>
            <template #header>
                <h2>商店信息修改</h2>
            </template>

            <!-- 加载状态 -->
            <el-skeleton v-if="loading" :rows="8" style="width: 100%"></el-skeleton>

            <!-- 表单 -->
            <el-form v-else ref="formRef" :model="merchantForm" :rules="rules" label-width="120px" class="profile-form">
                <!-- 基本信息 -->
                <el-form-item label="商店名称" prop="name">
                    <el-input v-model="merchantForm.name" placeholder="请输入商店名称" maxlength="50"></el-input>
                </el-form-item>

                <el-form-item label="商店描述" prop="description">
                    <el-input v-model="merchantForm.description" placeholder="请输入商店描述" type="textarea" rows="3"
                        maxlength="200"></el-input>
                </el-form-item>

                <!-- 新增Logo上传 -->
                <el-form-item label="商家Logo" prop="logoUrl">
                    <el-upload
                        class="logo-uploader"
                        action="/api/image/upload"
                        :show-file-list="false"
                        :on-success="handleLogoSuccess"
                        :on-error="handleLogoError"
                        :before-upload="beforeLogoUpload"
                        accept="image/*">
                        <img v-if="merchantForm.logoUrl" :src="merchantForm.logoUrl" class="logo-preview" />
                        <div v-else class="logo-upload-placeholder">
                            <i class="el-icon-plus"></i>
                            <div class="upload-text">上传Logo</div>
                        </div>
                    </el-upload>
                    <div class="upload-tip">建议上传正方形图片，支持jpg、png格式，大小不超过2MB</div>
                </el-form-item>

                <el-form-item label="联系人" prop="contactPerson">
                    <el-input v-model="merchantForm.contactPerson" placeholder="请输入联系人姓名" maxlength="20"></el-input>
                </el-form-item>

                <el-form-item label="联系电话" prop="contactPhone">
                    <el-input v-model="merchantForm.contactPhone" placeholder="请输入联系电话" maxlength="11"></el-input>
                </el-form-item>

                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="merchantForm.email" placeholder="请输入邮箱地址" type="email"></el-input>
                </el-form-item>

                <el-form-item label="店铺地址" prop="address">
                    <el-input v-model="merchantForm.address" placeholder="请输入店铺详细地址" maxlength="100"></el-input>
                </el-form-item>

                <el-form-item label="营业执照" prop="businessLicense">
                    <el-input v-model="merchantForm.businessLicense" placeholder="请输入营业执照编号"></el-input>
                </el-form-item>

                <el-form-item label="商家类型" prop="merchantType">
                    <el-select v-model="merchantForm.merchantType" placeholder="请选择商家类型">
                        <el-option label="个人" :value="1"></el-option>
                        <el-option label="企业" :value="2"></el-option>
                    </el-select>
                </el-form-item>

                <!-- 提交按钮 -->
                <el-form-item>
                    <el-button type="primary" @click="handleSubmit">保存修改</el-button>
                    <el-button @click="handleReset">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive, toRefs } from 'vue';
import { getMerchantOfMe } from '@/api/merchant'; // 获取当前商家信息
import { updateMerchant } from '@/api/merchant'; // 更新商家信息的接口
import { ElMessage, ElMessageBox } from 'element-plus';

// 表单引用
const formRef = ref(null);

// 状态管理
const state = reactive({
    loading: true,
    merchantForm: {
        id: '', // 商家ID（用于后端定位修改对象）
        name: '',
        description: '',
        logoUrl: '', // 修改字段名为logoUrl
        contactPerson: '',
        contactPhone: '',
        email: '',
        address: '',
        businessLicense: '',
        merchantType: null // 修改为数字类型
    }
});
const { loading, merchantForm } = toRefs(state);

// 表单验证规则
const rules = {
    name: [
        { required: true, message: '请输入商店名称', trigger: 'blur' },
        { min: 2, max: 50, message: '名称长度在 2-50 个字符之间', trigger: 'blur' }
    ],
    contactPerson: [
        { required: true, message: '请输入联系人', trigger: 'blur' }
    ],
    contactPhone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    merchantType: [
        { required: true, message: '请选择商家类型', trigger: 'change' }
    ],
    logoUrl: [
        { required: false, message: '请上传商家Logo', trigger: 'change' }
    ]
};

// Logo上传成功回调
const handleLogoSuccess = (response, uploadFile, uploadFiles) => {
    if (response.code === 1 && response.data) {
        state.merchantForm.logoUrl = response.data; // 修改字段名为logoUrl
        ElMessage.success('Logo上传成功');
    } else {
        ElMessage.error(response.msg || 'Logo上传失败');
    }
};

// Logo上传失败回调
const handleLogoError = (error, uploadFile, uploadFiles) => {
    ElMessage.error('Logo上传失败，请重试');
};

// Logo上传前验证
const beforeLogoUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isImage) {
        ElMessage.error('只能上传图片文件!');
        return false;
    }
    if (!isLt2M) {
        ElMessage.error('图片大小不能超过 2MB!');
        return false;
    }
    return true;
};

// 初始化：获取当前商家信息并回显到表单
const initForm = async () => {
    try {
        state.loading = true;
        const res = await getMerchantOfMe();
        if (res.code === 1) {
            // 回显数据（仅赋值需要修改的字段）
            const {
                id, name, description, logoUrl, contactPerson, contactPhone, // 修改字段名为logoUrl
                email, address, businessLicense, merchantType
            } = res.data;
            
            // 转换商家类型为数字
            let merchantTypeValue = merchantType;
            if (typeof merchantType === 'string') {
                if (merchantType === '个人') {
                    merchantTypeValue = 1;
                } else if (merchantType === '企业') {
                    merchantTypeValue = 2;
                }
            }
            
            state.merchantForm = {
                id, // 必须传递ID给后端，用于定位修改对象
                name,
                description,
                logoUrl: logoUrl || '', // 修改字段名为logoUrl
                contactPerson,
                contactPhone,
                email,
                address,
                businessLicense,
                merchantType: merchantTypeValue
            };
        } else {
            ElMessage.error('获取商家信息失败：' + res.msg);
        }
    } catch (err) {
        console.error('获取商家信息失败', err);
        ElMessage.error('网络错误，无法加载信息');
    } finally {
        state.loading = false;
    }
};

// 提交表单
const handleSubmit = async () => {
    // 表单验证
    if (!formRef.value) return;
    const valid = await formRef.value.validate();
    if (!valid) return;

    try {
        state.loading = true;
        const res = await updateMerchant(state.merchantForm);
        if (res.code === 1) {
            ElMessage.success('修改成功！');
        } else {
            ElMessage.error('修改失败：' + res.msg);
        }
    } catch (err) {
        console.error('修改商家信息失败', err);
        ElMessage.error('网络错误，修改失败');
    } finally {
        state.loading = false;
    }
};

// 重置表单
const handleReset = () => {
    if (formRef.value) {
        formRef.value.resetFields();
        ElMessage.info('已重置表单');
    }
};

// 页面加载时初始化表单
onMounted(() => {
    initForm();
});
</script>

<style scoped>
.merchant-profile {
    padding: 20px;
}

.profile-form {
    margin-top: 20px;
}

/* 调整表单项间距 */
:deep(.el-form-item) {
    margin-bottom: 18px;
}

/* Logo上传样式 */
.logo-uploader {
    display: inline-block;
}

.logo-preview {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #dcdfe6;
    cursor: pointer;
    transition: all 0.3s ease;
}

.logo-preview:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.logo-upload-placeholder {
    width: 120px;
    height: 120px;
    border: 1px dashed #dcdfe6;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background-color: #fafafa;
    transition: all 0.3s ease;
}

.logo-upload-placeholder:hover {
    border-color: #409eff;
    background-color: #f0f8ff;
}

.logo-upload-placeholder i {
    font-size: 32px;
    color: #999;
    margin-bottom: 8px;
}

.upload-text {
    font-size: 14px;
    color: #666;
}

.upload-tip {
    font-size: 12px;
    color: #999;
    margin-top: 8px;
    line-height: 1.5;
}
</style>