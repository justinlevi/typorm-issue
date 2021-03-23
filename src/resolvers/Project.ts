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
import { Project } from "../entity/Project";
import { Group } from "../entity/Group";

@InputType()
class AddProjectInput implements Partial<Project> {
  @Field((type) => Int, { nullable: true })
  id?: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  cluster?: string;

  @Field((type) => [String], { nullable: true })
  groupIds?: string[];
}

@InputType()
class UpdateProjectInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  cluster?: string;

  @Field((type) => [String], { nullable: true })
  groupIds?: string[];
}

@Resolver()
export class ProjectResolver {
  @Mutation((_) => Project)
  async addProject(
    @Arg("data") { id, name, groupIds }: AddProjectInput
  ): Promise<Project> {
    const pid = await Project.findOne({ where: { id } });
    if (pid)
      throw new Error("Project Id alread Exists, please use update instead");

    // look up group Ids
    const groups = groupIds ? await Group.findByIds(groupIds) : [];

    const maxIdQuery = await getConnection()
      .manager.getRepository(Project)
      .createQueryBuilder()
      .select("MAX(project.id)", "max");
    const result = await maxIdQuery.getRawOne();

    console.log(result);

    const project = Project.create({
      id: id ? id : result.max + 1,
      name,
      groups,
    });

    await project.save();
    return project;
  }

  @Mutation(() => Project)
  async updateProject(
    @Arg("id") id: number,
    @Arg("data") data: UpdateProjectInput
  ): Promise<Project> {
    const project = await Project.findOne({ where: { id } });
    if (!project) throw new Error("Project not found");

    // look up group Ids
    const groups = data.groupIds
      ? await Group.findByIds(data.groupIds)
      : await project.groups;

    Object.assign(project, { ...data, groups });
    await project.save();
    return project;
  }

  @Query(() => [Project], { nullable: true })
  // @UseMiddleware(isAuthenticated)
  projects(): Promise<Project[]> {
    return Project.find();
  }
}
