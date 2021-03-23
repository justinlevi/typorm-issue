import { getConnection, IsNull } from "typeorm";
import {
  Arg,
  Ctx,
  Resolver,
  Query,
  Mutation,
  UseMiddleware,
  Int,
  InputType,
  Field,
} from "type-graphql";
import { Group } from "../entity/Group";
import { MyContext } from "../graphql-types/MyContext";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { verify } from "jsonwebtoken";

@Resolver()
export class GroupResolver {
  @Query(() => [Group], { nullable: true })
  // @UseMiddleware(isAuthenticated)
  async groups(): Promise<Group[]> {
    return Group.find({
      order: {
        name: "ASC",
      },
    });
  }

  @Query(() => Group, { nullable: true })
  // @UseMiddleware(isAuthenticated)
  async group(
    @Arg("id", { nullable: true }) id: string,
    @Arg("name", { nullable: true }) name: string
  ): Promise<Group | undefined> {
    if (!id && !name) {
      return undefined;
    }

    if (id) {
      return Group.findOne(id);
    }

    if (name) {
      return Group.findOne({ where: { name } });
    }
  }
}
