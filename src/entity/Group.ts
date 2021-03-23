import {
  Entity,
  PrimaryColumn,
  Column,
  BaseEntity,
  JoinTable,
  ManyToMany,
} from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";
import { Project } from "./Project";
// Example: Group

@ObjectType()
@Entity("group")
export class Group extends BaseEntity {
  @Field(() => String)
  @PrimaryColumn()
  id: string;

  @Field()
  @Column("text")
  name: string;

  @Field({ nullable: true })
  @Column("text")
  type: string;

  @Field({ nullable: true })
  @Column("text", { nullable: true })
  asdfa?: string;

  @Field((type) => [Project])
  @ManyToMany((type) => Project, (project) => project.groups, { lazy: true })
  projects: Project[];
}
