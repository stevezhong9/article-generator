'use client';




export default function PrivacyPolicyPage() {
  
  
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
            <a href="/" className="text-blue-600 hover:text-blue-800">← 返回首页</a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            隐私政策
          </h1>
          
          <p className="text-gray-600 mb-8">
            最后更新: {new Date().toLocaleDateString('zh-CN')}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-gray-600">
                <p>We collect information you provide directly to us, such as when you:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Create an account or profile</li>
                  <li>Use our AI article generation services</li>
                  <li>Subscribe to our paid plans</li>
                  <li>Contact us for support</li>
                  <li>Participate in surveys or promotions</li>
                </ul>
                
                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Personal Information</h3>
                <p>This may include:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Name and email address</li>
                  <li>Profile information and avatar</li>
                  <li>Payment information (processed securely through Stripe)</li>
                  <li>Usage preferences and settings</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Usage Information</h3>
                <p>We automatically collect certain information about how you use our service:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Articles generated and their metadata</li>
                  <li>Usage patterns and frequency</li>
                  <li>Device and browser information</li>
                  <li>IP address and geographic location</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <div className="space-y-4 text-gray-600">
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide, maintain, and improve our AI article generation services</li>
                  <li>Process transactions and manage subscriptions</li>
                  <li>Send you technical notices, updates, and support messages</li>
                  <li>Respond to your comments, questions, and customer service requests</li>
                  <li>Monitor and analyze trends, usage, and activities</li>
                  <li>Detect, investigate, and prevent security incidents and fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Information Sharing and Disclosure</h2>
              <div className="space-y-4 text-gray-600">
                <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:</p>
                
                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Service Providers</h3>
                <p>We may share information with trusted service providers who assist us in operating our service:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Payment processing (Stripe)</li>
                  <li>Cloud hosting and storage (Supabase, Vercel)</li>
                  <li>Authentication services (Google OAuth)</li>
                  <li>Analytics and monitoring tools</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Legal Requirements</h3>
                <p>We may disclose information if required by law or in response to valid legal process.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <div className="space-y-4 text-gray-600">
                <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication</li>
                  <li>Secure payment processing through PCI-compliant providers</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Your Rights and Choices</h2>
              <div className="space-y-4 text-gray-600">
                <p>You have certain rights regarding your personal information:</p>
                
                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Access and Portability</h3>
                <p>You can access and download your personal data through your account settings.</p>
                
                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Correction and Updates</h3>
                <p>You can update your account information at any time through your profile settings.</p>
                
                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Deletion</h3>
                <p>You can request deletion of your account and associated data. Some information may be retained for legal or business purposes.</p>
                
                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Marketing Communications</h3>
                <p>You can opt out of promotional emails by following the unsubscribe instructions.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. International Data Transfers</h2>
              <div className="space-y-4 text-gray-600">
                <p>Our services are hosted in the United States. If you access our services from outside the US, your information may be transferred to, stored, and processed in the US. We ensure adequate protection of your data through appropriate safeguards.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Children's Privacy</h2>
              <div className="space-y-4 text-gray-600">
                <p>Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will delete it promptly.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Changes to This Policy</h2>
              <div className="space-y-4 text-gray-600">
                <p>We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
              <div className="space-y-4 text-gray-600">
                <p></p>
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
              ← 静态文本 to 静态文本
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}