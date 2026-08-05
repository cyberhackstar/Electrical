package com.electromart.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Key-value technical specs for a product, e.g. Voltage=220V, Wattage=60W, Material=Copper.
 * Powers spec-based filtering on the frontend.
 */
@Entity
@Table(name = "product_attributes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductAttribute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, length = 100)
    private String attributeKey;

    @Column(nullable = false, length = 200)
    private String attributeValue;
}
