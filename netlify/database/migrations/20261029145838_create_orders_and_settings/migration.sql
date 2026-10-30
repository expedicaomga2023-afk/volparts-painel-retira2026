CREATE TABLE "app_settings" (
	"id" text PRIMARY KEY,
	"data" jsonb NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY,
	"order_number" text NOT NULL,
	"customer_name" text NOT NULL,
	"cpf" text NOT NULL,
	"phone" text NOT NULL,
	"location" text NOT NULL,
	"parts" jsonb NOT NULL,
	"status" text NOT NULL,
	"status_changed_at" timestamp with time zone NOT NULL,
	"pickup_pin" text,
	"pin_sent_at" timestamp with time zone,
	"updated_at" timestamp with time zone NOT NULL
);
