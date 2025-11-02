// === WEEKLY REPORT GENERATOR - REFACTORED VERSION ===

// === CONSTANTS ===
const CONSTANTS = {
    SLA_HOURS: 24,
    WEEKEND_SLA_HOURS: 48,
    CRITICAL_HOURS: 120,
    MODERATE_HOURS: 48,
    MAX_SUMMARY_LENGTH: 85,
    PREVIEW_LENGTH: 50,
    SUPPORT_STAFF: {
        HUMAN: ['Support-Luis', 'Support-Pedro', 'jesse.muiruri'],
        AI: ['Support-Finn']
    }
};

const URGENCY_CATEGORIES = {
    NEW: { category: 'New', priority: 4, emoji: '' },
    CRITICAL: { category: '🔴 Critical', priority: 1, emoji: '🔴' },
    MODERATE: { category: '🟡 Moderate', priority: 2, emoji: '🟡' },
    LOW: { category: '🟢 Low', priority: 3, emoji: '🟢' }
};

// === UTILITY FUNCTIONS ===
function validateInput(items) {
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error("No valid data array received for processing");
    }
    return true;
}

function logDebug(message, data = null) {
    console.log(`DEBUG: ${message}`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
}

// === DATA FORMAT DETECTION ===
function detectDataFormat(item) {
    // Formato atual do N8N (baseado no seu exemplo)
    if (item?.output) {
        return {
            type: 'n8n_current',
            data: item.output,
            clusters: item.output.clusters || [],
            dataQualityReport: item.output.data_quality_report || null,
            originalDataStr: item.output.original_summarize_data
        };
    }

    // Formato legado N8N com json wrapper
    if (item?.json?.output) {
        return {
            type: 'n8n_json_wrapped',
            data: item.json.output,
            clusters: item.json.output.clusters || [],
            dataQualityReport: item.json.output.data_quality_report || null,
            originalDataStr: item.json.output.original_summarize_data
        };
    }

    // Formato muito antigo
    if (item?.json?.original_summarize_data) {
        return {
            type: 'n8n_legacy',
            data: item.json,
            clusters: [],
            dataQualityReport: null,
            originalDataStr: item.json.original_summarize_data
        };
    }

    return { type: 'unknown', data: null };
}

// === DATE RANGE CALCULATION ===
function getMapperDateRange() {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(now.getDate() - 1);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    const formatOptions = { month: 'long', day: 'numeric', timeZone: 'UTC' };
    const formatOptionsEnd = { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' };

    return {
        start_formatted: startDate.toLocaleDateString('en-US', formatOptions),
        end_formatted: endDate.toLocaleDateString('en-US', formatOptionsEnd)
    };
}

// === TEXT PROCESSING ===
function smartSplitSummaries(concatenatedText) {
    if (!concatenatedText || typeof concatenatedText !== 'string') return [];

    const atPositions = [];
    const regex = /@\w+/g;
    let match;

    while ((match = regex.exec(concatenatedText)) !== null) {
        atPositions.push(match.index);
    }

    if (atPositions.length <= 1) {
        return [concatenatedText.trim()];
    }

    const summaries = [];
    for (let i = 0; i < atPositions.length; i++) {
        const start = i === 0 ? 0 : atPositions[i];
        const end = i === atPositions.length - 1 ? concatenatedText.length : atPositions[i + 1];
        let summary = concatenatedText.substring(start, end).trim();

        if (summary.endsWith(',')) {
            summary = summary.slice(0, -1).trim();
        }

        if (summary) {
            summaries.push(summary);
        }
    }

    return summaries;
}

// === CATEGORIZATION ===
function categorizeUnansweredTopic(hoursWithoutResponse, urgency) {
    if (hoursWithoutResponse <= CONSTANTS.SLA_HOURS) {
        return URGENCY_CATEGORIES.NEW;
    }

    if ((urgency === 'High' && hoursWithoutResponse > CONSTANTS.MODERATE_HOURS) ||
        hoursWithoutResponse > CONSTANTS.CRITICAL_HOURS) {
        return URGENCY_CATEGORIES.CRITICAL;
    }

    if (urgency === 'Medium' && hoursWithoutResponse > CONSTANTS.SLA_HOURS) {
        return URGENCY_CATEGORIES.MODERATE;
    }

    return URGENCY_CATEGORIES.LOW;
}

// === VALIDATION ===
function validateTopicData(originalDataItem) {
    const requiredFields = ['concatenated_topic_id', 'concatenated_output_finsweet_product'];
    return requiredFields.every(field => originalDataItem[field]);
}

function parseArrays(originalDataItem) {
    const rawTopicIds = originalDataItem.concatenated_topic_id || '';
    const rawProducts = originalDataItem.concatenated_output_finsweet_product || '';

    return {
        topicIds: rawTopicIds.split('|').map(id => id.trim()).filter(Boolean),
        productNames: rawProducts.split('|').map(p => p.trim()).filter(Boolean),
        summaries: smartSplitSummaries(originalDataItem.concatenated_output_problem_summary || ''),
        urls: (originalDataItem.concatenated_first_post_url || '').split('|').map(u => u.trim()).filter(Boolean),
        urgencies: (originalDataItem.concatenated_output_urgency || '').split('|').map(u => u.trim()).filter(Boolean),
        officiallyAnsweredArr: (originalDataItem.concatenated_officially_answered || '').split('|').map(a => a.trim() === 'true'),
        officialResponderArr: (originalDataItem.concatenated_official_responder || '').split('|').map(r => r.trim()),
        hoursWithoutResponseArr: (originalDataItem.concatenated_hours_without_response || '').split('|').map(h => parseInt(h.trim()) || 0),
        // Novos campos para SLA Compliance
        officialResponseTimeArr: (originalDataItem.concatenated_official_response_time_hours || '').split('|').map(t => {
            const parsed = parseFloat(t.trim());
            return isNaN(parsed) ? null : parsed;
        }),
        slaHoursArr: (originalDataItem.concatenated_sla_hours || '').split('|').map(h => {
            const parsed = parseInt(h.trim());
            return isNaN(parsed) ? CONSTANTS.SLA_HOURS : parsed;
        }),
        weekendCreatedArr: (originalDataItem.concatenated_weekend_created || '').split('|').map(w => w.trim() === 'true')
    };
}

// === RESPONSE TYPE DETECTION ===
function determineResponseType(isAnsweredByOfficial, responder, productName = '') {
    const isOfficialSupport = CONSTANTS.SUPPORT_STAFF.HUMAN.includes(responder);
    const isSupportAI = CONSTANTS.SUPPORT_STAFF.AI.includes(responder);

    // ✅ WIZED AUTO-DETECTION: For Wized, any officially answered = staff
    const isWizedProduct = productName === 'wized';
    const isWizedStaff = isWizedProduct && isAnsweredByOfficial;

    if (isAnsweredByOfficial && (isOfficialSupport || isWizedStaff)) {
        return { type: 'official', answered: true };
    }

    if (isAnsweredByOfficial && isSupportAI) {
        return { type: 'support_ai', answered: true };
    }

    return { type: 'unanswered', answered: false };
}

// === ARRAY CORRECTION ===
function correctArrayMisalignment(arrays, dataQualityReport, itemIndex) {
    if (!dataQualityReport || !dataQualityReport.items_with_array_misalignment?.includes(itemIndex)) {
        return arrays;
    }

    console.log(`Aplicando correção para item ${itemIndex + 1} (arrays desalinhados detectados)`);

    const { topicIds, officiallyAnsweredArr, officialResponderArr, hoursWithoutResponseArr, officialResponseTimeArr, slaHoursArr, weekendCreatedArr } = arrays;
    const targetLength = topicIds.length;

    // Corrigir array de responders
    if (officialResponderArr.length < targetLength) {
        const correctedResponderArr = [];
        let responderIndex = 0;

        for (let i = 0; i < targetLength; i++) {
            const isOfficiallyAnswered = i < officiallyAnsweredArr.length ? officiallyAnsweredArr[i] : false;

            if (isOfficiallyAnswered && responderIndex < officialResponderArr.length) {
                correctedResponderArr[i] = officialResponderArr[responderIndex];
                responderIndex++;
            } else {
                correctedResponderArr[i] = '';
            }
        }

        arrays.officialResponderArr = correctedResponderArr;
        console.log(`Responder array corrigido: ${officialResponderArr.length} → ${correctedResponderArr.length}`);
    }

    // Corrigir array de horas se necessário
    if (hoursWithoutResponseArr.length < targetLength) {
        while (arrays.hoursWithoutResponseArr.length < targetLength) {
            arrays.hoursWithoutResponseArr.push(0);
        }
        console.log(`Hours array corrigido para ${targetLength} elementos`);
    }

    // Corrigir novos arrays para SLA Compliance
    if (officialResponseTimeArr.length < targetLength) {
        while (arrays.officialResponseTimeArr.length < targetLength) {
            arrays.officialResponseTimeArr.push(null);
        }
        console.log(`Official response time array corrigido para ${targetLength} elementos`);
    }

    if (slaHoursArr.length < targetLength) {
        while (arrays.slaHoursArr.length < targetLength) {
            arrays.slaHoursArr.push(CONSTANTS.SLA_HOURS);
        }
        console.log(`SLA hours array corrigido para ${targetLength} elementos`);
    }

    if (weekendCreatedArr.length < targetLength) {
        while (arrays.weekendCreatedArr.length < targetLength) {
            arrays.weekendCreatedArr.push(false);
        }
        console.log(`Weekend created array corrigido para ${targetLength} elementos`);
    }

    return arrays;
}

// === DATA QUALITY VALIDATION ===
function validateDataQuality(formatInfo, itemIndex) {
    const issues = [];

    if (formatInfo.dataQualityReport) {
        const report = formatInfo.dataQualityReport;

        if (report.items_with_array_misalignment?.includes(itemIndex)) {
            issues.push(`Array misalignment detected in item ${itemIndex}`);
        }

        console.log(`Data Quality - Item ${itemIndex + 1}: ${issues.length} issues found`);
        if (issues.length > 0) {
            console.log(`⚠️ Issues: ${issues.join(', ')}`);
        }
    }

    return issues;
}

// === INDIVIDUAL POST CREATION ===
function createIndividualPost(topicData, arrays, topicIndex) {
    const { topicIds, productNames, summaries, urls, urgencies, officiallyAnsweredArr, officialResponderArr, hoursWithoutResponseArr, officialResponseTimeArr, slaHoursArr, weekendCreatedArr } = arrays;

    const topicId = topicIds[topicIndex];
    const product = productNames[topicIndex];
    const summary = summaries[topicIndex];
    const rawUrl = urls[topicIndex];
    const urgency = urgencies[topicIndex] || 'Low';

    // Validate required fields
    if (!topicId || !product || !summary || !rawUrl) {
        return null;
    }

    // Extract response data
    const isAnsweredByOfficial = topicIndex < officiallyAnsweredArr.length ? officiallyAnsweredArr[topicIndex] : false;
    const responder = topicIndex < officialResponderArr.length ? officialResponderArr[topicIndex] : '';
    const hoursWithoutResponse = topicIndex < hoursWithoutResponseArr.length ? hoursWithoutResponseArr[topicIndex] : 0;

    // Extract SLA-related data
    const officialResponseTime = topicIndex < officialResponseTimeArr.length ? officialResponseTimeArr[topicIndex] : null;
    const slaHours = topicIndex < slaHoursArr.length ? slaHoursArr[topicIndex] : CONSTANTS.SLA_HOURS;
    const weekendCreated = topicIndex < weekendCreatedArr.length ? weekendCreatedArr[topicIndex] : false;

    // Determine response type
    const responseInfo = determineResponseType(isAnsweredByOfficial, responder, product);

    const individualPost = {
        topic_id: topicId,
        product: product,
        summary: summary.trim(),
        url: `https://forum.finsweet.com${rawUrl.trim()}`,
        urgency: urgency,
        officially_answered: responseInfo.type === 'official',
        support_ai_answered: responseInfo.type === 'support_ai',
        any_official_answered: isAnsweredByOfficial && (responseInfo.type === 'official' || responseInfo.type === 'support_ai'),
        answered: responseInfo.answered,
        official_responder: responder || null,
        hours_without_response: hoursWithoutResponse,
        response_type: responseInfo.type,
        // Campos essenciais para SLA Compliance
        official_response_time_hours: officialResponseTime,
        sla_hours: slaHours,
        weekend_created: weekendCreated
    };

    // Log processing for debugging if needed
    console.log(`Processando tópico ${topicId} - Status: ${responseInfo.type}`);

    return individualPost;
}

// === PRODUCT INITIALIZATION ===
function initializeProduct(productName) {
    return {
        name: productName,
        totalTopics: 0,
        topicsOfficiallyAnswered: 0,
        topicsSupportAIAnswered: 0,
        topicsAnswered: 0,
        posts: []
    };
}

// === SUB-ITEM PROCESSING ===
function processSubItem(subItem, itemIndex, subIndex, dataQualityReport) {
    const originalDataItem = subItem.json || subItem;
    console.log(`Processando sub-item ${subIndex + 1}`);

    // Validate required fields
    if (!validateTopicData(originalDataItem)) {
        console.log(`⚠️ Item ${itemIndex + 1}.${subIndex + 1}: Missing required fields`);
        return { posts: [], globalAvgResponseTime: 0 };
    }

    console.log(`Sub-item ${subIndex + 1} tem campos obrigatórios`);

    // Parse arrays
    let arrays = parseArrays(originalDataItem);

    // Apply corrections if needed
    arrays = correctArrayMisalignment(arrays, dataQualityReport, itemIndex);

    // Extract global avg response time
    const globalAvgResponseTime = originalDataItem.max_avg_official_response_time_hours || 0;

    // Validate array lengths
    const minLength = Math.min(
        arrays.topicIds.length,
        arrays.productNames.length,
        arrays.summaries.length,
        arrays.urls.length,
        arrays.urgencies.length
    );

    if (minLength === 0) {
        console.log(`⚠️ minLength é 0, pulando sub-item`);
        return { posts: [], globalAvgResponseTime };
    }

    console.log(`Processando ${minLength} tópicos do sub-item`);

    // Process each topic
    const posts = [];
    for (let topicIndex = 0; topicIndex < minLength; topicIndex++) {
        const individualPost = createIndividualPost(originalDataItem, arrays, topicIndex);
        if (individualPost) {
            posts.push(individualPost);
            console.log(`Tópico ${individualPost.topic_id} processado`);
        }
    }

    return { posts, globalAvgResponseTime };
}

// === ITEM PROCESSING ===
function processItem(item, itemIndex) {
    const itemKey = `item_${itemIndex + 1}`;
    const processingReport = { status: 'starting', error: null, topics_found: 0 };

    console.log(`\n=== PROCESSANDO ITEM ${itemIndex + 1} ===`);

    try {
        // Detect data format
        const formatInfo = detectDataFormat(item);
        if (formatInfo.type === 'unknown') {
            console.log(`❌ Formato não reconhecido para item ${itemIndex + 1}`);
            processingReport.status = 'unknown_format';
            return { processingReport, posts: [], clusters: [], globalAvgResponseTime: 0 };
        }

        console.log(`Formato detectado: ${formatInfo.type}`);
        processingReport.status = `detected_${formatInfo.type}_format`;

        // Validate data quality
        const qualityIssues = validateDataQuality(formatInfo, itemIndex);
        if (qualityIssues.length > 0) {
            processingReport.data_quality_issues = qualityIssues;
        }

        // Validate original data
        if (!formatInfo.originalDataStr || typeof formatInfo.originalDataStr !== 'string') {
            processingReport.status = 'missing_or_invalid_original_summarize_data';
            processingReport.error = `originalDataStr: ${formatInfo.originalDataStr}`;
            console.log(`⚠️ Item ${itemIndex + 1}: originalDataStr inválido`);
            return { processingReport, posts: [], clusters: formatInfo.clusters, globalAvgResponseTime: 0 };
        }

        // Parse JSON if needed
        let originalDataArray = formatInfo.originalDataStr;
        if (typeof originalDataArray === 'string') {
            try {
                originalDataArray = JSON.parse(originalDataArray);
                processingReport.status = 'original_data_parsed';
            } catch (parseError) {
                processingReport.status = 'original_data_parse_failed';
                processingReport.error = parseError.message;
                console.error(`❌ Item ${itemIndex + 1}: JSON parse failed`);
                return { processingReport, posts: [], clusters: formatInfo.clusters, globalAvgResponseTime: 0 };
            }
        }

        // Validate array
        if (!Array.isArray(originalDataArray)) {
            processingReport.status = 'original_data_not_array';
            processingReport.error = `Expected array, got ${typeof originalDataArray}`;
            console.error(`❌ Item ${itemIndex + 1}: não é array`);
            return { processingReport, posts: [], clusters: formatInfo.clusters, globalAvgResponseTime: 0 };
        }

        console.log(`Item ${itemIndex + 1}: array com ${originalDataArray.length} elementos`);

        // Process sub-items
        const allPosts = [];
        let maxGlobalAvgResponseTime = 0;

        for (let subIndex = 0; subIndex < originalDataArray.length; subIndex++) {
            const subItem = originalDataArray[subIndex];
            const result = processSubItem(subItem, itemIndex, subIndex, formatInfo.dataQualityReport);

            allPosts.push(...result.posts);
            processingReport.topics_found += result.posts.length;

            if (result.globalAvgResponseTime > maxGlobalAvgResponseTime) {
                maxGlobalAvgResponseTime = result.globalAvgResponseTime;
            }
        }

        processingReport.status = 'completed_successfully';
        console.log(`Item ${itemIndex + 1} processado com sucesso`);

        return {
            processingReport,
            posts: allPosts,
            clusters: formatInfo.clusters,
            globalAvgResponseTime: maxGlobalAvgResponseTime
        };

    } catch (itemError) {
        processingReport.status = 'critical_error';
        processingReport.error = itemError.message;
        console.error(`❌ Item ${itemIndex + 1}: Critical error: ${itemError.message}`);

        return {
            processingReport,
            posts: [],
            clusters: [],
            globalAvgResponseTime: 0
        };
    }
}

// === MAIN PROCESSING FUNCTION ===
function processAllItems(items) {
    console.log(`\n=== COMEÇANDO PROCESSAMENTO REFATORADO ===`);
    console.log(`Total items recebidos: ${items.length}`);

    const allPosts = [];
    const unansweredPosts = [];
    const products = {};
    const processingReport = {};
    let allClusters = [];
    let globalAvgResponseTime = 0;

    // Log input validation
    console.log(`Iniciando processamento de ${items.length} items`);

    // Process each item
    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        const item = items[itemIndex];
        const result = processItem(item, itemIndex);
        const itemKey = `item_${itemIndex + 1}`;

        processingReport[itemKey] = result.processingReport;

        // Collect results
        allPosts.push(...result.posts);
        allClusters = allClusters.concat(result.clusters);

        if (result.globalAvgResponseTime > globalAvgResponseTime) {
            globalAvgResponseTime = result.globalAvgResponseTime;
        }
    }

    // Categorize posts and organize by product
    for (const post of allPosts) {
        // Initialize product if needed
        if (!products[post.product]) {
            products[post.product] = initializeProduct(post.product);
        }

        // Add to product
        products[post.product].posts.push(post);

        // Categorize if unanswered
        if (!post.answered) {
            const categorization = categorizeUnansweredTopic(post.hours_without_response, post.urgency);
            post.unanswered_category = categorization.category;
            post.unanswered_priority = categorization.priority;
            post.unanswered_emoji = categorization.emoji;
            unansweredPosts.push(post);
        }
    }

    // Update product counters
    for (const product of Object.values(products)) {
        product.totalTopics = product.posts.length;
        product.topicsOfficiallyAnswered = product.posts.filter(p => p.officially_answered).length;
        product.topicsSupportAIAnswered = product.posts.filter(p => p.support_ai_answered).length;
        product.topicsAnswered = product.posts.filter(p => p.answered).length;
    }

    // Final processing summary
    console.log(`\n=== PROCESSAMENTO CONCLUÍDO ===`);
    console.log(`\n=== RESULTADOS FINAIS ===`);
    console.log(`Total posts processados: ${allPosts.length}`);
    console.log(`Total produtos: ${Object.keys(products).length}`);
    console.log(`Total clusters: ${allClusters.length}`);

    return {
        products,
        allPosts,
        unansweredPosts,
        totalTopics: allPosts.length,
        topicsOfficiallyAnswered: allPosts.filter(p => p.officially_answered).length,
        topicsSupportAIAnswered: allPosts.filter(p => p.support_ai_answered).length,
        topicsAnswered: allPosts.filter(p => p.answered).length,
        globalAvgResponseTime,
        processingReport,
        allClusters
    };
}

// === FORMATTING FUNCTIONS ===
function formatProductName(prod) {
    const productMap = {
        'components': 'Components',
        'finsweet_attributes_v2': 'Attributes v2',
        'finsweet_attributes_v1': 'Attributes v1',
        'cms_bridge': 'CMS Bridge',
        'wized': 'Wized',
        'extension': 'Extension',
        'consent-pro': 'Consent Pro',
        'other': 'Other'
    };
    return productMap[prod] || prod;
}

function cleanSummary(text) {
    if (!text || typeof text !== 'string') return '';

    let cleanText = text.startsWith('@') ? text.slice(text.indexOf(' ') + 1) : text;

    // Remove common noise phrases
    const noisePatterns = [
        /provided staging url/gi,
        /webflow read-only link/gi,
        /for context/gi,
        /\. Provided staging and Webflow preview URLs for context/gi,
        /with provided staging URL and video for context/gi
    ];

    noisePatterns.forEach(pattern => {
        cleanText = cleanText.replace(pattern, '').trim();
    });

    // Capitalize first letter
    cleanText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);

    // Truncate if too long
    return cleanText.length > CONSTANTS.MAX_SUMMARY_LENGTH
        ? cleanText.slice(0, CONSTANTS.MAX_SUMMARY_LENGTH - 3) + '...'
        : cleanText;
}

// === REPORT GENERATION ===
function detectRecurringIssues(clusters, allPosts = []) {
    let section = '\n*RECURRING ISSUES*\n';
    section += '_Same problems requiring identical solutions. Consider FAQ/documentation._\n\n';

    try {
        if (!clusters || clusters.length === 0) {
            section += '• No recurring issues detected this week\n';
            return section;
        }

        clusters.forEach(cluster => {
            section += `*"${cluster.cluster_name}" (${cluster.topic_ids.length} topics)*\n`;
            section += `_Confidence: ${Math.round(cluster.confidence_score * 100)}%_\n`;

            // Add topic IDs with links
            section += `• *Topics:* ${cluster.topic_ids.join(', ')}\n`;

            // Add individual topic links if available
            if (allPosts && allPosts.length > 0) {
                const clusterPosts = allPosts.filter(post => cluster.topic_ids.includes(post.topic_id));
                if (clusterPosts.length > 0) {
                    section += `• *Links:*\n`;
                    clusterPosts.forEach(post => {
                        section += `  - Topic ${post.topic_id}: ${post.url}\n`;
                    });
                }
            }

            section += `• *Solution needed:* ${cluster.solution_summary}\n\n`;
        });

    } catch (error) {
        console.error('Error in AI recurring issues detection:', error);
        section += '• Error analyzing recurring issues\n';
    }

    return section;
}

function generateUnansweredSection(unansweredPosts) {
    if (unansweredPosts.length === 0) {
        return '\n*TOPICS AWAITING OFFICIAL SUPPORT*\n_All topics have been answered!_\n\n';
    }

    const sortedPosts = unansweredPosts.sort((a, b) => {
        if (a.unanswered_priority !== b.unanswered_priority) {
            return a.unanswered_priority - b.unanswered_priority;
        }
        return b.hours_without_response - a.hours_without_response;
    });

    const grouped = sortedPosts.reduce((acc, post) => {
        const category = post.unanswered_category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(post);
        return acc;
    }, {});

    let section = '\n*TOPICS AWAITING OFFICIAL SUPPORT*\n';
    section += `*${unansweredPosts.length} topics* need attention\n`;

    const priorityOrder = ['🔴 Critical', '🟡 Moderate', '🟢 Low', 'New'];

    for (const category of priorityOrder) {
        const posts = grouped[category];
        if (!posts || posts.length === 0) continue;

        section += `\n*${category} (${posts.length} topics)*\n`;

        posts.forEach(post => {
            const hoursText = post.hours_without_response > CONSTANTS.MODERATE_HOURS
                ? `${Math.round(post.hours_without_response / 24)}d ago`
                : `${post.hours_without_response}h ago`;

            section += `• ${cleanSummary(post.summary)} - ${hoursText}\n`;
            if (post.url && post.url.trim()) {
                section += `  ${post.url}\n`;
            }
        });
    }

    return section;
}

function generateConciseGlossary(data, avgOfficialResponseTime) {
    const { totalTopics, topicsOfficiallyAnswered, topicsSupportAIAnswered, topicsAnswered, unansweredPosts } = data;

    let glossary = '\n*QUICK REFERENCE*\n\n';

    const answerRate = totalTopics > 0 ? Math.round((topicsAnswered / totalTopics) * 100) : 0;
    glossary += `*Answer Rate:* ${answerRate}% = ${topicsAnswered}/${totalTopics} topics answered by Support team + Support-Finn (AI)\n`;
    glossary += `*Human vs AI:* ${topicsOfficiallyAnswered} human responses (Luis/Pedro/Jesse), ${topicsSupportAIAnswered} Support-Finn (AI) responses\n`;
    glossary += `*SLA Target:* ${CONSTANTS.SLA_HOURS}h weekdays, ${CONSTANTS.WEEKEND_SLA_HOURS}h weekends\n`;
    glossary += `*Symbols:* ⏳ awaiting | ✅ human answered | 🤖 Support-Finn (AI)\n`;

    glossary += `*Urgency Levels:*\n`;
    glossary += `• 🔴 *High:* Critical bugs, broken sites, security issues\n`;
    glossary += `• 🟡 *Medium:* Broken features, UX problems, performance issues\n`;
    glossary += `• 🟢 *Low:* Questions, implementation help, commercial inquiries\n`;

    if (unansweredPosts.length > 0) {
        const topicIds = unansweredPosts.map(post => post.topic_id).filter(Boolean).join(', ');
        glossary += `*Action Items:* ${unansweredPosts.length} topics need attention (${topicIds})\n`;
    }

    if (topicsSupportAIAnswered > 0) {
        const aiEffectiveness = Math.round((topicsSupportAIAnswered / (topicsOfficiallyAnswered + topicsSupportAIAnswered)) * 100);
        glossary += `*Support-Finn (AI) Progress:* ${aiEffectiveness}% of official responses handled by AI\n`;
    }

    return glossary;
}

function generateSlackReport(data, weekRange, avgOfficialResponseTime, clusters) {
    const { products, allPosts, unansweredPosts, totalTopics, topicsOfficiallyAnswered, topicsSupportAIAnswered, topicsAnswered } = data;

    const unanswered = totalTopics - topicsAnswered;
    const answerRate = totalTopics > 0 ? Math.round((topicsAnswered / totalTopics) * 100) : 0;
    const officialAnswerRate = totalTopics > 0 ? Math.round((topicsOfficiallyAnswered / totalTopics) * 100) : 0;
    const aiAnswerRate = totalTopics > 0 ? Math.round((topicsSupportAIAnswered / totalTopics) * 100) : 0;

    const productList = Object.values(products).sort((a, b) => b.totalTopics - a.totalTopics);

    let report = `*Weekly Support Report*\n${weekRange.start_formatted} – ${weekRange.end_formatted}\n\n`;

    // Overview
    report += `*OVERVIEW*\n`;
    report += `_Weekly metrics for official support team (Support-Luis, Support-Pedro, Jesse) + Support-Finn (AI)._\n`;
    report += `• Total Topics: *${totalTopics}*\n`;
    report += `• Topics Answered: *${topicsAnswered}* | Unanswered: *${unanswered}*\n`;
    report += `• Answer Rate: *${answerRate}%* ${answerRate >= 70 ? '✅' : answerRate >= 50 ? '⚠️' : '❌'}\n`;

    const slaCompliantTopics = allPosts.filter(p => {
        // Tópicos respondidos: verificar se respondeu dentro do prazo
        if (p.answered && p.official_response_time_hours !== null) {
            return p.official_response_time_hours <= (p.sla_hours || CONSTANTS.SLA_HOURS);
        }
        // Tópicos não respondidos: verificar se ainda está dentro do prazo
        if (!p.answered) {
            return p.hours_without_response <= (p.sla_hours || CONSTANTS.SLA_HOURS);
        }
        return false;
    }).length;
    const slaCompliance = totalTopics > 0 ? Math.round((slaCompliantTopics / totalTopics) * 100) : 0;

    report += `• SLA Compliance (${CONSTANTS.SLA_HOURS}h): *${slaCompliance}%* ${slaCompliance >= 90 ? '✅' : slaCompliance >= 75 ? '⚠️' : '❌'}\n`;

    const displayAvgTime = avgOfficialResponseTime > 0 ? `${avgOfficialResponseTime}h` : 'N/A';
    const timeStatus = avgOfficialResponseTime > 0 && avgOfficialResponseTime < CONSTANTS.SLA_HOURS ? '✅' :
        avgOfficialResponseTime > 0 && avgOfficialResponseTime <= CONSTANTS.SLA_HOURS ? '⚠️' :
            avgOfficialResponseTime > 0 ? '❌' : '';

    report += `• Avg Response Time: *${displayAvgTime}* ${timeStatus}\n`;
    report += `• Human Support: *${topicsOfficiallyAnswered}* (${officialAnswerRate}%) | Support-Finn (AI): *${topicsSupportAIAnswered}* (${aiAnswerRate}%)\n`;

    if (topicsSupportAIAnswered > 0) {
        const aiEffectiveness = Math.round((topicsSupportAIAnswered / (topicsOfficiallyAnswered + topicsSupportAIAnswered)) * 100);
        report += `• Support-Finn (AI) Effectiveness: *${aiEffectiveness}%* of official responses\n`;
    }

    // By Product
    report += `\n*BY PRODUCT*\n`;
    report += `_Breakdown by product showing official support + AI coverage._\n`;

    for (const product of productList) {
        const percentage = totalTopics > 0 ? Math.round((product.totalTopics / totalTopics) * 100) : 0;
        const humanAnswerRate = product.totalTopics > 0 ? Math.round((product.topicsOfficiallyAnswered / product.totalTopics) * 100) : 0;
        const aiAnswerRate = product.totalTopics > 0 ? Math.round((product.topicsSupportAIAnswered / product.totalTopics) * 100) : 0;
        const totalAnswerRate = product.totalTopics > 0 ? Math.round((product.topicsAnswered / product.totalTopics) * 100) : 0;

        report += `${formatProductName(product.name)}: *${product.totalTopics} topics (${percentage}%)* - ${totalAnswerRate}% answered `;
        report += `(${humanAnswerRate}% human, ${aiAnswerRate}% AI)\n`;
    }

    // Recurring Issues
    report += detectRecurringIssues(clusters, allPosts);

    // Unanswered topics
    report += generateUnansweredSection(unansweredPosts);

    // Details by product
    report += `\n*THIS WEEK'S ISSUES*\n`;

    for (const product of productList) {
        if (product.posts.length === 0) continue;

        report += `\n*${formatProductName(product.name)} (${product.totalTopics} topics)*\n`;

        product.posts.forEach(post => {
            let status = '⏳';
            if (post.officially_answered) status = '✅';
            else if (post.support_ai_answered) status = '🤖';

            const urgencyEmoji = post.urgency === 'High' ? '🔴' : post.urgency === 'Medium' ? '🟡' : '';

            report += `${status} ${urgencyEmoji} ${cleanSummary(post.summary)}\n`;
            if (post.url && post.url.trim()) {
                report += `  ${post.url}\n`;
            }
        });
    }

    // Glossary
    report += generateConciseGlossary(data, avgOfficialResponseTime);

    return report;
}

// === MAIN EXECUTION ===
try {
    const items = $input.all();

    console.log(`=== WEEKLY REPORT GENERATOR - VERSÃO REFATORADA ===`);
    console.log(`Input recebido - Tipo: ${typeof items}, Quantidade: ${items ? items.length : 'N/A'}`);

    validateInput(items);

    const weekRange = getMapperDateRange();
    console.log(`📅 Período do relatório: ${weekRange.start_formatted} - ${weekRange.end_formatted}`);

    // Process all items
    const data = processAllItems(items);

    console.log(`\n=== RELATÓRIO FINAL GERADO ===`);
    console.log(`Métricas principais:`);
    console.log(`   • Total de tópicos: ${data.totalTopics}`);
    console.log(`   • Respondidos por humanos: ${data.topicsOfficiallyAnswered}`);
    console.log(`   • Respondidos por AI: ${data.topicsSupportAIAnswered}`);
    console.log(`   • Total respondidos: ${data.topicsAnswered}`);
    console.log(`   • Aguardando resposta: ${data.unansweredPosts.length}`);
    console.log(`   • Clusters de IA encontrados: ${data.allClusters.length}`);

    const answerRate = data.totalTopics > 0 ? Math.round((data.topicsAnswered / data.totalTopics) * 100) : 0;
    console.log(`   • Taxa de resposta: ${answerRate}%`);

    const aiEffectiveness = data.topicsOfficiallyAnswered + data.topicsSupportAIAnswered > 0
        ? Math.round((data.topicsSupportAIAnswered / (data.topicsOfficiallyAnswered + data.topicsSupportAIAnswered)) * 100)
        : 0;

    const reportText = generateSlackReport(data, weekRange, data.globalAvgResponseTime, data.allClusters);

    const urgencyBreakdown = data.allPosts.reduce((acc, post) => {
        const urgency = post.urgency || 'Low';
        acc[urgency] = (acc[urgency] || 0) + 1;
        return acc;
    }, {});

    return [{
        json: {
            report_text: reportText,

            // Dynamic metrics
            total_topics: data.totalTopics,
            topics_answered: data.topicsAnswered,
            topics_unanswered: data.totalTopics - data.topicsAnswered,
            answer_rate: data.totalTopics > 0 ? Math.round((data.topicsAnswered / data.totalTopics) * 100) : 0,

            // Support-AI specific metrics
            topics_human_answered: data.topicsOfficiallyAnswered,
            topics_support_ai_answered: data.topicsSupportAIAnswered,
            human_answer_rate: data.totalTopics > 0 ? Math.round((data.topicsOfficiallyAnswered / data.totalTopics) * 100) : 0,
            support_ai_answer_rate: data.totalTopics > 0 ? Math.round((data.topicsSupportAIAnswered / data.totalTopics) * 100) : 0,
            ai_effectiveness: aiEffectiveness,
            avg_response_time_hours: data.globalAvgResponseTime,

            // Legacy fields
            topics_officially_answered: data.topicsOfficiallyAnswered,
            topics_awaiting_official_support: data.unansweredPosts.length,
            official_answer_rate: data.totalTopics > 0 ? Math.round((data.topicsOfficiallyAnswered / data.totalTopics) * 100) : 0,
            sla_compliance_rate: data.totalTopics > 0 ? Math.round((data.allPosts.filter(p => {
                // Tópicos respondidos: verificar se respondeu dentro do prazo
                if (p.answered && p.official_response_time_hours !== null) {
                    return p.official_response_time_hours <= (p.sla_hours || CONSTANTS.SLA_HOURS);
                }
                // Tópicos não respondidos: verificar se ainda está dentro do prazo
                if (!p.answered) {
                    return p.hours_without_response <= (p.sla_hours || CONSTANTS.SLA_HOURS);
                }
                return false;
            }).length / data.totalTopics) * 100) : 0,
            recurring_issues_count: data.allClusters.length,
            ai_clusters_detected: data.allClusters,
            urgency_breakdown: urgencyBreakdown,

            products_breakdown: Object.fromEntries(
                Object.values(data.products).map(p => [
                    p.name,
                    {
                        topics: p.totalTopics,
                        answered: p.topicsAnswered,
                        human_answered: p.topicsOfficiallyAnswered,
                        support_ai_answered: p.topicsSupportAIAnswered,
                        answer_rate: p.totalTopics > 0 ? Math.round((p.topicsAnswered / p.totalTopics) * 100) : 0,
                        human_answer_rate: p.totalTopics > 0 ? Math.round((p.topicsOfficiallyAnswered / p.totalTopics) * 100) : 0,
                        support_ai_answer_rate: p.totalTopics > 0 ? Math.round((p.topicsSupportAIAnswered / p.totalTopics) * 100) : 0
                    }
                ])
            ),

            debug_info: {
                items_processed: items.length,
                products_detected: Object.keys(data.products),
                all_posts_count: data.allPosts.length,
                week_range: weekRange,
                ai_clustering_enabled: true,
                clusters_found: data.allClusters.length,
                support_ai_tracking_enabled: true,
                ai_effectiveness_percentage: aiEffectiveness,
                data_quality_items_with_misalignment: data.processingReport ?
                    Object.values(data.processingReport).filter(r => r.status?.includes('misalignment')).length : 0,
                processing_report: data.processingReport,
                refactored_version: true,
                constants_used: CONSTANTS
            }
        }
    }];

} catch (error) {
    console.error('Error in report generation:', error);

    return [{
        json: {
            report_text: `❌ *Error generating report*\n\n*Error:* ${error.message}\n\n_Please check the input data structure and try again._`,
            error: true,
            error_message: error.message,
            error_stack: error.stack,
            timestamp: new Date().toISOString()
        }
    }];
}