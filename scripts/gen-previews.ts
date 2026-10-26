import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

interface Project {
  id: number;
  image: string;
  title: string;
  demo: string;
  [key: string]: unknown;
}

interface ProjectsData {
  projects: Project[];
}

const ROOT_DIR = fileURLToPath(new URL("../", import.meta.url));

const PROJECTS_FILE = path.join(ROOT_DIR, "src/data/projects.json");

const IMAGES_DIR = path.join(ROOT_DIR, "src/images/projects");

const FORCE = process.argv.includes("--force");

const SCREENSHOT_WIDTH = 1200;
const SCREENSHOT_HEIGHT = 750;
const REQUEST_TIMEOUT = 45_000;

const PLACEHOLDER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="1200" height="750" viewBox="0 0 1200 750">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#25213d"/>
      <stop offset="100%" stop-color="#51417a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="750" fill="url(#bg)"/>
  <rect x="390" y="235" width="420" height="280" rx="24"
        fill="#ffffff" fill-opacity=".08"
        stroke="#ffffff" stroke-opacity=".18"/>
  <rect x="440" y="285" width="320" height="18" rx="9"
        fill="#ffffff" fill-opacity=".65"/>
  <rect x="440" y="330" width="240" height="12" rx="6"
        fill="#ffffff" fill-opacity=".3"/>
  <rect x="440" y="365" width="280" height="12" rx="6"
        fill="#ffffff" fill-opacity=".3"/>
  <rect x="440" y="420" width="120" height="38" rx="10"
        fill="#a78bfa"/>
</svg>
`;

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function getScreenshotUrl(demo: string): string {
  const target = new URL(demo);

  if (!["http:", "https:"].includes(target.protocol)) {
    throw new Error(`Unsupported URL protocol: ${target.protocol}`);
  }

  const endpoint = new URL(
    "https://image.thum.io/get/width/1200/crop/750/noanimate/",
  );

  endpoint.searchParams.set("url", target.href);

  return endpoint.toString();
}

async function createPlaceholder(outputPath: string): Promise<void> {
  await sharp(Buffer.from(PLACEHOLDER_SVG))
    .webp({ quality: 80 })
    .toFile(outputPath);
}

async function generatePreview(
  project: Project,
  outputPath: string,
): Promise<"generated" | "placeholder"> {
  try {
    const response = await fetch(getScreenshotUrl(project.demo), {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      headers: {
        Accept: "image/png, image/jpeg",
      },
    });

    if (!response.ok) {
      throw new Error(`Thum.io returned HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.startsWith("image/")) {
      throw new Error(`Unexpected content type: ${contentType}`);
    }

    const screenshot = Buffer.from(await response.arrayBuffer());

    if (screenshot.length < 1_000) {
      throw new Error("Screenshot response is too small");
    }

    // Validate the image and convert it to WebP.
    await sharp(screenshot)
      .resize(SCREENSHOT_WIDTH, SCREENSHOT_HEIGHT, {
        fit: "cover",
        position: "top",
      })
      .webp({ quality: 80 })
      .toFile(outputPath);

    console.log(`✓ ${project.title}: preview generated`);

    return "generated";
  } catch (error) {
    console.warn(
      `⚠ ${project.title}: screenshot failed; using placeholder.`,
      error instanceof Error ? error.message : error,
    );

    await createPlaceholder(outputPath);

    return "placeholder";
  }
}

async function main(): Promise<void> {
  await mkdir(IMAGES_DIR, { recursive: true });

  const raw = await readFile(PROJECTS_FILE, "utf8");
  const data = JSON.parse(raw) as ProjectsData;

  if (!Array.isArray(data.projects)) {
    throw new Error('Expected JSON object with a "projects" array.');
  }

  let generated = 0;
  let placeholders = 0;
  let skipped = 0;
  let jsonChanged = false;

  for (const project of data.projects) {
    if (
      !Number.isInteger(project.id) ||
      typeof project.demo !== "string" ||
      typeof project.image !== "string"
    ) {
      console.warn(`⚠ Skipping invalid project: ${project.title}`);
      continue;
    }

    const outputName = `${project.id}.webp`;
    const outputPath = path.join(IMAGES_DIR, outputName);

    // Existing WebP previews are preserved unless --force is passed.
    if (!FORCE && (await fileExists(outputPath))) {
      console.log(`↷ ${project.title}: preview already exists`);

      skipped++;
    } else {
      const result = await generatePreview(project, outputPath);

      if (result === "generated") {
        generated++;
      } else {
        placeholders++;
      }
    }

    const nextImage = `../images/projects/${outputName}`;

    if (project.image !== nextImage) {
      project.image = nextImage;
      jsonChanged = true;
    }
  }

  if (jsonChanged) {
    await writeFile(
      PROJECTS_FILE,
      `${JSON.stringify(data, null, 2)}\n`,
      "utf8",
    );
  }

  console.log("\nPreview generation complete:");
  console.log(`  Generated: ${generated}`);
  console.log(`  Placeholders: ${placeholders}`);
  console.log(`  Skipped: ${skipped}`);
}

main().catch((error: unknown) => {
  console.error("Preview generation failed:", error);
  process.exitCode = 1;
});
