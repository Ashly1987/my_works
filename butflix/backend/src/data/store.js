const fs = require("node:fs");
const path = require("node:path");

const initialData = {
  users: [],
  content: [
    {
      id: "m1",
      title: "The Last Orbit",
      description: "A retired pilot returns for one final mission around a decaying station.",
      genre: "Sci-Fi",
      duration: 6120,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80",
      streamUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      createdAt: new Date().toISOString(),
    },
    {
      id: "m2",
      title: "Monsoon Street",
      description: "Three strangers meet during one endless rainstorm and rewrite their futures.",
      genre: "Drama",
      duration: 5460,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80",
      streamUrl: "https://www.w3schools.com/html/movie.mp4",
      createdAt: new Date().toISOString(),
    },
    {
      id: "m3",
      title: "Zero Hour Heist",
      description: "A crew races against sunrise to pull off a citywide digital robbery.",
      genre: "Action",
      duration: 5880,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
      streamUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      createdAt: new Date().toISOString(),
    },
  ],
  watchEvents: [],
  analytics: {
    requests: {
      total: 0,
      daily: {},
      monthly: {},
      lastRecordedAt: null,
    },
  },
};

function normalizeData(raw = {}) {
  const analyticsRequests = raw.analytics?.requests || {};

  return {
    users: Array.isArray(raw.users) ? raw.users : initialData.users,
    content: Array.isArray(raw.content) ? raw.content : initialData.content,
    watchEvents: Array.isArray(raw.watchEvents) ? raw.watchEvents : initialData.watchEvents,
    analytics: {
      requests: {
        total: Number(analyticsRequests.total || 0),
        daily:
          analyticsRequests.daily && typeof analyticsRequests.daily === "object"
            ? analyticsRequests.daily
            : {},
        monthly:
          analyticsRequests.monthly && typeof analyticsRequests.monthly === "object"
            ? analyticsRequests.monthly
            : {},
        lastRecordedAt: analyticsRequests.lastRecordedAt || null,
      },
    },
  };
}

function ensureDataFile(dataFile) {
  function ensureAt(candidatePath) {
    const absolutePath = path.resolve(candidatePath);
    const dir = path.dirname(absolutePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(absolutePath)) {
      fs.writeFileSync(absolutePath, JSON.stringify(initialData, null, 2));
    }

    return absolutePath;
  }

  try {
    return ensureAt(dataFile);
  } catch (error) {
    const fallbackPath = "/tmp/butflix-db.json";
    if (error && ["ENOENT", "EROFS", "EACCES"].includes(error.code)) {
      return ensureAt(fallbackPath);
    }
    throw error;
  }
}

function createStore(dataFile) {
  const absolutePath = ensureDataFile(dataFile);

  function read() {
    const raw = fs.readFileSync(absolutePath, "utf8");
    return normalizeData(JSON.parse(raw));
  }

  function write(nextData) {
    fs.writeFileSync(absolutePath, JSON.stringify(normalizeData(nextData), null, 2));
  }

  return { read, write };
}

module.exports = { createStore };
