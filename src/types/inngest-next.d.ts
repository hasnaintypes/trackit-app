declare module "inngest/next" {
  export type InngestHandler = (req: Request) => Response | Promise<Response>;

  export function serve(opts: { client: unknown; functions?: unknown[] }): {
    GET?: InngestHandler;
    POST?: InngestHandler;
    PUT?: InngestHandler;
    PATCH?: InngestHandler;
    DELETE?: InngestHandler;
    OPTIONS?: InngestHandler;
    HEAD?: InngestHandler;
  };

  export {};
}
declare module "inngest/next" {
  export * from "inngest";
  export function serve(opts: { client: unknown; functions?: unknown[] }): {
    GET?: InngestHandler;
    POST?: InngestHandler;
    PUT?: InngestHandler;
    PATCH?: InngestHandler;
    DELETE?: InngestHandler;
    OPTIONS?: InngestHandler;
    HEAD?: InngestHandler;
  };
}
