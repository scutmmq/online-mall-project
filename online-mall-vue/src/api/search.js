import request from "@/utils/request";

// Long categoryId, Long merchantId, String keyword, Integer minPrice, Integer maxPrice, Integer isActive, Integer page, Integer pageSize
export const searchProductApi = (page, pageSize, searchForm) => request.get("/products",
    {
        params: {
            page: page,
            pageSize: pageSize,
            keyword:searchForm.keyword
        }
    }
)