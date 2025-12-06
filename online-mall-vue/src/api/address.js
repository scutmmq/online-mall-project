import request from "@/utils/request";

// 1. 获取地址列表
export const getAddressApi = () => request.get('/user/address');

// 2. 新增地址
export const addAddressApi = (addressForm) => 
  request.post('/user/address', addressForm);

// 3. 更新地址
export const updateAddressApi = (addressForm) => 
  request.put('/user/address', addressForm);

// 4. 删除单个地址（修正：接收id参数并拼接到URL）
export const deleteAddressApi = (id) => 
  request.delete(`/user/address/${id}`); // 使用模板字符串拼接id

// 5. 批量删除地址（正确）
export const deleteAddressesApi = (ids) => 
  request.delete('/user/address', {
    params: { ids: ids } // 传递ids参数（如 "1,2,3"）
  });

// 6. 设置默认地址（修正：接收addressId参数并替换路径变量）
export const defaultAddressApi = (addressId) => 
  request.put(`/user/address/${addressId}/default`); // 使用模板字符串

export const getAddressByI = (addressId) => request.get(`/user/address/${addressId}`);