import React from 'react';
import { MayaChatInterface } from '@/components/maya/MayaChatInterface';
import { MemberNavigation } from '@/components/member-navigation';

export default function MayaChatWrapper() {
  return (
    <>
      <MemberNavigation />
      <div className="min-h-screen bg-white">
        <MayaChatInterface />
      </div>
    </>
  );
}