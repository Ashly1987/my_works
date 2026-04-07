function createCatalogService(store, options = {}) {
  const externalSource = options.externalSource || null;

  async function listCatalog({ search, genre, page, limit }) {
    if (externalSource) {
      try {
        return await externalSource.listCatalog({ search, genre, page, limit });
      } catch (_err) {
        // Fallback to local store when external source is unavailable.
      }
    }

    const db = store.read();
    let items = [...db.content];

    if (search) {
      const searchKey = search.toLowerCase();
      items = items.filter((item) => item.title.toLowerCase().includes(searchKey));
    }

    if (genre) {
      items = items.filter((item) => item.genre.toLowerCase() === genre.toLowerCase());
    }

    const start = (page - 1) * limit;
    const paginated = items.slice(start, start + limit);

    return {
      items: paginated,
      total: items.length,
      page,
      limit,
    };
  }

  async function getContentById(contentId) {
    if (externalSource) {
      try {
        return await externalSource.getContentById(contentId);
      } catch (_err) {
        // Fallback to local store when external source is unavailable.
      }
    }

    const db = store.read();
    const item = db.content.find((entry) => entry.id === contentId);
    if (!item) {
      throw { status: 404, message: "Content not found" };
    }

    return item;
  }

  return {
    listCatalog,
    getContentById,
  };
}

module.exports = { createCatalogService };
