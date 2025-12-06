<script setup>
import { ref, computed } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElRadioGroup, ElRadio, ElMessage } from 'element-plus';
import { loginApi } from '@/api/login';
import router from '@/router/router';
// 登录表单数据
const loginForm = ref({
    login: '',    // 账号/邮箱/手机号
    password: ''  // 密码
});

// 登录类型（0-账号，1-邮箱，2-电话）
const loginType = ref(0);

// 动态生成输入框占位符（根据登录类型）
const getPlaceholder = computed(() => {
    switch (loginType.value) {
        case 0: return '请输入账号';
        case 1: return '请输入邮箱';
        case 2: return '请输入电话号码';
    }
});

const rules = computed(() => ({

    // 账号/邮箱/手机号的验证规则
    login: [
        { required: true, message: '请输入内容', trigger: ['blur', 'change'] },
        // 邮箱登录时验证邮箱格式
        ...(loginType.value == 1 ? [{ type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] }] : []),
        // 手机号登录时验证手机号格式
        ...(loginType.value == 2 ? [{
            pattern: /^1[3-9]\d{9}$/,  // 手机号正则：1开头，第二位3-9，后9位数字
            message: '请输入正确的手机号格式',
            trigger: ['blur', 'change']
        }] : [])
    ],
    // 密码的验证规则（仅账号/邮箱登录时生效）
    password: [
        { required: true, message: '请输入密码', trigger: ['blur', 'change'] },
        {
            min: 6,
            max: 20,
            message: '密码长度在6-20之间',
            trigger: 'blur',
        }
    ]

}))
const loginFormRef = ref()
// 登录逻辑
const handleLogin = async () => {
    loading.value = true
    const isValid = loginFormRef.value.validate();
    if (isValid) {
        loginForm.value.loginType = loginType.value;
        console.log("登录: ", loginForm)
        const result = await loginApi(loginForm.value)
        if (result.code == 1) {
            ElMessage({
                message: "登陆成功!",
                type: "success"
            })
            console.log(result.data)
            // 存token
            localStorage.setItem('token', result.data.token)
            location.href = "/home"
        }
        else {
            ElMessage({
                message: result.msg,
                type: "error"
            })
            loading.value = false;
        }
    }
};

// 重置逻辑
const handleReset = () => {
    loginType.value = 0
    loginForm.value = { login: '', password: '' };
    if (loginFormRef.value) {
        loginFormRef.value.resetFields();
    }
};

// 输入时触发验证（确保内容变化时立即校验）
const handleInput = () => {
    loginFormRef.value.validateField('login');
};

const loading = ref(false)
</script>

<template>
    <!-- 外层容器：让表单在屏幕中央 -->
    <div class="login-page">
        <!-- 表单容器：限制宽度，方便居中 -->
        <div class="form-container">
            <h2 align="center">用户登录</h2>
            <ElForm :model="loginForm" class="login-form" label-position="left" :rules="rules" ref="loginFormRef">

                <!-- 账号输入框（单列） -->
                <ElFormItem class="form-item" prop="login">
                    <ElInput v-model="loginForm.login" :placeholder="getPlaceholder"></ElInput>
                </ElFormItem>

                <!-- 密码输入框（单列，仅账号/邮箱登录显示） -->
                <ElFormItem class="form-item" prop="password">
                    <ElInput v-model="loginForm.password" type="password" placeholder="请输入密码" show-password />
                </ElFormItem>

                <!-- 按钮区域（靠右显示） -->
                <ElFormItem class="button-group">
                    <ElButton type="primary" @click="handleLogin" v-loading.fullscreen.lock="loading">登录</ElButton>
                    <ElButton type="default" @click="handleReset" style="margin-left: 10px;">重置</ElButton>
                </ElFormItem>

                <!-- 登录方式选项（居中显示） -->
                <ElFormItem class="radio-group">
                    <ElRadioGroup v-model="loginType" @change="handleInput">
                        <ElRadio :value="0">账号登录</ElRadio>
                        <ElRadio :value="1">邮箱登录</ElRadio>
                        <ElRadio :value="2">电话登录</ElRadio>
                    </ElRadioGroup>
                </ElFormItem>
            </ElForm>

            <!-- 已有账号 -->
            <div class="login-link">
                没有账号？<el-link href="/regist">注册账号</el-link>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 屏幕居中：让表单在页面垂直+水平居中 */
.login-page {
    display: flex;
    justify-content: center;
    /* 水平居中 */
    align-items: center;
    /* 垂直居中 */
    min-height: 100vh;
    /* 占满屏幕高度 */
    background-color: #f5f7fa;
    /* 背景色 */
}

/* 表单容器：限制宽度，添加样式 */
.form-container {
    width: 400px;
    /* 表单宽度 */
    padding: 30px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    /* 阴影 */
}

/* 输入项：单列显示，占满宽度 */
.form-item {
    width: 100%;
    /* 输入框占满表单宽度 */
}

/* 按钮组：靠右显示 */
.button-group {
    display: flex;
    justify-content: flex-end;
    /* 按钮靠右 */
    margin-top: 15px;
}

/* 单选框组：居中显示 */
.radio-group {
    display: flex;
    justify-content: center;
    /* 选项居中 */
    margin-top: 20px;
}

/* 单选框之间的间距 */
.radio-group :deep(.el-radio) {
    margin: 0 15px;
    /* 左右间距 */
}
</style>