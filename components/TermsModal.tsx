"use client";

import { useState } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  loading?: boolean;
};

function TermsModal({ open, onClose, onSubmit, loading = false }: Props) {
  const [agreed, setAgreed] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">
            Terms & Conditions
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto text-sm text-gray-700 space-y-4 leading-relaxed flex-1">
          <p className="font-bold text-base">ED-LIBRARY CONTRIBUTOR TERMS AND CONDITIONS</p>
          <p>Effective Date: 12/05/2026</p>
          <p>These Contributor Terms and Conditions (“Terms”) govern the relationship between ED-Library (“ED-Library,” “we,” “our,” or “us”) and any individual or entity (“Contributor,” “you,” or “your”) who uploads, publishes, distributes, sells, or otherwise provides content through the ED-Library platform, including its website, mobile applications, APIs, affiliated services, future applications, and related technologies.</p>
          <p>By registering as a Contributor, uploading content, or using contributor features on ED-Library, you agree to be legally bound by these Terms.</p>
          <hr className="my-6 border-gray-200" />
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">1. DEFINITIONS</h3>
          <p>For the purpose of these Terms:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>“Platform” refers to ED-Library websites, applications, software, systems, APIs, databases, and services.</li>
            <li>“Content” refers to notes, textbooks, summaries, slides, documents, PDFs, images, questions, answers, academic resources, metadata, thumbnails, previews, descriptions, tags, and any uploaded material.</li>
            <li>“Contributor” refers to any user who uploads or distributes content through ED-Library.</li>
            <li>“Revenue” refers to earnings generated from eligible content through purchases, subscriptions, monetization systems, or future monetization features approved by ED-Library.</li>
          </ul>
          <hr className="my-6 border-gray-200" />
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">2. ELIGIBILITY</h3>
          <p>To become a Contributor, you must:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>Be at least 18 years old; or</li>
            <li>Have permission and supervision from a parent or legal guardian where required by applicable law.</li>
          </ul>
          <p>By using ED-Library as a Contributor, you represent that:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>You are legally capable of entering binding agreements;</li>
            <li>The information you provide is accurate and complete;</li>
            <li>You are not prohibited from using the Platform under any applicable law.</li>
          </ul>
          <p>ED-Library reserves the right to refuse, restrict, suspend, or terminate contributor access at its sole discretion.</p>
          <hr className="my-6 border-gray-200" />
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">3. CONTRIBUTOR CONTENT OWNERSHIP</h3>
          <p>Contributors retain ownership of the original intellectual property rights to content they upload to ED-Library.</p>
          <p>However, by uploading content to ED-Library, you grant ED-Library a perpetual, worldwide, non-exclusive, royalty-free, transferable, sublicensable, irrevocable license to:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>Host</li>
            <li>Store</li>
            <li>Reproduce</li>
            <li>Cache</li>
            <li>Format</li>
            <li>Convert</li>
            <li>Adapt for technical purposes</li>
            <li>Publish</li>
            <li>Display</li>
            <li>Distribute</li>
            <li>Promote</li>
            <li>Analyze</li>
            <li>Index</li>
            <li>Archive</li>
            <li>Translate metadata</li>
            <li>Create previews or thumbnails</li>
            <li>Use in marketing and advertising materials</li>
            <li>Use in recommendation systems</li>
            <li>Use in search systems</li>
            <li>Use in educational databases</li>
            <li>Use in analytics systems</li>
            <li>Use in future products and services</li>
            <li>Use in artificial intelligence, machine learning, and related technologies</li>
          </ul>
          <p>across current and future ED-Library platforms, systems, technologies, and affiliated services.</p>
          <p>This license survives account termination, content deletion, or discontinuation of services to the extent necessary for:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>Archived records</li>
            <li>Backups</li>
            <li>Legal compliance</li>
            <li>Previously developed systems</li>
            <li>Security purposes</li>
            <li>Existing marketing materials</li>
            <li>AI and analytical systems already trained or developed using such content</li>
          </ul>
          <hr className="my-6 border-gray-200" />
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">4. CONTENT WARRANTIES</h3>
          <p>By uploading content, you represent and warrant that:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>You own the content; or</li>
            <li>You possess all necessary rights, permissions, licenses, and authority to upload and distribute the content.</li>
          </ul>
          <p>You further warrant that your content does not:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>Infringe copyrights</li>
            <li>Infringe trademarks</li>
            <li>Violate academic integrity policies</li>
            <li>Violate privacy rights</li>
            <li>Violate confidentiality obligations</li>
            <li>Violate institutional restrictions</li>
            <li>Violate intellectual property laws</li>
            <li>Violate examination security rules</li>
            <li>Contain unlawful materials</li>
          </ul>
          <p>You are solely responsible for all uploaded content.</p>
          <p>ED-Library assumes no responsibility for contributor content.</p>
          <hr className="my-6 border-gray-200" />
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">5. PROHIBITED CONTENT</h3>
          <p>Contributors may not upload, distribute, sell, or promote:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>Leaked examinations</li>
            <li>Confidential institutional materials</li>
            <li>Unauthorized lecturer materials</li>
            <li>Pirated textbooks</li>
            <li>Copyrighted books without authorization</li>
            <li>Malware or malicious files</li>
            <li>Fraudulent materials</li>
            <li>Spam</li>
            <li>Hate speech</li>
            <li>Harassment</li>
            <li>Pornographic content</li>
            <li>Violent extremist materials</li>
            <li>Misleading academic materials</li>
            <li>Impersonation content</li>
            <li>Fake credentials or certificates</li>
            <li>Content designed to facilitate cheating or academic misconduct</li>
          </ul>
          <p>ED-Library reserves absolute discretion in determining prohibited content.</p>
          <hr className="my-6 border-gray-200" />
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">6. ACADEMIC INTEGRITY</h3>
          <p>ED-Library is intended to support lawful educational collaboration and academic assistance.</p>
          <p>Contributors may not use the Platform to:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>Sell answers to active examinations</li>
            <li>Circumvent institutional assessment systems</li>
            <li>Facilitate academic dishonesty</li>
            <li>Share confidential examination materials</li>
            <li>Violate university policies</li>
          </ul>
          <p>ED-Library reserves the right to cooperate with educational institutions and lawful authorities where necessary.</p>
          <hr className="my-6 border-gray-200" />
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">7. CONTENT MODERATION AND REMOVAL</h3>
          <p>ED-Library reserves the unrestricted right to:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>Remove content</li>
            <li>Edit metadata</li>
            <li>Restrict visibility</li>
            <li>Suspend monetization</li>
            <li>Disable downloads</li>
            <li>Freeze payouts</li>
            <li>Suspend accounts</li>
            <li>Permanently terminate contributor access</li>
          </ul>
          <p>with or without notice, and for any reason including:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>Suspected violations</li>
            <li>Fraud</li>
            <li>Copyright claims</li>
            <li>Platform abuse</li>
            <li>Legal risks</li>
            <li>Reputational risks</li>
            <li>Operational concerns</li>
          </ul>
          <p>ED-Library is under no obligation to restore removed content or suspended accounts.</p>
          <hr className="my-6 border-gray-200" />
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">8. COPYRIGHT COMPLAINTS</h3>
          <p>If ED-Library receives complaints alleging copyright infringement or unauthorized distribution:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>ED-Library may immediately remove the content;</li>
            <li>Suspend contributor privileges;</li>
            <li>Investigate the complaint;</li>
            <li>Cooperate with rights holders and lawful authorities.</li>
          </ul>
          <p>Repeat infringement may result in permanent account termination.</p>
          <p>Contributors remain solely liable for legal consequences arising from uploaded content.</p>
          <hr className="my-6 border-gray-200" />
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">9. REVENUE SHARING</h3>
          <p>Where monetization is enabled:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>Contributors receive 85% of eligible net revenue generated from their content.</li>
            <li>ED-Library retains 15% as platform commission.</li>
          </ul>
          <p>“Eligible net revenue” excludes:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>Taxes</li>
            <li>Refunds</li>
            <li>Chargebacks</li>
            <li>Fraudulent transactions</li>
            <li>Processing fees</li>
            <li>Reversed payments</li>
            <li>Promotional credits</li>
            <li>System errors</li>
          </ul>
          <p>ED-Library reserves the right to modify monetization structures, commission rates, payout systems, or revenue models at any time.</p>
          <p>Continued use of contributor services after such changes constitutes acceptance.</p>
          <hr className="my-6 border-gray-200" />
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">10. WITHDRAWALS AND PAYOUTS</h3>
          <p>Contributor withdrawals are subject to:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>Identity verification</li>
            <li>Fraud checks</li>
            <li>Payment processor availability</li>
            <li>Operational review</li>
          </ul>
          <p>A 5% withdrawal processing fee applies to all withdrawals.</p>
          <p>ED-Library reserves the right to:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>Set minimum withdrawal thresholds;</li>
            <li>Delay withdrawals for review;</li>
            <li>Freeze suspicious transactions;</li>
            <li>Reverse fraudulent earnings;</li>
            <li>Withhold payouts relating to disputes, fraud, abuse, manipulation, or legal concerns.</li>
          </ul>
          <p>Estimated payout timelines are not guarantees.</p>
          <p>ED-Library is not responsible for delays caused by:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>Banks</li>
            <li>Payment processors</li>
            <li>Technical failures</li>
            <li>Regulatory reviews</li>
            <li>Force majeure events</li>
          </ul>
          <hr className="my-6 border-gray-200" />
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">11. PLATFORM ANALYTICS, AI, AND DATA PROCESSING</h3>
          <p>ED-Library may use uploaded content, metadata, behavioral data, usage patterns, engagement statistics, and platform interactions to:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>Improve services</li>
            <li>Develop search systems</li>
            <li>Train recommendation systems</li>
            <li>Develop artificial intelligence systems</li>
            <li>Develop machine learning technologies</li>
            <li>Improve educational tools</li>
            <li>Build academic databases</li>
            <li>Improve moderation systems</li>
            <li>Enhance platform functionality</li>
          </ul>
          <p>Contributors acknowledge that:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>AI systems may process uploaded content;</li>
            <li>Analytical systems may derive insights from content;</li>
            <li>ED-Library is not required to provide additional compensation for such usage unless explicitly stated otherwise.</li>
          </ul>
          <hr className="my-6 border-gray-200" />
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">12. NO GUARANTEE OF EARNINGS</h3>
          <p>ED-Library does not guarantee:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>Revenue</li>
            <li>Downloads</li>
            <li>Visibility</li>
            <li>Discoverability</li>
            <li>Engagement</li>
            <li>Sales performance</li>
            <li>Audience reach</li>
            <li>Financial outcomes</li>
          </ul>
          <p>Contributor success depends on multiple factors outside ED-Library’s control.</p>
          <hr className="my-6 border-gray-200" />
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">13. ACCOUNT SECURITY</h3>
          <p>Contributors are responsible for:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>Maintaining account security;</li>
            <li>Protecting login credentials;</li>
            <li>Monitoring account activity.</li>
          </ul>
          <p>ED-Library is not liable for losses arising from:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>Unauthorized access</li>
            <li>Credential sharing</li>
            <li>User negligence</li>
            <li>Device compromise</li>
          </ul>
          <hr className="my-6 border-gray-200" />
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">14. TAX RESPONSIBILITIES</h3>
          <p>Contributors are solely responsible for:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>Reporting income;</li>
            <li>Paying taxes;</li>
            <li>Complying with financial regulations applicable in their jurisdiction.</li>
          </ul>
          <p>ED-Library does not provide tax advice.</p>
          <hr className="my-6 border-gray-200" />
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">15. DISCLAIMERS</h3>
          <p>ED-Library provides services on an “as is” and “as available” basis.</p>
          <p>ED-Library does not guarantee:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>Continuous availability</li>
            <li>Error-free services</li>
            <li>Data preservation</li>
            <li>Security against all attacks</li>
            <li>Accuracy of user-generated content</li>
            <li>Reliability of contributor materials</li>
          </ul>
          <p>Academic materials uploaded by contributors may contain inaccuracies, outdated information, errors, omissions, or misleading information.</p>
          <p>Users access contributor materials at their own risk.</p>
          <hr className="my-6 border-gray-200" />
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">16. LIMITATION OF LIABILITY</h3>
          <p>To the maximum extent permitted by law, ED-Library shall not be liable for:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>Indirect damages</li>
            <li>Consequential damages</li>
            <li>Lost profits</li>
            <li>Academic losses</li>
            <li>Examination outcomes</li>
            <li>Data loss</li>
            <li>Reputation damage</li>
            <li>Business interruption</li>
            <li>Third-party claims</li>
          </ul>
          <p>ED-Library’s total liability arising from contributor participation shall not exceed the total amount paid to the contributor within the previous six months.</p>
          <hr className="my-6 border-gray-200" />
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">17. INDEMNIFICATION</h3>
          <p>Contributors agree to indemnify and hold harmless ED-Library, its founders, officers, employees, affiliates, contractors, and partners from claims, liabilities, damages, losses, costs, and legal expenses arising from:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>Uploaded content</li>
            <li>Copyright disputes</li>
            <li>Platform misuse</li>
            <li>Fraudulent activity</li>
            <li>Violations of these Terms</li>
            <li>Violations of law</li>
          </ul>
          <p>This clause is extremely important. Keep it. Humans sue first and explain later.</p>
          <hr className="my-6 border-gray-200" />
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">18. TERMINATION</h3>
          <p>ED-Library may terminate contributor access at any time with or without notice.</p>
          <p>Upon termination:</p>
          <ul className="list-disc pl-5 my-2 space-y-1">
            <li>Contributor access may cease immediately;</li>
            <li>Monetization may be disabled;</li>
            <li>Content may remain archived where legally or operationally necessary;</li>
            <li>Outstanding investigations may continue.</li>
          </ul>
          <p>Termination does not eliminate obligations or liabilities incurred before termination.</p>
          <hr className="my-6 border-gray-200" />
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">19. PRIVACY</h3>
          <p>Contributor use of ED-Library is also governed by the ED-Library Privacy Policy.</p>
          <p>By using ED-Library, contributors consent to the collection, storage, and processing of data as described in the Privacy Policy.</p>
          <hr className="my-6 border-gray-200" />
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">20. MODIFICATIONS TO TERMS</h3>
          <p>ED-Library may update or modify these Terms at any time.</p>
          <p>Updated Terms become effective upon publication on the Platform.</p>
          <p>Continued use of contributor services after updates constitutes acceptance of revised Terms.</p>
          <hr className="my-6 border-gray-200" />
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">21. GOVERNING LAW</h3>
          <p>These Terms shall be governed by and interpreted under the laws of the Federal Republic of Nigeria.</p>
          <p>Any disputes arising from these Terms shall fall under the jurisdiction of competent courts within Nigeria unless otherwise determined by ED-Library.</p>
          <hr className="my-6 border-gray-200" />
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">22. CONTACT</h3>
          <p>Questions, complaints, or legal notices relating to these Terms may be directed to:</p>
          <p>ed-library.app@gmail.com</p>
          <p>House DN 5, Chinda Estate, Mile 3, Port Harcourt, Rivers State, Nigeria</p>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-5 space-y-4 shrink-0 bg-gray-50">

          <label className="flex items-center gap-3 text-sm text-gray-800 font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={() => setAgreed((p) => !p)}
              className="w-5 h-5 accent-blue-600 rounded"
            />
            <span>I agree to the ED-Library Contributor Terms and Conditions</span>
          </label>

          <button
            onClick={onSubmit}
            disabled={!agreed || loading}
            className={`w-full py-3.5 rounded-xl text-base font-semibold transition-all active:scale-[0.98] shadow-sm ${agreed && !loading
                ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
          >
            {loading ? "Submitting..." : "Accept & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TermsModal;
