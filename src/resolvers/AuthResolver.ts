import { hash, compare } from "bcrypt";
import {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} from "../util/auth";
import {
  Arg,
  Ctx,
  Mutation,
  Resolver,
  ObjectType,
  Field,
  UseMiddleware,
} from "type-graphql";
import { User } from "../entity/User";
import { AuthInput } from "../graphql-types/AuthInput";
import { MyContext } from "../graphql-types/MyContext";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { UserResponse } from "../graphql-types/UserResponse";

const invalidLoginResponse = {
  errors: [
    {
      path: "email",
      message: "invalid login",
    },
  ],
};

@ObjectType()
class Error {
  @Field()
  path: string;

  @Field()
  message: string;
}

@ObjectType()
class LoginResponse {
  @Field({ nullable: true })
  accessToken?: string;
  @Field(() => User, { nullable: true })
  user?: User;
  @Field(() => [Error], { nullable: true })
  errors?: Error[];
}

@Resolver()
export class AuthResolver {
  /**
   * Registers a new user
   *
   * @remarks
   * This method is part of the Authentication toolset.
   *
   * @param input - An object containing two fields, email and password
   */
  @Mutation(() => UserResponse)
  @UseMiddleware(isAuthenticated)
  async register(
    @Arg("input")
    { email, password }: AuthInput
  ): Promise<UserResponse> {
    const hashedPassword = await hash(password, 12);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return {
        errors: [
          {
            path: "email",
            message: "already in use",
          },
        ],
      };
    }

    const user = await User.create({
      email,
      password: hashedPassword,
    }).save();

    return { user };
  }

  /**
   * Logs in a user and returns a JWT token
   *
   * @remarks
   * This method is part of the Authentication toolset.
   *
   * @param input - An object containing two fields, email and password
   */
  @Mutation(() => LoginResponse)
  async login(
    @Arg("input") { email, password }: AuthInput,
    @Ctx() ctx: MyContext
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return invalidLoginResponse;
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      console.log("EMAIL/PASSWORD ARE NOT VALID");
      return invalidLoginResponse;
    }

    // login successful
    sendRefreshToken(ctx.res, createRefreshToken(user));

    const accessToken = createAccessToken(user);
    return { user, accessToken };
  }

  /**
   * Logs out a user
   *
   * @remarks
   * This method is part of the Authentication toolset.
   *
   */
  @Mutation(() => Boolean)
  async logout(@Ctx() { res, payload }: MyContext): Promise<Boolean> {
    sendRefreshToken(res, "");
    payload = undefined;

    return true;
  }
}
