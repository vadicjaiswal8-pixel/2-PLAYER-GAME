import { existsSync } from 'node:fs';
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const outputRoot = resolve(projectRoot, 'dist');
const preferredOrigin = 'https://www.reconbrief.in';
const excludedSegments = new Set([
  'api', 'app', 'auth', 'login', 'logout', 'account', 'dashboard',
  'private', 'test', 'tests', 'preview', 'draft', '404',
]);
const excludedNamePattern = /(?:^|[._-])(?:test|spec|preview|draft|redirect|404|auth|login|logout|account|dashboard|private)(?:[._-]|$)/i;
const vercelConfig = JSON.parse(await readFile(resolve(projectRoot, 'vercel.json'), 'utf8'));
const redirectRules = Array.isArray(vercelConfig.redirects) ? vercelConfig.redirects : [];

const blogImageSources = [
  {
    filename: 'company-research-guide.webp',
    candidates: ['company-research-guide.webp', 'public/blog/company-research-guide.webp'],
  },
  {
    filename: 'company-research-guide-640.webp',
    candidates: ['company-research-guide-640.webp', 'public/blog/company-research-guide-640.webp'],
  },
];

async function ensureBlogImagesInOutput() {
  const outputDirectory = resolve(outputRoot, 'blog');
  await mkdir(outputDirectory, { recursive: true });

  for (const { filename, candidates } of blogImageSources) {
    const sourceRelativePath = candidates.find((candidate) => existsSync(resolve(projectRoot, candidate)));
    if (!sourceRelativePath) {
      throw new Error(`Required Blog image is missing from the deployment. Expected one of: ${candidates.join(', ')}`);
    }
    const sourcePath = resolve(projectRoot, sourceRelativePath);
    const outputPath = resolve(outputDirectory, filename);
    await cp(sourcePath, outputPath);
    const [sourceBytes, outputBytes] = await Promise.all([
      readFile(sourcePath),
      readFile(outputPath),
    ]);
    if (!sourceBytes.equals(outputBytes)) {
      throw new Error(`Blog image output does not match its source: ${filename}`);
    }
  }

  console.log(`Verified ${blogImageSources.length} Blog images in dist/blog/`);
}

async function ensureArticleOutput() {
  const articlePath = resolve(outputRoot, 'blog/company-research-guide/index.html');
  let html;
  try {
    html = await readFile(articlePath, 'utf8');
  } catch {
    throw new Error('The Company Research article must be emitted to dist/blog/company-research-guide/index.html.');
  }
  if (!html.includes('<link rel="canonical" href="https://www.reconbrief.in/blog/company-research-guide">')) {
    throw new Error('The built Company Research article is missing its expected canonical URL.');
  }
  if (!html.includes('Company Research: A Practical Guide to Understanding Businesses')) {
    throw new Error('The built Company Research article does not contain the expected article content.');
  }
}

async function ensureBlogOutput() {
  const blogIndexPath = resolve(outputRoot, 'blog/index.html');
  let html;
  try {
    html = await readFile(blogIndexPath, 'utf8');
  } catch {
    throw new Error('The Blog listing must be emitted to dist/blog/index.html.');
  }
  if (!html.includes('<link rel="canonical" href="https://www.reconbrief.in/blog">')) {
    throw new Error('The built Blog listing is missing its expected canonical URL.');
  }
  if (!html.includes('href="/blog/company-research-guide"')) {
    throw new Error('The built Blog listing is missing its Company Research article link.');
  }
}

function parseAttributes(tag) {
  const attributes = {};
  const pattern = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  for (const match of tag.matchAll(pattern)) {
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attributes;
}

function htmlIsNoindex(html) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = parseAttributes(match[0]);
    const name = (attributes.name ?? '').toLowerCase();
    if (name !== 'robots' && name !== 'googlebot') continue;
    const directives = (attributes.content ?? '').toLowerCase().split(/[\s,]+/);
    if (directives.includes('noindex') || directives.includes('none')) return true;
  }
  return /<meta\b[^>]*http-equiv\s*=\s*["']?refresh\b/i.test(html);
}

function canonicalHref(html) {
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attributes = parseAttributes(match[0]);
    const relations = (attributes.rel ?? '').toLowerCase().split(/\s+/);
    if (relations.includes('canonical') && attributes.href) return attributes.href;
  }
  return null;
}

function routeForBuiltHtml(relativePath) {
  const webPath = relativePath.split(sep).join('/');
  if (webPath === 'index.html') return '/';
  if (webPath === 'samples-company-research-the-whole-truth-foods.html') {
    return '/samples/company-research/the-whole-truth-foods';
  }
  if (webPath.endsWith('/index.html')) return `/${webPath.slice(0, -'/index.html'.length)}`;
  if (!webPath.toLowerCase().endsWith('.html')) return null;
  const stem = webPath.slice(0, -'.html'.length);
  const parent = dirname(stem).split(sep).join('/');
  return basename(stem) === basename(parent) ? `/${parent}` : `/${stem}`;
}

function builtHtmlPath(relativePath) {
  return relativePath;
}

function routeIsExcluded(pathname, relativePath) {
  const parts = `${relativePath.split(sep).join('/')}/${pathname}`
    .split('/')
    .filter(Boolean)
    .map((part) => part.replace(/\.html$/i, ''));
  return parts.some((part) => excludedSegments.has(part.toLowerCase()))
    || excludedNamePattern.test(relativePath.split(sep).join('/'));
}

function matchesRedirect(pathname, source) {
  if (typeof source !== 'string') return false;
  const pattern = source.split('/').map((segment) => {
    const parameter = segment.match(/^:[A-Za-z0-9_]+([*+?])?$/);
    if (parameter) {
      if (parameter[1] === '+') return '.+';
      if (parameter[1] === '?') return '[^/]*';
      if (parameter[1] === '*') return '.*';
      return '[^/]+';
    }
    if (segment === '*') return '.*';
    return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }).join('/');
  return new RegExp(`^${pattern}/?$`).test(pathname);
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

async function listHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listHtmlFiles(absolutePath));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) files.push(absolutePath);
  }
  return files;
}

async function listSourceHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.') || ['node_modules', 'dist'].includes(entry.name)) continue;
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listSourceHtmlFiles(absolutePath));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) files.push(absolutePath);
  }
  return files;
}

async function generateSitemap() {
  const builtFiles = await listHtmlFiles(outputRoot);
  const urls = [];
  const seen = new Set();

  for (const file of builtFiles) {
    const relativePath = relative(outputRoot, file);
    const route = routeForBuiltHtml(relativePath);
    if (!route || routeIsExcluded(route, relativePath)) continue;
    if (redirectRules.some((rule) => matchesRedirect(route, rule?.source))) continue;

    const html = await readFile(file, 'utf8');
    if (htmlIsNoindex(html)) continue;

    const href = canonicalHref(html);
    if (!href) continue;

    let canonical;
    try {
      canonical = new URL(href);
    } catch {
      continue;
    }

    if (canonical.protocol !== 'https:' || canonical.origin !== preferredOrigin) continue;
    if (canonical.username || canonical.password || canonical.search || canonical.hash) continue;
    if (canonical.pathname !== route) continue;

    const url = canonical.href;
    if (seen.has(url)) throw new Error(`Duplicate canonical URL in built HTML: ${url}`);
    seen.add(url);
    urls.push(url);
  }

  urls.sort((a, b) => a.localeCompare(b));
  if (!urls.includes(`${preferredOrigin}/`)) {
    throw new Error(`The generated sitemap must include the canonical homepage ${preferredOrigin}/`);
  }

  const robotsSource = await readFile(resolve(projectRoot, 'public/robots.txt'), 'utf8');
  const robotsLines = robotsSource.split(/\r?\n/);
  const directiveLines = robotsLines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => /^\s*Sitemap\s*:/i.test(line));
  if (directiveLines.length !== 1) {
    throw new Error(`public/robots.txt must contain exactly one Sitemap directive for ${preferredOrigin}/sitemap.xml`);
  }

  const directiveMatch = directiveLines[0].line.match(/^\s*Sitemap\s*:\s*(\S+)\s*$/i);
  if (!directiveMatch) {
    throw new Error('public/robots.txt contains a malformed Sitemap directive.');
  }

  let sourceSitemapUrl;
  try {
    sourceSitemapUrl = new URL(directiveMatch[1]);
  } catch {
    throw new Error('public/robots.txt must use a valid absolute HTTPS sitemap URL.');
  }
  if (
    sourceSitemapUrl.protocol !== 'https:'
    || !['reconbrief.in', 'www.reconbrief.in'].includes(sourceSitemapUrl.hostname)
    || sourceSitemapUrl.pathname !== '/sitemap.xml'
    || sourceSitemapUrl.search
    || sourceSitemapUrl.hash
    || sourceSitemapUrl.username
    || sourceSitemapUrl.password
  ) {
    throw new Error('public/robots.txt Sitemap directive must target the Recon Brief sitemap over HTTPS.');
  }

  const expectedSitemapDirective = `Sitemap: ${preferredOrigin}/sitemap.xml`;
  robotsLines[directiveLines[0].index] = expectedSitemapDirective;
  const robots = robotsLines.join('\n');
  if (!robots.split(/\r?\n/).some((line) => line.trim() === expectedSitemapDirective)) {
    throw new Error(`public/robots.txt must include ${expectedSitemapDirective}`);
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');

  await Promise.all([
    writeFile(resolve(projectRoot, 'sitemap.xml'), xml, 'utf8'),
    writeFile(resolve(projectRoot, 'public/sitemap.xml'), xml, 'utf8'),
    writeFile(resolve(projectRoot, 'public/robots.txt'), robots, 'utf8'),
    writeFile(resolve(projectRoot, 'robots.txt'), robots, 'utf8'),
    writeFile(resolve(outputRoot, 'sitemap.xml'), xml, 'utf8'),
    writeFile(resolve(outputRoot, 'robots.txt'), robots, 'utf8'),
  ]);

  console.log(`Generated dist/sitemap.xml with ${urls.length} canonical, indexable page(s):`);
  for (const url of urls) console.log(`  ${url}`);
}

async function copyHtmlPage(relativeSourcePath, relativeDestinationPath = builtHtmlPath(relativeSourcePath)) {
  const sourcePath = resolve(projectRoot, relativeSourcePath);
  const destinationPath = resolve(outputRoot, relativeDestinationPath);
  const sourceBytes = await readFile(sourcePath);
  await mkdir(dirname(destinationPath), { recursive: true });
  await writeFile(destinationPath, sourceBytes);
  const outputBytes = await readFile(destinationPath);
  if (!sourceBytes.equals(outputBytes)) {
    throw new Error(`HTML output does not match its source: ${relativeSourcePath}`);
  }
}

async function buildLegacyStaticSite() {
  const requiredBlogPages = [
    {
      destination: 'blog/index.html',
      candidates: ['blog/index.html', 'blog.html'],
    },
    {
      destination: 'blog/company-research-guide/index.html',
      candidates: [
        'company-research-guide.html',
        'blog/company-research-guide/index.html',
        'blog/company-research-guide.html',
      ],
    },
  ];
  const htmlFiles = await listSourceHtmlFiles(projectRoot);
  const htmlPages = htmlFiles
    .map((file) => relative(projectRoot, file).split(sep).join('/'))
    .filter((name) => name.toLowerCase() !== 'index.html.html')
    .filter((name) => !excludedNamePattern.test(name));

  if (!htmlPages.includes('index.html')) {
    throw new Error('Static build requires the root index.html homepage.');
  }

  const resolvedBlogPages = requiredBlogPages.map(({ destination, candidates }) => {
    const source = candidates.find((candidate) => htmlPages.includes(candidate));
    if (!source) {
      throw new Error(`Required blog source is missing from the deployment. Expected one of: ${candidates.join(', ')}`);
    }
    return { source, destination };
  });

  for (const { source, destination } of resolvedBlogPages) {
    const sourceHtml = await readFile(resolve(projectRoot, source), 'utf8');
    if (!sourceHtml.trim()) throw new Error(`Required blog source is empty: ${source}`);
  }

  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });

  // Copy HTML pages first. In particular, create the nested blog routes before
  // copying public assets. The previous Promise.all copied public/blog/ into
  // dist/blog/ at the same time as blog HTML files, allowing the two directory
  // operations to race and intermittently remove or miss dist/blog/index.html.
  const blogPageSet = new Set(resolvedBlogPages.map(({ source }) => source));
  for (const name of htmlPages) {
    if (blogPageSet.has(name)) continue;
    await copyHtmlPage(name);
  }
  for (const { source, destination } of resolvedBlogPages) {
    await copyHtmlPage(source, destination);
  }

  // Copy top-level site assets after HTML output is complete. Blog images are
  // copied and byte-verified separately by ensureBlogImagesInOutput().
  await cp(resolve(projectRoot, 'styles.css'), resolve(outputRoot, 'styles.css'));
  await cp(resolve(projectRoot, 'blog.css'), resolve(outputRoot, 'blog.css'));
  await cp(resolve(projectRoot, 'script.js'), resolve(outputRoot, 'script.js'));
  await cp(resolve(projectRoot, 'public'), outputRoot, {
    recursive: true,
    filter: (sourcePath) => {
      const publicBlogDirectory = resolve(projectRoot, 'public/blog');
      const normalizedSource = resolve(sourcePath);
      return normalizedSource !== publicBlogDirectory
        && !normalizedSource.startsWith(`${publicBlogDirectory}${sep}`);
    },
  });

  await ensureBlogOutput();
  await ensureArticleOutput();
  await ensureBlogImagesInOutput();
  await generateSitemap();
  console.log('Recon Brief static build written to dist/');
}

await buildLegacyStaticSite();
