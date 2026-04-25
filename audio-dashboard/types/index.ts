export interface Track {
    id: string;
    name: string;
    path: string;
    url: string;
  }
  
  export interface UserDatabase {
    [userId: string]: Track[];
  }