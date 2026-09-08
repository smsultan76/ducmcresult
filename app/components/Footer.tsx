'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGithub, 
  faFacebook, 
  faLinkedin 
} from '@fortawesome/free-brands-svg-icons';
import { 
  faCode, 
  faUser, 
  faEnvelope, 
  faExternalLinkAlt,
  faHeart
} from '@fortawesome/free-solid-svg-icons';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-8 no-print">
      {/* Main Footer Content */}
      <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-6 mx-auto">
        <div className="grid grid-cols-3 gap-6">
          
          {/* Open Source Section */}
          <div className="text-left col-span-2 lg:ml-24">
            <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-2">
              <FontAwesomeIcon icon={faCode} className="text-purple-400" />
              Open Source
            </h3>
            <p className="text-gray-200 text-xs leading-relaxed">
              This project is open source and free to use.
            </p>
            <a
              href="https://github.com/smsultan76/ducmcresult.git"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 text-xs mt-1 transition-colors"
            >
              <FontAwesomeIcon icon={faGithub} className='mr-2'/>
               View Source Code
            </a>
          </div>

          {/* Contact Section */}
          <div className="text-left sm:text-left">
            <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-2">
              <FontAwesomeIcon icon={faEnvelope} className="text-purple-400" />
              Contact
            </h3>
            <a
              href="https://sultanum-mobin.vercel.app/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-purple-300 text-xs transition-colors"
            >
              <FontAwesomeIcon icon={faEnvelope} />
              Contact With Developer
            </a>
          </div>

          {/* <div className="text-center sm:text-left">
            <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center justify-center sm:justify-start gap-2">
              <FontAwesomeIcon icon={faUser} className="text-purple-400" />
              Developer
            </h3>
            <a
              href="https://sultanum-mobin.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-purple-300 text-xs flex items-center justify-center sm:justify-start gap-1 mt-1 transition-colors"
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} />
              Sultanum Mobin
            </a>
          </div>

          <div className="text-center sm:text-left">
            <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center justify-center sm:justify-start gap-2">
              <FontAwesomeIcon icon={faExternalLinkAlt} className="text-purple-400" />
              Connect
            </h3>
            <div className="flex justify-center sm:justify-start gap-4">
              <a
                href="https://facebook.com/smsultan76"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-blue-500 transition-colors text-lg"
                aria-label="Facebook"
              >
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a
                href="https://linkedin.com/in/smsultan76"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-blue-400 transition-colors text-lg"
                aria-label="LinkedIn"
              >
                <FontAwesomeIcon icon={faLinkedin} />
              </a>
              <a
                href="https://github.com/smsultan76/ducmcresult.git"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-purple-400 transition-colors text-lg"
                aria-label="GitHub"
              >
                <FontAwesomeIcon icon={faGithub} />
              </a>
            </div>
          </div> */}

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-gray-300 text-xs">
            © {new Date().getFullYear()} DU CMC Result System. All rights reserved.
          </p>
          <p className="text-gray-300 text-xs flex items-center gap-1">
            Made with <FontAwesomeIcon icon={faHeart} className="text-red-500 text-xs" /> for Dhaka University
          </p>
        </div>
      </div>
    </footer>
  );
}