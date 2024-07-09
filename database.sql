CREATE TABLE tb_itemPesanan (
    id_order_item SERIAL PRIMARY KEY,
    id_order INT,
    product_id INT,
    kuantitas INT NOT NULL,
    harga DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_order) REFERENCES tb_pesanan(id_order),
    FOREIGN KEY (product_id) REFERENCES tb_produk(product_id)
);