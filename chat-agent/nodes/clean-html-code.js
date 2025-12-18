// ========================================
// CLEAN HTML - v3.5.0 CHAT + DISCOURSE
// Base: v3.4.2
// CHANGES:
// - Added support for Chat mode (Categorize Request Type node)
// - Fallback to Discourse mode (Receive New Discourse Message)
// - HTML-based detection works without category
// ========================================

// ========================================
// CATEGORY MAPPING
// ========================================
const CATEGORY_MAP = {
    5: { product: 'attributes', name: 'Attributes (general)' },
    6: { product: 'attributes', feature: 'CMS Filter', name: 'CMS Filter', script: 'attributes-cmsfilter', attributes: ['fs-cmsfilter-element', 'fs-cmsfilter-field', 'fs-cmsfilter-active'] },
    7: { product: 'attributes', feature: 'CMS Load', name: 'CMS Load', script: 'attributes-cmsload', attributes: ['fs-cmsload-element', 'fs-cmsload-mode', 'fs-cmsload-resetix'] },
    8: { product: 'attributes', feature: 'CMS Nest', name: 'CMS Nest', script: 'attributes-cmsnest', attributes: ['fs-cmsnest-element'] },
    9: { product: 'attributes', feature: 'CMS Combine', name: 'CMS Combine', script: 'attributes-cmscombine', attributes: ['fs-cmscombine-element'] },
    10: { product: 'attributes', feature: 'CMS Sort', name: 'CMS Sort', script: 'attributes-cmssort', attributes: ['fs-cmssort-element'] },
    11: { product: 'attributes', feature: 'Lightbox', name: 'Lightbox', script: 'attributes-lightbox', attributes: ['fs-lightbox-element'] },
    12: { product: 'attributes', feature: 'Tabs', name: 'Tabs', script: 'attributes-tabs', attributes: ['fs-tabs-element'] },
    13: { product: 'attributes', feature: 'Accordion', name: 'Accordion', script: 'attributes-accordion', attributes: ['fs-accordion-element'] },
    14: { product: 'attributes', feature: 'Modal', name: 'Modal', script: 'attributes-modal', attributes: ['fs-modal-element'] },
    15: { product: 'attributes', feature: 'Scroll Disable', name: 'Scroll Disable', script: 'attributes-scrolldisable', attributes: ['fs-scrolldisable-element'] },
    16: { product: 'components', name: 'Components (general)', script: 'finsweetcomponentsconfig' },
    17: { product: 'components', component: 'Slider', name: 'Slider', script: 'finsweetcomponentsconfig', attributes: ['fs-slider-element'] },
    18: { product: 'components', component: 'Cookie Consent', name: 'Cookie Consent', script: 'finsweetcomponentsconfig', attributes: ['fs-cc'] },
    19: { product: 'components', component: 'Marquee', name: 'Marquee', script: 'finsweetcomponentsconfig', attributes: ['fs-marquee-element'] },
    20: { product: 'components', component: 'Instagram Feed', name: 'Instagram Feed', script: 'finsweetcomponentsconfig', attributes: ['fs-instagram'] },
    21: { product: 'components', component: 'Favorite', name: 'Favorite', script: 'finsweetcomponentsconfig', attributes: ['fs-favorite'] },
    22: { product: 'components', component: 'Social Share', name: 'Social Share', script: 'finsweetcomponentsconfig', attributes: ['fs-social-share'] },
    28: { product: 'components', component: 'Table of Contents', name: 'Table of Contents', script: 'finsweetcomponentsconfig', attributes: ['fs-toc'] },
    23: { product: 'wized', name: 'Wized', script: 'wized.js' },
    24: { product: 'client-first', name: 'Client-First' },
    25: { product: 'cms-bridge', name: 'CMS Bridge' },
    26: { product: 'extension', name: 'Extension' },
    27: { product: 'consent-pro', name: 'Consent Pro', attributes: ['fs-cc'] }
};

// ========================================
// CATEGORY STRING MAP - FOR CHAT MODE
// ========================================
const CATEGORY_STRING_MAP = {
    'attributes': 5, 'attributes_v2': 5, 'finsweet_attributes_v2': 5,
    'cmsfilter': 6, 'cms_filter': 6,
    'cmsload': 7, 'cms_load': 7,
    'cmsnest': 8, 'cms_nest': 8,
    'cmscombine': 9, 'cmssort': 10,
    'components': 16, 'slider': 17, 'cookie_consent': 18, 'marquee': 19,
    'favorite': 21, 'wized': 23,
    'client_first': 24, 'client-first': 24,
    'cms_bridge': 25, 'cms-bridge': 25,
    'extension': 26, 'consent_pro': 27, 'consent-pro': 27,
    'other': null, 'unknown': null
};

const rawHtml = $json["data"];
if (!rawHtml) {
    return [{ json: { error: "No HTML data found" } }];
}

// ========================================
// STEP 0: GET CATEGORY (CHAT OR DISCOURSE)
// ========================================
let categoryId = null;
let webhookCategorySlug = '';
let categorySource = 'none';

// Try Chat mode first
try {
    const categorizeNode = $('Categorize Request Type').first();
    if (categorizeNode?.json?.message?.content) {
        const categoryFromChat = categorizeNode.json.message.content;
        const normalizedCat = categoryFromChat.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        categoryId = CATEGORY_STRING_MAP[normalizedCat] || null;
        webhookCategorySlug = categoryFromChat;
        categorySource = 'chat';
    }
} catch (e) {}

// Fallback to Discourse mode
if (!categoryId && categorySource === 'none') {
    try {
        const webhookNode = $('Receive New Discourse Message').first();
        if (webhookNode?.json?.body?.post?.category_id) {
            categoryId = webhookNode.json.body.post.category_id;
            webhookCategorySlug = webhookNode.json.body.post.category_slug || '';
            categorySource = 'discourse';
        }
    } catch (e) {}
}

if (!categoryId) categorySource = 'html-detection';

// ========================================
// STEP 0.1: GET EXPECTED PRODUCT FROM CATEGORY
// ========================================
let expectedProduct = null, expectedFeature = null, expectedComponent = null;
let expectedAttributes = [], expectedScript = null;

if (categoryId && CATEGORY_MAP[categoryId]) {
    const catInfo = CATEGORY_MAP[categoryId];
    expectedProduct = catInfo.product;
    expectedFeature = catInfo.feature || null;
    expectedComponent = catInfo.component || null;
    expectedAttributes = catInfo.attributes || [];
    expectedScript = catInfo.script || null;
}

// ========================================
// STEP 0.5: DETECT EMPTY SHELL
// ========================================
const isWebflowShell = rawHtml.includes('designer-app-react-mount') ||
    rawHtml.includes('webflow-designer') ||
    (rawHtml.includes('id="workspace"') && rawHtml.length < 10000);

if (isWebflowShell) {
    return [{
        json: {
            warning: "Webflow shell/preview detected",
            suggestion: "User should share PUBLISHED site link",
            cleanedHtml: "",
            stats: { originalSize: rawHtml.length, cleanedSize: 0, reductionPercent: 0, totalFsAttributes: 0, productsDetected: 0 },
            attributeSummary: "", detectedScripts: "",
            productDetails: { detected: [], attributesFeatures: [], componentsUsed: [], scripts: [], summary: "Not analyzed - empty shell",
                technicalDetails: { expectedProduct, expectedFeature, expectedComponent, categoryId, categorySlug: webhookCategorySlug, categorySource }
            }
        }
    }];
}

// ========================================
// STEP 1: EXTRACT SCRIPTS
// ========================================
let scriptMatches = [...rawHtml.matchAll(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi)];
let scriptUrls = scriptMatches.map(m => m[1]);
let finsweetScripts = scriptUrls.filter(url => url.includes('finsweet') || url.includes('@finsweet'));

let scriptConfigs = [...rawHtml.matchAll(/<script[^>]*(?:finsweet|@finsweet)[^>]*>/gi)]
    .map(match => {
        let tag = match[0];
        return {
            src: tag.match(/src=["']([^"']+)["']/)?.[1] || null,
            config: tag.match(/data-config=["']([^"']+)["']/)?.[1] || null,
            type: tag.match(/finsweet=["']([^"']+)["']/)?.[1] || null
        };
    });

// ========================================
// STEP 1.5: GET URL FROM CONVERT URL NODE
// ========================================
let originalUrl = '';
try {
    let convertUrlNode = $('Convert URL').first();
    if (convertUrlNode?.json?.message?.content) {
        originalUrl = String(convertUrlNode.json.message.content);
    }
} catch (e) {}

if (originalUrl === 'EMPTY' || originalUrl.toLowerCase() === 'empty') originalUrl = '';
let isWizedUrl = /(?:app\.)?wized\.(?:com|io)/i.test(originalUrl);

// ========================================
// STEP 2: DETECT PRODUCTS
// ========================================
let detectedProducts = [];
let productDetails = { detected: [], attributesFeatures: [], componentsUsed: [], scripts: finsweetScripts, summary: "" };
let allAttributesFound = [];
let htmlContainsAttributes = false;
let attributesFeatures = [];

// 2.1 DETECT ATTRIBUTES
const attrChecks = [
    { regex: /fs-cmsfilter-element/i, name: "CMS Filter", attrs: ['fs-cmsfilter-element', 'fs-cmsfilter-field', 'fs-cmsfilter-active'] },
    { regex: /fs-cmsload-element/i, name: "CMS Load", attrs: ['fs-cmsload-element', 'fs-cmsload-mode', 'fs-cmsload-resetix'] },
    { regex: /fs-cmsnest-element/i, name: "CMS Nest", attrs: ['fs-cmsnest-element'] },
    { regex: /fs-cmsslider-element/i, name: "CMS Slider", attrs: ['fs-cmsslider-element'] },
    { regex: /fs-cmscombine-element/i, name: "CMS Combine", attrs: ['fs-cmscombine-element'] },
    { regex: /fs-cmssort-element/i, name: "CMS Sort", attrs: ['fs-cmssort-element'] },
    { regex: /fs-tabs-element/i, name: "Tabs", attrs: ['fs-tabs-element'] },
    { regex: /fs-accordion-element/i, name: "Accordion", attrs: ['fs-accordion-element'] },
    { regex: /fs-modal-element/i, name: "Modal", attrs: ['fs-modal-element'] },
    { regex: /fs-lightbox-element/i, name: "Lightbox", attrs: ['fs-lightbox-element'] },
    { regex: /fs-scrolldisable-element/i, name: "Scrolldisable", attrs: ['fs-scrolldisable-element'] },
    { regex: /fs-richtext-element/i, name: "Rich Text", attrs: ['fs-richtext-element'] }
];

for (const check of attrChecks) {
    if (check.regex.test(rawHtml)) {
        attributesFeatures.push(check.name);
        allAttributesFound.push(...check.attrs.filter(a => new RegExp(a, 'i').test(rawHtml)));
        htmlContainsAttributes = true;
    }
}

if (attributesFeatures.length > 0) {
    detectedProducts.push("attributes");
    productDetails.attributesFeatures = attributesFeatures;
}

// 2.2 DETECT COMPONENTS
let componentsUsed = [];
let hasComponentsScript = /finsweet=["']components["']|finsweetcomponentsconfig/i.test(rawHtml);

if (hasComponentsScript || [17, 18, 19, 28].includes(categoryId)) {
    if (/fs-slider-element/i.test(rawHtml)) { componentsUsed.push("Slider"); allAttributesFound.push("fs-slider-element"); htmlContainsAttributes = true; }
    if (/fs-favorite-/i.test(rawHtml)) { componentsUsed.push("Favorite"); allAttributesFound.push("fs-favorite"); htmlContainsAttributes = true; }
    if (/fs-cc-|cookie-consent/i.test(rawHtml)) { componentsUsed.push("Cookie Consent"); allAttributesFound.push("fs-cc"); htmlContainsAttributes = true; }
    if (/fs-marquee-element/i.test(rawHtml)) { componentsUsed.push("Marquee"); allAttributesFound.push("fs-marquee-element"); htmlContainsAttributes = true; }
    if (/fs-toc-/i.test(rawHtml)) { componentsUsed.push("Table of Contents"); allAttributesFound.push("fs-toc"); htmlContainsAttributes = true; }

    if (componentsUsed.length === 0) componentsUsed.push("Components (generic)");
    detectedProducts.push("components");
    productDetails.componentsUsed = componentsUsed;
}

// 2.3 DETECT OTHER PRODUCTS
if (isWizedUrl || /wized-|data-wized/i.test(rawHtml)) { detectedProducts.push("wized"); allAttributesFound.push("data-wized"); }
if (/class=["'][^"']*padding-(?:global|section)/i.test(rawHtml)) detectedProducts.push("client-first");
if (/cms[-_]bridge|airtable.*sync/i.test(rawHtml)) detectedProducts.push("cms-bridge");

let detectionMethod = "html-based";

// ========================================
// STEP 2.5: VERIFY REQUIRED SCRIPTS
// ========================================
let missingScripts = [];
const scriptsPresent = rawHtml.toLowerCase();

if (detectedProducts.includes('attributes')) {
    if (attributesFeatures.includes('CMS Filter') && !scriptsPresent.includes('attributes-cmsfilter')) missingScripts.push('@finsweet/attributes-cmsfilter');
    if (attributesFeatures.includes('CMS Load') && !scriptsPresent.includes('attributes-cmsload')) missingScripts.push('@finsweet/attributes-cmsload');
}

// ========================================
// STEP 3: BASE CLEANING
// ========================================
let cleaned = rawHtml
    .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, "")
    .replace(/<script\b(?![^>]*src=)[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/\s+style=["'][^"']*["']/gi, "")
    .replace(/\s+data-wf-[a-z\-]+(?:=["'][^"']*["'])?/gi, "")
    .replace(/\s+data-w-id=["'][^"']*["']/gi, "")
    .replace(/\s+class=["']([^"']*)["']/gi, (match, classes) => {
        let important = classes.split(/\s+/).filter(c => {
            if (/^(padding|margin|container|text-|background-)/.test(c)) return true;
            if (c.includes('_component') || c.includes('_wrapper')) return true;
            if (/^(section|container|grid|flex|is-)/.test(c)) return true;
            if (/^w-/.test(c)) return false;
            return true;
        });
        return important.length > 0 ? ` class="${important.join(' ')}"` : '';
    })
    .replace(/<!--(?!.*(?:finsweet|fs-))[\s\S]*?-->/gi, "")
    .replace(/[ \t]{3,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/>\s+</g, "><")
    .trim();

// STEP 3.5: AGGRESSIVE CLEANING
cleaned = cleaned
    .replace(/\s+srcset=["'][^"']*["']/gi, "")
    .replace(/\s+sizes=["'][^"']*["']/gi, "")
    .replace(/\s+width=["']\d+["']/gi, "")
    .replace(/\s+height=["']\d+["']/gi, "")
    .replace(/\s+loading=["']lazy["']/gi, "")
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "<!-- SVG removed -->")
    .replace(/\s+integrity=["'][^"']*["']/gi, "")
    .replace(/\s+crossorigin=["'][^"']*["']/gi, "");

// STEP 3.6: LIMIT COLLECTION ITEMS
try {
    const collectionItemPattern = /(<div><a href="\/properties\/[^"]+?"[\s\S]*?<\/a><\/div>)/gi;
    const matches = [...cleaned.matchAll(collectionItemPattern)];
    if (matches.length > 3) {
        const keepItems = matches.slice(0, 3).map(m => m[1]).join('');
        const removedCount = matches.length - 3;
        const firstIdx = cleaned.indexOf(matches[0][0]);
        const lastIdx = cleaned.indexOf(matches[matches.length - 1][0]) + matches[matches.length - 1][0].length;
        cleaned = cleaned.substring(0, firstIdx) + keepItems + `\n<!-- ${removedCount} items removed -->\n` + cleaned.substring(lastIdx);
    }
} catch (e) {}

// STEP 3.7: LIMIT FILTER OPTIONS
try {
    const labelPattern = /(<label class="filter_label">[\s\S]*?<\/label>)/gi;
    const labelMatches = [...cleaned.matchAll(labelPattern)];
    if (labelMatches.length > 10) {
        const firstLabel = labelMatches[0][1];
        const lastLabel = labelMatches[labelMatches.length - 1][1];
        const removedCount = labelMatches.length - 2;
        const firstIdx = cleaned.indexOf(labelMatches[0][0]);
        const lastIdx = cleaned.indexOf(labelMatches[labelMatches.length - 1][0]) + labelMatches[labelMatches.length - 1][0].length;
        cleaned = cleaned.substring(0, firstIdx) + firstLabel + `\n<!-- ${removedCount} options removed -->\n` + lastLabel + cleaned.substring(lastIdx);
    }
} catch (e) {}

// ========================================
// STEP 4: BUILD ATTRIBUTE SUMMARY
// ========================================
let dataAttrMatches = [...cleaned.matchAll(/(?:data-|wized-)[a-z0-9\-_]+(?:="[^"]*")?/gi)];
let dataAttrSummary = dataAttrMatches.slice(0, 30).map(m => m[0]).join(", ");
let finsweetAttrSummary = allAttributesFound.length > 0 ? "Finsweet attributes: " + [...new Set(allAttributesFound)].join(", ") : "";
let attributeSummary = [dataAttrSummary ? "data-* attributes: " + dataAttrSummary : "", finsweetAttrSummary].filter(Boolean).join(" | ");

// ========================================
// STEP 5: EXTRACT USEFUL COMMENTS
// ========================================
let usefulComments = [...rawHtml.matchAll(/<!--(.*?(?:finsweet|fs-).*?)-->/gi)].map(m => m[1].trim()).slice(0, 5);

let clientFirstClasses = [];
if (detectedProducts.includes('client-first')) {
    clientFirstClasses = [...rawHtml.matchAll(/class="([^"]*)"/gi)]
        .flatMap(m => m[1].split(/\s+/))
        .filter(c => c.match(/^(?:padding|margin|container|text-size)-/) || c.match(/_(component|wrapper)$/));
    clientFirstClasses = [...new Set(clientFirstClasses)].slice(0, 20);
}

// ========================================
// STEP 6: CREATE SUMMARY
// ========================================
productDetails.detected = detectedProducts;
let summaryParts = [];
if (detectedProducts.includes('attributes') && attributesFeatures.length > 0) summaryParts.push(`Attributes (${attributesFeatures.join(", ")})`);
if (detectedProducts.includes('components') && componentsUsed.length > 0) summaryParts.push(`Components (${componentsUsed.join(", ")})`);
if (detectedProducts.includes('wized')) summaryParts.push('Wized');
if (detectedProducts.includes('client-first')) summaryParts.push('Client-First');
if (detectedProducts.includes('cms-bridge')) summaryParts.push('CMS Bridge');
productDetails.summary = summaryParts.length > 0 ? summaryParts.join(" | ") : "No Finsweet products detected";

// ========================================
// STEP 7: STATISTICS
// ========================================
const stats = {
    originalSize: rawHtml.length,
    cleanedSize: cleaned.length,
    reductionPercent: Math.round((1 - cleaned.length / rawHtml.length) * 100),
    totalFsAttributes: [...new Set(allAttributesFound)].length,
    productsDetected: detectedProducts.length
};

// ========================================
// STEP 8: RETURN
// ========================================
return [{
    json: {
        cleanedHtml: cleaned,
        stats: stats,
        attributeSummary: attributeSummary,
        detectedScripts: finsweetScripts.length > 0 ? finsweetScripts.join(", ") : "no finsweet scripts detected",
        productDetails: {
            ...productDetails,
            technicalDetails: {
                scriptConfigs, usefulComments, clientFirstClasses,
                totalFsAttributes: [...new Set(allAttributesFound)].length,
                detectionSource: isWizedUrl ? 'URL-based detection' : 'HTML-based detection',
                capturedUrl: originalUrl,
                categoryId, categorySlug: webhookCategorySlug, categorySource,
                expectedProduct, expectedFeature, expectedComponent, expectedAttributes, expectedScript,
                detectionMethod, htmlContainsAttributes,
                allAttributesDetected: [...new Set(allAttributesFound)],
                missingScripts,
                scriptsStatus: missingScripts.length === 0 ? 'complete' : 'incomplete'
            }
        }
    }
}];
