/* CON-GEM-03 (Claude, 2026-11-19): what happens to each account when its owner dies, from Gemini's
   continuity_gemini_legacy-policies_20261117-1735.json (25 services), accepted by Muse's recheck 8/10
   (continuity_muse_legacy-policies-recheck_20261118-1615.md: all seven named defects fixed, Coinbase quote now verbatim).
   At integration: Ally's 'equal-share' removed (not on its page); Amex flagged (page documents no Estate Services process);
   TikTok, Vanguard and Robinhood marked unchecked (the second read's page fetch was rate-limited); Muse's HUB-MUS-05 (2026-11-25) cleared TikTok and corrected Vanguard and Robinhood to their pages. Gemini's later 20261118-1940
   version swaps LinkedIn and the Apple Activation Lock row for Instagram and X; it is with Muse's check (HUB-MUS-03).
   window.CONTINUITY_POLICIES. Policies only: nothing here asks for or stores a password.
   Rows 26-27 (2026-11-19): CON-GEM-05, Gemini 4 Neon continuity_gemini_legacy-two_20261119-0914.json (Capital One 360 Performance Savings POD/joint, FDIC six-month grace rule 12 CFR 330.3(j)). */
window.CONTINUITY_POLICIES = [
 {
  "n": 1,
  "service": "Google Account (Gmail, Drive, Photos, YouTube)",
  "feature": "Inactive Account Manager",
  "set_up_now": "Choose inactivity timeout (3-18 months), add up to 10 trusted contacts, select which data they can download, and optionally auto-delete account.",
  "after_death": "If Inactive Account Manager was set, contacts receive a download link after timeout; otherwise family submits death certificate and ID via Google's deceased user form.",
  "url": "https://support.google.com/accounts/answer/3036546?hl=en",
  "quote": "Inactive Account Manager is a way for users to share parts of their account data or notify someone if they've been inactive for a certain period of time."
 },
 {
  "n": 2,
  "service": "Apple Account (iCloud, Photos, Notes, Device Activation Lock)",
  "feature": "Legacy Contact",
  "set_up_now": "In Settings > Sign-In & Security > Legacy Contact, designate one or more contacts and print or share their Access Key.",
  "after_death": "Legacy Contact submits the Access Key and death certificate to gain temporary access to iCloud data and automatically remove Activation Lock on devices.",
  "url": "https://support.apple.com/en-us/102431",
  "quote": "Legacy Contact is the easiest, most secure way that Apple users can give someone they trust access to certain data they stored in their Apple Account after they pass away."
 },
 {
  "n": 3,
  "service": "Microsoft Account (OneDrive, Outlook.com)",
  "feature": "OneDrive Digital Legacy / Next-of-Kin Request",
  "set_up_now": "Generate a Digital Legacy access code in OneDrive settings and share it with your trusted contact, or document credentials securely.",
  "after_death": "Trusted contact enters the Digital Legacy code and waits 72 hours for access; without credentials or code, accounts close automatically after 2 years of inactivity.",
  "url": "https://support.microsoft.com/en-us/onedrive/preserve-your-digital-legacy-with-onedrive",
  "quote": "Go to Digital legacy and select Request access. Enter the code that has been shared or provided and wait 72 hours."
 },
 {
  "n": 4,
  "service": "GitHub",
  "feature": "Account Successor",
  "set_up_now": "In GitHub Settings > Account > Successor settings, name a GitHub user as your account successor.",
  "after_death": "Appointed successor can manage or transfer your public repositories after submitting a death certificate (7-day wait) or obituary (21-day wait).",
  "url": "https://docs.github.com/en/site-policy/other-site-policies/github-deceased-user-policy",
  "quote": "An appointed successor can manage your public repositories after presenting a death certificate then waiting for 7 days or presenting an obituary then waiting for 21 days."
 },
 {
  "n": 5,
  "service": "Facebook (Meta)",
  "feature": "Legacy Contact & Memorialization Settings",
  "set_up_now": "In Settings > Memorialization Settings, appoint a Legacy Contact (and optionally allow data download) or choose permanent deletion after death.",
  "after_death": "Account is memorialized with 'Remembering' badge; Legacy Contact can pin a tribute post, update profile/cover photos, and respond to friend requests, but cannot read DMs.",
  "url": "https://about.fb.com/news/2015/02/adding-a-legacy-contact/",
  "quote": "Once someone lets us know that a person has passed away, we will memorialize the account and the legacy contact will be able to: Write a post to display at the top of the memorialized Timeline"
 },
 {
  "n": 6,
  "service": "Pinterest",
  "feature": "Delete a Deceased Person's Account (No Memorialization)",
  "set_up_now": "No legacy setting exists; record your Pinterest username in your estate inventory so family can identify the account, and download anything you want kept while you can.",
  "after_death": "A family member contacts Pinterest with verification such as an obituary or death certificate; Pinterest deletes the account permanently and will not give out any personal or login information.",
  "url": "https://help.pinterest.com/en-gb/article/deactivate-or-close-your-account",
  "quote": "We can delete a deceased family member's account if you get in touch with us and provide verification, such as an obituary or death certificate."
 },
 {
  "n": 7,
  "service": "LastPass",
  "feature": "Emergency Access (Trusted Contact)",
  "set_up_now": "In your vault, select Emergency access > People I Trust, invite another LastPass user, and set a wait time (Premium or Families feature).",
  "after_death": "Your trusted contact requests emergency access from their own LastPass vault; if you do not deny the request within the wait time you set, they are automatically granted view access to your vault items.",
  "url": "https://support.lastpass.com/s/document-item?bundleId=lastpass&topicId=LastPass%2Ft_request_emerg_access.html&_LANG=enus",
  "quote": "If the LastPass account owner does not deny your request within this period, you'll be granted access automatically once the wait time is up."
 },
 {
  "n": 8,
  "service": "LinkedIn",
  "feature": "Memorialize or Close Profile",
  "set_up_now": "Keep your profile URL and primary email recorded in your continuity plan.",
  "after_death": "Anyone can report a member deceased to memorialize the profile (locking access), while authorized representatives can request full closure and data deletion (up to 30 days).",
  "url": "https://www.swiftprobate.com/blog/close-social-media-accounts-deceased",
  "quote": "Report the member as deceased (no special authority required) and LinkedIn will memorialize the profile."
 },
 {
  "n": 9,
  "service": "Discord",
  "feature": "Account Deletion Request (No Memorialization/Transfer)",
  "set_up_now": "Export important server/DM records and document your Discord username and registered email.",
  "after_death": "Next of kin submits death certificate, photo ID, proof of relationship, and explicit deletion statement; Discord does not transfer or memorialize accounts and deletes inactive accounts after 2+ years.",
  "url": "https://support.discord.com/hc/en-us/articles/19872987802263--Deceased-or-Incapacitated-Users",
  "quote": "We do not currently have a feature to memorialize or transfer accounts."
 },
 {
  "n": 10,
  "service": "Dropbox",
  "feature": "Court-Ordered Estate Access",
  "set_up_now": "Keep critical files synced locally on a trusted computer or shared folder with your partner/executor.",
  "after_death": "If local synced files are unavailable, the requester must submit a valid court order compelling Dropbox to release files alongside proof of death and government ID.",
  "url": "https://help.dropbox.com/account-settings/access-account-of-someone-who-passed-away",
  "quote": "A valid court order establishing that it was the deceased person's intent that you have access to the files in their account after the person passed away, and that Dropbox is compelled by law to provide the deceased person's files to you."
 },
 {
  "n": 11,
  "service": "Bitwarden",
  "feature": "Emergency Access (Trusted Contact)",
  "set_up_now": "Add a trusted Bitwarden user under Settings > Emergency Access, choose View or Takeover permission, and set a wait time (e.g., 7 days).",
  "after_death": "Trusted contact requests emergency access; if the owner does not decline before the wait time expires, access is automatically granted.",
  "url": "https://bitwarden.com/help/emergency-access/",
  "quote": "The account holder adds a trusted contact for their account before an emergency arises. When needed, the trusted contact requests access to the account. The request is approved by the account holder or after the wait time expires."
 },
 {
  "n": 12,
  "service": "1Password",
  "feature": "Emergency Kit & Family Organizer Recovery",
  "set_up_now": "Print and store your Emergency Kit (Secret Key + Master Password) in a physical safe, and appoint a second Family Organizer.",
  "after_death": "1Password cannot reset master passwords or Secret Keys; family recovers access only via the stored Emergency Kit or another Family Organizer.",
  "url": "https://support.1password.com/family-recovery-plan/",
  "quote": "We have no access to your account passwords or Secret Keys, so we can't reset or recover them for you."
 },
 {
  "n": 13,
  "service": "PayPal",
  "feature": "Deceased Account Closure & Balance Disbursement",
  "set_up_now": "Keep balance minimal and document primary PayPal email in your asset list.",
  "after_death": "Executor sends cover sheet, death certificate, photo ID, and will/probate letters; PayPal closes the account and issues a check in the deceased's name or transfers to linked bank.",
  "url": "https://www.paypal.com/us/cshelp/article/how-do-i-close-the-paypal-account-of-a-deceased-relative-help220",
  "quote": "We do not change ownership of the funds and must issue the check in the name of the deceased account holder."
 },
 {
  "n": 14,
  "service": "Coinbase",
  "feature": "Executor Services (No Direct Individual Beneficiary)",
  "set_up_now": "Include your Coinbase holdings in your formal will or estate plan, as Coinbase does not support naming a beneficiary directly on individual accounts.",
  "after_death": "Executor signs into or creates a Coinbase account, opens the Executor Services form, and submits the death certificate, probate documents (or Small Estate Affidavit), photo ID, and signed transfer letter.",
  "url": "https://help.coinbase.com/coinbase/managing-my-account/other/how-do-i-gain-access-to-a-deceased-family-members-coinbase-account",
  "quote": "Coinbase doesn't currently support naming a beneficiary for individual accounts. Estate planning documents or state intestate laws dictate the ownership transfer of a Coinbase account."
 },
 {
  "n": 15,
  "service": "Chase Bank",
  "feature": "POD Beneficiary, JTWROS, and Estate Accounts",
  "set_up_now": "Add a Payable-on-Death (POD) beneficiary or title joint accounts with right of survivorship to bypass probate.",
  "after_death": "Surviving joint owners or POD beneficiaries claim funds with a death certificate and ID; sole accounts without beneficiaries require court-appointed executor letters to open an Estate Account.",
  "url": "https://www.chase.com/personal/trust-estate-other-accounts/estate-account",
  "quote": "An estate account can be opened by the court-appointed executor, administrator, or personal representative of the estate."
 },
 {
  "n": 16,
  "service": "Bank of America",
  "feature": "Estate Services & Federal Benefit Reclamation Review",
  "set_up_now": "Designate POD beneficiaries on deposit accounts and keep estate contact records updated.",
  "after_death": "Notify Estate Services; accounts receiving federal benefits undergo a reclamation review before remaining funds are disbursed or closed.",
  "url": "https://www.bankofamerica.com/published-docs/subpoena-services/estate-services-resource-guide.pdf",
  "quote": "If a deceased customer was receiving federal benefit payments to their account, the account is subject to a reclamation review for paid federal benefits after date of death."
 },
 {
  "n": 17,
  "service": "Wells Fargo",
  "feature": "Estate Care Center (JTWROS, POD/TOD, Probate / Small Estate Affidavit)",
  "set_up_now": "Add Payable-on-Death (POD) / Transfer-on-Death (TOD) beneficiaries or joint owners with right of survivorship (JTWROS) to avoid probate on sole accounts.",
  "after_death": "JTWROS assets belong to the surviving party; POD/TOD assets transfer to named beneficiaries; sole accounts without beneficiaries require a death certificate plus probate appointment papers, a small estate affidavit, or a court order.",
  "url": "https://www.wellsfargo.com/help/estate-care-center/",
  "quote": "When one party dies, the survivor owns all remaining assets in the account."
 },
 {
  "n": 18,
  "service": "Ally Bank",
  "feature": "Payable on Death (POD) Beneficiaries",
  "set_up_now": "Designate Payable on Death (POD) beneficiaries online in your Ally Bank profile (checking/savings/CD accounts have no primary/contingent split; IRAs support primary and secondary beneficiaries).",
  "after_death": "Notify Ally at 1-877-247-2559; funds left in the account are payable to the designated beneficiary when the account owner passes away, while sole accounts without a beneficiary enter estate administration.",
  "url": "https://www.ally.com/help/bank/beneficiaries/",
  "quote": "Any funds left in the account are payable to the designated beneficiary when the account owner passes away.",
  "corrected": "'equal-share' removed: not on the cited page (second read)."
 },
 {
  "n": 19,
  "service": "TikTok",
  "feature": "Legacy Contact & Memorialization (Account Legacy)",
  "set_up_now": "If you are 18 or older, go to Settings and privacy > Account > Account legacy to add one legacy contact (must be a TikTok friend you follow back) and set their permissions, or choose Delete after death.",
  "after_death": "A family member or legal guardian requests memorialization or deletion with proof of death and relationship; a memorialized account stays visible but allows no logins, new posts, or direct messages.",
  "url": "https://support.tiktok.com/fr/account-and-privacy/account-information/managing-tiktok-accounts-after-death",
  "quote": "If a TikTok account owner has passed away, our policy allows us to update the account status to either memorialize or delete it.",
  "corrected": "Second read (Muse, 2026-11-25): every field agrees with TikTok's article."
 },
 {
  "n": 20,
  "service": "Fidelity Investments",
  "feature": "IRA & TOD Beneficiary Designations",
  "set_up_now": "Designate primary and contingent beneficiaries on all retirement and non-retirement TOD accounts.",
  "after_death": "Assets pass directly to named beneficiaries outside the probate process upon submission of death certificate and claim forms.",
  "url": "https://www.fidelity.com/learning-center/smart-money/what-is-a-beneficiary",
  "quote": "With properly designated beneficiaries, the relevant assets can pass to intended beneficiaries in an orderly manner outside of the probate process."
 },
 {
  "n": 21,
  "service": "Charles Schwab",
  "feature": "Schwab Estate Services (877-566-2284)",
  "set_up_now": "Add designated beneficiaries on Schwab brokerage and retirement accounts so assets can transfer directly.",
  "after_death": "Notify Schwab Estate Services with the decedent's name and SSN; Schwab secures the accounts, verifies the death certificate (typically within 5 business days), and completes asset transfers in a few weeks.",
  "url": "https://www.schwab.com/life-events/losing-a-loved-one",
  "quote": "Most transfers are completed in a few weeks"
 },
 {
  "n": 22,
  "service": "Vanguard",
  "feature": "Primary and contingent beneficiaries",
  "set_up_now": "Name a primary and a contingent beneficiary on each account.",
  "after_death": "The cited page does not describe the process after a death: call Vanguard and ask.",
  "url": "https://investor.vanguard.com/investor-resources-education/beneficiaries",
  "quote": null,
  "corrected": "Second read (Muse, 2026-11-25): the quoted sentence and the TOD and 10-year-rule claims are not on the cited page, which covers primary and contingent beneficiaries only. Rewritten to what the page says; re-sourcing is with Gemini."
 },
 {
  "n": 23,
  "service": "Robinhood",
  "feature": "The Estates form",
  "set_up_now": "Keep the account listed in the vault; the cited page covers what survivors do, not set-up.",
  "after_death": "Send the Estates form with the death certificate and a government-issued ID; Robinhood asks for any other document after its first review.",
  "url": "https://robinhood.com/us/en/support/articles/losing-loved-one/",
  "quote": "Don't send copies of wills, trusts, or other estate planning documents. If a specific document is required, we'll request it after our initial review.",
  "corrected": "Second read (Muse, 2026-11-25): the old quote and the freeze and TOD claims are not on the page; the page says the opposite about estate documents. Rewritten to what it says."
 },
 {
  "n": 24,
  "service": "American Express",
  "feature": "Estate Debt Settlement & Deceased Cardmember Notification",
  "set_up_now": "Document Amex card accounts and separate authorized users from joint account holders.",
  "after_death": "Notify Amex Estate Services; estate assets settle valid balances, and family members are not personally liable for sole-cardmember debt if the estate is insolvent.",
  "url": "https://www.americanexpress.com/en-us/credit-cards/credit-intel/what-happens-to-debt-when-you-die/",
  "quote": "In general, your family members are not required to pay a deceased relative's debts from their own money unless specific exceptions apply.",
  "note": "The cited page is a general Amex explainer; it does not document an Estate Services process, so ask Amex for theirs (second read)."
 },
 {
  "n": 25,
  "service": "Apple Account (Device Activation Lock Removal)",
  "feature": "Automatic Activation Lock Removal on Legacy/Deletion Approval",
  "set_up_now": "Designate a Legacy Contact in iOS Settings > Sign-In & Security > Legacy Contact and store the Access Key with your estate documents.",
  "after_death": "Once Apple approves a Legacy Contact request or deceased-account deletion request with a death certificate, Activation Lock is automatically removed from the deceased owner's devices.",
  "url": "https://support.apple.com/en-us/102431",
  "quote": "After your Legacy Contact request or account deletion request is completed, Activation Lock is automatically removed."
 },
 {
  "n": 26,
  "service": "Capital One (360 Performance Savings)",
  "feature": "Payable on Death (POD) Beneficiaries & Joint Right of Survivorship (360 Performance Savings)",
  "set_up_now": "Sign in at capitalone.com, select your 360 Performance Savings account, and open Account Services & Settings > Manage Beneficiaries to designate up to 10 individual POD beneficiaries (valid Tax ID, date of birth, and U.S. or eligible territory physical address required), or hold the account jointly with right of survivorship.",
  "after_death": "Notify Capital One promptly—until Capital One knows of the death and has a reasonable opportunity to act, it may continue accepting deposits and transaction instructions. On a joint account, funds belong only to the surviving owner (except certain retirement benefits like Social Security). Upon the death of all owners on a POD account, Capital One distributes the remaining funds in equal shares to living POD beneficiaries (or to a statutory or court-appointed custodian if a beneficiary is under 18), subject to any amounts owed to Capital One.",
  "url": "https://www.capitalone.com/bank/disclosures/savings-accounts/online-performance-savings-account/",
  "quote": "Upon the death of all owners, we will distribute the then remaining funds to such of the beneficiaries as shall be then-living, in equal shares, subject to our right to charge the account for any amount a deceased owner, co-owner, or POD beneficiary owes us; if any beneficiary is under the age of 18 years at the time he would be entitled to receive property under the terms of the previous provision, we will pay such person's share to any person who is the statutory or court-appointed custodian for the benefit of such person."
 },
 {
  "n": 27,
  "service": "FDIC (Federal Deposit Insurance Corporation)",
  "feature": "Six-Month Deposit Insurance Grace Period After Death of an Account Owner (12 C.F.R. § 330.3(j))",
  "set_up_now": "Review account titling, joint ownership, and POD/trust beneficiary designations across all FDIC-insured institutions so surviving family members know which balances could exceed $250,000 per single-ownership category if a co-owner dies.",
  "after_death": "Survivors have a six-month grace period from the owner's death during which the FDIC insures the deceased owner's accounts as if still alive (unless accounts are restructured/retitled earlier or applying the grace period would reduce coverage). Before the six months expire, restructure or retitle accounts so balances remain within FDIC limits under the actual new ownership category; note that no grace period applies upon the death of a beneficiary.",
  "url": "https://www.fdic.gov/financial-institution-employees-guide-deposit-insurance/death-account-owner",
  "quote": "Upon the death of an accountholder, the FDIC will insure the deceased owner's accounts as if he or she were still alive for six months after his or her death. After the lapse of the six-month grace period, the deposit insurance coverage of the account will depend on the ownership category in which the accounts are now held."
 }
];
