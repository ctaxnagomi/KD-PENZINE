import { onRequest as __v1beta_models__model__ts_onRequest } from "C:\\Users\\wanmo\\kd-penzine-tabloid\\functions\\v1beta\\models\\[model].ts"

export const routes = [
    {
      routePath: "/v1beta/models/:model",
      mountPath: "/v1beta/models",
      method: "",
      middlewares: [],
      modules: [__v1beta_models__model__ts_onRequest],
    },
  ]