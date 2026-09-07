'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-8 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Open Source Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="text-2xl">📦</span> Open Source
            </h3>
            <p className="text-gray-300 text-sm mb-2">
              This project is open source and free to use.
            </p>
            <a
              href="https://github.com/smsultan76/ducmcresult.git"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
            >
              <span>🔗</span> View Source Code
            </a>
          </div>

          {/* Developer Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="text-2xl">👨‍💻</span> Developer
            </h3>
            <p className="text-gray-300 text-sm mb-2">
              Developed by <span className="font-medium text-white">Sultanum Mobin</span>
            </p>
            <a
              href="https://sultanum-mobin.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
            >
              <span>🌐</span> Portfolio
            </a>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="text-2xl">📧</span> Contact
            </h3>
            <a
              href="https://sultanum-mobin.vercel.app/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
            >
              <span>✉️</span> Contact Developer
            </a>
          </div>

          {/* Social Links Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="text-2xl">🔗</span> Connect
            </h3>
            <div className="space-y-2">
              <a
                href="https://facebook.com/smsultan76"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-2"
              >
                <span className="text-xl">📘</span> Facebook
              </a>
              <a
                href="https://linkedin.com/in/smsultan76"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-2"
              >
                <span className="text-xl">💼</span> LinkedIn
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400 text-xs">
          <p>
            © {new Date().getFullYear()} DU CMC Result System. All rights reserved.
          </p>
          <p className="mt-1">
            Made with ❤️ for Dhaka University Constituent Medical College
          </p>
        </div>
      </div>
    </footer>
  );
}