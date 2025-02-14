export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  status: string;
  createdAt: Date;
  virtualProfileImage: string;
}

export function parseUser(data: any): User {
  if (!data) {
    throw new Error('No data to parse');
  }

  return {
    username: data.username,
    displayName: data.displayName,
    email: data.email,
    status: data.status,
    createdAt: new Date(data.createdAt),
    virtualProfileImage: data.virtualProfileImage,
    id: data._id,
  };
}
