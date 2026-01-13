import { Suspense } from "react";
import { DirectPurchaseForm } from "./DirectPurchaseForm";

export default function GetWarrantyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold bg-gradient-to-r from-[#00C853] to-[#00B4D8] bg-clip-text text-transparent">
              DriveSafe
            </div>
          </div>
          <a
            href="/login"
            className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            Already have an account? Login
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <div className="py-8 px-4">
        <div className="text-center mb-8">
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
            <div className="text-center py-12 text-gray-500">Loading...</div>
          }
        >
          <DirectPurchaseForm />
        </Suspense>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white my-2 pt-2 bottom-0">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} DriveSafe. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
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
