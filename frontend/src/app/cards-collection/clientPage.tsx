'use client';
import React, { useState } from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

type ImageGalleryProps = {
  itemData: { img: string; title: string }[];
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ itemData }) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleClick = (img: string, title: string) => {
    console.log(title);
    setSelectedCard(img);
  };

  return (
    <div className="flex w-full h-full">
      <div className="flex flex-col items-start justify-center w-2/3 h-screen mb-2">
        <h1 className="text-4xl font-bold mb-4">Cards Collection</h1>
        <ImageList sx={{ width: '100%', height: 625 }} cols={4} rowHeight="auto">
          {itemData.map((item) => (
            <ImageListItem key={item.img}>
              <img
                srcSet={`${item.img}?w=164&h=164&fit=fill&auto=format&dpr=2 8x`}
                src={`${item.img}?w=164&h=164&fit=fill&auto=format`}
                alt={item.title}
                style={{ width: '100%', height: 'auto', objectFit: 'cover', cursor: 'pointer' }}
                loading="lazy"
                onClick={() => handleClick(item.img, item.title)}
              />
            </ImageListItem>
          ))}
        </ImageList>
      </div>
      {selectedCard && (
        <div className='flex flex-col w-1/3 h-screen items-center justify-start p-4'>
        <h1 className="text-4xl font-bold ">Card</h1>
        <div className="w-full h-auto flex items-center justify-center p-4">
          <img
            src={`${selectedCard}?w=auto&h=auto&fit=fill&auto=format`}
            alt="Selected"
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
          />
        </div>
        </div>   
      )}
    </div>
  );
};

export default ImageGallery;
