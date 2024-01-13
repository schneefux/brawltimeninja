import { isbot } from "isbot";
import { usePageContext } from "~/renderer/usePageContext";

// currently unused
export function isBot() {
  return isbot(usePageContext().server?.requestHeaders['user-agent'] ?? navigator.userAgent)
}
