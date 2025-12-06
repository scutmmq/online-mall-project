import request from "@/utils/request";

export const getCategoriesApi = (categoryParam) => request.get('/categories', {
    params:categoryParam
})

export const getCategoryByIdApi = (categoryId) => request.get(`/categories/${categoryId}`);