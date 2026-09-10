import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// ============================================================================
// DESIGN TOKENS & CONSTANTS
// ============================================================================
const COLORS = {
  primary: [17, 24, 39],        // #111827 (Black/Dark Gray)
  primaryDark: [0, 0, 0],       // #000000 (Black)
  accent: [249, 115, 22],       // #F97316 (Orange - Highlight)
  accentLight: [255, 237, 213], // #FFEDD5 (Light Orange - Background)
  gray900: [17, 24, 39],        // #111827
  gray700: [55, 65, 81],        // #374151
  gray500: [107, 114, 128],     // #6B7280
  gray400: [156, 163, 175],     // #9CA3AF
  gray300: [209, 213, 219],     // #D1D5DB
  gray200: [229, 231, 235],     // #E5E7EB
  gray100: [243, 244, 246],     // #F3F4F6
  gray50: [249, 250, 251],      // #F9FAFB
  white: [255, 255, 255],
  orange: [249, 115, 22],       // #F97316
  red: [239, 68, 68],           // #EF4444
  amber: [245, 158, 11],        // #F59E0B
  indigo: [99, 102, 241],       // #6366F1
  violet: [139, 92, 246],       // #8B5CF6
  rose: [244, 63, 94],          // #F43F5E
};

const CHART_PALETTE = [
  [37, 99, 235], [16, 185, 129], [249, 115, 22], [139, 92, 246],
  [244, 63, 94], [245, 158, 11], [99, 102, 241], [20, 184, 166],
];

const PAGE = { width: 210, height: 297 };
const MARGIN = { left: 20, right: 20, top: 25, bottom: 25 };
const CONTENT_WIDTH = PAGE.width - MARGIN.left - MARGIN.right;

const SECTION_MAP = {
  'executive-summary': 'Executive Summary',
  'kpi-overview': 'KPI Overview',
  'publication-trends': 'Publication Trends',
  'citation-analysis': 'Citation & Impact Analysis',
  'topic-evolution': 'Topic Evolution & Frontiers',
  'journal-analysis': 'Journal Analysis',
  'geographic-analysis': 'Geographic Distribution',
  'author-analysis': 'Author & Collaboration Analysis',
  'keyword-analysis': 'Keyword & Network Analysis',
  'forecast': 'Forecast & Predictions',
  'appendix': 'Raw Data Appendix',
};

// ============================================================================
// UTILITY HELPERS
// ============================================================================

/** Format a number with thousands separators */
const fmt = (n) => {
  if (n == null || isNaN(n)) return '—';
  return Number(n).toLocaleString('en-US');
};

/** Format growth rate as a signed percentage string */
const fmtGrowth = (rate) => {
  if (rate == null || isNaN(rate)) return '—';
  const sign = rate >= 0 ? '+' : '';
  return `${sign}${Number(rate).toFixed(1)}%`;
};

/** Safely truncate long strings for table cells */
const truncate = (str, max = 40) => {
  if (!str) return '—';
  return str.length > max ? str.substring(0, max - 1) + '…' : str;
};

/** Check if we should page-break before adding content of given height */
const needsPageBreak = (currentY, neededHeight) => {
  return currentY + neededHeight > PAGE.height - MARGIN.bottom;
};

// ============================================================================
// QUERY CACHE DATA EXTRACTOR
// ============================================================================

/**
 * Searches the React Query cache for data matching a query key pattern.
 * Uses a fuzzy prefix match on the first N elements of the key array.
 */
const findCachedData = (queryClient, ...keyPrefix) => {
  const allQueries = queryClient.getQueryCache().getAll();
  const match = allQueries.find(q => {
    if (!Array.isArray(q.queryKey)) return false;
    return keyPrefix.every((segment, i) => {
      if (i >= q.queryKey.length) return false;
      if (typeof segment === 'object') return true; // skip object comparison (filters)
      return q.queryKey[i] === segment;
    });
  });
  return match?.state?.data;
};

/**
 * Extract all analytics data from the React Query cache for a given project.
 */
const extractAllData = (queryClient, projectId) => {
  const data = {};

  // 1. Dashboard KPI Stats
  const statsRaw = findCachedData(queryClient, 'dashboard-stats', projectId);
  data.stats = statsRaw?.data || statsRaw;

  // 2. Geographic Distribution
  const geoRaw = findCachedData(queryClient, 'geoDistribution', projectId);
  data.geo = geoRaw?.data || geoRaw;

  // 3. Research Landscape Distribution
  const distRaw = findCachedData(queryClient, 'distribution', projectId);
  data.distribution = distRaw?.data || distRaw;

  // 4. Top Research Entities
  const entitiesRaw = findCachedData(queryClient, 'topEntities', projectId);
  data.topEntities = entitiesRaw?.data || entitiesRaw;

  // 5. Impact Quartiles (Dashboard)
  const quartilesRaw = findCachedData(queryClient, 'quartilesDistribution', projectId);
  data.quartiles = quartilesRaw?.data || quartilesRaw;

  // 6. Development Trends (single payload with multiple sections)
  const trendsRaw = findCachedData(queryClient, 'developmentTrends', projectId);
  const trendsPayload = trendsRaw?.data || trendsRaw;
  data.publicationTrend = trendsPayload?.publicationTrend;
  data.citationMirroring = trendsPayload?.citationMirroring;
  data.frontierDetection = trendsPayload?.frontierDetection;
  data.topicEvolution = trendsPayload?.topicEvolution;
  data.forecastInsights = trendsPayload?.forecastInsights;

  // 7. Journal Rankings
  const journalRankRaw = findCachedData(queryClient, 'journals', 'ranking', projectId);
  data.journalRanking = journalRankRaw?.data || journalRankRaw;

  // 8. Journal Quartile Distribution
  const jqRaw = findCachedData(queryClient, 'journals', 'quartiles', projectId);
  data.journalQuartiles = jqRaw?.data || jqRaw;

  // 9. Journal Impact Matrix
  const imRaw = findCachedData(queryClient, 'journals', 'impact-matrix', projectId);
  data.impactMatrix = imRaw?.data || imRaw;

  // 10. Journal Migration
  const migRaw = findCachedData(queryClient, 'journals', 'migration', projectId);
  data.migration = migRaw?.data || migRaw;

  // 11. Collaboration Rankings
  const collabRankRaw = findCachedData(queryClient, 'collaboration', 'rankings', projectId);
  data.collaborationRankings = collabRankRaw?.data || collabRankRaw;

  // 12. Author Productivity Matrix
  const prodRaw = findCachedData(queryClient, 'collaboration', 'productivity-matrix', projectId);
  data.productivityMatrix = prodRaw?.data || prodRaw;

  // 13. Collaboration Metrics
  const metricsRaw = findCachedData(queryClient, 'collaboration', 'metrics', projectId);
  data.collaborationMetrics = metricsRaw?.data || metricsRaw;

  // 14. Global Collaboration Network
  const netRaw = findCachedData(queryClient, 'collaboration', 'global-network', projectId);
  data.globalNetwork = netRaw?.data || netRaw;

  // 15. Topic Intensity (Author)
  const tiaRaw = findCachedData(queryClient, 'collaboration', 'topic-intensity', projectId, 'author');
  data.topicIntensityAuthor = tiaRaw?.data || tiaRaw;

  // 16. Topic Intensity (Institution)
  const tiiRaw = findCachedData(queryClient, 'collaboration', 'topic-intensity', projectId, 'institution');
  data.topicIntensityInstitution = tiiRaw?.data || tiiRaw;

  // 17. Keyword Vectors
  const kwRaw = findCachedData(queryClient, 'keywordVectors', projectId);
  data.keywordVectors = kwRaw?.data || kwRaw;

  // 18. Country Collaboration
  const ccRaw = findCachedData(queryClient, 'countryCollaboration', projectId);
  data.countryCollaboration = ccRaw?.data || ccRaw;

  // 19. Collaboration Insights
  const ciRaw = findCachedData(queryClient, 'collaborationInsights', projectId);
  data.collaborationInsights = ciRaw?.data || ciRaw;

  // 20. Network Topology
  const ntRaw = findCachedData(queryClient, 'networkTopology', projectId);
  data.networkTopology = ntRaw?.data || ntRaw;

  // 21. Cross Links
  const clRaw = findCachedData(queryClient, 'crossLinks', projectId);
  data.crossLinks = clRaw?.data || clRaw;

  // 22. Temporal Shift
  const tsRaw = findCachedData(queryClient, 'temporalShift', projectId);
  data.temporalShift = tsRaw?.data || tsRaw;

  return data;
};

// ============================================================================
// VECTOR CHART DRAWING HELPERS (for jsPDF)
// ============================================================================

/**
 * Draws a professional mini line/area chart directly in the PDF.
 * @param {jsPDF} doc
 * @param {number} x - Left edge
 * @param {number} y - Top edge
 * @param {number} w - Chart width
 * @param {number} h - Chart height
 * @param {Array} data - Array of { label, value }
 * @param {Array} color - RGB color array
 */
const drawLineChart = (doc, x, y, w, h, data, color = COLORS.primary) => {
  if (!Array.isArray(data) || data.length < 2) return;

  const values = data.map(d => d.value ?? d.count ?? d.publications ?? 0);
  const labels = data.map(d => d.label ?? d.year ?? d.name ?? '');
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;
  const padding = 8;
  const chartX = x + padding;
  const chartY = y + padding;
  const chartW = w - padding * 2;
  const chartH = h - padding * 2 - 10; // leave space for x-axis labels

  // Background
  doc.setFillColor(...COLORS.gray50);
  doc.roundedRect(x, y, w, h, 3, 3, 'F');

  // Grid lines (4 horizontal)
  doc.setDrawColor(...COLORS.gray200);
  doc.setLineWidth(0.1);
  for (let i = 0; i <= 4; i++) {
    const gy = chartY + (chartH * i) / 4;
    doc.line(chartX, gy, chartX + chartW, gy);
    // Y-axis label
    const val = maxVal - (range * i) / 4;
    doc.setFontSize(5);
    doc.setTextColor(...COLORS.gray400);
    doc.text(fmt(Math.round(val)), chartX - 1, gy + 1, { align: 'right' });
  }

  // Plot points and lines
  const points = values.map((v, i) => ({
    px: chartX + (i / (values.length - 1)) * chartW,
    py: chartY + chartH - ((v - minVal) / range) * chartH,
  }));

  // Area fill
  doc.setFillColor(color[0], color[1], color[2]);
  doc.setGState(new doc.GState({ opacity: 0.1 }));
  doc.moveTo(points[0].px, chartY + chartH);
  // Instead of using advanced path, fill a polygon via individual lines
  // jsPDF doesn't natively support polygon fill easily, so we'll skip the area fill
  // and just do the line
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Line
  doc.setDrawColor(...color);
  doc.setLineWidth(0.6);
  for (let i = 0; i < points.length - 1; i++) {
    doc.line(points[i].px, points[i].py, points[i + 1].px, points[i + 1].py);
  }

  // Data points
  doc.setFillColor(...color);
  points.forEach(p => {
    doc.circle(p.px, p.py, 0.8, 'F');
  });

  // X-axis labels (show max ~8 labels)
  doc.setFontSize(5);
  doc.setTextColor(...COLORS.gray500);
  const step = Math.ceil(labels.length / 8);
  labels.forEach((label, i) => {
    if (i % step === 0 || i === labels.length - 1) {
      doc.text(String(label), points[i].px, chartY + chartH + 6, { align: 'center' });
    }
  });
};

/**
 * Draws horizontal bar chart in the PDF.
 */
const drawHorizontalBarChart = (doc, x, y, w, h, data) => {
  if (!Array.isArray(data) || data.length === 0) return;

  const items = data.slice(0, 10); // max 10 items
  const values = items.map(d => d.value ?? d.count ?? d.impactFactor ?? d.publications ?? 0);
  const labels = items.map(d => d.name ?? d.label ?? d.country ?? '');
  const maxVal = Math.max(...values, 1);

  // Background
  doc.setFillColor(...COLORS.gray50);
  doc.roundedRect(x, y, w, h, 3, 3, 'F');

  const barHeight = Math.min(6, (h - 10) / items.length - 2);
  const labelWidth = w * 0.35;
  const barAreaWidth = w * 0.55;
  const barX = x + labelWidth + 5;
  const startY = y + 6;

  items.forEach((_, i) => {
    const by = startY + i * (barHeight + 3);
    const barW = (values[i] / maxVal) * barAreaWidth;
    const colorIdx = i % CHART_PALETTE.length;

    // Label
    doc.setFontSize(5.5);
    doc.setTextColor(...COLORS.gray700);
    doc.text(truncate(labels[i], 28), x + 4, by + barHeight / 2 + 1.5);

    // Bar background
    doc.setFillColor(...COLORS.gray200);
    doc.roundedRect(barX, by, barAreaWidth, barHeight, 1.5, 1.5, 'F');

    // Bar fill
    if (barW > 0) {
      doc.setFillColor(...CHART_PALETTE[colorIdx]);
      doc.roundedRect(barX, by, Math.max(barW, 2), barHeight, 1.5, 1.5, 'F');
    }

    // Value text
    doc.setFontSize(5);
    doc.setTextColor(...COLORS.gray500);
    doc.text(fmt(values[i]), barX + barAreaWidth + 2, by + barHeight / 2 + 1.5);
  });
};

/**
 * Draws a stacked horizontal bar (donut alternative) for distribution data.
 */
const drawStackedBar = (doc, x, y, w, h, data, colors = CHART_PALETTE) => {
  if (!Array.isArray(data) || data.length === 0) return;

  const items = data.slice(0, 8);
  const total = items.reduce((sum, d) => sum + (d.value ?? d.count ?? 0), 0) || 1;

  // Background
  doc.setFillColor(...COLORS.gray50);
  doc.roundedRect(x, y, w, h, 3, 3, 'F');

  const barY = y + 12;
  const barH = 10;
  const barX = x + 5;
  const barW = w - 10;

  // Stacked bar
  let offsetX = barX;
  items.forEach((item, i) => {
    const val = item.value ?? item.count ?? 0;
    const segW = (val / total) * barW;
    if (segW > 0) {
      doc.setFillColor(...colors[i % colors.length]);
      if (i === 0) {
        doc.roundedRect(offsetX, barY, segW, barH, 2, 2, 'F');
      } else if (i === items.length - 1) {
        doc.roundedRect(offsetX, barY, segW, barH, 2, 2, 'F');
      } else {
        doc.rect(offsetX, barY, segW, barH, 'F');
      }
      offsetX += segW;
    }
  });

  // Legend
  const legendY = barY + barH + 6;
  const colWidth = (w - 10) / 2;
  items.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const lx = x + 5 + col * colWidth;
    const ly = legendY + row * 7;

    doc.setFillColor(...colors[i % colors.length]);
    doc.circle(lx + 2, ly, 1.5, 'F');

    doc.setFontSize(5.5);
    doc.setTextColor(...COLORS.gray700);
    const label = item.name ?? item.quartile ?? item.label ?? '';
    const pct = ((item.value ?? item.count ?? 0) / total * 100).toFixed(1);
    doc.text(`${truncate(label, 20)} (${pct}%)`, lx + 5, ly + 1.5);
  });
};


// ============================================================================
// PDF SECTION BUILDERS
// ============================================================================

/**
 * Adds the professional cover page.
 */
const addCoverPage = (doc, projectName, projectId, stats) => {
  // Full-page blue background
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE.width, PAGE.height, 'F');

  // Accent stripe at top
  doc.setFillColor(...COLORS.primaryDark);
  doc.rect(0, 0, PAGE.width, 6, 'F');

  // Accent stripe at bottom
  doc.setFillColor(...COLORS.primaryDark);
  doc.rect(0, PAGE.height - 6, PAGE.width, 6, 'F');

  // Large decorative circle (top-right)
  doc.setFillColor(255, 255, 255);
  doc.setGState(new doc.GState({ opacity: 0.04 }));
  doc.circle(180, 60, 80, 'F');
  doc.circle(30, 250, 60, 'F');
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Platform branding
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'normal');
  doc.text('SCIENTIA ANALYTICS FRAMEWORK', MARGIN.left, 30);

  // Horizontal rule
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.3);
  doc.setGState(new doc.GState({ opacity: 0.3 }));
  doc.line(MARGIN.left, 35, PAGE.width - MARGIN.right, 35);
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Main Title
  doc.setFontSize(28);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Advanced Research', MARGIN.left, 80);
  doc.text('Analytics Report', MARGIN.left, 94);

  // Accent underline
  doc.setFillColor(...COLORS.accent);
  doc.rect(MARGIN.left, 100, 40, 2.5, 'F');

  // Project Name
  doc.setFontSize(16);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(255, 255, 255);
  const projLines = doc.splitTextToSize(projectName, CONTENT_WIDTH);
  doc.text(projLines, MARGIN.left, 115);

  // Project ID
  doc.setFontSize(10);
  doc.setGState(new doc.GState({ opacity: 0.7 }));
  doc.text(`Project ID: ${projectId}`, MARGIN.left, 115 + projLines.length * 8 + 5);
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Hero Statistics Block (bottom section)
  const statsY = 180;
  doc.setFillColor(255, 255, 255);
  doc.setGState(new doc.GState({ opacity: 0.08 }));
  doc.roundedRect(MARGIN.left, statsY, CONTENT_WIDTH, 55, 4, 4, 'F');
  doc.setGState(new doc.GState({ opacity: 1 }));

  if (stats) {
    const statItems = [
      { label: 'Total Authors', value: stats.totalAuthors?.value, growth: stats.totalAuthors?.growthRate },
      { label: 'Total Institutions', value: stats.totalJournals?.value, growth: stats.totalJournals?.growthRate },
      { label: 'Density Index', value: stats.densityIndex?.value, growth: null, status: stats.densityIndex?.status },
      { label: 'Relocated', value: stats.totalRelocated?.value, growth: stats.totalRelocated?.growthRate },
    ];

    const colW = CONTENT_WIDTH / statItems.length;
    statItems.forEach((item, i) => {
      const cx = MARGIN.left + colW * i + colW / 2;

      // Value
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(fmt(item.value), cx, statsY + 22, { align: 'center' });

      // Label
      doc.setFontSize(7);
      doc.setFont(undefined, 'normal');
      doc.setGState(new doc.GState({ opacity: 0.7 }));
      doc.text(item.label.toUpperCase(), cx, statsY + 30, { align: 'center' });
      doc.setGState(new doc.GState({ opacity: 1 }));

      // Growth badge
      if (item.growth != null) {
        doc.setFontSize(8);
        doc.setTextColor(...(item.growth >= 0 ? COLORS.accent : COLORS.rose));
        doc.text(fmtGrowth(item.growth), cx, statsY + 40, { align: 'center' });
      } else if (item.status) {
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.accent);
        doc.text(item.status.toUpperCase(), cx, statsY + 40, { align: 'center' });
      }

      // Divider
      if (i < statItems.length - 1) {
        doc.setDrawColor(255, 255, 255);
        doc.setGState(new doc.GState({ opacity: 0.15 }));
        doc.setLineWidth(0.3);
        doc.line(MARGIN.left + colW * (i + 1), statsY + 8, MARGIN.left + colW * (i + 1), statsY + 47);
        doc.setGState(new doc.GState({ opacity: 1 }));
      }
    });
  }

  // Footer info
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(255, 255, 255);
  doc.setGState(new doc.GState({ opacity: 0.6 }));
  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  doc.text(`Generated on: ${timestamp}`, MARGIN.left, PAGE.height - 30);
  doc.text('Prepared by Scientia Analytics Framework v2.0', MARGIN.left, PAGE.height - 24);
  doc.text('CONFIDENTIAL — For authorized personnel only', MARGIN.left, PAGE.height - 18);
  doc.setGState(new doc.GState({ opacity: 1 }));
};

/**
 * Adds Table of Contents.
 */
const addTableOfContents = (doc, sectionPages) => {
  doc.addPage();

  // Section header bar
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE.width, 3, 'F');

  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...COLORS.gray900);
  doc.text('Table of Contents', MARGIN.left, 35);

  // Underline
  doc.setFillColor(...COLORS.primary);
  doc.rect(MARGIN.left, 39, 35, 1.5, 'F');

  let tocY = 55;
  let sectionNum = 1;

  Object.entries(SECTION_MAP).forEach(([key, title]) => {
    const pageNum = sectionPages[key] || '—';

    // Section number
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text(`${String(sectionNum).padStart(2, '0')}`, MARGIN.left, tocY);

    // Section title
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...COLORS.gray900);
    doc.text(title, MARGIN.left + 12, tocY);

    // Dotted line
    doc.setDrawColor(...COLORS.gray300);
    doc.setLineDashPattern([0.5, 1.5], 0);
    doc.setLineWidth(0.2);
    const textW = doc.getTextWidth(title);
    doc.line(MARGIN.left + 12 + textW + 2, tocY, PAGE.width - MARGIN.right - 10, tocY);
    doc.setLineDashPattern([], 0);

    // Page number
    doc.setTextColor(...COLORS.gray500);
    doc.text(String(pageNum), PAGE.width - MARGIN.right, tocY, { align: 'right' });

    tocY += 12;
    sectionNum++;
  });
};

/**
 * Adds page header and footer to every page.
 */
const addHeadersAndFooters = (doc, projectName) => {
  const pageCount = doc.internal.getNumberOfPages();
  const timestamp = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  for (let i = 2; i <= pageCount; i++) { // Skip cover page
    doc.setPage(i);

    // Top accent bar
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, PAGE.width, 3, 'F');

    // Header text
    doc.setFontSize(6.5);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...COLORS.gray400);
    doc.text(truncate(projectName, 50), MARGIN.left, 10);
    doc.text('Advanced Research Analytics Report', PAGE.width - MARGIN.right, 10, { align: 'right' });

    // Header line
    doc.setDrawColor(...COLORS.gray200);
    doc.setLineWidth(0.2);
    doc.line(MARGIN.left, 12, PAGE.width - MARGIN.right, 12);

    // Footer
    doc.setFontSize(6);
    doc.setTextColor(...COLORS.gray400);
    doc.text(`Scientia Analytics Framework  ·  ${timestamp}`, MARGIN.left, PAGE.height - 8);
    doc.text('CONFIDENTIAL', 105, PAGE.height - 8, { align: 'center' });
    doc.text(`Page ${i} of ${pageCount}`, PAGE.width - MARGIN.right, PAGE.height - 8, { align: 'right' });

    // Footer line
    doc.setDrawColor(...COLORS.gray200);
    doc.line(MARGIN.left, PAGE.height - 12, PAGE.width - MARGIN.right, PAGE.height - 12);
  }
};

/**
 * Adds a large section title to the current page.
 * Returns new Y position.
 */
const addSectionTitle = (doc, title, sectionNumber, currentY) => {
  if (needsPageBreak(currentY, 30)) {
    doc.addPage();
    currentY = MARGIN.top + 5;
  }

  // Section number badge
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(MARGIN.left, currentY - 5, 10, 10, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(String(sectionNumber).padStart(2, '0'), MARGIN.left + 5, currentY + 2, { align: 'center' });

  // Section title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...COLORS.gray900);
  doc.text(title, MARGIN.left + 14, currentY + 2);

  // Underline
  currentY += 8;
  doc.setFillColor(...COLORS.primary);
  doc.rect(MARGIN.left + 14, currentY, 30, 1, 'F');

  return currentY + 8;
};

/**
 * Adds a subsection title.
 */
const addSubsectionTitle = (doc, title, currentY) => {
  if (needsPageBreak(currentY, 15)) {
    doc.addPage();
    currentY = MARGIN.top + 5;
  }
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...COLORS.gray700);
  doc.text(title, MARGIN.left + 2, currentY);
  return currentY + 7;
};

/**
 * Adds insight/commentary paragraph.
 */
const addInsight = (doc, text, currentY) => {
  if (!text) return currentY;
  if (needsPageBreak(currentY, 20)) {
    doc.addPage();
    currentY = MARGIN.top + 5;
  }

  // Insight card background
  const lines = doc.splitTextToSize(text, CONTENT_WIDTH - 14);
  const boxH = lines.length * 4.5 + 8;

  doc.setFillColor(...COLORS.accentLight);
  doc.roundedRect(MARGIN.left, currentY, CONTENT_WIDTH, boxH, 2, 2, 'F');

  // Left accent bar
  doc.setFillColor(...COLORS.accent);
  doc.rect(MARGIN.left, currentY, 2.5, boxH, 'F');

  // Insight icon (ℹ)
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...COLORS.accent);
  doc.text('INSIGHT', MARGIN.left + 6, currentY + 5);

  // Insight text
  doc.setFontSize(7.5);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...COLORS.gray700);
  doc.text(lines, MARGIN.left + 6, currentY + 10);

  return currentY + boxH + 6;
};

/**
 * Adds a professional auto-table with consistent styling.
 */
const addStyledTable = (doc, head, body, currentY, options = {}) => {
  if (needsPageBreak(currentY, 30)) {
    doc.addPage();
    currentY = MARGIN.top + 5;
  }

  autoTable(doc, {
    startY: currentY,
    head: [head],
    body: body,
    margin: { left: MARGIN.left, right: MARGIN.right },
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: 3,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: COLORS.gray700,
      cellPadding: 2.5,
      lineColor: COLORS.gray200,
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: COLORS.gray50,
    },
    styles: {
      overflow: 'linebreak',
      cellWidth: 'auto',
    },
    columnStyles: options.columnStyles || {},
    didDrawPage: () => {
      // Ensure proper Y tracking after page breaks
    },
    ...options,
  });

  return doc.lastAutoTable.finalY + 8;
};

/**
 * Adds KPI cards row.
 */
const addKPICards = (doc, items, currentY) => {
  if (!Array.isArray(items) || items.length === 0) return currentY;
  if (needsPageBreak(currentY, 35)) {
    doc.addPage();
    currentY = MARGIN.top + 5;
  }

  const cardCount = Math.min(items.length, 4);
  const gap = 4;
  const cardW = (CONTENT_WIDTH - gap * (cardCount - 1)) / cardCount;
  const cardH = 28;

  items.slice(0, 4).forEach((item, i) => {
    const cx = MARGIN.left + i * (cardW + gap);

    // Card background
    doc.setFillColor(...COLORS.white);
    doc.setDrawColor(...COLORS.gray200);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, currentY, cardW, cardH, 2, 2, 'FD');

    // Top accent line
    const accentColor = CHART_PALETTE[i % CHART_PALETTE.length];
    doc.setFillColor(...accentColor);
    doc.rect(cx, currentY, cardW, 2, 'F');

    // Label
    doc.setFontSize(6);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...COLORS.gray500);
    doc.text(item.label.toUpperCase(), cx + 4, currentY + 9);

    // Value
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...COLORS.gray900);
    doc.text(fmt(item.value), cx + 4, currentY + 18);

    // Growth/Status
    if (item.growth != null) {
      doc.setFontSize(7);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(...(item.growth >= 0 ? COLORS.accent : COLORS.red));
      doc.text(fmtGrowth(item.growth), cx + 4, currentY + 24);
    } else if (item.status) {
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.accent);
      doc.text(item.status, cx + 4, currentY + 24);
    }
  });

  return currentY + cardH + 8;
};

// ============================================================================
// INSIGHT GENERATION (auto-generate commentary from data)
// ============================================================================

const generatePublicationInsight = (data) => {
  if (!Array.isArray(data) || data.length < 2) return null;
  const values = data.map(d => d.value ?? d.count ?? d.publications ?? 0);
  const first = values[0];
  const last = values[values.length - 1];
  const maxIdx = values.indexOf(Math.max(...values));
  const maxYear = data[maxIdx]?.year || data[maxIdx]?.label || '';
  const growth = first > 0 ? (((last - first) / first) * 100).toFixed(1) : 0;

  let trend = 'remained stable';
  if (growth > 20) trend = 'shown significant growth';
  else if (growth > 5) trend = 'shown moderate growth';
  else if (growth < -5) trend = 'experienced a decline';

  return `Publication activity has ${trend} over the analyzed period, with a cumulative change of ${growth > 0 ? '+' : ''}${growth}%. The peak output was observed in ${maxYear} with ${fmt(values[maxIdx])} publications. The most recent data point shows ${fmt(last)} publications, indicating ${last > first ? 'an upward trajectory' : 'a need for further investigation'} in scholarly output.`;
};

const generateTopEntitiesInsight = (data) => {
  if (!Array.isArray(data) || data.length === 0) return null;
  const top = data[0];
  return `The leading research entity is "${top.name || 'Unknown'}" (${top.type || 'N/A'}), contributing ${fmt(top.value)} publications. The top ${Math.min(data.length, 4)} entities represent a significant concentration of research output in this domain. This distribution suggests ${data.length > 3 ? 'a diversified research landscape' : 'a highly concentrated research landscape'}.`;
};

const generateJournalInsight = (data) => {
  if (!Array.isArray(data) || data.length === 0) return null;
  const top = data[0];
  const avgIF = (data.reduce((s, j) => s + (j.impactFactor || j.sjr || 0), 0) / data.length).toFixed(2);
  return `The top-ranked journal is "${truncate(top.name || top.title || 'Unknown', 50)}" with an impact factor of ${(top.impactFactor || top.sjr || 0).toFixed(2)}. Across the top ${Math.min(data.length, 10)} journals, the average impact factor is ${avgIF}, indicating ${avgIF > 5 ? 'a high-quality publication landscape' : 'a developing publication ecosystem'}.`;
};

const generateGeoInsight = (data) => {
  if (!Array.isArray(data) || data.length === 0) return null;
  const top = data[0];
  const total = data.reduce((s, d) => s + (d.count ?? d.value ?? 0), 0);
  const topShare = total > 0 ? (((top.count ?? top.value ?? 0) / total) * 100).toFixed(1) : 0;
  return `The leading country in research output is ${top.country || top.name || 'Unknown'}, contributing ${topShare}% of all publications. The analysis covers ${data.length} distinct countries/regions, indicating ${data.length > 20 ? 'a globally distributed research effort' : 'a regionally concentrated research activity'}.`;
};

// ============================================================================
// CHART CAPTURE FROM DOM (optional enhancement)
// ============================================================================

/**
 * Attempts to capture a DOM element as a high-resolution image.
 * Returns null if the element doesn't exist.
 */
const captureElement = async (selector) => {
  const element = document.querySelector(selector);
  if (!element) return null;

  try {
    const canvas = await html2canvas(element, {
      scale: 3,
      backgroundColor: '#FFFFFF',
      useCORS: true,
      logging: false,
      allowTaint: true,
    });
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn(`Failed to capture element ${selector}:`, err);
    return null;
  }
};

/**
 * Adds a captured chart image to the PDF, or falls back to vector rendering.
 */
const addChartOrVector = async (doc, selector, vectorFn, currentY) => {
  const imgData = await captureElement(selector);

  if (imgData) {
    // Calculate dimensions while maintaining aspect ratio
    const img = new Image();
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = imgData;
    });

    const maxW = CONTENT_WIDTH;
    const maxH = 80;
    let w = maxW;
    let h = (img.height / img.width) * w;
    if (h > maxH) {
      h = maxH;
      w = (img.width / img.height) * h;
    }

    if (needsPageBreak(currentY, h + 5)) {
      doc.addPage();
      currentY = MARGIN.top + 5;
    }

    doc.addImage(imgData, 'PNG', MARGIN.left, currentY, w, h);
    return currentY + h + 8;
  }

  // Fallback to vector drawing
  if (vectorFn) {
    if (needsPageBreak(currentY, 60)) {
      doc.addPage();
      currentY = MARGIN.top + 5;
    }
    vectorFn(doc, MARGIN.left, currentY, CONTENT_WIDTH, 55);
    return currentY + 60;
  }

  return currentY;
};


// ============================================================================
// MAIN REPORT GENERATION FUNCTION
// ============================================================================

/**
 * Generates a professional, comprehensive PDF analytics report.
 * Called from SidebarFooter with the same signature as the existing function.
 *
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {string} projectId
 */
export const generateProfessionalReport = async (queryClient, projectId) => {
  if (!projectId || !queryClient) return;

  // Show loading indicator
  const overlay = document.createElement('div');
  overlay.id = 'pdf-export-overlay';
  overlay.innerHTML = `
    <div style="
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    ">
      <div style="
        background: white; border-radius: 16px; padding: 40px 50px;
        box-shadow: 0 25px 60px rgba(0,0,0,0.3);
        text-align: center; max-width: 400px;
      ">
        <div style="
          width: 48px; height: 48px; margin: 0 auto 16px;
          border: 4px solid #E5E7EB; border-top-color: #2563EB;
          border-radius: 50%; animation: spin 0.8s linear infinite;
        "></div>
        <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 700; color: #111827;">
          Generating Report
        </h3>
        <p style="margin: 0; font-size: 13px; color: #6B7280; line-height: 1.5;">
          Preparing your Advanced Research Analytics Report.<br>
          This may take a few moments...
        </p>
      </div>
    </div>
    <style>
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  `;
  document.body.appendChild(overlay);

  try {
    // Extract project metadata
    const projectName = document.querySelector('.sidebar-project-title')?.innerText || `Project #${projectId}`;

    // Extract all cached data
    const data = extractAllData(queryClient, projectId);

    // Initialize PDF document
    const doc = new jsPDF('p', 'mm', 'a4');
    const sectionPages = {};
    let currentY = MARGIN.top + 5;
    let sectionNum = 0;

    // ──────────────────────────────────────────────
    // COVER PAGE
    // ──────────────────────────────────────────────
    addCoverPage(doc, projectName, projectId, data.stats);

    // ──────────────────────────────────────────────
    // TABLE OF CONTENTS (placeholder — will update page numbers later)
    // ──────────────────────────────────────────────
    addTableOfContents(doc, sectionPages);
    const tocPageNum = 2;

    // ──────────────────────────────────────────────
    // SECTION 1: EXECUTIVE SUMMARY
    // ──────────────────────────────────────────────
    doc.addPage();
    currentY = MARGIN.top + 5;
    sectionNum++;
    sectionPages['executive-summary'] = doc.internal.getNumberOfPages();
    currentY = addSectionTitle(doc, 'Executive Summary', sectionNum, currentY);

    // Description
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...COLORS.gray500);
    doc.text('A high-level overview of the key performance indicators and research metrics for this project.', MARGIN.left + 2, currentY);
    currentY += 8;

    // KPI Cards
    if (data.stats) {
      const kpiItems = [
        { label: 'Total Authors', value: data.stats.totalAuthors?.value, growth: data.stats.totalAuthors?.growthRate },
        { label: 'Total Institutions', value: data.stats.totalJournals?.value, growth: data.stats.totalJournals?.growthRate },
        { label: 'Density Index', value: data.stats.densityIndex?.value, status: data.stats.densityIndex?.status },
        { label: 'Relocated', value: data.stats.totalRelocated?.value, growth: data.stats.totalRelocated?.growthRate },
      ];
      currentY = addKPICards(doc, kpiItems, currentY);
    }

    currentY = addInsight(doc,
      data.stats
        ? `This project encompasses ${fmt(data.stats.totalAuthors?.value)} authors across ${fmt(data.stats.totalJournals?.value)} institutions, with a density index of ${data.stats.densityIndex?.value || 'N/A'}. The overall research landscape is ${data.stats.densityIndex?.status || 'stable'}, providing a solid foundation for trend analysis.`
        : 'KPI data is not currently available. Please ensure the dashboard has been fully loaded before generating the report.',
      currentY
    );

    // ──────────────────────────────────────────────
    // SECTION 2: KPI OVERVIEW (Detailed Table)
    // ──────────────────────────────────────────────
    sectionNum++;
    sectionPages['kpi-overview'] = doc.internal.getNumberOfPages();
    currentY = addSectionTitle(doc, 'KPI Overview', sectionNum, currentY);

    if (data.stats) {
      const kpiTableBody = [];
      const s = data.stats;
      if (s.totalAuthors) kpiTableBody.push(['Total Authors', fmt(s.totalAuthors.value), fmtGrowth(s.totalAuthors.growthRate), s.totalAuthors.growthRate >= 0 ? '▲ Growth' : '▼ Decline']);
      if (s.totalJournals) kpiTableBody.push(['Total Institutions', fmt(s.totalJournals.value), fmtGrowth(s.totalJournals.growthRate), s.totalJournals.growthRate >= 0 ? '▲ Growth' : '▼ Decline']);
      if (s.densityIndex) kpiTableBody.push(['Density Index', String(s.densityIndex.value), '—', s.densityIndex.status || 'Stable']);
      if (s.totalRelocated) kpiTableBody.push(['Total Relocated', fmt(s.totalRelocated.value), fmtGrowth(s.totalRelocated.growthRate), s.totalRelocated.growthRate >= 0 ? '▲ Growth' : '▼ Decline']);

      if (kpiTableBody.length > 0) {
        currentY = addStyledTable(doc, ['Metric', 'Value', 'Change', 'Trend'], kpiTableBody, currentY);
      }
    }

    // ──────────────────────────────────────────────
    // SECTION 3: PUBLICATION TRENDS
    // ──────────────────────────────────────────────
    doc.addPage();
    currentY = MARGIN.top + 5;
    sectionNum++;
    sectionPages['publication-trends'] = doc.internal.getNumberOfPages();
    currentY = addSectionTitle(doc, 'Publication Trends', sectionNum, currentY);

    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...COLORS.gray500);
    doc.text('Analysis of publication volume and growth patterns over time.', MARGIN.left + 2, currentY);
    currentY += 8;

    const pubTrend = data.publicationTrend;
    if (pubTrend) {
      const trendData = pubTrend.data || pubTrend;
      if (Array.isArray(trendData) && trendData.length > 0) {
        // Try to capture the chart from DOM first, fallback to vector chart
        currentY = await addChartOrVector(
          doc,
          '.publication-trend-chart-wrapper',
          (d, x, y, w, h) => drawLineChart(d, x, y, w, h, trendData),
          currentY
        );

        // Data table
        currentY = addSubsectionTitle(doc, 'Publication Volume Data', currentY);
        const pubRows = trendData.map(d => [
          d.year || d.label || '—',
          fmt(d.value ?? d.count ?? d.publications),
        ]);
        currentY = addStyledTable(doc, ['Year', 'Publications'], pubRows, currentY);

        // Insight
        currentY = addInsight(doc, generatePublicationInsight(trendData), currentY);
      }
    } else {
      currentY = addInsight(doc, 'Publication trend data is not available in the current cache. Navigate to the Development & Trends page and reload to include this section.', currentY);
    }

    // ──────────────────────────────────────────────
    // SECTION 4: CITATION & IMPACT ANALYSIS
    // ──────────────────────────────────────────────
    doc.addPage();
    currentY = MARGIN.top + 5;
    sectionNum++;
    sectionPages['citation-analysis'] = doc.internal.getNumberOfPages();
    currentY = addSectionTitle(doc, 'Citation & Impact Analysis', sectionNum, currentY);

    if (data.citationMirroring) {
      const citData = data.citationMirroring.data || data.citationMirroring;
      if (Array.isArray(citData) && citData.length > 0) {
        currentY = await addChartOrVector(
          doc,
          '.analytics-card:has(.citation-mirroring)',
          (d, x, y, w, h) => drawLineChart(d, x, y, w, h, citData, COLORS.accent),
          currentY
        );

        currentY = addSubsectionTitle(doc, 'Citation Metrics Over Time', currentY);
        const citRows = citData.map(d => [
          d.year || d.label || '—',
          fmt(d.value ?? d.citations ?? d.count),
        ]);
        currentY = addStyledTable(doc, ['Year', 'Citations'], citRows, currentY);

        const values = citData.map(d => d.value ?? d.citations ?? d.count ?? 0);
        const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(0);
        currentY = addInsight(doc, `The citation analysis shows an average of ${fmt(avg)} citations per period across ${citData.length} time points. ${values[values.length - 1] > values[0] ? 'Citation impact has been increasing, suggesting growing influence of the research in this field.' : 'Citation patterns indicate stable academic engagement with the publications in this domain.'}`, currentY);
      }
    } else {
      currentY = addInsight(doc, 'Citation mirroring data is not available in the current cache. Please ensure the Development & Trends data has been loaded.', currentY);
    }

    // ──────────────────────────────────────────────
    // SECTION 5: TOPIC EVOLUTION & FRONTIERS
    // ──────────────────────────────────────────────
    doc.addPage();
    currentY = MARGIN.top + 5;
    sectionNum++;
    sectionPages['topic-evolution'] = doc.internal.getNumberOfPages();
    currentY = addSectionTitle(doc, 'Topic Evolution & Emerging Frontiers', sectionNum, currentY);

    // Topic Evolution
    if (data.topicEvolution) {
      const evoData = data.topicEvolution.data || data.topicEvolution;
      if (Array.isArray(evoData) && evoData.length > 0) {
        currentY = addSubsectionTitle(doc, 'Topic Evolution Timeline', currentY);

        currentY = await addChartOrVector(
          doc,
          '.analytics-card:has(.topic-evolution)',
          null,
          currentY
        );

        // Build table from topic evolution data
        const firstEntry = evoData[0];
        const topicKeys = Object.keys(firstEntry).filter(k => k !== 'year' && k !== 'label' && k !== 'name');
        if (topicKeys.length > 0) {
          const evoRows = evoData.map(d => [
            d.year || d.label || '—',
            ...topicKeys.slice(0, 5).map(k => fmt(d[k])),
          ]);
          currentY = addStyledTable(doc, ['Year', ...topicKeys.slice(0, 5)], evoRows, currentY);
        }
      }
    }

    // Frontier Detection
    if (data.frontierDetection) {
      const frontierData = data.frontierDetection.data || data.frontierDetection;
      if (Array.isArray(frontierData) && frontierData.length > 0) {
        if (needsPageBreak(currentY, 80)) {
          doc.addPage();
          currentY = MARGIN.top + 5;
        }
        currentY = addSubsectionTitle(doc, 'Emerging Research Frontiers', currentY);
        drawHorizontalBarChart(doc, MARGIN.left, currentY, CONTENT_WIDTH, Math.min(frontierData.length * 10 + 10, 80), frontierData, COLORS.accent);
        currentY += Math.min(frontierData.length * 10 + 15, 85);

        const frontierRows = frontierData.slice(0, 15).map((d, i) => [
          i + 1,
          d.topic || d.name || d.keyword || '—',
          fmt(d.growth ?? d.value ?? d.count),
          d.trend || (d.growth > 0 ? '▲ Emerging' : '— Stable'),
        ]);
        currentY = addStyledTable(doc, ['#', 'Research Frontier', 'Growth Index', 'Status'], frontierRows, currentY);

        currentY = addInsight(doc, `${frontierData.length} emerging research frontiers were identified. The top frontier "${frontierData[0]?.topic || frontierData[0]?.name || 'Unknown'}" shows ${frontierData[0]?.growth > 20 ? 'rapid growth potential' : 'steady development'}, indicating areas of increasing academic interest and investment.`, currentY);
      }
    }

    // ──────────────────────────────────────────────
    // SECTION 6: JOURNAL ANALYSIS
    // ──────────────────────────────────────────────
    doc.addPage();
    currentY = MARGIN.top + 5;
    sectionNum++;
    sectionPages['journal-analysis'] = doc.internal.getNumberOfPages();
    currentY = addSectionTitle(doc, 'Journal Analysis', sectionNum, currentY);

    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...COLORS.gray500);
    doc.text('Comprehensive analysis of journal rankings, quartile distribution, and impact metrics.', MARGIN.left + 2, currentY);
    currentY += 8;

    // Journal Ranking
    if (data.journalRanking) {
      const journals = Array.isArray(data.journalRanking) ? data.journalRanking : [];
      if (journals.length > 0) {
        currentY = addSubsectionTitle(doc, 'Top Journal Rankings', currentY);

        // Bar chart
        drawHorizontalBarChart(doc, MARGIN.left, currentY, CONTENT_WIDTH, Math.min(journals.length * 10 + 10, 80), journals.map(j => ({
          name: j.name || j.title || 'Unknown',
          value: j.impactFactor || j.sjr || 0,
        })), COLORS.primary);
        currentY += Math.min(journals.length * 10 + 15, 85);

        // Table
        const journalRows = journals.slice(0, 15).map((j, i) => [
          i + 1,
          truncate(j.name || j.title || 'Unknown', 35),
          (j.impactFactor || j.sjr || 0).toFixed(2),
          j.quartile || j.q || '—',
          j.publisher || '—',
          fmt(j.publications || j.articleCount || j.hIndex || 0),
        ]);
        currentY = addStyledTable(doc,
          ['#', 'Journal Name', 'Impact Factor', 'Quartile', 'Publisher', 'H-Index'],
          journalRows, currentY
        );

        currentY = addInsight(doc, generateJournalInsight(journals), currentY);
      }
    }

    // Journal Quartiles
    if (data.journalQuartiles) {
      const qData = Array.isArray(data.journalQuartiles) ? data.journalQuartiles : [];
      if (qData.length > 0) {
        if (needsPageBreak(currentY, 60)) {
          doc.addPage();
          currentY = MARGIN.top + 5;
        }
        currentY = addSubsectionTitle(doc, 'Quartile Distribution', currentY);
        drawStackedBar(doc, MARGIN.left, currentY, CONTENT_WIDTH, Math.min(qData.length * 8 + 30, 55), qData);
        currentY += Math.min(qData.length * 8 + 35, 60);

        const qRows = qData.map(q => [
          q.quartile || q.name || q.label || '—',
          fmt(q.value ?? q.count),
          q.percentage ? `${q.percentage}%` : '—',
        ]);
        currentY = addStyledTable(doc, ['Quartile', 'Count', 'Share'], qRows, currentY);
      }
    }

    // Impact Matrix
    if (data.impactMatrix) {
      const imData = Array.isArray(data.impactMatrix) ? data.impactMatrix : [];
      if (imData.length > 0) {
        if (needsPageBreak(currentY, 40)) {
          doc.addPage();
          currentY = MARGIN.top + 5;
        }
        currentY = addSubsectionTitle(doc, 'SJR vs H-Index Impact Matrix', currentY);
        const imRows = imData.slice(0, 20).map((j, i) => [
          i + 1,
          truncate(j.name || j.title || 'Unknown', 30),
          (j.sjr || 0).toFixed(3),
          fmt(j.hIndex || j.h_index || 0),
          fmt(j.citations || 0),
        ]);
        currentY = addStyledTable(doc, ['#', 'Journal', 'SJR', 'H-Index', 'Citations'], imRows, currentY);
      }
    }

    // Migration Analysis
    if (data.migration) {
      const migData = Array.isArray(data.migration) ? data.migration : (data.migration?.flows || data.migration?.data || []);
      if (Array.isArray(migData) && migData.length > 0) {
        if (needsPageBreak(currentY, 40)) {
          doc.addPage();
          currentY = MARGIN.top + 5;
        }
        currentY = addSubsectionTitle(doc, 'Open Access Migration Analysis', currentY);
        const migRows = migData.slice(0, 15).map((m, i) => [
          i + 1,
          m.from || m.source || '—',
          m.to || m.target || '—',
          fmt(m.count || m.value || 0),
        ]);
        currentY = addStyledTable(doc, ['#', 'From', 'To', 'Publications'], migRows, currentY);
      }
    }

    // ──────────────────────────────────────────────
    // SECTION 7: GEOGRAPHIC DISTRIBUTION
    // ──────────────────────────────────────────────
    doc.addPage();
    currentY = MARGIN.top + 5;
    sectionNum++;
    sectionPages['geographic-analysis'] = doc.internal.getNumberOfPages();
    currentY = addSectionTitle(doc, 'Geographic Distribution', sectionNum, currentY);

    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...COLORS.gray500);
    doc.text('Global distribution of research output by country and region.', MARGIN.left + 2, currentY);
    currentY += 8;

    if (data.geo) {
      const geoData = Array.isArray(data.geo) ? data.geo : [];
      if (geoData.length > 0) {
        // Attempt to capture the world map from DOM
        currentY = await addChartOrVector(
          doc,
          '.world-heatmap-container',
          (d, x, y, w, h) => drawHorizontalBarChart(d, x, y, w, h, geoData.slice(0, 10)),
          currentY
        );

        currentY = addSubsectionTitle(doc, 'Top Countries by Research Output', currentY);
        const total = geoData.reduce((s, d) => s + (d.count ?? d.value ?? 0), 0);
        const geoRows = geoData.slice(0, 20).map((d, i) => {
          const count = d.count ?? d.value ?? 0;
          const share = total > 0 ? ((count / total) * 100).toFixed(1) + '%' : '—';
          return [i + 1, d.country || d.name || d.code || '—', fmt(count), share];
        });
        currentY = addStyledTable(doc, ['#', 'Country', 'Publications', 'Share'], geoRows, currentY);

        currentY = addInsight(doc, generateGeoInsight(geoData), currentY);
      }
    } else {
      currentY = addInsight(doc, 'Geographic distribution data is not available. Please load the Global Ecosystem dashboard to include this section.', currentY);
    }

    // ──────────────────────────────────────────────
    // SECTION 8: AUTHOR & COLLABORATION ANALYSIS
    // ──────────────────────────────────────────────
    doc.addPage();
    currentY = MARGIN.top + 5;
    sectionNum++;
    sectionPages['author-analysis'] = doc.internal.getNumberOfPages();
    currentY = addSectionTitle(doc, 'Author & Collaboration Analysis', sectionNum, currentY);

    // Top Entities
    if (data.topEntities) {
      const entities = Array.isArray(data.topEntities) ? data.topEntities : [];
      if (entities.length > 0) {
        currentY = addSubsectionTitle(doc, 'Top Research Entities', currentY);
        drawHorizontalBarChart(doc, MARGIN.left, currentY, CONTENT_WIDTH, Math.min(entities.length * 12 + 10, 65), entities, COLORS.accent);
        currentY += Math.min(entities.length * 12 + 15, 70);

        const entRows = entities.map((e, i) => [
          i + 1, e.name || '—', e.type || '—', fmt(e.value ?? e.count ?? 0),
        ]);
        currentY = addStyledTable(doc, ['#', 'Entity Name', 'Type', 'Publications'], entRows, currentY);
        currentY = addInsight(doc, generateTopEntitiesInsight(entities), currentY);
      }
    }

    // Collaboration Rankings
    if (data.collaborationRankings) {
      const collabData = Array.isArray(data.collaborationRankings) ? data.collaborationRankings : [];
      if (collabData.length > 0) {
        if (needsPageBreak(currentY, 50)) {
          doc.addPage();
          currentY = MARGIN.top + 5;
        }
        currentY = addSubsectionTitle(doc, 'Influential Collaborator Rankings', currentY);
        const collabRows = collabData.slice(0, 15).map((c, i) => [
          i + 1,
          truncate(c.name || c.author || '—', 30),
          fmt(c.publications || c.count || c.value || 0),
          fmt(c.citations || 0),
          c.hIndex || c.h_index || '—',
        ]);
        currentY = addStyledTable(doc, ['#', 'Collaborator', 'Publications', 'Citations', 'H-Index'], collabRows, currentY);
      }
    }

    // Collaboration Metrics
    if (data.collaborationMetrics) {
      const metrics = data.collaborationMetrics;
      if (typeof metrics === 'object' && metrics !== null) {
        if (needsPageBreak(currentY, 40)) {
          doc.addPage();
          currentY = MARGIN.top + 5;
        }
        currentY = addSubsectionTitle(doc, 'Collaboration Network Metrics', currentY);
        const metricRows = Object.entries(metrics)
          .filter(([, v]) => typeof v === 'number' || typeof v === 'string')
          .slice(0, 10)
          .map(([k, v]) => [k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), typeof v === 'number' ? fmt(v) : String(v)]);
        if (metricRows.length > 0) {
          currentY = addStyledTable(doc, ['Metric', 'Value'], metricRows, currentY);
        }
      }
    }

    // ──────────────────────────────────────────────
    // SECTION 9: KEYWORD & NETWORK ANALYSIS
    // ──────────────────────────────────────────────
    doc.addPage();
    currentY = MARGIN.top + 5;
    sectionNum++;
    sectionPages['keyword-analysis'] = doc.internal.getNumberOfPages();
    currentY = addSectionTitle(doc, 'Keyword & Network Analysis', sectionNum, currentY);

    // Keyword Vectors
    if (data.keywordVectors) {
      const kwData = Array.isArray(data.keywordVectors) ? data.keywordVectors : [];
      if (kwData.length > 0) {
        currentY = addSubsectionTitle(doc, 'Keyword Trend Vectors', currentY);
        drawHorizontalBarChart(doc, MARGIN.left, currentY, CONTENT_WIDTH, Math.min(kwData.length * 10 + 10, 80), kwData.slice(0, 10).map(k => ({
          name: k.keyword || k.name || k.label || '—',
          value: k.frequency || k.count || k.value || 0,
        })), COLORS.indigo);
        currentY += Math.min(kwData.slice(0, 10).length * 10 + 15, 85);

        const kwRows = kwData.slice(0, 20).map((k, i) => [
          i + 1,
          k.keyword || k.name || k.label || '—',
          fmt(k.frequency || k.count || k.value || 0),
          k.growth ? fmtGrowth(k.growth) : '—',
          k.trend || '—',
        ]);
        currentY = addStyledTable(doc, ['#', 'Keyword', 'Frequency', 'Growth', 'Trend'], kwRows, currentY);
      }
    }

    // Collaboration Insights
    if (data.collaborationInsights) {
      const ciData = data.collaborationInsights;
      if (typeof ciData === 'object' && ciData !== null) {
        if (needsPageBreak(currentY, 30)) {
          doc.addPage();
          currentY = MARGIN.top + 5;
        }
        currentY = addSubsectionTitle(doc, 'Collaboration Insights', currentY);
        const ciEntries = Array.isArray(ciData) ? ciData : Object.entries(ciData).map(([k, v]) => ({ name: k, value: v }));
        if (ciEntries.length > 0) {
          const ciRows = ciEntries.slice(0, 10).map((c, i) => [
            i + 1,
            (c.name || c.label || '—').replace(/_/g, ' '),
            typeof c.value === 'number' ? fmt(c.value) : String(c.value ?? '—'),
          ]);
          currentY = addStyledTable(doc, ['#', 'Indicator', 'Value'], ciRows, currentY);
        }
      }
    }

    // Distribution (Research Landscape)
    if (data.distribution) {
      const distData = Array.isArray(data.distribution) ? data.distribution : [];
      if (distData.length > 0) {
        if (needsPageBreak(currentY, 60)) {
          doc.addPage();
          currentY = MARGIN.top + 5;
        }
        currentY = addSubsectionTitle(doc, 'Research Landscape Distribution', currentY);
        drawStackedBar(doc, MARGIN.left, currentY, CONTENT_WIDTH, Math.min(distData.length * 8 + 30, 55), distData);
        currentY += Math.min(distData.length * 8 + 35, 60);

        const distRows = distData.slice(0, 15).map((d, i) => [
          i + 1, d.name || d.label || '—', fmt(d.value ?? d.count ?? 0),
        ]);
        currentY = addStyledTable(doc, ['#', 'Domain', 'Publications'], distRows, currentY);
      }
    }

    // ──────────────────────────────────────────────
    // SECTION 10: FORECAST & PREDICTIONS
    // ──────────────────────────────────────────────
    doc.addPage();
    currentY = MARGIN.top + 5;
    sectionNum++;
    sectionPages['forecast'] = doc.internal.getNumberOfPages();
    currentY = addSectionTitle(doc, 'Forecast & Predictions', sectionNum, currentY);

    if (data.forecastInsights) {
      const forecastData = data.forecastInsights.data || data.forecastInsights;
      if (Array.isArray(forecastData) && forecastData.length > 0) {
        currentY = addSubsectionTitle(doc, 'Publication Forecast', currentY);
        drawLineChart(doc, MARGIN.left, currentY, CONTENT_WIDTH, 55, forecastData.map(d => ({
          label: d.year || d.label,
          value: d.value ?? d.predicted ?? d.forecast ?? 0,
        })), COLORS.violet);
        currentY += 60;

        const forecastRows = forecastData.map(d => [
          d.year || d.label || '—',
          fmt(d.value ?? d.predicted ?? d.forecast),
          d.confidenceInterval
            ? `${fmt(d.confidenceInterval[0])} – ${fmt(d.confidenceInterval[1])}`
            : (d.lower && d.upper ? `${fmt(d.lower)} – ${fmt(d.upper)}` : '—'),
        ]);
        currentY = addStyledTable(doc, ['Year', 'Predicted Value', 'Confidence Interval'], forecastRows, currentY);

        currentY = addInsight(doc, `The forecast model predicts ${forecastData.length > 0 ? 'continued activity' : 'stable trends'} in the coming years. ${forecastData[0]?.confidenceInterval ? 'Confidence intervals indicate the range of expected outcomes based on historical patterns.' : 'Predictions are based on trend extrapolation from the available data.'}`, currentY);
      }
    } else {
      currentY = addInsight(doc, 'Forecast data is not available. Please ensure the Development & Trends module has been loaded with prediction capabilities enabled.', currentY);
    }

    // ──────────────────────────────────────────────
    // SECTION 11: RAW DATA APPENDIX
    // ──────────────────────────────────────────────
    doc.addPage();
    currentY = MARGIN.top + 5;
    sectionNum++;
    sectionPages['appendix'] = doc.internal.getNumberOfPages();
    currentY = addSectionTitle(doc, 'Raw Data Appendix', sectionNum, currentY);

    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...COLORS.gray500);
    doc.text('Complete datasets extracted from the analytics cache for reference and further analysis.', MARGIN.left + 2, currentY);
    currentY += 10;

    // Iterate through all cached data and output any array datasets
    const appendixSections = [
      { label: 'Geographic Distribution', data: data.geo },
      { label: 'Research Distribution', data: data.distribution },
      { label: 'Impact Quartiles', data: data.quartiles },
      { label: 'Journal Rankings (Full)', data: data.journalRanking },
      { label: 'Journal Impact Matrix (Full)', data: data.impactMatrix },
      { label: 'Keyword Vectors (Full)', data: data.keywordVectors },
      { label: 'Cross-Domain Links', data: data.crossLinks },
      { label: 'Temporal Cluster Shift', data: data.temporalShift },
    ];

    for (const section of appendixSections) {
      const sData = section.data;
      if (!Array.isArray(sData) || sData.length === 0) continue;

      if (needsPageBreak(currentY, 25)) {
        doc.addPage();
        currentY = MARGIN.top + 5;
      }
      currentY = addSubsectionTitle(doc, section.label, currentY);

      // Auto-detect columns from first item
      const firstItem = sData[0];
      const cols = Object.keys(firstItem).filter(k =>
        typeof firstItem[k] !== 'object' || firstItem[k] === null
      ).slice(0, 7);

      const head = cols.map(c => c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
      const body = sData.slice(0, 30).map(d =>
        cols.map(c => {
          const v = d[c];
          if (v == null) return '—';
          if (typeof v === 'number') return fmt(v);
          return truncate(String(v), 35);
        })
      );

      currentY = addStyledTable(doc, head, body, currentY);
    }

    // ──────────────────────────────────────────────
    // UPDATE TABLE OF CONTENTS PAGE NUMBERS
    // ──────────────────────────────────────────────
    doc.setPage(tocPageNum);
    // Rewrite TOC with actual page numbers
    // We need to redraw the TOC content
    // Clear the TOC page by drawing a white rect over it
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, PAGE.width, PAGE.height, 'F');

    // Top accent bar
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, PAGE.width, 3, 'F');

    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...COLORS.gray900);
    doc.text('Table of Contents', MARGIN.left, 35);

    doc.setFillColor(...COLORS.primary);
    doc.rect(MARGIN.left, 39, 35, 1.5, 'F');

    let tocY = 55;
    let tocNum = 1;

    Object.entries(SECTION_MAP).forEach(([key, title]) => {
      const pageNum = sectionPages[key] || '—';

      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(...COLORS.primary);
      doc.text(`${String(tocNum).padStart(2, '0')}`, MARGIN.left, tocY);

      doc.setFont(undefined, 'normal');
      doc.setTextColor(...COLORS.gray900);
      doc.text(title, MARGIN.left + 12, tocY);

      doc.setDrawColor(...COLORS.gray300);
      doc.setLineDashPattern([0.5, 1.5], 0);
      doc.setLineWidth(0.2);
      const textW = doc.getTextWidth(title);
      doc.line(MARGIN.left + 12 + textW + 2, tocY, PAGE.width - MARGIN.right - 10, tocY);
      doc.setLineDashPattern([], 0);

      doc.setTextColor(...COLORS.gray500);
      doc.text(String(pageNum), PAGE.width - MARGIN.right, tocY, { align: 'right' });

      tocY += 12;
      tocNum++;
    });

    // ──────────────────────────────────────────────
    // ADD HEADERS AND FOOTERS TO ALL PAGES
    // ──────────────────────────────────────────────
    addHeadersAndFooters(doc, projectName);

    // ──────────────────────────────────────────────
    // SAVE THE DOCUMENT
    // ──────────────────────────────────────────────
    const safeName = projectName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    doc.save(`${safeName}_Analytics_Report.pdf`);

  } catch (error) {
    console.error('PDF Report Generation Failed:', error);
    alert('Failed to generate PDF report. Please check the console for details.');
  } finally {
    // Remove loading overlay
    const el = document.getElementById('pdf-export-overlay');
    if (el) el.remove();
  }
};
