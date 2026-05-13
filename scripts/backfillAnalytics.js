const { Client, Databases, Query } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = "69617e75000c6c010a75";
const METRICS_COLLECTION = "analytics_daily_metrics";

async function fetchAll(collection) {
    let all = [];
    let lastId = null;
    while(true) {
        const queries = [Query.limit(100)];
        if (lastId) queries.push(Query.cursorAfter(lastId));
        const res = await databases.listDocuments(DATABASE_ID, collection, queries);
        all.push(...res.documents);
        if (res.documents.length < 100) break;
        lastId = res.documents[res.documents.length - 1].$id;
    }
    return all;
}

const metricsMap = {};

function addMetric(dateStr, metric, value, category = null, dimension = null) {
    const d = dateStr.substring(0, 10);
    const key = `${d}_${metric}_${category || 'none'}_${dimension || 'none'}`;
    if (!metricsMap[key]) {
        metricsMap[key] = { date: d, metric, value: 0, category, dimension };
    }
    metricsMap[key].value += value;
}

async function backfill() {
    console.log("Fetching users...");
    const users = await fetchAll("user");
    for (const u of users) {
        addMetric(u.$createdAt, "DAILY_SIGNUPS", 1);
        if (u.department) addMetric(u.$createdAt, "DAILY_SIGNUPS_BY_DEPT", 1, null, u.department);
    }

    console.log("Fetching contributors...");
    const contributors = await fetchAll("contributors");
    for (const c of contributors) {
        addMetric(c.$createdAt, "DAILY_CONTRIBUTOR_APPLICATIONS", 1);
    }

    console.log("Fetching courses...");
    const courses = await fetchAll("courses");
    for (const c of courses) {
        addMetric(c.$createdAt, "DAILY_COURSES_CREATED", 1);
    }

    console.log("Fetching library (uploads)...");
    const uploads = await fetchAll("library");
    for (const u of uploads) {
        addMetric(u.$createdAt, "DAILY_UPLOADS", 1);
    }

    console.log("Fetching wallet history...");
    try {
        const wallet_history = await fetchAll("wallet_history");
        for (const w of wallet_history) {
            if (w.type === 'deposit' && w.status === 'successful') {
                addMetric(w.$createdAt, "DAILY_WALLET_TOPUPS", 1);
                addMetric(w.$createdAt, "DAILY_WALLET_TOPUP_AMOUNT", w.amount || 0);
            }
        }
    } catch(e) { console.log("No wallet history collection found or empty"); }

    console.log("Fetching subscriptions...");
    try {
        const subscriptions = await fetchAll("subscriptions");
        for (const s of subscriptions) {
            addMetric(s.$createdAt, "DAILY_SUBSCRIPTIONS", 1);
            addMetric(s.$createdAt, "DAILY_SUBSCRIPTION_REVENUE", s.amount || 0);
        }
    } catch(e) { console.log("No subscriptions found"); }

    console.log("Saving to Appwrite...");
    const keys = Object.keys(metricsMap);
    for (let i = 0; i < keys.length; i++) {
        const doc = metricsMap[keys[i]];
        await databases.createDocument(DATABASE_ID, METRICS_COLLECTION, "unique()", {
            date: doc.date,
            metric: doc.metric,
            value: doc.value,
            category: doc.category,
            dimension: doc.dimension
        });
        if (i % 50 === 0) console.log(`Saved ${i}/${keys.length}`);
    }
    console.log(`Saved ${keys.length} backfilled metrics!`);
}

backfill().catch(console.error);
