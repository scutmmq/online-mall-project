<template>
    <div class="merchant-register-container">
        <el-card class="register-card">
            <div class="title">商家注册</div>

            <el-form ref="merchantFormRef" :model="merchantForm" :rules="rules" label-width="120px"
                class="register-form">
                <el-form-item label="店铺名称" prop="name">
                    <el-input v-model="merchantForm.name" placeholder="请输入店铺名称" maxlength="50"></el-input>
                </el-form-item>

                <el-form-item label="店铺描述" prop="description">
                    <el-input v-model="merchantForm.description" placeholder="请输入店铺描述" type="textarea" rows="3"
                        maxlength="200"></el-input>
                </el-form-item>

                <el-form-item label="商家Logo" prop="logo">
                    <el-upload
                        class="logo-uploader"
                        action="/api/image/upload"
                        :show-file-list="false"
                        :on-success="handleLogoSuccess"
                        :on-error="handleLogoError"
                        :before-upload="beforeLogoUpload"
                        accept="image/*">
                        <img v-if="merchantForm.logo" :src="merchantForm.logo" class="logo-preview" />
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

                <el-form-item label="营业执照号" prop="businessLicense">
                    <el-input v-model="merchantForm.businessLicense" placeholder="请输入营业执照号" maxlength="50"></el-input>
                </el-form-item>

                <el-form-item label="商家类型" prop="merchantType">
                    <el-select v-model="merchantForm.merchantType" placeholder="请选择商家类型">
                        <el-option label="个人" :value="1"></el-option>
                        <el-option label="企业" :value="2"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item class="form-actions">
                    <el-button type="primary" @click="handleRegister" :loading="loading">
                        提交注册
                    </el-button>
                    <el-button @click="resetForm" style="margin-left: 10px">
                        重置
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { registerMerchant } from '@/api/merchant'; // 导入注册接口

// 路由实例
const router = useRouter();

// 表单引用
const merchantFormRef = ref(null);

// 加载状态
const loading = ref(false);

// 表单数据
const merchantForm = reactive({
    name: '',
    description: '',
    logo: '', // 商家Logo
    contactPerson: '',
    contactPhone: '',
    email: '',
    address: '',
    businessLicense: '',
    merchantType: 1 // 默认官方旗舰店
});

// 表单验证规则
const rules = {
    name: [
        { required: true, message: '请输入店铺名称', trigger: 'blur' },
        { min: 2, max: 50, message: '店铺名称长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    description: [
        { required: true, message: '请输入店铺描述', trigger: 'blur' },
        { min: 5, max: 200, message: '店铺描述长度在 5 到 200 个字符', trigger: 'blur' }
    ],
    logo: [
        { required: true, message: '请上传商家Logo', trigger: 'change' }
    ],
    contactPerson: [
        { required: true, message: '请输入联系人姓名', trigger: 'blur' },
        { min: 2, max: 20, message: '联系人姓名长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    contactPhone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ],
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ],
    address: [
        { required: true, message: '请输入店铺地址', trigger: 'blur' },
        { min: 5, max: 100, message: '店铺地址长度在 5 到 100 个字符', trigger: 'blur' }
    ],
    businessLicense: [
        { required: true, message: '请输入营业执照号', trigger: 'blur' },
        { min: 5, max: 50, message: '营业执照号长度在 5 到 50 个字符', trigger: 'blur' }
    ],
    merchantType: [
        { required: true, message: '请选择商家类型', trigger: 'change' }
    ]
};

// 提交注册
const handleRegister = async () => {
    // 表单验证
    if (!merchantFormRef.value) return;

    try {
        await merchantFormRef.value.validate();
        loading.value = true;

        // 调用注册接口
        const result = await registerMerchant(merchantForm);

        if (result.code === 1) {
            ElMessage.success('商家注册成功！');
            // 注册成功后跳转到首页
            location.href('/merchant/me')
        } else {
            ElMessage.error(result.msg || '注册失败，请稍后重试');
        }
    } catch (error) {
        if (error.name === 'Error') {
            // 接口请求错误
            ElMessage.error('网络错误，请稍后重试');
        } else {
            // 表单验证错误
            return false;
        }
    } finally {
        loading.value = false;
    }
};

// Logo上传成功回调
const handleLogoSuccess = (response, uploadFile, uploadFiles) => {
    if (response.code === 1 && response.data) {
        merchantForm.logo = response.data;
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

// 重置表单
const resetForm = () => {
    if (merchantFormRef.value) {
        merchantFormRef.value.resetFields();
        merchantForm.logo = ''; // 清空Logo
    }
};
</script>

<style scoped>
.merchant-register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 50px);
    /* 减去头部高度 */
    padding: 20px;
    background-color: #f5f7fa;
}

.register-card {
    width: 100%;
    max-width: 700px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
}

.title {
    text-align: center;
    font-size: 20px;
    font-weight: 600;
    padding: 20px 0;
    border-bottom: 1px solid #eee;
    color: #333;
}

.register-form {
    padding: 30px 40px;
}

.form-actions {
    display: flex;
    justify-content: center;
    margin-top: 20px;
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