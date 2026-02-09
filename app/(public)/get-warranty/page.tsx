import { Suspense } from "react";
import { DirectPurchaseForm } from "./DirectPurchaseForm";

export default function GetWarrantyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
     
        <div className="container mx-auto flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img src="/Drive Safe-04.png" alt="DriveSafe Logo" className="h-25 w-25 object-contain" />
             
            </div>
          </div>
          
        </div>
      

      {/* Hero Section */}
      <div className="px-4 flex-1">
        <div className="text-center mb-3">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
            Get Your Vehicle{" "}
            <span className="bg-gradient-to-r from-[#00C853] to-[#00B4D8] bg-clip-text text-transparent">
              Protected
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Complete the form below to purchase a comprehensive warranty plan
            for your vehicle. Coverage starts immediately after purchase.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="text-center py-8 text-gray-500">Loading...</div>
          }>
          <DirectPurchaseForm />
        </Suspense>
      </div>

      {/* Footer */}
      <footer className="border-t mt-auto py-6 bg-white">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          <p>© <span suppressHydrationWarning>{new Date().getFullYear()}</span> DriveSafe. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-2">
            <a href="#" className="hover:text-gray-700 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-gray-700 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-700 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
