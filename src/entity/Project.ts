import {
  Entity,
  Column,
  BaseEntity,
  ManyToMany,
  JoinTable,
  PrimaryColumn,
} from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";
import { Group } from "./Group";

@ObjectType()
@Entity("project")
export class Project extends BaseEntity {
  @Field(() => Int)
  @PrimaryColumn()
  id: number;

  @Field()
  @Column("text")
  name: string;

  @Field({ nullable: true })
  @Column("text", { nullable: true })
  cluster?: string;

  @Field({ nullable: true })
  @Column("text", { nullable: true })
  asdfa?: string;

  //project_groups
  @ManyToMany((type) => Group, (group) => group.projects, { lazy: true })
  @Field((type) => [Group], { nullable: true })
  @JoinTable()
  groups?: Group[];
}
