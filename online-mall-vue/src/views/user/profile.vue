<template>
    <div class="profile-page">
        <el-card>
            <div slot="header" class="card-header">
                <h2>编辑个人信息</h2>
            </div>

            <el-form :model="userForm" :rules="formRules" ref="profileFormRef" label-width="120px" class="profile-form">
                <!-- 头像上传 -->
                <el-form-item label="头像">
                    <el-upload class="avatar-uploader" action="/api/image/upload" :show-file-list="false"
                        :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                        <img v-if="userForm.image" :src="userForm.image" class="avatar" />
                        <el-icon v-else class="avatar-uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                    <div class="form-hint">支持 JPG、PNG 格式，大小不超过 2MB</div>
                </el-form-item>

                <!-- 昵称 -->
                <el-form-item label="昵称" prop="nickName">
                    <el-input v-model="userForm.nickName" placeholder="请输入昵称" clearable />
                </el-form-item>

                <!-- 性别（新增） -->
                <el-form-item label="性别" prop="gender">
                    <el-radio-group v-model="userForm.gender" size="default">
                        <el-radio :label="0">女</el-radio>
                        <el-radio :label="1">男</el-radio>
                        <el-radio :label="2">其它</el-radio>
                    </el-radio-group>
                </el-form-item>

                <!-- 邮箱 -->
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="userForm.email" placeholder="请输入邮箱" clearable />
                    <div class="form-hint">用于接收系统通知</div>
                </el-form-item>

                <!-- 手机号 -->
                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="userForm.phone" placeholder="请输入手机号" clearable />
                </el-form-item>

                <!-- 生日 -->
                <el-form-item label="生日" prop="birthday">
                    <el-date-picker v-model="userForm.birthday" type="date" placeholder="选择生日" format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD" />
                </el-form-item>

                <!-- 地址 -->
                <el-form-item label="地址" prop="address">
                    <el-input v-model="userForm.address" placeholder="请输入详细地址" clearable type="textarea" rows="3" />
                </el-form-item>

                <!-- 操作按钮 -->
                <el-form-item>
                    <el-button type="primary" @click="handleSubmit">保存修改</el-button>
                    <el-button @click="handleReset">重置</el-button>
                    <el-button type="text" @click="$router.back()">取消</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
    ElMessage, ElForm, ElFormItem, ElInput, ElButton,
    ElDatePicker, ElUpload, ElIcon, ElRadioGroup, ElRadio
} from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { getUserApi, updateUserApi } from '@/api/user';

// 表单引用
const profileFormRef = ref(null);
// 路由实例
const router = useRouter();

// 表单数据（新增gender字段）
const userForm = ref({
    image: '',       // 头像URL
    nickName: '',    // 昵称
    gender: 0,       // 性别（0-保密，1-男，2-女）新增
    email: '',       // 邮箱
    phone: '',       // 手机号
    birthday: null,  // 生日
    address: ''      // 地址
});

// 表单验证规则（新增性别规则，可选）
const formRules = ref({
    nickName: [
        { max: 30, message: '昵称长度不能超过30个字符', trigger: 'blur' }
    ],
    gender: [
        { type: 'number', message: '请选择性别', trigger: 'change' } // 可选：限制必须选择
    ],
    email: [
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    phone: [
        {
            pattern: /^1[3-9]\d{9}$/,
            message: '请输入正确的手机号格式',
            trigger: 'blur'
        }
    ],
    address: [
        { max: 200, message: '地址长度不能超过200个字符', trigger: 'blur' }
    ]
});

// 获取用户信息（回显性别字段）
const fetchUserInfo = async () => {
    try {
        const res = await getUserApi();
        if (res.code === 1) {
            // 回显所有字段（包含新增的gender）
            const { nickName, email, phone, birthday, address, image, gender } = res.data;
            userForm.value = {
                nickName,
                email,
                phone,
                birthday,
                address,
                image,
                gender: gender ?? 0  // 默认为保密
            };
        } else {
            ElMessage.error(res.msg || '获取用户信息失败');
        }
    } catch (error) {
        ElMessage.error('获取用户信息失败');
        console.error(error);
    }
};

// 头像上传成功回调
const handleAvatarSuccess = (response) => {
    if (response.code === 1) {
        userForm.value.image = response.data;
        ElMessage.success('头像上传成功');
    } else {
        ElMessage.error('头像上传失败：' + (response.msg || '未知错误'));
    }
};

// 头像上传前校验
const beforeAvatarUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        ElMessage.error('仅支持 JPG/PNG 格式的图片');
        return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        ElMessage.error('图片大小不能超过 2MB');
        return false;
    }
    return true;
};

// 提交修改（包含性别字段）
const handleSubmit = async () => {
    try {
        await profileFormRef.value.validate();

        // 构造提交数据（自动包含gender字段）
        const submitData = { ...userForm.value };

        const res = await updateUserApi(submitData);

        if (res.code === 1) {
            ElMessage.success('修改成功');
            location.href = "/user/profile";
        } else {
            ElMessage.error(res.msg || '修改失败');
        }
    } catch (error) {
        console.error('表单验证失败：', error);
    }
};

// 重置表单（包含性别）
const handleReset = () => {
    profileFormRef.value.resetFields();
    fetchUserInfo().then(() => {
        ElMessage.info('已重置为原始信息');
    });
};

// 页面挂载时回显数据
onMounted(() => {
    fetchUserInfo();
});
</script>

<style scoped>
/* 原有样式保持不变，新增性别选项的样式调整 */
.el-radio-group {
    display: flex;
    gap: 20px;
    /* 性别选项之间的间距 */
    margin-top: 5px;
}

.profile-page {
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

.profile-page::before {
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

.profile-form {
    margin-top: 25px;
}

.avatar-uploader {
    display: flex;
    align-items: center;
}

.avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba(102, 126, 234, 0.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
    position: relative;
    overflow: hidden;
}

.avatar::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s;
}

.avatar:hover {
    transform: scale(1.05);
}

.avatar:hover::before {
    opacity: 1;
}

.avatar-uploader-icon {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: #8c8c8c;
    border: 2px dashed rgba(102, 126, 234, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
}

.avatar-uploader-icon::before {
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

.avatar-uploader-icon:hover::before {
    transform: translateX(100%);
}

.avatar-uploader-icon:hover {
    background: rgba(102, 126, 234, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
    border-color: rgba(102, 126, 234, 0.5);
}

.form-hint {
    margin-top: 5px;
    font-size: 12px;
    color: #909399;
}

.el-form-item {
    margin-bottom: 25px;
}

/* 自定义输入框样式 */
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

:deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    border-color: rgba(102, 126, 234, 0.5);
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

:deep(.el-button) {
    border-radius: 8px;
    transition: all 0.3s;
}

:deep(.el-button:hover) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 自定义单选按钮样式 */
:deep(.el-radio__inner) {
    border-color: rgba(102, 126, 234, 0.3);
}

:deep(.el-radio__inner::after) {
    background-color: #667eea;
}

:deep(.el-radio.is-checked .el-radio__inner) {
    border-color: #667eea;
    background-color: #667eea;
}

/* 自定义日期选择器样式 */
:deep(.el-date-editor.el-input) {
    width: 100%;
}

/* 自定义文本域样式 */
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

:deep(.el-textarea__inner:focus) {
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    border-color: rgba(102, 126, 234, 0.5);
}

/* 适配小屏幕 */
@media (max-width: 768px) {
    .profile-page {
        padding: 15px;
    }
    
    .avatar-uploader-icon, .avatar {
        width: 100px;
        height: 100px;
    }
    
    .el-form-item {
        margin-bottom: 20px;
    }
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
</style>