<!-- views/user/main.vue -->
<template>
    <div class="user-home">
        <!-- 用户信息卡片 -->
        <el-card class="user-card">
            <div class="user-info-container">
                <!-- 头像区域 -->
                <div class="avatar-section">
                    <el-avatar :size="100" class="user-avatar">
                        <img :src="userInfo.image || defaultAvatar" alt="用户头像" class="avatar-img">
                    </el-avatar>
                </div>

                <!-- 信息列表 -->
                <div class="info-list">
                    <h2 class="title">个人信息</h2>

                    <el-descriptions column="1" border>
                        <el-descriptions-item label="账号">
                            {{ userInfo.username || '-' }}
                        </el-descriptions-item>
                        <el-descriptions-item label="昵称">
                            {{ userInfo.nickName || '-' }}
                        </el-descriptions-item>
                        <el-descriptions-item label="性别">
                            {{ genderMap[userInfo.gender] || '未知' }}
                        </el-descriptions-item>
                        <el-descriptions-item label="手机号">
                            {{ userInfo.phone || '-' }}
                        </el-descriptions-item>
                        <el-descriptions-item label="生日">
                            {{ userInfo.birthday ? formatDate(userInfo.birthday) : '-' }}
                        </el-descriptions-item>
                        <el-descriptions-item label="地址">
                            {{ userInfo.address || '-' }}
                        </el-descriptions-item>
                        <el-descriptions-item label="最后登录时间">
                            {{ userInfo.lastLogin ? formatDate(userInfo.lastLogin) : '-' }}
                        </el-descriptions-item>
                    </el-descriptions>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getUserApi } from '@/api/user';

// 默认头像（接口返回image为空时使用）
const defaultAvatar = 'https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png';

// 用户信息（完全对应后端返回的data结构）
const userInfo = ref({});

// 性别映射（对应后端gender字段：0-男，1-女）
const genderMap = {
    0: '女',
    1: '男',
    2: '其他'
};

// 获取用户信息（仅调用/user接口）
const fetchUserInfo = async () => {
    try {
        const res = await getUserApi();
        if (res.code === 1) {
            // 直接赋值后端返回的data
            userInfo.value = res.data;
        } else {
            ElMessage.error(res.msg || '获取用户信息失败');
        }
    } catch (error) {
        ElMessage.error('获取用户信息失败');
        console.error(error);
    }
};

// 日期格式化（仅处理接口返回的时间格式）
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 页面挂载时获取用户信息
onMounted(() => {
    fetchUserInfo();
});
</script>

<style scoped>
.user-home {
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

.user-home::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    z-index: -1;
}

.user-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(102, 126, 234, 0.1);
    animation: slideInLeft 0.5s ease-out;
    position: relative;
    overflow: hidden;
}

.user-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transform: scaleX(0);
    transition: transform 0.3s ease;
    transform-origin: left;
}

.user-card:hover::before {
    transform: scaleX(1);
}

.user-info-container {
    display: flex;
    padding: 30px;
    gap: 40px;
    position: relative;
}

.avatar-section {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 10px;
}

.user-avatar {
    border: 4px solid rgba(102, 126, 234, 0.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
    position: relative;
    overflow: hidden;
}

.user-avatar::before {
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

.user-avatar:hover {
    transform: scale(1.05);
}

.user-avatar:hover::before {
    opacity: 1;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.info-list {
    flex: 1;
}

.title {
    margin: 0 0 25px 0;
    font-size: 20px;
    color: #333;
    font-weight: 600;
    padding-bottom: 15px;
    border-bottom: 2px solid rgba(102, 126, 234, 0.2);
    position: relative;
}

.title::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 2px;
}

/* 自定义描述列表样式 */
:deep(.el-descriptions__body) {
    background: rgba(255, 255, 255, 0.7) !important;
    border-radius: 8px !important;
    border: 1px solid rgba(102, 126, 234, 0.1) !important;
}

:deep(.el-descriptions__label) {
    background: rgba(102, 126, 234, 0.05) !important;
    font-weight: 500 !important;
    color: #555 !important;
}

:deep(.el-descriptions__content) {
    color: #333 !important;
}

/* 适配小屏幕 */
@media (max-width: 768px) {
    .user-info-container {
        flex-direction: column;
        align-items: center;
        padding: 20px;
    }

    .info-list {
        width: 100%;
    }
    
    .user-card {
        margin: 10px;
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

@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
</style>