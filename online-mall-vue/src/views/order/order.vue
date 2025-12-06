<template>
    <div class="order-detail-container">
        <!-- 加载状态 -->
        <div class="loading" v-if="isLoading">
            加载中...
        </div>

        <!-- 错误提示 -->
        <div class="error" v-if="isError">
            订单加载失败，请稍后重试
            <ElButton type="text" @click="fetchOrderDetail">刷新</ElButton>
        </div>

        <!-- 订单详情内容（严格适配新返回格式） -->
        <div class="order-content" v-if="orderItems.length > 0 && !isLoading && !isError">
            <!-- 订单编号、总金额、收货地址 -->
            <div class="order-header">
                <h2 class="order-title">订单详情</h2>
                <div class="order-number">订单编号：{{ orderNumber }}</div>
                <div class="order-total">实付款：<span class="total-price">¥{{ formatAmount(totalAmount) }}</span></div>

                <!-- 收货地址区域（所有订单状态均展示） -->
                <div class="receipt-address-section">
                    <h3 class="section-title">收货地址</h3>
                    <div v-if="isAddressLoading" class="address-loading">地址加载中...</div>
                    <div v-else-if="receiptAddress" class="address-card">
                        <div class="address-item"><span class="label">收货人：</span>{{ receiptAddress.recipient }}</div>
                        <div class="address-item"><span class="label">联系电话：</span>{{ receiptAddress.phone }}</div>
                        <div class="address-item">
                            <span class="label">地址：</span>
                            {{ receiptAddress.province }}{{ receiptAddress.city }}{{ receiptAddress.district }}{{
                                receiptAddress.detail }}
                        </div>
                        <div class="address-item"><span class="label">邮政编码：</span>{{ receiptAddress.postalCode || '无' }}
                        </div>
                    </div>
                    <div v-else class="address-error">
                        收货地址获取失败
                        <ElButton type="text" size="small" @click="fetchReceiptAddress">重试</ElButton>
                    </div>
                </div>
            </div>

            <!-- 商品清单（保持原有逻辑） -->
            <div class="product-list-section">
                <h3 class="section-title">商品清单</h3>
                <div class="product-table">
                    <div class="table-header">
                        <div class="table-col">商品图片</div>
                        <div class="table-col">商品信息</div>
                        <div class="table-col">单价</div>
                        <div class="table-col">数量</div>
                        <div class="table-col">小计</div>
                    </div>
                    <div class="table-body">
                        <div class="table-row" v-for="item in orderItems" :key="item.id">
                            <div class="table-col">
                                <img :src="item.imageUrl" alt="商品图片" class="product-thumb">
                            </div>
                            <div class="table-col">
                                <div class="product-name">{{ item.productName }}</div>
                                <div class="merchant-id">商家ID：{{ item.merchantId }}</div>
                            </div>
                            <div class="table-col">¥{{ formatAmount(item.productPrice) }}</div>
                            <div class="table-col">{{ item.quantity }}</div>
                            <div class="table-col">¥{{ formatAmount(item.subtotal) }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 支付区域（保持原有修复逻辑） -->
            <div class="payment-section">
                <h3 class="section-title">支付信息</h3>
                <div class="payment-methods">
                    <div class="payment-method" v-for="method in paymentMethods" :key="method.value"
                        :class="{ active: selectedPaymentMethod === method.value }"
                        @click="selectedPaymentMethod = method.value">
                        <span>{{ method.label }}</span>
                    </div>
                </div>

                <div class="payment-actions">
                    <ElButton type="default" @click="goBack">取消支付</ElButton>
                    <ElButton type="primary" @click="showPayConfirm" :loading="isPaying"
                        :disabled="selectedPaymentMethod === undefined || !isValidAmount(totalAmount)">
                        立即支付 ¥{{ formatAmount(totalAmount) }}
                    </ElButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElButton, ElMessage, ElMessageBox } from 'element-plus';
import { getOrderItemsByOrderId } from '@/api/order';
import { payOrder } from '@/api/pay';
import { getAddressByI as getAddressById } from '@/api/address'; 

const route = useRoute();
const router = useRouter();

// 原有状态保持不变
const orderId = ref('');
const orderItems = ref([]);
const orderNumber = ref('');
const totalAmount = ref(0);
const isLoading = ref(true);
const isError = ref(false);
const isPaying = ref(false);
const selectedPaymentMethod = ref(undefined);
const paymentMethods = ref([
    { value: 0, label: '支付宝支付' },
    { value: 1, label: '微信支付' }
]);

// 新增：收货地址相关状态
const receiptAddress = ref(null); // 存储收货地址详情
const isAddressLoading = ref(false); // 地址加载状态

// 格式化金额（原有逻辑不变）
const formatAmount = (amount) => {
    const num = Number(amount);
    return isNaN(num) ? '0.00' : num.toFixed(2);
};

// 验证金额（原有逻辑不变）
const isValidAmount = (amount) => {
    const num = Number(amount);
    return !isNaN(num) && num > 0;
};

// 新增：获取收货地址
const fetchReceiptAddress = async (addressId) => {
    if (!addressId) return;
    isAddressLoading.value = true;
    try {
        const res = await getAddressById(addressId);
        if (res.code === 1 && res.data) {
            receiptAddress.value = res.data; // 存储地址数据（匹配接口返回格式）
        } else {
            receiptAddress.value = null;
            ElMessage.warning('收货地址获取失败');
        }
    } catch (err) {
        console.error('获取收货地址异常：', err);
        receiptAddress.value = null;
        ElMessage.error('网络错误，地址加载失败');
    } finally {
        isAddressLoading.value = false;
    }
};

// 获取订单详情（原有逻辑修改：新增地址获取）
const fetchOrderDetail = async () => {
    try {
        isLoading.value = true;
        const res = await getOrderItemsByOrderId(orderId.value);

        if (res.code === 1 && res.data?.code === 1) {
            orderItems.value = res.data.data || [];
            if (orderItems.value.length > 0) {
                orderNumber.value = orderItems.value[0].orderNumber || '未知订单号';
                // 计算总金额
                totalAmount.value = orderItems.value.reduce((sum, item) => {
                    const subtotal = Number(item.subtotal) || 0;
                    return sum + subtotal;
                }, 0);
                // 新增：获取收货地址（从第一个商品项中取shippingAddressId）
                const shippingAddressId = orderItems.value[0].shippingAddressId;
                if (shippingAddressId) {
                    await fetchReceiptAddress(shippingAddressId);
                } else {
                    receiptAddress.value = null;
                    ElMessage.warning('该订单未关联收货地址');
                }
            } else {
                totalAmount.value = 0;
                receiptAddress.value = null;
            }
        } else {
            isError.value = true;
            ElMessage.error(res.data?.msg || res.msg || '订单详情获取失败');
            totalAmount.value = 0;
            receiptAddress.value = null;
        }
    } catch (err) {
        console.error('获取订单详情失败：', err);
        isError.value = true;
        ElMessage.error('网络错误，订单详情获取失败');
        totalAmount.value = 0;
        receiptAddress.value = null;
    } finally {
        isLoading.value = false;
    }
};

// 显示支付确认（原有逻辑不变）
const showPayConfirm = () => {
    if (!isValidAmount(totalAmount.value)) {
        ElMessage.warning('支付金额无效，请刷新页面重试');
        return;
    }
    const selectedMethod = paymentMethods.value.find(m => m.value === selectedPaymentMethod.value)?.label || '选中的支付方式';
    const amountText = formatAmount(totalAmount.value);
    ElMessageBox.confirm(
        `确认使用${selectedMethod}支付 ¥${amountText}吗？`,
        '支付确认',
        { confirmButtonText: '确认支付', cancelButtonText: '取消', type: 'info' }
    ).then(() => {
        submitPayment();
    }).catch(() => {
        ElMessage.info('已取消支付');
    });
};

// 提交支付（原有逻辑不变）
const submitPayment = async () => {
    isPaying.value = true;
    try {
        const payDTO = {
            paymentMethod: selectedPaymentMethod.value,
            orderId: orderId.value,
            amount: Number(totalAmount.value) || 0
        };
        const res = await payOrder(payDTO);
        if (res.code === 1) {
            ElMessage.success('支付成功！');
            setTimeout(() => router.back(), 1000);
        } else {
            ElMessage.error(res.msg || '支付请求失败');
        }
    } catch (err) {
        console.error('支付失败：', err);
        ElMessage.error('网络错误，支付失败');
    } finally {
        isPaying.value = false;
    }
};

// 取消支付（原有逻辑不变）
const goBack = () => {
    router.back();
};

// 初始化（原有逻辑不变）
onMounted(() => {
    orderId.value = route.params.orderId || '';
    fetchOrderDetail();
});
</script>

<style scoped>
/* 原有样式保持不变，新增以下样式 */
.receipt-address-section {
    margin-top: 15px;
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 8px;
}

.address-card {
    margin-top: 10px;
    padding: 15px;
    background-color: #fff;
    border: 1px solid #eee;
    border-radius: 6px;
}

.address-item {
    margin-bottom: 8px;
    font-size: 14px;
    color: #333;
}

.address-item:last-child {
    margin-bottom: 0;
}

.label {
    display: inline-block;
    width: 60px;
    color: #666;
    font-weight: 500;
}

.address-loading,
.address-error {
    margin-top: 10px;
    padding: 15px;
    text-align: center;
    color: #666;
    font-size: 14px;
}

/* 原有样式保持不变 */
.order-detail-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.loading,
.error {
    text-align: center;
    padding: 50px;
    font-size: 18px;
    color: #666;
}

.order-header {
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
}

.order-title {
    font-size: 24px;
    color: #333;
    margin-bottom: 10px;
}

.order-number,
.order-total {
    font-size: 16px;
    color: #666;
    margin-bottom: 5px;
}

.total-price {
    color: #ff4d4f;
    font-weight: bold;
    font-size: 18px;
}

.section-title {
    font-size: 18px;
    font-weight: bold;
    margin: 20px 0 15px;
    color: #333;
}

.product-table {
    width: 100%;
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
}

.table-header {
    display: flex;
    background-color: #f9f9f9;
    border-bottom: 1px solid #eee;
}

.table-col {
    padding: 15px;
    text-align: center;
    font-weight: bold;
    color: #333;
}

.table-col:nth-child(1) {
    width: 100px;
}

.table-col:nth-child(2) {
    flex: 1;
    text-align: left;
}

.table-col:nth-child(3),
.table-col:nth-child(4),
.table-col:nth-child(5) {
    width: 120px;
}

.table-body .table-row {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #eee;
}

.table-body .table-row:last-child {
    border-bottom: none;
}

.product-thumb {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
}

.product-name {
    color: #333;
    margin-bottom: 8px;
}

.merchant-id {
    font-size: 14px;
    color: #999;
}

.payment-methods {
    display: flex;
    gap: 20px;
    margin: 20px 0;
}

.payment-method {
    padding: 10px 20px;
    border: 1px solid #eee;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.payment-method.active {
    border-color: #1890ff;
    background-color: rgba(24, 144, 255, 0.05);
}

.payment-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 30px;
}
</style>