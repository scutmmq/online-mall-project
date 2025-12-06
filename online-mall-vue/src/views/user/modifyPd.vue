<template>
    <div class="password-page">
        <el-card class="password-card">
            <div slot="header" class="card-header">
                <h2>修改密码</h2>
            </div>

            <el-form :model="passwordForm" :rules="formRules" ref="passwordFormRef" label-width="120px"
                class="password-form">
                <!-- 旧密码 -->
                <el-form-item label="当前密码" prop="oldPassword">
                    <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入当前密码" show-password />
                </el-form-item>

                <!-- 新密码 -->
                <el-form-item label="新密码" prop="newPassword">
                    <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码（6-20位）"
                        show-password />
                    <div class="form-hint">密码长度为6-20位，支持字母、数字和特殊字符</div>
                </el-form-item>

                <!-- 确认新密码 -->
                <el-form-item label="确认新密码" prop="confirmPassword">
                    <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码"
                        show-password />
                </el-form-item>

                <!-- 操作按钮 -->
                <el-form-item class="form-actions">
                    <el-button type="primary" @click="handleSubmit">确认修改</el-button>
                    <el-button @click="handleReset">重置</el-button>
                    <el-button type="text" @click="$router.back()">取消</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus';
import { modifyPasswordApi } from '@/api/user'; // 导入修改密码接口

// 表单引用
const passwordFormRef = ref(null);
// 路由实例
const router = useRouter();

// 表单数据（与接口参数对应）
const passwordForm = ref({
    oldPassword: '',      // 旧密码
    newPassword: '',      // 新密码
    confirmPassword: ''   // 确认新密码（前端校验用）
});

// 表单验证规则
const formRules = ref({
    oldPassword: [
        { required: true, message: '请输入当前密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在6-20位之间', trigger: 'blur' }
    ],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在6-20位之间', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                // 新密码不能与旧密码相同
                if (value && value === passwordForm.value.oldPassword) {
                    callback(new Error('新密码不能与当前密码相同'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ],
    confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                // 确认密码需与新密码一致
                if (value !== passwordForm.value.newPassword) {
                    callback(new Error('两次输入的新密码不一致'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ]
});

// 提交修改
const handleSubmit = async () => {
    try {
        // 表单验证
        await passwordFormRef.value.validate();

        // 构造接口参数（仅传递oldPassword和newPassword）
        const submitData = {
            oldPassword: passwordForm.value.oldPassword,
            newPassword: passwordForm.value.newPassword
        };

        // 调用修改密码接口
        const res = await modifyPasswordApi(submitData);

        if (res.code === 1) {
            ElMessage.success('密码修改成功，请重新登录');
            // 密码修改成功后跳转到登录页（通常需要重新登录）
            localStorage.removeItem('token');
            setTimeout(() => {
                router.push('/login');
            }, 1500);
        } else {
            ElMessage.error(res.msg || '密码修改失败');
        }
    } catch (error) {
        // 表单验证失败不处理（Element会自动提示）
        console.error('表单验证失败：', error);
    }
};

// 重置表单
const handleReset = () => {
    passwordFormRef.value.resetFields();
};
</script>

<style scoped>
.password-page {
    padding: 20px;
    min-height: 100%;
    max-width: 600px;
    /* 限制最大宽度，避免在宽屏上太宽 */
    margin: 20px auto;
    /* 居中显示 */
}

.password-card {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.2);
    animation: fadeInUp 0.5s ease-out;
}

.card-header {
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}

.card-header h2 {
    margin: 0;
    font-size: 20px;
    color: #333;
    font-weight: 600;
    text-align: center;
}

.password-form {
    margin-top: 20px;
}

.form-hint {
    margin-top: 5px;
    font-size: 12px;
    color: #909399;
}

.el-form-item {
    margin-bottom: 20px;
}

.form-actions {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 30px;
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

/* 响应式调整 */
@media (max-width: 768px) {
    .password-page {
        padding: 15px;
        margin: 10px auto;
    }

    .password-card {
        border-radius: 8px;
    }

    .card-header h2 {
        font-size: 18px;
    }

    .form-actions {
        flex-direction: column;
        align-items: center;
    }

    .el-button {
        width: 100%;
        margin-bottom: 10px;
    }
}
</style>