package com.scutmmq.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum OperationType {

    INSERT(0,"增加"),
    DELETE(1,"删除"),
    MODIFY(2,"修改");


    @EnumValue
    private final int value;
    private final String desc;
}
