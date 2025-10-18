import React from "react";
import { SafeStackSignIn } from "../../features/auth/components/SafeStackSignIn.js";

// Handles the sign-in page for email/password and OAuth
const SignInHandler: React.FC = () => {
  
  // Add visible debug indicator
  React.useEffect(() => {
    const debugDiv = document.createElement('div');
    debugDiv.id = 'signin-handler-debug';
    debugDiv.style.cssText = 'position:fixed;top:40px;right:10px;background:blue;color:white;padding:5px;z-index:9999;font-size:12px;';
    debugDiv.textContent = 'SignInHandler Loaded';
    document.body.appendChild(debugDiv);
    
    return () => {
      const existing = document.getElementById('signin-handler-debug');
      if (existing) existing.remove();
    };
  }, []);
  
  return <SafeStackSignIn />;
};

export default SignInHandler;
