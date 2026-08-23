const axios = require('axios');
const cache = require('./cacheService');
const ApiError = require('../utils/ApiError');

const client = axios.create({
  baseURL: process.env.FIXER_BASE_URL || 'https://api.apilayer.com/fixer',
  headers: { apikey: process.env.FIXER_API_KEY },
  timeout: 12000,
});

const TTL = Number(process.env.RATE_CACHE_TTL_SECONDS) || 600;

/**
 * Fetches latest rates for a base currency, with EUR->many symbols like the
 * free Fixer tier expects. Results are cached in-memory per base currency so
 * that N users asking about USD in the same 10-minute window only cost us
 * one upstream call.
 */
async function getLatestRates(base = 'EUR') {
  const cacheKey = `latest:${base}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, cached: true };

  try {
    const { data } = await client.get('/latest', { params: { base } });
    if (!data || !data.success === false) {
      // Fixer free tier still returns success:true on the happy path
    }
    if (data.error) {
      throw new ApiError(502, `Fixer API error: ${data.error.info || data.error.type}`);
    }
    const payload = { base: data.base, date: data.date, rates: data.rates };
    cache.set(cacheKey, payload, TTL);
    return { ...payload, cached: false };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(502, `Failed to reach Fixer API: ${err.message}`);
  }
}

/**
 * Converts amount from `from` to `to` using the cached latest-rates table,
 * so a conversion never costs an extra upstream call beyond the base fetch.
 */
async function convert(from, to, amount) {
  const { rates, date } = await getLatestRates(from);
  const rate = rates[to];
  if (!rate) {
    throw new ApiError(400, `Unsupported currency code: ${to}`);
  }
  return { rate, result: Number((amount * rate).toFixed(6)), date };
}

/**
 * Historical rates for a single date (YYYY-MM-DD). Used for the trend chart.
 * Cached per (base, date) since a historical date's rate never changes once past.
 */
async function getHistoricalRate(base, date) {
  const cacheKey = `hist:${base}:${date}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, cached: true };

  try {
    const { data } = await client.get(`/${date}`, { params: { base } });
    if (data.error) {
      throw new ApiError(502, `Fixer API error: ${data.error.info || data.error.type}`);
    }
    const payload = { base: data.base, date: data.date, rates: data.rates };
    // Historical data is immutable, safe to cache for a long time (24h)
    cache.set(cacheKey, payload, 60 * 60 * 24);
    return { ...payload, cached: false };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(502, `Failed to reach Fixer API: ${err.message}`);
  }
}

/**
 * Builds a short trend series (e.g. last 7 days) for a currency pair.
 *
 * Fetches every day CONCURRENTLY (Promise.all) rather than one at a time.
 * The original sequential version took 15-30s for a 14-day trend on the
 * free Fixer tier and, worse, held the connection pool busy long enough
 * that unrelated requests (like the homepage rate ticker) would time out
 * waiting behind it. Concurrent requests finish in roughly the time of the
 * single slowest call instead of the sum of all of them, and each day is
 * still independently cached via getHistoricalRate.
 */
async function getTrend(from, to, days = 7) {
  const today = new Date();
  const dateStrs = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dateStrs.push(d.toISOString().slice(0, 10));
  }

  const results = await Promise.all(
    dateStrs.map(async (dateStr) => {
      try {
        const { rates, date } = await getHistoricalRate(from, dateStr);
        return { date, rate: rates[to] ?? null };
      } catch (err) {
        // Don't let one bad day (e.g. weekend with no published rate) kill the whole trend
        return { date: dateStr, rate: null };
      }
    })
  );

  return results;
}

module.exports = { getLatestRates, convert, getHistoricalRate, getTrend };