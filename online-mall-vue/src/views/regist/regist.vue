<template>
    <div class="register-page">
        <div class="register-card">
            <h2>用户注册</h2>
            <el-form :model="userForm" :rules="formRules" ref="registerFormRef" label-width="100px"
                class="register-form">
                <!-- 用户名 -->
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="userForm.username" placeholder="请输入账号" clearable />
                </el-form-item>

                <!-- 密码 -->
                <el-form-item label="密码" prop="password">
                    <el-input v-model="userForm.password" type="password" placeholder="请输入密码（6-20位）" show-password />
                </el-form-item>

                <!-- 确认密码 -->
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="userForm.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
                </el-form-item>

                <!-- 昵称（新增，非必填） -->
                <el-form-item label="昵称" prop="nickName">
                    <el-input v-model="userForm.nickName" placeholder="请输入昵称（选填，为空时自动生成）" clearable />
                </el-form-item>

                <!-- 邮箱（可选） -->
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="userForm.email" placeholder="请输入邮箱（必填）" clearable />
                </el-form-item>

                <!-- 手机号（可选） -->
                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="userForm.phone" placeholder="请输入手机号（必填）" clearable />
                </el-form-item>

                <!-- 性别 -->
                <el-form-item label="性别" prop="gender">
                    <el-radio-group v-model="userForm.gender">
                        <el-radio :label="0">男</el-radio>
                        <el-radio :label="1">女</el-radio>
                        <el-radio :label="2">其他</el-radio>
                    </el-radio-group>
                </el-form-item>

                <!-- 生日（可选） -->
                <el-form-item label="生日" prop="birthday">
                    <el-date-picker v-model="userForm.birthday" type="date" placeholder="选择生日" format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD" />
                </el-form-item>

                <!-- 头像上传（新增，非必填） -->
                <el-form-item label="头像" prop="image">
                    <el-upload class="avatar-uploader" action="/api/image/upload" :show-file-list="false"
                        :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                        <img v-if="userForm.image" :src="userForm.image" class="avatar" />
                        <el-icon v-else class="avatar-uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                    <div class="upload-tip">支持 JPG、PNG 格式，大小不超过 2MB</div>
                </el-form-item>

                <!-- 注册按钮 -->
                <el-form-item>
                    <el-button type="primary" class="register-btn" @click="handleRegister">
                        注册
                    </el-button>
                    <el-button type="default" @click="handleReset" style="margin-left: 10px">
                        重置
                    </el-button>
                </el-form-item>

                <!-- 已有账号 -->
                <div class="login-link">
                    已有账号？<el-link @click="toLogin">立即登录</el-link>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
    ElForm, ElFormItem, ElInput, ElButton, ElRadioGroup, ElRadio,
    ElDatePicker, ElLink, ElMessage, ElUpload, ElIcon
} from 'element-plus';
import { Plus } from '@element-plus/icons-vue';  // 导入加号图标
import request from '@/utils/request'; // 导入请求工具

// 路由实例
const router = useRouter();

// 表单数据（新增 nickName 和 image）
const userForm = ref({
    username: '',       // 账号（必填）
    password: '',       // 密码（必填）
    confirmPassword: '',// 确认密码（前端校验用）
    nickName: '',       // 昵称（新增，非必填）
    email: '',          // 邮箱（选填）
    phone: '',          // 手机号（选填）
    gender: 0,          // 性别（默认男）
    birthday: null,     // 生日（选填）
    image: ''           // 头像URL（新增，非必填）
});

// 表单引用
const registerFormRef = ref(null);

// 表单验证规则（新增 nickName 规则）
const formRules = ref({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        {
            pattern: /^[0-9a-zA-Z]{5,20}$/,  // 修正后的正则
            message: '用户名只能包含数字、大小写字母,长度5-20位',
            trigger: ['blur', 'change']
        }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在6-20之间', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value !== userForm.value.password) {
                    callback(new Error('两次输入的密码不一致'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ],
    nickName: [  // 新增昵称规则（非必填，长度限制）
        { max: 30, message: '昵称长度不超过30位', trigger: 'blur' }
    ],
    email: [
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur', required: true }
    ],
    phone: [
        {
            pattern: /^1[3-9]\d{9}$/,
            message: '请输入正确的手机号格式',
            trigger: 'blur',
            required: true
        }
    ]
});

// 头像上传成功回调（新增）
const handleAvatarSuccess = (response, file) => {
    // 假设后端返回格式：{ code: 200, data: 'https://xxx.com/avatar.jpg' }
    if (response.code == 1) {
        userForm.value.image = response.data;  // 保存头像URL
        ElMessage.success('头像上传成功');
    } else {
        ElMessage.error('头像上传失败：' + (response.msg || '未知错误'));
    }
};

// 头像上传前校验（新增）
const beforeAvatarUpload = (file) => {
    // 校验文件类型
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        ElMessage.error('仅支持 JPG/PNG 格式的图片');
        return false;
    }
    // 校验文件大小（2MB）
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        ElMessage.error('图片大小不能超过 2MB');
        return false;
    }
    return true;  // 允许上传
};

// 注册提交（包含新增字段）
const handleRegister = async () => {
    try {
        // 表单验证
        await registerFormRef.value.validate();

        // 构造提交数据（包含 nickName 和 image）
        const submitData = {
            username: userForm.value.username,
            password: userForm.value.password,
            nickName: userForm.value.nickName,  // 新增：昵称
            email: userForm.value.email,
            phone: userForm.value.phone,
            gender: userForm.value.gender,
            birthday: userForm.value.birthday,
            image: userForm.value.image         // 新增：头像URL
        };

        // 调用注册接口
        const res = await request.post('/user/register', submitData);
        console.log(res)

        if (res.code == 1) {
            ElMessage.success('注册成功！即将跳转到登录页');
            // 延迟1秒跳转登录页
            setTimeout(() => {
                router.push('/login');
            }, 1000);
        } else {
            ElMessage.error(res.msg || '注册失败，请重试');
        }
    } catch (error) {
        console.error('注册验证失败：', res.msg);
    }
};

// 重置表单（清空新增字段）
const handleReset = () => {
    registerFormRef.value.resetFields();
    userForm.value.image = '';  // 单独清空头像（resetFields 可能不生效）
};

// 跳转到登录页
const toLogin = () => {
    router.push('/login');
};
</script>

<style scoped>
/* 页面容器：居中显示 */
.register-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f7fa;
    padding: 20px;
}

/* 注册卡片样式 */
.register-card {
    width: 500px;
    padding: 30px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 标题样式 */
.register-card h2 {
    text-align: center;
    margin-bottom: 25px;
    color: #303133;
}

/* 表单样式 */
.register-form {
    width: 100%;
}

/* 注册按钮 */
.register-btn {
    width: 100%;
}

/* 登录链接 */
.login-link {
    text-align: center;
    margin-top: 15px;
    color: #606266;
}

/* 头像上传样式（新增） */
.avatar-uploader {
    display: flex;
    align-items: center;
}

.avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    /* 圆形头像 */
    object-fit: cover;
    /* 保持图片比例 */
}

.avatar-uploader-icon {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: #f5f7fa;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #8c8c8c;
}

.upload-tip {
    margin-top: 10px;
    font-size: 12px;
    color: #909399;
}
</style>