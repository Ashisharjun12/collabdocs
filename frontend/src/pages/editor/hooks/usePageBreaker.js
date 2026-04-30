import { useEffect, useRef } from 'react';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

const PAGE_BREAKER_KEY = new PluginKey('pageBreaker');
const DARK_GAP_PX = 32; // the actual dark strip between pages

/**
 * makeSeparatorDOM
 *
 * The separator has 3 visual zones:
 *   [white: bottom margin of page above] + [dark: page gap] + [white: top margin of page below]
 *
 * This means:
 *   - Content of page N ends at the top of the separator (no extra space below it)
 *   - The dark strip appears (DARK_GAP_PX tall, bleeds full width)
 *   - Content of page N+1 starts after the separator (no extra space above it)
 *
 * The separator total height = marginBottomPx + DARK_GAP_PX + marginTopPx
 */
function makeSeparatorDOM(pageNum, marginTopPx, marginBottomPx, pageBg, marginLeftPx, marginRightPx) {
  const totalH = marginBottomPx + DARK_GAP_PX + marginTopPx;

  const el = document.createElement('div');
  el.className = 'flow-page-sep';
  el.contentEditable = 'false';
  el.setAttribute('data-page', pageNum);
  el.style.cssText = `
    display: block;
    height: ${totalH}px;
    box-sizing: border-box;
    pointer-events: none;
    user-select: none;
    position: relative;
  `;

  el.innerHTML = `
    <!-- Bottom margin of the page above (white / page background) -->
    <div style="
      height: ${marginBottomPx}px;
      background: ${pageBg};
    "></div>

    <!-- Dark page-gap strip — bleeds full width past content margins -->
    <div style="
      height: ${DARK_GAP_PX}px;
      background: #0a0b10;
      margin-left: -${marginLeftPx}px;
      margin-right: -${marginRightPx}px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        0 -3px 12px rgba(0,0,0,0.35),
        0  3px 12px rgba(0,0,0,0.35);
    ">
      <span style="
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.2);
        white-space: nowrap;
        pointer-events: none;
      ">Page ${pageNum}</span>
    </div>

    <!-- Top margin of the page below (white / page background) -->
    <div style="
      height: ${marginTopPx}px;
      background: ${pageBg};
    "></div>
  `;

  return el;
}

function detectLineHeight(pmViewDom) {
  try {
    const sample = pmViewDom.querySelector('p, [data-node-type="paragraph"]');
    if (sample) {
      const lh = parseFloat(getComputedStyle(sample).lineHeight);
      if (lh > 0) return lh;
    }
    const tmp = document.createElement('div');
    tmp.style.cssText = 'position:absolute;visibility:hidden;font-size:16px;line-height:1.5;';
    tmp.textContent = 'M';
    pmViewDom.appendChild(tmp);
    const h = tmp.getBoundingClientRect().height;
    pmViewDom.removeChild(tmp);
    return h > 0 ? h : 24;
  } catch {
    return 24;
  }
}

function buildPageBreakerPlugin(configRef) {
  return new Plugin({
    key: PAGE_BREAKER_KEY,

    state: {
      init: () => DecorationSet.empty,
      apply(tr, deco) {
        const next = tr.getMeta(PAGE_BREAKER_KEY);
        if (next !== undefined) return next;
        return deco.map(tr.mapping, tr.doc);
      },
    },

    props: {
      decorations: (state) => PAGE_BREAKER_KEY.getState(state),
    },

    view(pmView) {
      let raf = null;
      let busy = false;

      function measure() {
        if (busy) return;
        const cfg = configRef.current;
        if (!cfg.enabled || cfg.linesPerPage <= 0) {
          pmView.dispatch(pmView.state.tr.setMeta(PAGE_BREAKER_KEY, DecorationSet.empty));
          return;
        }

        busy = true;

        const lineHeightPx = detectLineHeight(pmView.dom);
        const { linesPerPage, marginTopPx, marginBottomPx, marginLeftPx, marginRightPx, pageBg } = cfg;

        const { doc } = pmView.state;
        const widgets = [];
        let accumulatedLines = 0;
        let pageNum = 1;

        doc.forEach((node, offset) => {
          const dom = pmView.nodeDOM(offset);
          if (!dom || !(dom instanceof Element)) return;

          const heightPx = dom.getBoundingClientRect().height;
          if (heightPx === 0) return;

          const blockLines = Math.max(1, Math.ceil(heightPx / lineHeightPx));

          if (accumulatedLines > 0 && accumulatedLines + blockLines > linesPerPage) {
            pageNum++;
            widgets.push(
              Decoration.widget(
                offset,
                () => makeSeparatorDOM(pageNum, marginTopPx, marginBottomPx, pageBg, marginLeftPx, marginRightPx),
                { key: `ps-p${pageNum}-o${offset}`, side: -1, stopEvent: () => true }
              )
            );
            accumulatedLines = blockLines;
          } else {
            accumulatedLines += blockLines;
          }
        });

        const decos = DecorationSet.create(doc, widgets);
        pmView.dispatch(pmView.state.tr.setMeta(PAGE_BREAKER_KEY, decos));
        busy = false;
      }

      function schedule() {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(measure);
      }

      const ro = new ResizeObserver(schedule);
      ro.observe(pmView.dom);
      schedule();

      return {
        update(view, prev) {
          if (view.state.doc !== prev.doc) schedule();
        },
        destroy() {
          ro.disconnect();
          if (raf) cancelAnimationFrame(raf);
        },
      };
    },
  });
}

export function usePageBreaker(editor, {
  enabled,
  linesPerPage = 0,
  pageHeightPx = 0,
  marginTopPx = 0,
  marginBottomPx = 0,
  marginLeftPx = 0,
  marginRightPx = 0,
  pageBg = '#ffffff',
}) {
  const configRef = useRef({ enabled: false, linesPerPage: 0 });
  const pluginAdded = useRef(false);

  // Always keep configRef current (runs synchronously before plugin reads it)
  useEffect(() => {
    const computed = linesPerPage > 0
      ? linesPerPage
      : Math.floor((pageHeightPx - marginTopPx - marginBottomPx) / 24);

    configRef.current = {
      enabled,
      linesPerPage: computed,
      marginTopPx,
      marginBottomPx,
      marginLeftPx,
      marginRightPx,
      pageBg,
    };
  });

  // Register plugin once
  useEffect(() => {
    if (!editor || pluginAdded.current) return;
    const pmView = editor._tiptapEditor?.view;
    if (!pmView) return;

    const plugin = buildPageBreakerPlugin(configRef);
    pmView.updateState(pmView.state.reconfigure({
      plugins: [...pmView.state.plugins, plugin],
    }));
    pluginAdded.current = true;
  }, [editor]);

  // Re-measure on any config change
  useEffect(() => {
    if (!editor || !pluginAdded.current) return;
    const pmView = editor._tiptapEditor?.view;
    if (!pmView) return;
    pmView.dispatch(pmView.state.tr);
  }, [enabled, linesPerPage, pageHeightPx, marginTopPx, marginBottomPx, marginLeftPx, marginRightPx, pageBg, editor]);
}
