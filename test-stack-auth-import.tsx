// Test Stack Auth import fix
import React from 'react';
import stackAuth from "@stackframe/react";

const { useUser, SignIn, StackHandler } = stackAuth;

console.log('✅ Stack Auth imports working:');
console.log('useUser:', typeof useUser);
console.log('SignIn:', typeof SignIn);
console.log('StackHandler:', typeof StackHandler);

export function TestComponent() {
  const user = useUser();
  return <div>User: {user ? 'Authenticated' : 'Not authenticated'}</div>;
}