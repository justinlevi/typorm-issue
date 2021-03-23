import "dotenv/config";
import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { createConnection, getConnectionOptions } from "typeorm";
import cookieParser from "cookie-parser";
import cors from "cors";
import { verify } from "jsonwebtoken";

import { apolloServerRequestLoggerPlugin } from "./plugins/apolloServerRequestLogger";

import { User } from "./entity/User";

import { UserResolver } from "./resolvers/UserResolver";
import { AuthResolver } from "./resolvers/AuthResolver";

import {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} from "./util/auth";
import { seedDevData } from "./util/seedUserTable";
import { ProjectResolver } from "./resolvers/Project";
import { GroupResolver } from "./resolvers/Group";

require("dotenv").config({ path: __dirname + "/.env" });

// console.log(
//   "API ⚙️ ~ file: index.ts ~ line 23 ~ process.env.CORS",
//   process.env.CORS
// );
// console.log(
//   "API ⚙️ ~ file: index.ts ~ line 23 ~ process.env.NODE_ENV",
//   process.env.NODE_ENV
// );
// console.log(
//   "API ⚙️ ~ file: index.ts ~ line 23 ~ process.env.ACCESS_TOKEN_SECRET",
//   process.env.ACCESS_TOKEN_SECRET
// );
// console.log(
//   "API ⚙️ ~ file: index.ts ~ line 23 ~ process.env.REFRESH_TOKEN_SECRET",
//   process.env.REFRESH_TOKEN_SECRET
// );

const port = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.CORS,
  credentials: true,
};

(async () => {
  const app = express();
  app.use(cors(corsOptions));
  app.use(cookieParser());

  app.get("/", (_req, res) => res.send("hello"));
  app.post("/refresh_token", async (req, res) => {
    const token = req.cookies.jid;
    if (!token) {
      console.log("NO TOKEN");
      console.log(res.getHeaders());
      return res.send({ ok: false, accessToken: "" });
    }

    let payload: any = null;
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch (err) {
      console.log(err);
      return res.send({ ok: false, accessToken: "" });
    }

    // token is valid and
    // we can send back an access token
    const user = await User.findOne({ id: payload.userId });

    if (!user) {
      return res.send({ ok: false, accessToken: "" });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: "" });
    }

    sendRefreshToken(res, createRefreshToken(user));

    return res.send({ ok: true, accessToken: createAccessToken(user) });
  });

  // Get options from ormconfig.json
  const connectionName = process.env.NODE_ENV || "development";
  const dbOptions = await getConnectionOptions(connectionName);
  await createConnection({ ...dbOptions, name: "default" })
    .then(seedDevData)
    .catch((error) => console.log(error));

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [AuthResolver, UserResolver, ProjectResolver, GroupResolver],
    }),
    plugins: [apolloServerRequestLoggerPlugin],
    context: ({ req, res }) => ({ req, res }),
    playground: {
      settings: {
        "request.credentials": "include",
      },
    },
    introspection: true,
  });

  apolloServer.applyMiddleware({ app, cors: corsOptions });

  app.listen(port, () => {
    console.log(`server started at http://localhost:${port}/graphql`);
  });
})();
