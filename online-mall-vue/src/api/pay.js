import request from "@/utils/request";

export const payOrder = (payDTO) => request.post('/pay/confirm', payDTO);