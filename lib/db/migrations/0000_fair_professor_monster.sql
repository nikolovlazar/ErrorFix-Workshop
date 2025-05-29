CREATE TABLE "products" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" real NOT NULL,
	"category" text NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"in_stock" boolean DEFAULT true NOT NULL,
	"rating" real,
	"review_count" integer DEFAULT 0,
	"images" json DEFAULT '[]' NOT NULL,
	"sizes" json DEFAULT '[]' NOT NULL,
	"colors" json DEFAULT '[]' NOT NULL
);
