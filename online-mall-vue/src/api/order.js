import request from "@/utils/request";

export const addOrder = (orderDTO) => request.post('/orders', orderDTO);

export const getOrderItemsByOrderId = (orderId)=>request.get(`/orders/${orderId}`)

export const cancelOrder = (returnApplyDTO) => request.post('/orders/cancel',returnApplyDTO);

export const getUserOrders = (param) => request.get('/orders', {
    params:param
})

export const confirmOrderApi = (orderId) => request.put(`/orders/${orderId}/confirm`);

export const shipOrder = (shipDTO) => request.post('/orders/ship', shipDTO);

export const getMerchantOrders = (param) => request.get('/orders/merchant', {
    params:param
});

export const approveAuditApi = (approveAuditDTO) => request.post("/orders/approve", approveAuditDTO);

export const rejectAuditApi = (rejectAuditDTO)=>request.post("/orders/reject",rejectAuditDTO)

// 添加评价API
export const addReviewApi = (reviewDTO) => request.post('/reviews', reviewDTO);