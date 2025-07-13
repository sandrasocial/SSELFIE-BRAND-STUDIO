// Minimal React test without any dependencies
console.log("simple-test.tsx loading");

const root = document.getElementById("root");
if (root) {
  console.log("Root found, setting simple content");
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
      🔵 SIMPLE TEST: NO REACT DEPENDENCIES<br>
      JavaScript is working!<br>
      Now testing React mounting...
    </div>
  `;
  
  setTimeout(() => {
    console.log("Starting React import test");
    import("react-dom/client").then((ReactDOM) => {
      console.log("ReactDOM imported successfully", ReactDOM);
      import("react").then((React) => {
        console.log("React imported successfully", React);
        root.innerHTML = `
          <div style="
            background: green; 
            color: white; 
            padding: 50px; 
            text-align: center; 
            font-size: 24px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            ✅ SUCCESS: REACT IMPORTS WORKING!<br>
            Dependencies loaded correctly<br>
            The issue is in App.tsx or imports
          </div>
        `;
      }).catch(error => {
        console.error("React import failed:", error);
        root.innerHTML = `<div style="background: red; color: white; padding: 50px; text-align: center;">❌ React import failed: ${error.message}</div>`;
      });
    }).catch(error => {
      console.error("ReactDOM import failed:", error);
      root.innerHTML = `<div style="background: red; color: white; padding: 50px; text-align: center;">❌ ReactDOM import failed: ${error.message}</div>`;
    });
  }, 1000);
} else {
  console.error("Root element not found");
}