CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`payfastPaymentId` varchar(100) NOT NULL,
	`merchantPaymentId` varchar(100),
	`amount` decimal(10,2) NOT NULL,
	`itemName` varchar(255),
	`paymentStatus` enum('COMPLETE','FAILED','PENDING','CANCELLED','UNKNOWN') NOT NULL,
	`signatureValid` int DEFAULT 0,
	`rawItn` text NOT NULL,
	`processedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_payfastPaymentId_unique` UNIQUE(`payfastPaymentId`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`payfastToken` varchar(100),
	`payfastSubscriptionId` varchar(100),
	`packageName` enum('starter','bundle','chatbot','social') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`status` enum('active','paused','cancelled','failed') NOT NULL DEFAULT 'active',
	`failedCount` int DEFAULT 0,
	`nextRunDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_clientId_unique` UNIQUE(`clientId`)
);
--> statement-breakpoint
ALTER TABLE `clients` ADD `accessCode` varchar(50);--> statement-breakpoint
ALTER TABLE `clients` ADD `merchantPaymentId` varchar(100);--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_accessCode_unique` UNIQUE(`accessCode`);--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_merchantPaymentId_unique` UNIQUE(`merchantPaymentId`);