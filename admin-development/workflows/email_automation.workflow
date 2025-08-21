{
  "name": "email_automation",
  "version": "1.0",
  "description": "Automated email handling and distribution workflow",
  "input": {
    "email_config": {
      "smtp_server": "string",
      "port": "number",
      "username": "string",
      "password": "string"
    },
    "email_template": {
      "subject": "string",
      "body": "string",
      "recipients": ["array"]
    }
  },
  "output": {
    "status": "string",
    "sent_count": "number",
    "failed_count": "number",
    "error_log": ["array"]
  },
  "steps": [
    {
      "name": "config_validation",
      "type": "verification",
      "action": "validate_email_config"
    },
    {
      "name": "template_processing",
      "type": "preparation",
      "action": "process_email_template"
    },
    {
      "name": "email_sending",
      "type": "execution",
      "action": "send_emails"
    },
    {
      "name": "delivery_monitoring",
      "type": "monitoring",
      "action": "monitor_email_delivery"
    },
    {
      "name": "result_reporting",
      "type": "report",
      "action": "generate_email_report"
    }
  ]
}