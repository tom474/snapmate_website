import { ChevronDown, Globe, Lock, LucideIcon } from 'lucide-react';
import { FC, FormEvent, useRef, useState } from 'react';
import Divider from '../../../components/Divider';
import ImageUpload from '../../../components/ImageUpload';
import {
  DropDownItem,
  DropDownMenu,
  DropDownMenuContent,
} from '../../../components/ui/DropDownMenu';
import { Input } from '../../../components/ui/Input';
import { URL_BASE } from '../../../config';
import useToast from '../../../hooks/useToast';

const GroupFormPanel = () => {
  const toast = useToast();

  const [visibility, setVisibility] = useState<'Public' | 'Private'>('Public');
  const [name, setName] = useState('');
  const [imageKey, setImageKey] = useState(0);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const resetForm = () => {
    setVisibility('Public');
    setName('');
    setImageKey((prevKey) => prevKey + 1); // Increment the key to force re-render of ImageUpload components
    if (descriptionRef.current) {
      descriptionRef.current.innerText = '';
    }
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  const getVisibilityNode = (visibility: 'Public' | 'Private') => {
    if (visibility === 'Public') {
      return (
        <VisibilitySpan
          Icon={Globe}
          name="Public"
          des="Everyone can see your group"
        />
      );
    } else {
      return (
        <VisibilitySpan
          Icon={Lock}
          name="Private"
          des="Only approved members can see your group"
        />
      );
    }
  };

  const validateForm = (
    payload: Record<string, FormDataEntryValue>,
  ): boolean => {
    const errors: string[] = [];

    if (errors.length > 0) {
      return false;
    } else {
      return true;
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('description', descriptionRef.current!.innerText);
    formData.append('visibility', visibility);
    const payload = Object.fromEntries(formData.entries());

    if (!validateForm(payload)) return;

    const endpoint = `${URL_BASE}/requests/group_creation_requests`;
    const submit = async () => {
      try {
        const res = await fetch(endpoint, {
          credentials: 'include',
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (res.ok) {
          return data;
        } else {
          throw Error;
        }
      } catch (error) {
        throw error;
      }
    };

    toast.showAsync(submit, {
      loading: {
        title: 'Loading...',
      },
      success: (data) => {
        resetForm();
        return {
          title: `Created a new group creation request`,
        };
      },
      error: (_) => ({
        title: 'Could not create group',
      }),
    });
  };

  return (
    <form
      ref={formRef}
      encType="multipart/form-data"
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      <h1 className="text-3xl font-semibold">Create a group</h1>
      <Divider alignment="horizontal" />
      <h2 className="flex flex-col text-xl font-semibold">
        Name
        <span className="text-sm text-gray-500 font-normal">
          Group name should contain only alphabetical character and cannot be
          changed upon creation.
        </span>
      </h2>
      <div className="flex items-center justify-start gap-1 text-lg bg-background rounded-sm py-2 px-4 border-border border-2 border-solid focus-within:border-primary transition-colors">
        <span className="text-gray-500">g/</span>
        <Input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-0 focus:ring-0 focus:ring-offset-0 border-0 text-lg bg-transparent"
          placeholder="groupname"
        />
      </div>
      <h2 className="flex flex-col text-xl font-semibold">
        Description
        <span className="text-sm text-gray-500 font-normal">
          Tell people more about your group.
        </span>
      </h2>
      <div className="flex items-center max-h-[999px] transition-all duration-500 justify-start gap-1 text-lg bg-background rounded-sm py-2 px-4 border-border border-2 border-solid focus-within:border-primary">
        <div
          ref={descriptionRef}
          contentEditable
          className="w-full h-max p-0 text-wrap break-words break-all transition-all duration-500 resize-none bg-background text-lg rounded-lg outline-none"
        ></div>
      </div>
      <h2 className="flex flex-col text-xl font-semibold">Visibility</h2>
      <div className="flex items-center justify-start gap-1 text-lg bg-background rounded-sm border-border border-2 border-solid focus-within:border-primary transition-colors">
        <DropDownMenu
          expandWidth
          className="w-full group rounded-sm py-2 px-4"
          content={
            <DropDownMenuContent className="w-full">
              <DropDownItem
                onClick={() => {
                  setVisibility('Public');
                }}
              >
                {getVisibilityNode('Public')}
              </DropDownItem>
              <DropDownItem
                onClick={() => {
                  setVisibility('Private');
                }}
              >
                {getVisibilityNode('Private')}
              </DropDownItem>
            </DropDownMenuContent>
          }
        >
          <div className="justify-start">{getVisibilityNode(visibility)}</div>
          <ChevronDown className="ml-auto" />
        </DropDownMenu>
      </div>
      <h2 className="flex flex-col text-xl font-semibold">
        Cover image
        <span className="text-sm text-gray-500 font-normal">
          The cover image for your group when fully viewed.
        </span>
      </h2>
      <ImageUpload
        key={`cover-${imageKey}`}
        name="coverImage"
        className="rounded-sm py-2 px-4"
      />
      <h2 className="flex flex-col text-xl font-semibold">
        Group avatar
        <span className="text-sm text-gray-500 font-normal">
          The image people see when they search for your group.
        </span>
      </h2>
      <ImageUpload
        key={`avatar-${imageKey}`}
        name="groupImage"
        className="rounded-sm py-2 px-4"
      />
      <Divider alignment="horizontal" />
      <div className="flex items-center justify-end w-full">
        <button
          type="submit"
          className="rounded-full bg-white hover:bg-slate-300 text-black px-4 py-2 text-sm font-bold"
        >
          Create group
        </button>
      </div>
    </form>
  );
};

const VisibilitySpan: FC<{ Icon: LucideIcon; name: string; des?: string }> = ({
  Icon,
  name,
  des,
}) => {
  return (
    <div className="group select-none">
      <span className="flex items-center justify-start gap-2 text-lg">
        <Icon size={20} />
        {name}
      </span>
      {des && (
        <p className="text-sm text-gray-500 group-hover:text-white transition-colors">
          {des}
        </p>
      )}
    </div>
  );
};

export default GroupFormPanel;
