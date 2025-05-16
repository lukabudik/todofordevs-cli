// Type declarations for modules without type definitions

// Declare conf module
declare module 'conf' {
  interface ConfOptions<T> {
    projectName?: string;
    schema?: Record<string, any>;
    defaults?: Partial<T>;
    configName?: string;
    fileExtension?: string;
    clearInvalidConfig?: boolean;
    serialize?: (value: T) => string;
    deserialize?: (text: string) => T;
  }

  class Conf<T extends Record<string, any> = Record<string, any>> {
    constructor(options?: ConfOptions<T>);
    get<K extends keyof T>(key: K): T[K];
    get<K extends keyof T, D>(key: K, defaultValue: D): T[K] | D;
    get(key: string): any;
    set<K extends keyof T>(key: K, value: T[K]): void;
    set(key: string, value: any): void;
    set(object: Partial<T>): void;
    has<K extends keyof T>(key: K): boolean;
    has(key: string): boolean;
    delete<K extends keyof T>(key: K): void;
    delete(key: string): void;
    clear(): void;
    path: string;
    store: T;
  }

  export = Conf;
}

// Declare open module
declare module 'open' {
  function open(
    target: string,
    options?: {
      wait?: boolean;
      app?: string | string[];
    },
  ): Promise<any>;

  export = open;
}

// Declare inquirer module
declare module 'inquirer' {
  interface Question {
    type?: string;
    name: string;
    message: string | ((answers: Record<string, any>) => string);
    default?: any | ((answers: Record<string, any>) => any);
    choices?: any[] | ((answers: Record<string, any>) => any[]);
    validate?: (
      input: any,
      answers?: Record<string, any>,
    ) => boolean | string | Promise<boolean | string>;
    filter?: (input: any, answers: Record<string, any>) => any;
    transformer?: (
      input: any,
      answers: Record<string, any>,
      flags: { isFinal?: boolean },
    ) => string;
    when?: boolean | ((answers: Record<string, any>) => boolean);
    pageSize?: number;
    prefix?: string;
    suffix?: string;
    loop?: boolean;
    askAnswered?: boolean;
  }

  interface Answers {
    [key: string]: any;
  }

  interface PromptModule {
    (questions: Question[]): Promise<Answers>;
    (question: Question): Promise<Answers>;
  }

  const prompt: PromptModule;
  export = { prompt };
}

// Declare axios module
declare module 'axios' {
  export interface AxiosRequestConfig {
    baseURL?: string;
    timeout?: number;
    headers?: Record<string, string>;
    [key: string]: any;
  }

  export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: AxiosRequestConfig;
  }

  export interface AxiosInstance {
    (config: AxiosRequestConfig): Promise<AxiosResponse>;
    (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse>;
    get<T = any>(
      url: string,
      config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>>;
    post<T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>>;
    put<T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>>;
    delete<T = any>(
      url: string,
      config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>>;
    interceptors: {
      request: {
        use: (
          onFulfilled: (config: AxiosRequestConfig) => AxiosRequestConfig,
        ) => void;
      };
      response: {
        use: (onFulfilled: (response: AxiosResponse) => AxiosResponse) => void;
      };
    };
  }

  export function create(config?: AxiosRequestConfig): AxiosInstance;
  export function isAxiosError(error: any): boolean;
}

// Declare chalk module
declare module 'chalk' {
  type ChalkFunction = (text: string) => string;

  interface Chalk {
    red: ChalkFunction;
    green: ChalkFunction;
    yellow: ChalkFunction;
    blue: ChalkFunction;
    gray: ChalkFunction;
    bold: ChalkFunction;
    cyan: ChalkFunction;
  }

  const chalk: Chalk;
  export default chalk;
}

// Declare commander module
declare module 'commander' {
  export class Command {
    constructor(name?: string);
    name(name?: string): this;
    name(): string;
    description(description: string): this;
    version(version: string): this;
    command(name: string): Command;
    addCommand(command: Command): this;
    alias(alias: string): this;
    aliases(aliases: string[]): this;
    usage(usage: string): this;
    argument(name: string, description: string, defaultValue?: any): this;
    arguments(names: string): this;
    option(flags: string, description: string, defaultValue?: any): this;
    requiredOption(
      flags: string,
      description: string,
      defaultValue?: any,
    ): this;
    action(fn: (...args: any[]) => void | Promise<void>): this;
    parse(argv: string[]): this;
    parseAsync(argv: string[]): Promise<this>;
    outputHelp(): void;
    help(): void;
    helpOption(flags: string, description: string): this;
    addHelpCommand(
      enableOrNameAndArgs?: boolean | string,
      description?: string,
    ): this;
    on(event: 'command:*', listener: (operands: string[]) => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
    commands: Command[];
  }
}

// Declare cli-table3 module
declare module 'cli-table3' {
  interface TableConstructorOptions {
    head?: string[];
    chars?: {
      top?: string;
      'top-mid'?: string;
      'top-left'?: string;
      'top-right'?: string;
      bottom?: string;
      'bottom-mid'?: string;
      'bottom-left'?: string;
      'bottom-right'?: string;
      left?: string;
      'left-mid'?: string;
      mid?: string;
      'mid-mid'?: string;
      right?: string;
      'right-mid'?: string;
      middle?: string;
    };
    style?: {
      head?: string[];
      border?: string[];
    };
    colWidths?: number[];
    colAligns?: string[];
    rows?: string[][];
    wordWrap?: boolean;
  }

  class Table {
    constructor(options?: TableConstructorOptions);
    push(row: any[]): void;
    toString(): string;
  }

  namespace Table {
    export { Table };
  }

  export = Table;
}
