<script #setup></script>

<template>
    <div class="cart-page">
        <el-card class="cart-card">
            <div slot="header" class="card-header">
                <h2>购物车</h2>
            </div>
            <div class="empty-content">
                <el-empty description="购物车空空如也~">
                    <el-button type="primary" @click="$router.push('/')">去逛逛</el-button>
                </el-empty>
            </div>
        </el-card>
    </div>
</template>

<style #scoped>
.cart-page {
    padding: 20px;
    min-height: 100%;
    max-width: 1200px;
    margin: 20px auto;
}

.cart-card {
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
    .cart-page {
        padding: 15px;
        margin: 10px auto;
    }

    .cart-card {
        border-radius: 8px;
    }

    .card-header h2 {
        font-size: 18px;
    }
}
</style>