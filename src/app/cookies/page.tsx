'use client';

import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function CookiePolicyPage() {
  const t = useTranslations();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="text-xl font-bold text-blue-600">
              {t('footer.company')}
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('legal.cookiePolicy')}
          </h1>
          
          <p className="text-gray-600 mb-8">
            {t('legal.lastUpdated', { date: new Date().toLocaleDateString() })}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. What Are Cookies</h2>
              <div className="space-y-4 text-gray-600">
                <p>Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our service.</p>
                <p>This Cookie Policy explains what cookies are, how we use them, the types of cookies we use, and how you can control them.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Cookies</h2>
              <div className="space-y-4 text-gray-600">
                <p>We use cookies for various purposes to enhance your experience:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>To keep you signed in to your account</li>
                  <li>To remember your language and regional preferences</li>
                  <li>To understand how you interact with our service</li>
                  <li>To improve our service performance and security</li>
                  <li>To provide personalized content and features</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
              <div className="space-y-6 text-gray-600">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Essential Cookies</h3>
                  <p>These cookies are necessary for the website to function properly. They cannot be disabled:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                    <li><strong>Authentication cookies:</strong> Keep you logged in to your account</li>
                    <li><strong>Security cookies:</strong> Protect against cross-site request forgery</li>
                    <li><strong>Load balancing cookies:</strong> Ensure proper distribution of website traffic</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Functional Cookies</h3>
                  <p>These cookies enable enhanced functionality and personalization:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                    <li><strong>Language preference cookies:</strong> Remember your chosen language</li>
                    <li><strong>Theme preference cookies:</strong> Store your display preferences</li>
                    <li><strong>Settings cookies:</strong> Remember your account settings</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Analytics Cookies</h3>
                  <p>These cookies help us understand how visitors use our website:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                    <li><strong>Usage analytics:</strong> Track page views, session duration, and user interactions</li>
                    <li><strong>Performance monitoring:</strong> Monitor site performance and identify issues</li>
                    <li><strong>A/B testing cookies:</strong> Help us test different versions of features</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Third-Party Cookies</h3>
                  <p>We use cookies from trusted third-party services:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                    <li><strong>Google Analytics:</strong> Web analytics service to understand user behavior</li>
                    <li><strong>Stripe:</strong> Payment processing and fraud prevention</li>
                    <li><strong>Google OAuth:</strong> Authentication and account management</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Cookie Duration</h2>
              <div className="space-y-4 text-gray-600">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Session Cookies</h3>
                  <p>These cookies are temporary and are deleted when you close your browser. They are used for essential website functionality.</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Persistent Cookies</h3>
                  <p>These cookies remain on your device for a specified period or until you delete them. They are used to remember your preferences and improve your experience across visits.</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                    <li>Authentication cookies: Up to 30 days</li>
                    <li>Preference cookies: Up to 1 year</li>
                    <li>Analytics cookies: Up to 2 years</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Managing Your Cookie Preferences</h2>
              <div className="space-y-4 text-gray-600">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Browser Settings</h3>
                <p>You can control cookies through your browser settings:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Block all cookies or only third-party cookies</li>
                  <li>Delete existing cookies</li>
                  <li>Receive notifications when cookies are set</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900 mb-3">Popular Browser Instructions</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                  <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                  <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900 mb-3">Impact of Disabling Cookies</h3>
                <p>Please note that disabling certain cookies may affect the functionality of our service:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You may need to sign in repeatedly</li>
                  <li>Your preferences may not be saved</li>
                  <li>Some features may not work correctly</li>
                  <li>Performance may be degraded</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Third-Party Cookie Policies</h2>
              <div className="space-y-4 text-gray-600">
                <p>For more information about how third-party services use cookies, please refer to their privacy policies:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Google Analytics:</strong> <a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
                  <li><strong>Stripe:</strong> <a href="https://stripe.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</a></li>
                  <li><strong>Google OAuth:</strong> <a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Updates to This Cookie Policy</h2>
              <div className="space-y-4 text-gray-600">
                <p>We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons. We will notify you of any material changes by updating this page.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
              <div className="space-y-4 text-gray-600">
                <p>If you have any questions about our use of cookies or this Cookie Policy, please contact us:</p>
                <p>{t('legal.contactEmail', { email: 'cookies@articlegen.ai' })}</p>
                <p>Address: [Your Company Address]</p>
                <p>Phone: [Your Phone Number]</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <a 
              href="/" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              ← {t('common.back')} to {t('footer.company')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}