import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import type { NextHandler } from "next-connect";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type AllowHeader = Array<Method | "OPTIONS">;

type CreateHandlerOptions = {
  allowOptions?: boolean;
};

type RouterInstance = ReturnType<typeof createRouter<NextApiRequest, NextApiResponse>>;

type ApiHandler = ((req: NextApiRequest, res: NextApiResponse) => Promise<void>) & {
  use: RouterInstance["use"];
  get: RouterInstance["get"];
  post: RouterInstance["post"];
  put: RouterInstance["put"];
  patch: RouterInstance["patch"];
  delete: RouterInstance["delete"];
};

export function createApiHandler(
  methods: Method[],
  options: CreateHandlerOptions = {}
): ApiHandler {
  const unique = Array.from(new Set(methods.map(method => method.toUpperCase()))) as Method[];
  const allowOptions = options.allowOptions !== false;
  const allowHeader: AllowHeader = allowOptions ? [...unique, "OPTIONS"] : [...unique];

  const router = createRouter<NextApiRequest, NextApiResponse>();

  if (allowOptions) {
    router.use((req: NextApiRequest, res: NextApiResponse, next: NextHandler) => {
      if (req.method === "OPTIONS") {
        res.setHeader("Allow", allowHeader);
        res.status(204).end();
        return;
      }
      return next();
    });
  }

  const handlerFn = router.handler({
    onError(err, _req, res) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Server error", detail: (err as any)?.message ?? String(err) });
    },
    onNoMatch(req, res) {
      res.setHeader("Allow", allowHeader);
      res.status(405).json({ error: "Method Not Allowed" });
    },
  }) as unknown as ApiHandler;

  handlerFn.use = router.use.bind(router);
  handlerFn.get = router.get.bind(router);
  handlerFn.post = router.post.bind(router);
  handlerFn.put = router.put.bind(router);
  handlerFn.patch = router.patch.bind(router);
  handlerFn.delete = router.delete.bind(router);

  return handlerFn;
}
