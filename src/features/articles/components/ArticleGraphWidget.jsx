import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceCollide, forceX, forceY } from 'd3-force';

import { useTranslation } from 'react-i18next';
import {
  ARTICLE_GRAPH_THEME,
  buildGraphData,
  clamp,
  compactText,
  getId,
  getNodeColor,
  getYearRange,
  toRgba,
} from '../utils/articleGraph.utils';

export default function ArticleGraphWidget({
  data,
  loading = false,
  error = '',
}) {
  const { t } = useTranslation();
  const fgRef = useRef(null);
  const graphBoxRef = useRef(null);

  const [dims, setDims] = useState({
    width: 960,
    height: 760,
  });

  const [hoverNode, setHoverNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());

  const graph = useMemo(() => {
    if (!data) return { nodes: [], links: [] };
    return buildGraphData(data);
  }, [data]);

  const { minYear, maxYear } = useMemo(() => {
    return getYearRange(graph.nodes);
  }, [graph.nodes]);

  useEffect(() => {
    const el = graphBoxRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setDims({
        width: Math.max(360, Math.floor(entry.contentRect.width)),
        height: Math.max(420, Math.floor(entry.contentRect.height)),
      });
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!graph.nodes.length || !fgRef.current) return;

    // Lực đẩy vừa phải để các cụm không văng quá xa
    fgRef.current.d3Force('charge')?.strength(-130);

    // Khoảng cách giữa các node có liên kết
    fgRef.current.d3Force('link')?.distance((link) => {
      const sourceDegree = link?.source?.degree || 1;
      const targetDegree = link?.target?.degree || 1;
      const avg = (sourceDegree + targetDegree) / 2;

      return clamp(110 - avg * 2, 70, 135);
    });

    // Kéo các cụm không liên kết về gần trung tâm
    fgRef.current.d3Force('x', forceX(0).strength(0.05));
    fgRef.current.d3Force('y', forceY(0).strength(0.05));

    // Tách node lớn ra, tránh đè nhau
    fgRef.current.d3Force(
      'collide',
      forceCollide((node) => {
        return clamp((node.val || 10) * 1.25, 18, 52);
      }).iterations(3)
    );

    fgRef.current.d3ReheatSimulation?.();
  }, [graph.nodes.length, graph.links.length]);

  const updateHighlight = useCallback(
    (node) => {
      if (!node) {
        setHoverNode(null);
        setHighlightNodes(new Set());
        setHighlightLinks(new Set());
        return;
      }

      const nodeId = String(node.id);
      const nextNodes = new Set([nodeId]);
      const nextLinks = new Set();

      for (const link of graph.links) {
        const sourceId = getId(link.source);
        const targetId = getId(link.target);

        if (sourceId === nodeId || targetId === nodeId) {
          nextLinks.add(link);
          nextNodes.add(sourceId);
          nextNodes.add(targetId);
        }
      }

      setHoverNode(node);
      setHighlightNodes(nextNodes);
      setHighlightLinks(nextLinks);
    },
    [graph.links]
  );

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);

    if (node?.x != null && node?.y != null) {
      fgRef.current?.centerAt?.(node.x, node.y, 500);
      fgRef.current?.zoom?.(2.15, 500);
    }

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          source: 'article-graph-widget',
          type: 'NODE_CLICK',
          payload: {
            id: node.properties.id,
            label: node.label,
            title: node.properties?.title,
            doi: node.properties?.doi,
            year: node.properties?.publication_year || node.properties?.year,
          },
        },
        import.meta.env.VITE_PARENT_ORIGIN || '*'
      );
    }
  }, []);

  const drawNode = useCallback(
    (node, ctx, globalScale) => {
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoverNode?.id === node.id;
      const hasHighlight = highlightNodes.size > 0;
      const isActive = !hasHighlight || highlightNodes.has(String(node.id));

      const radius = node.val || 10;
      const color = getNodeColor(node, minYear, maxYear);
      const label = compactText(node.label, radius > 24 ? 16 : 12);

      ctx.save();
      ctx.globalAlpha = isActive ? 1 : 0.18;

      if (isSelected) {
        ctx.beginPath();
        ctx.fillStyle = ARTICLE_GRAPH_THEME.selectedGlow;
        ctx.arc(node.x, node.y, radius + 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = ARTICLE_GRAPH_THEME.selectedRing;
        ctx.lineWidth = 3 / globalScale;
        ctx.arc(node.x, node.y, radius + 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.fillStyle = toRgba(color, isSelected ? 0.86 : 0.72);
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.strokeStyle = isHovered
        ? 'rgba(255,255,255,0.98)'
        : 'rgba(255,255,255,0.55)';
      ctx.lineWidth = isHovered ? 2.2 / globalScale : 1.2 / globalScale;
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.stroke();

      const fontSize = clamp(10 / globalScale, 6.5, 11);

      ctx.font = `${isSelected ? 700 : 500} ${fontSize}px Arial, sans-serif`;
      ctx.textBaseline = 'middle';

      if (radius < 11) {
        ctx.textAlign = 'left';

        ctx.strokeStyle = 'rgba(255,255,255,0.95)';
        ctx.lineWidth = 3 / globalScale;
        ctx.strokeText(label, node.x + radius + 3, node.y);

        ctx.fillStyle = isSelected
          ? ARTICLE_GRAPH_THEME.selectedTextColor
          : ARTICLE_GRAPH_THEME.textColor;
        ctx.fillText(label, node.x + radius + 3, node.y);
      } else {
        ctx.textAlign = 'center';

        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 3.2 / globalScale;
        ctx.strokeText(label, node.x, node.y);

        ctx.fillStyle = isSelected
          ? ARTICLE_GRAPH_THEME.selectedTextColor
          : ARTICLE_GRAPH_THEME.textColor;
        ctx.fillText(label, node.x, node.y);
      }

      ctx.restore();
    },
    [selectedNode, hoverNode, highlightNodes, minYear, maxYear]
  );

  const drawPointerArea = useCallback((node, color, ctx) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(node.x, node.y, Math.max(10, (node.val || 10) + 4), 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const getLinkColor = useCallback(
    (link) => {
      const hasHighlight = highlightLinks.size > 0;
      const isActive = highlightLinks.has(link);

      if (!hasHighlight) return ARTICLE_GRAPH_THEME.linkColor;

      return isActive
        ? ARTICLE_GRAPH_THEME.linkActiveColor
        : 'rgba(120, 65, 20, 0.035)';
    },
    [highlightLinks]
  );

  const resetView = () => {
    fgRef.current?.zoomToFit?.(700, 72);
  };

  const centerView = () => {
    fgRef.current?.centerAt?.(0, 0, 500);
    fgRef.current?.zoom?.(1, 500);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        minHeight: 520,
        background: ARTICLE_GRAPH_THEME.bg,
        overflow: 'hidden',
      }}
    >
      <div
        ref={graphBoxRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: 520,
          overflow: 'hidden',
          background: ARTICLE_GRAPH_THEME.bg,
        }}
      >
        <ForceGraph2D
          ref={fgRef}
          graphData={graph}
          width={dims.width}
          height={dims.height}
          backgroundColor={ARTICLE_GRAPH_THEME.bg}
          cooldownTicks={180}
          d3AlphaDecay={0.022}
          d3VelocityDecay={0.27}
          nodeRelSize={1}
          nodeCanvasObject={drawNode}
          nodePointerAreaPaint={drawPointerArea}
          nodeLabel={(node) => {
            const title = node.properties?.title;
            const doi = node.properties?.doi;
            const year = node.properties?.publication_year || node.properties?.year;

            let html = `
              <div style="
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(8px);
                color: #431407;
                border: 1px solid rgba(234, 88, 12, 0.3);
                border-radius: 8px;
                padding: 10px 14px;
                box-shadow: 0 8px 24px rgba(234, 88, 12, 0.15);
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 13px;
                line-height: 1.5;
                max-width: 280px;
              ">
            `;
            if (title) {
              html += `<div style="font-weight: 600; font-size: 14px; color: #9a3412; margin-bottom: 4px;">${title}</div>`;
            }
            if (doi) {
              html += `<div style="margin-bottom: 2px;"><strong style="color: #c2410c;">DOI:</strong> ${doi}</div>`;
            }
            if (year) {
              html += `<div><strong style="color: #c2410c;">Year:</strong> ${year}</div>`;
            }
            if (!title && !doi && !year) {
              html += `<div style="font-weight: 500;">${node.label}</div>`;
            }
            html += `</div>`;
            return html;
          }}
          linkColor={getLinkColor}
          linkWidth={(link) => (highlightLinks.has(link) ? 1.4 : 0.65)}
          linkDirectionalParticles={0}
          linkDirectionalArrowLength={0}
          onNodeHover={updateHighlight}
          onNodeClick={handleNodeClick}
          onBackgroundClick={() => setSelectedNode(null)}
        />

        {loading ? (
          <OverlayCard>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: '3px solid rgba(234, 88, 12, 0.2)',
                  borderTopColor: '#ea580c',
                  animation: 'article-graph-spin 0.9s linear infinite',
                }}
              />
            </div>
            <div style={{ fontWeight: 700, color: '#9a3412' }}>
              {t('articleGraph.loadingTitle', 'Loading graph data, please wait...')}
            </div>
            <div style={{ marginTop: 4, fontSize: 13, color: '#c2410c' }}>
              {t('articleGraph.loadingSub', 'Synthesizing related article network')}
            </div>
            <style>{`
              @keyframes article-graph-spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </OverlayCard>
        ) : null}

        {!loading && error ? (
          <OverlayCard>
            <div style={{ fontWeight: 700, color: '#b42318' }}>
              {t('articleGraph.errorTitle', 'Cannot load graph')}
            </div>
            <div style={{ marginTop: 4, fontSize: 13, color: '#b42318' }}>
              {error}
            </div>
          </OverlayCard>
        ) : null}

        {!loading && !error && graph.nodes.length === 0 ? (
          <OverlayCard>
            <div style={{ fontWeight: 700, color: '#9a3412' }}>
              {t('articleGraph.noDataTitle', 'No article graph data')}
            </div>
            <div style={{ marginTop: 4, fontSize: 13, color: '#c2410c' }}>
              {t('articleGraph.noDataSub', 'No articles with valid relationship data were found.')}
            </div>
          </OverlayCard>
        ) : null}

        <div
          style={{
            position: 'absolute',
            left: 14,
            bottom: 10,
            display: 'flex',
            gap: 10,
            zIndex: 5,
          }}
        >
          <CircleButton onClick={resetView}>?</CircleButton>
          <CircleButton onClick={centerView}>⌖</CircleButton>
        </div>

        <div
          style={{
            position: 'absolute',
            right: 16,
            bottom: 12,
            width: 340,
            maxWidth: '42vw',
            zIndex: 5,
          }}
        >
          <div
            style={{
              height: 16,
              borderRadius: 999,
              background: `linear-gradient(to right, ${ARTICLE_GRAPH_THEME.yearStartColor}, ${ARTICLE_GRAPH_THEME.yearEndColor})`,
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.18)',
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 5,
              color: '#9a3412',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <span>{minYear}</span>
            <span>{maxYear}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverlayCard({ children }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 18,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        padding: '12px 16px',
        borderRadius: 16,
        background: 'rgba(255, 255, 255, 0.92)',
        border: '1px solid rgba(251, 146, 60, 0.32)',
        boxShadow: '0 12px 30px rgba(154, 52, 18, 0.12)',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
      }}
    >
      {children}
    </div>
  );
}

function CircleButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 42,
        height: 42,
        borderRadius: '50%',
        border: '1px solid rgba(234, 88, 12, 0.5)',
        background: 'rgba(255, 255, 255, 0.92)',
        color: '#ea580c',
        fontSize: 22,
        lineHeight: 1,
        cursor: 'pointer',
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 8px 18px rgba(234, 88, 12, 0.14)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {children}
    </button>
  );
}