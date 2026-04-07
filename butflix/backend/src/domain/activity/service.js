const crypto = require("node:crypto");

function createActivityService(store) {
  function recordWatchEvent({ userId, contentId, eventType, positionSec }) {
    const db = store.read();

    const contentExists = db.content.some((item) => item.id === contentId);
    if (!contentExists) {
      throw { status: 404, message: "Content not found" };
    }

    const event = {
      id: crypto.randomUUID(),
      userId,
      contentId,
      eventType,
      positionSec,
      createdAt: new Date().toISOString(),
    };

    db.watchEvents.push(event);
    store.write(db);
    return event;
  }

  function getHistoryByUser(userId) {
    const db = store.read();

    const events = db.watchEvents
      .filter((event) => event.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return events.map((event) => {
      const content = db.content.find((item) => item.id === event.contentId);
      return {
        ...event,
        content: content || null,
      };
    });
  }

  return {
    recordWatchEvent,
    getHistoryByUser,
  };
}

module.exports = { createActivityService };
