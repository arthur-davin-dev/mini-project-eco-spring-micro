package kh.eco.istad.platform.order.persistence.adapter;

import kh.eco.istad.platform.order.persistence.repository.BusinessReactiveRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class BusinessTest {
    @Autowired
    private BusinessReactiveRepository businessReactiveRepository;
    @Test
    void testFindBusiness(){
        businessReactiveRepository.findAl();
    }
}
