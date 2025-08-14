const express = require('express');
const router = express.Router();

// Translation data for all supported languages
const translations = {
    en: {
        // Navigation
        home: "Home",
        findLawyers: "Find Lawyers",
        legalResources: "Legal Resources",
        eLearning: "E-Learning",
        community: "Community",
        login: "Login",
        logout: "Logout",
        welcome: "Welcome",
        
        // Hero Section
        heroTitle: "Legal Rights Are Not a Privilege, But a Support",
        heroSubtitle: "JUSTNEST bridges the gap between rural communities and legal services through accessible digital solutions.",
        postLegalIssue: "Post Your Legal Issue",
        findLawyer: "Find a Lawyer",
        educationalVideos: "Educational Videos",
        
        // Features
        verifiedLawyers: "Verified Lawyers",
        verifiedLawyersDesc: "Connect with verified legal professionals nearby who can address your specific legal concerns.",
        studentResources: "Student Resources",
        studentResourcesDesc: "Access educational videos, quizzes, and materials that help youth understand basic legal concepts.",
        seniorSupport: "Senior Citizen Support",
        seniorSupportDesc: "Specialized resources for elderly citizens to understand their rights and available legal protections.",
        womensSafety: "Women's Safety",
        womensSafetyDesc: "Safe space for women to report domestic violence issues and get confidential legal assistance.",
        
        // Services
        ourServices: "Our Services",
        
        // AI Updates
        stayUpdated: "Stay Updated with Legal News",
        aiUpdatesDesc: "Our AI-powered system delivers the latest legal updates, simplified for everyone to understand, powered by Azure OpenAI.",
        todaysUpdates: "Today's Legal Updates",
        newRuralProperty: "New Rural Property Rights Amendment",
        newRuralPropertyDesc: "The government has announced new amendments to protect rural property rights. This affects land ownership documentation in villages.",
        womensSafetyAct: "Women's Safety Act Updates",
        womensSafetyActDesc: "New provisions added to enhance women's safety in rural areas with faster legal procedures and support systems.",
        freeLegalAid: "Free Legal Aid Camps",
        freeLegalAidDesc: "Upcoming free legal aid camps in rural districts. Check schedules and locations for consultations.",
        viewAllUpdates: "View All Updates",
        
        // Voice Support
        voiceAccessible: "Voice-Accessible Legal Support",
        voiceDesc: "For users with limited literacy or who prefer voice interaction, our system supports speech-to-text and text-to-speech in multiple Indian languages.",
        speakLegalIssue: "Speak Your Legal Issue",
        selectLanguage: "Select Language",
        startSpeaking: "Start Speaking",
        listening: "Listening...",
        recognizedText: "Recognized Text",
        recognizedTextPlaceholder: "Your speech will appear here...",
        listenLegalInfo: "Listen to Legal Information",
        textToSpeak: "Text to Speak",
        textToSpeakPlaceholder: "Enter text you want to hear spoken",
        speak: "Speak",
        stop: "Stop",
        readSample: "Read sample legal rights",
        browserSupport: "Works best in Chrome on desktop. Mobile support varies by browser.",
        
        // How It Works
        howItWorks: "How JUSTNEST Works",
        step1Title: "Register or Post Anonymously",
        step1Desc: "Create an account or post your legal concerns anonymously in any language you prefer.",
        step2Title: "Get Connected",
        step2Desc: "Our system matches you with appropriate legal resources or verified lawyers based on your needs.",
        step3Title: "Receive Support",
        step3Desc: "Get guidance, educational resources, or direct legal support tailored to your specific situation.",
        
        // Testimonials
        successStories: "Success Stories",
        
        // Download App
        takeJustnest: "Take JUSTNEST With You",
        downloadDesc: "Download our mobile app to access legal support anywhere, anytime. Works offline for areas with limited connectivity.",
        downloadAppStore: "Download on the App Store",
        getGooglePlay: "Get it on Google Play",
        
        // Footer
        justnestDesc: "Legal rights should be accessible to everyone, regardless of location, language, or digital literacy.",
        quickLinks: "Quick Links",
        aboutUs: "About Us",
        services: "Services",
        findLawyers: "Find Lawyers",
        educationalResources: "Educational Resources",
        legalResources: "Legal Resources",
        womensRights: "Women's Rights",
        landRights: "Land Rights",
        laborLaws: "Labor Laws",
        consumerProtection: "Consumer Protection",
        contactUs: "Contact Us",
        helpline: "Helpline: 1800-JUSTNEST",
        supportEmail: "support@justnest.org",
        copyright: "© 2025 JUSTNEST. All rights reserved.",
        
        // Legal Issue Form
        postLegalProblem: "Post Your Legal Problem",
        problemCategory: "Problem Category",
        selectCategory: "Select Category",
        property: "Property/Land Rights",
        family: "Family Law",
        consumer: "Consumer Protection",
        labor: "Labor Rights",
        domestic: "Domestic Violence",
        other: "Other",
        describeProblem: "Describe Your Problem",
        describeProblemPlaceholder: "Explain your legal issue in detail...",
        postAnonymously: "Post anonymously",
        postProblem: "Post Problem",
        
        // Statistics
        legalStatistics: "JUSTNEST Legal Statistics",
        currentStatus: "Current Status of India's Justice System",
        totalCasesResolved: "Total Cases Resolved",
        activeCases: "Active Cases",
        registeredUsers: "Registered Users",
        verifiedLawyers: "Verified Lawyers",
        avgResolutionTime: "Avg Resolution Time (days)",
        successRate: "Success Rate (%)",
        caseTypes: "Case Types (Distribution)",
        propertyDisputes: "Property Disputes (30%)",
        familyCases: "Family Cases (20%)",
        criminalCases: "Criminal Cases (20%)",
        laborDisputes: "Labor Disputes (20%)",
        others: "Others (10%)",
        stateWiseStatus: "State-wise Case Status",
        recentUpdates: "Recent Updates",
        newCasesResolved: "new cases resolved this week",
        significantProgress: "Significant progress in property disputes and family cases",
        newLawyersJoined: "new lawyers joined the platform",
        expansionServices: "Expansion of legal services in rural areas",
        mobileDownloads: "Mobile app downloads exceed 50,000",
        addedSupport: "Added support for new languages for better accessibility",
        aiAccuracy: "AI system achieved 95% accuracy",
        betterPerformance: "Better performance in case classification and matching",
        propertyDisputesResolved: "Property Disputes Resolved",
        highestCaseVolume: "Highest case volume",
        familyCasesResolved: "Family Cases Resolved",
        rapidlyGrowing: "Rapidly growing sector",
        womenSafetyCases: "Women Safety Cases",
        specialAttention: "Special attention",
        laborDisputesSettled: "Labor Disputes Settled",
        minimalTime: "Minimal time required"
    },
    
    hi: {
        // Navigation
        home: "होम",
        findLawyers: "वकील खोजें",
        legalResources: "कानूनी संसाधन",
        eLearning: "ई-लर्निंग",
        community: "समुदाय",
        login: "लॉगिन",
        logout: "लॉगआउट",
        welcome: "स्वागत है",
        
        // Hero Section
        heroTitle: "कानूनी अधिकार कोई विशेषाधिकार नहीं, बल्कि समर्थन है",
        heroSubtitle: "JUSTNEST ग्रामीण समुदायों और कानूनी सेवाओं के बीच की खाई को डिजिटल समाधानों के माध्यम से पाटता है।",
        postLegalIssue: "अपनी कानूनी समस्या पोस्ट करें",
        findLawyer: "वकील खोजें",
        educationalVideos: "शैक्षिक वीडियो",
        
        // Features
        verifiedLawyers: "सत्यापित वकील",
        verifiedLawyersDesc: "आस-पास के सत्यापित कानूनी पेशेवरों से जुड़ें जो आपकी विशिष्ट कानूनी चिंताओं को संबोधित कर सकते हैं।",
        studentResources: "छात्र संसाधन",
        studentResourcesDesc: "शैक्षिक वीडियो, क्विज़ और सामग्री तक पहुंचें जो युवाओं को बुनियादी कानूनी अवधारणाओं को समझने में मदद करते हैं।",
        seniorSupport: "वरिष्ठ नागरिक समर्थन",
        seniorSupportDesc: "बुजुर्ग नागरिकों के लिए विशेष संसाधन उनके अधिकारों और उपलब्ध कानूनी सुरक्षा को समझने के लिए।",
        womensSafety: "महिला सुरक्षा",
        womensSafetyDesc: "महिलाओं के लिए घरेलू हिंसा की समस्याओं की रिपोर्ट करने और गोपनीय कानूनी सहायता प्राप्त करने का सुरक्षित स्थान।",
        
        // Services
        ourServices: "हमारी सेवाएं",
        
        // AI Updates
        stayUpdated: "कानूनी समाचारों के साथ अपडेट रहें",
        aiUpdatesDesc: "हमारी AI-संचालित प्रणाली नवीनतम कानूनी अपडेट प्रदान करती है, जो सभी के लिए समझने में आसान है, Azure OpenAI द्वारा संचालित।",
        todaysUpdates: "आज के कानूनी अपडेट",
        newRuralProperty: "नया ग्रामीण संपत्ति अधिकार संशोधन",
        newRuralPropertyDesc: "सरकार ने ग्रामीण संपत्ति अधिकारों की रक्षा के लिए नए संशोधनों की घोषणा की है। यह गांवों में भूमि स्वामित्व दस्तावेजीकरण को प्रभावित करता है।",
        womensSafetyAct: "महिला सुरक्षा अधिनियम अपडेट",
        womensSafetyActDesc: "ग्रामीण क्षेत्रों में महिलाओं की सुरक्षा को बढ़ाने के लिए नए प्रावधान जोड़े गए हैं तेजी से कानूनी प्रक्रियाओं और समर्थन प्रणालियों के साथ।",
        freeLegalAid: "मुफ्त कानूनी सहायता शिविर",
        freeLegalAidDesc: "ग्रामीण जिलों में आगामी मुफ्त कानूनी सहायता शिविर। परामर्श के लिए समय सारणी और स्थान जांचें।",
        viewAllUpdates: "सभी अपडेट देखें",
        
        // Voice Support
        voiceAccessible: "आवाज-सुलभ कानूनी समर्थन",
        voiceDesc: "सीमित साक्षरता वाले या आवाज संवाद पसंद करने वाले उपयोगकर्ताओं के लिए, हमारी प्रणाली कई भारतीय भाषाओं में भाषण-से-पाठ और पाठ-से-भाषण का समर्थन करती है।",
        speakLegalIssue: "अपनी कानूनी समस्या बोलें",
        selectLanguage: "भाषा चुनें",
        startSpeaking: "बोलना शुरू करें",
        listening: "सुन रहा है...",
        recognizedText: "पहचाना गया पाठ",
        recognizedTextPlaceholder: "आपकी बोली यहां दिखाई देगी...",
        listenLegalInfo: "कानूनी जानकारी सुनें",
        textToSpeak: "बोलने के लिए पाठ",
        textToSpeakPlaceholder: "वह पाठ दर्ज करें जिसे आप बोला हुआ सुनना चाहते हैं",
        speak: "बोलें",
        stop: "रोकें",
        readSample: "नमूना कानूनी अधिकार पढ़ें",
        browserSupport: "डेस्कटॉप पर Chrome में सबसे अच्छा काम करता है। मोबाइल समर्थन ब्राउज़र के अनुसार भिन्न होता है।",
        
        // How It Works
        howItWorks: "JUSTNEST कैसे काम करता है",
        step1Title: "पंजीकरण करें या गुमनाम रूप से पोस्ट करें",
        step1Desc: "किसी भी भाषा में खाता बनाएं या अपनी कानूनी चिंताओं को गुमनाम रूप से पोस्ट करें।",
        step2Title: "जुड़ें",
        step2Desc: "हमारी प्रणाली आपको आपकी आवश्यकताओं के आधार पर उपयुक्त कानूनी संसाधनों या सत्यापित वकीलों से जोड़ती है।",
        step3Title: "समर्थन प्राप्त करें",
        step3Desc: "आपकी विशिष्ट स्थिति के अनुरूप मार्गदर्शन, शैक्षिक संसाधन या सीधा कानूनी समर्थन प्राप्त करें।",
        
        // Testimonials
        successStories: "सफलता की कहानियां",
        
        // Download App
        takeJustnest: "JUSTNEST को अपने साथ ले जाएं",
        downloadDesc: "कानूनी समर्थन के लिए हमारा मोबाइल ऐप डाउनलोड करें कहीं भी, कभी भी। सीमित कनेक्टिविटी वाले क्षेत्रों के लिए ऑफलाइन काम करता है।",
        downloadAppStore: "App Store से डाउनलोड करें",
        getGooglePlay: "Google Play से प्राप्त करें",
        
        // Footer
        justnestDesc: "कानूनी अधिकार सभी के लिए सुलभ होने चाहिए, चाहे स्थान, भाषा या डिजिटल साक्षरता कुछ भी हो।",
        quickLinks: "त्वरित लिंक",
        aboutUs: "हमारे बारे में",
        services: "सेवाएं",
        findLawyers: "वकील खोजें",
        educationalResources: "शैक्षिक संसाधन",
        legalResources: "कानूनी संसाधन",
        womensRights: "महिला अधिकार",
        landRights: "भूमि अधिकार",
        laborLaws: "श्रम कानून",
        consumerProtection: "उपभोक्ता संरक्षण",
        contactUs: "संपर्क करें",
        helpline: "हेल्पलाइन: 1800-JUSTNEST",
        supportEmail: "support@justnest.org",
        copyright: "© 2025 JUSTNEST। सर्वाधिकार सुरक्षित।",
        
        // Legal Issue Form
        postLegalProblem: "अपनी कानूनी समस्या पोस्ट करें",
        problemCategory: "समस्या श्रेणी",
        selectCategory: "श्रेणी चुनें",
        property: "संपत्ति/भूमि अधिकार",
        family: "परिवार कानून",
        consumer: "उपभोक्ता संरक्षण",
        labor: "श्रम अधिकार",
        domestic: "घरेलू हिंसा",
        other: "अन्य",
        describeProblem: "अपनी समस्या का वर्णन करें",
        describeProblemPlaceholder: "अपनी कानूनी समस्या का विस्तार से वर्णन करें...",
        postAnonymously: "गुमनाम रूप से पोस्ट करें",
        postProblem: "समस्या पोस्ट करें",
        
        // Statistics
        legalStatistics: "JUSTNEST कानूनी आंकड़े",
        currentStatus: "भारत की न्याय प्रणाली की वर्तमान स्थिति",
        totalCasesResolved: "कुल मामले हल",
        activeCases: "सक्रिय मामले",
        registeredUsers: "पंजीकृत उपयोगकर्ता",
        verifiedLawyers: "सत्यापित वकील",
        avgResolutionTime: "औसत समाधान समय (दिन)",
        successRate: "सफलता दर (%)",
        caseTypes: "मामले के प्रकार (वितरण)",
        propertyDisputes: "संपत्ति विवाद (30%)",
        familyCases: "परिवार के मामले (20%)",
        criminalCases: "आपराधिक मामले (20%)",
        laborDisputes: "श्रम विवाद (20%)",
        others: "अन्य (10%)",
        stateWiseStatus: "राज्य-वार मामले की स्थिति",
        recentUpdates: "हाल के अपडेट",
        newCasesResolved: "नए मामले इस सप्ताह हल",
        significantProgress: "संपत्ति विवाद और परिवार के मामलों में महत्वपूर्ण प्रगति",
        newLawyersJoined: "नए वकील प्लेटफॉर्म में शामिल",
        expansionServices: "ग्रामीण क्षेत्रों में कानूनी सेवाओं का विस्तार",
        mobileDownloads: "मोबाइल ऐप डाउनलोड 50,000 से अधिक",
        addedSupport: "बेहतर पहुंच के लिए नई भाषाओं के लिए समर्थन जोड़ा गया",
        aiAccuracy: "AI प्रणाली ने 95% सटीकता हासिल की",
        betterPerformance: "मामले वर्गीकरण और मिलान में बेहतर प्रदर्शन",
        propertyDisputesResolved: "संपत्ति विवाद हल",
        highestCaseVolume: "उच्चतम मामले की मात्रा",
        familyCasesResolved: "परिवार के मामले हल",
        rapidlyGrowing: "तेजी से बढ़ता क्षेत्र",
        womenSafetyCases: "महिला सुरक्षा मामले",
        specialAttention: "विशेष ध्यान",
        laborDisputesSettled: "श्रम विवाद निपटाए गए",
        minimalTime: "न्यूनतम समय आवश्यक"
    }
};

// Get translations for a specific language
router.get('/:language', (req, res) => {
    const { language } = req.params;
    
    if (translations[language]) {
        res.json({
            success: true,
            language: language,
            translations: translations[language]
        });
    } else {
        res.status(404).json({
            success: false,
            message: `Translations for language '${language}' not found`,
            availableLanguages: Object.keys(translations)
        });
    }
});

// Get all available languages
router.get('/', (req, res) => {
    res.json({
        success: true,
        availableLanguages: Object.keys(translations),
        languageNames: {
            en: "English",
            hi: "हिंदी (Hindi)",
            mr: "मराठी (Marathi)",
            bn: "বাংলা (Bengali)",
            ta: "தமிழ் (Tamil)",
            te: "తెలుగు (Telugu)",
            kn: "ಕನ್ನಡ (Kannada)",
            ml: "മലയാളം (Malayalam)",
            pa: "ਪੰਜਾਬੀ (Punjabi)",
            gu: "ગુજરાતી (Gujarati)"
        }
    });
});

// Add new translation
router.post('/:language', (req, res) => {
    const { language } = req.params;
    const { translations: newTranslations } = req.body;
    
    if (!newTranslations) {
        return res.status(400).json({
            success: false,
            message: 'Translations data is required'
        });
    }
    
    if (translations[language]) {
        // Update existing translations
        translations[language] = { ...translations[language], ...newTranslations };
    } else {
        // Add new language
        translations[language] = newTranslations;
    }
    
    res.json({
        success: true,
        message: `Translations for language '${language}' updated successfully`,
        language: language
    });
});

module.exports = router; 