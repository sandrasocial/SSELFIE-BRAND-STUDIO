// Pure JavaScript test - no TypeScript, no React, no imports
console.log("test-script.js executing");

const root = document.getElementById("root");
if (root) {
  console.log("Root found, replacing content");
  root.innerHTML = `
    <div style="
      background: blue; 
      color: white; 
      padding: 50px; 
      text-align: center; 
      font-size: 24px;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      🔵 PURE JAVASCRIPT WORKING!<br>
      The issue is with TypeScript/React imports<br>
      main.tsx is NOT executing properly
    </div>
  `;
} else {
  console.error("Root element not found in test script");
}