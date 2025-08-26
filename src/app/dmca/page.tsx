'use client';

import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function DMCAPolicyPage() {
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
            {t('legal.dmca')} Copyright Policy
          </h1>
          
          <p className="text-gray-600 mb-8">
            {t('legal.lastUpdated', { date: new Date().toLocaleDateString() })}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Overview</h2>
              <div className="space-y-4 text-gray-600">
                <p>Article Generator respects the intellectual property rights of others and expects our users to do the same. In accordance with the Digital Millennium Copyright Act ("DMCA"), we will respond to notices of alleged copyright infringement that comply with the DMCA and other applicable laws.</p>
                <p>This policy outlines our procedures for handling copyright infringement claims and our commitment to protecting intellectual property rights.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Copyright Infringement Policy</h2>
              <div className="space-y-4 text-gray-600">
                <p>We have a zero-tolerance policy for copyright infringement. Users who repeatedly infringe copyrights may have their accounts terminated.</p>
                
                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Prohibited Activities</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Using our service to generate articles from copyrighted content without permission</li>
                  <li>Sharing or distributing copyrighted material without authorization</li>
                  <li>Creating derivative works from protected content without proper licensing</li>
                  <li>Circumventing technological measures that protect copyrighted works</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Filing a DMCA Takedown Notice</h2>
              <div className="space-y-4 text-gray-600">
                <p>If you believe your copyrighted work has been infringed, you may submit a DMCA takedown notice. To be effective, your notice must include:</p>
                
                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Required Information</h3>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>A physical or electronic signature of the copyright owner or authorized representative</li>
                  <li>Identification of the copyrighted work claimed to be infringed</li>
                  <li>Identification of the material that is claimed to be infringing and information sufficient to locate it</li>
                  <li>Your contact information (address, telephone number, email address)</li>
                  <li>A statement that you have a good faith belief that use of the material is not authorized</li>
                  <li>A statement that the information in the notification is accurate</li>
                  <li>A statement, under penalty of perjury, that you are authorized to act on behalf of the copyright owner</li>
                </ol>

                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">How to Submit</h3>
                <p>Send your DMCA takedown notice to our designated agent:</p>
                <div className="bg-gray-100 p-4 rounded-md mt-4">
                  <p><strong>DMCA Agent</strong></p>
                  <p>Email: dmca@articlegen.ai</p>
                  <p>Address: [Your Company Address]</p>
                  <p>Phone: [Your Phone Number]</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Counter-Notification Process</h2>
              <div className="space-y-4 text-gray-600">
                <p>If you believe your content was removed or disabled by mistake or misidentification, you may file a counter-notification.</p>
                
                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Counter-Notice Requirements</h3>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Your physical or electronic signature</li>
                  <li>Identification of the material that was removed and its previous location</li>
                  <li>A statement under penalty of perjury that you have a good faith belief the material was removed by mistake</li>
                  <li>Your contact information and consent to jurisdiction of federal court</li>
                  <li>A statement that you will accept service of process from the complaining party</li>
                </ol>

                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Counter-Notice Process</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We will provide your counter-notice to the original complaining party</li>
                  <li>If no legal action is filed within 10-14 business days, we may restore the content</li>
                  <li>We reserve the right to not restore content at our discretion</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Repeat Infringer Policy</h2>
              <div className="space-y-4 text-gray-600">
                <p>We maintain a policy of terminating accounts of users who repeatedly infringe copyrights. Our repeat infringer policy includes:</p>
                
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Tracking copyright infringement notices received about users</li>
                  <li>Warning users about infringement allegations</li>
                  <li>Suspending or terminating accounts of repeat offenders</li>
                  <li>Removing access to our services for terminated users</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Warning System</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>First violation:</strong> Warning and content removal</li>
                  <li><strong>Second violation:</strong> Temporary account suspension</li>
                  <li><strong>Third violation:</strong> Permanent account termination</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Safe Harbor Compliance</h2>
              <div className="space-y-4 text-gray-600">
                <p>We qualify for safe harbor protection under the DMCA by:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Promptly removing infringing content when notified</li>
                  <li>Implementing a repeat infringer policy</li>
                  <li>Designating an agent to receive DMCA notices</li>
                  <li>Not interfering with technical measures that protect copyrighted works</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Fair Use Considerations</h2>
              <div className="space-y-4 text-gray-600">
                <p>We recognize that not all uses of copyrighted material constitute infringement. Fair use factors include:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Purpose and character of the use (commercial vs. educational)</li>
                  <li>Nature of the copyrighted work</li>
                  <li>Amount and substantiality of the portion used</li>
                  <li>Effect of the use on the market for the original work</li>
                </ul>
                <p>Users are encouraged to consider fair use principles when using our service to generate content from existing sources.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. False Claims</h2>
              <div className="space-y-4 text-gray-600">
                <p>Submitting false or bad faith copyright claims may result in legal consequences, including:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Liability for damages under Section 512(f) of the DMCA</li>
                  <li>Attorney fees and costs</li>
                  <li>Other legal remedies available under applicable law</li>
                </ul>
                <p>Please ensure your copyright claims are made in good faith and are accurate.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. International Copyright</h2>
              <div className="space-y-4 text-gray-600">
                <p>We respect copyright laws of all countries and will respond to valid copyright notices from international copyright holders. We also comply with:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>The Berne Convention for the Protection of Literary and Artistic Works</li>
                  <li>The World Intellectual Property Organization (WIPO) Copyright Treaty</li>
                  <li>Other applicable international copyright agreements</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <div className="space-y-4 text-gray-600">
                <p>For DMCA-related matters, contact our designated agent:</p>
                <div className="bg-gray-100 p-4 rounded-md">
                  <p><strong>DMCA Agent</strong></p>
                  <p>Email: dmca@articlegen.ai</p>
                  <p>Address: [Your Company Address]</p>
                  <p>Phone: [Your Phone Number]</p>
                  <p>Fax: [Your Fax Number]</p>
                </div>
                <p>For general inquiries: {t('legal.contactEmail', { email: 'legal@articlegen.ai' })}</p>
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