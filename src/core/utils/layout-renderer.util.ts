/**
 * Layout Renderer Utility Functions
 *
 * This file contains utility functions for working with LayoutRenderer objects,
 * including finding renderers by type, extracting sections, and matching commissars.
 */

import { LayoutRenderer, Commissar, matchingPath } from "../../index";

// Interface for layout section extraction result
export interface LayoutSections {
  header: LayoutRenderer['header'] | null
  footer: LayoutRenderer['footer'] | null
  sider: LayoutRenderer['sider'] | null
  content: LayoutRenderer['content'] | null
}

/**
 * Get a single layout renderer by type
 * @param layoutRenderers - Array of layout renderers
 * @param type - Layout type to search for
 * @returns The first matching layout renderer or null
 */
export function getLayoutRendererByType(
  layoutRenderers: LayoutRenderer[] | null,
  type: string
): LayoutRenderer | null {
  if (!layoutRenderers) return null
  return layoutRenderers.find(renderer => renderer.type === type) || null
}

/**
 * Get multiple layout renderers by type
 * @param layoutRenderers - Array of layout renderers
 * @param type - Layout type to search for
 * @returns Array of matching layout renderers
 */
export function getLayoutRenderersByType(
  layoutRenderers: LayoutRenderer[] | null,
  type: string
): LayoutRenderer[] {
  if (!layoutRenderers) return []
  return layoutRenderers.filter(renderer => renderer.type === type)
}

/**
 * Extract all sections from a layout renderer
 * @param renderer - Layout renderer to extract sections from
 * @returns Object containing all sections (header, footer, sider, content)
 */
export function extractLayoutSections(renderer: LayoutRenderer | null): LayoutSections {
  if (!renderer) {
    return {
      header: null,
      footer: null,
      sider: null,
      content: null
    }
  }

  return {
    header: renderer.header || null,
    footer: renderer.footer || null,
    sider: renderer.sider || null,
    content: renderer.content || null
  }
}

/**
 * Get a specific section from a layout renderer
 * @param renderer - Layout renderer to extract section from
 * @param sectionName - Name of the section to extract
 * @returns The requested section or null
 */
export function getLayoutSection(
  renderer: LayoutRenderer | null,
  sectionName: 'header' | 'footer' | 'sider' | 'content'
): any {
  if (!renderer) return null

  switch (sectionName) {
    case 'header':
      return renderer.header || null
    case 'footer':
      return renderer.footer || null
    case 'sider':
      return renderer.sider || null
    case 'content':
      return renderer.content || null
    default:
      return null
  }
}

/**
 * Find matching commissar for a given path
 * @param layoutRenderers - Array of layout renderers
 * @param path - Path to match against commissar paths
 * @returns Matching commissar with enhanced path or null
 */
export function findMatchingCommissar(
  layoutRenderers: LayoutRenderer[] | null,
  path: string
): Commissar | null {
  if (!layoutRenderers) return null
  for (const renderer of layoutRenderers) {
    const commissars = renderer.content.meta
      let pathString: string ='';

      const matchingCommissar = commissars.find((commissar: Commissar) => {

        if (typeof commissar.path === 'string' && commissar.path.trim() !== '') {
            pathString = commissar.path;
        } else if (typeof commissar.path === 'object' && commissar.path?.path && typeof commissar.path.path === 'string' && commissar.path.path.trim() !== '') {
            pathString = commissar.path.path;
        }
      const bool = matchingPath(pathString, path)
        return bool;
    })

    if (matchingCommissar) {
      // Enhance the commissar with path.path = current path and layout type
      return {
        ...matchingCommissar,
        path: {
          // Preserve original path if it was an object, otherwise create new object
          ...(typeof matchingCommissar.path === 'object' ? matchingCommissar.path : {}),
          path: pathString, // Set path.path to the current matched path
          overrideLayout: renderer.type // Set layout to the layout renderer type
        }
      }
    }
  }

  return null
}

/**
 * Get header section from a layout renderer by type
 * @param layoutRenderers - Array of layout renderers
 * @param type - Layout type to search for
 * @returns Header section or null
 */
export function getHeaderByType(
  layoutRenderers: LayoutRenderer[] | null,
  type: string
) {
  const renderer = getLayoutRendererByType(layoutRenderers, type)
  return getLayoutSection(renderer, 'header')
}

/**
 * Get footer section from a layout renderer by type
 * @param layoutRenderers - Array of layout renderers
 * @param type - Layout type to search for
 * @returns Footer section or null
 */
export function getFooterByType(
  layoutRenderers: LayoutRenderer[] | null,
  type: string
) {
  const renderer = getLayoutRendererByType(layoutRenderers, type)
  return getLayoutSection(renderer, 'footer')
}

/**
 * Get sider section from a layout renderer by type
 * @param layoutRenderers - Array of layout renderers
 * @param type - Layout type to search for
 * @returns Sider section or null
 */
export function getSiderByType(
  layoutRenderers: LayoutRenderer[] | null,
  type: string
) {
  const renderer = getLayoutRendererByType(layoutRenderers, type)
  return getLayoutSection(renderer, 'sider')
}

/**
 * Get content section from a layout renderer by type
 * @param layoutRenderers - Array of layout renderers
 * @param type - Layout type to search for
 * @returns Content section or null
 */
export function getContentByType(
  layoutRenderers: LayoutRenderer[] | null,
  type: string
) {
  const renderer = getLayoutRendererByType(layoutRenderers, type)
  return getLayoutSection(renderer, 'content')
}

/**
 * Get all available layout types from an array of layout renderers
 * @param layoutRenderers - Array of layout renderers
 * @returns Array of unique layout types
 */
export function getAvailableLayoutTypes(layoutRenderers: LayoutRenderer[] | null): string[] {
  if (!layoutRenderers) return []
  return [...new Set(layoutRenderers.map(renderer => renderer.type || 'default'))]
}

/**
 * Check if a layout type exists in the array of layout renderers
 * @param layoutRenderers - Array of layout renderers
 * @param type - Layout type to check for
 * @returns True if the layout type exists, false otherwise
 */
export function hasLayoutType(
  layoutRenderers: LayoutRenderer[] | null,
  type: string
): boolean {
  return getLayoutRendererByType(layoutRenderers, type) !== null
}
