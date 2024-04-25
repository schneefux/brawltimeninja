import { JSDOM } from "jsdom";

/**
 * Get a matching section and all its sub-sections
 */
export function getSectionWithSubSections(
  wtf: any,
  matcher: (title: string) => boolean
) {
  let sections: any[] = [];
  let matchedSection: any = undefined;

  for (let index = 0; index < wtf.sections().length; index++) {
    const section = wtf.sections()[index];

    if (matcher(section.title())) {
      matchedSection = section;
    }

    if (matchedSection == undefined) {
      continue;
    }

    if (
      section.json().depth <= matchedSection.json().depth &&
      section != matchedSection
    ) {
      break;
    }

    sections.push(section);
  }

  return sections;
}

/**
 * Map a template like
 * { name1: 'Panda', rarity1: 'Rare', name2: 'Koala', rarity2: 'Epic' }
 * to
 * [ { name: 'Panda', rarity: 'Rare' }, { name: 'Koala', rarity: 'Epic' } ]
 */
export function mapTemplateToArrayOfObjects(
  template: any,
  valueProps: string[]
) {
  const keys = Object.keys(template);

  return keys
    .filter((key) => key.startsWith("name"))
    .map((name) => name.replace("name", ""))
    .map((id) =>
      Object.fromEntries(
        valueProps.map((valueProp) => [valueProp, template[valueProp + id]])
      )
    );
}

/**
 * Remove URL-/file-unsafe characters
 */
export function sanitize(s: string) {
  return s.replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase();
}

/**
 * Fuzzy-search the static.wikia URL containing the given words
 */
export function getMatchingStaticURL(links: string[], words: string[]) {
  const cleanWords = words
    .flatMap((w) => w.split(/ |_/g))
    .map((w) => sanitize(w));
  const assetLinks = links.filter((l) =>
    l.startsWith("https://static.wikia.nocookie.net")
  );
  const skinUrl = assetLinks.find((link) =>
    cleanWords.every((w) =>
      sanitize(
        decodeURIComponent(new URL(link).pathname.split("?")[0])
      ).includes(w)
    )
  );
  return skinUrl?.split("/smart")[0]?.split("/scale")[0]; // remove resizing parameters
}

/**
 * Get all links from a document
 */
export function getAllLinks(html: any) {
  const document = new JSDOM(html).window.document;
  let links: string[] = [];
  const attributes = ["src", "href", "data-src"];
  const allElements = document.getElementsByTagName("*");
  for (const element of allElements) {
    for (const attribute of attributes) {
      const attributeValue = element.getAttribute(attribute);
      if (attributeValue && attributeValue.includes("https")) {
        const link = attributeValue.replaceAll(/scale-to-.*?(?=\?)/g, "");
        links.push(link);
      }
    }
  }
  return links;
}

export const brawlerId = (name: string) =>
  name.replace(/\.| |&/g, "_").toLowerCase();
