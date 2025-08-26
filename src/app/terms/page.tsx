'use client';

import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function TermsOfServicePage() {
  const t = useTranslations();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center space-x-2">
              <img 
                src="/logo.png" 
                alt="ShareX AI Logo" 
                className="h-8 w-auto"
              />
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('legal.termsOfService')}
          </h1>
          
          <p className="text-gray-600 mb-8">
            {t('legal.effectiveDate', { date: new Date().toLocaleDateString() })}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <div className="space-y-4 text-gray-600">
                <p>By accessing and using Article Generator ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
                <p>These Terms of Service ("Terms") govern your use of our AI-powered article generation platform operated by [Your Company Name] ("we," "us," or "our").</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <div className="space-y-4 text-gray-600">
                <p>Article Generator is an AI-powered platform that transforms URLs into engaging, well-structured articles. Our service includes:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>AI-powered content generation from web URLs</li>
                  <li>Article formatting and optimization</li>
                  <li>User account management and profiles</li>
                  <li>Subscription-based premium features</li>
                  <li>Content sharing and export capabilities</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
              <div className="space-y-4 text-gray-600">
                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Account Creation</h3>
                <p>To access certain features, you must create an account by providing accurate and complete information. You are responsible for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                  <li>Ensuring your account information remains current and accurate</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Account Termination</h3>
                <p>We reserve the right to suspend or terminate your account if you violate these Terms or engage in prohibited activities.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Subscription Plans and Payment</h2>
              <div className="space-y-4 text-gray-600">
                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Plan Types</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Free Plan:</strong> Limited to 3 articles per day</li>
                  <li><strong>VIP Monthly:</strong> Unlimited articles for $9/month</li>
                  <li><strong>VIP Yearly:</strong> Unlimited articles for $90/year</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Payment Terms</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Payments are processed securely through Stripe</li>
                  <li>Subscriptions auto-renew unless cancelled</li>
                  <li>Prices are subject to change with 30 days notice</li>
                  <li>Refunds are provided according to our refund policy</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Cancellation</h3>
                <p>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Acceptable Use Policy</h2>
              <div className="space-y-4 text-gray-600">
                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Permitted Uses</h3>
                <p>You may use our service to generate articles for legitimate purposes including:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Content creation for blogs and websites</li>
                  <li>Research and educational purposes</li>
                  <li>Business and marketing content</li>
                  <li>Personal use and learning</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Prohibited Activities</h3>
                <p>You agree not to use the service to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Generate illegal, harmful, or offensive content</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Spam or engage in bulk commercial activities</li>
                  <li>Attempt to reverse engineer or exploit the service</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Impersonate others or provide false information</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Intellectual Property Rights</h2>
              <div className="space-y-4 text-gray-600">
                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Service Content</h3>
                <p>The service, including its software, technology, and design, is owned by us and protected by intellectual property laws.</p>

                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Generated Content</h3>
                <p>You retain ownership of articles generated using our service. However, you are responsible for ensuring that your use of generated content complies with applicable laws and does not infringe third-party rights.</p>

                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">User Content</h3>
                <p>By uploading content to our service, you grant us a license to use, store, and process that content solely to provide the service.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
              <div className="space-y-4 text-gray-600">
                <p>Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.</p>
                <p>We comply with applicable data protection laws including GDPR, CCPA, and other privacy regulations.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Disclaimers and Limitations</h2>
              <div className="space-y-4 text-gray-600">
                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Service Availability</h3>
                <p>We strive to maintain high availability but do not guarantee uninterrupted service. The service is provided "as is" without warranties of any kind.</p>

                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">AI-Generated Content</h3>
                <p>AI-generated content may contain inaccuracies or errors. You are responsible for reviewing and verifying all generated content before use.</p>

                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Limitation of Liability</h3>
                <p>To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Indemnification</h2>
              <div className="space-y-4 text-gray-600">
                <p>You agree to indemnify and hold us harmless from any claims, losses, or damages arising from your use of the service or violation of these Terms.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Modifications to Terms</h2>
              <div className="space-y-4 text-gray-600">
                <p>We may modify these Terms at any time. Material changes will be communicated to users with at least 30 days notice. Continued use of the service constitutes acceptance of modified Terms.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Governing Law and Dispute Resolution</h2>
              <div className="space-y-4 text-gray-600">
                <p>These Terms are governed by the laws of [Your State/Country]. Any disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
              <div className="space-y-4 text-gray-600">
                <p>{t('legal.contactEmail', { email: 'legal@articlegen.ai' })}</p>
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