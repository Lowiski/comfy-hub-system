CREATE TYPE "public"."appointment_format" AS ENUM('Online', 'In person');--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"counselor_id" text NOT NULL,
	"date" date NOT NULL,
	"time" text NOT NULL,
	"format" "appointment_format" DEFAULT 'Online' NOT NULL,
	"topic" text NOT NULL,
	"notes" text,
	"status" "appointment_status" DEFAULT 'pending' NOT NULL,
	"counselor_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_counselor_id_users_id_fk" FOREIGN KEY ("counselor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointments_student_idx" ON "appointments" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "appointments_counselor_idx" ON "appointments" USING btree ("counselor_id");