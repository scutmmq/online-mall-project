import request from "@/utils/request";

export const registApi =(submitData)=> request.post("/user/register",submitData)