import { Link } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';

const TermsOfService = () => {

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Language Switcher */}
      <div className="absolute top-6 right-8">
        <LanguageSwitcher />
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
            <Link 
              to="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Terms of Service Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 prose max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using Fun Circle ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Fun Circle is a community platform that enables users to:
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Create and share offers of services, skills, or items</li>
              <li>Post requests for help, services, or items they need</li>
              <li>Connect with other community members</li>
              <li>Rate and review interactions with other users</li>
              <li>Participate in community discussions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 Account Creation</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              To use our Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
            </p>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">3.2 Account Security</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You are responsible for safeguarding your account credentials and for all activities under your account. You must notify us immediately of any unauthorized use of your account.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">3.3 Age Requirement</h3>
            <p className="text-gray-700 leading-relaxed">
              You must be at least 13 years old to use our Service. Users under 18 must have parental consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Conduct</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Post content that is illegal, harmful, threatening, abusive, defamatory, or otherwise objectionable</li>
              <li>Harass, intimidate, or harm other users</li>
              <li>Impersonate any person or entity</li>
              <li>Violate any local, state, national, or international law</li>
              <li>Post spam, advertisements, or unsolicited commercial content</li>
              <li>Share false, misleading, or fraudulent information</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated tools to access or interact with our Service</li>
              <li>Collect or harvest user information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Content and Intellectual Property</h2>
            <h3 className="text-xl font-medium text-gray-800 mb-3">5.1 User Content</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You retain ownership of content you post on our platform. By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content on our platform.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">5.2 Platform Content</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our platform, including its design, features, and functionality, is owned by us and protected by copyright, trademark, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">5.3 Content Moderation</h3>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to remove or modify any content that violates these terms or is otherwise inappropriate, at our sole discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Transactions Between Users</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Fun Circle facilitates connections between users but is not a party to any transactions between users. We are not responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>The quality, safety, or legality of items or services offered</li>
              <li>The accuracy of user listings or profiles</li>
              <li>The ability of users to complete transactions</li>
              <li>Payment disputes between users</li>
              <li>Delivery or performance of services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy, which explains how we collect, use, and protect your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimers and Limitations</h2>
            <h3 className="text-xl font-medium text-gray-800 mb-3">8.1 Service Availability</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We provide our Service "as is" and "as available." We do not guarantee that our Service will be uninterrupted, secure, or error-free.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">8.2 Limitation of Liability</h3>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Account Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may suspend or terminate your account at any time for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Violation of these Terms of Service</li>
              <li>Fraudulent or illegal activity</li>
              <li>Abuse of other users</li>
              <li>Extended inactivity</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              You may also delete your account at any time through your account settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. We will notify users of material changes via email or platform notification. Continued use of our Service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms of Service are governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to conflict of law principles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p className="text-gray-700">
                <strong>Email:</strong> fun_circle@outlook.com
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Severability</h2>
            <p className="text-gray-700 leading-relaxed">
              If any provision of these Terms of Service is found to be unenforceable, the remaining provisions will continue to be valid and enforceable.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
