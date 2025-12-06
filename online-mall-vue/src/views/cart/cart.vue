<template>
    <div class="cart-page">
        <el-page-header @back="handleBack" content="我的购物车"></el-page-header>

        <!-- 加载状态 -->
        <el-skeleton :loading="isLoading" row="6" :loading-effect="'shine'" class="loading-container">
            <template #default>
                <!-- 按商家分组展示 -->
                <div v-for="merchant in cartData.list" :key="merchant.merchantId" class="merchant-group">
                    <!-- 商家标题栏 -->
                    <div class="merchant-header">
                        <el-checkbox v-model="merchant.checkAll" @change="handleMerchantCheckAll(merchant)"
                            class="merchant-checkbox" :indeterminate="merchant.isIndeterminate"></el-checkbox>
                        <span class="merchant-name">{{ merchant.merchantName }}</span>
                    </div>

                    <!-- 商家商品列表 -->
                    <el-table :data="merchant.productList" border style="width: 100%; margin-bottom: 20px;"
                        :header-cell-style="{ 'background-color': '#f5f5f5' }"
                        @select="(selection, row) => handleProductSelect(selection, row, merchant)"
                        @select-all="(selection) => handleProductSelectAll(selection, merchant)"
                        :ref="(el) => merchant.tableRef = el">
                        <!-- 复选框列 -->
                        <el-table-column type="selection" width="55"
                            :selectable="(row) => row.quantity >= 1"></el-table-column>

                        <!-- 商品信息列 -->
                        <el-table-column label="商品信息" width="400">
                            <template #default="scope">
                                <div class="product-info" @click="toDetail(scope.row.productId)">
                                    <el-image :src="scope.row.imageUrl" :alt="scope.row.name" class="product-img"
                                        fit="cover"></el-image>
                                    <span class="product-name">{{ scope.row.name }}</span>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 单价列 -->
                        <el-table-column label="单价" align="center">
                            <template #default="scope">
                                <span>¥{{ scope.row.price.toFixed(2) }}</span>
                            </template>
                        </el-table-column>

                        <!-- 数量列 -->
                        <el-table-column label="数量" align="center">
                            <template #default="scope">
                                <el-input-number v-model="scope.row.quantity" :min="1" :step="1"
                                    @change="handleQuantityChange(scope.row, merchant)" size="small"></el-input-number>
                            </template>
                        </el-table-column>

                        <!-- 小计列 -->
                        <el-table-column label="小计" align="center">
                            <template #default="scope">
                                <span class="subtotal">¥{{ scope.row.subtotal.toFixed(2) }}</span>
                            </template>
                        </el-table-column>

                        <!-- 操作列 -->
                        <el-table-column label="操作" align="center">
                            <template #default="scope">
                                <el-button type="text" text-color="#ff4d4f"
                                    @click="handleRemove(scope.row.cartItemsId, merchant)">
                                    删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>

                <!-- 批量删除按钮 -->
                <div v-if="selectedRowCount > 0" class="batch-operation">
                    <el-button type="danger" @click="handleBatchDelete" :loading="batchDeleteLoading">
                        批量删除 ({{ selectedRowCount }})
                    </el-button>
                </div>

                <!-- 空购物车状态 -->
                <div v-if="isEmptyCart" class="empty-cart">
                    <el-empty description="购物车还是空的~">
                        <el-button type="primary" @click="toHome">去逛逛</el-button>
                    </el-empty>
                </div>

                <!-- 结算区域 -->
                <div v-if="!isEmptyCart" class="cart-footer">
                    <div class="total-info">
                        <span class="selected-count">已选 {{ selectedRowCount }} 件商品</span>
                        <span class="total-label">合计：</span>
                        <span class="total-price">¥{{ cartData.totalPrice.toFixed(2) }}</span>
                        <span class="total-desc">（已包含税费）</span>
                    </div>
                    <div class="operate-buttons">
                        <el-button type="default" @click="handleClearAll" :disabled="isEmptyCart">
                            清空购物车
                        </el-button>
                        <el-button type="primary" size="large" @click="toCheckout" :disabled="selectedRowCount === 0"
                            :loading="checkoutLoading">
                            去结算
                        </el-button>
                    </div>
                </div>
            </template>
        </el-skeleton>

        <!-- 结算弹窗：地址选择+备注输入 -->
        <el-dialog title="提交订单" v-model="checkoutDialogVisible" width="600px" :close-on-click-modal="false" center draggable>
            <div class="checkout-content">
                <!-- 地址选择区域 -->
                <div class="address-section">
                    <h4 class="section-title">选择收货地址</h4>
                    <div class="address-list">
                        <div v-for="addr in addressList" :key="addr.id" class="address-item"
                            :class="{ active: selectedAddressId === addr.id }" @click="selectedAddressId = addr.id">
                            <div class="addr-header">
                                <span class="addr-name">{{ addr.recipient }}</span>
                                <span class="addr-phone">{{ addr.phone }}</span>
                                <span v-if="addr.isDefault === 1" class="default-tag">默认地址</span>
                            </div>
                            <div class="addr-detail">
                                {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}
                            </div>
                        </div>
                        <div v-if="addressList.length === 0" class="no-address">
                            <el-empty description="暂无收货地址">
                                <el-button type="primary" @click="goToAddAddress">前往添加</el-button>
                            </el-empty>
                        </div>
                    </div>
                </div>

                <!-- 备注输入区域 -->
                <div class="remark-section">
                    <h4 class="section-title">订单备注</h4>
                    <el-input type="textarea" v-model="orderRemark" placeholder="请输入备注信息（如：无备注）" rows="3"
                        class="remark-input"></el-input>
                </div>
            </div>
            <template #footer>
                <el-button type="default" @click="checkoutDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitOrder" :loading="submitLoading">提交订单</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { addOrder } from '@/api/order';
import { getAddressApi } from '@/api/address';
import {
    ElEmpty,
    ElMessage,
    ElTableColumn,
    ElTable,
    ElCheckbox,
    ElButton,
    ElInputNumber,
    ElImage,
    ElMessageBox,
    ElDialog,
    ElInput
} from 'element-plus';
import { getCartsApi, updateCartItemApi, deleteCartItemByIdApi, deleteCartItemsApi } from '@/api/cart';

// 路由实例
const router = useRouter();

// 状态管理
const cartData = ref({ list: [], totalPrice: 0 });
const isLoading = ref(true);
const batchDeleteLoading = ref(false);
const checkoutLoading = ref(false); // 结算按钮加载态
const submitLoading = ref(false); // 提交订单加载态

// 结算相关状态
const checkoutDialogVisible = ref(false);
const addressList = ref([]);
const selectedAddressId = ref('');
const orderRemark = ref('没有备注'); // 默认备注

// 计算属性：获取所有选中的商品数量
const selectedRowCount = computed(() => {
    let count = 0;
    cartData.value.list.forEach(merchant => {
        if (merchant.productList) {
            merchant.productList.forEach(product => {
                if (product._isSelected) count++;
            });
        }
    });
    return count;
});

// 计算属性：判断购物车是否为空
const isEmptyCart = computed(() => {
    return cartData.value.list.every(merchant =>
        !merchant.productList || merchant.productList.length === 0
    );
});

// 页面加载时获取购物车数据
onMounted(async () => {
    await fetchCart();
});

// 获取购物车数据并初始化商家勾选状态
const fetchCart = async () => {
    try {
        isLoading.value = true;
        const res = await getCartsApi();
        console.log("购物车",res.data);
        if(res.data==null){
          ElMessage.info('购物车为空');
          return;
        }
        if (res.code === 1) {
            const formattedData = {
                ...res.data,
                list: res.data.list.map(merchant => ({
                    ...merchant,
                    checkAll: false,
                    isIndeterminate: false,
                    tableRef: null
                }))
            };
            cartData.value = formattedData;
            // 初始化小计
            cartData.value.list.forEach(merchant => {
                merchant.productList.forEach(product => {
                    product.subtotal = product.price * product.quantity;
                });
            });
            calculateTotalPrice();
        } else {
            ElMessage.error('获取购物车失败：' + res.msg);
        }
    } catch (err) {
        console.error('购物车请求异常：', err);
        ElMessage.error('获取购物车失败，请重试');
    } finally {
        isLoading.value = false;
    }
};

// 商家全选/取消全选
const handleMerchantCheckAll = (merchant) => {
    if (!merchant.productList || merchant.productList.length === 0) return;

    merchant.productList.forEach(product => {
        product._isSelected = merchant.checkAll;
    });

    const tableRef = merchant.tableRef;
    if (tableRef) {
        tableRef.clearSelection();
        if (merchant.checkAll) {
            merchant.productList.forEach(product => {
                tableRef.toggleRowSelection(product, true);
            });
        }
    }

    merchant.isIndeterminate = false;
    calculateTotalPrice();
};

// 单个商品选中状态变化
const handleProductSelect = (selection, row, merchant) => {
    row._isSelected = selection.includes(row);
    updateMerchantCheckStatus(merchant);
    calculateTotalPrice();
};

// 商品全选/取消全选
const handleProductSelectAll = (selection, merchant) => {
    if (!merchant.productList) return;

    merchant.productList.forEach(product => {
        product._isSelected = selection.includes(product);
    });

    updateMerchantCheckStatus(merchant);
    calculateTotalPrice();
};

// 更新商家的勾选状态
const updateMerchantCheckStatus = (merchant) => {
    if (!merchant.productList || merchant.productList.length === 0) {
        merchant.checkAll = false;
        merchant.isIndeterminate = false;
        return;
    }

    const selectedCount = merchant.productList.filter(p => p._isSelected).length;
    const totalCount = merchant.productList.length;

    merchant.checkAll = selectedCount === totalCount && totalCount > 0;
    merchant.isIndeterminate = selectedCount > 0 && selectedCount < totalCount;
};

// 数量变更处理
const handleQuantityChange = async (row, merchant) => {
    try {
        const result = await updateCartItemApi({
            cartItemsId: row.cartItemsId,
            quantity: row.quantity,
            productId: row.productId
        });
        if (result.code === 1) {
            row.subtotal = row.price * row.quantity;
            calculateTotalPrice();
            ElMessage.success("数量更新成功!");
        } else {
            ElMessage.error(result.msg);
            row.quantity = row.quantity > 1 ? row.quantity - 1 : 1;
        }
    } catch (err) {
        console.error('更新数量失败：', err);
        ElMessage.error('更新失败，请重试');
        row.quantity = row.quantity > 1 ? row.quantity - 1 : 1;
    }
};

// 计算购物车总价（仅计算勾选商品）
const calculateTotalPrice = () => {
    let total = 0;
    cartData.value.list.forEach(merchant => {
        if (merchant.productList) {
            merchant.productList.forEach(product => {
                if (product._isSelected) {
                    total += product.subtotal;
                }
            });
        }
    });
    cartData.value.totalPrice = total;
};

// 删除单个商品
const handleRemove = (cartItemsId, merchant) => {
    ElMessageBox.confirm(
        '确定要删除该商品吗？',
        '确认删除',
        { type: 'warning' }
    ).then(async () => {
        try {
            const res = await deleteCartItemByIdApi(cartItemsId);
            if (res.code === 1) {
                merchant.productList = merchant.productList.filter(
                    item => item.cartItemsId !== cartItemsId
                );
                calculateTotalPrice();
                updateMerchantCheckStatus(merchant);
                ElMessage.success(res.msg || '商品已删除');
            } else {
                ElMessage.error(res.msg || '删除失败');
            }
        } catch (err) {
            console.error('删除商品失败：', err);
            ElMessage.error('网络错误，请稍后重试');
        }
    }).catch(() => { });
};

// 批量删除选中商品
const handleBatchDelete = () => {
    if (selectedRowCount.value === 0) {
        ElMessage.warning('请选择要删除的商品');
        return;
    }

    const selectedIds = [];
    cartData.value.list.forEach(merchant => {
        merchant.productList?.forEach(product => {
            if (product._isSelected) selectedIds.push(product.cartItemsId);
        });
    });

    ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRowCount.value} 个商品吗？`,
        '批量删除确认',
        { type: 'warning' }
    ).then(async () => {
        try {
            batchDeleteLoading.value = true;
            const res = await deleteCartItemsApi(selectedIds);
            if (res.code === 1) {
                cartData.value.list.forEach(merchant => {
                    merchant.productList = merchant.productList.filter(
                        item => !selectedIds.includes(item.cartItemsId)
                    );
                    updateMerchantCheckStatus(merchant);
                });
                calculateTotalPrice();
                ElMessage.success(res.msg || `成功删除 ${selectedRowCount.value} 个商品`);
            } else {
                ElMessage.error(res.msg || '批量删除失败');
            }
        } catch (err) {
            console.error('批量删除失败：', err);
            ElMessage.error('网络错误，请稍后重试');
        } finally {
            batchDeleteLoading.value = false;
        }
    }).catch(() => { });
};

// 清空购物车
const handleClearAll = () => {
    ElMessageBox.confirm(
        '确定要清空所有商品吗？',
        '清空购物车',
        { type: 'warning' }
    ).then(async () => {
        try {
            cartData.value.list.forEach(merchant => {
                merchant.productList = [];
                merchant.checkAll = false;
                merchant.isIndeterminate = false;
            });
            cartData.value.totalPrice = 0;
            ElMessage.success('购物车已清空');
        } catch (err) {
            console.error('清空购物车失败：', err);
            ElMessage.error('清空失败，请重试');
        }
    }).catch(() => { });
};

// 导航相关
const handleBack = () => {
    router.back();
};

const toHome = () => {
    router.push('/');
};

const toDetail = (productId) => {
    router.push(`/product/${productId}`);
};

// 前往添加地址页面
const goToAddAddress = () => {
    checkoutDialogVisible.value = false;
    router.push('/user/address');
};

// 去结算：打开弹窗并加载地址
const toCheckout = async () => {
    if (selectedRowCount.value === 0) {
        ElMessage.warning('请选择要结算的商品');
        return;
    }

    try {
        checkoutLoading.value = true;
        // 加载收货地址列表
        const addrRes = await getAddressApi();
        if (addrRes.code === 1) {
            addressList.value = addrRes.data.rows;
            // 默认选中默认地址（isDefault=1）
            const defaultAddr = addrRes.data.rows.find(item => item.isDefault === 1);
            if (defaultAddr) selectedAddressId.value = defaultAddr.id;
            // 打开结算弹窗
            checkoutDialogVisible.value = true;
        } else {
            ElMessage.error('获取地址失败：' + addrRes.msg);
        }
    } catch (err) {
        console.error('获取地址异常：', err);
        ElMessage.error('获取收货地址失败，请重试');
    } finally {
        checkoutLoading.value = false;
    }
};

// 提交订单
const submitOrder = async () => {
    // 校验地址选择
    if (!selectedAddressId.value) {
        ElMessage.warning('请选择收货地址');
        return;
    }

    // 组装选中商品列表
    const productList = [];
    cartData.value.list.forEach(merchant => {
        merchant.productList?.forEach(product => {
            if (product._isSelected) {
                productList.push({
                    productId: product.productId,
                    quantity: product.quantity
                });
            }
        });
    });

    if (productList.length === 0) {
        ElMessage.warning('请选择要购买的商品');
        checkoutDialogVisible.value = false;
        return;
    }

    // 组装订单参数
    const orderParams = {
        shippingAddressId: selectedAddressId.value,
        list: productList,
        remark: orderRemark.value || '没有备注' // 确保备注有默认值
    };

    try {
        submitLoading.value = true;
        // 调用创建订单接口
        const orderRes = await addOrder(orderParams);

        if (orderRes.code === 1) {
            const orderId = orderRes.data.orderId; // 假设接口返回orderId
            ElMessage.success('订单创建成功！');
            checkoutDialogVisible.value = false;
            
            // 创建订单后清空购物车中已购买的商品
            const purchasedCartIds = [];
            cartData.value.list.forEach(merchant => {
                merchant.productList.forEach(product => {
                    if (product._isSelected) {
                        purchasedCartIds.push(product.cartItemsId);
                    }
                });
            });
            
            // 调用API删除已购买的商品
            if (purchasedCartIds.length > 0) {
                try {
                    await deleteCartItemsApi(purchasedCartIds);
                } catch (err) {
                    console.error('删除购物车商品失败:', err);
                    ElMessage.error('购物车同步失败，请手动清理');
                }
            }
            
            // 过滤已购买商品
            cartData.value.list.forEach(merchant => {
                merchant.productList = merchant.productList.filter(
                    product => !product._isSelected
                );
                // 重置商家勾选状态
                merchant.checkAll = false;
                merchant.isIndeterminate = false;
            });
            // 重新计算总价
            calculateTotalPrice();
            
            // 跳转至订单详情页
            router.push(`/order/${orderId}`);
        } else {
            ElMessage.error('订单创建失败：' + orderRes.msg);
        }
    } catch (err) {
        console.error('创建订单异常：', err);
        ElMessage.error('创建订单失败，请重试');
    } finally {
        submitLoading.value = false;
    }
};
</script>

<style scoped>
/* 基础样式 */
.cart-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.loading-container {
    margin-top: 20px;
}

/* 商家分组样式 */
.merchant-group {
    margin-bottom: 30px;
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
}

.merchant-header {
    padding: 12px 20px;
    background-color: #f9f9f9;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
}

.merchant-checkbox {
    margin-right: 10px;
}

.merchant-name {
    font-weight: 500;
    color: #333;
}

/* 商品信息样式 */
.product-info {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.product-img {
    width: 80px;
    height: 80px;
    margin-right: 15px;
    border-radius: 4px;
}

.product-name {
    color: #333;
    line-height: 1.5;
    max-width: 280px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.subtotal {
    color: #ff4d4f;
    font-weight: 500;
}

/* 空购物车样式 */
.empty-cart {
    margin: 50px 0;
}

/* 批量删除按钮 */
.batch-operation {
    margin: 10px 0;
    text-align: left;
}

/* 结算区域样式 */
.cart-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding: 15px 20px;
    background-color: #f5f5f5;
    border-radius: 4px;
}

.total-info {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}

.selected-count {
    margin-right: 20px;
    color: #666;
}

.total-label {
    font-size: 16px;
    color: #666;
    margin-right: 10px;
}

.total-price {
    font-size: 22px;
    color: #ff4d4f;
    font-weight: 600;
    margin-right: 10px;
}

.total-desc {
    font-size: 14px;
    color: #999;
}

.operate-buttons {
    display: flex;
    gap: 15px;
}

.operate-buttons .el-button--primary {
    width: 140px;
}

/* 表格样式调整 */
:deep(.el-table__column--selection .el-checkbox) {
    display: flex;
    justify-content: center;
}

/* 结算弹窗样式 */
.checkout-content {
    padding: 10px 0;
}

.section-title {
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 12px;
    color: #333;
}

.address-list {
    margin-bottom: 25px;
}

.address-item {
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 6px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.3s;
}

.address-item.active {
    border-color: #1989fa;
    background-color: #f0f7ff;
}

.addr-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.addr-name {
    font-weight: 500;
    margin-right: 15px;
    color: #333;
}

.addr-phone {
    color: #666;
    margin-right: 10px;
}

.default-tag {
    font-size: 12px;
    color: #1989fa;
    background-color: #e6f4ff;
    padding: 2px 6px;
    border-radius: 3px;
}

.addr-detail {
    color: #666;
    line-height: 1.4;
}

.no-address {
    text-align: center;
    padding: 20px;
    color: #999;
    border: 1px dashed #eee;
    border-radius: 6px;
}

.remark-input {
    width: 100%;
}

/* 响应式样式 */
@media (max-width: 768px) {
    .product-info {
        flex-direction: column;
        align-items: flex-start;
    }

    .product-img {
        margin-bottom: 10px;
    }

    .cart-footer {
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
    }

    .operate-buttons {
        width: 100%;
        flex-direction: column;
    }

    .operate-buttons .el-button {
        width: 100% !important;
    }

    .batch-operation {
        text-align: center;
    }

    .selected-count {
        margin-bottom: 10px;
        display: block;
    }
}
</style>