package com.devsecops.orders.config;

import com.devsecops.orders.model.Product;
import com.devsecops.orders.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final ProductRepository productRepository;

    public DataInitializer(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() == 0) {
            log.info("Initializing demo products in Orders Service database...");
            productRepository.saveAll(List.of(
                    new Product("Demo Product A", new BigDecimal("10.00")),
                    new Product("Demo Product B", new BigDecimal("20.00")),
                    new Product("Demo Product C", new BigDecimal("30.00"))
            ));
            log.info("Initialized 3 demo products successfully.");
        }
    }
}
