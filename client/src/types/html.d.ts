declare global {
  interface HTMLElement {
    textContent: string;
    style: CSSStyleDeclaration;
  }

  interface Element {
    textContent: string;
  }

  interface HTMLLinkElement extends HTMLElement {
    rel: string;
    as: string;
    href: string;
  }
}