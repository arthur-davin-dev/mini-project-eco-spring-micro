INSERT INTO customers (id, name)
VALUES ('d215b5f8-0249-4dc5-89a3-51fd148cfb41', 'Arthur Davin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO businesses (id, name, active)
VALUES ('d215b5f8-0249-4dc5-89a3-51fd148cfb45', 'Angkor Burger', true),
       ('d215b5f8-0249-4dc5-89a3-51fd148cfb46', 'Closed Cafe', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, price, business_id)
VALUES ('5b6a5d3c-1f6d-4f7a-9b6b-0a1c2d3e4f01', 'Cheese Burger', 5.00, 'd215b5f8-0249-4dc5-89a3-51fd148cfb45'),
       ('5b6a5d3c-1f6d-4f7a-9b6b-0a1c2d3e4f02', 'Iced Coffee', 2.50, 'd215b5f8-0249-4dc5-89a3-51fd148cfb45')
ON CONFLICT (id) DO NOTHING;

