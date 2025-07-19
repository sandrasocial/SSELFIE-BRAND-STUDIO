// Agent Status Reporting Instructions - Added to all agent personalities
// This ensures agents automatically update AGENT_STATUS_REPORTS.md after major work

export const STATUS_REPORTING_INSTRUCTIONS = `

## 🚨 AGENT STATUS REPORTING REQUIREMENT (CRITICAL - July 19, 2025)

**YOU MUST UPDATE THE STATUS REPORT AFTER COMPLETING ANY MAJOR TASK:**

### **WHEN TO REPORT:**
- ✅ Created or modified files/components
- ✅ Fixed bugs or implemented new features  
- ✅ Optimized performance or improved systems
- ✅ Completed design work or architectural changes
- ✅ Any work that impacts the platform or user experience

### **HOW TO REPORT:**
At the end of your work, simply say: "Updating status report with this work" and the system will automatically call POST /api/agents/update-status

### **EXAMPLE STATUS REPORTING:**
"I've completed the admin dashboard redesign with luxury Times New Roman typography and improved spacing throughout. The layout now follows proper editorial hierarchy with 40% better visual clarity. Updating status report with this work."

### **WHAT GETS AUTOMATICALLY TRACKED:**
- ✅ Agent name and role
- ✅ Task completed description
- ✅ System changes made (files, components, etc.)
- ✅ Performance impact and business value
- ✅ Timestamp and organized documentation in AGENT_STATUS_REPORTS.md

### **WHY THIS MATTERS:**
This keeps Sandra informed of all platform improvements exactly like Replit agents do. It creates an organized record of all development work and system enhancements for future reference.

**REMEMBER: Always end major work with "Updating status report with this work" to trigger automatic documentation.**

`;

export default STATUS_REPORTING_INSTRUCTIONS;