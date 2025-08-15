import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCorrectDomainUrl, detectBrowserIssues } from "@/utils/browserCompat";

export default function DomainHelp() {
  const [browserIssues, setBrowserIssues] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState("");
  const [browserInfo, setBrowserInfo] = useState("");

  useEffect(() => {
    setBrowserIssues(detectBrowserIssues());
    setCurrentUrl(window.location.href);
    setBrowserInfo(window.navigator.userAgent);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-black mb-4">
            SSELFIE Studio Domain Access Help
          </h1>
          <p className="text-xl text-gray-700">
            Having trouble accessing sselfie.ai? Here's how to fix it.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Quick Fix Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Quick Fix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                Most browsers require the full URL with https:// protocol. Try this:
              </p>
              
              <div className="bg-black text-white p-4 rounded font-mono text-center">
                https://sselfie.ai
              </div>
              
              <div className="flex gap-4">
                <Button 
                  onClick={() => copyToClipboard("https://sselfie.ai")}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Copy URL
                </Button>
                <Button 
                  onClick={() => window.open("https://sselfie.ai", "_blank")}
                  variant="outline"
                  className="border-black text-black hover:bg-gray-100"
                >
                  Open in New Tab
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Browser Compatibility */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Browser Compatibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                SSELFIE Studio works best with modern browsers:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-green-200 bg-green-50 p-4 rounded">
                  <h3 className="font-semibold text-green-800 mb-2">✓ Recommended Browsers</h3>
                  <ul className="space-y-1 text-green-700">
                    <li>• Chrome (latest version)</li>
                    <li>• Safari (latest version)</li>
                    <li>• Firefox (latest version)</li>
                    <li>• Edge (latest version)</li>
                  </ul>
                </div>
                
                <div className="border border-red-200 bg-red-50 p-4 rounded">
                  <h3 className="font-semibold text-red-800 mb-2">⚠ Known Issues</h3>
                  <ul className="space-y-1 text-red-700">
                    <li>• Older browser versions</li>
                    <li>• Missing https:// prefix</li>
                    <li>• Cached DNS settings</li>
                    <li>• Corporate firewalls</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Troubleshooting Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-l-4 border-black pl-4">
                  <h3 className="font-semibold text-lg mb-2">Step 1: Use Full URL</h3>
                  <p className="text-gray-700">Always type: <code className="bg-gray-100 px-2 py-1 rounded">https://sselfie.ai</code></p>
                </div>
                
                <div className="border-l-4 border-black pl-4">
                  <h3 className="font-semibold text-lg mb-2">Step 2: Clear Browser Cache</h3>
                  <p className="text-gray-700">Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)</p>
                </div>
                
                <div className="border-l-4 border-black pl-4">
                  <h3 className="font-semibold text-lg mb-2">Step 3: Try Incognito Mode</h3>
                  <p className="text-gray-700">Open a private/incognito browser window</p>
                </div>
                
                <div className="border-l-4 border-black pl-4">
                  <h3 className="font-semibold text-lg mb-2">Step 4: Check Network</h3>
                  <p className="text-gray-700">Ensure stable internet connection and no VPN blocking</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Your Current Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Current URL:</h4>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm break-all">
                    {currentUrl}
                  </code>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Domain Status:</h4>
                  <span className="inline-flex items-center px-2 py-1 rounded text-sm bg-green-100 text-green-800">
                    ✓ Accessible
                  </span>
                </div>
              </div>
              
              {browserIssues.length > 0 && (
                <div className="border border-yellow-200 bg-yellow-50 p-4 rounded">
                  <h4 className="font-semibold text-yellow-800 mb-2">Detected Issues:</h4>
                  <ul className="space-y-1 text-yellow-700">
                    {browserIssues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600">Browser Details</summary>
                <code className="text-xs bg-gray-100 p-2 rounded block mt-2 break-all">
                  {browserInfo}
                </code>
              </details>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Still Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                If you're still having trouble accessing SSELFIE Studio:
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => window.open("mailto:ssa@ssasocial.com?subject=Domain Access Issue", "_blank")}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Email Support
                </Button>
                <Button 
                  onClick={() => window.open("https://instagram.com/sandra.social", "_blank")}
                  variant="outline"
                  className="border-black text-black hover:bg-gray-100"
                >
                  Instagram DM
                </Button>
              </div>
              
              <p className="text-sm text-gray-600">
                Include your browser type and the exact error message you're seeing.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}