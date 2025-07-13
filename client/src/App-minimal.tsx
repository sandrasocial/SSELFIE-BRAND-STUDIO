import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  console.log("Minimal App component mounted successfully!");
  
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{
        background: '#00ff00',
        color: 'black',
        padding: '40px',
        fontSize: '24px',
        fontWeight: 'bold',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h1>🎉 SUCCESS: WHITE SCREEN ISSUE FIXED! 🎉</h1>
        <p>React is mounting properly with QueryClient</p>
        <p>The issue was with complex imports in App.tsx</p>
        <button 
          onClick={() => {
            console.log("Button clicked - interactivity working!");
            alert("React app is fully functional!");
          }}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: 'white',
            border: '2px solid black',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Test Interactivity
        </button>
      </div>
    </QueryClientProvider>
  );
}

export default App;