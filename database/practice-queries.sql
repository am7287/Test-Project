-- Filtering and sorting
SELECT name, price, quantity
FROM smartcart_products.products
WHERE quantity > 0 AND price < 3000
ORDER BY price DESC;

-- Aggregation and GROUP BY: spending per customer
SELECT u.username, COUNT(o.id) AS order_count, SUM(o.total_amount) AS total_spend
FROM smartcart_users.users u
JOIN smartcart_orders.orders o ON o.user_id = u.id
GROUP BY u.id, u.username
ORDER BY total_spend DESC;

-- Joins across service databases for training/reporting only
SELECT o.id, u.username, p.name AS product_name, o.quantity, o.total_amount
FROM smartcart_orders.orders o
JOIN smartcart_users.users u ON u.id = o.user_id
JOIN smartcart_products.products p ON p.id = o.product_id
ORDER BY o.id DESC;

-- Product sales summary
SELECT p.name, SUM(o.quantity) AS units_sold, SUM(o.total_amount) AS revenue
FROM smartcart_products.products p
LEFT JOIN smartcart_orders.orders o ON o.product_id = p.id
GROUP BY p.id, p.name
ORDER BY revenue DESC;
