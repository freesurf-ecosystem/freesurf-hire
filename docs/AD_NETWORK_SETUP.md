
## Don't hardcode to Google AdMob mediation

To have options like switching out for AppLovin

## Set up Google AdMob

To sign up for Google AdMob and activate its built-in mediation auction system, you need to complete a two-part process: setting up your master Google AdMob account and configuring the third-party bidding partners within your dashboard. [1] 
------------------------------
## Part 1: Setting Up Your AdMob Account

   1. Go to the Portal: Navigate to the official [Google AdMob Sign-up Page](https://admob.google.com/home/). [2, 3, 4] 
   2. Link a Google Account: Sign in using an existing Google Account. It is highly recommended to use a clean, dedicated Google Account tied to your business or app domain (yourname@yourdomain.com). [5] 
   3. Configure AdSense/Google Ads: AdMob requires an underlying financial payment rail. If you don't already have an active Google AdSense account, AdMob will walk you through a quick process to create an AdSense billing profile. You must enter your legal tax information and address so Google can send you physical verification pins and tax forms. [6] 
   4. Register Your App:
   * Inside the AdMob dashboard, click Apps in the sidebar, then click Add App.
      * Select your platform (iOS or Android).
      * Under "Is the app listed on a supported app store?", select No (since your prototype is still in development). You can link your official App Store or Google Play Store URLs later once the app is approved and live. [7, 8, 9, 10, 11] 
   
------------------------------
## Part 2: Activating Third-Party Mediation & Bidding
Once your app is registered in AdMob, you must explicitly enable the auction system so networks like AppLovin can bid against Google for your ad slots:

   1. Create an Ad Unit: Go to your app's dashboard within AdMob, click Ad Units, and click Add Ad Unit. Select your desired format (e.g., Interstitial or Rewarded Video). Save the unique Ad unit ID string that Google generates. [12, 13, 14, 15, 16] 
   2. Navigate to Mediation: Click Mediation in the main left-hand sidebar menu, then click Create Mediation Group. [17, 18, 19] 
   3. Set the Parameters:
   * Select the platform (iOS or Android) and the exact Ad Unit format you created in Step 1.
      * Name your mediation group (e.g., Ov_AI_Android_Interstitials).
      * Target your geography (select "All countries and territories" or restrict it to "United States" depending on your launch market). [20, 21, 22, 23, 24] 
   4. Add Bidding Sources: Scroll down to the Bidding section of the mediation group page and click Add Ad Network. [25] 
   5. Sign the Network Contracts:
   * A dropdown list of programmatic exchanges (including AppLovin, Meta Audience Network, Liftoff, and InMobi) will appear.
      * Select AppLovin. AdMob will display a digital terms-of-service link. Click it to authorize Google to pull bids from AppLovin automatically.
      * Note: You will also need to create a free developer account on AppLovin's website to retrieve an API Key/SDK Key and paste it into this AdMob field to legally link the two company accounts. [26, 27] 
   
------------------------------
## Part 3: What to Do Next in Your Code
After configuring the dashboard, AdMob will give you two specific text strings that your mobile app code needs to request ads:

* The Application ID: Looks like ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX. This goes into your master app configuration file (your Android AndroidManifest.xml or your iOS Info.plist). It identifies your overall project to Google. [28, 29, 30, 31, 32] 
* The Ad Unit ID: Looks like ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX. This is placed directly inside your frontend script wherever you trigger the transcription "whiteboard" loading overlay. [33] 

Google will review your account information and approve your ad serving within 24 to 48 hours. While in development, always use Google's official "Test Ad Unit IDs" in your code. Never click or view live ads on your own test devices, as Google's automated systems will instantly flag it as invalid traffic and freeze your account. [34, 35, 36, 37, 38] 
If you are ready to implement this, let me know if you would like to:

* Get the official Google Test Ad IDs to plug safely into your initial app build.
* See the Android xml or iOS plist blocks needed to declare your new Application ID.
* Review how to write a basic Python script that pairs your ad load trigger with your RunPod server request!


[1] [https://stage.gamemaker.io](https://stage.gamemaker.io/help/articles/ios-and-android-google-mobile-ads-admob-setup)
[2] [https://resocoder.com](https://resocoder.com/2021/09/04/flutter-admob-monetization-banner-and-interstitial-ads/)
[3] [https://www.youtube.com](https://www.youtube.com/watch?v=mH2onbax6dA)
[4] [https://pubscale.com](https://pubscale.com/blog/admob-monetization-guide)
[5] [https://admob.google.com](https://admob.google.com/home/bidding/how-to-set-up-bidding/)
[6] [https://www.playwire.com](https://www.playwire.com/blog/what-is-admob-a-publishers-complete-platform-overview)
[7] [https://ads.yandex.com](https://ads.yandex.com/helpcenter/en/monetization/yandex-mediation/setup)
[8] [https://docs.unity.com](https://docs.unity.com/grow/levelplay/sdk/ios/networks/guides/google-bidding)
[9] [https://www.youtube.com](https://www.youtube.com/watch?v=3xQgzk9gqTk)
[10] [https://www.goodbarber.com](https://www.goodbarber.com/help/connect-external-ad-networks-r45/monetize-your-native-apps-with-admob-a50/)
[11] [https://codelabs.developers.google.com](https://codelabs.developers.google.com/codelabs/admob-ads-in-flutter)
[12] [https://www.youtube.com](https://www.youtube.com/watch?v=l6HiBn735lc)
[13] [https://docs.chartboost.com](https://docs.chartboost.com/en/mediation/network-guides/admob-google-bidding/)
[14] [https://www.youtube.com](https://www.youtube.com/watch?v=6qcgJp_vX_8)
[15] [https://ads.yandex.com](https://ads.yandex.com/helpcenter/en/monetization/yandex-mediation/setup)
[16] [https://developers.google.com](https://developers.google.com/admob/flutter/mediation/ironsource)
[17] [https://www.youtube.com](https://www.youtube.com/watch?v=6qcgJp_vX_8)
[18] [https://forums.developer.huawei.com](https://forums.developer.huawei.com/forumPortal/en/topic/0201508497297330009)
[19] [https://support.start.io](https://support.start.io/hc/en-us/articles/360005921854-AdMob-iOS-Adapter)
[20] [https://www.bigossp.com](https://www.bigossp.com/guide/sdk/android/mediation/admobAdapter)
[21] [https://www.goodbarber.com](https://www.goodbarber.com/help/connect-external-ad-networks-r45/monetize-your-native-apps-with-meta-audience-network-a411/)
[22] [https://www.youtube.com](https://www.youtube.com/watch?v=LtEJuyad7dY)
[23] [https://www.youtube.com](https://www.youtube.com/watch?v=6qcgJp_vX_8)
[24] [https://support.google.com](https://support.google.com/admob/answer/6231370?hl=en)
[25] [https://developers.google.com](https://developers.google.com/admob/android/mediation/meta)
[26] [https://www.youtube.com](https://www.youtube.com/watch?v=0s737y8S3TQ)
[27] [https://developers.google.com](https://developers.google.com/admob/android/mediation/applovin)
[28] [https://docs.airnativeextensions.com](https://docs.airnativeextensions.com/docs/adverts/platform/admob/)
[29] [https://medium.com](https://medium.com/coderefer/admob-android-ads-integration-using-android-studio-ff458f5a99ce)
[30] [https://www.youtube.com](https://www.youtube.com/watch?v=Bka0T3806qo)
[31] [https://www.playwire.com](https://www.playwire.com/admob-guide-mobile-app-monetization-mastery-playwire)
[32] [https://www.youtube.com](https://www.youtube.com/watch?v=F2Ek0pA4Al4)
[33] [https://setup.despia.com](https://setup.despia.com/native-features/admob/rewarded-ads)
[34] [https://www.youtube.com](https://www.youtube.com/watch?v=ItYU_yHJF_U)
[35] [https://medium.com](https://medium.com/@raylabs/step-by-step-guide-setting-up-google-admob-in-your-android-app-beginner-friendly-7349109018c6)
[36] [https://support.google.com](https://support.google.com/admob/answer/2753860?hl=en)
[37] [https://docs.unity.com](https://docs.unity.com/en-us/grow/ads/process-overview)
[38] [https://developers.google.com](https://developers.google.com/admob/flutter/test-ads)


## One main account, different app id's

You can manage all of these apps under a single master brand account on both platforms. However, you must separate the technical components inside that account to avoid massive financial and compliance risks.
------------------------------
## 1. How the Architecture Works
You only need to submit one company application to set up your master publisher account with Google AdMob or AppLovin MAX. Once your main account is approved, the configuration follows a specific structure:

* One Dashboard: You manage everything from a single console.
* Unique App Profiles: Within the dashboard, you must register every app individually (e.g., App A - Fitness, App B - Finance).
* Unique Ad Unit IDs: You must generate unique code keys for each placement inside each separate app.

------------------------------
## 2. Why Sharing a Single "Ad Key" Across Apps is Dangerous
Technically, you could paste the exact same Ad Unit ID into all of your different apps, but doing so creates critical operational failures:

* The "Ban" Chain Reaction: If one of your apps violates a policy (e.g., accidental clicks on the Fitness app) and gets flagged, the ad network will block that specific Ad ID. If all your apps share that ID, ad serving dies instantly across your entire portfolio.
* Algorithmic Ruin: Ad networks use machine learning to match ads to your specific audience. Mixing user data from completely different niches (like gaming, finance, and fitness) into one ID breaks the targeting logic. This lowers your eCPM (payout per 1,000 views).
* Blinded Analytics: Your reporting dashboard will merge all data together. You will have no way to track which app is actually generating revenue or which focus is underperforming.

------------------------------
## 3. Step-by-Step Implementation Guide
Follow this sequence to set your brand up correctly:

   1. Register the Master Account: Sign up your business entity on AdMob or AppLovin.
   2. Add Each App Separately: Go to the "Apps" menu and click "Add App" for every unique focus product you build.
   3. Generate Dedicated Ad Units: Create specific banners or interstitial keys inside the respective app profile. Label them clearly (e.g., brand_fitness_banner_01, brand_finance_interstitial_01).
   4. Consolidate Your app-ads.txt: Since all these apps belong to your brand, ensure they all link back to your primary company website domain. Add your unique Publisher ID code to that single app-ads.txt file hosted on your site to authorize ad delivery securely across all apps.

------------------------------
If you want to map this out perfectly, let me know:

* How many different apps are in your group?
* Are they built for iOS, Android, or both?
* What types of ads (banners, rewarded videos, interstitials) are you planning to use?

I can give you a precise breakdown of how to structure your ad placement architecture.

*with google.com/ai*

# Ad diagnostics

