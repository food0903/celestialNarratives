import React from 'react';
import path from 'path';
import fs from 'fs';
import ImageGallery from './clientPage';

export const metadata = {
  title: 'Cards Collection',
};

const Page = async () => {
  const imagesDirectory = path.join(process.cwd(), 'public/cards');
  const filenames = fs.readdirSync(imagesDirectory);

  const itemData = filenames.map((filename) => ({
    img: `/cards/${filename}`,
    title: filename.split('.')[0], // Using the filename as the title
  }));

  return <ImageGallery itemData={itemData} />;
};

export default Page;
