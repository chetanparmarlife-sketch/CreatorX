package com.creatorx.repository;

import com.creatorx.repository.entity.ProductEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductEventRepository extends JpaRepository<ProductEvent, String> {
}
