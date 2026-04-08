const { Pool } = require("pg");

function getDayKey(date) {
  return date.toISOString().slice(0, 10);
}

function getMonthKey(date) {
  return date.toISOString().slice(0, 7);
}

function createPostgresAnalyticsRepository({ connectionString }) {
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost")
      ? false
      : {
          rejectUnauthorized: false,
        },
  });

  let initPromise = null;
  let lastError = null;
  let writeAttempts = 0;
  let writeSuccesses = 0;

  async function ensureInit() {
    if (initPromise) return initPromise;

    initPromise = (async () => {
      // Drop old table if it has the reserved 'count' column name that caused silent SQL failures
      await pool.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name   = 'analytics_counters'
              AND column_name  = 'count'
          ) THEN
            DROP TABLE public.analytics_counters;
          END IF;
        END $$
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS public.analytics_counters (
          scope            TEXT        NOT NULL,
          key              TEXT        NOT NULL,
          request_count    BIGINT      NOT NULL DEFAULT 0,
          last_recorded_at TIMESTAMPTZ NULL,
          PRIMARY KEY (scope, key)
        )
      `);
    })().catch((err) => {
      initPromise = null;
      lastError = err.message;
      throw err;
    });

    return initPromise;
  }

  async function incrementRequestCounters(now) {
    writeAttempts += 1;
    await ensureInit();

    const dayKey = getDayKey(now);
    const monthKey = getMonthKey(now);
    const ts = now.toISOString();

    const upsert = `
      INSERT INTO public.analytics_counters AS t (scope, key, request_count, last_recorded_at)
      VALUES ($1, $2, 1, $3::timestamptz)
      ON CONFLICT (scope, key)
      DO UPDATE SET
        request_count    = t.request_count + 1,
        last_recorded_at = EXCLUDED.last_recorded_at
    `;

    try {
      await pool.query(upsert, ["day",    dayKey,      ts]);
      await pool.query(upsert, ["month",  monthKey,    ts]);
      await pool.query(upsert, ["global", "__total__", ts]);
      writeSuccesses += 1;
      lastError = null;
    } catch (err) {
      lastError = err.message;
      throw err;
    }
  }

  async function getSummary(now) {
    await ensureInit();

    const dayKey = getDayKey(now);
    const monthKey = getMonthKey(now);
    const { rows } = await pool.query(
      "SELECT scope, key, request_count, last_recorded_at FROM public.analytics_counters",
    );

    const daily = {};
    const monthly = {};
    let totalRequests = 0;
    let lastRecordedAt = null;

    rows.forEach((row) => {
      const value = Number(row.request_count || 0);
      if (row.scope === "day") {
        daily[row.key] = value;
      } else if (row.scope === "month") {
        monthly[row.key] = value;
      } else if (row.scope === "global" && row.key === "__total__") {
        totalRequests = value;
      }

      if (row.last_recorded_at) {
        const candidate = new Date(row.last_recorded_at).toISOString();
        if (!lastRecordedAt || candidate > lastRecordedAt) {
          lastRecordedAt = candidate;
        }
      }
    });

    const result = {
      totalRequests,
      today: {
        date: dayKey,
        count: Number(daily[dayKey] || 0),
      },
      currentMonth: {
        month: monthKey,
        count: Number(monthly[monthKey] || 0),
      },
      daily,
      monthly,
      lastRecordedAt,
      debug: {
        writeAttempts,
        writeSuccesses,
        lastError,
      },
    };
    return result;
  }

  return {
    incrementRequestCounters,
    getSummary,
  };
}

module.exports = { createPostgresAnalyticsRepository };