import { useState } from "react";

const Section = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-lg mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 font-semibold"
      >
        {title}
      </button>
      {open && <div className="px-4 py-3 text-sm text-gray-800">{children}</div>}
    </div>
  );
};

export default function PrivacyChoice() {
  return (
    <div className="max-w-2xl mx-auto my-8 p-4">
      <h1 className="text-2xl font-bold mb-6">Your Privacy Choices</h1>

      <Section title="JAFI.AI Does Not Sell Your Personal Information">
        <p>
          JAFI.AI does not sell your personal information and will not do so without notice and the
          ability to opt out. Because of this, there's currently no opt-out for data sale. JAFI.AI
          also does not offer financial incentives for collecting or sharing your personal data.
        </p>
      </Section>

      <Section title="Managing Your Sensitive Personal Information">
        <p>
          Sensitive info includes location, health, religion, race, etc. JAFI.AI only collects this
          with your consent. You can remove preferences like “kosher” or “halal” through your
          account or stop sharing location via your device settings.
        </p>
        <ul className="list-disc ml-5 mt-2">
          <li>To disable location on iOS: Settings → Privacy → Location Services → JAFI.AI → Never</li>
          <li>
            To disable location on Android: Settings → Location → App access → JAFI.AI → Don’t allow
          </li>
        </ul>
      </Section>

      <Section title="Removing Consent for Sensitive Info">
        <p>
          You can delete or edit personal content posted on JAFI.AI at any time. Preferences like
          “kosher” or “halal” may imply sensitive data and can be edited through your account
          settings.
        </p>
      </Section>

      <Section title="Opting Out of Targeted Advertising">
        <p>
          JAFI.AI may use your activity to show relevant ads on other sites. To opt-out:
        </p>
        <ul className="list-disc ml-5 mt-2">
          <li>Go to Account Settings → Privacy Settings</li>
          <li>Scroll to “Ads Displayed off JAFI.AI”</li>
          <li>App: Select “No”; Web: Uncheck targeting option</li>
        </ul>
        <p className="mt-2 text-sm">
          Note: If you're not logged in on a device, opt-out won't apply unless you do it separately
          for that device.
        </p>
      </Section>

      <Section title="Manage Ad Tracking Cookies">
        <p>
          If logged out, you can opt-out of targeted advertising by disabling ad targeting cookies
          via the “Manage Cookies” option in the JAFI.AI Privacy Policy. This must be done on each
          device.
        </p>
      </Section>

      <Section title="Manage Mobile App Preferences">
        <p>
          On iOS or Android, you can disable ad targeting SDKs via app settings:
        </p>
        <ul className="list-disc ml-5 mt-2">
          <li>More → Settings → Mobile App Preferences → Targeting → Toggle off</li>
        </ul>
        <p className="mt-2 text-sm">
          This reduces ad personalization but does not reduce the number of ads. Ensure your app is
          updated if you don’t see these options.
        </p>
      </Section>
    </div>
  );
}
