import { Prisma } from "@prisma/client";
import { Worker, type Job } from "bullmq";
import { chromium, type Browser, type Page } from "playwright";
import { prisma } from "@/lib/prisma";
import { getRedisConnection } from "@/lib/redis";
import { addGenerateJob } from "@/server/queues/generate.queue";
import {
  SCRAPE_CONCURRENCY,
  SCRAPE_QUEUE_NAME,
  type ScrapeJobData,
} from "@/server/queues/scrape.queue";

type ScrapedProduct = {
  title: string;
  description: string | null;
  price: string | null;
  images: string[];
  bodyText: string;
};

const PRICE_SELECTORS = [
  'meta[property="product:price:amount"]',
  'meta[property="og:price:amount"]',
  'meta[itemprop="price"]',
  '[itemprop="price"]',
  '[itemprop="lowPrice"]',
  '[data-price]',
  '[data-product-price]',
  ".product-price",
  ".product__price",
  ".price__current",
  ".sales-price",
  ".current-price",
  ".price",
  "#price",
];

async function extractProductData(page: Page, pageUrl: string): Promise<ScrapedProduct> {
  return page.evaluate(
    ({ pageUrl, priceSelectors }) => {
      const absoluteUrl = (src: string) => {
        try {
          return new URL(src, pageUrl).href;
        } catch {
          return null;
        }
      };

      const title =
        document.querySelector('meta[property="og:title"]')?.getAttribute("content")?.trim() ||
        document.title?.trim() ||
        "";

      const description =
        document.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() ||
        document.querySelector('meta[property="og:description"]')?.getAttribute("content")?.trim() ||
        null;

      let price: string | null = null;
      for (const selector of priceSelectors) {
        const el = document.querySelector(selector);
        if (!el) continue;
        const value =
          el.getAttribute("content") ??
          el.getAttribute("data-price") ??
          el.textContent?.trim() ??
          null;
        if (value) {
          price = value;
          break;
        }
      }

      const imageSet = new Set<string>();
      for (const meta of ["og:image", "og:image:url", "twitter:image"]) {
        const src = document
          .querySelector(`meta[property="${meta}"], meta[name="${meta}"]`)
          ?.getAttribute("content");
        if (src) {
          const resolved = absoluteUrl(src);
          if (resolved) imageSet.add(resolved);
        }
      }

      Array.from(document.querySelectorAll("img[src]")).forEach((img) => {
        const src = img.getAttribute("src");
        if (!src || src.startsWith("data:")) return;
        const resolved = absoluteUrl(src);
        if (resolved) imageSet.add(resolved);
      });

      const bodyText = document.body?.innerText?.trim() ?? "";

      return {
        title,
        description,
        price,
        images: Array.from(imageSet),
        bodyText,
      };
    },
    { pageUrl, priceSelectors: PRICE_SELECTORS }
  );
}

function parsePrice(value: string | null): Prisma.Decimal | null {
  if (!value) return null;

  const normalized = value.replace(/\s/g, "").replace(/,/g, "");
  const match = normalized.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;

  try {
    return new Prisma.Decimal(match[1]);
  } catch {
    return null;
  }
}

async function processScrapeJob(job: Job<ScrapeJobData>) {
  const { productId, url } = job.data;
  let browser: Browser | undefined;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });

    const scraped = await extractProductData(page, url);

    if (!scraped.title) {
      throw new Error(`No title extracted for product ${productId} at ${url}`);
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        title: scraped.title,
        description: scraped.description,
        price: parsePrice(scraped.price),
        images: scraped.images,
        rawHtml: scraped.bodyText,
      },
      select: { id: true, userId: true },
    });

    await addGenerateJob({
      productId: product.id,
      userId: product.userId,
    });

    return {
      productId: product.id,
      title: scraped.title,
      imageCount: scraped.images.length,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new Error(`Product not found: ${productId}`);
    }
    throw error;
  } finally {
    await browser?.close();
  }
}

export function startScrapeWorker() {
  const connection = getRedisConnection();
  if (!connection) {
    console.warn("[scrape] Redis not configured, skipping scrape worker");
    return null;
  }

  const worker = new Worker<ScrapeJobData>(
    SCRAPE_QUEUE_NAME,
    processScrapeJob,
    {
      connection,
      concurrency: SCRAPE_CONCURRENCY,
    }
  );

  worker.on("failed", (job, err) => {
    console.error("[scrape] Job failed", {
      jobId: job?.id,
      productId: job?.data.productId,
      attemptsMade: job?.attemptsMade,
      error: err.message,
    });
  });

  worker.on("completed", (job) => {
    console.log("[scrape] Job completed", {
      jobId: job.id,
      productId: job.data.productId,
    });
  });

  return worker;
}
