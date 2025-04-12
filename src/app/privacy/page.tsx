import React from "react";

const PrivacyPolicyPage = () => {
  const appUrl = "www.csonestopportal.com";
  const appName = "CS One Stop Portal";
  return (
    <div className="mx-auto max-w-7xl px-8 py-12">
      <>
        <div className="mx-auto max-w-5xl px-8 sm:mt-10">
          <h1 className="mb-2 text-center text-3xl font-semibold text-gray-700 sm:text-6xl">
            Privacy Policy
          </h1>
          <h2 className="mb-20 text-center text-gray-600">
            Last updated 10th April 2025
          </h2>
          <h3 className="mb-5 text-left text-2xl font-semibold text-gray-600">
            Introduction
          </h3>
          <p className="mb-10 mt-5 text-justify leading-relaxed text-gray-600">
            {appName} (“we,” “us,” or “our”) is a web-based platform designed to
            support the Computer Science community at Universiti Sains Malaysia
            (USM). We value your privacy and are committed to protecting and
            processing your personal information responsibly. This Privacy
            Policy describes how we collect, use, and share personal
            information, as well as the rights and choices you have regarding
            your data.
          </p>
          <h3 className="mb-5 text-left text-2xl font-semibold text-gray-600">
            Personal Information We Collect
          </h3>
          <p className="mb-10 mt-5 text-justify leading-relaxed text-gray-600">
            We collect the following types of personal information to provide
            and improve {appName} services:
          </p>
          <ul className="mb-10 mt-5 list-inside list-disc text-justify leading-relaxed text-gray-600">
            <li>
              <strong>User Registration Data</strong>: Email addresses, matric
              numbers, names, and roles (e.g., student, lecturer) to create and
              manage user accounts.
            </li>
            <li>
              <strong>Academic and Communication Data</strong>: Forum posts,
              announcements, uploaded files, event registrations, and messages
              shared within the platform.
            </li>
            <li>
              <strong>System Interaction Data</strong>: Login logs, activity
              logs, and preferences to monitor usage and improve functionality.
            </li>
            <li>
              <strong>Technical Data</strong>: IP addresses, browser types, and
              device information collected via cookies or similar technologies
              to ensure security and optimize performance.
            </li>
          </ul>
          <h3 className="mb-5 text-left text-2xl font-semibold text-gray-600">
            How We Use Your Information
          </h3>
          <p className="mb-10 mt-5 text-justify leading-relaxed text-gray-600">
            We use your personal information to:
          </p>
          <ul className="mb-10 mt-5 list-inside list-disc text-justify leading-relaxed text-gray-600">
            <li>
              Provide access to {appName} and its features, such as forums and
              announcements.
            </li>
            <li>
              Facilitate communication and collaboration within the USM CS
              community.
            </li>
            <li>
              Monitor and improve the platform’s performance and user
              experience.
            </li>
            <li>
              Ensure security through measures like role-based access controls.
            </li>
            <li>
              Comply with legal obligations, such as record-keeping for audits.
            </li>
          </ul>
          <h3 className="mb-5 text-left text-2xl font-semibold text-gray-600">
            Cookies and Related Technologies
          </h3>
          <p className="mb-10 mt-5 text-justify leading-relaxed text-gray-600">
            We use cookies and similar technologies to collect technical data,
            such as IP addresses and browsing activity, to enhance security and
            functionality. You can manage cookie preferences through your
            browser settings.
          </p>
          <h3 className="mb-5 text-left text-2xl font-semibold text-gray-600">
            Children
          </h3>
          <p className="mb-10 mt-5 text-justify leading-relaxed text-gray-600">
            {appName} is intended for use by USM students, lecturers, and staff
            and is not designed for children under 16.
          </p>
          <h3 className="mb-5 text-left text-2xl font-semibold text-gray-600">
            Sharing Personal Information
          </h3>
          <p className="mb-10 mt-5 text-justify leading-relaxed text-gray-600">
            We may share your personal information with:
          </p>
          <ul className="mb-10 mt-5 list-inside list-disc text-justify leading-relaxed text-gray-600">
            <li>
              USM administrators and IT staff for platform management and
              support.
            </li>
            <li>
              Service providers (e.g., hosting services) under strict
              confidentiality agreements.
            </li>
            <li>
              Legal authorities, if required by law or to protect the platform’s
              integrity.
            </li>
          </ul>
          <p className="mb-10 mt-5 text-justify leading-relaxed text-gray-600">
            We do not share your data for commercial purposes.
          </p>
          <h3 className="mb-5 text-left text-2xl font-semibold text-gray-600">
            Information Security and Retention
          </h3>
          <p className="mb-10 mt-5 text-justify leading-relaxed text-gray-600">
            We protect your personal information with safeguards like encryption
            and role-based access controls. Data is retained only as long as
            necessary for platform operations, academic purposes, or legal
            requirements (e.g., audits or disputes).
          </p>
          <h3 className="mb-5 text-left text-2xl font-semibold text-gray-600">
            Your Rights
          </h3>
          <p className="mb-10 mt-5 text-justify leading-relaxed text-gray-600">
            You can contact us at khawarizmijefri02@gmail.com to:
          </p>
          <ul className="mb-10 mt-5 list-inside list-disc text-justify leading-relaxed text-gray-600">
            <li>Access, update, or correct your personal information.</li>
            <li>
              Request deletion of your data, subject to legal retention needs.
            </li>
            <li>Obtain your data in a portable format (data portability).</li>
            <li>Raise concerns or complaints about data handling.</li>
          </ul>
          <h3 className="mb-5 text-left text-2xl font-semibold text-gray-600">
            Privacy Policy Updates
          </h3>
          <p className="mb-10 mt-5 text-justify leading-relaxed text-gray-600">
            We may update this policy, with changes posted on {appUrl} and an
            updated effective date. Continued use of {appName} after updates
            implies acceptance of the revised policy.
          </p>
        </div>
      </>
    </div>
  );
};

export default PrivacyPolicyPage;
