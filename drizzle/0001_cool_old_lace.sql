CREATE TABLE `bot_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`whatChimpBotId` varchar(255) NOT NULL,
	`whatsappNumber` varchar(20) NOT NULL,
	`apiKey` varchar(500),
	`status` enum('connected','disconnected','error') DEFAULT 'connected',
	`lastSyncDate` timestamp,
	`totalConversations` int DEFAULT 0,
	`totalMessages` int DEFAULT 0,
	`averageResponseTime` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bot_connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
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
	`contractStartDate` timestamp,
	`contractEndDate` timestamp,
	`paymentMethod` varchar(50),
	`paymentStatus` enum('current','overdue','failed','pending') DEFAULT 'current',
	`nextBillingDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`invoiceType` enum('setup','retainer','one_off') NOT NULL DEFAULT 'retainer',
	`amount` decimal(10,2) NOT NULL,
	`description` text,
	`issueDate` timestamp NOT NULL DEFAULT (now()),
	`dueDate` timestamp,
	`paidDate` timestamp,
	`status` enum('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`paymentMethod` varchar(50),
	`payFastReference` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
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
	`outreachDate` timestamp,
	`lastFollowUp` timestamp,
	`nextFollowUp` timestamp,
	`notes` text,
	`source` varchar(50) DEFAULT 'apollo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`projectName` varchar(255) NOT NULL,
	`botName` varchar(255),
	`whatChimpBotId` varchar(255),
	`whatsappNumber` varchar(20),
	`status` enum('discovery','setup','training','testing','live','maintenance','paused') NOT NULL DEFAULT 'discovery',
	`discoveryDate` timestamp,
	`setupStartDate` timestamp,
	`goLiveDate` timestamp,
	`completionDate` timestamp,
	`services` varchar(500),
	`botDescription` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int,
	`projectId` int,
	`leadId` int,
	`taskType` enum('onboarding','follow_up','milestone','reminder','payment','support') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
	`dueDate` timestamp,
	`completedDate` timestamp,
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`assignedTo` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
