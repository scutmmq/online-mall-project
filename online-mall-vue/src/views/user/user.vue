<template>
    <div class="common-layout">
        <el-container class="container">
            <!-- 侧边栏 -->
            <el-aside width="170px" class="aside">
                <ElMenu :router="true" base="/user" default-active="main" :unique-opened="true">
                    <ElMenuItem index="/user/main"><el-icon>
                            <House color="purple" />
                        </el-icon>我的首页</ElMenuItem>

                    <el-sub-menu index="orderManage">
                        <template #title><el-icon>
                                <Shop color="purple" />
                            </el-icon>购物中心</template>
                        <el-menu-item index="orders"><el-icon>
                                <Document />
                            </el-icon>我的订单</el-menu-item>
                        <el-menu-item index="cart"><el-icon>
                                <ShoppingCartFull />
                            </el-icon>购物车</el-menu-item>
                        <el-menu-item index="reviews"><el-icon>
                                <ChatLineSquare />
                            </el-icon>已评价</el-menu-item>
                    </el-sub-menu>

                    <el-sub-menu index="users">
                        <template #title><el-icon>
                                <User color="blue" />
                            </el-icon>账户设置</template>
                        <el-menu-item index="profile"><el-icon>
                                <EditPen />
                            </el-icon>个人信息</el-menu-item>
                        <el-menu-item index="address"><el-icon>
                                <Location />
                            </el-icon>地址管理</el-menu-item>
                        <el-menu-item index="password"><el-icon>
                                <Key />
                            </el-icon>修改密码</el-menu-item>
                    </el-sub-menu>

                    <el-menu-item index="favorite"><el-icon>
                            <StarFilled color="yellow" />
                        </el-icon>我的收藏</el-menu-item>
<!--                    <el-menu-item index="follow"><el-icon>-->
<!--                            <CirclePlusFilled color="blue" />-->
<!--                        </el-icon>我的关注</el-menu-item>-->
                </ElMenu>
            </el-aside>

            <!-- 分割线 -->
            <div class="custom-divider"></div>

            <!-- 主内容区 -->
            <el-main class="main">
                <router-view></router-view>
            </el-main>
        </el-container>
    </div>
</template>

<script setup>
import { 
  House, 
  Shop, 
  Document, 
  ShoppingCartFull, 
  User, 
  EditPen, 
  Location, 
  Key, 
  StarFilled, 
  CirclePlusFilled,
  ChatLineSquare
} from '@element-plus/icons-vue'
</script>

<style scoped>
.container {
    display: flex;
    height: calc(100vh - 60px);
    margin: 20px;
    /* 添加背景和阴影效果，类似于App.vue的整体风格 */
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    animation: fadeInUp 0.5s ease-out;
    position: relative;
    overflow: hidden;
}

.container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    z-index: -1;
}

.aside {
    background: rgba(255, 255, 255, 0.8);
    padding: 10px;
    border-radius: 8px 0 0 8px;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(5px);
    border-right: 1px solid rgba(0, 0, 0, 0.05);
}

.main {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    /* 支持滚动 */
    background: rgba(255, 255, 255, 0.7);
    border-radius: 0 8px 8px 0;
    backdrop-filter: blur(5px);
}

.custom-divider {
    width: 1px;
    background: linear-gradient(to bottom, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
    margin: 0 10px;
    box-shadow: 0 0 5px rgba(102, 126, 234, 0.3);
}

/* 选中菜单高亮 */
:deep(.el-menu-item.is-active) {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%) !important;
    color: #667eea !important;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
    transform: translateY(-1px);
}

:deep(.el-menu-item) {
    margin: 2px 0;
    border-radius: 6px;
    transition: all 0.3s;
}

:deep(.el-menu-item:hover) {
    background: rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-sub-menu__title) {
    border-radius: 6px;
    transition: all 0.3s;
}

:deep(.el-sub-menu__title:hover) {
    background: rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
    .container {
        margin: 10px;
        border-radius: 8px;
    }

    .aside {
        border-radius: 6px 0 0 6px;
    }

    .main {
        border-radius: 0 6px 6px 0;
        padding: 15px;
    }
}
</style>