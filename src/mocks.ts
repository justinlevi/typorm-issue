import { MockList } from 'graphql-tools';
import faker from 'faker/locale/en';

// Allow consumer to generate consistent results by seeding faker.
export const seed = (value = 123) => faker.seed(value);

