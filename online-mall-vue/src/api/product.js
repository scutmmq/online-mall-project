import request from "@/utils/request";

export const getProductsApi = (productsParam) => request.get('/products', {
    params:productsParam
}) 

export const getProductDetailApi = (productId) =>request.get(`/products/${productId}`)

export const likeProductApi = (productId) => request.put(`/products/like/${productId}`)

export const getLikedProducts = () => request.get('/products/likes');

export const getProductsOfMeApi = () => request.get('/products/of/me')

export const addProductApi = (productForm) => request.post('/products', productForm)

export const updateProductApi = (productForm)=>request.put('/products',productForm)