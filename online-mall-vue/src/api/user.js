import request from "@/utils/request";

export const getUserApi = () => request.get("/user")

export const logoutApi = () => request.post("/user/logout")

export const updateUserApi = (dataForm) => request.put("/user", dataForm)

export const modifyPasswordApi = (passworForm) => request.put("/user/password",passworForm)