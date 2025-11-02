// === WEEKLY REPORT GENERATOR - ENHANCED VERSION ===
// Node Name: "Weekly Report Generator - Enhanced with Wized & SLA"
// Description: Complete report generator with Wized admin support and advanced SLA tracking

// === CONFIGURATION ===
const CONFIG = {
    CATEGORY_MAP: {
        5: 'attributes',
        7: 'community',
        14: 'finsweet-components',
        18: 'cms-bridge',
        22: 'wized',        // ← CONFIRMED: Category 22 = Wized
        3: 'staff',
        8: 'extension',
        24: 'consent-pro',  // ← NEW: Category 24 = Consent Pro
        default: 'other'
    },

    // ✅ HYBRID SUPPORT DETECTION (Best of both)
    SUPPORT_DETECTION: {
        // Standard support users for most products
        STANDARD_SUPPORT: ['Support-Finn', 'Support-Luis', 'Support-Pedro', 'jesse.muiruri'],

        // Wized-specific configuration
        WIZED_CATEGORY_ID: 22,

        // ✅ ADMIN ONLY: apenas admin para Wized
        WIZED_ADMIN_FIELDS: ['admin'], // admin: true apenas

        // ✅ DETAILED TRACKING: enabled (from provided version)
        WIZED_DEBUG: true
    },

    // ✅ ENHANCED SLA CONFIGURATION (from our version)
    SLA: {
        WEEKDAY_HOURS: 24,
        WEEKEND_HOURS: 48,

        // SLA Thresholds for emoji logic
        COMPLIANCE_THRESHOLDS: {
            EXCELLENT: 95,  // 🟢
            GOOD: 85,       // ✅
            WARNING: 70,    // ⚠️
            CRITICAL: 0     // ❌
        },

        RESPONSE_TIME_THRESHOLDS: {
            EXCELLENT: 0.5,  // < 50% of SLA (12h)
            GOOD: 0.75,      // < 75% of SLA (18h)  
            WARNING: 1.0,    // < 100% of SLA (24h)
            CRITICAL: 999    // > SLA
        }
    },

    // Date range configuration
    DATE_RANGE: {
        DAYS_BACK: 7,
        END_OFFSET_DAYS: 1 // Yesterday
    }
};

// === UTILITY FUNCTIONS ===
function logDebug(message, data = null) {
    console.log(`🔍 HYBRID MAPPER DEBUG: ${message}`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
}

function validateInput(items) {
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error("Invalid input: Expected non-empty array of items");
    }

    logDebug(`Input validation passed: ${items.length} items received`);
    return true;
}

// === DATE RANGE CALCULATION ===
function getLastWeekRange() {
    const now = new Date();

    // Calculate end date (yesterday)
    const endDate = new Date(now);
    endDate.setDate(now.getDate() - CONFIG.DATE_RANGE.END_OFFSET_DAYS);
    endDate.setHours(23, 59, 59, 999);

    // Calculate start date (7 days ago)
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - CONFIG.DATE_RANGE.DAYS_BACK);
    startDate.setHours(0, 0, 0, 0);

    logDebug('Date range calculated', {
        today: now.toDateString(),
        startDate: startDate.toDateString(),
        endDate: endDate.toDateString(),
        daysBack: CONFIG.DATE_RANGE.DAYS_BACK
    });

    return { start: startDate, end: endDate };
}

// === SLA CALCULATION ===
function calculateSLA(createdDate) {
    if (!(createdDate instanceof Date) || isNaN(createdDate)) {
        logDebug('Invalid date provided to calculateSLA', createdDate);
        return { weekend_created: false, sla_hours: CONFIG.SLA.WEEKDAY_HOURS };
    }

    const dayOfWeek = createdDate.getDay(); // 0=Sunday, 6=Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const slaHours = isWeekend ? CONFIG.SLA.WEEKEND_HOURS : CONFIG.SLA.WEEKDAY_HOURS;

    logDebug(`SLA calculated for ${createdDate.toDateString()}`, {
        dayOfWeek,
        isWeekend,
        slaHours
    });

    return {
        weekend_created: isWeekend,
        sla_hours: slaHours
    };
}

// === RESPONSE TIME CALCULATION ===
function calculateHoursWithoutResponse(topicCreatedAt, officialReply, currentTime) {
    if (officialReply) {
        return 0; // Already has official response
    }

    if (!(topicCreatedAt instanceof Date) || !(currentTime instanceof Date)) {
        logDebug('Invalid dates in calculateHoursWithoutResponse', {
            topicCreatedAt,
            currentTime
        });
        return 0;
    }

    const hoursWithoutResponse = Math.round((currentTime - topicCreatedAt) / 3600000);
    return Math.max(0, hoursWithoutResponse);
}

// === CATEGORY MAPPING ===
function getCategoryName(categoryId) {
    // Handle null/undefined category IDs
    const safeId = categoryId || 0;
    const category = CONFIG.CATEGORY_MAP[safeId] || CONFIG.CATEGORY_MAP.default;
    logDebug(`Category mapped: ${categoryId} (safe: ${safeId}) -> ${category}`);
    return category;
}

// === ✅ ENHANCED SUPPORT STAFF VALIDATION - ADMIN ONLY FOR WIZED ===
function isOfficialSupport(username, categoryId, postData = {}) {
    // ✅ WIZED SPECIAL DETECTION: admin OU staff (ambos contam como oficial)
    if (categoryId === CONFIG.SUPPORT_DETECTION.WIZED_CATEGORY_ID) {
        const isWizedAdmin = postData.admin === true;
        const isWizedStaff = postData.staff === true;
        const isWizedOfficial = isWizedAdmin || isWizedStaff; // Admin OU Staff

        if (CONFIG.SUPPORT_DETECTION.WIZED_DEBUG) {
            logDebug(`🎯 WIZED ADMIN+STAFF CHECK for ${username}:`, {
                categoryId,
                admin: postData.admin,
                staff: postData.staff,
                moderator: postData.moderator,
                isWizedAdmin,
                isWizedStaff,
                isWizedOfficial,
                decision: isWizedOfficial ? 'OFFICIAL (ADMIN/STAFF)' : 'NOT OFFICIAL'
            });
        }

        return isWizedOfficial;
    }

    // ✅ STANDARD DETECTION: Para outros produtos
    const isStandardSupport = CONFIG.SUPPORT_DETECTION.STANDARD_SUPPORT.includes(username);

    if (CONFIG.SUPPORT_DETECTION.WIZED_DEBUG) {
        logDebug(`📝 STANDARD SUPPORT CHECK for ${username}:`, {
            categoryId,
            categoryName: getCategoryName(categoryId),
            isStandardSupport
        });
    }

    return isStandardSupport;
}

// ✅ ENHANCED SLA STATUS CALCULATOR (from our version)
function getSLAStatus(slaCompliance, avgResponseTime, slaTarget = CONFIG.SLA.WEEKDAY_HOURS) {
    const complianceThresholds = CONFIG.SLA.COMPLIANCE_THRESHOLDS;
    const timeThresholds = CONFIG.SLA.RESPONSE_TIME_THRESHOLDS;

    // SLA Compliance emoji
    let complianceEmoji;
    if (slaCompliance >= complianceThresholds.EXCELLENT) complianceEmoji = '🟢';
    else if (slaCompliance >= complianceThresholds.GOOD) complianceEmoji = '✅';
    else if (slaCompliance >= complianceThresholds.WARNING) complianceEmoji = '⚠️';
    else complianceEmoji = '❌';

    // Response Time emoji
    let timeEmoji;
    if (avgResponseTime <= 0) timeEmoji = ''; // No data
    else if (avgResponseTime <= slaTarget * timeThresholds.EXCELLENT) timeEmoji = '🟢';
    else if (avgResponseTime <= slaTarget * timeThresholds.GOOD) timeEmoji = '✅';
    else if (avgResponseTime <= slaTarget * timeThresholds.WARNING) timeEmoji = '⚠️';
    else timeEmoji = '❌';

    // Detailed explanation
    const complianceLevel = slaCompliance >= complianceThresholds.EXCELLENT ? 'Excellent' :
        slaCompliance >= complianceThresholds.GOOD ? 'Good' :
            slaCompliance >= complianceThresholds.WARNING ? 'Needs Attention' : 'Critical';

    const timeLevel = avgResponseTime <= 0 ? 'No Data' :
        avgResponseTime <= slaTarget * timeThresholds.EXCELLENT ? 'Excellent' :
            avgResponseTime <= slaTarget * timeThresholds.GOOD ? 'Good' :
                avgResponseTime <= slaTarget * timeThresholds.WARNING ? 'Within SLA' : 'Over SLA';

    logDebug('🎯 SLA Status Analysis', {
        slaCompliance: `${slaCompliance}% (${complianceLevel})`,
        avgResponseTime: `${avgResponseTime}h (${timeLevel})`,
        slaTarget: `${slaTarget}h`,
        emojis: { compliance: complianceEmoji, time: timeEmoji }
    });

    return {
        complianceEmoji,
        timeEmoji,
        complianceLevel,
        timeLevel
    };
}

// === DATA VALIDATION FUNCTIONS ===
function validatePostData(post, index) {
    const requiredFields = ['topic_id', 'post_number', 'created_at'];
    const missingFields = requiredFields.filter(field => !post[field]);

    if (missingFields.length > 0) {
        logDebug(`⚠️ Post ${index}: Missing required fields: ${missingFields.join(', ')}`);
        return false;
    }

    return true;
}

function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/\s+/g, ' ');
}

// === ENHANCED ERROR HANDLING ===
function safeParseDate(dateString, fallback = null) {
    if (!dateString) return fallback;

    const date = new Date(dateString);
    if (isNaN(date)) {
        logDebug(`⚠️ Invalid date string: ${dateString}`);
        return fallback;
    }

    return date;
}

// === PERFORMANCE MONITORING ===
function createPerformanceMonitor() {
    const startTime = Date.now();

    return {
        checkpoint: (label) => {
            const elapsed = Date.now() - startTime;
            logDebug(`⏱️ Performance checkpoint - ${label}: ${elapsed}ms`);
        },

        finish: () => {
            const totalTime = Date.now() - startTime;
            logDebug(`⏱️ Total processing time: ${totalTime}ms`);
            return totalTime;
        }
    };
}

// === MAIN PROCESSING FUNCTION ===
function processTopics(items) {
    const monitor = createPerformanceMonitor();

    logDebug('=== HYBRID ENHANCED PROCESSING STARTED ===');

    try {
        validateInput(items);
        monitor.checkpoint('Input validation');

        const { start, end } = getLastWeekRange();
        const topics = {};
        const now = new Date();

        // ✅ ENHANCED STATS TRACKING (from provided version + our additions)
        const stats = {
            itemsProcessed: 0,
            validPosts: 0,
            topicsInRange: 0,
            postsAdded: 0,
            wizedTopicsFound: 0,
            wizedAdminReplies: 0,
            wizedStaffReplies: 0,  // ✅ NEW: track staff separately
            wizedTotalOfficialReplies: 0
        };

        // Step 1: Process items and create topics
        items.forEach(({ json: p }, index) => {
            stats.itemsProcessed++;

            if (!p) {
                logDebug(`Item ${index}: No json property found`);
                return;
            }

            if (!validatePostData(p, index)) {
                return;
            }

            stats.validPosts++;

            if (p.post_number === 1) {
                const created = safeParseDate(p.created_at);

                if (created && created >= start && created <= end) {
                    const categoryId = p.category_id || 0; // Ensure consistent category handling
                    topics[p.topic_id] = {
                        topic_id: p.topic_id,
                        topic_title: sanitizeString(p.topic_title) || 'Untitled',
                        topic_slug: sanitizeString(p.topic_slug) || '',
                        topic_created_at: created,
                        category_id: categoryId,
                        posts: []
                    };
                    stats.topicsInRange++;

                    // ✅ ENHANCED WIZED TRACKING
                    if (categoryId === CONFIG.SUPPORT_DETECTION.WIZED_CATEGORY_ID) {
                        stats.wizedTopicsFound++;
                        logDebug(`🎯 WIZED TOPIC FOUND: ${p.topic_id} - ${p.topic_title}`);
                    }
                }
            }
        });

        monitor.checkpoint('Topics creation');

        // Step 2: Add posts to topics
        items.forEach(({ json: p }) => {
            if (p && topics[p.topic_id]) {
                topics[p.topic_id].posts.push(p);
                stats.postsAdded++;

                // ✅ ENHANCED WIZED REPLY TRACKING (apenas admin)
                const categoryId = p.category_id || 0; // Fallback for null/undefined
                if (categoryId === CONFIG.SUPPORT_DETECTION.WIZED_CATEGORY_ID && p.post_number > 1) {
                    const isAdmin = p.admin === true;
                    const isStaff = p.staff === true;

                    if (isAdmin) {
                        stats.wizedAdminReplies++;
                        stats.wizedTotalOfficialReplies++;
                        logDebug(`🎯 WIZED ADMIN REPLY: Topic ${p.topic_id}, User: ${p.username}`);
                    }

                    // Agora staff também conta como oficial para Wized
                    if (isStaff && !isAdmin) {
                        stats.wizedStaffReplies++;
                        stats.wizedTotalOfficialReplies++;
                        logDebug(`📝 WIZED STAFF REPLY (oficial): Topic ${p.topic_id}, User: ${p.username}`);
                    }
                }
            }
        });

        monitor.checkpoint('Posts grouping');

        // ✅ ENHANCED WIZED DIAGNOSTIC
        const wizedTopics = Object.values(topics).filter(t => t.category_id === CONFIG.SUPPORT_DETECTION.WIZED_CATEGORY_ID);
        if (wizedTopics.length > 0 && CONFIG.SUPPORT_DETECTION.WIZED_DEBUG) {
            logDebug(`🔍 WIZED TOPICS DETAILED ANALYSIS: ${wizedTopics.length} topics found`);

            wizedTopics.forEach(topic => {
                const adminPosts = topic.posts.filter(p => p.admin === true);
                const staffPosts = topic.posts.filter(p => p.staff === true);
                const moderatorPosts = topic.posts.filter(p => p.moderator === true);

                logDebug(`Wized Topic ${topic.topic_id}: "${topic.topic_title}"`, {
                    totalPosts: topic.posts.length,
                    adminPosts: adminPosts.length,
                    staffPosts: staffPosts.length,
                    moderatorPosts: moderatorPosts.length,
                    adminUsers: adminPosts.map(p => p.username),
                    staffUsers: staffPosts.map(p => p.username),
                    allUsers: topic.posts.map(p => `${p.username} (admin:${p.admin}, staff:${p.staff})`)
                });
            });
        }

        logDebug('Enhanced Processing Statistics', stats);

        if (stats.topicsInRange === 0) {
            logDebug('⚠️ No topics found in date range');
            return [{
                json: {
                    warning: true,
                    message: 'No topics found in the specified date range',
                    date_range: { start: start.toISOString(), end: end.toISOString() },
                    stats,
                    timestamp: now.toISOString()
                }
            }];
        }

        // Step 3: Process topics and build results
        const result = [];
        const metrics = {
            totalPosts: 0,
            topicsAnswered: 0,
            topicsOfficiallyAnswered: 0,
            responseTimes: [],
            officialResponseTimes: []
        };

        Object.values(topics).forEach((topic) => {
            // Sort posts chronologically
            topic.posts.sort((a, b) => {
                const dateA = safeParseDate(a.created_at, new Date(0));
                const dateB = safeParseDate(b.created_at, new Date(0));
                return dateA - dateB;
            });

            // Find responses
            const firstReply = topic.posts.find(p => p.post_number > 1);
            const answered = !!firstReply;

            // ✅ HYBRID OFFICIAL REPLY DETECTION
            const officialReply = topic.posts.find(p => {
                if (p.post_number <= 1) return false;
                return isOfficialSupport(p.username, topic.category_id, p);
            });
            const officiallyAnswered = !!officialReply;

            // Enhanced logging for Wized topics
            if (topic.category_id === CONFIG.SUPPORT_DETECTION.WIZED_CATEGORY_ID) {
                logDebug(`🎯 WIZED TOPIC PROCESSED: ${topic.topic_id}`, {
                    title: topic.topic_title,
                    totalPosts: topic.posts.length,
                    answered,
                    officiallyAnswered,
                    officialReplier: officialReply?.username || 'none',
                    officialType: officialReply ? (officialReply.admin ? 'admin' : 'não-oficial') : 'none',
                    adminReplies: topic.posts.filter(p => p.admin === true).length,
                    staffReplies: topic.posts.filter(p => p.staff === true).length
                });
            }

            // Calculate metrics
            const slaInfo = calculateSLA(topic.topic_created_at);
            const hoursWithoutResponse = calculateHoursWithoutResponse(
                topic.topic_created_at,
                officialReply,
                now
            );

            // Update global metrics
            if (answered) {
                metrics.topicsAnswered++;
                const responseTime = safeParseDate(firstReply.created_at) - topic.topic_created_at;
                if (responseTime > 0) {
                    metrics.responseTimes.push(responseTime);
                }
            }

            if (officiallyAnswered) {
                metrics.topicsOfficiallyAnswered++;
                const officialResponseTime = safeParseDate(officialReply.created_at) - topic.topic_created_at;
                if (officialResponseTime > 0) {
                    metrics.officialResponseTimes.push(officialResponseTime);
                }
            }

            metrics.totalPosts += topic.posts.length;

            // Build comprehensive result object
            result.push({
                // === CORE TOPIC DATA ===
                topic_id: topic.topic_id,
                topic_title: topic.topic_title,
                topic_slug: topic.topic_slug,
                topic_created_at: topic.topic_created_at.toISOString(),
                category_name: getCategoryName(topic.category_id),

                // === RESPONSE DATA ===
                first_response_at: answered ? safeParseDate(firstReply.created_at)?.toISOString() : null,
                response_time_ms: answered && firstReply ?
                    safeParseDate(firstReply.created_at) - topic.topic_created_at : null,
                response_time_hours: answered && firstReply ?
                    Number(((safeParseDate(firstReply.created_at) - topic.topic_created_at) / 3600000).toFixed(2)) : null,
                topic_answered: answered,

                // === ENHANCED OFFICIAL SUPPORT DATA ===
                officially_answered: officiallyAnswered,
                official_response_at: officiallyAnswered ?
                    safeParseDate(officialReply.created_at)?.toISOString() : null,
                official_responder: officiallyAnswered ? officialReply.username : null,
                official_responder_type: officiallyAnswered ?
                    (officialReply.admin ? 'admin' : 'staff') : null,
                official_response_time_ms: officiallyAnswered ?
                    safeParseDate(officialReply.created_at) - topic.topic_created_at : null,
                official_response_time_hours: officiallyAnswered ?
                    Number(((safeParseDate(officialReply.created_at) - topic.topic_created_at) / 3600000).toFixed(2)) : null,
                hours_without_response: hoursWithoutResponse,

                // === SLA DATA ===
                weekend_created: slaInfo.weekend_created,
                sla_hours: slaInfo.sla_hours,

                // === POST DATA ===
                posts_count: topic.posts.length,
                first_post_id: topic.posts[0]?.id || null,
                first_post_username: topic.posts[0]?.username || '',
                first_post_number: topic.posts[0]?.post_number || 1,
                first_post_created_at: topic.posts[0]?.created_at || topic.topic_created_at.toISOString(),
                first_post_content: topic.posts[0]?.cooked || '',
                first_post_raw: topic.posts[0]?.raw || '',
                first_post_url: topic.posts[0]?.post_url || ''
            });
        });

        monitor.checkpoint('Topics processing');

        // Calculate final averages
        const avgResponseHours = metrics.responseTimes.length > 0 ?
            Number((metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length / 3600000).toFixed(2)) : 0;

        const avgOfficialResponseHours = metrics.officialResponseTimes.length > 0 ?
            Number((metrics.officialResponseTimes.reduce((a, b) => a + b, 0) / metrics.officialResponseTimes.length / 3600000).toFixed(2)) : 0;

        const processingTime = monitor.finish();

        // ✅ ENHANCED FINAL LOGGING WITH WIZED BREAKDOWN
        logDebug('=== HYBRID PROCESSING COMPLETED SUCCESSFULLY ===', {
            totalTopics: result.length,
            topicsAnswered: metrics.topicsAnswered,
            topicsOfficiallyAnswered: metrics.topicsOfficiallyAnswered,
            avgResponseTime: `${avgResponseHours}h`,
            avgOfficialResponseTime: `${avgOfficialResponseHours}h`,
            processingTimeMs: processingTime,
            wizedBreakdown: {
                topicsFound: stats.wizedTopicsFound,
                adminReplies: stats.wizedAdminReplies,
                staffReplies: stats.wizedStaffReplies,
                totalOfficialReplies: stats.wizedTotalOfficialReplies
            },
            stats
        });

        // Return enhanced results
        return result.map(item => ({
            json: {
                ...item,
                // === GLOBAL METRICS ===
                total_posts: metrics.totalPosts,
                topics_count: result.length,
                topics_answered: metrics.topicsAnswered,
                avg_response_time_hours: avgResponseHours,
                topics_officially_answered: metrics.topicsOfficiallyAnswered,
                official_answer_rate: result.length > 0 ?
                    Number(((metrics.topicsOfficiallyAnswered / result.length) * 100).toFixed(1)) : 0,
                avg_official_response_time_hours: avgOfficialResponseHours,

                // === ✅ HYBRID ENHANCED DEBUG INFO ===
                debug_info: {
                    config_used: CONFIG,
                    processing_stats: stats,
                    processing_time_ms: processingTime,

                    // ✅ DETAILED WIZED DETECTION INFO
                    wized_detection: {
                        enabled: true,
                        category_id: CONFIG.SUPPORT_DETECTION.WIZED_CATEGORY_ID,
                        detection_fields: ['admin', 'staff'],
                        topics_found: stats.wizedTopicsFound,
                        admin_replies_found: stats.wizedAdminReplies,
                        staff_replies_found: stats.wizedStaffReplies,
                        total_official_replies: stats.wizedTotalOfficialReplies,
                        detection_method: 'admin OR staff'
                    },

                    // ✅ SLA THRESHOLDS INFO
                    sla_config: {
                        compliance_thresholds: CONFIG.SLA.COMPLIANCE_THRESHOLDS,
                        response_time_thresholds: CONFIG.SLA.RESPONSE_TIME_THRESHOLDS,
                        weekday_hours: CONFIG.SLA.WEEKDAY_HOURS,
                        weekend_hours: CONFIG.SLA.WEEKEND_HOURS
                    },

                    date_range: {
                        start: start.toISOString(),
                        end: end.toISOString()
                    },
                    timestamp: now.toISOString(),
                    version: 'hybrid_optimized_v1.0'
                }
            }
        }));

    } catch (error) {
        logDebug('❌ CRITICAL ERROR in hybrid processing', {
            error: error.message,
            stack: error.stack
        });

        return [{
            json: {
                error: true,
                error_message: error.message,
                error_stack: error.stack,
                timestamp: new Date().toISOString(),
                debug_info: {
                    config_used: CONFIG,
                    input_length: items ? items.length : 'null'
                }
            }
        }];
    }
}

// === FINAL EXECUTION ===
logDebug('=== STARTING HYBRID WEEKLY TOPICS MAPPER ===');

// Execute main processing function
const result = processTopics(items);

// Enhanced final summary with detailed Wized tracking
if (result && result.length > 0 && !result[0].json.error) {
    logDebug(`✅ Successfully processed ${result.length} topics`);

    // Log Wized-specific results
    const wizedStats = result[0].json.debug_info?.wized_detection;
    if (wizedStats) {
        logDebug(`🎯 WIZED HYBRID DETECTION SUMMARY:`, {
            method: wizedStats.detection_method,
            topicsFound: wizedStats.topics_found,
            adminReplies: wizedStats.admin_replies_found,
            staffReplies: wizedStats.staff_replies_found,
            totalOfficial: wizedStats.total_official_replies,
            detectionRate: wizedStats.topics_found > 0 ?
                `${((wizedStats.total_official_replies / wizedStats.topics_found) * 100).toFixed(1)}%` : '0%'
        });
    }
} else {
    logDebug(`⚠️ Processing completed with warnings or errors`);
}

return result;