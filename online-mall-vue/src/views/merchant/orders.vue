<template>
    <div class="order-list-container">
        <!-- 页面标题栏 -->
        <div class="page-header">
            <h1 class="page-title">商家订单管理</h1>
            <div class="order-count" v-if="!isLoading">
                共 {{ orders.length }} 个订单
            </div>
        </div>

        <!-- 订单状态筛选栏：修复 size 不支持问题 -->
        <div class="status-filter">
            <el-radio-group v-model="currentStatus" size="small" @change="handleStatusChange">
                <el-radio-button v-for="item in statusOptions" :key="item.value" :label="item.value"
                    class="status-radio">
                    {{ item.label }}
                </el-radio-button>
            </el-radio-group>
        </div>

        <!-- 加载状态 -->
        <div class="loading-container" v-if="isLoading">
            <div class="loading-spinner"></div>
            <p class="loading-text">加载订单数据中...</p>
        </div>

        <!-- 空状态 -->
        <div class="empty-container" v-if="!isLoading && orders.length === 0">
            <el-empty description="暂无当前状态的订单" class="empty-content">
                <el-button type="text" @click="refreshOrders" class="empty-action">
                    <i class="el-icon-refresh"></i> 刷新
                </el-button>
            </el-empty>
        </div>

        <!-- 订单列表 -->
        <div class="order-card-list" v-if="!isLoading && orders.length > 0">
            <div class="order-card" v-for="order in orders" :key="order.id" hover>
                <!-- 订单头部信息 -->
                <div class="order-header">
                    <div class="order-info">
                        <!-- 顾客信息 -->
                        <div class="customer-info">
                            <img :src="order.customerImage" alt="顾客头像" class="customer-avatar">
                            <div class="customer-meta">
                                <span class="customer-nickname">{{ order.customerNickName || '匿名顾客' }}</span>
                            </div>
                        </div>

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
                            <!-- 售后订单新增：申请售后时间 -->
                            <template v-if="order.audit">
                                <span class="order-time">
                                    <i class="el-icon-time"></i> 售后申请时间：{{ formatDate(order.audit.applyTime) }}
                                </span>
                            </template>
                        </div>
                        
                        <!-- 订单备注区域 - 独立展示 -->
                        <div class="order-remark-section" v-if="order.remark">
                            <div class="remark-tag">
                                <i class="el-icon-edit-outline"></i>
                                <span>顾客备注</span>
                            </div>
                            <div class="remark-content-box">
                                <p class="remark-text">{{ order.remark }}</p>
                            </div>
                        </div>

                        <!-- 已发货状态信息 -->
                        <template v-if="order.status === '已发货' && !order.audit">
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
                        <template v-if="order.status === '已取消' && !order.audit">
                            <div class="order-extra-info">
                                <span class="order-deliver-time">
                                    <i class="el-icon-send"></i> 发货时间：{{ formatDate(order.shippedTime) }}
                                </span>
                                <span class="order-cancel-time">
                                    <i class="el-icon-close"></i> 取消时间：{{ formatDate(order.orderedTime) }}
                                </span>
                                <span class="order-payment-status">
                                    <i class="el-icon-money"></i> 支付状态：{{ order.paymentStatus }}
                                </span>
                            </div>
                        </template>

                        <!-- 已完成状态信息 -->
                        <template v-if="order.status === '已送达' && !order.audit">
                            <div class="order-extra-info">
                                <span class="order-ship-type">
                                    <i class="el-icon-truck"></i> 快递方式：{{ order.shipType || '暂无' }}
                                </span>
                                <span class="order-shipped-time">
                                    <i class="el-icon-send"></i> 发货时间：{{ formatDate(order.shippedTime) }}
                                </span>
                                <span class="order-delivered-time">
                                    <i class="el-icon-check"></i> 完成时间：{{ formatDate(order.deliveredTime) }}
                                </span>
                                <span class="order-tracking-number">
                                    <i class="el-icon-barcode"></i> 物流单号：{{ order.trackingNumber || '暂无' }}
                                </span>
                            </div>
                        </template>

                        <!-- 售后订单新增：售后信息 -->
                        <template v-if="order.audit">
                            <div class="order-extra-info">
                                <span class="order-ship-type">
                                    <i class="el-icon-truck"></i> 快递方式：{{ order.shipType || '暂无' }}
                                </span>
                                <span class="order-tracking-number">
                                    <i class="el-icon-barcode"></i> 物流单号：{{ order.trackingNumber || '暂无' }}
                                </span>
                                <span class="order-refund-reason">
                                    <i class="el-icon-document"></i> 退货原因：{{ order.audit.returnReason || '暂无' }}
                                </span>
                            </div>
                        </template>
                    </div>

                    <div class="order-status-wrapper">
                        <!-- 售后订单显示审核状态，普通订单显示原状态 -->
                        <span class="order-status"
                            :class="order.audit ? getAuditStatusClass(order.audit.auditStatus) : getStatusClass(order.status, order.paymentStatus)">
                            {{ order.audit ? order.audit.auditStatus : getDisplayStatus(order.status) }}
                        </span>
                    </div>
                </div>

                <!-- 地址显示区域：billingAddressInfo=发货地址，shippingAddressInfo=收货地址 -->
                <div class="address-container"
                    v-if="order.status === '已支付' || order.status === '已发货' || order.status === '已取消' || order.status === '已送达' || order.status === '审核中' || order.audit">
                    <div class="address-section-title">
                        <i class="el-icon-location"></i> 地址信息
                    </div>

                    <!-- 待发货/审核中：显示发货地址（billingAddressInfo）+ 收货地址（shippingAddressInfo） -->
                    <div class="address-group" v-if="order.status === '已支付' || order.status === '审核中'">
                        <div class="address-card shipping-card">
                            <div class="address-card-header">
                                <i class="el-icon-ship"></i> 发货地址（商家）
                            </div>
                            <div class="address-row">
                                <span class="address-label">联系人：</span>
                                <span class="address-value" v-if="order.billingAddressInfo">{{
                                    order.billingAddressInfo.recipient }}</span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">联系电话：</span>
                                <span class="address-value" v-if="order.billingAddressInfo">{{
                                    order.billingAddressInfo.phone }}</span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">详细地址：</span>
                                <span class="address-value" v-if="order.billingAddressInfo">
                                    {{ order.billingAddressInfo.province }}{{ order.billingAddressInfo.city }}{{
                                        order.billingAddressInfo.district }}{{ order.billingAddressInfo.detail }}
                                </span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                        </div>
                        <div class="address-card receiving-card">
                            <div class="address-card-header">
                                <i class="el-icon-user"></i> 收货地址（顾客）
                            </div>
                            <div class="address-row">
                                <span class="address-label">收件人：</span>
                                <span class="address-value" v-if="order.shippingAddressInfo">{{
                                    order.shippingAddressInfo.recipient
                                }}</span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">联系电话：</span>
                                <span class="address-value" v-if="order.shippingAddressInfo">{{
                                    order.shippingAddressInfo.phone }}</span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">详细地址：</span>
                                <span class="address-value" v-if="order.shippingAddressInfo">
                                    {{ order.shippingAddressInfo.province }}{{ order.shippingAddressInfo.city }}{{
                                        order.shippingAddressInfo.district }}{{ order.shippingAddressInfo.detail }}
                                </span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                        </div>
                    </div>

                    <!-- 已发货/已完成：显示发货地址（billingAddressInfo）+ 收货地址（shippingAddressInfo） -->
                    <div class="address-group" v-else-if="order.status === '已发货' || order.status === '已送达'">
                        <div class="address-card shipping-card">
                            <div class="address-card-header">
                                <i class="el-icon-ship"></i> 发货地址（商家）
                            </div>
                            <div class="address-row">
                                <span class="address-label">联系人：</span>
                                <span class="address-value" v-if="order.billingAddressInfo">{{
                                    order.billingAddressInfo.recipient }}</span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">联系电话：</span>
                                <span class="address-value" v-if="order.billingAddressInfo">{{
                                    order.billingAddressInfo.phone }}</span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">详细地址：</span>
                                <span class="address-value" v-if="order.billingAddressInfo">
                                    {{ order.billingAddressInfo.province }}{{ order.billingAddressInfo.city }}{{
                                        order.billingAddressInfo.district }}{{ order.billingAddressInfo.detail }}
                                </span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">快递方式：</span>
                                <span class="address-value">{{ order.shipType || '暂无' }}</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">发货时间：</span>
                                <span class="address-value">{{ formatDate(order.shippedTime) }}</span>
                            </div>
                            <div class="address-row" v-if="order.status === '已送达'">
                                <span class="address-label">完成时间：</span>
                                <span class="address-value">{{ formatDate(order.deliveredTime) }}</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">物流单号：</span>
                                <span class="address-value">{{ order.trackingNumber || '暂无' }}</span>
                            </div>
                        </div>
                        <div class="address-card receiving-card">
                            <div class="address-card-header">
                                <i class="el-icon-user"></i> 收货地址（顾客）
                            </div>
                            <div class="address-row">
                                <span class="address-label">收件人：</span>
                                <span class="address-value" v-if="order.shippingAddressInfo">{{
                                    order.shippingAddressInfo.recipient
                                }}</span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">联系电话：</span>
                                <span class="address-value" v-if="order.shippingAddressInfo">{{
                                    order.shippingAddressInfo.phone }}</span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">详细地址：</span>
                                <span class="address-value" v-if="order.shippingAddressInfo">
                                    {{ order.shippingAddressInfo.province }}{{ order.shippingAddressInfo.city }}{{
                                        order.shippingAddressInfo.district }}{{ order.shippingAddressInfo.detail }}
                                </span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                        </div>
                    </div>

                    <!-- 已取消状态：显示发货地址（billingAddressInfo）+ 收货地址（shippingAddressInfo） -->
                    <div class="address-group" v-if="order.status === '已取消' && !order.audit">
                        <div class="address-card shipping-card">
                            <div class="address-card-header">
                                <i class="el-icon-ship"></i> 发货地址（商家）
                            </div>
                            <div class="address-row">
                                <span class="address-label">联系人：</span>
                                <span class="address-value" v-if="order.billingAddressInfo">{{
                                    order.billingAddressInfo.recipient }}</span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">联系电话：</span>
                                <span class="address-value" v-if="order.billingAddressInfo">{{
                                    order.billingAddressInfo.phone }}</span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">详细地址：</span>
                                <span class="address-value" v-if="order.billingAddressInfo">
                                    {{ order.billingAddressInfo.province }}{{ order.billingAddressInfo.city }}{{
                                        order.billingAddressInfo.district }}{{ order.billingAddressInfo.detail }}
                                </span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                        </div>
                        <div class="address-card receiving-card">
                            <div class="address-card-header">
                                <i class="el-icon-user"></i> 收货地址（顾客）
                            </div>
                            <div class="address-row">
                                <span class="address-label">收件人：</span>
                                <span class="address-value" v-if="order.shippingAddressInfo">{{
                                    order.shippingAddressInfo.recipient
                                }}</span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">联系电话：</span>
                                <span class="address-value" v-if="order.shippingAddressInfo">{{
                                    order.shippingAddressInfo.phone }}</span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">详细地址：</span>
                                <span class="address-value" v-if="order.shippingAddressInfo">
                                    {{ order.shippingAddressInfo.province }}{{ order.shippingAddressInfo.city }}{{
                                        order.shippingAddressInfo.district }}{{ order.shippingAddressInfo.detail }}
                                </span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                        </div>
                    </div>

                    <!-- 售后订单地址信息 -->
                    <div class="address-group" v-if="order.audit">
                        <div class="address-card shipping-card">
                            <div class="address-card-header">
                                <i class="el-icon-ship"></i> 发货地址（商家）
                            </div>
                            <div class="address-row">
                                <span class="address-label">联系人：</span>
                                <span class="address-value" v-if="order.billingAddressInfo">{{
                                    order.billingAddressInfo.recipient }}</span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">联系电话：</span>
                                <span class="address-value" v-if="order.billingAddressInfo">{{
                                    order.billingAddressInfo.phone }}</span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">详细地址：</span>
                                <span class="address-value" v-if="order.billingAddressInfo">
                                    {{ order.billingAddressInfo.province }}{{ order.billingAddressInfo.city }}{{
                                        order.billingAddressInfo.district }}{{ order.billingAddressInfo.detail }}
                                </span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                        </div>
                        <div class="address-card receiving-card">
                            <div class="address-card-header">
                                <i class="el-icon-user"></i> 收货地址（顾客）
                            </div>
                            <div class="address-row">
                                <span class="address-label">收件人：</span>
                                <span class="address-value" v-if="order.shippingAddressInfo">{{
                                    order.shippingAddressInfo.recipient
                                }}</span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">联系电话：</span>
                                <span class="address-value" v-if="order.shippingAddressInfo">{{
                                    order.shippingAddressInfo.phone }}</span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                            <div class="address-row">
                                <span class="address-label">详细地址：</span>
                                <span class="address-value" v-if="order.shippingAddressInfo">
                                    {{ order.shippingAddressInfo.province }}{{ order.shippingAddressInfo.city }}{{
                                        order.shippingAddressInfo.district }}{{ order.shippingAddressInfo.detail }}
                                </span>
                                <span class="address-placeholder" v-else>暂无</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 订单商品列表 -->
                <div class="order-products">
                    <div class="product-section-title">
                        <i class="el-icon-goods"></i> 商品信息
                    </div>
                    <div class="product-item" v-for="product in order.items" :key="product.productId">
                        <div class="product-img-wrapper">
                            <img :src="product.imageUrl" alt="商品图片" class="product-img">
                        </div>
                        <div class="product-info">
                            <p class="product-name">{{ product.productName }}</p>
                            <p class="product-price">¥{{ product.productPrice.toFixed(2) }}</p>
                        </div>
                        <div class="product-quantity">x{{ product.quantity }}</div>
                    </div>
                </div>

                <!-- 售后订单新增：售后审核信息区域 -->
                <template v-if="order.audit">
                    <div class="after-sales-info">
                        <div class="after-sales-section-title">
                            <i class="el-icon-warning"></i> 售后审核信息
                        </div>
                        <div class="after-sales-details">
                            <div class="after-sales-row">
                                <span class="after-sales-label">审核状态：</span>
                                <span class="after-sales-value">{{ order.audit.auditStatus }}</span>
                            </div>
                            <div class="after-sales-row">
                                <span class="after-sales-label">退货原因：</span>
                                <span class="after-sales-value">{{ order.audit.returnReason || '暂无' }}</span>
                            </div>
                            <div class="after-sales-row" v-if="order.audit.returnImage">
                                <span class="after-sales-label">退货凭证：</span>
                                <img :src="order.audit.returnImage" alt="退货凭证" class="after-sales-image">
                            </div>
                            <div class="after-sales-row" v-if="order.audit.auditReason">
                                <span class="after-sales-label">审核说明：</span>
                                <span class="after-sales-value">{{ order.audit.auditReason }}</span>
                            </div>
                            <div class="after-sales-row" v-if="order.audit.auditTime">
                                <span class="after-sales-label">审核时间：</span>
                                <span class="after-sales-value">{{ formatDate(order.audit.auditTime) }}</span>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- 订单金额和操作按钮 -->
                <div class="order-footer">
                    <div class="order-summary">
                        <div class="summary-item">
                            <span class="summary-label">商品数量：</span>
                            <span class="summary-value">{{order.items.reduce((sum, item) => sum + item.quantity, 0)}}
                                件</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">实付款：</span>
                            <span class="summary-value amount">¥{{ order.totalAmount.toFixed(2) }}</span>
                        </div>
                    </div>
                    <div class="order-actions">
                        <!-- 待发货（已支付）：发货按钮 -->
                        <template v-if="order.status === '已支付' && !order.audit">
                            <el-button type="primary" size="small" @click="handleShipClick(order.id)"
                                class="action-btn primary-btn">
                                发货
                            </el-button>
                        </template>

                        <!-- 售后订单：待审核状态显示同意/拒绝按钮 -->
                        <template v-if="order.audit && order.audit.auditStatus === '待审核'">
                            <el-button type="primary" size="small" @click="handleApproveAudit(order)"
                                class="action-btn primary-btn">
                                同意
                            </el-button>
                            <el-button type="text" size="small" @click="handleRejectAudit(order)"
                                class="action-btn refuse-btn">
                                拒绝
                            </el-button>
                        </template>

                        <!-- 其他状态：无按钮 -->
                        <template v-else>
                            <span class="no-action"></span>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 发货弹窗 -->
    <el-dialog title="订单发货" v-model="isShipModalOpen" width="500px" :close-on-click-modal="false" center draggable :modal-append-to-body="false" :append-to-body="true" top="15vh" modal-class="centered-dialog">
        <el-form :model="shipForm" :rules="shipFormRules" ref="shipFormRef" label-width="100px">
            <el-form-item label="发货地址" prop="addressId">
                <el-select v-model="shipForm.addressId" placeholder="请选择发货地址" style="width: 100%">
                    <el-option v-for="address in addressList" :key="address.id"
                        :label="`${address.recipient}（${address.phone}）${address.province}${address.city}${address.district}${address.detail}`"
                        :value="address.id"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="快递方式" prop="shipType">
                <el-select v-model="shipForm.shipType" placeholder="请选择快递方式" style="width: 100%">
                    <!-- 选项 value 改为中文，与后端枚举值一致 -->
                    <el-option v-for="type in shipTypeOptions" :key="type.value" :label="type.label"
                        :value="type.value"></el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="isShipModalOpen = false">取消</el-button>
            <el-button type="primary" @click="submitShipForm">确认发货</el-button>
        </template>
    </el-dialog>

    <!-- 拒绝售后弹窗 -->
    <el-dialog title="拒绝售后申请" v-model="isRejectModalOpen" width="500px" :close-on-click-modal="false" center draggable :modal-append-to-body="false" :append-to-body="true" top="15vh" modal-class="centered-dialog">
        <el-form :model="rejectForm" :rules="rejectFormRules" ref="rejectFormRef" label-width="100px">
            <el-form-item label="拒绝原因" prop="auditReason">
                <el-input v-model="rejectForm.auditReason" type="textarea" :rows="5"
                    placeholder="请输入拒绝售后申请的原因"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="isRejectModalOpen = false">取消</el-button>
            <el-button type="primary" @click="submitRejectForm">确认拒绝</el-button>
        </template>
    </el-dialog>

    <!-- 同意售后弹窗（新增） -->
    <el-dialog title="同意售后申请" v-model="isApproveModalOpen" width="500px" :close-on-click-modal="false" center draggable :modal-append-to-body="false" :append-to-body="true" top="15vh" modal-class="centered-dialog">
        <el-form :model="approveForm" :rules="approveFormRules" ref="approveFormRef" label-width="100px">
            <el-form-item label="审核说明" prop="auditReason">
                <el-input v-model="approveForm.auditReason" type="textarea" :rows="3"
                    placeholder="可选：输入同意售后的审核说明（如无需说明可留空）"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="isApproveModalOpen = false">取消</el-button>
            <el-button type="primary" @click="submitApproveForm">确认同意</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, onMounted, reactive, onUnmounted } from 'vue';
import { ElButton, ElMessage, ElEmpty, ElRadioGroup, ElRadioButton, ElDialog, ElForm, ElFormItem, ElSelect, ElOption, ElMessageBox, ElInput } from 'element-plus';
import { getMerchantOrders } from '@/api/order'; // 商家订单接口
import { shipOrder } from '@/api/order'; // 发货接口
import { getAddressApi } from '@/api/address'; // 地址列表接口（返回 { total, rows }）
import { getAddressByI } from '@/api/address'; // 根据ID查地址接口（返回 { id, recipient, ... }）
// 导入售后相关接口
import { approveAuditApi, rejectAuditApi } from '@/api/order';
import { getMerchantAuditApi } from '@/api/audit';
import { getUserApi } from '@/api/user';
// 状态管理
const statusOptions = ref([
    { value: 'all', label: '全部订单' },
    { value: 'paid', label: '待发货' },
    { value: 'shipped', label: '已发货' },
    { value: 'delivered', label: '已完成' },
    { value: 'cancelled', label: '已取消' },
    // 新增售后相关筛选选项
    { value: 'audit_pending', label: '待审核售后' },
    { value: 'audit_approved', label: '已批准售后' },
    { value: 'audit_rejected', label: '已拒绝售后' }
]);

const currentStatus = ref('all');
const orders = ref([]);
const isLoading = ref(false);
const addressList = ref([]); // 发货地址列表
const userInfo = ref(null);

// 倒计时定时器
let countdownTimer = null;
// 防止重复刷新的标志
let isRefreshing = false;

// 发货弹窗相关
const isShipModalOpen = ref(false);
const shipFormRef = ref(null);
const shipForm = reactive({
    orderId: '', // 订单ID
    addressId: '', // 发货地址ID
    shipType: '' // 快递方式（现在存中文值，如"顺丰"）
});
const shipFormRules = reactive({
    addressId: [{ required: true, message: '请选择发货地址', trigger: 'change' }],
    shipType: [{ required: true, message: '请选择快递方式', trigger: 'change' }]
});
const isApproveModalOpen = ref(false);
const approveFormRef = ref(null);
const approveForm = reactive({
    auditReason: '', // 可选的审核说明
    orderId: '',
    auditId: ''
});
// 审核说明可选，无需必填校验
const approveFormRules = reactive({
    auditReason: [{ message: '审核说明最多200字', max: 200, trigger: 'blur' }]
});
// 拒绝售后弹窗相关
const isRejectModalOpen = ref(false);
const rejectFormRef = ref(null);
const rejectForm = reactive({
    auditReason: '', // 拒绝原因
    orderId: '',
    auditId: ''
});
const rejectFormRules = reactive({
    auditReason: [{ required: true, message: '请输入拒绝原因', trigger: 'blur' }]
});

// 核心修改：快递方式选项 value 改为中文，与后端 ShipType 枚举值完全一致
const shipTypeOptions = ref([
    { value: '顺丰', label: '顺丰' },
    { value: '韵达', label: '韵达' },
    { value: '圆通', label: '圆通' },
    { value: '中通', label: '中通' },
    { value: '极兔', label: '极兔' },
    { value: '中国', label: '中国' }
]);

// 格式化日期
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
        // 检查是否有订单超时，自动刷新订单列表（防止重复刷新）
        const hasExpired = orders.value.some(order => 
            order.status === '待支付' && order.countdown <= 0
        );
        if (hasExpired && !isRefreshing) {
            isRefreshing = true;
            // 延迟3秒刷新，等待后端更新，并给用户足够的时间看到倒计时结束
            setTimeout(() => {
                fetchOrders().finally(() => {
                    // 刷新完成后，再等5秒才允许下次自动刷新
                    setTimeout(() => {
                        isRefreshing = false;
                    }, 5000);
                });
            }, 3000);
        }
    }, 1000);
};

// 停止倒计时定时器
const stopCountdownTimer = () => {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
    // 重置刷新标志
    isRefreshing = false;
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

// 根据ID查地址（适配接口返回格式：直接返回地址对象）
const getSingleAddress = async (addressId) => {
    try {
        // 校验addressId有效性
        if (!addressId) return null;

        const res = await getAddressByI(addressId);
        // 接口返回格式：{ code:1, msg:"success", data: 地址对象 }
        if (res.code === 1 && res.data) {
            // 直接返回data对象（地址信息）
            return res.data;
        }
        ElMessage.warning(`未找到ID为${addressId}的地址`);
        return null;
    } catch (err) {
        console.error(`获取地址ID=${addressId}失败：`, err);
        ElMessage.error('地址查询失败');
        return null;
    }
};

// 获取订单列表（区分普通订单和售后订单）
const fetchOrders = async () => {
    try {
        isLoading.value = true;
        let res = null;

        // 判断当前是否是售后相关筛选
        const isAfterSalesStatus = ['audit_pending', 'audit_approved', 'audit_rejected'].includes(currentStatus.value);

        if (isAfterSalesStatus) {
            // 售后订单：根据状态映射auditStatus
            let auditStatus = 0;
            switch (currentStatus.value) {
                case 'audit_pending':
                    auditStatus = 0; // 待审核
                    break;
                case 'audit_approved':
                    auditStatus = 1; // 已批准
                    break;
                case 'audit_rejected':
                    auditStatus = 2; // 已拒绝
                    break;
            }
            // 调用售后订单接口
            res = await getMerchantAuditApi(auditStatus);
        } else {
            // 普通订单：原有逻辑
            const param = currentStatus.value !== 'all' ? { status: currentStatus.value } : {};
            res = await getMerchantOrders(param);
        }

        if (res.code === 1) {
            orders.value = res.data || [];

            // 为每个订单查询对应的发货地址和收货地址（保持原有逻辑）
            for (const order of orders.value) {
                // 为未支付订单初始化倒计时
                if (order.status === '待支付') {
                    order.countdown = calculateCountdown(order.orderedTime);
                }
                
                if (order.status === '已支付' || order.status === '已发货' || order.status === '已取消' || order.status === '已送达' || order.status === '审核中' || order.audit) {
                    // 1. 发货地址：billingAddressInfo = 根据 order.billingAddressId 查询
                    if (order.billingAddressId) {
                        order.billingAddressInfo = await getSingleAddress(order.billingAddressId);
                    }
                    // 2. 收货地址：shippingAddressInfo = 根据 order.shippingAddressId 查询
                    if (order.shippingAddressId) {
                        order.shippingAddressInfo = await getSingleAddress(order.shippingAddressId);
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

// 获取所有地址列表（适配接口返回格式：data.rows 数组）
const fetchAddressList = async () => {
    try {
        const res = await getAddressApi();
        // 接口返回格式：{ code:1, msg:"success", data: { total:2, rows: [地址1, 地址2] } }
        if (res.code === 1 && res.data && res.data.rows) {
            addressList.value = res.data.rows || [];
        } else {
            addressList.value = [];
            ElMessage.error(res.msg || '地址列表获取失败');
        }
    } catch (err) {
        console.error('获取地址列表失败：', err);
        ElMessage.error('网络错误，地址列表获取失败');
    }
};

// 状态切换
const handleStatusChange = (value) => {
    currentStatus.value = value;
    // 切换状态时，停止当前定时器并重置刷新标志
    stopCountdownTimer();
    fetchOrders();
};

// 刷新订单
const refreshOrders = () => {
    // 手动刷新时，停止当前定时器并重置刷新标志
    stopCountdownTimer();
    fetchOrders();
};

// 发货按钮点击（添加防误触确认）
const handleShipClick = (orderId) => {
    ElMessageBox.confirm(
        '确定要为该订单发货吗？发货后将无法撤销',
        '确认发货',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(() => {
        // 确认后打开发货弹窗
        openShipModal(orderId);
    }).catch(() => {
        ElMessage.info('已取消发货操作');
    });
};

// 打开发货弹窗
const openShipModal = (orderId) => {
    shipForm.orderId = orderId;
    shipForm.addressId = '';
    shipForm.shipType = '';
    isShipModalOpen.value = true;
    // 每次打开弹窗重新获取地址列表（确保地址最新）
    fetchAddressList();
};

// 提交发货表单
const submitShipForm = async () => {
    try {
        await shipFormRef.value.validate();
        const shipDTO = {
            orderId: shipForm.orderId,
            addressId: shipForm.addressId,
            shipType: shipForm.shipType // 传递中文值，如"顺丰"，与后端枚举匹配
        };

        const res = await shipOrder(shipDTO);
        if (res.code === 1) {
            ElMessage.success('发货成功');
            isShipModalOpen.value = false;
            fetchOrders(); // 刷新订单列表
        } else {
            ElMessage.error(res.msg || '发货失败');
        }
    } catch (err) {
        console.error('发货失败：', err);
        ElMessage.error('网络错误，发货失败');
    }
};

// 同意售后申请（修改：打开发送审核说明的弹窗）
const handleApproveAudit = (order) => {
    // 初始化同意表单
    approveForm.orderId = order.id;
    approveForm.auditId = order.audit.auditId;
    approveForm.auditReason = ''; // 默认空值
    isApproveModalOpen.value = true;
};

// 新增：提交同意售后表单
const submitApproveForm = async () => {
    try {
        // 校验表单（审核说明可选，仅校验长度）
        await approveFormRef.value.validate();

        // 构造同意DTO（auditReason可选，空值也会传递）
        const approveAuditDTO = {
            orderId: approveForm.orderId,
            userId: userInfo.value?.id || null,
            merchantId: orders.value.find(o => o.id === approveForm.orderId)?.merchantId || null,
            auditId: approveForm.auditId,
            auditReason: approveForm.auditReason || '' // 空值处理为字符串，避免后端接收异常
        };

        const res = await approveAuditApi(approveAuditDTO);
        if (res.code === 1) {
            ElMessage.success('同意售后申请成功');
            isApproveModalOpen.value = false;
            fetchOrders(); // 刷新列表
        } else {
            ElMessage.error(res.msg || '同意失败');
        }
    } catch (err) {
        console.error('同意售后失败：', err);
        ElMessage.error('网络错误，同意失败');
    }
};

// 拒绝售后申请（打开发弹窗）
const handleRejectAudit = (order) => {
    // 初始化拒绝表单
    rejectForm.orderId = order.id;
    rejectForm.auditId = order.audit.auditId;
    rejectForm.auditReason = '';
    isRejectModalOpen.value = true;
};

// 提交拒绝售后表单
const submitRejectForm = async () => {
    try {
        await rejectFormRef.value.validate();

        // 构造拒绝DTO
        const rejectAuditDTO = {
            orderId: rejectForm.orderId,
            userId: userInfo.value.id, // 订单数据中无userId，暂传null
            merchantId: orders.value.find(o => o.id === rejectForm.orderId)?.merchantId || null,
            auditId: rejectForm.auditId,
            auditReason: rejectForm.auditReason
        };

        const res = await rejectAuditApi(rejectAuditDTO);
        if (res.code === 1) {
            ElMessage.success('拒绝售后申请成功');
            isRejectModalOpen.value = false;
            fetchOrders(); // 刷新列表
        } else {
            ElMessage.error(res.msg || '拒绝失败');
        }
    } catch (err) {
        console.error('拒绝售后失败：', err);
        ElMessage.error('网络错误，拒绝失败');
    }
};

// 同意申请点击（添加防误触确认）- 原有方法保留，不修改
const handleAgreeClick = (orderId) => {
    ElMessageBox.confirm(
        '确定要同意该订单的申请吗？',
        '确认同意',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info'
        }
    ).then(() => {
        ElMessage.success('已同意申请');
        // 后续可添加审核同意接口调用逻辑
    }).catch(() => {
        ElMessage.info('已取消同意操作');
    });
};

// 拒绝申请点击（添加防误触确认）- 原有方法保留，不修改
const handleRefuseClick = (orderId) => {
    ElMessageBox.confirm(
        '确定要拒绝该订单的申请吗？',
        '确认拒绝',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(() => {
        ElMessage.success('已拒绝申请');
        // 后续可添加审核拒绝接口调用逻辑
    }).catch(() => {
        ElMessage.info('已取消拒绝操作');
    });
};

// 状态显示映射
const getDisplayStatus = (status) => {
    const statusMap = {
        '已支付': '待发货',
        '已发货': '已发货',
        '已送达': '已完成',
        '已取消': '已取消'
    };
    return statusMap[status] || status;
};

// 状态样式映射
const getStatusClass = (status, paymentStatus) => {
    if (status === '已取消' && paymentStatus === '已退款') {
        return 'status-refunded';
    }
    const classMap = {
        '已支付': 'status-pending', // 待发货
        '已发货': 'status-shipped',
        '已送达': 'status-delivered', // 已完成
        '审核中': 'status-review',
        '已取消': 'status-cancelled'
    };
    return classMap[status] || '';
};

// 售后审核状态样式映射
const getAuditStatusClass = (auditStatus) => {
    const classMap = {
        '待审核': 'status-pending-audit',
        '已批准': 'status-approved-audit',
        '已拒绝': 'status-rejected-audit'
    };
    return classMap[auditStatus] || '';
};

// 初始化加载
onMounted(() => {
    fetchOrders();
    fetchAddressList(); // 初始化获取地址列表
    fetchUserInfo();
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

/* 状态筛选栏 - 升级渐变和阴影 */
.status-filter {
    background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
    padding: 20px;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(24, 144, 255, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
    margin-bottom: 28px;
    border: 1px solid rgba(24, 144, 255, 0.05);
    transition: all 0.3s ease;
}

.status-filter:hover {
    box-shadow: 0 6px 20px rgba(24, 144, 255, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
}

.status-radio {
    margin: 0 8px;
    transition: all 0.2s ease;
}

.el-radio-button__inner {
    border-radius: 20px !important;
    padding: 0 16px;
}

.el-radio-group--small .el-radio-button__inner {
    height: 32px;
    line-height: 32px;
    font-size: 14px;
}

/* 加载状态：自定义 spinner 替代 ElLoadingSpinner */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
    color: #666;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(24, 144, 255, 0.1);
    border-left-color: #1890ff;
    border-radius: 50%;
    animation: spin 1.5s linear infinite;
    margin-bottom: 16px;
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

/* 订单头部 - 新增顾客信息样式 */
.order-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f2f5;
}

.customer-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.customer-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #f0f8fb;
}

.customer-nickname {
    font-size: 16px;
    color: #1d2129;
    font-weight: 500;
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
    background: linear-gradient(135deg, #fffbf0 0%, #fff9e6 50%, #fff4d9 100%);
    border-left: 4px solid #faad14;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(250, 173, 20, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.8);
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
    box-shadow: 0 6px 18px rgba(250, 173, 20, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.8);
    transform: translateX(4px) scale(1.01);
    border-left-width: 6px;
}

.remark-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    background: linear-gradient(135deg, #faad14 0%, #f5a600 100%);
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    border-radius: 16px;
    margin-bottom: 10px;
    box-shadow: 0 3px 8px rgba(250, 173, 20, 0.4), inset 0 -1px 2px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.remark-tag:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(250, 173, 20, 0.5), inset 0 -1px 2px rgba(0, 0, 0, 0.1);
}

.remark-tag i {
    font-size: 14px;
}

.remark-content-box {
    background-color: rgba(255, 255, 255, 0.6);
    padding: 10px 12px;
    border-radius: 6px;
    border: 1px solid rgba(250, 173, 20, 0.2);
}

.remark-text {
    margin: 0;
    color: #5c4d2e;
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
.order-payment-status,
.order-refund-reason {
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
.order-payment-status i,
.order-refund-reason i {
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

/* 地址区域：修正发货/收货地址语义 */
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

/* 发货地址（商家）样式 */
.shipping-card {
    background-color: #e8f4f8;
}

/* 收货地址（顾客）样式 */
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

/* 售后信息区域 */
.after-sales-info {
    margin-bottom: 24px;
    background-color: #fafafa;
    border-radius: 8px;
    padding: 20px;
}

.after-sales-section-title {
    font-size: 16px;
    color: #1d2129;
    font-weight: 500;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.after-sales-section-title i {
    color: #faad14;
}

.after-sales-details {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

.after-sales-row {
    display: flex;
    align-items: flex-start;
    width: calc(50% - 8px);
    font-size: 14px;
    line-height: 1.6;
}

.after-sales-label {
    width: 100px;
    color: #666;
    font-weight: 500;
    flex-shrink: 0;
}

.after-sales-value {
    color: #1d2129;
    flex: 1;
    word-break: break-all;
}

.after-sales-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 4px;
    margin-top: 4px;
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

.refuse-btn {
    color: #ff4d4f !important;
}

.refuse-btn:hover {
    color: #d9363e !important;
    background-color: rgba(255, 77, 79, 0.06) !important;
}

/* 状态标签样式 */
.status-pending {
    /* 待发货 */
    color: #faad14;
    background-color: rgba(250, 173, 20, 0.15);
}

.status-shipped {
    /* 已发货 */
    color: #52c41a;
    background-color: rgba(82, 196, 26, 0.15);
}

.status-delivered {
    /* 已完成 */
    color: #00b42a;
    background-color: rgba(0, 180, 42, 0.15);
}

.status-review {
    /* 待审核 */
    color: #722ed1;
    background-color: rgba(114, 46, 209, 0.15);
}

.status-cancelled {
    /* 已取消 */
    color: #999;
    background-color: rgba(153, 153, 153, 0.15);
}

.status-refunded {
    /* 已退款 */
    color: #ff4d4f;
    background-color: rgba(255, 77, 79, 0.15);
}

/* 售后审核状态样式 */
.status-pending-audit {
    /* 待审核售后 */
    color: #1890ff;
    background-color: rgba(24, 144, 255, 0.15);
}

.status-approved-audit {
    /* 已批准售后 */
    color: #52c41a;
    background-color: rgba(82, 196, 26, 0.15);
}

.status-rejected-audit {
    /* 已拒绝售后 */
    color: #ff4d4f;
    background-color: rgba(255, 77, 79, 0.15);
}

/* 发货弹窗样式 */
.el-dialog__header {
    border-bottom: 1px solid #f0f2f5;
}

.el-dialog__title {
    font-size: 18px;
    font-weight: 600;
    color: #1d2129;
}

.el-form-item {
    margin-bottom: 20px;
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

    .after-sales-row {
        width: 100%;
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

    .status-filter {
        padding: 12px;
        overflow-x: auto;
    }

    .status-radio {
        margin: 0 4px;
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
}

@media (max-width: 480px) {
    .order-card {
        padding: 16px;
    }

    .customer-info {
        margin-bottom: 8px;
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

    .el-dialog {
        width: 90% !important;
    }

    .after-sales-details {
        flex-direction: column;
        gap: 12px;
    }

    .after-sales-row {
        width: 100%;
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

</style>