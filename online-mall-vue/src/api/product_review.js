import request from "@/utils/request";

/**
 * 获取商品评论列表
 * @param {*} productId 商品ID
 * @returns 
 */
export const getProductReviewsApi = (productId) => request.get(`/reviews/product/${productId}`);

export const getMerchantReviewsApi = () => request.get("/reviews/merchant");

export const getUserReviewsApi = () => request.get("/reviews/user");

export const replyReviewApi = (merchantReplyDTO) => request.post(`/reviews/merchant/reply`, merchantReplyDTO);