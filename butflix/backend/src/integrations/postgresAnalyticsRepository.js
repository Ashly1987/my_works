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

  function ensureInit() {
    if (!initPromise) {
      initPromise = pool
        .query("CREATE SCHEMA IF NOT EXISTS app_private")
        .then(() =>
          pool.query(`
            CREATE TABLE IF NOT EXISTS app_private.analytics_counters (
              scope TEXT NOT NULL,
              key TEXT NOT NULL,
              count BIGINT NOT NULL DEFAULT 0,
              last_recorded_at TIMESTAMPTZ NULL,
              PRIMARY KEY (scope, key)
            )
          `),
        )
        .catch((err) => {
          initPromise = null;
          throw err;
        });
    }

    return initPromise;
  }

  async function incrementRequestCounters(now) {
    await ensureInit();

    const dayKey = getDayKey(now);
    const monthKey = getMonthKey(now);
    const timestamp = now.toISOString();

    await pool.query(
      `
      INSERT INTO app_private.analytics_counters (scope, key, count, last_recorded_at)
      VALUES
        ('day', $1, 1, $3::timestamptz),
        ('month', $2, 1, $3::timestamptz),
        ('global', '__total__', 1, $3::timestamptz)
      ON CONFLICT (scope, key)
      DO UPDATE
      SET
        count = analytics_counters.count + 1,
        last_recorded_at = EXCLUDED.last_recorded_at;
    `,
      [dayKey, monthKey, timestamp],
    );
  }

  async function getSummary(now) {
    await ensureInit();

    const dayKey = getDayKey(now);
    const monthKey = getMonthKey(now);
    const { rows } = await pool.query(
      "SELECT scope, key, count, last_recorded_at FROM app_private.analytics_counters",
    );

    const daily = {};
    const monthly = {};
    let totalRequests = 0;
    let lastRecordedAt = null;

    rows.forEach((row) => {
      const value = Number(row.count || 0);
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

    return {
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
    };
  }

  return {
    incrementRequestCounters,
    getSummary,
  };
}

module.exports = { createPostgresAnalyticsRepository };