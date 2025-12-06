import request from "@/utils/request";

export const getMerchantOfMe = () => request.get('/merchant');

export const registerMerchant = (merchantForm) => request.post('/merchant/register', merchantForm);

export const updateMerchant = (merchantForm)=>request.put('/merchant',merchantForm)

export const modifyStockApi = (inventoryDTO) => request.post('/merchant/inventory', inventoryDTO);

export const getInventoryLogApi = (myParam) => request.get('/merchant/inventory-logs', {
    params:myParam
})