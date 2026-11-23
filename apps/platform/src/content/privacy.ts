// The privacy notice. While `draft` is true the page says so at the top.
// Before the pilot: have every line marked TO CONFIRM checked, set `draft` to
// false and bump PRIVACY_VERSION in packages/auth/src/index.ts.

export const privacyNotice = {
  draft: true,
  title: "Privacy notice",
  // TO CONFIRM: the named data contact the NDPA requires.
  contactEmail: "hello@magnisale.com",
  sections: [
    {
      heading: "What we keep",
      body: [
        "We keep your account details (name and email), your organisation's name, and the company profile you approve.",
        "We record when you agreed to this notice.",
      ],
    },
    {
      heading: "What we delete",
      body: [
        "Files you upload, website pages we read and interview answers are used to prepare suggestions for your profile. We delete them once you have reviewed those suggestions.",
        "Only the values you approve are saved.",
      ],
    },
    {
      heading: "Who can see your profile",
      body: [
        "Your profile belongs to your business. Magnisale staff see it only if you choose to share it with us.",
        // TO CONFIRM: that every AI provider in use is under these terms.
        "We use AI providers to process what you add, only under terms that exclude training on your data.",
      ],
    },
    {
      heading: "Your rights",
      body: [
        // TO CONFIRM: naming the Act, and the 30-day period including backups.
        "We handle your data in line with the Nigeria Data Protection Act.",
        "You can download or delete your whole profile at any time from Settings. Deletion completes within 30 days, backups included.",
      ],
    },
  ],
};
