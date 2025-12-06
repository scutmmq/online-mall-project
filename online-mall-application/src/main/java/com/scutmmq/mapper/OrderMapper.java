package com.scutmmq.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.scutmmq.entity.Orders;
import com.scutmmq.vo.MerchantOrdersVO;
import com.scutmmq.vo.UserOrdersVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface OrderMapper extends BaseMapper<Orders> {
    List<UserOrdersVO> getUserOrders(String status, Long userId);

    List<MerchantOrdersVO> getMerchantOrders(String status, Long merchantId);
}
