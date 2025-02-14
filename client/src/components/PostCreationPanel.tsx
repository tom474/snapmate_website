import { FormEvent, useState, useContext, FC } from 'react';
import { useParams } from 'react-router-dom';
import { Globe, Image, X, ArrowLeftRight } from 'lucide-react';
import { ToastContext } from '../context/ToastProvider';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';

interface Props {
  onPostUpload?: () => void;
}

const PostCreationPanel: FC<Props> = ({ onPostUpload }) => {
  const { groupId } = useParams<{ groupId: string }>();
  const [visibility, setVisibility] = useState('Public');
  const [images, setImages] = useState<File[]>([]);
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const params = useParams();

  const toast = useToast();
  const { auth } = useAuth();

  const handleVisibilityChange = (event: { preventDefault: () => void }) => {
    event.preventDefault(); // Prevent form submission
    setVisibility((prev) => (prev === 'Public' ? 'Friend' : 'Public'));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // 1KB * nMB
    const fileSizeLimit = 1024 * (1024 * 2);

    const inputFiles = event.target.files;
    if (inputFiles) {
      const files = Array.from(inputFiles);

      for (let file of files) {
        if (file.size > fileSizeLimit) {
          toast.show({
            title: `File size is too big - ${file.name}`,
            description: 'Max file size available is 2MB',
            type: 'error',
          });

          continue;
        }
        setImages((prevImages) => [...prevImages, file]);
      }
    }
  };

  const handleRemoveImage = (
    index: number,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault(); // Prevent the default button action
    e.stopPropagation(); // Stop the event from bubbling up to the form
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handlePost = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!content.trim() && images.length === 0) {
      toast?.show({
        title: 'Empty Post',
        description: 'Please add some content or images before posting.',
        type: 'warning',
      });
      return;
    }

    const postData = new FormData();
    postData.append('content', content);
    postData.append('visibility', visibility);
    images.forEach((image) => {
      postData.append('images', image);
    });
    if (groupId) {
      postData.append('group_id', groupId);
    }

    toast?.showAsync(
      async () => {
        setIsPosting(true);
        const response = await fetch('http://localhost:8080/posts', {
          method: 'POST',
          body: postData,
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData);
        } else {
          // Run these on post uploaded succesfully
          setContent('');
          setImages([]);
          setIsPosting(false);
          onPostUpload && onPostUpload();
        }

        return await response.json();
      },
      {
        loading: {
          title: 'Creating Post',
          description: 'Please wait while we create your post...',
        },
        success: (_) => {
          return {
            title: 'Post Created',
            description: 'Your post has been created successfully!',
          };
        },
        error: (error) => ({
          title: 'Post Creation Failed',
          description: error.message || 'An unknown error occurred',
        }),
      },
    );
  };

  if (auth.user?.isAdmin) {
    return null;
  }

  return (
    <form
      onSubmit={handlePost}
      className="flex flex-col justify-start items-start border-border border-2 border-solid rounded-lg p-4 gap-4 w-full bg-card"
    >
      <div className="flex gap-4 w-full">
        <img
          className="rounded-full bg-gray-500 size-16"
          src={auth.user?.virtualProfileImage}
          alt="User avatar"
        />
        <textarea
          className="w-full resize-none bg-background text-2xl p-4 rounded-lg focus:outline-none focus:ring-0 focus:ring-offset-0"
          placeholder="Post something"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      {/* Actions */}
      <div className="flex w-full">
        {/* If user in a group don't display the visibility option */}
        {!params.groupId && (
          <div className="flex gap-2 items-center">
            Visibility:
            <button
              className="py-1 px-4 bg-secondary rounded-sm flex gap-2 items-center"
              onClick={handleVisibilityChange}
            >
              <Globe size={16} />
              {visibility} <ArrowLeftRight size={16} />
            </button>
          </div>
        )}
        <button
          type="submit"
          className="ml-auto py-1 px-4 bg-primary rounded-lg"
          disabled={isPosting}
        >
          {isPosting ? 'Posting...' : 'Post'}
        </button>
      </div>
      <div className="border-border border border-solid w-full "></div>
      <ul>
        <label className="rounded-lg p-2 cursor-pointer">
          <Image className="text-primary" />
          {/* image upload here */}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      </ul>
      {/* Image Previews */}
      {images.length > 0 && (
        <div className="flex gap-2 mt-4">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(image)}
                alt={`Preview ${index}`}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <button
                type="button" // Explicitly set the type to "button"
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                onClick={(e) => handleRemoveImage(index, e)}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </form>
  );
};

export default PostCreationPanel;
