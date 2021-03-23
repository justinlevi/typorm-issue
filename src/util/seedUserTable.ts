import { Connection } from "typeorm";
import { hash } from "bcrypt";

import { User } from "../entity/User";
import { Group } from "../entity/Group";
import { Project } from "../entity/Project";

export const seedDevData = async (connection: Connection) => {
  // Let's setup a user for development
  if (process.env.NODE_ENV === "development") {
    const queryRunner = await connection.createQueryRunner();
    let usersTable = await queryRunner.getTable("users");
    if (usersTable) {
      await queryRunner.clearTable("users");
    }

    console.log("Inserting a new user into the database...");
    const user = new User();
    user.id = 1;
    user.email = "admin@example.com";
    user.password = await hash("admin1123", 12);
    await connection.manager.save(user);
    console.log("Saved user with id: " + user.id);

    console.log("Loading users from the database...");
    const users = await connection.manager.find(User);
    console.log("Loaded users: ", users);

    // const group1 = new Group();
    // group1.id = "111-111-111";
    // group1.name = "Winter Group";
    // group1.type = "billing";
    // await connection.manager.save(group1);

    // const group2 = new Group();
    // group2.id = "222-222-222";
    // group2.name = "us2.amazee.com";
    // group2.type = "cluster";
    // await connection.manager.save(group2);

    // const superDuper = {
    //   id: 111,
    //   name: "Super Duper",
    //   groups: [group1, group2],
    // };

    // const g1 = await connection.manager.create(Project, superDuper).save();

    // group1.projects = [g1];
    // group2.projects = [g1];

    // await connection.manager.save([group1, group2]);
  }
};

export default seedDevData;
