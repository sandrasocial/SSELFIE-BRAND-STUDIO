/// <reference types="vite/client" />

// Browser global types for client-side code
declare global {
  // FormData
  interface FormData {
    append(name: string, value: string | Blob | File): void;
    delete(name: string): void;
    get(name: string): FormDataEntryValue | null;
    getAll(name: string): FormDataEntryValue[];
    has(name: string): boolean;
    set(name: string, value: string | Blob | File): void;
    forEach(callbackfn: (value: FormDataEntryValue, key: string, parent: FormData) => void, thisArg?: any): void;
  }

  var FormData: {
    prototype: FormData;
    new(): FormData;
  };

  // HTMLCanvasElement
  interface HTMLCanvasElement extends HTMLElement {
    width: number;
    height: number;
    getContext(contextId: "2d"): CanvasRenderingContext2D | null;
    getContext(contextId: "webgl"): WebGLRenderingContext | null;
    getContext(contextId: string): RenderingContext | null;
    toDataURL(type?: string, quality?: number): string;
    toBlob(callback: (blob: Blob | null) => void, type?: string, quality?: number): void;
  }

  // Image
  interface Image {
    src: string;
    onload: (() => void) | null;
    onerror: (() => void) | null;
    width: number;
    height: number;
    complete: boolean;
  }

  var Image: {
    prototype: Image;
    new(): Image;
    new(width?: number, height?: number): Image;
  };

  // AbortSignal
  interface AbortSignal extends EventTarget {
    readonly aborted: boolean;
    readonly reason: any;
    throwIfAborted(): void;
    addEventListener(type: "abort", listener: () => void): void;
    removeEventListener(type: "abort", listener: () => void): void;
  }

  // AbortController
  interface AbortController {
    readonly signal: AbortSignal;
    abort(reason?: any): void;
  }

  var AbortController: {
    prototype: AbortController;
    new(): AbortController;
  };

  // Performance
  interface Performance {
    now(): number;
    mark(name: string): void;
    measure(name: string, startMark?: string, endMark?: string): PerformanceMeasure;
    getEntriesByType(type: string): PerformanceEntryList;
    getEntriesByName(name: string, type?: string): PerformanceEntryList;
  }

  var performance: Performance;

  // Window
  interface Window {
    requestAnimationFrame(callback: FrameRequestCallback): number;
    cancelAnimationFrame(handle: number): void;
    setTimeout(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;
    clearTimeout(id: number | undefined): void;
    setInterval(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;
    clearInterval(id: number | undefined): void;
    location: Location;
    document: Document;
    console: Console;
    localStorage: Storage;
    sessionStorage: Storage;
    fetch: typeof fetch;
    performance: Performance;
    requestAnimationFrame: (callback: FrameRequestCallback) => number;
    cancelAnimationFrame: (handle: number) => void;
  }

  var window: Window;

  // Request
  interface RequestInit {
    method?: string;
    headers?: HeadersInit;
    body?: BodyInit | null;
    signal?: AbortSignal;
    keepalive?: boolean;
    timeout?: number;
  }

  // Response
  interface Response {
    readonly ok: boolean;
    readonly status: number;
    readonly statusText: string;
    readonly headers: Headers;
    readonly url: string;
    clone(): Response;
    json(): Promise<any>;
    text(): Promise<string>;
    arrayBuffer(): Promise<ArrayBuffer>;
    blob(): Promise<Blob>;
    formData(): Promise<FormData>;
  }

  var Response: {
    prototype: Response;
    new(body?: BodyInit | null, init?: ResponseInit): Response;
    error(): Response;
    redirect(url: string, status?: number): Response;
  };

  // Headers
  interface Headers {
    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string | null;
    has(name: string): boolean;
    set(name: string, value: string): void;
    forEach(callbackfn: (value: string, key: string, parent: Headers) => void, thisArg?: any): void;
  }

  var Headers: {
    prototype: Headers;
    new(init?: HeadersInit): Headers;
  };

  // File
  interface File extends Blob {
    readonly name: string;
    readonly lastModified: number;
    readonly webkitRelativePath: string;
  }

  var File: {
    prototype: File;
    new(fileBits: BlobPart[], fileName: string, options?: FilePropertyBag): File;
  };

  // Blob
  interface Blob {
    readonly size: number;
    readonly type: string;
    slice(start?: number, end?: number, contentType?: string): Blob;
  }

  var Blob: {
    prototype: Blob;
    new(blobParts?: BlobPart[], options?: BlobPropertyBag): Blob;
  };

  // URL
  interface URL {
    readonly href: string;
    readonly origin: string;
    readonly protocol: string;
    readonly username: string;
    readonly password: string;
    readonly host: string;
    readonly hostname: string;
    readonly port: string;
    readonly pathname: string;
    readonly search: string;
    readonly searchParams: URLSearchParams;
    readonly hash: string;
    toString(): string;
    toJSON(): string;
  }

  var URL: {
    prototype: URL;
    new(url: string, base?: string | URL): URL;
    createObjectURL(object: Blob | MediaSource): string;
    revokeObjectURL(url: string): void;
  };

  // URLSearchParams
  interface URLSearchParams {
    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string | null;
    getAll(name: string): string[];
    has(name: string): boolean;
    set(name: string, value: string): void;
    sort(): void;
    forEach(callbackfn: (value: string, key: string, parent: URLSearchParams) => void, thisArg?: any): void;
    toString(): string;
  }

  var URLSearchParams: {
    prototype: URLSearchParams;
    new(init?: string | URLSearchParams | Record<string, string> | [string, string][]): URLSearchParams;
  };

  // Console
  interface Console {
    log(...data: any[]): void;
    error(...data: any[]): void;
    warn(...data: any[]): void;
    info(...data: any[]): void;
    debug(...data: any[]): void;
    table(tabularData: any, properties?: string[]): void;
    trace(...data: any[]): void;
    group(...data: any[]): void;
    groupCollapsed(...data: any[]): void;
    groupEnd(): void;
    time(label?: string): void;
    timeEnd(label?: string): void;
    timeLog(label?: string, ...data: any[]): void;
  }

  var console: Console;

  // Storage
  interface Storage {
    readonly length: number;
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
    key(index: number): string | null;
  }

  // Location
  interface Location {
    readonly href: string;
    readonly origin: string;
    readonly protocol: string;
    readonly host: string;
    readonly hostname: string;
    readonly port: string;
    readonly pathname: string;
    readonly search: string;
    readonly hash: string;
    assign(url: string): void;
    reload(): void;
    replace(url: string): void;
  }

  // Document
  interface Document extends Node {
    readonly location: Location;
    readonly body: HTMLElement;
    readonly head: HTMLElement;
    readonly documentElement: HTMLElement;
    createElement(tagName: string): HTMLElement;
    createElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K];
    createTextNode(data: string): Text;
    getElementById(elementId: string): HTMLElement | null;
    getElementsByTagName(tagName: string): HTMLCollectionOf<Element>;
    getElementsByClassName(classNames: string): HTMLCollectionOf<Element>;
    querySelector(selectors: string): Element | null;
    querySelectorAll(selectors: string): NodeListOf<Element>;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  var document: Document;

  // HTMLElement
  interface HTMLElement extends Element {
    style: CSSStyleDeclaration;
    className: string;
    innerHTML: string;
    textContent: string | null;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    setAttribute(name: string, value: string): void;
    getAttribute(name: string): string | null;
    removeAttribute(name: string): void;
  }

  // Element
  interface Element extends Node {
    tagName: string;
    classList: DOMTokenList;
    setAttribute(name: string, value: string): void;
    getAttribute(name: string): string | null;
    removeAttribute(name: string): void;
    querySelector(selectors: string): Element | null;
    querySelectorAll(selectors: string): NodeListOf<Element>;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  // Node
  interface Node {
    readonly nodeType: number;
    readonly parentNode: Node | null;
    readonly childNodes: NodeListOf<Node>;
    appendChild<T extends Node>(node: T): T;
    removeChild<T extends Node>(child: T): T;
    insertBefore<T extends Node>(node: T, child: Node | null): T;
    contains(node: Node | null): boolean;
  }

  // NodeList
  interface NodeListOf<TNode extends Node> {
    readonly length: number;
    item(index: number): TNode | null;
    [index: number]: TNode;
    forEach(callbackfn: (value: TNode, key: number, parent: NodeListOf<TNode>) => void, thisArg?: any): void;
  }

  // DOMTokenList
  interface DOMTokenList {
    readonly length: number;
    add(...tokens: string[]): void;
    remove(...tokens: string[]): void;
    toggle(token: string, force?: boolean): boolean;
    contains(token: string): boolean;
    item(index: number): string | null;
    [index: number]: string;
  }

  // CSSStyleDeclaration
  interface CSSStyleDeclaration {
    cssText: string;
    length: number;
    getPropertyValue(property: string): string;
    setProperty(property: string, value: string | null, priority?: string): void;
    removeProperty(property: string): string;
    item(index: number): string;
    [index: number]: string;
  }

  // Event
  interface Event {
    readonly type: string;
    readonly target: EventTarget | null;
    readonly currentTarget: EventTarget | null;
    preventDefault(): void;
    stopPropagation(): void;
  }

  // EventTarget
  interface EventTarget {
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    dispatchEvent(event: Event): boolean;
  }

  // Text
  interface Text extends Node {
    readonly wholeText: string;
    data: string;
  }

  // HTMLCollection
  interface HTMLCollectionOf<T extends Element> {
    readonly length: number;
    item(index: number): T | null;
    namedItem(name: string): T | null;
    [index: number]: T;
  }

  // TimerHandler
  type TimerHandler = string | Function;

  // FrameRequestCallback
  type FrameRequestCallback = (time: number) => void;

  // AddEventListenerOptions
  interface AddEventListenerOptions extends EventListenerOptions {
    once?: boolean;
    passive?: boolean;
  }

  // EventListenerOptions
  interface EventListenerOptions {
    capture?: boolean;
  }

  // EventListener
  type EventListener = (event: Event) => void;

  // EventListenerOrEventListenerObject
  type EventListenerOrEventListenerObject = EventListener | EventListenerObject;

  // EventListenerObject
  interface EventListenerObject {
    handleEvent(event: Event): void;
  }

  // BodyInit
  type BodyInit = Blob | BufferSource | FormData | URLSearchParams | ReadableStream | string;

  // HeadersInit
  type HeadersInit = Headers | Record<string, string> | [string, string][];

  // RequestInfo
  type RequestInfo = Request | string;

  // ResponseInit
  interface ResponseInit {
    status?: number;
    statusText?: string;
    headers?: HeadersInit;
  }

  // BlobPart
  type BlobPart = BufferSource | Blob | string;

  // BlobPropertyBag
  interface BlobPropertyBag {
    type?: string;
    endings?: "transparent" | "native";
  }

  // FilePropertyBag
  interface FilePropertyBag extends BlobPropertyBag {
    lastModified?: number;
  }

  // FormDataEntryValue
  type FormDataEntryValue = File | string;

  // PerformanceEntry
  interface PerformanceEntry {
    readonly name: string;
    readonly entryType: string;
    readonly startTime: number;
    readonly duration: number;
  }

  // PerformanceMeasure
  interface PerformanceMeasure extends PerformanceEntry {}

  // PerformanceEntryList
  type PerformanceEntryList = PerformanceEntry[];

  // RenderingContext
  type RenderingContext = CanvasRenderingContext2D | WebGLRenderingContext;

  // CanvasRenderingContext2D (simplified)
  interface CanvasRenderingContext2D {
    fillStyle: string | CanvasGradient | CanvasPattern;
    strokeStyle: string | CanvasGradient | CanvasPattern;
    lineWidth: number;
    fillRect(x: number, y: number, width: number, height: number): void;
    strokeRect(x: number, y: number, width: number, height: number): void;
    clearRect(x: number, y: number, width: number, height: number): void;
    fillText(text: string, x: number, y: number, maxWidth?: number): void;
    strokeText(text: string, x: number, y: number, maxWidth?: number): void;
    measureText(text: string): TextMetrics;
    drawImage(image: CanvasImageSource, dx: number, dy: number): void;
    drawImage(image: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): void;
    drawImage(image: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;
    createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
    createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
    createPattern(image: CanvasImageSource, repetition: string): CanvasPattern | null;
    beginPath(): void;
    closePath(): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
    rect(x: number, y: number, width: number, height: number): void;
    fill(): void;
    stroke(): void;
    clip(): void;
    isPointInPath(x: number, y: number): boolean;
    save(): void;
    restore(): void;
    translate(x: number, y: number): void;
    rotate(angle: number): void;
    scale(x: number, y: number): void;
    transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    globalAlpha: number;
    globalCompositeOperation: string;
    imageSmoothingEnabled: boolean;
    font: string;
    textAlign: "left" | "right" | "center" | "start" | "end";
    textBaseline: "top" | "hanging" | "middle" | "alphabetic" | "ideographic" | "bottom";
  }

  // CanvasImageSource
  type CanvasImageSource = HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap;

  // CanvasGradient
  interface CanvasGradient {
    addColorStop(offset: number, color: string): void;
  }

  // CanvasPattern
  interface CanvasPattern {}

  // TextMetrics
  interface TextMetrics {
    readonly width: number;
    readonly actualBoundingBoxLeft: number;
    readonly actualBoundingBoxRight: number;
    readonly actualBoundingBoxAscent: number;
    readonly actualBoundingBoxDescent: number;
  }

  // WebGLRenderingContext (simplified)
  interface WebGLRenderingContext {}

  // ReadableStream (simplified)
  interface ReadableStream<R = any> {
    readonly locked: boolean;
    cancel(reason?: any): Promise<void>;
    getReader(): ReadableStreamDefaultReader<R>;
  }

  // ReadableStreamDefaultReader
  interface ReadableStreamDefaultReader<R = any> {
    readonly closed: Promise<void>;
    cancel(reason?: any): Promise<void>;
    read(): Promise<ReadableStreamReadResult<R>>;
    releaseLock(): void;
  }

  // ReadableStreamReadResult
  interface ReadableStreamReadResult<T> {
    done: boolean;
    value?: T;
  }

  // MediaSource (simplified)
  interface MediaSource {}

  // ImageBitmap (simplified)
  interface ImageBitmap {}

  // HTMLVideoElement (simplified)
  interface HTMLVideoElement extends HTMLElement {}

  // HTMLImageElement (simplified)
  interface HTMLImageElement extends HTMLElement {
    src: string;
    width: number;
    height: number;
    complete: boolean;
    onload: (() => void) | null;
    onerror: (() => void) | null;
  }
}

export {};