import * as React from "react";
import { SignIn, SignUp, UserButton } from "@stackframe/react";
import { stackClientApp } from "../stack";

export default function Auth() {
  return (
    <div style={{ padding: 24 }}>
      <UserButton app={stackClientApp} />
      <div style={{ display: "grid", gap: 24, marginTop: 24 }}>
        <SignIn app={stackClientApp} />
        <SignUp app={stackClientApp} />
      </div>
    </div>
  );
}