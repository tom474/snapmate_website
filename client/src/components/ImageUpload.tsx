import { ImageUp, Target, X } from 'lucide-react';
import React, { FC, InputHTMLAttributes, useRef, useState } from 'react';
import useToast from '../hooks/useToast';
import { mergeClassNames } from '../utils';
import { Input } from './ui/Input';

interface Props
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  className?: string;
}

const ImageUpload: FC<Props> = ({ className, ...inputProps }) => {
  const [images, setImages] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<string[] | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const toast = useToast();

  // 1KB * nMB
  const fileSizeLimit = 1024 * (1024 * 2);

  const checkFile = (file: File): boolean => {
    // Check size
    if (file.size > fileSizeLimit) {
      toast.show({
        title: `File size is too big - ${file.name}`,
        description: 'Max file size available is 2MB',
        type: 'error',
      });

      return false;
    }

    return true;
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        inputRef.current?.click();
      }}
      className={mergeClassNames(
        'border-dashed border-2 border-border',
        'cursor-pointer',
        'transition-all',
        className,
      )}
    >
      <Input
        ref={inputRef}
        {...inputProps}
        onChange={({ target: { files } }) => {
          // If can input multiple files
          if (inputProps.multiple) {
            if (!files) return;

            let imageObjectUrls: string[] = [];
            let fileNames: string[] = [];

            for (let i = 0; i < files.length; i++) {
              if (!checkFile(files[i])) return;
              imageObjectUrls.push(URL.createObjectURL(files[i]));
              fileNames.push(files[i].name);
            }

            setImages((prev) => [...prev, ...imageObjectUrls]);
            setFileNames((prev) => [...prev!, ...fileNames]);
          } else {
            if (!files) return;
            if (!checkFile(files[0])) return;
            setImages([URL.createObjectURL(files[0])]);
            setFileNames([files[0].name]);
          }
        }}
        hidden
        className="border-none hidden"
        type="file"
        accept="image/*"
      />
      {images.length > 0 ? (
        <div className="flex flex-col gap-2 justify-center items-center size-full p-4">
          {images.map((img, idx) => {
            return (
              <div
                key={idx}
                className="relative size-full transition-all rounded-lg overflow-hidden group"
              >
                <img
                  src={img}
                  className="animate-zoom-in size-full object-cover rounded-lg group-hover:brightness-[.25]"
                  alt="uploadedImage"
                />
                <div className="flex gap-2 items-center justify-start absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-all">
                  <span className="truncate">{fileNames![idx]}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setImages((prev) =>
                        prev!.filter((_, prevIdx) => prevIdx !== idx),
                      );
                      setFileNames((prev) =>
                        prev!.filter((_, prevIdx) => prevIdx !== idx),
                      );
                    }}
                    className="ml-auto rounded-full p-2 bg-background/75 border-solid hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <X />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2 justify-center items-center size-full p-4">
          <ImageUp size={36} />
          <p>
            <span className="underline">Browse</span> files and images here
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
