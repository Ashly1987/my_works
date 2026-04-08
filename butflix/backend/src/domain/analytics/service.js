function getDayKey(date) {
  return date.toISOString().slice(0, 10);
}

function getMonthKey(date) {
  return date.toISOString().slice(0, 7);
}

function incrementCounter(map, key) {
  map[key] = Number(map[key] || 0) + 1;
}

function createFileAnalyticsRepository(store) {
  function incrementRequestCounters(now) {
    const db = store.read();
    const dayKey = getDayKey(now);
    const monthKey = getMonthKey(now);
    const requests = db.analytics.requests;

    requests.total += 1;
    incrementCounter(requests.daily, dayKey);
    incrementCounter(requests.monthly, monthKey);
    requests.lastRecordedAt = now.toISOString();

    store.write(db);
  }

  function getSummary(now) {
    const db = store.read();
    const dayKey = getDayKey(now);
    const monthKey = getMonthKey(now);
    const requests = db.analytics.requests;

    return {
      totalRequests: requests.total,
      today: {
        date: dayKey,
        count: Number(requests.daily[dayKey] || 0),
      },
      currentMonth: {
        month: monthKey,
        count: Number(requests.monthly[monthKey] || 0),
      },
      daily: requests.daily,
      monthly: requests.monthly,
      lastRecordedAt: requests.lastRecordedAt,
    };
  }

  return {
    incrementRequestCounters,
    getSummary,
  };
}

function createAnalyticsService(store, options = {}) {
  const repository = options.repository || createFileAnalyticsRepository(store);

  async function recordRequest() {
    await repository.incrementRequestCounters(new Date());
  }

  async function getSummary() {
    return repository.getSummary(new Date());
  }

  return {
    recordRequest,
    getSummary,
  };
}

module.exports = { createAnalyticsService };