import { faker } from '@faker-js/faker';
import { Product } from './db/schema';

const products: Product[] = [];

const colors = Array.from(
  new Set(Array.from({ length: 15 }).map(() => faker.color.human()))
);

for (let i = 0; i < 900; i++) {
  products.push({
    id: i,
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: Number(faker.commerce.price()),
    images: [faker.image.url(), faker.image.url(), faker.image.url()],
    category: faker.commerce.department(),
    featured: faker.datatype.boolean(),
    inStock: faker.datatype.boolean(),
    sizes: faker.helpers.arrayElements(
      ['Extra Small', 'Small', 'Medium', 'Extra Large'],
      { min: 2, max: 4 }
    ),
    colors: faker.helpers.arrayElements(colors, { min: 3, max: 8 }),
    rating: faker.number.float({ min: 1, max: 5 }),
    reviewCount: faker.number.int({ min: 0, max: 1000 }),
  });
}

export { products };
