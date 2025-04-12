const TermsOfServicePage = () => {
  const appName = "CS One Stop Portal";
  return (
    <div className="mx-auto max-w-7xl px-8 py-12">
      <>
        <div className="mx-auto max-w-5xl px-8 sm:mt-10">
          <h1 className="mb-2 text-center text-3xl font-semibold text-gray-700 sm:text-6xl">
            Terms and Conditions
          </h1>
          <h2 className="mb-20 text-center text-gray-600">
            Last updated 10th April 2025
          </h2>
          <h3 className="mb-5 text-left text-2xl font-semibold text-gray-600">
            1. Introduction
          </h3>
          <p className="mb-10 mt-5 text-justify leading-relaxed text-gray-600">
            These Terms and Conditions govern your use of {appName}, a web-based
            platform provided free of charge to the Computer Science community
            at Universiti Sains Malaysia (USM). By accessing or using {appName},
            you agree to be bound by these terms.
          </p>
          <h3 className="mb-5 text-left text-2xl font-semibold text-gray-600">
            2. Agreement to Terms
          </h3>
          <p className="mb-10 mt-5 text-justify leading-relaxed text-gray-600">
            These terms take effect when you first access or use {appName}. If
            you do not agree, please do not use the platform.
          </p>
          <h3 className="mb-5 text-left text-2xl font-semibold text-gray-600">
            3. Access and Use
          </h3>
          <p className="mb-10 mt-5 text-justify leading-relaxed text-gray-600">
            {appName} is provided to USM students, lecturers, and staff to
            facilitate collaboration, communication, and resource sharing. You
            are granted a non-exclusive, non-transferable right to use the
            platform for academic and university-related purposes, subject to
            these terms. We reserve the right to suspend or terminate access for
            misuse, including unauthorized access or harmful activities.
          </p>
          <h3 className="mb-5 text-left text-2xl font-semibold text-gray-600">
            4. User Responsibilities
          </h3>
          <p className="mb-10 mt-5 text-justify leading-relaxed text-gray-600">
            You agree to:
          </p>
          <ul className="mb-10 mt-5 list-inside list-disc text-justify leading-relaxed text-gray-600">
            <li>
              Use {appName} in accordance with USM policies and applicable laws.
            </li>
            <li>Not share your login credentials with others.</li>
            <li>Not upload or share harmful, offensive, or illegal content.</li>
            <li>
              Not attempt to disrupt or compromise the platform’s security.
            </li>
          </ul>
          <h3 className="mb-5 text-left text-2xl font-semibold text-gray-600">
            5. Disclaimer
          </h3>
          <p className="mb-10 mt-5 text-justify leading-relaxed text-gray-600">
            {appName} is provided “as is” without warranties of any kind,
            express or implied. We do not guarantee that the platform will meet
            all your requirements, be uninterrupted, or be error-free. Your use
            of
            {appName} is at your own risk.
          </p>
          <h3 className="mb-5 text-left text-2xl font-semibold text-gray-600">
            6. Limitation of Liability
          </h3>
          <p className="mb-10 mt-5 text-justify leading-relaxed text-gray-600">
            To the extent permitted by law, {appName} and its administrators
            shall not be liable for any direct, indirect, or consequential
            losses (including loss of data, academic progress, or opportunities)
            arising from your use of the platform or inability to access it.
            This includes losses due to technical issues or events beyond our
            control.
          </p>
          <h3 className="mb-5 text-left text-2xl font-semibold text-gray-600">
            7. User-Generated Content
          </h3>
          <p className="mb-10 mt-5 text-justify leading-relaxed text-gray-600">
            You are responsible for any content you upload or share on {appName}
            , such as forum posts or files. We are not liable for user-generated
            content and may remove content that violates these terms or USM
            policies.
          </p>
          <h3 className="mb-5 text-left text-2xl font-semibold text-gray-600">
            8. Governing Law
          </h3>
          <p className="mb-10 mt-5 text-justify leading-relaxed text-gray-600">
            These terms are governed by the laws of Malaysia. Any disputes
            arising from your use of {appName} will be subject to the
            jurisdiction of Malaysian courts.
          </p>
          <h3 className="mb-5 text-left text-2xl font-semibold text-gray-600">
            9. Changes to Terms
          </h3>
          <p className="mb-10 mt-5 text-justify leading-relaxed text-gray-600">
            We may update these terms from time to time. Changes will be posted
            on
            {appName} with an updated effective date. Continued use after
            changes implies acceptance of the revised terms.
          </p>
        </div>
      </>
    </div>
  );
};

export default TermsOfServicePage;
