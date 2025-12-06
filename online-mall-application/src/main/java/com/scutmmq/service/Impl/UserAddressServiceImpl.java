package com.scutmmq.service.Impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.scutmmq.entity.PageResult;
import com.scutmmq.entity.Result;
import com.scutmmq.entity.User;
import com.scutmmq.entity.UserAddress;
import com.scutmmq.mapper.UserAddressMapper;
import com.scutmmq.service.UserAddressService;
import com.scutmmq.utils.UserHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class UserAddressServiceImpl extends ServiceImpl<UserAddressMapper, UserAddress>  implements UserAddressService {

    private final UserAddressMapper userAddressMapper;

    @Override
    public Result getAddress() {

        PageHelper.startPage(1,10);

        Long id = UserHolder.getUser().getId();

        List<UserAddress> userAddressList = userAddressMapper.getAddress(id);

        Page<UserAddress> page = (Page<UserAddress>) userAddressList;

        PageResult<UserAddress> pageResult = new PageResult<>(page.getTotal(),page.getResult());

        return Result.success(pageResult);
    }

    @Override
    public Result addAddress(UserAddress address) {

        Long id = UserHolder.getUser().getId();
        address.setUserId(id);
        LocalDateTime now = LocalDateTime.now();
        address.setCreatedTime(now);
        address.setUpdatedTime(now);
        if(address.getIsDefault()==1){
            // 将其它默认的设置为0
            lambdaUpdate().set(UserAddress::getIsDefault,0).eq(UserAddress::getIsDefault,1).update();
        }
        save(address);
        return Result.success();
    }

    @Override
    public Result updateAddress(UserAddress address) {
        final boolean update = lambdaUpdate()
                .set(UserAddress::getPhone, address.getPhone())
                .set(UserAddress::getProvince, address.getProvince())
                .set(UserAddress::getCity, address.getCity())
                .set(UserAddress::getDistrict, address.getDistrict())
                .set(UserAddress::getDetail, address.getDetail())
                .set(UserAddress::getPostalCode, address.getPostalCode())
                .set(UserAddress::getIsDefault, address.getIsDefault())
                .eq(UserAddress::getId, address.getId())
                .update();

        if(!update){
            return Result.success("修改失败，请联系管理员");
        }

        return Result.success();

    }

    @Override
    public Result defaultAddress(Long addressId) {

        Long id = UserHolder.getUser().getId();

        lambdaUpdate().set(UserAddress::getIsDefault,0).eq(UserAddress::getIsDefault,1).update();

        // 更新默认地址
        lambdaUpdate().set(UserAddress::getIsDefault,1).eq(UserAddress::getId,addressId).update();

        return  Result.success();
    }
}
