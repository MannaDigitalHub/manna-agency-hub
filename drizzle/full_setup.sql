-- ================================================================
-- Manna Digital Hub — Complete Database Setup
-- Run this in phpMyAdmin on database: qsfttpdi_mannadb
-- ================================================================

CREATE TABLE IF NOT EXISTS `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);

CREATE TABLE IF NOT EXISTS `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`businessName` varchar(255) NOT NULL,
	`businessType` varchar(100),
	`location` varchar(255),
	`status` enum('prospect','call_booked','client','not_interested','on_hold') NOT NULL DEFAULT 'prospect',
	`painPoint` text,
	`serviceInterest` varchar(255),
	`callbackNumber` varchar(20),
	`outreachDate` timestamp NULL,
	`lastFollowUp` timestamp NULL,
	`nextFollowUp` timestamp NULL,
	`notes` text,
	`source` varchar(50) DEFAULT 'apollo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int,
	`businessName` varchar(255) NOT NULL,
	`businessType` varchar(100),
	`contactName` varchar(255) NOT NULL,
	`contactEmail` varchar(320) NOT NULL,
	`contactPhone` varchar(20) NOT NULL,
	`location` varchar(255),
	`monthlyRetainer` decimal(10,2) NOT NULL,
	`setupFee` decimal(10,2),
	`status` enum('active','paused','cancelled','trial') NOT NULL DEFAULT 'active',
	`contractStartDate` timestamp NULL,
	`contractEndDate` timestamp NULL,
	`paymentMethod` varchar(50),
	`paymentStatus` enum('current','overdue','failed','pending') DEFAULT 'current',
	`nextBillingDate` timestamp NULL,
	`notes` text,
	`accessCode` varchar(50),
	`merchantPaymentId` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`),
	CONSTRAINT `clients_accessCode_unique` UNIQUE(`accessCode`),
	CONSTRAINT `clients_merchantPaymentId_unique` UNIQUE(`merchantPaymentId`)
);

CREATE TABLE IF NOT EXISTS `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`projectName` varchar(255) NOT NULL,
	`botName` varchar(255),
	`whatChimpBotId` varchar(255),
	`whatsappNumber` varchar(20),
	`status` enum('discovery','setup','training','testing','live','maintenance','paused') NOT NULL DEFAULT 'discovery',
	`discoveryDate` timestamp NULL,
	`setupStartDate` timestamp NULL,
	`goLiveDate` timestamp NULL,
	`completionDate` timestamp NULL,
	`services` varchar(500),
	`botDescription` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`invoiceType` enum('setup','retainer','one_off') NOT NULL DEFAULT 'retainer',
	`amount` decimal(10,2) NOT NULL,
	`description` text,
	`issueDate` timestamp NOT NULL DEFAULT (now()),
	`dueDate` timestamp NULL,
	`paidDate` timestamp NULL,
	`status` enum('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`paymentMethod` varchar(50),
	`payFastReference` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);

CREATE TABLE IF NOT EXISTS `bot_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`whatChimpBotId` varchar(255) NOT NULL,
	`whatsappNumber` varchar(20) NOT NULL,
	`apiKey` varchar(500),
	`status` enum('connected','disconnected','error') DEFAULT 'connected',
	`lastSyncDate` timestamp NULL,
	`totalConversations` int DEFAULT 0,
	`totalMessages` int DEFAULT 0,
	`averageResponseTime` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bot_connections_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int,
	`projectId` int,
	`leadId` int,
	`taskType` enum('onboarding','follow_up','milestone','reminder','payment','support') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
	`dueDate` timestamp NULL,
	`completedDate` timestamp NULL,
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`assignedTo` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `bot_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`businessName` varchar(255),
	`phone` varchar(20),
	`email` varchar(320),
	`language` varchar(10) DEFAULT 'en',
	`conversationSummary` text,
	`source` varchar(50) DEFAULT 'website_bot',
	`status` enum('new','contacted','qualified','converted','lost') NOT NULL DEFAULT 'new',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bot_leads_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `facebook_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadgenId` varchar(100) NOT NULL,
	`formId` varchar(100),
	`adId` varchar(100),
	`adgroupId` varchar(100),
	`pageId` varchar(100),
	`campaignName` varchar(255),
	`formName` varchar(255),
	`adName` varchar(255),
	`fullName` varchar(255),
	`email` varchar(320),
	`phone` varchar(20),
	`city` varchar(255),
	`company` varchar(255),
	`jobTitle` varchar(255),
	`rawFieldData` text,
	`status` enum('new','contacted','qualified','converted','lost','synced_to_crm') NOT NULL DEFAULT 'new',
	`whatsappFollowUpSent` int DEFAULT 0,
	`crmLeadId` int,
	`notes` text,
	`fbCreatedTime` timestamp NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `facebook_leads_id` PRIMARY KEY(`id`),
	CONSTRAINT `facebook_leads_leadgenId_unique` UNIQUE(`leadgenId`)
);

CREATE TABLE IF NOT EXISTS `payments` (
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

CREATE TABLE IF NOT EXISTS `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`payfastToken` varchar(100),
	`payfastSubscriptionId` varchar(100),
	`packageName` enum('starter','bundle','chatbot','social') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`status` enum('active','paused','cancelled','failed') NOT NULL DEFAULT 'active',
	`failedCount` int DEFAULT 0,
	`nextRunDate` timestamp NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_clientId_unique` UNIQUE(`clientId`)
);
