<script #setup></script>

<template>
    <div class="follow-page">
        <el-card class="follow-card">
            <div slot="header" class="card-header">
                <h2>我的关注</h2>
            </div>
            <div class="empty-content">
                <el-empty description="还没有关注任何内容~">
                    <el-button type="primary" @click="$router.push('/')">去发现</el-button>
                </el-empty>
            </div>
        </el-card>
    </div>
</template>

<style #scoped>
.follow-page {
    padding: 20px;
    min-height: 100%;
    max-width: 1200px;
    margin: 20px auto;
}

.follow-card {
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

.empty-content {
    padding: 40px 0;
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
    .follow-page {
        padding: 15px;
        margin: 10px auto;
    }

    .follow-card {
        border-radius: 8px;
    }

    .card-header h2 {
        font-size: 18px;
    }
}
</style>