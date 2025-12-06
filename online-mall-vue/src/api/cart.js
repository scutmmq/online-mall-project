import request from "@/utils/request";
import { ssrContextKey } from "vue";

// 查询用户的购物车items
export const getCartsApi = () => request.get('/cart');

// 更改数量
export const updateCartItemApi = (body)=>request.put('/cart/items',body)

export const deleteCartItemByIdApi = (cartItemId) => request.delete(`/cart/items/${cartItemId}`);

export const deleteCartItemsApi = (cartItemIds) => request.delete('/cart/items', {
    params: {
        cartItemIds:cartItemIds
    }
})

export const addCartItemApi = (cartForm) => request.post('/cart/items', cartForm);

export const deleteCartApi = (cartId) => request.delete(`/cart/${cartId}`);