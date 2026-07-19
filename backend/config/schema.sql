CREATE DATABASE IF NOT EXISTS `fuotuoke_campus_eats`;
USE `fuotuoke_campus_eats`;

-- ── 1. USERS TABLE ──
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'staff', 'kitchen', 'rider', 'admin') NOT NULL DEFAULT 'student',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `canteen` VARCHAR(255) DEFAULT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_user_role` (`userId`, `role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 2. MENU ITEMS TABLE ──
CREATE TABLE IF NOT EXISTS `menu_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `cat` ENUM('Rice', 'Soup', 'Mains', 'Snacks', 'Drinks') NOT NULL,
  `emoji` VARCHAR(50) DEFAULT '',
  `image` VARCHAR(255) DEFAULT '',
  `desc` TEXT,
  `popular` TINYINT(1) DEFAULT 0,
  `available` TINYINT(1) DEFAULT 1,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 3. MENU EXTRAS TABLE ──
CREATE TABLE IF NOT EXISTS `menu_extras` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `menuItemId` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`menuItemId`) REFERENCES `menu_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 4. ORDERS TABLE ──
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `total` DECIMAL(10, 2) NOT NULL CHECK (`total` >= 0),
  `outletName` VARCHAR(255) NOT NULL,
  `outletId` VARCHAR(50) DEFAULT NULL,
  `type` ENUM('pickup', 'delivery') NOT NULL,
  `faculty` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('Received', 'Preparing', 'Ready', 'Out for Delivery', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Received',
  `customerId` VARCHAR(255) NOT NULL,
  `customerName` VARCHAR(255) NOT NULL,
  `paymentRef` VARCHAR(300) DEFAULT NULL,
  `paymentStatus` ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
  `time` VARCHAR(50) DEFAULT NULL,
  `assignedRiderId` VARCHAR(255) DEFAULT NULL,
  `assignedRiderName` VARCHAR(255) DEFAULT NULL,
  `assignedRiderPhone` VARCHAR(50) DEFAULT NULL,
  `deliveryProgress` INT DEFAULT 0 CHECK (`deliveryProgress` BETWEEN 0 AND 100),
  `riderLatitude` DECIMAL(10, 8) DEFAULT NULL,
  `riderLongitude` DECIMAL(11, 8) DEFAULT NULL,
  `latitude` DECIMAL(10, 8) DEFAULT NULL,
  `longitude` DECIMAL(11, 8) DEFAULT NULL,
  `formattedAddress` TEXT DEFAULT NULL,
  `deliveryNotes` TEXT DEFAULT NULL,
  `rating` INT DEFAULT 0 CHECK (`rating` BETWEEN 0 AND 5),
  `review` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_orders_customerId` (`customerId`),
  INDEX `idx_orders_status` (`status`),
  INDEX `idx_orders_paymentStatus` (`paymentStatus`),
  INDEX `idx_orders_assignedRider` (`assignedRiderId`),
  INDEX `idx_orders_outletName` (`outletName`),
  INDEX `idx_orders_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 5. ORDER ITEMS TABLE ──
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `orderId` INT NOT NULL,
  `menuItemId` INT DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `qty` INT NOT NULL DEFAULT 1,
  `emoji` VARCHAR(50) DEFAULT '',
  FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 6. ORDER ITEM EXTRAS TABLE ──
CREATE TABLE IF NOT EXISTS `order_item_extras` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `orderItemId` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`orderItemId`) REFERENCES `order_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 7. AUDIT LOGS TABLE ──
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` VARCHAR(255) DEFAULT NULL,
  `action` VARCHAR(500) NOT NULL,
  `details` TEXT,
  `ipAddress` VARCHAR(100) DEFAULT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_userId` (`userId`),
  INDEX `idx_audit_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 8. SETTINGS TABLE ──
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `maintenanceMode` TINYINT(1) DEFAULT 0,
  `allowRegistration` TINYINT(1) DEFAULT 1,
  `allowDeliveries` TINYINT(1) DEFAULT 1,
  `deliveryFee` DECIMAL(10, 2) DEFAULT 300.00,
  `supportPhone` VARCHAR(50) DEFAULT '08012345678',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 9. REFRESH TOKENS TABLE ──
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` VARCHAR(255) NOT NULL,
  `token` VARCHAR(700) NOT NULL,
  `expiresAt` DATETIME NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_refresh_userId` (`userId`),
  UNIQUE KEY `idx_token` (`token`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default settings
INSERT INTO `settings` (`id`, `maintenanceMode`, `allowRegistration`, `allowDeliveries`, `deliveryFee`, `supportPhone`)
VALUES (1, 0, 1, 1, 300.00, '08012345678')
ON DUPLICATE KEY UPDATE `id` = `id`;


-- ── 9. SEED DEFAULT USERS ──
INSERT INTO `users` (`userId`, `name`, `email`, `password`, `role`, `status`, `canteen`)
SELECT 'zoehackz001', 'Zoe Hackz Admin', 'admin@fuotuoke.edu.ng', '$2a$10$fwIdhhCATNc6asUEV2nCcO..MWF8Ac03Kfa4mlWJU1VEY4jBNRNt2', 'admin', 'active', NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `userId` = 'zoehackz001' AND `role` = 'admin');

INSERT INTO `users` (`userId`, `name`, `email`, `password`, `role`, `status`, `canteen`)
SELECT 'FUO/22/CSI/18843', 'Precious Daniel', 'precious.daniel@fuotuoke.edu.ng', '$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq', 'student', 'active', NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `userId` = 'FUO/22/CSI/18843' AND `role` = 'student');

INSERT INTO `users` (`userId`, `name`, `email`, `password`, `role`, `status`, `canteen`)
SELECT 'zoehackz001', 'Zoe Hackz Rider', 'rider@fuotuoke.edu.ng', '$2a$10$fwIdhhCATNc6asUEV2nCcO..MWF8Ac03Kfa4mlWJU1VEY4jBNRNt2', 'rider', 'active', NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `userId` = 'zoehackz001' AND `role` = 'rider');

INSERT INTO `users` (`userId`, `name`, `email`, `password`, `role`, `status`, `canteen`)
SELECT 'zoehackz001', 'Zoe Hackz Staff', 'staff@fuotuoke.edu.ng', '$2a$10$fwIdhhCATNc6asUEV2nCcO..MWF8Ac03Kfa4mlWJU1VEY4jBNRNt2', 'staff', 'active', NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `userId` = 'zoehackz001' AND `role` = 'staff');

INSERT INTO `users` (`userId`, `name`, `email`, `password`, `role`, `status`, `canteen`)
SELECT 'zoehackz001', 'Main Cafeteria Kitchen', 'canteen@fuotuoke.edu.ng', '$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq', 'kitchen', 'active', 'Main Cafeteria'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `userId` = 'zoehackz001' AND `role` = 'kitchen');

INSERT INTO `users` (`userId`, `name`, `email`, `password`, `role`, `status`, `canteen`)
SELECT 'SCIENCE-KITCHEN', 'Science Cafeteria Kitchen', 'science@fuotuoke.edu.ng', '$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq', 'kitchen', 'active', 'Science Cafeteria'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `userId` = 'SCIENCE-KITCHEN' AND `role` = 'kitchen');

INSERT INTO `users` (`userId`, `name`, `email`, `password`, `role`, `status`, `canteen`)
SELECT 'SUB-KITCHEN', 'Student Union Buka Kitchen', 'sub@fuotuoke.edu.ng', '$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq', 'kitchen', 'active', 'Student Union Buka'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `userId` = 'SUB-KITCHEN' AND `role` = 'kitchen');

INSERT INTO `users` (`userId`, `name`, `email`, `password`, `role`, `status`, `canteen`)
SELECT 'ENG-KITCHEN', 'Engineering Canteen Kitchen', 'eng@fuotuoke.edu.ng', '$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq', 'kitchen', 'active', 'Engineering Canteen'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `userId` = 'ENG-KITCHEN' AND `role` = 'kitchen');


-- ── 10. SEED DEFAULT MENU ITEMS ──
INSERT INTO `menu_items` (`id`, `name`, `price`, `cat`, `emoji`, `image`, `desc`, `popular`, `available`) VALUES
(1, 'Eba + soup (Egusi/Vegetable)', 1500.00, 'Soup', '', '/images/menu/eba_egusi_soup.png', 'Fresh garri served with choice of Egusi or Vegetable soup', 1, 1),
(2, 'Eba + Okra soup', 1500.00, 'Soup', '', '/images/menu/eba_okra_soup.png', 'Yellow garri paired with draw okra soup and fish', 0, 1),
(3, 'Amala + Ewedu/Gbegiri', 1700.00, 'Soup', '', '/images/menu/amala_ewedu.png', 'Soft yam flour with combination of Ewedu and bean soup', 1, 1),
(4, 'Pounded yam + soup', 1700.00, 'Soup', '', '/images/menu/pounded_yam_soup.png', 'Smooth pounded yam served with choice of soup', 1, 1),
(5, 'Pepper soup (fish)', 2500.00, 'Soup', '', '/images/menu/pepper_soup_fish.png', 'Spicy pepper soup broth served with fresh catfish', 0, 1),
(6, 'Jollof Rice & Chicken', 2500.00, 'Rice', '', '/images/menu/jollof_rice_chicken.png', 'Rich smokey Nigerian party Jollof served with fried chicken', 1, 1),
(7, 'Fried Rice & Fish', 2500.00, 'Rice', '', '/images/menu/fried_rice_chicken.png', 'Savory seasoned fried rice mixed with vegetables and fried fish', 0, 1),
(8, 'White Rice & Stew', 1800.00, 'Rice', '', '/images/menu/white_rice_stew.png', 'Fluffy white long-grain rice served with standard tomato stew and beef', 0, 1),
(9, 'Spaghetti Bolognese', 2000.00, 'Mains', '', '/images/menu/spaghetti_chicken.png', 'Pasta tossed in seasoned minced beef sauce', 1, 1),
(10, 'Plantain & Egg Sauce', 1500.00, 'Mains', '', '/images/menu/fried_plantain.png', 'Fried sweet plantain slices served with scrambled egg sauce', 0, 1),
(11, 'Meat Pie', 800.00, 'Snacks', '', 'https://images.unsplash.com/photo-1588168333986-5078647ac9ab?auto=format&fit=crop&w=600&q=80', 'Baked pastry filled with minced beef and potatoes', 1, 1),
(12, 'Sausage Roll', 600.00, 'Snacks', '', 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80', 'Savory sausage meat rolled in flaky pastry', 0, 1),
(13, 'Chilled Coca-Cola', 500.00, 'Drinks', '', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80', '35cl pet bottle served ice-cold', 0, 1),
(14, 'Cold Fanta', 500.00, 'Drinks', '', 'https://images.unsplash.com/photo-1581009137042-c552e4856c7d?auto=format&fit=crop&w=600&q=80', '35cl pet bottle served ice-cold', 0, 1),
(15, 'Water (Bottle)', 300.00, 'Drinks', '', 'https://images.unsplash.com/photo-1560023907-5f67b3104e94?auto=format&fit=crop&w=600&q=80', '75cl table water bottle', 0, 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);


-- ── 11. SEED DEFAULT MENU EXTRAS ──
INSERT INTO `menu_extras` (`id`, `menuItemId`, `name`, `price`) VALUES
(1, 1, 'Extra Beef', 500.00),
(2, 1, 'Extra Eba', 200.00),
(3, 2, 'Extra Fish', 500.00),
(4, 2, 'Extra Eba', 200.00),
(5, 3, 'Extra Meat', 500.00),
(6, 3, 'Extra Amala', 300.00),
(7, 4, 'Extra Meat', 500.00),
(8, 4, 'Extra Yam', 300.00),
(9, 6, 'Extra Chicken', 1000.00),
(10, 6, 'Plantain portion', 300.00),
(11, 7, 'Extra Fish', 800.00),
(12, 7, 'Coleslaw side', 200.00)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);
