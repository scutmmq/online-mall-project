import request from "@/utils/request";

export const getAuditsApi = (auditStatus) => request.get("/audit", {
    params: {
        auditStatus:auditStatus
    }
})

export const getMerchantAuditApi = (auditStatus) => request.get("/audit/merchant", {
    params: {
        auditStatus:auditStatus
    }
})

