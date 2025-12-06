import request from "@/utils/request";


export const loginApi = (loginForm) => request.post('/user/login', loginForm)