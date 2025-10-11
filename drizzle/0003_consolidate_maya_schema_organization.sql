ALTER TABLE "maya_chat_messages" DROP CONSTRAINT "maya_chat_messages_chat_id_maya_chats_id_fk";
--> statement-breakpoint
ALTER TABLE "maya_context_sessions" DROP CONSTRAINT "maya_context_sessions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "maya_chat_messages" ADD CONSTRAINT "maya_chat_messages_chat_id_maya_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."maya_chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maya_chats" ADD CONSTRAINT "maya_chats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maya_context_sessions" ADD CONSTRAINT "maya_context_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;