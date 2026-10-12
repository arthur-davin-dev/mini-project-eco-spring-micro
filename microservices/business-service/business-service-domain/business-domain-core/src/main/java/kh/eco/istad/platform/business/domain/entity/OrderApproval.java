package kh.eco.istad.platform.business.domain.entity;

import kh.eco.istad.common.domain.entity.BaseEntity;
import kh.eco.istad.common.domain.valueobject.BusinessId;
import kh.eco.istad.common.domain.valueobject.OrderId;
import kh.eco.istad.platform.business.domain.valueobject.OrderApprovalId;
import kh.eco.istad.platform.business.domain.valueobject.OrderApprovalStatus;

public class OrderApproval extends BaseEntity<OrderApprovalId> {

    private final BusinessId businessId;
    private final OrderId orderId;
    private final OrderApprovalStatus approvalStatus;

    public OrderApproval(OrderApprovalId id, BusinessId businessId, OrderId orderId,
                         OrderApprovalStatus approvalStatus) {
        super.setId(id);
        this.businessId = businessId;
        this.orderId = orderId;
        this.approvalStatus = approvalStatus;
    }

    public BusinessId getBusinessId() {
        return businessId;
    }

    public OrderId getOrderId() {
        return orderId;
    }

    public OrderApprovalStatus getApprovalStatus() {
        return approvalStatus;
    }
}