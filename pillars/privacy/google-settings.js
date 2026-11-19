/* Privacy: 25 Google account and Android settings, what each collects, the exact path on Android and on the web, the safest
   choice and what it breaks (Gemini 4 Neon, privacy_gemini_google-settings_20261119-0917.json, PRI-GEM-08; every row from support.google.com). */
window.PRIVACY_GOOGLE = [
 {
  "n": 1,
  "setting": "Web & App Activity",
  "collects": "Searches and activities on Google products and services (like Search and Maps), associated info (language, referrer, browser/app, device type), location from your device's general area and IP address, ads you click or purchases on advertiser sites, recent on-device searches for apps or contact names, and Assistant interactions.",
  "android_path": "Settings > Google > Manage your Google Account > Data & privacy > History settings > Web & App Activity",
  "web_path": "myaccount.google.com > Data & privacy > History settings > Web & App Activity",
  "safest": "Turn off and delete activity",
  "breaks": "Less personalized experiences across Google services (such as faster searches, more helpful apps, and content recommendations tailored to your saved activity).",
  "url": "https://support.google.com/websearch/answer/54068?hl=en&co=GENIE.Platform%3DAndroid",
  "quote": "Web & App Activity saves your searches and activity from other Google services in your Google Account."
 },
 {
  "n": 2,
  "setting": "Web & App Activity — Include Chrome history and activity from sites, apps, and devices that use Google services",
  "collects": "Activity on sites and apps that partner with Google to show ads, sites and apps that use Google services (including data apps share with Google), synced Chrome browsing history, and Android usage & diagnostics like battery level and system errors.",
  "android_path": "Settings > Google > Manage your Google Account > Data & privacy > History settings > Web & App Activity > uncheck \"Include Chrome history and activity from sites, apps, and devices that use Google services\"",
  "web_path": "myaccount.google.com > Data & privacy > History settings > Web & App Activity > uncheck \"Include Chrome history and activity from sites, apps, and devices that use Google services\"",
  "safest": "Unchecked (Off)",
  "breaks": "Google stops saving Chrome browsing history and third-party site/app/device activity into your Web & App Activity for personalization.",
  "url": "https://support.google.com/websearch/answer/54068?hl=en&co=GENIE.Platform%3DAndroid",
  "quote": "Sites and apps that use Google services, including data that apps share with Google"
 },
 {
  "n": 3,
  "setting": "Web & App Activity — Include voice and audio activity",
  "collects": "Audio recordings from your interactions with Google Search, Assistant, and Maps (including audio from unintended activations and a few seconds before activation on some devices) to develop and improve Google's audio recognition technologies.",
  "android_path": "Settings > Google > Manage your Google account > Data & privacy > History settings > Web & App Activity > uncheck \"Include voice and audio activity\"",
  "web_path": "myaccount.google.com > Data & privacy > History settings > Web & App Activity > uncheck \"Include voice and audio activity\"",
  "safest": "Unchecked (Off)",
  "breaks": "Google continues processing your audio to respond when you speak to Google services, but stops saving recordings to your account or using them to improve voice technologies like Voice Match; previously saved audio is not deleted unless you delete it manually.",
  "url": "https://support.google.com/websearch/answer/6030020?hl=en&co=GENIE.Platform%3DAndroid",
  "quote": "With this optional voice and audio activity setting, you can also save audio recordings with Web & App Activity when you interact with Google Search, Assistant, and Maps."
 },
 {
  "n": 4,
  "setting": "Web & App Activity — Auto-delete",
  "collects": "Retains saved Web & App Activity (searches, Chrome/app activity, and associated location/IP info) in your Google Account until deleted manually or by the auto-delete schedule.",
  "android_path": "Settings > {Username} > Your name > Manage your Google Account > Data & privacy > History settings > Web & App Activity > Auto-delete",
  "web_path": "myaccount.google.com > Data & privacy > History settings > Web & App Activity > Auto-delete",
  "safest": "Auto-delete activity older than 3 months",
  "breaks": "Deleted activity is removed from view and may no longer be used to personalize your Google experience.",
  "url": "https://support.google.com/accounts/answer/465?hl=en&co=GENIE.Platform%3DAndroid",
  "quote": "When you use Google sites, apps, and services, some of your activity is saved in your Google Account."
 },
 {
  "n": 5,
  "setting": "Google Maps Timeline (formerly Location History)",
  "collects": "Regularly saves each signed-in device's precise location (estimated from Wi-Fi, mobile networks, GPS, and sensors) to that device—even when Google apps aren't in use—to record visits and routes, with optional encrypted cloud backup to Google's servers.",
  "android_path": "Google Maps app > profile picture or initial > Your Timeline > More > Location & privacy settings > Timeline is on > Turn off or Turn off and delete activity",
  "web_path": "myaccount.google.com > Data & privacy > History settings > Timeline > Turn off",
  "safest": "Turn off and delete activity",
  "breaks": "Your device stops saving visits and routes to your Timeline map; other location services such as Google Location Services, Location Sharing, and Find Hub are not changed.",
  "url": "https://support.google.com/accounts/answer/14200149?hl=en",
  "quote": "When Timeline is on, even when Google apps aren't in use, your precise device location is regularly saved to your device."
 },
 {
  "n": 6,
  "setting": "Google Maps Timeline — Auto-delete",
  "collects": "Retains saved Google Maps Timeline visits and routes on your device (and in encrypted backups if enabled) for 3 months, 18 months, 36 months, or until manually deleted.",
  "android_path": "Google Maps app > profile picture or initial > Your Timeline > More > Location & privacy settings > Location settings > Auto-delete Timeline",
  "web_path": "myactivity.google.com > Timeline > Auto-delete (note: Maps help page documents the in-app Android path and notes full account Timeline deletion is in My Google Activity)",
  "safest": "Auto-delete Timeline data older than 3 months",
  "breaks": "Timeline data older than the chosen window is permanently deleted and cannot be recovered; turning on Timeline cloud backups requires turning off auto-delete first.",
  "url": "https://support.google.com/maps/answer/6258979?hl=en&co=GENIE.Platform%3DAndroid",
  "quote": "You can choose to automatically delete Timeline data that's older than 3 months, 18 months, or 36 months."
 },
 {
  "n": 7,
  "setting": "YouTube Watch History",
  "collects": "Saves the YouTube videos you watch to your Google Account to make them easy to find and power video recommendations.",
  "android_path": "YouTube app > profile picture > Settings > Manage all history > Controls tab > unselect \"Include the YouTube videos you watch\"",
  "web_path": "myactivity.google.com > YouTube History > Controls > Turn off (or unselect \"Include the YouTube videos you watch\")",
  "safest": "Unselect \"Include the YouTube videos you watch\" (Off / Paused)",
  "breaks": "Videos watched while history is off won't appear in your history, and if you have no significant recent watch history, features like recommendations on the YouTube homepage are removed.",
  "url": "https://support.google.com/youtube/answer/95725?hl=en&co=GENIE.Platform%3DAndroid",
  "quote": "YouTube watch history makes it easy to find videos you recently watched, and, when it's turned on, allows us to give relevant video recommendations."
 },
 {
  "n": 8,
  "setting": "YouTube Search History",
  "collects": "Saves the search queries you enter on YouTube to power search box suggestions and video recommendations.",
  "android_path": "YouTube app > profile picture > Settings > Manage all history > Controls tab > unselect \"Include your searches on YouTube\"",
  "web_path": "myactivity.google.com > YouTube History > Saving your search history > unselect \"Include your searches on YouTube\"",
  "safest": "Unselect \"Include your searches on YouTube\" (Off / Paused)",
  "breaks": "Paused or deleted searches won't influence your YouTube recommendations and past searches won't show as suggestions in the search box.",
  "url": "https://support.google.com/youtube/answer/57711?hl=en&co=GENIE.Platform%3DDesktop",
  "quote": "While your search history is paused, searches you enter won't be saved in your search history."
 },
 {
  "n": 9,
  "setting": "YouTube History — Auto-delete",
  "collects": "Retains YouTube watch and search history (and associated info like location) in My Activity until deleted manually or automatically after 3, 18, or 36 months.",
  "android_path": "Settings > Google > Manage your Google Account > Data & privacy > History settings > YouTube History > Auto-delete",
  "web_path": "myactivity.google.com > My Google Activity > YouTube History > Auto-delete",
  "safest": "Auto-delete activity older than 3 months",
  "breaks": "nothing stated",
  "url": "https://support.google.com/accounts/answer/10400210?hl=en",
  "quote": "My Activity saves data about the things you do across Google services, including associated info like location, to help you visit your past history My Activity settings."
 },
 {
  "n": 10,
  "setting": "Personalized Ads (My Ad Center)",
  "collects": "Uses your My Ad Center choices, Google Account info (provided or estimated age and gender), saved Google Account activity (Search, YouTube, installed Android apps, ad/content interactions, general area), and saved activity from partner sites to personalize ads on Google services and partner sites/apps.",
  "android_path": "Settings > Google > Manage your Google Account > Data & privacy > My Ad Center > Personalized ads > Off (or YouTube app > Account > Settings > Privacy > Google ad settings > Personalized ads > Off)",
  "web_path": "myaccount.google.com > Data & privacy > My Ad Center > Personalized ads > Off",
  "safest": "Off",
  "breaks": "Ads become non-personalized (based on contextual factors like time of day, website topic, current location, or active searches), and your customized ad topics and brands in My Ad Center are deleted.",
  "url": "https://support.google.com/My-Ad-Center-Help/answer/12155656?hl=en&co=GENIE.Platform%3DAndroid",
  "quote": "While you are signed in to your Google Account, My Ad Center controls whether ads are personalized on Google services and partner sites and apps."
 },
 {
  "n": 11,
  "setting": "Partner Ad Settings — Save Data from Partner Sites & Apps",
  "collects": "Saves browsing data from websites and apps that partner with Google to show ads into your Google Account to personalize ads across browsers and devices.",
  "android_path": "Open browser on Android > Partner Ad Settings (via myaccount.google.com > Data & privacy > Partner ad settings) > uncheck \"Also save data in your Google Account from sites and apps that partner with Google\"",
  "web_path": "Partner Ad Settings (myaccount.google.com > Data & privacy > Partner ad settings) > uncheck \"Also save data in your Google Account from sites and apps that partner with Google\"",
  "safest": "Unchecked (Off)",
  "breaks": "Google won't use your Google Account activity and info to personalize ads on partner sites and apps (ads there will be based on general contextual factors).",
  "url": "https://support.google.com/My-Ad-Center-Help/answer/12155656?hl=en&co=GENIE.Platform%3DAndroid",
  "quote": "When you visit sites that partner with Google to show ads, browsing data from partner sites and apps may be saved to your Google Account."
 },
 {
  "n": 12,
  "setting": "My Ad Center — Areas where you've used Google",
  "collects": "Uses Google's estimate of the general area where you've searched or used Google services (saved with Web & App Activity) to personalize ads across all Google sites and apps.",
  "android_path": "Settings > Google > Manage your Google Account > Data & privacy > My Ad Center > Manage Privacy > Activity used to personalize ads > Areas where you've used Google > Use areas to personalize ads > Off",
  "web_path": "My Ad Center (myaccount.google.com > Data & privacy > My Ad Center) > Manage Privacy > Activity used to personalize ads > Areas where you've used Google > Use areas to personalize ads > Off",
  "safest": "Off",
  "breaks": "Ads on Google sites and apps are less locally relevant (for example, searching for coffee may show a coffee shop in a different town); does not turn off personalized recommendations on Google services.",
  "url": "https://support.google.com/My-Ad-Center-Help/answer/12156161?hl=en",
  "quote": "When you use Google services, Google estimates the general area that you're searching from and saves that information with your Web & App activity."
 },
 {
  "n": 13,
  "setting": "Android Ad Privacy — Ad Topics",
  "collects": "Notes topics of interest on your Android device based on the apps you use and shares up to 3 topics at a time with other apps to deliver personalized ads.",
  "android_path": "Settings > Google > All services > Privacy & security > Ads > Ads privacy > Ad topics > Allow ad topics > Off",
  "web_path": "not stated (Android device-only setting)",
  "safest": "Off",
  "breaks": "Android won't share ad topics with apps; you may still see ads, including ads related to those topics.",
  "url": "https://support.google.com/android/answer/13720755?hl=en",
  "quote": "To personalize your ad experience, Android notes your topics of interests based on the apps you use on your device."
 },
 {
  "n": 14,
  "setting": "Third-Party Apps & Services with Access to Your Google Account",
  "collects": "Allows apps from developers other than Google to access basic profile info (name, email, profile picture), view/copy account data (contacts, photos, YouTube playlists, etc.), or edit/create/delete data in Google products like Gmail, Drive, Calendar, Photos, and Contacts.",
  "android_path": "Settings > Google > Manage your Google Account > Security (or Data & privacy) > Linked apps / Third-party apps & services > Access to your Google Account > select app > See details > Remove access",
  "web_path": "myaccount.google.com > Linked apps (myaccount.google.com/connections) > Access to your Google Account > select app > See details > Remove access",
  "safest": "Remove access for any unused or untrusted third-party apps",
  "breaks": "The third-party app can no longer access your Google Account, which may make some features in that app unavailable (you may still need to contact the developer to delete data they already copied).",
  "url": "https://support.google.com/accounts/answer/14012355?hl=en",
  "quote": "Linked apps may request access to some Google products like Gmail, Drive, Calendar, Photos, and Contacts."
 },
 {
  "n": 15,
  "setting": "Sign in with Google (Partner Sign-Ins)",
  "collects": "Links your Google Account to third-party apps for automatic sign-in across platforms and browsers, sharing basic profile information (name, email address, and profile picture).",
  "android_path": "Settings > Google > Manage your Google Account > Security (or Data & privacy) > Linked apps / Third-party apps & services > Sign in with Google > select app > See details > Stop using Sign in with Google",
  "web_path": "myaccount.google.com > Linked apps (myaccount.google.com/connections) > Sign in with Google > select app > See details > Stop using Sign in with Google",
  "safest": "Stop using Sign in with Google for unneeded third-party apps",
  "breaks": "Google stops automatic sign-in to that app; this does not delete your existing data stored on the third-party app.",
  "url": "https://support.google.com/accounts/answer/13533235?hl=en",
  "quote": "To use your Google Account to sign in to apps from developers other than Google, use Sign in with Google."
 },
 {
  "n": 16,
  "setting": "Google Profile Visibility (\"About me\")",
  "collects": "Controls visibility across Google services (like Gmail, Chat, Maps, Play, and YouTube) for personal info including your birthday, gender, employment, personal/work contact info, places lived, and education.",
  "android_path": "Settings > Google > Manage your Google Account > People & sharing > Choose what others see > About me > tap each info type > Only you",
  "web_path": "myaccount.google.com > People & sharing > Choose what others see > About me > select each info type > Only you",
  "safest": "Only you (Private)",
  "breaks": "Other users on Google services cannot view the hidden personal info; your name and profile picture may still be visible where your profile is shown.",
  "url": "https://support.google.com/accounts/answer/6304920?hl=en&co=GENIE.Platform%3DAndroid",
  "quote": "You can make some information on your Google Account private or visible to anyone. That way, you're in control of who views info like your birthday or phone number across Google services."
 },
 {
  "n": 17,
  "setting": "Shared Endorsements in Ads",
  "collects": "Uses your reviews, recommendations, and other relevant activity—along with your Google Account profile name and profile photo—for display in Google products, Google Play, and ads.",
  "android_path": "Settings > {Username} > Your name > Manage your Google Account > People & sharing > Share recommendations in ads > Manage shared endorsements > uncheck the box",
  "web_path": "myaccount.google.com > People & sharing > Share recommendations in ads > Manage shared endorsements > uncheck \"Based upon my activity, Google may show my profile name, profile photo, and activity in shared endorsements in ads.\"",
  "safest": "Unchecked (Off)",
  "breaks": "nothing stated",
  "url": "https://support.google.com/accounts/answer/3403513?hl=en&co=GENIE.Platform%3DAndroid",
  "quote": "Google sometimes displays your reviews, recommendations, and other relevant activity in its products and services. This may include shopping contexts, like Google Play and ads. The profile name and profile photo of your Google Account may appear with that activity."
 },
 {
  "n": 18,
  "setting": "Find Hub (formerly Find My Device) — Find Your Offline Devices",
  "collects": "Stores encrypted recent locations of your Android device with Google and uses Bluetooth to scan for nearby items as part of the crowdsourced Find Hub network.",
  "android_path": "Settings > Google > All Services > Find Hub > Find your offline devices > Off (to disable locating entirely: Settings > Security > Find Hub > Allow device to be located > Off)",
  "web_path": "not stated (Android device-only setting; android.com/find only locates, secures, or erases devices)",
  "safest": "Off (or turn off \"Allow device to be located\" if remote locating is not desired)",
  "breaks": "Your device's encrypted recent locations won't be stored and your device won't participate in the offline finding network; turning off \"Allow device to be located\" prevents remotely ringing, locating, securing, or erasing a lost device.",
  "url": "https://support.google.com/android/answer/3265955?hl=en",
  "quote": "By default, your Android device stores encrypted recent locations with Google and participates in the Find Hub network, a crowdsourced network of Android devices that uses end-to-end encrypted location information to help Android users find their lost devices."
 },
 {
  "n": 19,
  "setting": "Smart Features in Gmail, Chat, and Meet",
  "collects": "Uses your content and activity in Gmail, Chat, and Meet to personalize your experience and improve those smart features.",
  "android_path": "Gmail app > Menu > Settings > select account > General > uncheck \"Smart features\"",
  "web_path": "mail.google.com > Settings > See all settings > General > Smart features > uncheck (not in myaccount.google.com)",
  "safest": "Unchecked (Off)",
  "breaks": "Disables automatic email filtering/categorization (Primary/Social/Promotions), Smart Compose, Smart Reply, and summary cards above emails (travel, package tracking, and more).",
  "url": "https://support.google.com/mail/answer/15604322?hl=en&co=GENIE.Platform%3DAndroid",
  "quote": "When you turn on smart features in Gmail, Chat, and Meet, you agree to let Gmail, Chat and Meet use your content and activity in these products to personalize your experience in those apps."
 },
 {
  "n": 20,
  "setting": "Smart Features in Google Workspace & Other Google Products",
  "collects": "Uses your Google Workspace content and activity (from Gmail, Calendar, Chat, Drive, Meet, Voice, etc.) to personalize your experience across Workspace and in other Google products (such as Maps, Wallet, Gemini, and Search) and to improve those features.",
  "android_path": "Gmail app > Menu > Settings > select account > General > Google Workspace smart features > uncheck \"Smart features in Google Workspace\" and \"Smart features in other Google products\"",
  "web_path": "mail.google.com > Settings > See all settings > General > Google Workspace smart features > uncheck \"Smart features in Google Workspace\" and \"Smart features in other Google products\"",
  "safest": "Unchecked (Off)",
  "breaks": "Disables automatic Calendar events from Gmail, personalized search/Gemini features across Workspace, restaurant reservations and to-go orders in Maps, suggested tickets/loyalty cards in Wallet, and Personal Intelligence in Gemini and Search.",
  "url": "https://support.google.com/mail/answer/15604322?hl=en&co=GENIE.Platform%3DAndroid",
  "quote": "When you turn on smart features in other Google products, you agree to let Google use your Workspace content and activity to personalize your experience in other Google products."
 },
 {
  "n": 21,
  "setting": "Chrome Sync (Save Info in Google Account / History & Tabs)",
  "collects": "Saves Chrome bookmarks, reading list, passwords, payment info, identity/contact/travel info, settings, open tabs, and browsing history to your Google Account across signed-in devices.",
  "android_path": "Chrome app > More > Settings > tap your account name > turn off \"History and tabs\" and choose what to save in your Google Account (or tap Encryption > Use your own passphrase)",
  "web_path": "Chrome desktop > More > Settings > You and Google > Sync and Google services > Manage what you sync > Customize sync (synced data can also be deleted via Google Dashboard)",
  "safest": "Turn off \"History and tabs\" sync (and optionally set a custom sync passphrase under Encryption)",
  "breaks": "Unsynced Chrome data won't appear on other devices; if using a custom passphrase, your feed won't show suggestions based on Chrome browsing, all history won't be saved to your account, and you can't view saved passwords on passwords.google.com.",
  "url": "https://support.google.com/chrome/answer/165139?hl=en&co=GENIE.Platform%3DAndroid",
  "quote": "When you sign in to Chrome, you can save info in your Google Account. You can then use your info on all your devices where you're signed in with the same account."
 },
 {
  "n": 22,
  "setting": "Android Location Accuracy (Google Location Services)",
  "collects": "Periodically collects information about nearby wireless signals (Wi-Fi access points, cellular towers, GPS) and device sensors (accelerometer, barometer, gyroscope) using temporary rotating identifiers to estimate location and contribute to crowdsourced wireless signal locations.",
  "android_path": "Settings > Location > Location Services > Location Accuracy > Improve Location Accuracy > Off",
  "web_path": "not stated (Android device-only setting)",
  "safest": "Off",
  "breaks": "Only GPS and device sensors are used to determine location, which may reduce location availability and accuracy (especially indoors) for apps and services like Google Maps and finding a lost device.",
  "url": "https://support.google.com/android/answer/3467281?hl=en",
  "quote": "When Location Accuracy is on, Google periodically collects information about sensors and wireless signals near you to contribute to crowdsourced wireless signal locations, using randomly-assigned, temporary, rotating identifiers that aren't associated with a specific person or account."
 },
 {
  "n": 23,
  "setting": "Android Usage & Diagnostics",
  "collects": "Sends device telemetry to Google about how you use your Android device and how it's working, including battery level, app usage frequency, and quality/length of mobile, Wi-Fi, and Bluetooth connections (may also be stored in your account if Web & App Activity is on).",
  "android_path": "Settings > Google > More > Usage & diagnostics > Off",
  "web_path": "not stated (Android device-only setting; if stored via Web & App Activity, view/delete in myactivity.google.com)",
  "safest": "Off",
  "breaks": "nothing stated (Google notes your device still receives essential services like new versions of Android, and turning it off does not affect info individual apps collect).",
  "url": "https://support.google.com/android/answer/6078260?hl=en",
  "quote": "If you turn on usage and diagnostics, your device sends info to Google about what's working and not working."
 },
 {
  "n": 24,
  "setting": "Google Photos Face Groups",
  "collects": "Creates numerical face models of faces appearing in your photos (which may be considered biometric data in some jurisdictions) and uses characteristics like timing and clothing to group photos of the same person or pet.",
  "android_path": "Google Photos app > Account profile photo or initials > Google Photos settings > Privacy (or Preferences > Group similar faces) > Face Groups > Off",
  "web_path": "photos.google.com > Settings > Group similar faces > Face Groups > Off (not in myaccount.google.com)",
  "safest": "Off",
  "breaks": "Deletes your face groups, face models used to create them, and face labels you created; disables \"People & pets\" grouping and personalized search/creations based on face labels.",
  "url": "https://support.google.com/photos/answer/6128838?hl=en&co=GENIE.Platform%3DAndroid",
  "quote": "When \"Face Groups\" is on, you let us know that you want models of the faces that appear in your photos to be made. These models may be considered biometric data in some jurisdictions."
 },
 {
  "n": 25,
  "setting": "Gemini Apps History (formerly Gemini Apps Activity)",
  "collects": "Stores your Gemini prompts, conversations, and Gemini Live audio/video/screenshare history in your Google Account (and, when enabled, uses chat content or Live recordings to train generative AI models).",
  "android_path": "Gemini mobile app > Menu > Profile picture or initial > Gemini History > On > Turn off or Turn off and delete history",
  "web_path": "gemini.google.com > Menu > Settings > History > On > Turn off or Turn off and delete history (or myactivity.google.com/product/gemini)",
  "safest": "Turn off and delete history (if kept on, uncheck \"Chat content including text & uploads\" and \"Audio and Gemini Live videos & screenshares\" and set Auto-delete to 3 months)",
  "breaks": "Only Device assistance, Gemini Notebook, Messages, Phone, and WhatsApp connected apps remain available, and chats won't appear in Gemini History; Google still retains conversations with your account for around two months for service operation, feedback, and safety.",
  "url": "https://support.google.com/gemini/answer/13278892?hl=en&co=GENIE.Platform%3DAndroid",
  "quote": "When you are signed in and History is on, Google stores your Gemini history in your Google Account."
 }
];
