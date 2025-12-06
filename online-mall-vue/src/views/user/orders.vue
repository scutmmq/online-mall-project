<template>
    <div class="order-list-container">
        <!-- 页面标题栏 -->
        <div class="page-header">
            <h1 class="page-title">我的订单</h1>
            <div class="order-count" v-if="!isLoading && !isAfterSaleMode">
                共 {{ orders.length }} 个订单
            </div>
            <!-- 售后订单数量显示 -->
            <div class="order-count" v-if="!isLoading && isAfterSaleMode">
                共 {{ afterSaleOrders.length }} 个售后订单
            </div>
        </div>

        <!-- 订单状态筛选栏 - 优化样式和交互 -->
        <div class="status-filter" v-if="!isAfterSaleMode">
            <el-radio-group v-model="currentStatus" size="medium" @change="handleStatusChange">
                <el-radio-button v-for="item in statusOptions" :key="item.value" :label="item.value"
                    class="status-radio">
                    {{ item.label }}
                </el-radio-button>
            </el-radio-group>

            <el-dropdown @command="handleAfterSaleCommand" class="after-sale-dropdown">
                <el-button type="text" class="after-sale-btn">
                    <i class="el-icon-service"></i> 我的售后
                    <i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="0">待审核</el-dropdown-item>
                        <el-dropdown-item command="1">已批准</el-dropdown-item>
                        <el-dropdown-item command="2">已拒绝</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>


        <!-- 售后订单筛选提示（显示当前选中的售后状态） -->
        <div class="after-sale-filter-tip" v-if="isAfterSaleMode && !isLoading">
            <i class="el-icon-info"></i> 当前查看：
            <span class="after-sale-status-text" :class="getAfterSaleStatusClass(currentAfterSaleStatus)">
                {{ getAfterSaleStatusText(currentAfterSaleStatus) }}
            </span>
            <el-button type="text" size="small" @click="exitAfterSaleMode" class="exit-after-sale-btn">
                返回订单列表
            </el-button>
        </div>

        <!-- 加载状态 - 优化动画效果 -->
        <div class="loading-container" v-if="isLoading">
            <el-loading-spinner size="40" class="loading-spinner"></el-loading-spinner>
            <p class="loading-text" v-if="!isAfterSaleMode">加载订单数据中...</p>
            <p class="loading-text" v-if="isAfterSaleMode">加载售后订单数据中...</p>
        </div>

        <!-- 空状态 - 优化视觉表现 -->
        <div class="empty-container" v-if="!isLoading && !isAfterSaleMode && orders.length === 0">
            <el-empty description="暂无当前状态的订单" class="empty-content">
                <el-button type="text" @click="goToHome" class="empty-action">
                    <i class="el-icon-shopping-cart"></i> 去购物
                </el-button>
            </el-empty>
        </div>

        <!-- 售后订单空状态 -->
        <div class="empty-container" v-if="!isLoading && isAfterSaleMode && afterSaleOrders.length === 0">
            <el-empty :description="`暂无${getAfterSaleStatusText(currentAfterSaleStatus)}的售后订单`" class="empty-content">
                <el-button type="text" @click="exitAfterSaleMode" class="empty-action">
                    <i class="el-icon-arrow-left"></i> 返回订单列表
                </el-button>
            </el-empty>
        </div>

        <!-- 订单列表 - 优化卡片样式和布局 -->
        <div class="order-card-list" v-if="!isLoading && !isAfterSaleMode && orders.length > 0">
            <div class="order-card" v-for="order in orders" :key="order.id" hover>
                <!-- 原有订单卡片内容不变 -->
                <div class="order-header">
                    <div class="order-info">
                        <div class="order-main-info">
                            <span class="order-number">
                                <i class="el-icon-order"></i> 订单编号：{{ order.orderNumber }}
                            </span>
                            <span class="order-time">
                                <i class="el-icon-clock"></i> 创建时间：{{ formatDate(order.orderedTime) }}
                            </span>
                            <!-- 未支付订单倒计时 -->
                            <template v-if="order.status === '待支付'">
                                <span class="order-countdown" :class="getCountdownClass(order.countdown)">
                                    <i class="el-icon-timer"></i> 
                                    <template v-if="order.countdown > 0">
                                        剩余支付时间：{{ formatCountdown(order.countdown) }}
                                    </template>
                                    <template v-else>
                                        订单即将取消
                                    </template>
                                </span>
                            </template>
                        </div>
                        
                        <!-- 订单备注区域 - 独立展示 -->
                        <div class="order-remark-section" v-if="order.remark">
                            <div class="remark-tag">
                                <i class="el-icon-edit-outline"></i>
                                <span>我的备注</span>
                            </div>
                            <div class="remark-content-box">
                                <p class="remark-text">{{ order.remark }}</p>
                            </div>
                        </div>

                        <!-- 已发货状态信息 -->
                        <template v-if="order.status === '已发货'">
                            <div class="order-extra-info">
                                <span class="order-ship-type">
                                    <i class="el-icon-truck"></i> 快递方式：{{ order.shipType || '暂无' }}
                                </span>
                                <span class="order-shipped-time">
                                    <i class="el-icon-send"></i> 发货时间：{{ formatDate(order.shippedTime) }}
                                </span>
                                <span class="order-tracking-number">
                                    <i class="el-icon-barcode"></i> 物流单号：{{ order.trackingNumber || '暂无' }}
                                </span>
                            </div>
                        </template>

                        <!-- 已取消状态信息 -->
                        <template v-if="order.status === '已取消'">
                            <div class="order-extra-info">
                                <span class="order-deliver-time">
                                    <i class="el-icon-send"></i> 发货时间：{{ formatDate(order.shippedTime) }}
                                </span>
                                <span class="order-cancel-time">
                                    <i class="el-icon-close"></i> 取消时间：{{ formatDate(order.orderedTime) }}
                                </span>
                            </div>
                        </template>

                        <!-- 已完成（原已送达）状态信息 -->
                        <template v-if="order.status === '已送达'">
                            <div class="order-extra-info">
                                <span class="order-ship-type">
                                    <i class="el-icon-truck"></i> 快递方式：{{ order.shipType || '暂无' }}
                                </span>
                                <span class="order-shipped-time">
                                    <i class="el-icon-send"></i> 发货时间：{{ formatDate(order.shippedTime) }}
                                </span>
                                <span class="order-delivered-time">
                                    <i class="el-icon-check"></i> 送达时间：{{ formatDate(order.deliveredTime) }}
                                </span>
                                <span class="order-tracking-number">
                                    <i class="el-icon-barcode"></i> 物流单号：{{ order.trackingNumber || '暂无' }}
                                </span>
                            </div>
                        </template>
                    </div>

                    <div class="order-status-wrapper">
                        <span class="order-status" :class="getStatusClass(order.status, order.paymentStatus)">
                            {{ getDisplayStatus(order.status, order.paymentStatus) }}
                        </span>
                    </div>
                </div>

                <!-- 地址显示区域 - 优化卡片样式 -->
                <div class="address-container"
                    v-if="order.status === '待支付' || order.status === '已支付' || order.status === '已发货' || order.status === '已取消' || order.status === '已送达'">
                    <div class="address-section-title">
                        <i class="el-icon-location"></i> 地址信息
                    </div>

                    <!-- 待支付/待发货/已取消：显示收货地址 -->
                    <div class="address-card"
                        v-if="order.status === '待支付' || order.status === '已支付' || order.status === '已取消'">
                        <div class="address-row">
                            <span class="address-label">收件人：</span>
                            <span class="address-value" v-if="order.shippingAddressInfo">{{
                                order.shippingAddressInfo.recipient }}</span>
                            <span class="address-placeholder" v-else>加载中...</span>
                        </div>
                        <div class="address-row">
                            <span class="address-label">联系电话：</span>
                            <span class="address-value" v-if="order.shippingAddressInfo">{{
                                order.shippingAddressInfo.phone }}</span>
                            <span class="address-placeholder" v-else>加载中...</span>
                        </div>
                        <div class="address-row">
                            <span class="address-label">收货地址：</span>
                            <span class="address-value" v-if="order.shippingAddressInfo">
                                {{ order.shippingAddressInfo.province }}{{ order.shippingAddressInfo.city }}{{
                                    order.shippingAddressInfo.district }}{{ order.shippingAddressInfo.detail }}
                            </span>
                            <span class="address-placeholder" v-else>加载中...</span>
                        </div>
                    </div>

                    <!-- 已发货/已完成（原已送达）：显示发货+收货地址 -->
                    <div class="address-group" v-else-if="order.status === '已发货' || order.status === '已送达'">
                        <div class="address-card shipping-card">
                            <div class="address-card-header">
                                <i class="el-icon-ship"></i> 发货信息
                            </div>
                            <div class="address-row">
                                <span class="address-label">快递方式：</span>
                                <span class="address-value">{{ order.shipType || '暂无' }}</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">发货时间：</span>
                                <span class="address-value">{{ formatDate(order.shippedTime) }}</span>
                            </div>
                            <!-- 已完成状态新增送达时间显示 -->
                            <div class="address-row" v-if="order.status === '已送达'">
                                <span class="address-label">送达时间：</span>
                                <span class="address-value">{{ formatDate(order.deliveredTime) }}</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">物流单号：</span>
                                <span class="address-value">{{ order.trackingNumber || '暂无' }}</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">发货人：</span>
                                <span class="address-value" v-if="order.billingAddressInfo">
                                    {{ order.billingAddressInfo.recipient }}
                                </span>
                                <span class="address-placeholder" v-else>加载中...</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">发货电话：</span>
                                <span class="address-value" v-if="order.billingAddressInfo">
                                    {{ order.billingAddressInfo.phone }}
                                </span>
                                <span class="address-placeholder" v-else>加载中...</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">发货地址：</span>
                                <span class="address-value" v-if="order.billingAddressInfo">
                                    {{ order.billingAddressInfo.province }}{{ order.billingAddressInfo.city }}{{
                                        order.billingAddressInfo.district }}{{ order.billingAddressInfo.detail }}
                                </span>
                                <span class="address-placeholder" v-else>加载中...</span>
                            </div>
                        </div>
                        <div class="address-card receiving-card">
                            <div class="address-card-header">
                                <i class="el-icon-user"></i> 收货信息
                            </div>
                            <div class="address-row">
                                <span class="address-label">收件人：</span>
                                <span class="address-value" v-if="order.shippingAddressInfo">{{
                                    order.shippingAddressInfo.recipient
                                    }}</span>
                                <span class="address-placeholder" v-else>加载中...</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">联系电话：</span>
                                <span class="address-value" v-if="order.shippingAddressInfo">{{
                                    order.shippingAddressInfo.phone }}</span>
                                <span class="address-placeholder" v-else>加载中...</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">收货地址：</span>
                                <span class="address-value" v-if="order.shippingAddressInfo">
                                    {{ order.shippingAddressInfo.province }}{{ order.shippingAddressInfo.city }}{{
                                        order.shippingAddressInfo.district }}{{ order.shippingAddressInfo.detail }}
                                </span>
                                <span class="address-placeholder" v-else>加载中...</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 订单商品列表 - 优化hover效果和布局 -->
                <div class="order-products">
                    <div class="product-section-title">
                        <i class="el-icon-goods"></i> 商品信息
                    </div>
                    <div class="product-item" v-for="product in order.items" :key="product.productId"
                        @click="goToProductDetail(product.productId)">
                        <div class="product-img-wrapper">
                            <img :src="product.imageUrl" alt="商品图片" class="product-img">
                        </div>
                        <div class="product-info">
                            <p class="product-name">{{ product.productName }}</p>
                            <p class="product-price">¥{{ product.productPrice.toFixed(2) }}</p>
                        </div>
                        <div class="product-quantity">x{{ product.quantity }}</div>
                        <!-- 评价按钮或已评价标识 -->
                        <div class="review-action" v-if="order.status === '已送达'">
                            <template v-if="product.isReviewed">
                                <el-tag type="success" size="small">已评价</el-tag>
                            </template>
                            <template v-else>
                                <el-button type="primary" size="small" @click.stop="openReviewDialog(order, product)">评价</el-button>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- 订单金额和操作按钮 - 优化布局和按钮样式 -->
                <div class="order-footer">
                    <div class="order-summary">
                        <div class="summary-item">
                            <span class="summary-label">商品数量：</span>
                            <span class="summary-value">{{order.items.reduce((sum, item) => sum + item.quantity,
                                0)}}
                                件</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">实付款：</span>
                            <span class="summary-value amount">¥{{ order.totalAmount.toFixed(2) }}</span>
                        </div>
                    </div>
                    <div class="order-actions">
                        <!-- 待支付：立即支付 + 取消支付 -->
                        <template v-if="order.status === '待支付'">
                            <el-button type="primary" size="small" @click="goToPay(order.id)"
                                class="action-btn primary-btn">
                                立即支付
                            </el-button>
                            <el-button type="text" size="small" @click="handleCancelOrder(order.id)"
                                class="action-btn cancel-btn">
                                取消订单
                            </el-button>
                        </template>

                        <!-- 已支付（待发货）：申请退货 -->
                        <template v-else-if="order.status === '已支付'">
                            <el-button type="text" size="small" @click="handleReturnOrder(order.id)"
                                class="action-btn return-btn">
                                申请退货
                            </el-button>
                        </template>

                        <!-- 已发货：申请退货 + 确认收货 -->
                        <template v-else-if="order.status === '已发货'">
                            <el-button type="text" size="small" @click="handleReturnOrder(order.id)"
                                class="action-btn return-btn">
                                申请退货
                            </el-button>
                            <el-button type="primary" size="small" @click="handleConfirmReceipt(order.id)"
                                class="action-btn confirm-btn">
                                确认收货
                            </el-button>
                        </template>

                        <!-- 已完成（原已送达）：申请退货 -->
                        <template v-else-if="order.status === '已送达'">
                            <el-button type="text" size="small" @click="handleReturnOrder(order.id)"
                                class="action-btn return-btn">
                                申请退货
                            </el-button>
                        </template>

                    </div>
                </div>
            </div>
        </div>

        <!-- 售后订单列表（新增） -->
        <div class="order-card-list" v-if="!isLoading && isAfterSaleMode && afterSaleOrders.length > 0">
            <div class="order-card" v-for="order in afterSaleOrders" :key="order.id" hover>
                <!-- 订单头部信息（包含售后信息） -->
                <div class="order-header">
                    <div class="order-info">
                        <div class="order-main-info">
                            <span class="order-number">
                                <i class="el-icon-order"></i> 订单编号：{{ order.orderNumber }}
                            </span>
                            <span class="order-time">
                                <i class="el-icon-clock"></i> 创建时间：{{ formatDate(order.orderedTime) }}
                            </span>
                            <!-- 未支付订单倒计时（售后订单也显示） -->
                            <template v-if="order.status === '待支付'">
                                <span class="order-countdown" :class="getCountdownClass(order.countdown)">
                                    <i class="el-icon-timer"></i> 
                                    <template v-if="order.countdown > 0">
                                        剩余支付时间：{{ formatCountdown(order.countdown) }}
                                    </template>
                                    <template v-else>
                                        订单即将取消
                                    </template>
                                </span>
                            </template>
                            <!-- 新增：售后申请时间 -->
                            <span class="order-after-sale-time">
                                <i class="el-icon-form"></i> 申请时间：{{ formatDate(order.audit?.applyTime) }}
                            </span>
                        </div>
                        
                        <!-- 订单备注区域 - 独立展示（售后订单也显示） -->
                        <div class="order-remark-section" v-if="order.remark">
                            <div class="remark-tag">
                                <i class="el-icon-edit-outline"></i>
                                <span>我的备注</span>
                            </div>
                            <div class="remark-content-box">
                                <p class="remark-text">{{ order.remark }}</p>
                            </div>
                        </div>

                        <!-- 已发货状态信息 -->
                        <template v-if="order.status === '已发货'">
                            <div class="order-extra-info">
                                <span class="order-ship-type">
                                    <i class="el-icon-truck"></i> 快递方式：{{ order.shipType || '暂无' }}
                                </span>
                                <span class="order-shipped-time">
                                    <i class="el-icon-send"></i> 发货时间：{{ formatDate(order.shippedTime) }}
                                </span>
                                <span class="order-tracking-number">
                                    <i class="el-icon-barcode"></i> 物流单号：{{ order.trackingNumber || '暂无' }}
                                </span>
                            </div>
                        </template>

                        <!-- 已取消状态信息 -->
                        <template v-if="order.status === '已取消'">
                            <div class="order-extra-info">
                                <span class="order-deliver-time">
                                    <i class="el-icon-send"></i> 发货时间：{{ formatDate(order.shippedTime) }}
                                </span>
                                <span class="order-cancel-time">
                                    <i class="el-icon-close"></i> 取消时间：{{ formatDate(order.orderedTime) }}
                                </span>
                            </div>
                        </template>

                        <!-- 已完成（原已送达）状态信息 -->
                        <template v-if="order.status === '已送达'">
                            <div class="order-extra-info">
                                <span class="order-ship-type">
                                    <i class="el-icon-truck"></i> 快递方式：{{ order.shipType || '暂无' }}
                                </span>
                                <span class="order-shipped-time">
                                    <i class="el-icon-send"></i> 发货时间：{{ formatDate(order.shippedTime) }}
                                </span>
                                <span class="order-delivered-time">
                                    <i class="el-icon-check"></i> 送达时间：{{ formatDate(order.deliveredTime) }}
                                </span>
                                <span class="order-tracking-number">
                                    <i class="el-icon-barcode"></i> 物流单号：{{ order.trackingNumber || '暂无' }}
                                </span>
                            </div>
                        </template>

                        <!-- 新增：售后信息区域 -->
                        <div class="after-sale-info" v-if="order.audit">
                            <div class="after-sale-section-title">
                                <i class="el-icon-service"></i> 售后申请信息
                            </div>
                            <div class="after-sale-detail">
                                <div class="after-sale-row">
                                    <span class="after-sale-label">退货理由：</span>
                                    <span class="after-sale-value">{{ order.audit.returnReason || '暂无' }}</span>
                                </div>
                                <div class="after-sale-row" v-if="order.audit.auditStatus">
                                    <span class="after-sale-label">审核状态：</span>
                                    <span class="after-sale-value"
                                        :class="getAfterSaleStatusClass(order.audit.auditStatus)">
                                        {{ order.audit.auditStatus }}
                                    </span>
                                </div>
                                <div class="after-sale-row" v-if="order.audit.auditTime">
                                    <span class="after-sale-label">审核时间：</span>
                                    <span class="after-sale-value">{{ formatDate(order.audit.auditTime) }}</span>
                                </div>
                                <div class="after-sale-row" v-if="order.audit.auditReason">
                                    <span class="after-sale-label">审核意见：</span>
                                    <span class="after-sale-value">{{ order.audit.auditReason }}</span>
                                </div>
                                <!-- 售后凭证图片 -->
                                <div class="after-sale-row" v-if="order.audit.returnImage">
                                    <span class="after-sale-label">凭证图片：</span>
                                    <div class="after-sale-images">
                                        <el-image v-for="(img, index) in order.audit.returnImage.split(',')"
                                            :key="index" :src="img"
                                            :preview-src-list="order.audit.returnImage.split(',')"
                                            class="after-sale-image-item" fit="cover"></el-image>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="order-status-wrapper">
                        <span class="order-status" :class="getStatusClass(order.status, order.paymentStatus)">
                            {{ getDisplayStatus(order.status, order.paymentStatus) }}
                        </span>
                        <!-- 新增：售后状态标签 -->
                        <span class="after-sale-status-tag" v-if="order.audit"
                            :class="getAfterSaleStatusClass(order.audit.auditStatus)">
                            {{ order.audit.auditStatus }}
                        </span>
                    </div>
                </div>

                <!-- 地址显示区域（与原有订单一致） -->
                <div class="address-container"
                    v-if="order.status === '待支付' || order.status === '已支付' || order.status === '已发货' || order.status === '已取消' || order.status === '已送达'">
                    <div class="address-section-title">
                        <i class="el-icon-location"></i> 地址信息
                    </div>

                    <!-- 待支付/待发货/已取消：显示收货地址 -->
                    <div class="address-card"
                        v-if="order.status === '待支付' || order.status === '已支付' || order.status === '已取消'">
                        <div class="address-row">
                            <span class="address-label">收件人：</span>
                            <span class="address-value" v-if="order.shippingAddressInfo">{{
                                order.shippingAddressInfo.recipient }}</span>
                            <span class="address-placeholder" v-else>加载中...</span>
                        </div>
                        <div class="address-row">
                            <span class="address-label">联系电话：</span>
                            <span class="address-value" v-if="order.shippingAddressInfo">{{
                                order.shippingAddressInfo.phone }}</span>
                            <span class="address-placeholder" v-else>加载中...</span>
                        </div>
                        <div class="address-row">
                            <span class="address-label">收货地址：</span>
                            <span class="address-value" v-if="order.shippingAddressInfo">
                                {{ order.shippingAddressInfo.province }}{{ order.shippingAddressInfo.city }}{{
                                    order.shippingAddressInfo.district }}{{ order.shippingAddressInfo.detail }}
                            </span>
                            <span class="address-placeholder" v-else>加载中...</span>
                        </div>
                    </div>

                    <!-- 已发货/已完成（原已送达）：显示发货+收货地址 -->
                    <div class="address-group" v-else-if="order.status === '已发货' || order.status === '已送达'">
                        <div class="address-card shipping-card">
                            <div class="address-card-header">
                                <i class="el-icon-ship"></i> 发货信息
                            </div>
                            <div class="address-row">
                                <span class="address-label">快递方式：</span>
                                <span class="address-value">{{ order.shipType || '暂无' }}</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">发货时间：</span>
                                <span class="address-value">{{ formatDate(order.shippedTime) }}</span>
                            </div>
                            <!-- 已完成状态新增送达时间显示 -->
                            <div class="address-row" v-if="order.status === '已送达'">
                                <span class="address-label">送达时间：</span>
                                <span class="address-value">{{ formatDate(order.deliveredTime) }}</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">物流单号：</span>
                                <span class="address-value">{{ order.trackingNumber || '暂无' }}</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">发货人：</span>
                                <span class="address-value" v-if="order.billingAddressInfo">
                                    {{ order.billingAddressInfo.recipient }}
                                </span>
                                <span class="address-placeholder" v-else>加载中...</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">发货电话：</span>
                                <span class="address-value" v-if="order.billingAddressInfo">
                                    {{ order.billingAddressInfo.phone }}
                                </span>
                                <span class="address-placeholder" v-else>加载中...</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">发货地址：</span>
                                <span class="address-value" v-if="order.billingAddressInfo">
                                    {{ order.billingAddressInfo.province }}{{ order.billingAddressInfo.city }}{{
                                        order.billingAddressInfo.district }}{{ order.billingAddressInfo.detail }}
                                </span>
                                <span class="address-placeholder" v-else>加载中...</span>
                            </div>
                        </div>
                        <div class="address-card receiving-card">
                            <div class="address-card-header">
                                <i class="el-icon-user"></i> 收货信息
                            </div>
                            <div class="address-row">
                                <span class="address-label">收件人：</span>
                                <span class="address-value" v-if="order.shippingAddressInfo">{{
                                    order.shippingAddressInfo.recipient
                                    }}</span>
                                <span class="address-placeholder" v-else>加载中...</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">联系电话：</span>
                                <span class="address-value" v-if="order.shippingAddressInfo">{{
                                    order.shippingAddressInfo.phone }}</span>
                                <span class="address-placeholder" v-else>加载中...</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">收货地址：</span>
                                <span class="address-value" v-if="order.shippingAddressInfo">
                                    {{ order.shippingAddressInfo.province }}{{ order.shippingAddressInfo.city }}{{
                                        order.shippingAddressInfo.district }}{{ order.shippingAddressInfo.detail }}
                                </span>
                                <span class="address-placeholder" v-else>加载中...</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 订单商品列表（与原有订单一致） -->
                <div class="order-products">
                    <div class="product-section-title">
                        <i class="el-icon-goods"></i> 商品信息
                    </div>
                    <div class="product-item" v-for="product in order.items" :key="product.productId"
                        @click="goToProductDetail(product.productId)">
                        <div class="product-img-wrapper">
                            <img :src="product.imageUrl" alt="商品图片" class="product-img">
                        </div>
                        <div class="product-info">
                            <p class="product-name">{{ product.productName }}</p>
                            <p class="product-price">¥{{ product.productPrice.toFixed(2) }}</p>
                        </div>
                        <div class="product-quantity">x{{ product.quantity }}</div>
                        <!-- 评价按钮或已评价标识 -->
                        <div class="review-action" v-if="order.status === '已送达'">
                            <template v-if="product.isReviewed">
                                <el-tag type="success" size="small">已评价</el-tag>
                            </template>
                            <template v-else>
                                <el-button type="primary" size="small" @click.stop="openReviewDialog(order, product)">评价</el-button>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- 订单金额和操作按钮（售后订单隐藏操作按钮） -->
                <div class="order-footer">
                    <div class="order-summary">
                        <div class="summary-item">
                            <span class="summary-label">商品数量：</span>
                            <span class="summary-value">{{order.items.reduce((sum, item) => sum + item.quantity,
                                0)}}
                                件</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">实付款：</span>
                            <span class="summary-value amount">¥{{ order.totalAmount.toFixed(2) }}</span>
                        </div>
                    </div>
                    <!-- 售后订单不需要操作按钮，保持布局一致 -->
                    <div class="order-actions">
                        <span class="after-sale-tip" v-if="order.audit">
                            售后申请已提交
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 申请退货弹窗 -->
        <el-dialog title="申请退货" v-model="isReturnDialogOpen" width="500px" :close-on-click-modal="false" :modal-append-to-body="false" :append-to-body="true" center top="15vh" modal-class="centered-dialog">
            <el-form :model="returnForm" :rules="returnRules" ref="returnFormRef" label-width="80px">
                <el-form-item label="退货理由" prop="returnReason">
                    <el-input v-model="returnForm.returnReason" type="textarea" :rows="4"
                        placeholder="请详细描述退货理由"></el-input>
                </el-form-item>
                <el-form-item label="上传凭证">
                    <el-upload class="upload-demo" action="/api/image/upload" :on-success="handleImageUploadSuccess"
                        :on-error="handleImageUploadError" :file-list="uploadFileList" list-type="picture-card"
                        :limit="3" :on-exceed="handleUploadExceed">
                        <i class="el-icon-plus"></i>
                    </el-upload>
                    <div class="upload-tip">最多上传3张图片，支持jpg、png格式</div>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="isReturnDialogOpen = false">取消</el-button>
                <el-button type="primary" @click="submitReturnApply">提交申请</el-button>
            </template>
        </el-dialog>

        <!-- 商品评价弹窗 -->
        <el-dialog title="商品评价" v-model="isReviewDialogOpen" width="500px" :modal-append-to-body="false" :append-to-body="true" center  :close-on-click-modal="false" top="15vh" modal-class="centered-dialog">
            <el-form :model="reviewForm" :rules="reviewRules" ref="reviewFormRef" label-width="80px">
                <el-form-item label="评分" prop="rating">
                    <el-rate v-model="reviewForm.rating" :max="5" allow-half show-score score-template="{value}分"></el-rate>
                </el-form-item>
                <el-form-item label="评价内容" prop="content">
                    <el-input v-model="reviewForm.content" type="textarea" :rows="4"
                        placeholder="请详细描述您的评价"></el-input>
                </el-form-item>
                <el-form-item label="上传图片">
                    <el-upload class="upload-demo" action="/api/image/upload" :on-success="handleReviewImageUploadSuccess"
                        :on-error="handleReviewImageUploadError" :file-list="reviewUploadFileList" list-type="picture-card"
                        :limit="5" :on-exceed="handleReviewUploadExceed">
                        <i class="el-icon-plus"></i>
                    </el-upload>
                    <div class="upload-tip">最多上传5张图片，支持jpg、png格式</div>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="isReviewDialogOpen = false">取消</el-button>
                <el-button type="primary" @click="submitReview">提交评价</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive, toRefs, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElButton, ElMessage, ElMessageBox, ElEmpty, ElRadioGroup, ElRadioButton, ElDialog, ElForm, ElFormItem, ElInput, ElUpload, ElDropdown, ElDropdownMenu, ElDropdownItem, ElImage, ElRate, ElTag } from 'element-plus';
import { getAuditsApi } from '@/api/audit'; // 导入售后订单接口
import { confirmOrderApi, getUserOrders, addReviewApi } from '@/api/order';
import { cancelOrder } from '@/api/order';
import { getAddressByI } from '@/api/address';
import { getUserApi } from '@/api/user';

const router = useRouter();

// 原有状态筛选选项
const statusOptions = ref([
    { value: 'all', label: '全部订单' },
    { value: 'pending', label: '待支付' },
    { value: 'paid', label: '待发货' },
    { value: 'shipped', label: '已发货' },
    { value: 'delivered', label: '已完成' },
    { value: 'cancelled', label: '已取消' }
]);

// 新增：售后相关状态管理
const isAfterSaleMode = ref(false); // 是否处于售后订单模式
const currentAfterSaleStatus = ref('0'); // 当前选中的售后状态（0-待审核，1-已批准，2-已拒绝）
const afterSaleOrders = ref([]); // 售后订单列表

// 原有状态管理
const currentStatus = ref('all');
const orders = ref([]);
const isLoading = ref(false);
const userInfo = ref(null);
const isReturnDialogOpen = ref(false);
const returnFormRef = ref(null);
const uploadFileList = ref([]);
const returnImageUrls = ref([]);

// 评价相关状态
const isReviewDialogOpen = ref(false);
const reviewFormRef = ref(null);
const reviewUploadFileList = ref([]);
const reviewImageUrls = ref([]);

// 评价表单数据
const reviewForm = reactive({
  orderId: '',
  productId: '',
  orderItemId: '',
  merchantId: '',
  rating: 5,
  content: '',
  image: ''
});

// 评价表单校验规则
const reviewRules = reactive({
  rating: [
    { required: true, message: '请选择评分', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入评价内容', trigger: 'blur' },
    { min: 5, max: 500, message: '评价内容长度在5-500字之间', trigger: 'blur' }
  ]
});

// 倒计时定时器
let countdownTimer = null;

// 退货表单数据
const returnForm = reactive({
    orderId: '',
    userId: '',
    merchantId: '',
    returnReason: '',
    returnImages: ''
});

// 退货表单校验规则
const returnRules = reactive({
    returnReason: [
        { required: true, message: '请输入退货理由', trigger: 'blur' },
        { min: 5, max: 500, message: '退货理由长度在5-500字之间', trigger: 'blur' }
    ]
});

// 格式化日期（原有）
const formatDate = (dateString) => {
    if (!dateString) return '暂无';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 格式化倒计时（秒数转换为 分:秒 格式）
const formatCountdown = (seconds) => {
    if (seconds <= 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// 获取倒计时样式类
const getCountdownClass = (seconds) => {
    if (seconds <= 0) return 'countdown-expired';
    if (seconds <= 60) return 'countdown-urgent'; // 最后1分钟
    if (seconds <= 180) return 'countdown-warning'; // 最后3分钟
    return 'countdown-normal';
};

// 计算订单剩余时间（秒）
const calculateCountdown = (orderedTime) => {
    const createTime = new Date(orderedTime).getTime();
    const now = Date.now();
    const elapsed = now - createTime;
    const timeout = 10 * 60 * 1000; // 10分钟（毫秒）
    const remaining = timeout - elapsed;
    return Math.max(0, Math.floor(remaining / 1000)); // 返回秒数
};

// 更新所有未支付订单的倒计时
const updateCountdowns = () => {
    orders.value.forEach(order => {
        if (order.status === '待支付') {
            order.countdown = calculateCountdown(order.orderedTime);
        }
    });
    // 同时更新售后订单中的未支付订单
    afterSaleOrders.value.forEach(order => {
        if (order.status === '待支付') {
            order.countdown = calculateCountdown(order.orderedTime);
        }
    });
};

// 启动倒计时定时器
const startCountdownTimer = () => {
    // 清除旧定时器
    if (countdownTimer) {
        clearInterval(countdownTimer);
    }
    // 每秒更新一次倒计时
    countdownTimer = setInterval(() => {
        updateCountdowns();
        // 检查普通订单是否有超时
        const hasExpiredOrder = orders.value.some(order => 
            order.status === '待支付' && order.countdown <= 0
        );
        // 检查售后订单是否有超时
        const hasExpiredAfterSale = afterSaleOrders.value.some(order => 
            order.status === '待支付' && order.countdown <= 0
        );
        
        if (hasExpiredOrder) {
            setTimeout(() => fetchOrders(), 1000); // 延迟1秒刷新，等待后端更新
        }
        if (hasExpiredAfterSale) {
            setTimeout(() => fetchAfterSaleOrders(currentAfterSaleStatus.value), 1000);
        }
    }, 1000);
};

// 停止倒计时定时器
const stopCountdownTimer = () => {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
};

// 获取单个地址（原有）
const getSingleAddress = async (addressId) => {
    try {
        const res = await getAddressByI(addressId);
        return res.code === 1 ? res.data : null;
    } catch (err) {
        console.error('获取地址失败：', err);
        return null;
    }
};

// 获取用户信息（原有）
const fetchUserInfo = async () => {
    try {
        const res = await getUserApi();
        if (res.code === 1) {
            userInfo.value = res.data;
        } else {
            ElMessage.error(res.msg || '获取用户信息失败');
        }
    } catch (err) {
        console.error('获取用户信息失败：', err);
        ElMessage.error('网络错误，获取用户信息失败');
    }
};

// 获取订单列表（原有）
const fetchOrders = async () => {
    try {
        isLoading.value = true;
        const param = currentStatus.value !== 'all' ? { status: currentStatus.value } : {};
        const res = await getUserOrders(param);

        if (res.code === 1) {
            orders.value = res.data || [];

            // 为需要显示地址的订单查询地址
            for (const order of orders.value) {
                // 为未支付订单初始化倒计时
                if (order.status === '待支付') {
                    order.countdown = calculateCountdown(order.orderedTime);
                }
                
                if (order.status === '待支付' || order.status === '已支付' || order.status === '已发货' || order.status === '已取消' || order.status === '已送达') {
                    if (order.shippingAddressId) {
                        order.shippingAddressInfo = await getSingleAddress(order.shippingAddressId);
                    }
                    if ((order.status === '已发货' || order.status === '已送达') && order.billingAddressId) {
                        order.billingAddressInfo = await getSingleAddress(order.billingAddressId);
                    }
                }
            }
            
            // 启动倒计时定时器
            startCountdownTimer();
        } else {
            ElMessage.error(res.msg || '订单列表获取失败');
        }
    } catch (err) {
        console.error('获取订单失败：', err);
        ElMessage.error('网络错误，订单列表获取失败');
    } finally {
        isLoading.value = false;
    }
};

// 新增：获取售后订单列表
const fetchAfterSaleOrders = async (auditStatus) => {
    try {
        isLoading.value = true;
        const res = await getAuditsApi(Number(auditStatus)); // 转换为Long类型

        if (res.code === 1) {
            afterSaleOrders.value = res.data || [];

            // 为售后订单查询地址（与普通订单逻辑一致）
            for (const order of afterSaleOrders.value) {
                // 为未支付订单初始化倒计时
                if (order.status === '待支付') {
                    order.countdown = calculateCountdown(order.orderedTime);
                }
                
                if (order.status === '待支付' || order.status === '已支付' || order.status === '已发货' || order.status === '已取消' || order.status === '已送达') {
                    if (order.shippingAddressId) {
                        order.shippingAddressInfo = await getSingleAddress(order.shippingAddressId);
                    }
                    if ((order.status === '已发货' || order.status === '已送达') && order.billingAddressId) {
                        order.billingAddressInfo = await getSingleAddress(order.billingAddressId);
                    }
                }
            }
            
            // 启动倒计时定时器
            startCountdownTimer();
        } else {
            ElMessage.error(res.msg || '售后订单列表获取失败');
        }
    } catch (err) {
        console.error('获取售后订单失败：', err);
        ElMessage.error('网络错误，售后订单列表获取失败');
    } finally {
        isLoading.value = false;
    }
};

// 原有状态切换
const handleStatusChange = (value) => {
    currentStatus.value = value;
    fetchOrders();
};

// 新增：售后菜单命令处理
const handleAfterSaleCommand = (command) => {
    currentAfterSaleStatus.value = command;
    isAfterSaleMode.value = true;
    fetchAfterSaleOrders(command);
};

// 新增：退出售后模式
const exitAfterSaleMode = () => {
    isAfterSaleMode.value = false;
    currentAfterSaleStatus.value = '0';
    afterSaleOrders.value = [];
};

// 新增：获取售后状态显示文本
const getAfterSaleStatusText = (status) => {
    const statusMap = {
        '0': '待审核',
        '1': '已批准',
        '2': '已拒绝',
        '待审核': '待审核',
        '已批准': '已批准',
        '已拒绝': '已拒绝'
    };
    return statusMap[status] || '未知状态';
};

// 新增：获取售后状态样式类
const getAfterSaleStatusClass = (status) => {
    const classMap = {
        '0': 'after-sale-pending',
        '1': 'after-sale-approve',
        '2': 'after-sale-reject',
        '待审核': 'after-sale-pending',
        '已批准': 'after-sale-approve',
        '已拒绝': 'after-sale-reject'
    };
    return classMap[status] || '';
};

// 原有方法（保持不变）
const goToProductDetail = (productId) => {
    router.push(`/product/${productId}`);
};

const goToPay = (orderId) => {
    router.push(`/order/${orderId}`);
};

const handleCancelOrder = async (orderId) => {
    try {
        await ElMessageBox.confirm(
            '确定要取消这个订单吗？取消后订单将无法恢复。',
            '取消订单确认',
            {
                confirmButtonText: '确定取消',
                cancelButtonText: '再想想',
                type: 'warning',
                confirmButtonClass: 'confirm-danger-btn',
                cancelButtonClass: 'cancel-safe-btn',
                center: true,
                draggable: true,
                roundButton: true
            }
        );

        returnForm.orderId = orderId;
        const res = await cancelOrder(returnForm);
        if (res.code === 1) {
            ElMessage.success('订单取消成功');
            fetchOrders();
        } else {
            ElMessage.error(res.msg || '订单取消失败');
        }
    } catch (err) {
        if (err !== 'cancel') {
            console.error('取消订单失败：', err);
            ElMessage.error('网络错误，取消订单失败');
        }
    }
};

const handleReturnOrder = async (orderId) => {
    const currentOrder = orders.value.find(order => order.id === orderId);
    returnForm.orderId = orderId;
    returnForm.userId = userInfo.value?.id || '';
    returnForm.merchantId = currentOrder?.merchantId || '';
    returnForm.returnReason = '';
    returnForm.returnImages = '';
    uploadFileList.value = [];
    returnImageUrls.value = [];

    isReturnDialogOpen.value = true;
};

const handleImageUploadSuccess = (response, uploadFile, uploadFiles) => {
    if (response.code === 1 && response.data) {
        returnImageUrls.value.push(response.data);
        returnForm.returnImages = returnImageUrls.value.join(',');
        ElMessage.success('图片上传成功');
    } else {
        ElMessage.error(response.msg || '图片上传失败');
        uploadFileList.value = uploadFileList.value.filter(item => item.uid !== uploadFile.uid);
    }
};

const handleImageUploadError = (error, uploadFile, uploadFiles) => {
    ElMessage.error('图片上传失败，请重试');
    uploadFileList.value = uploadFileList.value.filter(item => item.uid !== uploadFile.uid);
};

const handleUploadExceed = (files, uploadFiles) => {
    ElMessage.warning('最多只能上传3张图片');
};

// 评价图片上传成功回调
const handleReviewImageUploadSuccess = (response, uploadFile, uploadFiles) => {
    if (response.code === 1 && response.data) {
        reviewImageUrls.value.push(response.data);
        reviewForm.image = reviewImageUrls.value.join(',');
        ElMessage.success('图片上传成功');
    } else {
        ElMessage.error(response.msg || '图片上传失败');
        reviewUploadFileList.value = reviewUploadFileList.value.filter(item => item.uid !== uploadFile.uid);
    }
};

// 评价图片上传失败回调
const handleReviewImageUploadError = (error, uploadFile, uploadFiles) => {
    ElMessage.error('图片上传失败，请重试');
    reviewUploadFileList.value = reviewUploadFileList.value.filter(item => item.uid !== uploadFile.uid);
};

// 评价图片上传超出限制
const handleReviewUploadExceed = (files, uploadFiles) => {
    ElMessage.warning('最多只能上传5张图片');
};

// 打开评价弹窗
const openReviewDialog = (order, product) => {
    // 初始化评价表单
    reviewForm.orderId = order.id;
    reviewForm.productId = product.productId;
    reviewForm.orderItemId = product.orderItemId; // 使用订单项ID
    reviewForm.merchantId = order.merchantId;
    reviewForm.rating = 5;
    reviewForm.content = '';
    reviewForm.image = '';
    
    // 清空上传列表
    reviewUploadFileList.value = [];
    reviewImageUrls.value = [];
    
    isReviewDialogOpen.value = true;
};

// 提交评价
const submitReview = async () => {
    try {
        await reviewFormRef.value.validate();
        
        // 构造评价DTO
        const reviewDTO = {
            orderId: reviewForm.orderId,
            productId: reviewForm.productId,
            orderItemId: reviewForm.orderItemId,
            merchantId: reviewForm.merchantId,
            rating: reviewForm.rating,
            content: reviewForm.content,
            image: reviewForm.image
        };
        
        const res = await addReviewApi(reviewDTO);
        if (res.code === 1) {
            ElMessage.success('评价提交成功');
            isReviewDialogOpen.value = false;
            // 刷新订单列表以更新评价状态
            fetchOrders();
        } else {
            ElMessage.error(res.msg || '评价提交失败');
        }
    } catch (err) {
        if (err.name !== 'ValidationError') {
            console.error('提交评价失败：', err);
            ElMessage.error('网络错误，评价提交失败');
        }
    }
};

const submitReturnApply = async () => {
    try {
        await returnFormRef.value.validate();

        const returnApplyDTO = {
            orderId: returnForm.orderId,
            userId: returnForm.userId,
            merchantId: returnForm.merchantId,
            returnReason: returnForm.returnReason,
            returnImages: returnForm.returnImages
        };

        const res = await cancelOrder(returnApplyDTO);
        if (res.code === 1) {
            ElMessage.success('退货申请提交成功');
            isReturnDialogOpen.value = false;
            fetchOrders();
        } else {
            ElMessage.error(res.msg || '退货申请失败');
        }
    } catch (err) {
        if (err.name !== 'ValidationError') {
            console.error('提交退货申请失败：', err);
            ElMessage.error('网络错误，退货申请失败');
        }
    }
};

const handleConfirmReceipt = async (orderId) => {
    try {
        await ElMessageBox.confirm(
            '请确认您已收到商品且商品完好无损。确认收货后交易将完成。',
            '确认收货',
            {
                confirmButtonText: '确认收货',
                cancelButtonText: '再检查一下',
                type: 'info',
                confirmButtonClass: 'confirm-success-btn',
                cancelButtonClass: 'cancel-safe-btn',
                center: true, // 设置为true使弹窗在屏幕中心显示
                draggable: true, // 允许拖拽
                roundButton: true // 圆形按钮
            }
        );
        const result = await confirmOrderApi(orderId);
        if (result.code == 1) {
            ElMessage.success('成功收货，祝您下次购物愉快！');
            fetchOrders();
        }
    } catch (err) {
        if (err !== 'cancel') {
            console.error('确认收货失败：', err);
            ElMessage.error('网络错误，确认收货失败');
        }
    }
};

const goToHome = () => {
    router.push('/');
};

const getDisplayStatus = (status, paymentStatus) => {
    if (status === '已取消') {
        return paymentStatus === '已退款' ? '已退款' : '已取消';
    }
    const statusMap = {
        '待支付': '待支付',
        '已支付': '待发货',
        '已发货': '已发货',
        '已送达': '已完成',
    };
    return statusMap[status] || status;
};

const getStatusClass = (status, paymentStatus) => {
    if (status === '已取消' && paymentStatus === '已退款') {
        return 'status-refunded';
    }
    const classMap = {
        '待支付': 'status-pending',
        '已支付': 'status-paid',
        '已发货': 'status-shipped',
        '已送达': 'status-delivered',
        '已取消': 'status-cancelled'
    };
    return classMap[status] || '';
};

// 初始化加载（原有）
onMounted(() => {
    fetchUserInfo();
    fetchOrders();
});

// 组件卸载时清理定时器
onUnmounted(() => {
    stopCountdownTimer();
});
</script>
<style scoped>
/* 全局容器样式 - 添加渐变背景 */
.order-list-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 24px;
    background: linear-gradient(135deg, #f5f7fa 0%, #f9fafb 50%, #ffffff 100%);
    min-height: calc(100vh - 120px);
    position: relative;
}

/* 背景装饰 */
.order-list-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(180deg, rgba(24, 144, 255, 0.05) 0%, transparent 100%);
    pointer-events: none;
    z-index: 0;
}

.order-list-container > * {
    position: relative;
    z-index: 1;
}

/* 页面头部 */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
}

.page-title {
    font-size: 28px;
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 4px rgba(24, 144, 255, 0.1);
}

.page-title::after {
    content: '';
    display: inline-block;
    width: 4px;
    height: 24px;
    background: linear-gradient(180deg, #1890ff 0%, #096dd9 100%);
    margin-left: 12px;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
    animation: pulse-bar 2s ease-in-out infinite;
}

@keyframes pulse-bar {
    0%, 100% {
        transform: scaleY(1);
        opacity: 1;
    }
    50% {
        transform: scaleY(1.2);
        opacity: 0.8;
    }
}

.order-count {
    font-size: 14px;
    color: #1890ff;
    background: linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%);
    padding: 8px 20px;
    border-radius: 24px;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(24, 144, 255, 0.1);
    font-weight: 600;
    transition: all 0.3s ease;
}

.order-count:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.8);
}

/* 状态筛选栏 - 改为弹性布局，容纳单选组和售后按钮 - 升级渐变 */
.status-filter {
    background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
    padding: 20px;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(24, 144, 255, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    gap: 16px;
    border: 1px solid rgba(24, 144, 255, 0.05);
    transition: all 0.3s ease;
    /* 单选组和售后按钮的间距 */
}

.status-filter:hover {
    box-shadow: 0 6px 20px rgba(24, 144, 255, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 单选按钮组 - 弹性布局，自适应宽度 */
.status-radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.status-radio {
    margin: 0 !important;
    transition: all 0.2s ease;
}

.el-radio-button__inner {
    border-radius: 20px !important;
    padding: 0 16px;
}

.el-radio-group--medium .el-radio-button__inner {
    height: 36px;
    line-height: 36px;
}

/* 我的售后按钮样式 - 适配筛选栏高度，与单选按钮视觉统一 */
.after-sale-dropdown {
    display: flex;
    align-items: center;
}

.after-sale-btn {
    color: #1890ff;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    /* 与单选按钮高度一致 */
    padding: 0 16px;
    border-radius: 20px;
    /* 与单选按钮圆角统一 */
    border: 1px solid transparent;
    background: linear-gradient(135deg, rgba(24, 144, 255, 0.05) 0%, rgba(24, 144, 255, 0.02) 100%);
    transition: all 0.3s ease;
}

.after-sale-btn:hover {
    color: #096dd9;
    background: linear-gradient(135deg, rgba(24, 144, 255, 0.12) 0%, rgba(24, 144, 255, 0.08) 100%);
    border-color: rgba(24, 144, 255, 0.2);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
}

/* 售后筛选提示样式 - 增强效果 */
.after-sale-filter-tip {
    background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
    padding: 16px 20px;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(24, 144, 255, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid rgba(24, 144, 255, 0.1);
    transition: all 0.3s ease;
}

.after-sale-filter-tip:hover {
    box-shadow: 0 6px 20px rgba(24, 144, 255, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
}

.after-sale-status-text {
    font-weight: 500;
    padding: 4px 8px;
    border-radius: 4px;
}

.exit-after-sale-btn {
    margin-left: auto;
    color: #1890ff !important;
}

.exit-after-sale-btn:hover {
    color: #096dd9 !important;
}

/* 售后状态样式 */
.after-sale-pending {
    color: #faad14;
    background-color: rgba(250, 173, 20, 0.15);
}

.after-sale-approve {
    color: #52c41a;
    background-color: rgba(82, 196, 26, 0.15);
}

.after-sale-reject {
    color: #ff4d4f;
    background-color: rgba(255, 77, 79, 0.15);
}

/* 加载状态 */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
    color: #666;
}

.loading-spinner {
    margin-bottom: 16px;
    color: #1890ff;
    animation: spin 1.5s linear infinite;
}

.loading-text {
    font-size: 16px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* 空状态 */
.empty-container {
    padding: 80px 0;
}

.empty-content {
    --el-empty-padding: 0;
}

.el-empty__image {
    width: 200px !important;
    height: 200px !important;
    margin-bottom: 24px;
}

.el-empty__description {
    font-size: 16px;
    color: #666;
    margin-bottom: 24px;
}

.empty-action {
    color: #1890ff;
    font-size: 14px;
}

.empty-action:hover {
    color: #096dd9;
}

/* 订单卡片 */
.order-card-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.order-card {
    background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
    border-radius: 16px;
    padding: 28px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(24, 144, 255, 0.04);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    border: 1px solid rgba(24, 144, 255, 0.06);
    overflow: hidden;
}

/* 卡片渐变边框效果 */
.order-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #1890ff 0%, #096dd9 50%, #1890ff 100%);
    background-size: 200% 100%;
    animation: gradient-shift 3s ease infinite;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.order-card:hover::before {
    opacity: 1;
}

@keyframes gradient-shift {
    0%, 100% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
}

.order-card:hover {
    box-shadow: 0 8px 28px rgba(24, 144, 255, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-4px) scale(1.01);
    border-color: rgba(24, 144, 255, 0.15);
}

/* 订单头部 */
.order-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f2f5;
}

.order-main-info {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    margin-bottom: 16px;
}

/* 订单备注区域样式 - 增强视觉效果 */
.order-remark-section {
    margin-top: 12px;
    padding: 16px 20px;
    background: linear-gradient(135deg, #e8f7ff 0%, #d9f0ff 50%, #cde9ff 100%);
    border-left: 4px solid #1890ff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.8);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.order-remark-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
}

.order-remark-section:hover::before {
    left: 100%;
}

.order-remark-section:hover {
    box-shadow: 0 6px 18px rgba(24, 144, 255, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.8);
    transform: translateX(4px) scale(1.01);
    border-left-width: 6px;
}

.remark-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    background: linear-gradient(135deg, #1890ff 0%, #0e7cde 100%);
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    border-radius: 16px;
    margin-bottom: 10px;
    box-shadow: 0 3px 8px rgba(24, 144, 255, 0.4), inset 0 -1px 2px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.remark-tag:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.5), inset 0 -1px 2px rgba(0, 0, 0, 0.1);
}

.remark-tag i {
    font-size: 14px;
}

.remark-content-box {
    background-color: rgba(255, 255, 255, 0.7);
    padding: 10px 12px;
    border-radius: 6px;
    border: 1px solid rgba(24, 144, 255, 0.2);
}

.remark-text {
    margin: 0;
    color: #1d4c6e;
    font-size: 14px;
    line-height: 1.6;
    word-break: break-word;
    white-space: pre-wrap;
}

.order-extra-info {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    font-size: 13px;
    color: #666;
}

.order-number,
.order-time,
.order-countdown,
.order-ship-type,
.order-shipped-time,
.order-delivered-time,
.order-tracking-number,
.order-deliver-time,
.order-cancel-time,
.order-after-sale-time {
    display: flex;
    align-items: center;
    gap: 6px;
}

.order-number i,
.order-time i,
.order-countdown i,
.order-ship-type i,
.order-shipped-time i,
.order-delivered-time i,
.order-tracking-number i,
.order-deliver-time i,
.order-cancel-time i,
.order-after-sale-time i {
    color: #1890ff;
    font-size: 14px;
}

/* 倒计时样式 */
.order-countdown {
    padding: 4px 12px;
    border-radius: 6px;
    font-weight: 500;
    font-size: 13px;
    transition: all 0.3s ease;
}

/* 正常倒计时（大于3分钟）- 蓝色 */
.countdown-normal {
    background: linear-gradient(135deg, #e6f7ff 0%, #d9f0ff 100%);
    color: #1890ff;
    border-left: 3px solid #1890ff;
}

.countdown-normal i {
    color: #1890ff;
}

/* 警告倒计时（1-3分钟）- 橙色 */
.countdown-warning {
    background: linear-gradient(135deg, #fff7e6 0%, #ffedcc 100%);
    color: #fa8c16;
    border-left: 3px solid #fa8c16;
    animation: pulse-warning 2s ease-in-out infinite;
}

.countdown-warning i {
    color: #fa8c16;
}

/* 紧急倒计时（最后1分钟）- 红色 */
.countdown-urgent {
    background: linear-gradient(135deg, #fff1f0 0%, #ffe7e6 100%);
    color: #f5222d;
    border-left: 3px solid #f5222d;
    animation: pulse-urgent 1s ease-in-out infinite;
}

.countdown-urgent i {
    color: #f5222d;
}

/* 已过期倒计时 - 灰色 */
.countdown-expired {
    background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
    color: #999;
    border-left: 3px solid #d9d9d9;
}

.countdown-expired i {
    color: #999;
}

/* 警告脉冲动画 */
@keyframes pulse-warning {
    0%, 100% {
        box-shadow: 0 0 0 0 rgba(250, 140, 22, 0.4);
    }
    50% {
        box-shadow: 0 0 0 6px rgba(250, 140, 22, 0);
    }
}

/* 紧急脉冲动画 */
@keyframes pulse-urgent {
    0%, 100% {
        box-shadow: 0 0 0 0 rgba(245, 34, 45, 0.5);
    }
    50% {
        box-shadow: 0 0 0 8px rgba(245, 34, 45, 0);
    }
}

.order-status-wrapper {
    display: flex;
    align-items: flex-start;
}

.order-status {
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

/* 售后信息区域样式 */
.after-sale-info {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px dashed #f0f2f5;
}

.after-sale-section-title {
    font-size: 15px;
    color: #1d2129;
    font-weight: 500;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.after-sale-section-title i {
    color: #1890ff;
}

.after-sale-detail {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
}

.after-sale-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 10px;
    font-size: 14px;
}

.after-sale-row:last-child {
    margin-bottom: 0;
}

.after-sale-label {
    width: 80px;
    color: #666;
    font-weight: 500;
    flex-shrink: 0;
}

.after-sale-value {
    color: #1d2129;
    flex: 1;
    word-break: break-all;
}

/* 售后图片样式 */
.after-sale-images {
    display: flex;
    gap: 8px;
    margin-top: 4px;
}

.after-sale-image-item {
    width: 80px;
    height: 80px;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.after-sale-image-item:hover {
    transform: scale(1.05);
}

/* 售后状态标签样式 */
.after-sale-status-tag {
    margin-left: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
}

/* 地址区域 */
.address-container {
    margin-bottom: 24px;
}

.address-section-title {
    font-size: 16px;
    color: #1d2129;
    font-weight: 500;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.address-section-title i {
    color: #1890ff;
}

.address-card {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    transition: all 0.2s ease;
}

.address-card:hover {
    background-color: #f0f8fb;
}

.address-card-header {
    font-size: 15px;
    color: #1d2129;
    margin-bottom: 16px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
}

.address-card-header i {
    color: #1890ff;
}

.address-group {
    display: flex;
    gap: 16px;
}

.shipping-card,
.receiving-card {
    flex: 1;
}

.shipping-card {
    background-color: #e8f4f8;
}

.receiving-card {
    background-color: #f0f8fb;
}

.address-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 12px;
    font-size: 14px;
    line-height: 1.6;
}

.address-row:last-child {
    margin-bottom: 0;
}

.address-label {
    width: 80px;
    color: #666;
    font-weight: 500;
    flex-shrink: 0;
}

.address-value {
    color: #1d2129;
    flex: 1;
    word-break: break-all;
}

.address-placeholder {
    color: #999;
    flex: 1;
}

/* 商品区域 */
.order-products {
    margin-bottom: 24px;
}

.product-section-title {
    font-size: 16px;
    color: #1d2129;
    font-weight: 500;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.product-section-title i {
    color: #1890ff;
}

.product-item {
    display: flex;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f0f2f5;
    transition: all 0.2s ease;
    cursor: pointer;
}

.product-item:last-child {
    border-bottom: none;
}

.product-item:hover {
    background-color: #fafafa;
}

.product-img-wrapper {
    width: 80px;
    height: 80px;
    border-radius: 12px;
    overflow: hidden;
    margin-right: 16px;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.5);
    border: 2px solid rgba(24, 144, 255, 0.1);
    position: relative;
    transition: all 0.3s ease;
}

.product-img-wrapper::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(24, 144, 255, 0.1) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.product-item:hover .product-img-wrapper {
    box-shadow: 0 6px 16px rgba(24, 144, 255, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.5);
    border-color: rgba(24, 144, 255, 0.3);
}

.product-item:hover .product-img-wrapper::after {
    opacity: 1;
}

.product-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.product-item:hover .product-img {
    transform: scale(1.05);
}

.product-info {
    flex: 1;
    overflow: hidden;
}

.product-name {
    font-size: 15px;
    color: #1d2129;
    margin-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.product-price {
    font-size: 14px;
    color: #ff4d4f;
    font-weight: 500;
}

.product-quantity {
    font-size: 14px;
    color: #666;
    margin-left: 16px;
    flex-shrink: 0;
}

/* 评价操作区域 */
.review-action {
    margin-left: 16px;
    display: flex;
    align-items: center;
}

/* 订单底部 */
.order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid #f0f2f5;
}

.order-summary {
    display: flex;
    gap: 24px;
}

.summary-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
}

.summary-label {
    color: #666;
}

.summary-value {
    color: #1d2129;
    font-weight: 500;
}

.amount {
    color: #ff4d4f;
    font-size: 18px;
    font-weight: 600;
}

.order-actions {
    display: flex;
    gap: 12px;
    align-items: center;
}

.action-btn {
    border-radius: 6px !important;
    padding: 6px 16px !important;
    transition: all 0.2s ease !important;
}

.primary-btn {
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%) !important;
    border-color: transparent !important;
    box-shadow: 0 3px 8px rgba(24, 144, 255, 0.3) !important;
    font-weight: 600 !important;
    position: relative !important;
    overflow: hidden !important;
}

.primary-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s ease, height 0.6s ease;
}

.primary-btn:hover::before {
    width: 300px;
    height: 300px;
}

.primary-btn:hover {
    background: linear-gradient(135deg, #0e7cde 0%, #085bb5 100%) !important;
    box-shadow: 0 5px 14px rgba(24, 144, 255, 0.45) !important;
    transform: translateY(-2px) !important;
}

.cancel-btn {
    color: #ff4d4f !important;
}

.cancel-btn:hover {
    color: #d9363e !important;
    background-color: rgba(255, 77, 79, 0.06) !important;
}

.return-btn {
    color: #1890ff !important;
}

.return-btn:hover {
    color: #096dd9 !important;
    background-color: rgba(24, 144, 255, 0.06) !important;
}

.confirm-btn {
    background: linear-gradient(135deg, #52c41a 0%, #3da115 100%) !important;
    border-color: transparent !important;
    box-shadow: 0 3px 8px rgba(82, 196, 26, 0.3) !important;
    font-weight: 600 !important;
    position: relative !important;
    overflow: hidden !important;
}

.confirm-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s ease, height 0.6s ease;
}

.confirm-btn:hover::before {
    width: 300px;
    height: 300px;
}

.confirm-btn:hover {
    background: linear-gradient(135deg, #3da115 0%, #2f800f 100%) !important;
    box-shadow: 0 5px 14px rgba(82, 196, 26, 0.45) !important;
    transform: translateY(-2px) !important;
}

/* 售后订单操作区提示 */
.after-sale-tip {
    color: #666;
    font-size: 13px;
}

/* 状态标签样式 */
.status-pending {
    color: #faad14;
    background-color: rgba(250, 173, 20, 0.15);
}

.status-paid {
    color: #1890ff;
    background-color: rgba(24, 144, 255, 0.15);
}

.status-shipped {
    color: #52c41a;
    background-color: rgba(82, 196, 26, 0.15);
}

.status-delivered {
    color: #00b42a;
    background-color: rgba(0, 180, 42, 0.15);
}

.status-review {
    color: #722ed1;
    background-color: rgba(114, 46, 209, 0.15);
}

.status-cancelled {
    color: #999;
    background-color: rgba(153, 153, 153, 0.15);
}

.status-refunded {
    color: #ff4d4f;
    background-color: rgba(255, 77, 79, 0.15);
}

/* MessageBox 按钮样式 */
:deep(.confirm-danger-btn) {
    background-color: #ff4d4f !important;
    border-color: #ff4d4f !important;
}

:deep(.confirm-warning-btn) {
    background-color: #faad14 !important;
    border-color: #faad14 !important;
}

:deep(.confirm-success-btn) {
    background-color: #52c41a !important;
    border-color: #52c41a !important;
}

:deep(.cancel-safe-btn) {
    color: #666 !important;
    border-color: #d9d9d9 !important;
}

:deep(.confirm-danger-btn:hover) {
    background-color: #d9363e !important;
    border-color: #d9363e !important;
}

:deep(.confirm-warning-btn:hover) {
    background-color: #d48806 !important;
    border-color: #d48806 !important;
}

:deep(.confirm-success-btn:hover) {
    background-color: #389e0d !important;
    border-color: #389e0d !important;
}

:deep(.cancel-safe-btn:hover) {
    color: #1890ff !important;
    border-color: #1890ff !important;
}

/* 退货弹窗样式 */
:deep(.el-dialog__body) {
    padding: 20px;
}

:deep(.el-form-item) {
    margin-bottom: 20px;
}

:deep(.el-textarea__inner) {
    resize: none;
    border-radius: 8px;
}

:deep(.el-upload--picture-card) {
    width: 100px;
    height: 100px;
}

.upload-tip {
    margin-top: 10px;
    font-size: 12px;
    color: #999;
}

/* 响应式调整 */
@media (max-width: 1024px) {
    .address-group {
        flex-direction: column;
        gap: 12px;
    }

    .order-summary {
        gap: 16px;
    }
}

@media (max-width: 768px) {
    .order-list-container {
        padding: 16px;
    }

    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .page-title {
        font-size: 24px;
    }

    /* 筛选栏响应式 - 小屏幕自动换行 */
    .status-filter {
        flex-wrap: wrap;
        padding: 12px;
    }

    .status-radio-group {
        width: 100%;
        gap: 4px;
    }

    .after-sale-btn {
        width: 100%;
        justify-content: center;
        margin-top: 8px;
    }

    .order-header {
        flex-direction: column;
        gap: 12px;
    }

    .order-main-info,
    .order-extra-info {
        gap: 16px;
    }

    .order-status-wrapper {
        align-self: flex-end;
    }

    .order-footer {
        flex-direction: column;
        align-items: flex-end;
        gap: 12px;
    }

    .product-name {
        font-size: 14px;
    }

    .product-img-wrapper {
        width: 60px;
        height: 60px;
    }

    /* 售后筛选提示响应式 */
    .after-sale-filter-tip {
        flex-wrap: wrap;
    }

    .exit-after-sale-btn {
        margin-left: 0;
        margin-top: 8px;
        width: 100%;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .order-card {
        padding: 16px;
    }

    .order-main-info,
    .order-extra-info {
        flex-direction: column;
        gap: 8px;
    }

    .address-card {
        padding: 16px;
    }

    .address-row {
        flex-direction: column;
        align-items: flex-start;
    }

    .address-label {
        width: auto;
        margin-bottom: 4px;
    }

    .order-summary {
        flex-direction: column;
        gap: 8px;
        width: 100%;
    }

    .order-actions {
        width: 100%;
        justify-content: flex-end;
    }

    /* 弹窗响应式 */
    :deep(.el-dialog) {
        width: 90% !important;
    }
}

/* 居中对话框样式 */
.centered-dialog {
    display: flex;
    align-items: center;
    justify-content: center;
}

.centered-dialog .el-dialog {
    margin: 0 auto !important;
}

/* 评价按钮样式 */
.review-button {
    margin-left: 10px;
}

/* 已评价标签样式 */
.reviewed-tag {
    margin-left: 10px;
}

/* 上传提示样式 */
.upload-tip {
    font-size: 12px;
    color: #999;
    margin-top: 5px;
}
</style>