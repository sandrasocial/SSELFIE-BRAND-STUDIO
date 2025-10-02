import React from "react";
import { SignIn as StackSignIn } from "@stackframe/react";

// Handles the sign-in page for email/password and OAuth
const SignInHandler: React.FC = () => {
  return <StackSignIn fullPage />;
};

export default SignInHandler;
