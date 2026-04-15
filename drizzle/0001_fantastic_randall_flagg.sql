CREATE TABLE `agentState` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`systemPrompt` text NOT NULL,
	`learningData` json,
	`preferences` json,
	`lastOptimizationAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agentState_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `briefings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`worldNews` text,
	`wealthUpdates` text,
	`prioritizedTasks` json,
	`motivationalInsight` text,
	`energyOptimization` text,
	`sentViaEmail` boolean DEFAULT false,
	`sentViaTelegram` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `briefings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) DEFAULT 'New Conversation',
	`context` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` enum('income','investment','business','skill','network','debt','savings','passive_income','zakat','other') DEFAULT 'other',
	`status` enum('pending','in_progress','completed','paused') DEFAULT 'pending',
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`targetValue` decimal(20,2),
	`currentValue` decimal(20,2) DEFAULT '0',
	`dueDate` datetime,
	`assignedTo` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`category` enum('strategy','opportunity','risk','optimization','islamic_finance','other') DEFAULT 'other',
	`actionItems` json,
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orgStructure` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`role` enum('chairman','board','c_suite','manager','worker') NOT NULL,
	`department` varchar(255),
	`responsibilities` text,
	`assignedGoals` json,
	`performance` decimal(5,2) DEFAULT '0',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orgStructure_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`goalId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('pending','in_progress','completed','blocked') DEFAULT 'pending',
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`assignedTo` varchar(255),
	`dueDate` datetime,
	`estimatedHours` int,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wealthMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`metricType` enum('net_worth','monthly_income','investment_portfolio','business_revenue','passive_income','total_debt','emergency_fund','zakat_due') NOT NULL,
	`value` decimal(20,2) NOT NULL,
	`trend` enum('up','down','stable') DEFAULT 'stable',
	`percentageChange` decimal(10,2) DEFAULT '0',
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wealthMetrics_id` PRIMARY KEY(`id`)
);
