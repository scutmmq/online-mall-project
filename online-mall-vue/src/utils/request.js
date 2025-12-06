import router from "@/router/router";
import axios from "axios";
import { ElMessage } from "element-plus";

const request = axios.create({
    baseURL: "/api",
    timeout:60000,
})

request.interceptors.request.use((req) => {
    const params = new URLSearchParams(req.params).toString();
    console.log('请求拦截器:' + params!==null&&params!==undefined&&params!=''?req.url+'?'+params:req.url )
    // 获取userData
    const token  = localStorage.getItem("token")
    if (token != null) {
        console.log("获取本地token: ",token)
        console.log("添加token请求头")
        req.headers['Authorization'] = token
    }
    return req;
}, err => {
    return Promise.reject(err);
})

request.interceptors.response.use((res) => {
    console.log("响应拦截器:" , res.data);

    //前端响应未发送token时不需要获取并更新token
    if (res.headers['authorization'] !== undefined && res.headers['authorization']!=null) {
      console.log('刷新token,获取返回的token', res.headers['authorization'])
      let token = res.headers['authorization']
      //更新token
      localStorage.setItem('token',token )
    }

    return res.data
}, (err) => {
    if (err.status == 401) {
        ElMessage({
            message: "未登录,请先登录！",
            type:"error"
        })
        router.push("/login")
    }
    return Promise.reject(err);
})

export default request;