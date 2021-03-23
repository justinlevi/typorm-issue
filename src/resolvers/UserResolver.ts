import { Ctx, Resolver, Query, UseMiddleware } from "type-graphql";
import { User } from "../entity/User";
import { MyContext } from "../graphql-types/MyContext";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { verify } from "jsonwebtoken";

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "hi!";
  }

  // @Query(() => String)
  // @UseMiddleware(isAuthenticated)
  // bye(@Ctx() { payload }: MyContext) {
  //   console.log(payload);
  //   return `your user id is: ${payload!.userId}`;
  // }

  @Query(() => [User])
  users() {
    return User.find();
  }

  @Query(() => User, { nullable: true })
  @UseMiddleware(isAuthenticated)
  async me(@Ctx() ctx: MyContext): Promise<User | undefined> {
    const authorization = ctx.req.headers["authorization"];

    try {
      const token = authorization!.split(" ")[1];
      const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
      return User.findOne(payload.userId);
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }
}
