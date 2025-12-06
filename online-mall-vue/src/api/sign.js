import request from "@/utils/request";

// 签到
export const signInApi = () => request.put("/user/sign")

// 获取签到详情（默认当前月）
export const getSignDetailsApi = () => request.get("/user/sign/details")

// 获取指定年月的签到详情
export const getSignDetailsByMonthApi = (year, month) => request.get(`/user/sign/details?year=${year}&month=${month}`)
