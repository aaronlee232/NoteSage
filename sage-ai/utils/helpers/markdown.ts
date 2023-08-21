import { createHash } from 'crypto'
import GithubSlugger from 'github-slugger'
import type { Content, Root, RootContent } from 'mdast'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toMarkdown } from 'mdast-util-to-markdown'
import { toString } from 'mdast-util-to-string'
import { u } from 'unist-builder'
import { filter } from 'unist-util-filter'
import { getRootContentDepth as getDepth } from './ts-error-workaround.js'

export const processMarkdown = async (content: string) => {
  const checksum = createHash('sha256').update(content).digest('base64')

  const mdxTree = fromMarkdown(content)
  const mdTree = stripMDX(mdxTree)

  if (!mdTree) {
    return {
      checksum,
      sections: [],
    }
  }

  const sections = getSections(mdTree)

  return {
    checksum,
    sections,
  }
}

// Remove all MDX elements from markdown
const stripMDX = (mdxTree: Root) => {
  const mdTree = filter(
    mdxTree,
    (node: any) =>
      ![
        'mdxjsEsm',
        'mdxJsxFlowElement',
        'mdxJsxTextElement',
        'mdxFlowExpression',
        'mdxTextExpression',
      ].includes(node.type)
  )

  return mdTree
}

// Divide markdown into sections based on heading '#' chunks
const getSections = (mdTree: Root) => {
  const slugger = new GithubSlugger()

  // Keeps track of the previous header sections with less depth than current section
  const pastParentHeaderNodes: RootContent[] = []

  // Divide markdown file into trees based on 'heading' nodes
  const sectionTrees = splitTreeBy(mdTree, (node) => node.type === 'heading')

  const sections = sectionTrees.map((tree) => {
    const [firstNode] = tree.children
    const immediateParentNode = pastParentHeaderNodes.slice(-1)[0]

    // Don't add sections with only a header as content
    if (tree.children.length == 1) {
      pastParentHeaderNodes.push(firstNode)
      return null
    }

    // Handle first node case
    if (pastParentHeaderNodes.length == 0) {
      pastParentHeaderNodes.push(firstNode)

      // Extract most immediate header/slug of content
      const heading =
        firstNode.type === 'heading' ? toString(firstNode) : undefined
      const slug = heading ? slugger.slug(heading) : undefined
      const content = toMarkdown(tree)

      return {
        content,
        heading,
        slug,
      }
    }

    const firstNodeDepth = getDepth(firstNode)
    const parentDepth = getDepth(immediateParentNode)

    // In case of backtracking in markdown tree, remove nodes that are no longer parents of current node
    if (firstNodeDepth <= parentDepth) {
      removeIrrelevantNodes(pastParentHeaderNodes, firstNodeDepth)
    }

    // Add past parent header nodes to current node for extra context
    tree.children = [...pastParentHeaderNodes, ...tree.children]

    // Add current node to the parent tree children list
    pastParentHeaderNodes.push(firstNode)

    // Extract most immediate header/slug of content
    const heading =
      firstNode.type === 'heading' ? toString(firstNode) : undefined
    const slug = heading ? slugger.slug(heading) : undefined
    const content = toMarkdown(tree)

    return {
      content,
      heading,
      slug,
    }
  })

  const filteredSections = []
  for (let section of sections) {
    if (section) {
      filteredSections.push(section)
    }
  }

  return filteredSections
}

// Removes nodes that the current node is not nested in
// 'Nestedness' is determined by depth
// a node A is only nested in node B if A is deeper than B,
const removeIrrelevantNodes = (nodes: RootContent[], depth: number) => {
  while (true) {
    nodes.pop()

    const lastNode = nodes.slice(-1)[0]
    if (nodes.length == 0 || getDepth(lastNode) < depth) {
      break
    }
  }
}

/**
 * Splits a `mdast` tree into multiple trees based on
 * a predicate function. Will include the splitting node
 * at the beginning of each tree.
 *
 * Useful to split a markdown file into smaller sections.
 */
const splitTreeBy = (tree: Root, predicate: (node: Content) => boolean) => {
  return tree.children.reduce<Root[]>((trees, node) => {
    const [lastTree] = trees.slice(-1)

    if (!lastTree || predicate(node)) {
      const tree: Root = u('root', [node])
      return trees.concat(tree)
    }

    lastTree.children.push(node)
    return trees
  }, [])
}
